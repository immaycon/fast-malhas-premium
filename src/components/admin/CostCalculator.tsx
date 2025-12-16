import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, FileText, AlertCircle, Download, Factory } from 'lucide-react';
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
  const [conversionFactor, setConversionFactor] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTinturarias();
    fetchProducts();
    fetchAllColors();
    fetchAllYarnTypes();
  }, []);

  useEffect(() => {
    if (selectedTinturariaId && selectedProductId) {
      fetchProductColors(selectedTinturariaId, selectedProductId);
      fetchProductYarns(selectedProductId);
      // Reset color entries, special discount, and conversion factor when product or tinturaria changes
      setColorEntries([{ colorId: '', quantity: '' }]);
      setSpecialDiscount('');
      setConversionFactor('');
      setResult(null);
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

      // Get conversion factor and special discount from user inputs
      const conversionFactorValue = parseFloat(conversionFactor) || 0;
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

  // Get available colors - ONLY from productColors (tinturaria + product specific)
  const availableColors = productColors;

  const generatePDF = async (type: 'pedido' | 'orcamento') => {
    if (!result || !customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: `Preencha o nome do cliente para gerar o ${type === 'pedido' ? 'pedido' : 'orçamento'}.`
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
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

    // Generate order number
    const storageKey = type === 'pedido' ? 'fastmalhas_order_num' : 'fastmalhas_quote_num';
    const lastNum = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const newNum = lastNum + 1;
    localStorage.setItem(storageKey, newNum.toString());
    const docNumber = newNum.toString().padStart(4, '0');

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');

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
      doc.text('FAST Malhas', margin, 22);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(docTitle, margin + 55, 22);

    // Order number in header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nº ${docNumber}`, pageWidth - margin - 20, 22);

    yPos = 50;

    // Date
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.text(`Data: ${dateStr}`, pageWidth - margin - 40, yPos);

    // Customer Name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Cliente:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(customerName, margin + 25, yPos);

    yPos += 15;

    // Tinturaria
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Tinturaria:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(result.tinturaria.name, margin + 28, yPos);

    yPos += 15;

    // Product Info Box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 3, 3, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('ARTIGO', margin + 5, yPos + 10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.text(`${result.product.code} - ${result.product.name}`, margin + 5, yPos + 20);
    doc.setFontSize(9);
    doc.text(`${result.product.composition || 'Composição não informada'}`, margin + 5, yPos + 28);

    yPos += 45;

    // Custo Médio por KG em destaque (abaixo da composição)
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 18, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`CUSTO MÉDIO POR KG: R$ ${formatBRL(result.averageCostPerKg)}`, margin + 5, yPos + 12);

    yPos += 28;

    // Technical Sheet
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('FICHA TÉCNICA', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    const techInfo = [
      `Gramatura: ${result.product.weight_gsm || '-'} g/m²`,
      `Largura: ${result.product.width_cm || '-'} cm`,
      `Rendimento: ${result.product.yield_m_kg || '-'} m/kg`
    ];
    techInfo.forEach((info) => {
      doc.text(info, margin, yPos);
      yPos += 6;
    });

    yPos += 10;

    // Color Details Table Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('DETALHAMENTO POR COR', margin, yPos);
    yPos += 8;

    // Table Header
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('COR', margin + 5, yPos + 6);
    doc.text('QTD (KG)', margin + 70, yPos + 6);
    doc.text('R$/KG', margin + 105, yPos + 6);
    doc.text('SUBTOTAL', margin + 140, yPos + 6);
    yPos += 10;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    result.colors.forEach((color, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      const bgColor: [number, number, number] = index % 2 === 0 ? [255, 255, 255] : [248, 248, 248];
      doc.setFillColor(...bgColor);
      doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
      
      doc.setFontSize(9);
      doc.text(color.colorName, margin + 5, yPos + 6);
      doc.text(formatBRL(color.quantity), margin + 70, yPos + 6);
      doc.text(`R$ ${formatBRL(color.costPerKg)}`, margin + 105, yPos + 6);
      doc.text(`R$ ${formatBRL(color.totalCost)}`, margin + 140, yPos + 6);
      yPos += 8;
    });

    yPos += 10;

    // Totals Box
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(summaryTitle, margin + 5, yPos + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total em KG: ${formatBRL(result.totalKg)} KG`, margin + 5, yPos + 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const totalText = `VALOR TOTAL ESTIMADO: R$ ${formatBRL(result.totalValue)}`;
    const totalX = pageWidth - margin - 5;
    const totalY = yPos + 28;
    doc.text(totalText, totalX, totalY, { align: 'right' });
    // Underline
    const textWidth = doc.getTextWidth(totalText);
    doc.setDrawColor(255, 255, 255);
    doc.line(totalX - textWidth, totalY + 1, totalX, totalY + 1);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
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

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedTinturaria = tinturarias.find(t => t.id === selectedTinturariaId);

  return (
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

          {/* Fator de Conversão e Desconto Especial */}
          {selectedProductId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">
                  Fator de Conversão (R$)
                  <span className="text-xs text-muted-foreground ml-2">
                    Valor descontado ao custo de cada cor
                  </span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(e.target.value)}
                  className="bg-background border-input"
                />
              </div>
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
                  placeholder="0,00"
                  value={specialDiscount}
                  onChange={(e) => setSpecialDiscount(e.target.value)}
                  className="bg-background border-input"
                />
              </div>
            </div>
          )}

          {/* Color Entries */}
          {productColors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-card-foreground">
                  Cores e Quantidades
                  <span className="text-xs text-muted-foreground ml-2">
                    ({productColors.length} cores disponíveis)
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
            disabled={loading || productColors.length === 0}
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

              {/* Customer Name & PDF Generation */}
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
  );
};
