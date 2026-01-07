import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Palette, Plus, Trash2, Save, Search, Edit2, X, Factory, Layers, Package, Calculator } from 'lucide-react';
import { DyeingCostsImport } from './DyeingCostsImport';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Tinturaria {
  id: string;
  name: string;
  conversion_factor: number;
}

interface ProductGroup {
  id: string;
  name: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  group_id: string | null;
}

interface Color {
  id: string;
  name: string;
}

interface DyeingCost {
  id: string;
  product_id: string;
  color_id: string;
  tinturaria_id: string;
  cost: number;
  color_name?: string;
}

export const DyeingCostsTab = () => {
  const [tinturarias, setTinturarias] = useState<Tinturaria[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedTinturariaId, setSelectedTinturariaId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'product' | 'group'>('product');
  const [dyeingCosts, setDyeingCosts] = useState<DyeingCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchColor, setSearchColor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState('');
  
  // For adding new tinturaria
  const [newTinturariaName, setNewTinturariaName] = useState('');
  const [addTinturariaOpen, setAddTinturariaOpen] = useState(false);
  
  // For adding new costs
  const [newColorName, setNewColorName] = useState('');
  const [newCost, setNewCost] = useState('');

  // Global conversion factor (stored in localStorage)
  const [globalConversionFactor, setGlobalConversionFactor] = useState<string>(() => {
    return localStorage.getItem('globalConversionFactor') || '';
  });
  
  const { toast } = useToast();

  // Save conversion factor to localStorage whenever it changes
  const handleConversionFactorChange = (value: string) => {
    setGlobalConversionFactor(value);
    if (value) {
      localStorage.setItem('globalConversionFactor', value);
    } else {
      localStorage.removeItem('globalConversionFactor');
    }
  };

  useEffect(() => {
    fetchTinturarias();
    fetchProductGroups();
    fetchProducts();
    fetchColors();
  }, []);

  useEffect(() => {
    if (selectedTinturariaId) {
      if (selectionMode === 'product' && selectedProductId) {
        fetchDyeingCosts(selectedTinturariaId, [selectedProductId]);
      } else if (selectionMode === 'group' && selectedGroupId) {
        const groupProducts = products.filter(p => p.group_id === selectedGroupId);
        if (groupProducts.length > 0) {
          fetchDyeingCosts(selectedTinturariaId, groupProducts.map(p => p.id));
        } else {
          setDyeingCosts([]);
        }
      } else {
        setDyeingCosts([]);
      }
    } else {
      setDyeingCosts([]);
    }
  }, [selectedTinturariaId, selectedProductId, selectedGroupId, selectionMode, products]);

  const fetchTinturarias = async () => {
    const { data, error } = await supabase
      .from('tinturarias')
      .select('id, name, conversion_factor')
      .order('name');
    
    if (!error && data) {
      setTinturarias(data);
    }
  };

  const fetchProductGroups = async () => {
    const { data, error } = await supabase
      .from('product_groups')
      .select('id, name')
      .order('name');
    
    if (!error && data) {
      setProductGroups(data);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, code, name, group_id')
      .eq('is_active', true)
      .order('code');
    
    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchColors = async () => {
    const { data, error } = await supabase
      .from('colors')
      .select('id, name')
      .order('name');
    
    if (!error && data) {
      setColors(data);
    }
  };

  const fetchDyeingCosts = async (tinturariaId: string, productIds: string[]) => {
    setLoading(true);
    try {
      const pageSize = 1000;
      let from = 0;
      let allRows: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('dyeing_costs')
          .select('id, product_id, color_id, tinturaria_id, cost, colors(name)')
          .eq('tinturaria_id', tinturariaId)
          .in('product_id', productIds)
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);

        if (error) throw error;

        const rows = data ?? [];
        allRows = allRows.concat(rows);

        if (rows.length < pageSize) break;
        from += pageSize;
      }

      const costs: DyeingCost[] = allRows.map((dc: any) => ({
        id: dc.id,
        product_id: dc.product_id,
        color_id: dc.color_id,
        tinturaria_id: dc.tinturaria_id,
        cost: dc.cost,
        color_name: dc.colors?.name,
      }));

      setDyeingCosts(costs);
    } catch (err: any) {
      console.error('fetchDyeingCosts error:', err);
      setDyeingCosts([]);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar custos da tinturaria.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTinturaria = async () => {
    if (!newTinturariaName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Digite o nome da tinturaria.'
      });
      return;
    }

    const { data, error } = await supabase
      .from('tinturarias')
      .insert({ name: newTinturariaName.trim() })
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message.includes('duplicate') 
          ? 'Já existe uma tinturaria com este nome.' 
          : 'Erro ao adicionar tinturaria.'
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Tinturaria adicionada.'
      });
      setNewTinturariaName('');
      setAddTinturariaOpen(false);
      fetchTinturarias();
      if (data) {
        setSelectedTinturariaId(data.id);
      }
    }
  };

  const handleDeleteTinturaria = async () => {
    if (!selectedTinturariaId) return;
    
    const tinturaria = tinturarias.find(t => t.id === selectedTinturariaId);
    if (!confirm(`Confirma exclusão da tinturaria "${tinturaria?.name}"? Isso removerá todos os custos associados.`)) return;

    const { error } = await supabase
      .from('tinturarias')
      .delete()
      .eq('id', selectedTinturariaId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao excluir tinturaria.'
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Tinturaria excluída.'
      });
      setSelectedTinturariaId('');
      setSelectedProductId('');
      setSelectedGroupId('');
      fetchTinturarias();
    }
  };

  const getTargetProductIds = (): string[] => {
    if (selectionMode === 'product' && selectedProductId) {
      return [selectedProductId];
    } else if (selectionMode === 'group' && selectedGroupId) {
      return products.filter(p => p.group_id === selectedGroupId).map(p => p.id);
    }
    return [];
  };

  const handleAddCost = async () => {
    const targetProductIds = getTargetProductIds();
    
    if (!selectedTinturariaId || targetProductIds.length === 0 || !newColorName.trim() || !newCost) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos.'
      });
      return;
    }

    const cost = parseFloat(newCost.replace(',', '.'));
    if (isNaN(cost) || cost < 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Custo inválido.'
      });
      return;
    }

    const colorNameNormalized = newColorName.trim().toUpperCase();

    // Check if color already exists in database
    let colorId: string | null = null;
    const { data: existingColor } = await supabase
      .from('colors')
      .select('id')
      .ilike('name', colorNameNormalized)
      .maybeSingle();

    if (existingColor) {
      colorId = existingColor.id;
    } else {
      // Create new color
      const { data: newColor, error: createError } = await supabase
        .from('colors')
        .insert({ name: colorNameNormalized })
        .select('id')
        .single();

      if (createError) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao criar cor: ' + createError.message
        });
        return;
      }
      colorId = newColor.id;
    }

    // Insert cost for all target products
    const insertData = targetProductIds.map(productId => ({
      tinturaria_id: selectedTinturariaId,
      product_id: productId,
      color_id: colorId,
      cost
    }));

    const { error } = await supabase
      .from('dyeing_costs')
      .upsert(insertData, { onConflict: 'product_id,color_id,tinturaria_id' });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao adicionar custo: ' + error.message
      });
    } else {
      toast({
        title: 'Sucesso',
        description: selectionMode === 'group' 
          ? `Custo adicionado para ${targetProductIds.length} artigos do grupo.`
          : 'Custo de tinturaria adicionado.'
      });
      setNewColorName('');
      setNewCost('');
      fetchDyeingCosts(selectedTinturariaId, targetProductIds);
      fetchColors();
    }
  };

  const handleUpdateCost = async (id: string) => {
    const cost = parseFloat(editCost.replace(',', '.'));
    if (isNaN(cost) || cost < 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Custo inválido.'
      });
      return;
    }

    const dyeingCost = dyeingCosts.find(dc => dc.id === id);
    if (!dyeingCost) return;

    // If in group mode, update all products in the group with this color
    if (selectionMode === 'group' && selectedGroupId) {
      const targetProductIds = products.filter(p => p.group_id === selectedGroupId).map(p => p.id);

      const upsertData = targetProductIds.map((productId) => ({
        tinturaria_id: selectedTinturariaId,
        product_id: productId,
        color_id: dyeingCost.color_id,
        cost,
      }));

      const { error, data } = await supabase
        .from('dyeing_costs')
        .upsert(upsertData, { onConflict: 'product_id,color_id,tinturaria_id' })
        .select('id');

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao atualizar custos: ' + error.message,
        });
      } else {
        toast({
          title: 'Sucesso',
          description: `Custo atualizado para ${data?.length ?? targetProductIds.length} registros.`,
        });
        setEditingId(null);
        setEditCost('');
        await fetchDyeingCosts(selectedTinturariaId, targetProductIds);
      }
    } else {
      const { error } = await supabase
        .from('dyeing_costs')
        .update({ cost })
        .eq('id', id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao atualizar custo.'
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Custo atualizado.'
        });
        setEditingId(null);
        setEditCost('');
        fetchDyeingCosts(selectedTinturariaId, [selectedProductId]);
      }
    }
  };

  const handleDeleteCost = async (id: string) => {
    const dyeingCost = dyeingCosts.find(dc => dc.id === id);
    if (!dyeingCost) return;

    const targetProductIds = getTargetProductIds();
    
    if (selectionMode === 'group' && selectedGroupId) {
      if (!confirm(`Confirma exclusão desta cor para TODOS os ${targetProductIds.length} artigos do grupo?`)) return;
      
      const { error } = await supabase
        .from('dyeing_costs')
        .delete()
        .eq('tinturaria_id', selectedTinturariaId)
        .eq('color_id', dyeingCost.color_id)
        .in('product_id', targetProductIds);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao excluir custos.'
        });
      } else {
        toast({
          title: 'Sucesso',
          description: `Cor excluída de ${targetProductIds.length} artigos do grupo.`
        });
        fetchDyeingCosts(selectedTinturariaId, targetProductIds);
      }
    } else {
      if (!confirm('Confirma exclusão deste custo de tinturaria?')) return;

      const { error } = await supabase
        .from('dyeing_costs')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao excluir custo.'
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Custo excluído.'
        });
        fetchDyeingCosts(selectedTinturariaId, [selectedProductId]);
      }
    }
  };

  const startEditing = (dc: DyeingCost) => {
    setEditingId(dc.id);
    setEditCost(dc.cost.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCost('');
  };

  // Get unique colors from dyeing costs
  // When in group mode, show the first non-zero cost found for each color
  // This way the displayed cost is more representative of what's actually configured
  const uniqueColors = Array.from(
    dyeingCosts.reduce((map, dc) => {
      const existing = map.get(dc.color_id);
      if (!existing) {
        // First occurrence - add it
        map.set(dc.color_id, { id: dc.color_id, name: dc.color_name, cost: dc.cost });
      } else if (existing.cost === 0 && dc.cost > 0) {
        // Current has zero cost but new one has a cost - use the non-zero one
        map.set(dc.color_id, { id: dc.color_id, name: dc.color_name, cost: dc.cost });
      }
      return map;
    }, new Map<string, { id: string; name?: string; cost: number }>()).values()
  );

  const filteredCosts = uniqueColors.filter(dc => 
    !searchColor || dc.name?.toLowerCase().includes(searchColor.toLowerCase())
  );

  const selectedTinturaria = tinturarias.find(t => t.id === selectedTinturariaId);
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedGroup = productGroups.find(g => g.id === selectedGroupId);
  const groupProducts = products.filter(p => p.group_id === selectedGroupId);

  const hasSelection = selectionMode === 'product' ? !!selectedProductId : !!selectedGroupId;

  return (
    <div className="space-y-6">
      {/* Global Conversion Factor - BEFORE Tinturaria Selection */}
      <Card className="bg-card/95 border-accent/30">
        <CardHeader className="pb-3">
          <CardTitle className="font-poppins text-lg text-card-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            Fator de Conversão Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label className="text-sm text-muted-foreground mb-1 block">
                Valor descontado ao custo de cada cor (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={globalConversionFactor}
                onChange={(e) => handleConversionFactorChange(e.target.value)}
                className="bg-background border-input"
              />
            </div>
            {globalConversionFactor && parseFloat(globalConversionFactor) > 0 && (
              <Badge variant="secondary" className="mt-5">
                Ativo: R$ {parseFloat(globalConversionFactor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Este valor será aplicado a todas as cores de todos os artigos na calculadora de custos.
          </p>
        </CardContent>
      </Card>

      {/* Tinturaria Selection */}
      <Card className="bg-card/95 border-military/30">
        <CardHeader>
          <CardTitle className="font-poppins text-xl text-card-foreground flex items-center gap-2">
            <Factory className="w-5 h-5 text-accent" />
            Selecionar Tinturaria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label>Tinturaria</Label>
              <Select value={selectedTinturariaId} onValueChange={(value) => {
                setSelectedTinturariaId(value);
                setSelectedProductId('');
                setSelectedGroupId('');
              }}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Escolha uma tinturaria" />
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
            
            <Dialog open={addTinturariaOpen} onOpenChange={setAddTinturariaOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  <Plus className="w-4 h-4 mr-1" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Tinturaria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Nome da Tinturaria</Label>
                    <Input
                      placeholder="Ex: Tinturaria Central"
                      value={newTinturariaName}
                      onChange={(e) => setNewTinturariaName(e.target.value)}
                      className="bg-background border-input"
                    />
                  </div>
                  <Button onClick={handleAddTinturaria} className="w-full bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Tinturaria
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {selectedTinturariaId && (
              <Button 
                variant="outline" 
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleDeleteTinturaria}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Fator de Conversão */}
          {selectedTinturariaId && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label className="text-card-foreground">Fator de Conversão (R$)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Valor descontado ao custo de cada cor
                  </p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={selectedTinturaria?.conversion_factor || ''}
                    onChange={async (e) => {
                      const value = parseFloat(e.target.value) || 0;
                      const { error } = await supabase
                        .from('tinturarias')
                        .update({ conversion_factor: value })
                        .eq('id', selectedTinturariaId);
                      
                      if (error) {
                        toast({
                          variant: 'destructive',
                          title: 'Erro',
                          description: 'Erro ao atualizar fator de conversão.'
                        });
                      } else {
                        fetchTinturarias();
                      }
                    }}
                    className="bg-background border-input"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product/Group Selection and Cost Management */}
      {selectedTinturariaId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-card/95 border-military/30">
              <CardHeader>
                <CardTitle className="font-poppins text-xl text-card-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" />
                  Custos de Tinturaria - {selectedTinturaria?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selection Mode Tabs */}
                <Tabs value={selectionMode} onValueChange={(v) => {
                  setSelectionMode(v as 'product' | 'group');
                  setSelectedProductId('');
                  setSelectedGroupId('');
                }}>
                  <TabsList className="grid w-full grid-cols-2 bg-military/10">
                    <TabsTrigger value="product" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                      <Package className="w-4 h-4 mr-2" />
                      Por Artigo
                    </TabsTrigger>
                    <TabsTrigger value="group" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                      <Layers className="w-4 h-4 mr-2" />
                      Por Grupo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="product" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Selecione o Artigo/Produto</Label>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Escolha um artigo para gerenciar custos" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.code} - {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="group" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Selecione o Grupo de Artigos</Label>
                      <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Escolha um grupo para gerenciar custos em lote" />
                        </SelectTrigger>
                        <SelectContent>
                          {productGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedGroupId && (
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-accent">{groupProducts.length}</strong> artigos neste grupo. 
                          Alterações serão aplicadas a todos os artigos listados ao lado.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {hasSelection && (
                  <>
                    {/* Import and Add New Cost */}
                    <div className="p-4 bg-military/5 rounded-lg border border-military/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-card-foreground flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Novo Custo {selectionMode === 'group' && '(Para Todo o Grupo)'}
                        </h4>
                        {selectionMode === 'product' && selectedProductId && (
                          <DyeingCostsImport 
                            tinturariaId={selectedTinturariaId}
                            productId={selectedProductId}
                            onImportComplete={() => fetchDyeingCosts(selectedTinturariaId, [selectedProductId])}
                          />
                        )}
                      </div>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Nome da Cor</Label>
                          <Input
                            placeholder="Digite o nome da cor (ex: BRANCO)"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            className="bg-background border-input"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-xs">Custo (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={newCost}
                            onChange={(e) => setNewCost(e.target.value)}
                            className="bg-background border-input"
                          />
                        </div>
                        <Button 
                          onClick={handleAddCost}
                          className="bg-accent hover:bg-accent/90"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>

                    {/* Existing Costs */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-card-foreground">
                          Custos Cadastrados ({uniqueColors.length} cores)
                        </h4>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Filtrar por cor..."
                            value={searchColor}
                            onChange={(e) => setSearchColor(e.target.value)}
                            className="pl-9 w-48 bg-background border-input"
                          />
                        </div>
                      </div>

                      {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Carregando...
                        </div>
                      ) : filteredCosts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {uniqueColors.length === 0 
                            ? selectionMode === 'group' 
                              ? 'Nenhum custo cadastrado para este grupo nesta tinturaria.'
                              : 'Nenhum custo cadastrado para este artigo nesta tinturaria.'
                            : 'Nenhuma cor encontrada com este filtro.'}
                        </div>
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-military/5">
                                <TableHead>Cor</TableHead>
                                <TableHead className="text-right">Custo (R$)</TableHead>
                                <TableHead className="w-24 text-center">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredCosts.map((dc) => {
                                const fullCost = dyeingCosts.find(c => c.color_id === dc.id);
                                if (!fullCost) return null;
                                return (
                                  <TableRow key={dc.id}>
                                    <TableCell className="font-medium">{dc.name}</TableCell>
                                    <TableCell className="text-right">
                                      {editingId === fullCost.id ? (
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={editCost}
                                          onChange={(e) => setEditCost(e.target.value)}
                                          className="w-24 ml-auto bg-background border-input"
                                          autoFocus
                                        />
                                      ) : (
                                        <span>R$ {dc.cost.toFixed(2)}</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex justify-center gap-1">
                                        {editingId === fullCost.id ? (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleUpdateCost(fullCost.id)}
                                              className="h-8 w-8 text-accent hover:bg-accent/10"
                                            >
                                              <Save className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={cancelEditing}
                                              className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => startEditing(fullCost)}
                                              className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleDeleteCost(fullCost.id)}
                                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Group Products Sidebar - 1 column */}
          {selectionMode === 'group' && selectedGroupId && (
            <div className="lg:col-span-1">
              <Card className="bg-card/95 border-military/30 sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="font-poppins text-lg text-card-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent" />
                    Artigos do Grupo
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedGroup?.name}</p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {groupProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum artigo neste grupo.
                        </p>
                      ) : (
                        groupProducts.map((product) => (
                          <div 
                            key={product.id}
                            className="p-3 bg-military/5 rounded-lg border border-military/20 hover:border-accent/30 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0 bg-accent/10 text-accent border-accent/30">
                                {product.code}
                              </Badge>
                              <span className="text-sm text-card-foreground leading-tight">
                                {product.name}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
