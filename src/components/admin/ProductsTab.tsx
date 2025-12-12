import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search, Edit2, Save, X, FileDown, CheckSquare, Square, Lock, Unlock } from 'lucide-react';
import { generateProductsPDF } from './ProductsPDF';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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

const EDIT_PASSWORD = '151127';

export const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingEditProduct, setPendingEditProduct] = useState<Product | null>(null);
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

  const handleEditClick = (product: Product) => {
    if (isUnlocked) {
      startEditing(product);
    } else {
      setPendingEditProduct(product);
      setShowPasswordDialog(true);
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditData({
      efficiency_factor: product.efficiency_factor,
      weaving_cost: product.weaving_cost
    });
  };

  const handlePasswordSubmit = () => {
    if (password === EDIT_PASSWORD) {
      setIsUnlocked(true);
      setShowPasswordDialog(false);
      setPassword('');
      if (pendingEditProduct) {
        startEditing(pendingEditProduct);
        setPendingEditProduct(null);
      }
      toast({
        title: 'Desbloqueado!',
        description: 'Você pode editar os produtos agora.'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Senha incorreta',
        description: 'A senha informada está incorreta.'
      });
      setPassword('');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setEditingId(null);
    setEditData({});
    toast({
      title: 'Bloqueado',
      description: 'Edição de produtos bloqueada.'
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

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleExportPDF = async (exportAll: boolean) => {
    setGeneratingPDF(true);
    try {
      const productsToExport = exportAll 
        ? filteredProducts 
        : filteredProducts.filter(p => selectedIds.has(p.id));
      
      if (productsToExport.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Atenção',
          description: 'Selecione pelo menos um produto para exportar.'
        });
        return;
      }

      await generateProductsPDF(
        productsToExport,
        exportAll ? 'Relação Completa de Artigos' : `Artigos Selecionados (${productsToExport.length})`
      );

      toast({
        title: 'PDF Gerado!',
        description: `Exportados ${productsToExport.length} artigos.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao gerar PDF.'
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return <div className="text-cream text-center py-8">Carregando...</div>;
  }

  const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;

  return (
    <>
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Senha de Edição
            </DialogTitle>
            <DialogDescription>
              Digite a senha para desbloquear a edição de produtos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              type="password"
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowPasswordDialog(false);
                setPassword('');
                setPendingEditProduct(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handlePasswordSubmit} className="bg-accent hover:bg-accent/90">
                Desbloquear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-card/95 border-military/30">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="font-poppins text-xl text-card-foreground">
              Produtos ({products.length})
            </CardTitle>
            {isUnlocked ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLock}
                className="text-green-500 hover:text-green-400"
              >
                <Unlock className="w-4 h-4 mr-1" />
                Desbloqueado
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Bloqueado
              </span>
            )}
          </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportPDF(true)}
              disabled={generatingPDF}
              className="flex-1 sm:flex-none"
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF Todos
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleExportPDF(false)}
              disabled={generatingPDF || selectedIds.size === 0}
              className="flex-1 sm:flex-none bg-accent hover:bg-accent/90"
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF Selecionados ({selectedIds.size})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-military/30">
                <th className="text-left py-3 px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={toggleSelectAll}
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-accent" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </th>
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
                  <td className="py-3 px-2">
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </td>
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
                          className={`h-8 w-8 ${isUnlocked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground hover:text-card-foreground'}`}
                          onClick={() => handleEditClick(product)}
                        >
                          {isUnlocked ? <Edit2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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
    </>
  );
};
