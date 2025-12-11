import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import * as XLSX from 'xlsx';

interface ImportResult {
  productCode: string;
  productName: string;
  colorsImported: number;
  errors: string[];
}

interface ParsedCost {
  colorName: string;
  cost: number;
}

interface ParsedSheet {
  sheetName: string;
  productCode: string;
  productName: string;
  costs: ParsedCost[];
}

export const DyeingCostsImport = ({ onImportComplete }: { onImportComplete?: () => void }) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseSheetData = (sheet: XLSX.WorkSheet, sheetName: string): ParsedSheet | null => {
    // Skip summary or instruction sheets
    const skipPatterns = ['RESUMO', 'INSTRUC', 'ÍNDICE', 'INDEX', 'MENU', 'CAPA'];
    if (skipPatterns.some(p => sheetName.toUpperCase().includes(p))) {
      return null;
    }

    // Parse sheet name to extract product code and name
    // Format examples: "001-PEDRINI", "001-AJ", "401-PEDRINI LIGHT"
    const sheetNameClean = sheetName.trim();
    const codeMatch = sheetNameClean.match(/^(\d+)/);
    if (!codeMatch) return null;
    
    const productCode = sheetNameClean;
    const productName = sheetNameClean;
    
    // Convert sheet to JSON to find color costs
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    const costs: ParsedCost[] = [];
    
    // Look for color-cost patterns in the data
    // Typically: Column A = Color name, Column with R$ or cost values
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) continue;
      
      // Try to find color name and cost in the row
      // Color names are typically text, costs are numbers
      let colorName: string | null = null;
      let cost: number | null = null;
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        
        if (typeof cell === 'string' && cell.trim().length > 0) {
          const cellUpper = cell.toUpperCase().trim();
          // Skip header cells and non-color entries
          if (cellUpper === 'COR' || cellUpper === 'CORES' || cellUpper === 'NOME' ||
              cellUpper === 'CUSTO' || cellUpper === 'VALOR' || cellUpper === 'R$' ||
              cellUpper === 'PREÇO' || cellUpper === 'TOTAL' || cellUpper === 'MÉDIA' ||
              cellUpper.includes('TINTURARIA') || cellUpper.includes('ARTIGO') ||
              cellUpper.includes('FICHA') || cellUpper.includes('TÉCNICA') ||
              cellUpper.includes('COMPOSIÇÃO') || cellUpper.includes('RENDIMENTO') ||
              cellUpper.includes('GRAMATURA') || cellUpper.includes('LARGURA') ||
              cellUpper.includes('FATOR') || cellUpper.includes('TECELAGEM') ||
              cellUpper.includes('POLIÉSTER') || cellUpper.includes('POLIAMIDA') ||
              cellUpper.includes('ELASTANO') || cellUpper.includes('FIO') ||
              cellUpper.includes('CUSTO FINAL') || cellUpper.includes('LUCRO') ||
              cellUpper.includes('MARGEM') || cellUpper.includes('%') ||
              cellUpper.length > 30) {
            continue;
          }
          
          // This could be a color name
          if (!colorName && cellUpper.length >= 3 && cellUpper.length <= 25) {
            colorName = cell.trim().toUpperCase();
          }
        } else if (typeof cell === 'number' && cell > 0 && cell < 100) {
          // This could be a cost (typically between 0.01 and 99.99)
          if (!cost && colorName) {
            cost = cell;
          }
        }
      }
      
      if (colorName && cost && cost > 0) {
        // Avoid duplicate colors
        if (!costs.find(c => c.colorName === colorName)) {
          costs.push({ colorName, cost });
        }
      }
    }
    
    if (costs.length === 0) return null;
    
    return {
      sheetName,
      productCode,
      productName,
      costs
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResults([]);
    setShowResults(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheetNames = workbook.SheetNames;
      const totalSheets = sheetNames.length;
      const importResults: ImportResult[] = [];
      
      // Fetch all products and colors for matching
      const { data: products } = await supabase
        .from('products')
        .select('id, code, name')
        .eq('is_active', true);
      
      const { data: colors } = await supabase
        .from('colors')
        .select('id, name');
      
      if (!products || !colors) {
        throw new Error('Erro ao carregar produtos ou cores do banco de dados');
      }
      
      // Create lookup maps
      const productMap = new Map<string, { id: string; code: string; name: string }>();
      products.forEach(p => {
        // Map by code variations
        productMap.set(p.code.toUpperCase(), p);
        productMap.set(p.name.toUpperCase(), p);
        // Also try just the numeric part
        const numericCode = p.code.match(/^\d+/)?.[0];
        if (numericCode) {
          productMap.set(`${numericCode}-${p.name.toUpperCase()}`, p);
        }
      });
      
      const colorMap = new Map<string, string>();
      colors.forEach(c => {
        colorMap.set(c.name.toUpperCase().trim(), c.id);
      });
      
      // Process each sheet
      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i];
        setProgress(Math.round(((i + 1) / totalSheets) * 100));
        
        const sheet = workbook.Sheets[sheetName];
        const parsed = parseSheetData(sheet, sheetName);
        
        if (!parsed || parsed.costs.length === 0) continue;
        
        // Find matching product
        let product = productMap.get(parsed.productCode.toUpperCase());
        if (!product) {
          // Try variations
          const variations = [
            parsed.productCode.toUpperCase(),
            parsed.sheetName.toUpperCase(),
            parsed.productCode.replace(/\s+/g, '-').toUpperCase()
          ];
          for (const v of variations) {
            product = productMap.get(v);
            if (product) break;
          }
        }
        
        if (!product) {
          // Try partial match
          for (const [key, val] of productMap.entries()) {
            if (parsed.sheetName.toUpperCase().includes(key) || 
                key.includes(parsed.sheetName.toUpperCase().split('-')[0])) {
              product = val;
              break;
            }
          }
        }
        
        if (!product) {
          importResults.push({
            productCode: parsed.productCode,
            productName: parsed.productName,
            colorsImported: 0,
            errors: [`Produto não encontrado no banco de dados: ${parsed.sheetName}`]
          });
          continue;
        }
        
        const result: ImportResult = {
          productCode: product.code,
          productName: product.name,
          colorsImported: 0,
          errors: []
        };
        
        // Process each color cost
        for (const costData of parsed.costs) {
          const colorId = colorMap.get(costData.colorName);
          
          if (!colorId) {
            result.errors.push(`Cor não encontrada: ${costData.colorName}`);
            continue;
          }
          
          // Check if cost already exists
          const { data: existing } = await supabase
            .from('dyeing_costs')
            .select('id')
            .eq('product_id', product.id)
            .eq('color_id', colorId)
            .maybeSingle();
          
          if (existing) {
            // Update existing
            const { error } = await supabase
              .from('dyeing_costs')
              .update({ cost: costData.cost })
              .eq('id', existing.id);
            
            if (!error) {
              result.colorsImported++;
            } else {
              result.errors.push(`Erro ao atualizar ${costData.colorName}: ${error.message}`);
            }
          } else {
            // Insert new
            const { error } = await supabase
              .from('dyeing_costs')
              .insert({
                product_id: product.id,
                color_id: colorId,
                cost: costData.cost
              });
            
            if (!error) {
              result.colorsImported++;
            } else {
              result.errors.push(`Erro ao inserir ${costData.colorName}: ${error.message}`);
            }
          }
        }
        
        if (result.colorsImported > 0 || result.errors.length > 0) {
          importResults.push(result);
        }
      }
      
      setResults(importResults);
      setShowResults(true);
      
      const totalImported = importResults.reduce((sum, r) => sum + r.colorsImported, 0);
      const totalErrors = importResults.reduce((sum, r) => sum + r.errors.length, 0);
      
      toast({
        title: 'Importação Concluída',
        description: `${totalImported} custos importados. ${totalErrors > 0 ? `${totalErrors} erros.` : ''}`
      });
      
      if (onImportComplete) {
        onImportComplete();
      }
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na importação',
        description: error.message || 'Erro ao processar arquivo'
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const totalImported = results.reduce((sum, r) => sum + r.colorsImported, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  return (
    <Card className="bg-card/95 border-military/30">
      <CardHeader>
        <CardTitle className="font-poppins text-xl text-card-foreground flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-accent" />
          Importação em Massa de Custos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border-2 border-dashed border-military/30 rounded-lg text-center space-y-4 bg-military/5">
          <Upload className="w-12 h-12 mx-auto text-military/50" />
          <div>
            <p className="font-medium text-card-foreground">
              Selecione o arquivo CUSTOS_2025.xlsx
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              O sistema irá processar cada aba do arquivo e importar os custos de tinturaria
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={importing}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-accent hover:bg-accent/90"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </>
            )}
          </Button>
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processando planilhas...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-military/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">{totalImported} custos importados</span>
              </div>
              {totalErrors > 0 && (
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="w-5 h-5" />
                  <span>{totalErrors} erros</span>
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border ${
                    result.errors.length > 0 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">
                      {result.productCode} - {result.productName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {result.colorsImported} cores
                    </span>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-2 text-xs text-amber-600">
                      {result.errors.slice(0, 3).map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                      {result.errors.length > 3 && (
                        <div>... e mais {result.errors.length - 3} erros</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
