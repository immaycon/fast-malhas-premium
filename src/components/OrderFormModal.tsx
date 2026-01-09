import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Plus, Minus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  code: string;
  name: string;
  composition: string | null;
  group_id: string | null;
}

interface Color {
  id: string;
  name: string;
}

interface SelectedColor {
  colorId: string;
  colorName: string;
  quantity: number;
}

interface OrderFormModalProps {
  children: React.ReactNode;
}

export const OrderFormModal = ({ children }: OrderFormModalProps) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form fields
  const [whatsapp, setWhatsapp] = useState("");
  const [fullName, setFullName] = useState("");
  const [cityUf, setCityUf] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [currentColorId, setCurrentColorId] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");

  // Determine if product is polyamide (210kg min) or polyester (240kg min)
  const isPolyamide = selectedProduct?.composition?.toLowerCase().includes("poliamida") || 
                      selectedProduct?.name?.toLowerCase().includes("poliamida");
  const minQuantity = isPolyamide ? 210 : 240;

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, code, name, composition, group_id")
      .eq("is_active", true)
      .order("code");

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }
    setProducts(data || []);
  };

  const fetchColorsForSelectedProductGroup = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("public-product-group-colors", {
        body: { productId },
      });

      console.log("Edge function response:", { data, error });

      if (error) {
        console.error("Error fetching filtered colors:", error);
        setColors([]);
        return;
      }

      // O resultado pode estar diretamente em data ou em data.colors
      const colorsArray = data?.colors || [];
      console.log("Colors parsed:", colorsArray);
      setColors(colorsArray);
    } catch (err) {
      console.error("Exception fetching colors:", err);
      setColors([]);
    }
  };

  // Atualiza as cores quando o produto é selecionado (mesmo filtro da calculadora, sem custos)
  useEffect(() => {
    if (selectedProduct) {
      fetchColorsForSelectedProductGroup(selectedProduct.id);
    } else {
      setColors([]);
    }
  }, [selectedProduct]);

  const handleAddColor = () => {
    if (!currentColorId || !currentQuantity) {
      toast({
        title: "Erro",
        description: "Selecione uma cor e informe a quantidade",
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(currentQuantity);
    if (qty < minQuantity) {
      toast({
        title: "Quantidade mínima não atingida",
        description: `A barca mínima para ${isPolyamide ? "poliamida" : "poliéster"} é de ${minQuantity}kg por cor`,
        variant: "destructive",
      });
      return;
    }

    const color = colors.find(c => c.id === currentColorId);
    if (!color) return;

    // Check if color already added
    if (selectedColors.some(sc => sc.colorId === currentColorId)) {
      toast({
        title: "Cor já adicionada",
        description: "Esta cor já foi adicionada ao pedido",
        variant: "destructive",
      });
      return;
    }

    setSelectedColors([...selectedColors, {
      colorId: currentColorId,
      colorName: color.name,
      quantity: qty,
    }]);
    setCurrentColorId("");
    setCurrentQuantity("");
  };

  const handleRemoveColor = (colorId: string) => {
    setSelectedColors(selectedColors.filter(sc => sc.colorId !== colorId));
  };

  const handleSubmit = () => {
    // Validate all required fields
    if (!whatsapp.trim() || !fullName.trim() || !cityUf.trim() || !companyName.trim() || !customerType || !selectedProduct || selectedColors.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos e adicione pelo menos uma cor",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Build WhatsApp message
    const colorsList = selectedColors.map(sc => `  - ${sc.colorName}: ${sc.quantity}kg`).join("\n");
    const totalKg = selectedColors.reduce((acc, sc) => acc + sc.quantity, 0);

    const message = `*NOVO PEDIDO - FAST MALHAS*

*Dados do Cliente:*
Nome: ${fullName}
WhatsApp: ${whatsapp}
Empresa: ${companyName}
Cidade/UF: ${cityUf}
Tipo: ${customerType === "atacadista" ? "Atacadista de Malha" : "Confeccao"}

*Pedido:*
Artigo: ${selectedProduct.code} - ${selectedProduct.name}
${selectedProduct.composition ? `Composicao: ${selectedProduct.composition}` : ""}

*Cores e Quantidades:*
${colorsList}

*Total: ${totalKg}kg*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5522998833821?text=${encodedMessage}`, "_blank");

    setLoading(false);
    setOpen(false);
    resetForm();

    toast({
      title: "Pedido enviado!",
      description: "Você será redirecionado para o WhatsApp",
    });
  };

  const resetForm = () => {
    setWhatsapp("");
    setFullName("");
    setCityUf("");
    setCompanyName("");
    setCustomerType("");
    setSelectedProduct(null);
    setSelectedColors([]);
    setCurrentColorId("");
    setCurrentQuantity("");
  };

  const formatPhone = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-poppins text-2xl text-foreground">
            Faça seu Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-lg text-foreground border-b border-border pb-2">
              Dados do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-background border-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-foreground">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  placeholder="(XX) XXXXX-XXXX"
                  maxLength={16}
                  className="bg-background border-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-foreground">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nome da sua empresa"
                  className="bg-background border-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cityUf" className="text-foreground">Cidade/UF *</Label>
                <Input
                  id="cityUf"
                  value={cityUf}
                  onChange={(e) => setCityUf(e.target.value)}
                  placeholder="Ex: Nova Friburgo/RJ"
                  className="bg-background border-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Tipo de Cliente *</Label>
              <Select value={customerType} onValueChange={setCustomerType}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="atacadista">Atacadista de Malha</SelectItem>
                  <SelectItem value="confeccao">Confecção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-lg text-foreground border-b border-border pb-2">
              Seleção do Artigo
            </h3>
            
            <div className="space-y-2">
              <Label className="text-foreground">Artigo *</Label>
              <Select 
                value={selectedProduct?.id || ""} 
                onValueChange={(value) => {
                  const product = products.find(p => p.id === value);
                  setSelectedProduct(product || null);
                  setSelectedColors([]); // Reset colors when product changes
                }}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecione um artigo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-[100] max-h-[40vh]" position="popper" sideOffset={4}>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Composição:</strong> {selectedProduct.composition || "Não especificada"}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">
                    Barca mínima: <strong>{minQuantity}kg por cor</strong> ({isPolyamide ? "Poliamida" : "Poliéster"})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Color Selection */}
          {selectedProduct && (
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-lg text-foreground border-b border-border pb-2">
                Cores e Quantidades
              </h3>

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-foreground">Cor</Label>
                  <Select value={currentColorId} onValueChange={setCurrentColorId}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-[100] max-h-[40vh]" position="popper" sideOffset={4}>
                      {colors.map((color) => (
                        <SelectItem 
                          key={color.id} 
                          value={color.id}
                          disabled={selectedColors.some(sc => sc.colorId === color.id)}
                        >
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-32 space-y-2">
                  <Label className="text-foreground">Qtd (kg)</Label>
                  <Input
                    type="number"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                    placeholder={`Mín: ${minQuantity}`}
                    min={minQuantity}
                    className="bg-background border-input"
                  />
                </div>
                
                <Button
                  type="button"
                  onClick={handleAddColor}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Colors List */}
              {selectedColors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground">Cores adicionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((sc) => (
                      <Badge 
                        key={sc.colorId} 
                        variant="secondary"
                        className="flex items-center gap-2 py-1.5 px-3"
                      >
                        <span>{sc.colorName}: {sc.quantity}kg</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(sc.colorId)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total: <strong>{selectedColors.reduce((acc, sc) => acc + sc.quantity, 0)}kg</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-poppins font-bold py-6 text-lg"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Enviar Pedido via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
