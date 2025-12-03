import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Color {
  id: string;
  name: string;
  hex_code: string | null;
  category: string | null;
  scale: string | null;
}

export const ColorsTab = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', scale: '', category: '' });
  const { toast } = useToast();

  const fetchColors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .order('name');

    if (!error && data) {
      setColors(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const filteredColors = colors.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.scale?.toLowerCase().includes(search.toLowerCase())
  );

  const addColor = async () => {
    if (!newColor.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nome da cor é obrigatório.'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('colors')
        .insert({
          name: newColor.name.toUpperCase(),
          scale: newColor.scale || null,
          category: newColor.category || null
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Cor adicionada com sucesso.'
      });

      setNewColor({ name: '', scale: '', category: '' });
      setDialogOpen(false);
      fetchColors();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message?.includes('duplicate') 
          ? 'Esta cor já existe.' 
          : 'Erro ao adicionar cor.'
      });
    }
  };

  if (loading) {
    return <div className="text-cream text-center py-8">Carregando...</div>;
  }

  // Group colors by scale
  const groupedColors: Record<string, Color[]> = {};
  filteredColors.forEach(color => {
    const scale = color.scale || 'Outros';
    if (!groupedColors[scale]) {
      groupedColors[scale] = [];
    }
    groupedColors[scale].push(color);
  });

  return (
    <Card className="bg-card/95 border-military/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-poppins text-xl text-card-foreground">
          Cartela de Cores ({colors.length})
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-input"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-military/30">
              <DialogHeader>
                <DialogTitle className="font-poppins text-card-foreground">Nova Cor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Nome da Cor *</Label>
                  <Input
                    value={newColor.name}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    placeholder="Ex: AZUL ROYAL"
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Escala de Cor</Label>
                  <Input
                    value={newColor.scale}
                    onChange={(e) => setNewColor({ ...newColor, scale: e.target.value })}
                    placeholder="Ex: Azul, Vermelho, Rosa..."
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Categoria</Label>
                  <Input
                    value={newColor.category}
                    onChange={(e) => setNewColor({ ...newColor, category: e.target.value })}
                    placeholder="Ex: Normal, Especial, Programável"
                    className="bg-background border-input"
                  />
                </div>
                <Button 
                  onClick={addColor}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Adicionar Cor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedColors).sort().map(([scale, scaleColors]) => (
            <div key={scale}>
              <h3 className="font-poppins font-bold text-card-foreground mb-3 text-sm uppercase tracking-wide">
                {scale} ({scaleColors.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {scaleColors.map((color) => (
                  <div
                    key={color.id}
                    className="p-3 bg-background/50 rounded-lg border border-military/20 text-center hover:border-accent/50 transition-colors"
                  >
                    <div 
                      className="w-full h-10 rounded mb-2"
                      style={{ 
                        backgroundColor: color.hex_code || getColorHint(color.name, color.scale)
                      }}
                    />
                    <p className="text-xs font-medium text-card-foreground truncate" title={color.name}>
                      {color.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to generate color hints based on name/scale
function getColorHint(name: string, scale: string | null): string {
  const colorMap: Record<string, string> = {
    'Branco': '#FFFFFF',
    'Preto': '#1a1a1a',
    'Azul': '#2563eb',
    'Vermelho': '#dc2626',
    'Rosa': '#ec4899',
    'Verde': '#16a34a',
    'Amarelo': '#eab308',
    'Laranja': '#ea580c',
    'Marrom': '#78350f',
    'Cinza': '#6b7280',
    'Bege': '#d4a574',
  };

  const lowerName = name.toLowerCase();
  const lowerScale = scale?.toLowerCase() || '';

  if (lowerName.includes('branco') || lowerName === 'branco') return '#FFFFFF';
  if (lowerName.includes('preto') || lowerName === 'preto') return '#1a1a1a';
  
  return colorMap[scale || ''] || '#9ca3af';
}
