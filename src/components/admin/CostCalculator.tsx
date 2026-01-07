import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, FileText, AlertCircle, Download, Factory, Search, Save, Loader2, Send } from 'lucide-react';
import jsPDF from 'jspdf';

// Format number to Brazilian currency format (10.000,00)
const formatBRL = (value: number): string => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface Tinturaria {
  id: string;
  name: string;
  conversion_factor: number;
}

interface Product {
  id: string;
  code: string;
  name: string;
  composition: string;
  weight_gsm: number;
  width_cm: number;
  yield_m_kg: number;
  efficiency_factor: number;
  weaving_cost: number;
}

interface Color {
  id: string;
  name: string;
}

interface ProductColor {
  color_id: string;
  color_name: string;
  dyeing_cost: number;
}

interface ColorEntry {
  colorId: string;
  colorName: string;
  quantity: number;
  dyeingCost: number;
  costPerKg: number;
  totalCost: number;
}

interface CalculationResult {
  product: Product;
  tinturaria: Tinturaria;
  colors: ColorEntry[];
  yarnCosts: { name: string; cost: number; proportion: number }[];
  weavingCost: number;
  freightCost: number;
  totalKg: number;
  averageCostPerKg: number;
  totalValue: number;
}

// Fios principais que podem ser substituídos (não inclui elastano)
const MAIN_YARN_PREFIXES = ['FIO 100/', 'FIO 1/70/', 'FIO 1/80/', 'FIO 150/', 'FIO 75/', 'FIO 200/', 'FIO 2/70/', 'PP ', 'PV '];
const isMainYarn = (name: string) => MAIN_YARN_PREFIXES.some(prefix => name.toUpperCase().startsWith(prefix));
const isElastano = (name: string) => name.toUpperCase().includes('ELASTANO');

interface YarnType {
  id: string;
  name: string;
}

interface ProductYarnWithSelection {
  originalYarnId: string;
  originalYarnName: string;
  selectedYarnId: string;
  selectedYarnName: string;
  proportion: number;
  isChangeable: boolean; // true for main yarns, false for elastano
}

// Interface for saved quote data
interface SavedQuoteData {
  tinturaria_id: string;
  tinturaria_name: string;
  product_id: string;
  product_code: string;
  product_name: string;
  composition: string;
  weight_gsm: number;
  width_cm: number;
  yield_m_kg: number;
  efficiency_factor: number;
  weaving_cost: number;
  customer_name: string;
  payment_method: 'a_vista' | 'a_prazo' | 'adm';
  adm_description: string;
  conversion_factor: number;
  special_discount: number;
  freight_price: number;
  colors: Array<{
    color_id: string;
    color_name: string;
    quantity: number;
    dyeing_cost: number;
    cost_per_kg: number;
    total_cost: number;
  }>;
  yarn_prices: Array<{
    yarn_type_id: string;
    yarn_name: string;
    price: number;
    proportion: number;
  }>;
}

export const CostCalculator = () => {
  const [tinturarias, setTinturarias] = useState<Tinturaria[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [selectedTinturariaId, setSelectedTinturariaId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [colorEntries, setColorEntries] = useState<{ colorId: string; quantity: string }[]>([
    { colorId: '', quantity: '' }
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [allYarnTypes, setAllYarnTypes] = useState<YarnType[]>([]);
  const [productYarns, setProductYarns] = useState<ProductYarnWithSelection[]>([]);
  const [specialDiscount, setSpecialDiscount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'a_vista' | 'a_prazo' | 'adm'>('a_vista');
  const [admDescription, setAdmDescription] = useState('');
  
  // Quote loading/saving state
  const [quoteSearchNumber, setQuoteSearchNumber] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [lastSavedQuoteNumber, setLastSavedQuoteNumber] = useState<number | null>(null);
  const [sendingToERP, setSendingToERP] = useState(false);
  const [loadedQuoteData, setLoadedQuoteData] = useState<SavedQuoteData | null>(null);
  const isLoadingQuoteRef = useRef(false); // Flag to prevent useEffect from resetting colors
  const [currentFreightPrice, setCurrentFreightPrice] = useState<number>(0);
  
  const { toast } = useToast();

  const fetchCurrentFreight = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('freight_prices')
      .select('price')
      .eq('effective_date', today)
      .maybeSingle();
    
    setCurrentFreightPrice(data?.price ? Number(data.price) : 0);
  };

  useEffect(() => {
    fetchTinturarias();
    fetchProducts();
    fetchAllColors();
    fetchAllYarnTypes();
    fetchCurrentFreight();
  }, []);

  useEffect(() => {
    if (selectedTinturariaId && selectedProductId) {
      fetchProductColors(selectedTinturariaId, selectedProductId);
      fetchProductYarns(selectedProductId);
      // Only reset color entries if NOT loading a quote
      if (!isLoadingQuoteRef.current) {
        setColorEntries([{ colorId: '', quantity: '' }]);
        setSpecialDiscount('');
        setResult(null);
      }
    } else {
      setProductColors([]);
      setProductYarns([]);
    }
  }, [selectedTinturariaId, selectedProductId]);

  const fetchTinturarias = async () => {
    const { data, error } = await supabase
      .from('tinturarias')
      .select('id, name, conversion_factor')
      .order('name');

    if (!error && data) {
      setTinturarias(data);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchAllColors = async () => {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .order('name');

    if (!error && data) {
      setAllColors(data);
    }
  };

  const fetchAllYarnTypes = async () => {
    const { data, error } = await supabase
      .from('yarn_types')
      .select('id, name')
      .order('name');

    if (!error && data) {
      setAllYarnTypes(data);
    }
  };

  const fetchProductYarns = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_yarns')
      .select('proportion, yarn_types(id, name)')
      .eq('product_id', productId);

    if (!error && data) {
      const yarns: ProductYarnWithSelection[] = data.map((py: any) => {
        const yarnName = py.yarn_types?.name || 'Fio';
        const yarnId = py.yarn_types?.id || '';
        return {
          originalYarnId: yarnId,
          originalYarnName: yarnName,
          selectedYarnId: yarnId,
          selectedYarnName: yarnName,
          proportion: Number(py.proportion) || 0,
          isChangeable: isMainYarn(yarnName) && !isElastano(yarnName)
        };
      });
      setProductYarns(yarns);
    }
  };

  const updateSelectedYarn = (index: number, newYarnId: string) => {
    const yarnType = allYarnTypes.find(y => y.id === newYarnId);
    if (!yarnType) return;
    
    setProductYarns(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selectedYarnId: newYarnId,
        selectedYarnName: yarnType.name
      };
      return updated;
    });
  };

  // Filtrar fios alternativos disponíveis (apenas fios principais, não elastano)
  const getAlternativeYarns = () => {
    return allYarnTypes.filter(y => isMainYarn(y.name) && !isElastano(y.name));
  };

  const fetchProductColors = async (tinturariaId: string, productId: string) => {
    setLoadingColors(true);
    setProductColors([]);
    try {
      // Fetch colors that have dyeing costs for this specific product AND tinturaria
      const { data, error } = await supabase
        .from('dyeing_costs')
        .select('color_id, cost, colors(name)')
        .eq('tinturaria_id', tinturariaId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error fetching product colors:', error);
        setProductColors([]);
        return;
      }

      if (data && data.length > 0) {
        const colors: ProductColor[] = data.map((dc: any) => ({
          color_id: dc.color_id,
          color_name: dc.colors?.name || 'Desconhecida',
          dyeing_cost: Number(dc.cost) || 0
        }));
        setProductColors(colors);
      } else {
        setProductColors([]);
      }
    } catch (err) {
      console.error('Exception fetching product colors:', err);
      setProductColors([]);
    } finally {
      setLoadingColors(false);
    }
  };

  const addColorEntry = () => {
    setColorEntries([...colorEntries, { colorId: '', quantity: '' }]);
  };

  const removeColorEntry = (index: number) => {
    if (colorEntries.length > 1) {
      setColorEntries(colorEntries.filter((_, i) => i !== index));
    }
  };

  const updateColorEntry = (index: number, field: 'colorId' | 'quantity', value: string) => {
    const updated = [...colorEntries];
    updated[index][field] = value;
    setColorEntries(updated);
  };

  const calculateCost = async () => {
    if (!selectedTinturariaId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione uma tinturaria.'
      });
      return;
    }

    if (!selectedProductId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione um produto.'
      });
      return;
    }

    const validEntries = colorEntries.filter(e => e.colorId && parseFloat(e.quantity) > 0);
    if (validEntries.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Adicione pelo menos uma cor com quantidade.'
      });
      return;
    }

    setLoading(true);
    try {
      const product = products.find(p => p.id === selectedProductId);
      const tinturaria = tinturarias.find(t => t.id === selectedTinturariaId);
      if (!product) throw new Error('Produto não encontrado');
      if (!tinturaria) throw new Error('Tinturaria não encontrada');

      // Buscar preços de fios do dia
      const today = new Date().toISOString().split('T')[0];
      const { data: yarnPrices, error: yarnError } = await supabase
        .from('yarn_prices')
        .select('yarn_type_id, price')
        .eq('effective_date', today);

      if (yarnError) throw yarnError;

      // Buscar preço do frete do dia
      const { data: freightData, error: freightError } = await supabase
        .from('freight_prices')
        .select('price')
        .eq('effective_date', today)
        .maybeSingle();

      if (freightError) throw freightError;
      
      const freightCost = freightData?.price ? Number(freightData.price) : 0;

      // Mapear preços por ID de tipo de fio
      const priceMap: Record<string, number> = {};
      yarnPrices?.forEach((yp: any) => {
        if (yp.yarn_type_id) {
          priceMap[yp.yarn_type_id] = Number(yp.price) || 0;
        }
      });

      // Calcular custo base dos fios a partir dos fios SELECIONADOS (productYarns state)
      const yarnCosts: { name: string; cost: number; proportion: number }[] = [];
      let totalYarnCost = 0;
      const missingPrices: string[] = [];

      productYarns.forEach((py) => {
        const yarnTypeId = py.selectedYarnId;
        const yarnName = py.selectedYarnName;
        const proportion = py.proportion;
        const unitPrice = yarnTypeId ? priceMap[yarnTypeId] || 0 : 0;
        const contribution = unitPrice * proportion;

        if (unitPrice === 0 && proportion > 0) {
          missingPrices.push(yarnName);
        }

        yarnCosts.push({ name: yarnName, cost: unitPrice, proportion });
        totalYarnCost += contribution;
      });

      // Alertar se algum fio não tem preço cadastrado
      if (missingPrices.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Atenção: Fios sem preço',
          description: `Os seguintes fios não têm preço cadastrado para hoje: ${missingPrices.join(', ')}`
        });
      }

      // Mapa de custos de tingimento por cor
      const dyeingMap: Record<string, number> = {};
      productColors.forEach((pc) => {
        dyeingMap[pc.color_id] = pc.dyeing_cost;
      });

      // Calcular por cor
      const calculatedColors: ColorEntry[] = [];
      let totalKg = 0;
      let totalValue = 0;

      // Get conversion factor from localStorage and special discount from user input
      const storedConversionFactor = localStorage.getItem('globalConversionFactor');
      const conversionFactorValue = storedConversionFactor ? parseFloat(storedConversionFactor) : 0;
      const specialDiscountValue = parseFloat(specialDiscount) || 0;

      for (const entry of validEntries) {
        const productColor = productColors.find(pc => pc.color_id === entry.colorId);
        const quantity = parseFloat(entry.quantity);
        const dyeingCost = dyeingMap[entry.colorId] || 0;

        // Fórmula: (Σ(Custo Fio × Proporção) + Tecelagem + Tinturaria + Fator Conversão + Desconto Especial + Frete) / Fator de Aproveitamento
        // Custo cor = dyeingCost + conversionFactorValue + specialDiscountValue
        const colorTotalCost = dyeingCost + conversionFactorValue + specialDiscountValue;
        const rawCost = totalYarnCost + product.weaving_cost + colorTotalCost + freightCost;
        const costPerKg = rawCost / product.efficiency_factor;
        const totalCost = costPerKg * quantity;

        calculatedColors.push({
          colorId: entry.colorId,
          colorName: productColor?.color_name || 'Desconhecida',
          quantity,
          dyeingCost: colorTotalCost, // Now includes conversion + special discount
          costPerKg,
          totalCost
        });

        totalKg += quantity;
        totalValue += totalCost;
      }

      const averageCostPerKg = totalKg > 0 ? totalValue / totalKg : 0;

      setResult({
        product,
        tinturaria,
        colors: calculatedColors,
        yarnCosts,
        weavingCost: product.weaving_cost,
        freightCost,
        totalKg,
        averageCostPerKg,
        totalValue
      });

    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao calcular custos. Verifique se os preços dos fios estão cadastrados.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Save quote to database
  const saveQuoteToDatabase = async () => {
    if (!result) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Calcule o custo antes de salvar a cotação.'
      });
      return;
    }

    setSavingQuote(true);
    try {
      const storedConversionFactor = localStorage.getItem('globalConversionFactor');
      const conversionFactorValue = storedConversionFactor ? parseFloat(storedConversionFactor) : 0;
      const specialDiscountValue = parseFloat(specialDiscount) || 0;

      const quoteData: SavedQuoteData = {
        tinturaria_id: selectedTinturariaId,
        tinturaria_name: result.tinturaria.name,
        product_id: selectedProductId,
        product_code: result.product.code,
        product_name: result.product.name,
        composition: result.product.composition || '',
        weight_gsm: result.product.weight_gsm,
        width_cm: result.product.width_cm,
        yield_m_kg: result.product.yield_m_kg,
        efficiency_factor: result.product.efficiency_factor,
        weaving_cost: result.weavingCost,
        customer_name: customerName,
        payment_method: paymentMethod,
        adm_description: admDescription,
        conversion_factor: conversionFactorValue,
        special_discount: specialDiscountValue,
        freight_price: result.freightCost,
        colors: result.colors.map(c => ({
          color_id: c.colorId,
          color_name: c.colorName,
          quantity: c.quantity,
          dyeing_cost: c.dyeingCost,
          cost_per_kg: c.costPerKg,
          total_cost: c.totalCost
        })),
        yarn_prices: result.yarnCosts.map(y => ({
          yarn_type_id: productYarns.find(py => py.selectedYarnName === y.name)?.selectedYarnId || '',
          yarn_name: y.name,
          price: y.cost,
          proportion: y.proportion
        }))
      };

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert and get the new row with order_number
      const { error: insertError } = await supabase
        .from('quotes')
        .insert([{
          product_id: selectedProductId,
          user_id: user?.id,
          total_kg: result.totalKg,
          average_cost_per_kg: result.averageCostPerKg,
          total_value: result.totalValue,
          quote_data: JSON.parse(JSON.stringify(quoteData))
        }]);

      if (insertError) throw insertError;

      // Query for the most recent quote to get the order_number
      const { data: recentQuote, error: queryError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (queryError) throw queryError;

      const orderNumber = (recentQuote as unknown as { order_number: number }).order_number;
      setLastSavedQuoteNumber(orderNumber);
      toast({
        title: 'Cotação salva!',
        description: `Número da cotação: ${orderNumber}`
      });
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar a cotação.'
      });
    } finally {
      setSavingQuote(false);
    }
  };

  // Load quote from database by order number
  const loadQuoteByNumber = async () => {
    const orderNum = parseInt(quoteSearchNumber);
    if (!orderNum || orderNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Digite um número de cotação válido.'
      });
      return;
    }

    setLoadingQuote(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('order_number', orderNum)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          variant: 'destructive',
          title: 'Não encontrado',
          description: `Cotação nº ${orderNum} não existe.`
        });
        return;
      }

      const quoteData = data.quote_data as unknown as SavedQuoteData;
      
      // Set flag to prevent useEffect from resetting colors
      isLoadingQuoteRef.current = true;
      
      // Store loaded quote data for display
      setLoadedQuoteData(quoteData);
      
      // Restore form state
      setSelectedTinturariaId(quoteData.tinturaria_id);
      setSelectedProductId(quoteData.product_id);
      setCustomerName(quoteData.customer_name || '');
      setPaymentMethod(quoteData.payment_method || 'a_vista');
      setAdmDescription(quoteData.adm_description || '');
      setSpecialDiscount(quoteData.special_discount?.toString() || '');
      
      // Restore color entries
      setColorEntries(quoteData.colors.map(c => ({
        colorId: c.color_id,
        quantity: c.quantity.toString()
      })));
      
      // Reset flag after a short delay to allow useEffect to run first
      setTimeout(() => {
        isLoadingQuoteRef.current = false;
      }, 100);
      
      // Build result from saved data (preserving original prices)
      const savedProduct: Product = {
        id: quoteData.product_id,
        code: quoteData.product_code,
        name: quoteData.product_name,
        composition: quoteData.composition,
        weight_gsm: quoteData.weight_gsm,
        width_cm: quoteData.width_cm,
        yield_m_kg: quoteData.yield_m_kg,
        efficiency_factor: quoteData.efficiency_factor,
        weaving_cost: quoteData.weaving_cost
      };

      const savedTinturaria: Tinturaria = {
        id: quoteData.tinturaria_id,
        name: quoteData.tinturaria_name,
        conversion_factor: quoteData.conversion_factor
      };

      const savedColors: ColorEntry[] = quoteData.colors.map(c => ({
        colorId: c.color_id,
        colorName: c.color_name,
        quantity: c.quantity,
        dyeingCost: c.dyeing_cost,
        costPerKg: c.cost_per_kg,
        totalCost: c.total_cost
      }));

      const savedYarnCosts = quoteData.yarn_prices.map(y => ({
        name: y.yarn_name,
        cost: y.price,
        proportion: y.proportion
      }));

      setResult({
        product: savedProduct,
        tinturaria: savedTinturaria,
        colors: savedColors,
        yarnCosts: savedYarnCosts,
        weavingCost: quoteData.weaving_cost,
        freightCost: quoteData.freight_price,
        totalKg: data.total_kg,
        averageCostPerKg: data.average_cost_per_kg,
        totalValue: data.total_value
      });

      // Set the order number so PDFs can be generated without re-saving
      setLastSavedQuoteNumber(orderNum);

      toast({
        title: 'Cotação carregada!',
        description: `Cotação nº ${orderNum} de ${new Date(data.created_at).toLocaleDateString('pt-BR')}`
      });
    } catch (error) {
      console.error('Error loading quote:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar a cotação.'
      });
    } finally {
      setLoadingQuote(false);
    }
  };

  // Get available colors - ONLY from productColors (tinturaria + product specific)
  // Filter out colors with R$0.00 cost (not configured) and sort alphabetically
  const availableColors = productColors
    .filter(color => color.dyeing_cost > 0)
    .sort((a, b) => a.color_name.localeCompare(b.color_name, 'pt-BR'));

  const generatePDF = async (type: 'pedido' | 'orcamento') => {
    if (!result || !customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: `Preencha o nome do cliente para gerar o ${type === 'pedido' ? 'pedido' : 'orçamento'}.`
      });
      return;
    }

    // Require quote to be saved first to get the order number
    if (!lastSavedQuoteNumber) {
      toast({
        variant: 'destructive',
        title: 'Salve a cotação primeiro',
        description: 'É necessário salvar a cotação no sistema antes de gerar o PDF.'
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    // Colors - Green #009B3A or Orange #C67837
    const greenColor: [number, number, number] = [0, 155, 58];
    const orangeColor: [number, number, number] = [198, 120, 55];
    const primaryColor: [number, number, number] = type === 'pedido' ? greenColor : orangeColor;
    const textColor: [number, number, number] = [51, 51, 51];

    // Document title based on type
    const docTitle = type === 'pedido' ? 'Pedido Fechado' : 'Orçamento';
    const filePrefix = type === 'pedido' ? 'Pedido' : 'Orcamento';
    const summaryTitle = type === 'pedido' ? 'RESUMO DO PEDIDO' : 'RESUMO DO ORÇAMENTO';

    // Use ONLY the database order number
    const docNumber = lastSavedQuoteNumber.toString().padStart(4, '0');

    // Header - compact
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 32, 'F');

    // Add logo image
    try {
      const logoImg = new Image();
      logoImg.src = '/fast-malhas-logo-pdf.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      doc.addImage(logoImg, 'PNG', margin, 5, 40, 20);
    } catch (e) {
      // Fallback to text if logo fails
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('FAST Malhas', margin, 20);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(docTitle, margin + 50, 20);

    // Order number in header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nº ${docNumber}`, pageWidth - margin - 22, 20);

    yPos = 40;

    // Date and Customer - compact
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.text(`Data: ${dateStr}`, pageWidth - margin - 35, yPos);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Cliente:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(customerName, margin + 20, yPos);

    yPos += 8;

    // Tinturaria
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Tinturaria:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(result.tinturaria.name, margin + 25, yPos);

    yPos += 10;

    // Product Info Box - compact
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 28, 2, 2, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 28, 2, 2, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('ARTIGO:', margin + 4, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(`${result.product.code} - ${result.product.name}`, margin + 24, yPos + 8);
    doc.setFontSize(9);
    doc.text(`${result.product.composition || 'Composição não informada'}`, margin + 4, yPos + 16);
    
    // Ficha técnica inline
    const techText = `Gramatura: ${result.product.weight_gsm || '-'} g/m² | Largura: ${result.product.width_cm || '-'} cm | Rendimento: ${result.product.yield_m_kg || '-'} m/kg`;
    doc.text(techText, margin + 4, yPos + 24);

    yPos += 34;

    // Custo Médio por KG em destaque - compact
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`CUSTO MÉDIO POR KG: R$ ${formatBRL(result.averageCostPerKg)}`, margin + 4, yPos + 8);

    yPos += 18;

    // Color Details Table Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('DETALHAMENTO POR COR', margin, yPos);
    yPos += 6;

    // Table Header - compact
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('COR', margin + 4, yPos + 5.5);
    doc.text('QTD (KG)', margin + 70, yPos + 5.5);
    doc.text('R$/KG', margin + 105, yPos + 5.5);
    doc.text('SUBTOTAL', margin + 140, yPos + 5.5);
    yPos += 8;

    // Table Rows - compact rows with pagination
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    
    // Calculate safe area - leave space for payment box + totals box + footer
    const rowHeight = 7;
    const footerReservedHeight = 10 + 28 + 10 + 16; // payment + totals + footer + spacing
    const maxYBeforeFooter = pageHeight - footerReservedHeight;
    
    result.colors.forEach((color, index) => {
      // Check if we need a new page
      if (yPos + rowHeight > maxYBeforeFooter) {
        doc.addPage();
        yPos = 20;
        
        // Redraw table header on new page
        doc.setFillColor(...primaryColor);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('COR', margin + 4, yPos + 5.5);
        doc.text('QTD (KG)', margin + 70, yPos + 5.5);
        doc.text('R$/KG', margin + 105, yPos + 5.5);
        doc.text('SUBTOTAL', margin + 140, yPos + 5.5);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
      }
      
      const bgColor: [number, number, number] = index % 2 === 0 ? [255, 255, 255] : [248, 248, 248];
      doc.setFillColor(...bgColor);
      doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');
      
      doc.setFontSize(9);
      doc.text(color.colorName, margin + 4, yPos + 5);
      doc.text(formatBRL(color.quantity), margin + 70, yPos + 5);
      doc.text(`R$ ${formatBRL(color.costPerKg)}`, margin + 105, yPos + 5);
      doc.text(`R$ ${formatBRL(color.totalCost)}`, margin + 140, yPos + 5);
      yPos += rowHeight;
    });

    // Calculate remaining space and position elements at bottom
    const footerY = pageHeight - 8;
    const totalsBoxHeight = 28;
    const paymentBoxHeight = 10;
    const totalsBoxY = footerY - totalsBoxHeight - 4;
    const paymentBoxY = totalsBoxY - paymentBoxHeight - 4;

    // Payment Method Box
    const paymentLabel = paymentMethod === 'a_vista' 
      ? 'Pedido: à vista' 
      : paymentMethod === 'a_prazo' 
        ? 'Pedido: à prazo' 
        : `Pedido: ADM - ${admDescription}`;
    
    doc.setFillColor(70, 70, 70);
    doc.roundedRect(margin, paymentBoxY, pageWidth - (margin * 2), paymentBoxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`FORMA DE PAGAMENTO: ${paymentLabel}`, margin + 4, paymentBoxY + 7);

    // Totals Box
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, totalsBoxY, pageWidth - (margin * 2), totalsBoxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(summaryTitle, margin + 4, totalsBoxY + 9);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total em KG: ${formatBRL(result.totalKg)} KG`, margin + 4, totalsBoxY + 18);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const totalText = `VALOR TOTAL ESTIMADO: R$ ${formatBRL(result.totalValue)}`;
    const totalX = pageWidth - margin - 4;
    const totalY = totalsBoxY + 20;
    doc.text(totalText, totalX, totalY, { align: 'right' });
    // Underline
    const textWidth = doc.getTextWidth(totalText);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.line(totalX - textWidth, totalY + 1.5, totalX, totalY + 1.5);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('FAST Malhas - Qualidade e Confiança em Malhas', pageWidth / 2, footerY, { align: 'center' });

    // Generate filename
    const sanitizedName = customerName.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const dateForFile = today.toISOString().split('T')[0];
    const filename = `${filePrefix}_${docNumber}_${sanitizedName}_${dateForFile}.pdf`;

    doc.save(filename);

    toast({
      title: type === 'pedido' ? 'Pedido criado!' : 'Orçamento criado!',
      description: `PDF "${filename}" foi baixado com sucesso.`
    });
  };

  // Função para enviar pedido ao sistema ERP
  const enviarPedidoParaERP = async () => {
    if (!result || !customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha o nome do cliente e calcule o custo antes de cadastrar o pedido.'
      });
      return;
    }

    if (!lastSavedQuoteNumber) {
      toast({
        variant: 'destructive',
        title: 'Salve a cotação primeiro',
        description: 'É necessário salvar a cotação no sistema antes de cadastrar o pedido no ERP.'
      });
      return;
    }

    setSendingToERP(true);
    try {
      const paymentLabel = paymentMethod === 'a_vista' 
        ? 'à vista' 
        : paymentMethod === 'a_prazo' 
          ? 'a prazo' 
          : `ADM - ${admDescription}`;

      const dadosPedido = {
        numero_pedido: lastSavedQuoteNumber.toString().padStart(4, '0'),
        cliente: customerName,
        tinturaria: result.tinturaria.name,
        artigo_codigo: result.product.code,
        artigo_nome: result.product.name,
        composicao: result.product.composition || '',
        gramatura: `${result.product.weight_gsm} g/m²`,
        largura: `${result.product.width_cm} cm`,
        rendimento: `${result.product.yield_m_kg} m/kg`,
        custo_medio_kg: result.averageCostPerKg,
        forma_pagamento: paymentLabel,
        prazo_pagamento: paymentMethod === 'a_prazo' ? admDescription : '',
        total_kg: result.totalKg,
        valor_total: result.totalValue,
        itens: result.colors.map(c => ({
          cor: c.colorName,
          qtd: c.quantity,
          preco: c.costPerKg,
          subtotal: c.totalCost
        })),
        data_pedido: new Date().toISOString()
      };

      const response = await fetch(
        'https://seigdujsdwimmyfolmjq.supabase.co/functions/v1/create-draft-order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosPedido)
        }
      );
      
      const resultData = await response.json();
      
      if (resultData.success) {
        toast({
          title: 'Pedido cadastrado!',
          description: `Pedido ${resultData.numero || lastSavedQuoteNumber} foi cadastrado no sistema ERP com sucesso!`
        });
      } else {
        throw new Error(resultData.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao enviar para ERP:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar pedido',
        description: error.message || 'Não foi possível cadastrar o pedido no sistema ERP.'
      });
    } finally {
      setSendingToERP(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedTinturaria = tinturarias.find(t => t.id === selectedTinturariaId);

  return (
    <div className="space-y-6">
      {/* Quote Search/Load Section */}
      <Card className="bg-card/95 border-accent/30">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-card-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-accent" />
                Buscar Cotação por Número
              </Label>
              <Input
                type="number"
                placeholder="Ex: 1, 2, 3..."
                value={quoteSearchNumber}
                onChange={(e) => setQuoteSearchNumber(e.target.value)}
                className="bg-background border-input"
              />
            </div>
            <Button
              onClick={loadQuoteByNumber}
              disabled={loadingQuote || !quoteSearchNumber}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {loadingQuote ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Carregar Cotação
                </>
              )}
            </Button>
          </div>
          {lastSavedQuoteNumber && (
            <p className="text-sm text-accent mt-2">
              Última cotação salva: <strong>Nº {lastSavedQuoteNumber}</strong>
            </p>
          )}
          {loadedQuoteData && (
            <p className="text-sm text-muted-foreground mt-2">
              Cotação carregada preserva os preços originais da data de criação.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="bg-card/95 border-military/30">
          <CardHeader>
          <CardTitle className="font-poppins text-xl text-card-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            Calculadora de Custos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tinturaria Selection */}
          <div className="space-y-2">
            <Label className="text-card-foreground flex items-center gap-2">
              <Factory className="w-4 h-4 text-accent" />
              Tinturaria
            </Label>
            <Select value={selectedTinturariaId} onValueChange={(value) => {
              setSelectedTinturariaId(value);
              setSelectedProductId('');
              setColorEntries([{ colorId: '', quantity: '' }]);
              setResult(null);
            }}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione a tinturaria" />
              </SelectTrigger>
              <SelectContent>
                {tinturarias.map((tinturaria) => (
                  <SelectItem key={tinturaria.id} value={tinturaria.id}>
                    {tinturaria.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label className="text-card-foreground">Produto/Artigo</Label>
            <Select 
              value={selectedProductId} 
              onValueChange={setSelectedProductId}
              disabled={!selectedTinturariaId}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder={selectedTinturariaId ? "Selecione o produto" : "Selecione uma tinturaria primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProductId && (
              <p className="text-xs text-muted-foreground">
                {selectedProduct?.composition}
              </p>
            )}
          </div>

          {/* Color Status Alert */}
          {selectedTinturariaId && selectedProductId && productColors.length === 0 && !loadingColors && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Este produto não possui cores cadastradas para a tinturaria "{selectedTinturaria?.name}". 
                Cadastre as cores na aba "Tinturaria" antes de calcular.
              </p>
            </div>
          )}

          {/* Yarn Selection - permite trocar fios principais */}
          {selectedProductId && productYarns.length > 0 && (
            <div className="space-y-3">
              <Label className="text-card-foreground flex items-center gap-2">
                <span className="text-sm">Composição de Fios</span>
                <span className="text-xs text-muted-foreground">(fios recomendados pré-selecionados)</span>
              </Label>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                {productYarns.map((yarn, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">
                      {(yarn.proportion * 100).toFixed(0)}%
                    </span>
                    {yarn.isChangeable ? (
                      <Select 
                        value={yarn.selectedYarnId} 
                        onValueChange={(value) => updateSelectedYarn(index, value)}
                      >
                        <SelectTrigger className="bg-background border-input flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAlternativeYarns().map((y) => (
                            <SelectItem key={y.id} value={y.id}>
                              {y.name} {y.id === yarn.originalYarnId && '(recomendado)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex-1 text-sm text-card-foreground bg-background/50 px-3 py-2 rounded border border-input/50">
                        {yarn.selectedYarnName}
                        <span className="text-xs text-muted-foreground ml-2">(fixo)</span>
                      </div>
                    )}
                    {yarn.selectedYarnId !== yarn.originalYarnId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-accent hover:text-accent/80"
                        onClick={() => updateSelectedYarn(index, yarn.originalYarnId)}
                      >
                        Restaurar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Desconto Especial */}
          {selectedProductId && (
            <div className="space-y-2">
              <Label className="text-card-foreground">
                Desconto Especial (R$)
                <span className="text-xs text-muted-foreground ml-2">
                  Valor descontado ao custo de cada cor
                </span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={specialDiscount}
                onChange={(e) => setSpecialDiscount(e.target.value)}
                className="bg-background border-input"
              />
            </div>
          )}

          {/* Color Entries */}
          {availableColors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-card-foreground">
                  Cores e Quantidades
                  <span className="text-xs text-muted-foreground ml-2">
                    ({availableColors.length} cores com custo cadastrado)
                  </span>
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addColorEntry}
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Cor
                </Button>
              </div>

              {colorEntries.map((entry, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Select 
                      value={entry.colorId} 
                      onValueChange={(value) => updateColorEntry(index, 'colorId', value)}
                      disabled={loadingColors}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder={loadingColors ? "Carregando..." : "Cor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColors.map((color) => (
                          <SelectItem key={color.color_id} value={color.color_id}>
                            {color.color_name} - R$ {color.dyeing_cost?.toFixed(2) || '0.00'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="KG"
                      value={entry.quantity}
                      onChange={(e) => updateColorEntry(index, 'quantity', e.target.value)}
                      className="bg-background border-input"
                    />
                  </div>
                  {colorEntries.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeColorEntry(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={calculateCost}
            disabled={loading || availableColors.length === 0}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-poppins font-bold"
          >
            {loading ? 'Calculando...' : 'Calcular Custo'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-card/95 border-military/30">
        <CardHeader>
          <CardTitle className="font-poppins text-xl text-card-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            Resultado do Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              {/* Tinturaria Info */}
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-accent" />
                  <span className="font-medium text-card-foreground">Tinturaria: {result.tinturaria.name}</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 bg-military/10 rounded-lg border border-military/20">
                <h4 className="font-poppins font-bold text-card-foreground">
                  {result.product.code} - {result.product.name}
                </h4>
                <p className="text-sm text-muted-foreground">{result.product.composition}</p>
              </div>

              {/* Yarn Costs Breakdown */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-card-foreground">Custos Base</h5>
                {result.yarnCosts.map((yarn, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {yarn.name} ({(yarn.proportion * 100).toFixed(0)}%)
                    </span>
                    <span className="text-card-foreground">
                      R$ {(yarn.cost * yarn.proportion).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete (por KG)</span>
                  <span className="text-card-foreground">
                    R$ {currentFreightPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Color Breakdown */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-card-foreground">Detalhamento por Cor</h5>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.colors.map((color, i) => (
                    <div key={i} className="p-3 bg-background/50 rounded border border-military/10">
                      <div className="flex justify-between">
                        <span className="font-medium text-card-foreground">{color.colorName}</span>
                        <span className="text-card-foreground">{formatBRL(color.quantity)} KG</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>R$ {formatBRL(color.costPerKg)}/KG</span>
                      </div>
                      <div className="text-right text-sm font-medium text-accent">
                        Subtotal: R$ {formatBRL(color.totalCost)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-military/30 pt-4 space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-card-foreground">Total KG:</span>
                  <span className="font-bold text-card-foreground">
                    {formatBRL(result.totalKg)} KG
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-card-foreground">Custo Médio/KG:</span>
                  <span className="font-bold text-accent">
                    R$ {formatBRL(result.averageCostPerKg)}
                  </span>
                </div>
                <div className="flex justify-between text-xl bg-accent/10 p-4 rounded-lg">
                  <span className="font-poppins font-bold text-card-foreground">VALOR TOTAL ESTIMADO:</span>
                  <span className="font-poppins font-black text-accent">
                    R$ {formatBRL(result.totalValue)}
                  </span>
                </div>
              </div>

              {/* Customer Name & Payment Method & PDF Generation */}
              <div className="border-t border-military/30 pt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Nome do Cliente</Label>
                  <Input
                    type="text"
                    placeholder="Digite o nome do cliente"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-background border-input"
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={(value: 'a_vista' | 'a_prazo' | 'adm') => {
                    setPaymentMethod(value);
                    if (value !== 'adm') setAdmDescription('');
                  }}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_vista">Pedido: à vista</SelectItem>
                      <SelectItem value="a_prazo">Pedido: à prazo</SelectItem>
                      <SelectItem value="adm">Pedido: ADM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ADM Description Field */}
                {paymentMethod === 'adm' && (
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Descrição ADM</Label>
                    <Input
                      type="text"
                      placeholder="Digite a descrição do ADM"
                      value={admDescription}
                      onChange={(e) => setAdmDescription(e.target.value)}
                      className="bg-background border-input"
                    />
                  </div>
                )}

                {/* Save Quote Button */}
                <Button
                  onClick={saveQuoteToDatabase}
                  disabled={savingQuote}
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent/10 font-poppins font-bold"
                >
                  {savingQuote ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Cotação no Sistema
                    </>
                  )}
                </Button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => generatePDF('orcamento')}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-poppins font-bold text-sm sm:text-base py-3"
                  >
                    <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Criar Orçamento (PDF)</span>
                  </Button>
                  <Button 
                    onClick={() => generatePDF('pedido')}
                    className="flex-1 bg-[#009B3A] hover:bg-[#007A2E] text-white font-poppins font-bold text-sm sm:text-base py-3"
                  >
                    <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Criar Pedido (PDF)</span>
                  </Button>
                </div>

                {/* Botão Cadastrar Pedido no Sistema ERP */}
                <Button
                  onClick={enviarPedidoParaERP}
                  disabled={sendingToERP || !lastSavedQuoteNumber}
                  className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-poppins font-bold text-sm sm:text-base py-3"
                >
                  {sendingToERP ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      📤 Cadastrar pedido no sistema
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Selecione uma tinturaria, produto e adicione cores para calcular o custo.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
};
