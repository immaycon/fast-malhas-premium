import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';

interface YarnType {
  id: string;
  name: string;
  unit: string;
}

interface YarnPrice {
  id: string;
  yarn_type_id: string;
  price: number;
  effective_date: string;
}

interface YarnPricesTabProps {
  isAdmin: boolean;
}

export const YarnPricesTab = ({ isAdmin }: YarnPricesTabProps) => {
  const [yarnTypes, setYarnTypes] = useState<YarnType[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: types, error: typesError } = await supabase
        .from('yarn_types')
        .select('*')
        .order('name');

      if (typesError) throw typesError;
      setYarnTypes(types || []);

      const today = new Date().toISOString().split('T')[0];
      const { data: pricesData, error: pricesError } = await supabase
        .from('yarn_prices')
        .select('*')
        .eq('effective_date', today);

      if (pricesError) throw pricesError;

      const pricesMap: Record<string, string> = {};
      pricesData?.forEach((p) => {
        pricesMap[p.yarn_type_id] = p.price.toString();
      });
      setPrices(pricesMap);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar dados.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePriceChange = (yarnTypeId: string, value: string) => {
    setPrices(prev => ({ ...prev, [yarnTypeId]: value }));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Acesso negado',
        description: 'Apenas administradores podem alterar preços.'
      });
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      for (const [yarnTypeId, priceStr] of Object.entries(prices)) {
        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) continue;

        const { error } = await supabase
          .from('yarn_prices')
          .upsert({
            yarn_type_id: yarnTypeId,
            price,
            effective_date: today
          }, {
            onConflict: 'yarn_type_id,effective_date'
          });

        if (error) throw error;
      }

      toast({
        title: 'Sucesso!',
        description: 'Preços atualizados com sucesso.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar preços.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-cream text-center py-8">Carregando...</div>;
  }

  // Separar FRETE dos outros fios
  const freightYarn = yarnTypes.find(y => y.name === 'FRETE');
  const regularYarns = yarnTypes.filter(y => y.name !== 'FRETE');
  const elastanos = regularYarns.filter(y => y.name.startsWith('Elastano'));
  const fios = regularYarns.filter(y => !y.name.startsWith('Elastano'));

  return (
    <Card className="bg-card/95 border-military/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-poppins text-xl text-card-foreground">
          Preços dos Fios e Frete (R$/KG)
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
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Data de referência: {new Date().toLocaleDateString('pt-BR')}
        </p>

        {/* Frete - Destacado */}
        {freightYarn && (
          <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/30">
            <h3 className="font-semibold text-card-foreground mb-3">Frete</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-card-foreground">
                  {freightYarn.name}
                </label>
                <p className="text-xs text-muted-foreground">{freightYarn.unit}</p>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={prices[freightYarn.id] || ''}
                  onChange={(e) => handlePriceChange(freightYarn.id, e.target.value)}
                  disabled={!isAdmin}
                  className="bg-background border-accent text-right"
                />
              </div>
            </div>
          </div>
        )}

        {/* Fios de Poliéster/Poliamida */}
        <div>
          <h3 className="font-semibold text-card-foreground mb-3">Fios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fios.map((yarn) => (
              <div 
                key={yarn.id} 
                className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-military/20"
              >
                <div className="flex-1">
                  <label className="text-sm font-medium text-card-foreground">
                    {yarn.name}
                  </label>
                  <p className="text-xs text-muted-foreground">{yarn.unit}</p>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={prices[yarn.id] || ''}
                    onChange={(e) => handlePriceChange(yarn.id, e.target.value)}
                    disabled={!isAdmin}
                    className="bg-background border-input text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Elastanos */}
        <div>
          <h3 className="font-semibold text-card-foreground mb-3">Elastanos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elastanos.map((yarn) => (
              <div 
                key={yarn.id} 
                className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-military/20"
              >
                <div className="flex-1">
                  <label className="text-sm font-medium text-card-foreground">
                    {yarn.name}
                  </label>
                  <p className="text-xs text-muted-foreground">{yarn.unit}</p>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={prices[yarn.id] || ''}
                    onChange={(e) => handlePriceChange(yarn.id, e.target.value)}
                    disabled={!isAdmin}
                    className="bg-background border-input text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
