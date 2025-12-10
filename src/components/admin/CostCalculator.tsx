import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, FileText, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';

// Format number to Brazilian currency format (10.000,00)
const formatBRL = (value: number): string => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

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
  colors: ColorEntry[];
  yarnCosts: { name: string; cost: number; proportion: number }[];
  weavingCost: number;
  totalKg: number;
  averageCostPerKg: number;
  totalValue: number;
}

export const CostCalculator = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [colorEntries, setColorEntries] = useState<{ colorId: string; quantity: string }[]>([
    { colorId: '', quantity: '' }
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchAllColors();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchProductColors(selectedProductId);
      // Reset color entries when product changes
      setColorEntries([{ colorId: '', quantity: '' }]);
      setResult(null);
    }
  }, [selectedProductId]);

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

  const fetchProductColors = async (productId: string) => {
    setLoadingColors(true);
    setProductColors([]);
    try {
      // Fetch colors that have dyeing costs for this specific product
      const { data, error } = await supabase
        .from('dyeing_costs')
        .select('color_id, cost, colors(name)')
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
      if (!product) throw new Error('Produto não encontrado');

      // Buscar preços de fios do dia
      const today = new Date().toISOString().split('T')[0];
      const { data: yarnPrices, error: yarnError } = await supabase
        .from('yarn_prices')
        .select('yarn_type_id, price, yarn_types(name)')
        .eq('effective_date', today);

      if (yarnError) throw yarnError;

      // Calcular custo base dos fios (usando valores padrão baseados na composição)
      const yarnCosts: { name: string; cost: number; proportion: number }[] = [];
      let totalYarnCost = 0;

      // Parse composition to get yarn proportions
      const composition = product.composition || '';
      const hasPoliester = composition.toLowerCase().includes('poliéster') || composition.toLowerCase().includes('poliester');
      const hasPoliamida = composition.toLowerCase().includes('poliamida');
      const hasElastano = composition.toLowerCase().includes('elastano');
      const hasAlgodao = composition.toLowerCase().includes('algodão');

      // Get yarn prices
      const priceMap: Record<string, number> = {};
      yarnPrices?.forEach((yp: any) => {
        priceMap[yp.yarn_types?.name || ''] = yp.price;
      });

      // Calculate based on composition pattern (simplified - you'd want more sophisticated parsing)
      if (hasPoliester) {
        const poliesterPrice = priceMap['Poliéster'] || 0;
        const proportion = hasElastano ? 0.94 : 1;
        yarnCosts.push({ name: 'Poliéster', cost: poliesterPrice, proportion });
        totalYarnCost += poliesterPrice * proportion;
      }
      if (hasPoliamida) {
        const poliamidaPrice = priceMap['Poliamida'] || 0;
        const proportion = hasElastano ? 0.91 : 1;
        yarnCosts.push({ name: 'Poliamida', cost: poliamidaPrice, proportion });
        totalYarnCost += poliamidaPrice * proportion;
      }
      if (hasAlgodao) {
        const algodaoPrice = priceMap['Algodão'] || 0;
        const proportion = hasElastano ? 0.96 : 1;
        yarnCosts.push({ name: 'Algodão', cost: algodaoPrice, proportion });
        totalYarnCost += algodaoPrice * proportion;
      }
      if (hasElastano) {
        const elastanoPrice = priceMap['Elastano 20'] || priceMap['Elastano 40'] || 0;
        const proportion = 1 - (yarnCosts[0]?.proportion || 0);
        yarnCosts.push({ name: 'Elastano', cost: elastanoPrice, proportion });
        totalYarnCost += elastanoPrice * proportion;
      }

      // Build dyeing cost map from product colors
      const dyeingMap: Record<string, number> = {};
      productColors.forEach((pc) => {
        dyeingMap[pc.color_id] = pc.dyeing_cost;
      });

      // Calculate per color
      const calculatedColors: ColorEntry[] = [];
      let totalKg = 0;
      let totalValue = 0;

      for (const entry of validEntries) {
        const productColor = productColors.find(pc => pc.color_id === entry.colorId);
        const quantity = parseFloat(entry.quantity);
        const dyeingCost = dyeingMap[entry.colorId] || 7.62; // Default dyeing cost

        // Fórmula: (Σ(Custo Fio × Proporção) + Tecelagem + Tinturaria) / Fator de Aproveitamento
        const rawCost = totalYarnCost + product.weaving_cost + dyeingCost;
        const costPerKg = rawCost / product.efficiency_factor;
        const totalCost = costPerKg * quantity;

        calculatedColors.push({
          colorId: entry.colorId,
          colorName: productColor?.color_name || 'Desconhecida',
          quantity,
          dyeingCost,
          costPerKg,
          totalCost
        });

        totalKg += quantity;
        totalValue += totalCost;
      }

      const averageCostPerKg = totalKg > 0 ? totalValue / totalKg : 0;

      setResult({
        product,
        colors: calculatedColors,
        yarnCosts,
        weavingCost: product.weaving_cost,
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

  // Get available colors based on product
  const availableColors = productColors.length > 0 
    ? productColors 
    : allColors.map(c => ({ color_id: c.id, color_name: c.name, dyeing_cost: 7.62 }));

  const generatePDF = () => {
    if (!result || !customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha o nome do cliente para gerar o pedido.'
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Colors - #009B3A (FAST Malhas green)
    const primaryColor: [number, number, number] = [0, 155, 58];
    const accentColor: [number, number, number] = [198, 120, 55];
    const textColor: [number, number, number] = [51, 51, 51];

    // Generate order number
    const lastOrderNum = parseInt(localStorage.getItem('fastmalhas_order_num') || '0', 10);
    const newOrderNum = lastOrderNum + 1;
    localStorage.setItem('fastmalhas_order_num', newOrderNum.toString());
    const orderNumber = newOrderNum.toString().padStart(4, '0');

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FAST MALHAS', margin, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Pedido de Orçamento', margin, 30);

    // Order number in header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nº ${orderNumber}`, pageWidth - margin - 20, 22);

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

    yPos += 20;

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
    doc.setFillColor(...accentColor);
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
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 40, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO DO PEDIDO', margin + 5, yPos + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total em KG: ${formatBRL(result.totalKg)} KG`, margin + 5, yPos + 20);
    doc.text(`Custo Médio/KG: R$ ${formatBRL(result.averageCostPerKg)}`, margin + 5, yPos + 28);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text(`VALOR TOTAL: R$ ${formatBRL(result.totalValue)}`, pageWidth - margin - 70, yPos + 28);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('FAST Malhas - Qualidade e Confiança em Malhas', pageWidth / 2, footerY, { align: 'center' });

    // Generate filename
    const sanitizedName = customerName.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const dateForFile = today.toISOString().split('T')[0];
    const filename = `Pedido_${orderNumber}_${sanitizedName}_${dateForFile}.pdf`;

    doc.save(filename);

    toast({
      title: 'Pedido criado!',
      description: `PDF "${filename}" foi baixado com sucesso.`
    });
  };

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
          {/* Product Selection */}
          <div className="space-y-2">
            <Label className="text-card-foreground">Produto/Artigo</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione o produto" />
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
                {products.find(p => p.id === selectedProductId)?.composition}
              </p>
            )}
          </div>

          {/* Color Status Alert */}
          {selectedProductId && productColors.length === 0 && !loadingColors && (
            <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Este produto não possui custos de tinturaria cadastrados. Será usado o custo padrão de R$ 7,62 por cor.
              </p>
            </div>
          )}

          {/* Color Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-card-foreground">
                Cores e Quantidades
                {productColors.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({productColors.length} cores disponíveis)
                  </span>
                )}
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
                          {productColors.length > 0 
                            ? `${color.color_name} - R$ ${color.dyeing_cost?.toFixed(2) || '0.00'}`
                            : color.color_name
                          }
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

          <Button 
            onClick={calculateCost}
            disabled={loading}
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
                  <span className="font-poppins font-bold text-card-foreground">VALOR TOTAL:</span>
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
                <Button 
                  onClick={generatePDF}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-poppins font-bold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Criar Pedido (PDF)
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Selecione um produto e adicione cores para calcular o custo.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};