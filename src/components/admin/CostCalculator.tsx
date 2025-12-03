import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, FileText } from 'lucide-react';

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

interface YarnPrice {
  yarn_type_id: string;
  price: number;
  yarn_name: string;
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
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [colorEntries, setColorEntries] = useState<{ colorId: string; quantity: string }[]>([
    { colorId: '', quantity: '' }
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchColors();
  }, []);

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

  const fetchColors = async () => {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .order('name');

    if (!error && data) {
      setColors(data);
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
        const proportion = hasElastano ? 0.94 : 1; // Default proportions
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
        // Determine elastano type from composition
        const elastanoPrice = priceMap['Elastano 20'] || priceMap['Elastano 40'] || 0;
        const proportion = 1 - (yarnCosts[0]?.proportion || 0);
        yarnCosts.push({ name: 'Elastano', cost: elastanoPrice, proportion });
        totalYarnCost += elastanoPrice * proportion;
      }

      // Buscar custos de tinturaria para cada cor
      const colorIds = validEntries.map(e => e.colorId);
      const { data: dyeingCosts, error: dyeingError } = await supabase
        .from('dyeing_costs')
        .select('color_id, cost')
        .eq('product_id', product.id)
        .in('color_id', colorIds);

      // Build dyeing cost map
      const dyeingMap: Record<string, number> = {};
      dyeingCosts?.forEach((dc) => {
        dyeingMap[dc.color_id] = dc.cost;
      });

      // Calculate per color
      const calculatedColors: ColorEntry[] = [];
      let totalKg = 0;
      let totalValue = 0;

      for (const entry of validEntries) {
        const color = colors.find(c => c.id === entry.colorId);
        const quantity = parseFloat(entry.quantity);
        const dyeingCost = dyeingMap[entry.colorId] || 7.62; // Default dyeing cost

        // Fórmula: (Σ(Custo Fio × Proporção) + Tecelagem + Tinturaria) / Fator de Aproveitamento
        const rawCost = totalYarnCost + product.weaving_cost + dyeingCost;
        const costPerKg = rawCost / product.efficiency_factor;
        const totalCost = costPerKg * quantity;

        calculatedColors.push({
          colorId: entry.colorId,
          colorName: color?.name || 'Desconhecida',
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

          {/* Color Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-card-foreground">Cores e Quantidades</Label>
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
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Fator de Aproveitamento: {(result.product.efficiency_factor * 100).toFixed(0)}%
                </p>
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
                  <span className="text-muted-foreground">Tecelagem</span>
                  <span className="text-card-foreground">
                    R$ {result.weavingCost.toFixed(2)}
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
                        <span className="text-card-foreground">{color.quantity.toFixed(2)} KG</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tinturaria: R$ {color.dyeingCost.toFixed(2)}</span>
                        <span>R$ {color.costPerKg.toFixed(2)}/KG</span>
                      </div>
                      <div className="text-right text-sm font-medium text-accent">
                        Subtotal: R$ {color.totalCost.toFixed(2)}
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
                    {result.totalKg.toFixed(2)} KG
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-card-foreground">Custo Médio/KG:</span>
                  <span className="font-bold text-accent">
                    R$ {result.averageCostPerKg.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xl bg-accent/10 p-4 rounded-lg">
                  <span className="font-poppins font-bold text-card-foreground">VALOR TOTAL:</span>
                  <span className="font-poppins font-black text-accent">
                    R$ {result.totalValue.toFixed(2)}
                  </span>
                </div>
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
