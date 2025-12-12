import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Truck } from 'lucide-react';

interface FreightTabProps {
  isAdmin: boolean;
}

export const FreightTab = ({ isAdmin }: FreightTabProps) => {
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('freight_prices')
        .select('*')
        .eq('effective_date', today)
        .maybeSingle();

      if (error) throw error;
      setPrice(data?.price?.toString() || '');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar dados de frete.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Acesso negado',
        description: 'Apenas administradores podem alterar preços.'
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Por favor, insira um valor válido para o frete.'
      });
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('freight_prices')
        .upsert({
          price: priceValue,
          effective_date: today
        }, {
          onConflict: 'effective_date'
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Preço de frete atualizado com sucesso.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar preço de frete.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-cream text-center py-8">Carregando...</div>;
  }

  return (
    <Card className="bg-card/95 border-military/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-poppins text-xl text-card-foreground flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Custo de Frete (R$/KG)
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="border-military/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          {isAdmin && (
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={saving}
              className="bg-accent hover:bg-accent/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          Data de referência: {new Date().toLocaleDateString('pt-BR')}
        </p>
        
        <div className="max-w-md">
          <div className="flex items-center gap-4 p-6 bg-accent/10 rounded-lg border-2 border-accent/30">
            <div className="flex-1">
              <label className="text-lg font-medium text-card-foreground">
                Valor do Frete
              </label>
              <p className="text-sm text-muted-foreground">Custo por quilograma (KG)</p>
            </div>
            <div className="w-40">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!isAdmin}
                className="bg-background border-accent text-right text-lg font-semibold"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Este valor será utilizado no cálculo de custos dos artigos.
        </p>
      </CardContent>
    </Card>
  );
};
