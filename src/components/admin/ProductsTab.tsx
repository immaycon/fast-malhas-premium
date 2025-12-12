import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search, Edit2, Save, X, FileDown, CheckSquare, Square, Lock, Unlock, Trash2, Plus } from 'lucide-react';
import { generateProductsPDF } from './ProductsPDF';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    composition: '',
    weight_gsm: '',
    width_cm: '',
    yield_m_kg: '',
    efficiency_factor: '0.93',
    weaving_cost: '3.75'
  });
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

  const handleUnlockForAction = (callback: () => void) => {
    if (isUnlocked) {
      callback();
    } else {
      setShowPasswordDialog(true);
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditData({
      code: product.code,
      name: product.name,
      composition: product.composition,
      weight_gsm: product.weight_gsm,
      width_cm: product.width_cm,
      yield_m_kg: product.yield_m_kg,
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
        description: 'Você pode editar, adicionar e excluir produtos agora.'
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
          code: editData.code,
          name: editData.name,
          composition: editData.composition,
          weight_gsm: editData.weight_gsm ? Number(editData.weight_gsm) : null,
          width_cm: editData.width_cm ? Number(editData.width_cm) : null,
          yield_m_kg: editData.yield_m_kg ? Number(editData.yield_m_kg) : null,
          efficiency_factor: Number(editData.efficiency_factor),
          weaving_cost: Number(editData.weaving_cost)
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

  const handleDeleteClick = (product: Product) => {
    if (isUnlocked) {
      setProductToDelete(product);
      setShowDeleteDialog(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Bloqueado',
        description: 'Digite a senha para desbloquear a edição.'
      });
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      // First delete related product_yarns
      await supabase
        .from('product_yarns')
        .delete()
        .eq('product_id', productToDelete.id);

      // Then delete related dyeing_costs
      await supabase
        .from('dyeing_costs')
        .delete()
        .eq('product_id', productToDelete.id);

      // Finally delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      toast({
        title: 'Excluído!',
        description: `Produto "${productToDelete.name}" foi removido.`
      });

      setShowDeleteDialog(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao excluir produto.'
      });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.code.trim() || !newProduct.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Código e nome são obrigatórios.'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          code: newProduct.code.trim(),
          name: newProduct.name.trim(),
          composition: newProduct.composition.trim() || null,
          weight_gsm: newProduct.weight_gsm ? parseInt(newProduct.weight_gsm) : null,
          width_cm: newProduct.width_cm ? parseFloat(newProduct.width_cm) : null,
          yield_m_kg: newProduct.yield_m_kg ? parseFloat(newProduct.yield_m_kg) : null,
          efficiency_factor: parseFloat(newProduct.efficiency_factor) || 0.93,
          weaving_cost: parseFloat(newProduct.weaving_cost) || 3.75,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Produto adicionado!',
        description: `"${newProduct.name}" foi cadastrado. Adicione os custos de tinturaria na aba correspondente.`
      });

      setShowAddDialog(false);
      setNewProduct({
        code: '',
        name: '',
        composition: '',
        weight_gsm: '',
        width_cm: '',
        yield_m_kg: '',
        efficiency_factor: '0.93',
        weaving_cost: '3.75'
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao adicionar produto.'
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
      {/* Password Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{productToDelete?.code} - {productToDelete?.name}"? 
              Esta ação também removerá todos os custos de tinturaria e composições de fios associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Adicionar Novo Produto
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do novo produto. Após adicionar, cadastre os custos de tinturaria na aba correspondente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código *</label>
                <Input
                  placeholder="Ex: 001-PEDRINI"
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  placeholder="Ex: ROMANTIC LISA"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Composição</label>
              <Input
                placeholder="Ex: 94% POLIESTER - 6% ELASTANO"
                value={newProduct.composition}
                onChange={(e) => setNewProduct({ ...newProduct, composition: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gramatura (g/m²)</label>
                <Input
                  type="number"
                  placeholder="180"
                  value={newProduct.weight_gsm}
                  onChange={(e) => setNewProduct({ ...newProduct, weight_gsm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Largura (cm)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1.65"
                  value={newProduct.width_cm}
                  onChange={(e) => setNewProduct({ ...newProduct, width_cm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rendimento (m/kg)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="3.40"
                  value={newProduct.yield_m_kg}
                  onChange={(e) => setNewProduct({ ...newProduct, yield_m_kg: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fator Aproveitamento (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.93"
                  value={newProduct.efficiency_factor}
                  onChange={(e) => setNewProduct({ ...newProduct, efficiency_factor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tecelagem (R$/kg)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="3.75"
                  value={newProduct.weaving_cost}
                  onChange={(e) => setNewProduct({ ...newProduct, weaving_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProduct} className="bg-accent hover:bg-accent/90">
                Adicionar Produto
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                className="text-muted-foreground hover:text-card-foreground"
              >
                <Lock className="w-4 h-4 mr-1" />
                Bloqueado
              </Button>
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
          <div className="flex gap-2 flex-wrap">
            {isUnlocked && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            )}
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
                  
                  {editingId === product.id ? (
                    <>
                      <td className="py-3 px-2">
                        <Input
                          value={editData.code || ''}
                          onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                          className="w-28 h-8 text-xs bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-40 h-8 text-xs bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          value={editData.composition || ''}
                          onChange={(e) => setEditData({ ...editData, composition: e.target.value })}
                          className="w-48 h-8 text-xs bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          value={editData.weight_gsm || ''}
                          onChange={(e) => setEditData({ ...editData, weight_gsm: parseInt(e.target.value) || null })}
                          className="w-16 h-8 text-center text-xs bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.width_cm || ''}
                          onChange={(e) => setEditData({ ...editData, width_cm: parseFloat(e.target.value) || null })}
                          className="w-16 h-8 text-center text-xs bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.yield_m_kg || ''}
                          onChange={(e) => setEditData({ ...editData, yield_m_kg: parseFloat(e.target.value) || null })}
                          className="w-16 h-8 text-center text-xs bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.efficiency_factor || ''}
                          onChange={(e) => setEditData({ ...editData, efficiency_factor: parseFloat(e.target.value) })}
                          className="w-16 h-8 text-center text-xs bg-background"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.weaving_cost || ''}
                          onChange={(e) => setEditData({ ...editData, weaving_cost: parseFloat(e.target.value) })}
                          className="w-16 h-8 text-center text-xs bg-background"
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
                      <td className="py-3 px-2 font-medium text-card-foreground">{product.code}</td>
                      <td className="py-3 px-2 text-card-foreground max-w-xs truncate">{product.name}</td>
                      <td className="py-3 px-2 text-muted-foreground text-xs max-w-xs truncate">
                        {product.composition}
                      </td>
                      <td className="py-3 px-2 text-center text-card-foreground">{product.weight_gsm}</td>
                      <td className="py-3 px-2 text-center text-card-foreground">{product.width_cm}</td>
                      <td className="py-3 px-2 text-center text-card-foreground">{product.yield_m_kg}</td>
                      <td className="py-3 px-2 text-center text-card-foreground">
                        {(product.efficiency_factor * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-2 text-center text-card-foreground">
                        R$ {product.weaving_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className={`h-8 w-8 ${isUnlocked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground hover:text-card-foreground'}`}
                            onClick={() => handleEditClick(product)}
                          >
                            {isUnlocked ? <Edit2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </Button>
                          {isUnlocked && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive hover:text-destructive/80"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
