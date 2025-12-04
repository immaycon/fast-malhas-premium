import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Palette, Plus, Trash2, Save, Search, Edit2, X } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
}

interface DyeingCost {
  id: string;
  product_id: string;
  color_id: string;
  cost: number;
  color_name?: string;
}

export const DyeingCostsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [dyeingCosts, setDyeingCosts] = useState<DyeingCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchColor, setSearchColor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState('');
  
  // For adding new costs
  const [newColorId, setNewColorId] = useState('');
  const [newCost, setNewCost] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchColors();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchDyeingCosts(selectedProductId);
    } else {
      setDyeingCosts([]);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, code, name')
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

  const fetchDyeingCosts = async (productId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dyeing_costs')
      .select('id, product_id, color_id, cost, colors(name)')
      .eq('product_id', productId)
      .order('cost');
    
    if (!error && data) {
      const costs: DyeingCost[] = data.map((dc: any) => ({
        id: dc.id,
        product_id: dc.product_id,
        color_id: dc.color_id,
        cost: dc.cost,
        color_name: dc.colors?.name
      }));
      setDyeingCosts(costs);
    }
    setLoading(false);
  };

  const handleAddCost = async () => {
    if (!selectedProductId || !newColorId || !newCost) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos.'
      });
      return;
    }

    const cost = parseFloat(newCost);
    if (isNaN(cost) || cost <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Custo inválido.'
      });
      return;
    }

    // Check if already exists
    const exists = dyeingCosts.find(dc => dc.color_id === newColorId);
    if (exists) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Esta cor já possui custo cadastrado para este artigo.'
      });
      return;
    }

    const { error } = await supabase
      .from('dyeing_costs')
      .insert({
        product_id: selectedProductId,
        color_id: newColorId,
        cost
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao adicionar custo.'
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Custo de tinturaria adicionado.'
      });
      setNewColorId('');
      setNewCost('');
      fetchDyeingCosts(selectedProductId);
    }
  };

  const handleUpdateCost = async (id: string) => {
    const cost = parseFloat(editCost);
    if (isNaN(cost) || cost <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Custo inválido.'
      });
      return;
    }

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
      fetchDyeingCosts(selectedProductId);
    }
  };

  const handleDeleteCost = async (id: string) => {
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
      fetchDyeingCosts(selectedProductId);
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

  const filteredCosts = dyeingCosts.filter(dc => 
    !searchColor || dc.color_name?.toLowerCase().includes(searchColor.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  // Get colors not yet added
  const availableColors = colors.filter(c => 
    !dyeingCosts.find(dc => dc.color_id === c.id)
  );

  return (
    <Card className="bg-card/95 border-military/30">
      <CardHeader>
        <CardTitle className="font-poppins text-xl text-card-foreground flex items-center gap-2">
          <Palette className="w-5 h-5 text-accent" />
          Custos de Tinturaria por Artigo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selection */}
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

        {selectedProductId && (
          <>
            {/* Add New Cost */}
            <div className="p-4 bg-military/5 rounded-lg border border-military/20 space-y-4">
              <h4 className="font-medium text-card-foreground flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Novo Custo
              </h4>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Cor</Label>
                  <Select value={newColorId} onValueChange={setNewColorId}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Custos Cadastrados ({dyeingCosts.length} cores)
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
                  {dyeingCosts.length === 0 
                    ? 'Nenhum custo cadastrado para este artigo.'
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
                      {filteredCosts.map((dc) => (
                        <TableRow key={dc.id}>
                          <TableCell className="font-medium">{dc.color_name}</TableCell>
                          <TableCell className="text-right">
                            {editingId === dc.id ? (
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
                              {editingId === dc.id ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleUpdateCost(dc.id)}
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
                                    onClick={() => startEditing(dc)}
                                    className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCost(dc.id)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
