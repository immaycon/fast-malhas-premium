import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DyeingCostsImportProps {
  tinturariaId: string;
  productId: string;
  onImportComplete: () => void;
}

interface ParsedColorCost {
  colorName: string;
  cost: number;
}

export const DyeingCostsImport = ({ tinturariaId, productId, onImportComplete }: DyeingCostsImportProps) => {
  const [open, setOpen] = useState(false);
  const [textData, setTextData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedColorCost[]>([]);
  const { toast } = useToast();

  const parseTextData = (text: string): ParsedColorCost[] => {
    const results: ParsedColorCost[] = [];
    const blocks = text.split(/\n\s*\n/); // Split by empty lines

    for (const block of blocks) {
      const lines = block.trim().split('\n').filter(line => line.trim());
      if (lines.length < 2) continue;

      // Find the header line (first line of the block) - color name is the last column
      const headerLine = lines[0];
      const headerParts = headerLine.split('\t').map(p => p.trim());
      const colorName = headerParts[headerParts.length - 1];

      if (!colorName || colorName === 'CUSTO' || colorName === 'VALOR' || colorName.includes('R$')) continue;

      // Find the Tinturaria line to get the cost
      for (const line of lines) {
        if (line.toLowerCase().startsWith('tinturaria')) {
          const parts = line.split('\t').map(p => p.trim());
          // CUSTO is usually the 5th column (index 4)
          const costStr = parts[4];
          if (costStr) {
            // Parse Brazilian currency format: R$7,62 -> 7.62
            const cleanCost = costStr
              .replace('R$', '')
              .replace(/\./g, '') // Remove thousands separator
              .replace(',', '.') // Convert decimal separator
              .trim();
            const cost = parseFloat(cleanCost);
            
            if (!isNaN(cost)) {
              results.push({
                colorName: colorName.trim(),
                cost: cost
              });
            }
          }
          break;
        }
      }
    }

    return results;
  };

  const handlePreview = () => {
    const parsed = parseTextData(textData);
    setParsedPreview(parsed);
    
    if (parsed.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhuma cor encontrada no texto. Verifique o formato.'
      });
    } else {
      toast({
        title: 'Sucesso',
        description: `${parsed.length} cores encontradas`
      });
    }
  };

  const handleImport = async () => {
    if (parsedPreview.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Primeiro visualize os dados antes de importar'
      });
      return;
    }

    setIsImporting(true);

    try {
      // First, get all existing colors
      const { data: existingColors, error: colorsError } = await supabase
        .from('colors')
        .select('id, name');

      if (colorsError) throw colorsError;

      const colorMap = new Map(existingColors?.map(c => [c.name.toLowerCase().trim(), c.id]) || []);

      let imported = 0;
      let created = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const item of parsedPreview) {
        const normalizedName = item.colorName.toLowerCase().trim();
        let colorId = colorMap.get(normalizedName);

        // If color doesn't exist, create it
        if (!colorId) {
          const { data: newColor, error: createError } = await supabase
            .from('colors')
            .insert({ name: item.colorName.toUpperCase().trim() })
            .select('id')
            .single();

          if (createError) {
            errors.push(`Cor "${item.colorName}": ${createError.message}`);
            skipped++;
            continue;
          }
          colorId = newColor.id;
          colorMap.set(normalizedName, colorId);
          created++;
        }

        // Check if dyeing cost already exists
        const { data: existingCost } = await supabase
          .from('dyeing_costs')
          .select('id')
          .eq('tinturaria_id', tinturariaId)
          .eq('product_id', productId)
          .eq('color_id', colorId)
          .maybeSingle();

        if (existingCost) {
          // Update existing
          const { error: updateError } = await supabase
            .from('dyeing_costs')
            .update({ cost: item.cost })
            .eq('id', existingCost.id);

          if (updateError) {
            errors.push(`Atualizar "${item.colorName}": ${updateError.message}`);
            skipped++;
            continue;
          }
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from('dyeing_costs')
            .insert({
              tinturaria_id: tinturariaId,
              product_id: productId,
              color_id: colorId,
              cost: item.cost
            });

          if (insertError) {
            errors.push(`Inserir "${item.colorName}": ${insertError.message}`);
            skipped++;
            continue;
          }
        }
        imported++;
      }

      if (errors.length > 0) {
        console.error('Erros na importação:', errors);
      }

      toast({
        title: 'Importação Concluída',
        description: `${imported} custos importados, ${created} cores criadas${skipped > 0 ? `, ${skipped} ignorados` : ''}`
      });
      setOpen(false);
      setTextData('');
      setParsedPreview([]);
      onImportComplete();
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao importar dados'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-accent text-accent hover:bg-accent/10">
          <Upload className="h-4 w-4" />
          Importar em Massa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Custos de Tinturaria em Massa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Cole o texto com os dados (formato da planilha)</Label>
            <Textarea
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              placeholder={`Cole aqui o texto no formato:

ROMANTIC	UN	APROVEIT. (%)	QTDADE	CUSTO	VALOR	BRANCO
Poliester	KG	0,93	0,94	R$15,00	R$15,16	R$29,65
Elastano 	KG	0,93	0,06	R$35,00	R$2,26	
Tecelagem	KG	0,93	1,00	R$3,75	R$4,03	
Tinturaria	KG	0,93	1,00	R$7,62	R$8,19	

ROMANTIC	UN	APROVEIT. (%)	QTDADE	CUSTO	VALOR	PRETO
...`}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="secondary" className="gap-2">
              <FileText className="h-4 w-4" />
              Visualizar Dados
            </Button>
          </div>

          {parsedPreview.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Prévia ({parsedPreview.length} cores)</h4>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cor</th>
                      <th className="text-right p-2">Custo (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="border-b border-muted">
                        <td className="p-2">{item.colorName}</td>
                        <td className="text-right p-2">R$ {item.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isImporting || parsedPreview.length === 0}
              className="bg-accent hover:bg-accent/90"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                `Importar ${parsedPreview.length} Cores`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
