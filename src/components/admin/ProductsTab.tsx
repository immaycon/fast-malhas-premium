import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Edit2, Save, X } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  composition: string | null;
  weight_gsm: number | null;
  width_cm: number | null;
  yield_m_kg: number | null;
  efficiency_factor: number;
  weaving_cost: number;
  is_active: boolean;
}

export const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('code');

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditData({
      efficiency_factor: product.efficiency_factor,
      weaving_cost: product.weaving_cost
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          efficiency_factor: editData.efficiency_factor,
          weaving_cost: editData.weaving_cost
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Produto atualizado com sucesso.'
      });

      setEditingId(null);
      setEditData({});
      fetchProducts();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar produto.'
      });
    }
  };

  if (loading) {
    return <div className="text-cream text-center py-8">Carregando...</div>;
  }

  return (
    <Card className="bg-card/95 border-military/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-poppins text-xl text-card-foreground">
          Produtos ({products.length})
        </CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background border-input"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-military/30">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Código</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Nome</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Composição</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Gram.</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Larg.</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Rend.</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">FA %</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Tecelagem</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-military/10 hover:bg-military/5">
                  <td className="py-3 px-2 font-medium text-card-foreground">{product.code}</td>
                  <td className="py-3 px-2 text-card-foreground max-w-xs truncate">{product.name}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs max-w-xs truncate">
                    {product.composition}
                  </td>
                  <td className="py-3 px-2 text-center text-card-foreground">{product.weight_gsm}</td>
                  <td className="py-3 px-2 text-center text-card-foreground">{product.width_cm}</td>
                  <td className="py-3 px-2 text-center text-card-foreground">{product.yield_m_kg}</td>
                  
                  {editingId === product.id ? (
                    <>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.efficiency_factor || ''}
                          onChange={(e) => setEditData({ ...editData, efficiency_factor: parseFloat(e.target.value) })}
                          className="w-20 h-8 text-center bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.weaving_cost || ''}
                          onChange={(e) => setEditData({ ...editData, weaving_cost: parseFloat(e.target.value) })}
                          className="w-20 h-8 text-center bg-background"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-green-500 hover:text-green-400"
                            onClick={() => saveProduct(product.id)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            onClick={cancelEditing}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-2 text-center text-card-foreground">
                        {(product.efficiency_factor * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-2 text-center text-card-foreground">
                        R$ {product.weaving_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-accent hover:text-accent/80"
                          onClick={() => startEditing(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
