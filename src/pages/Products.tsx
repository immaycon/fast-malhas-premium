import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, MessageCircle, X, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Import fabric texture images (fallbacks)
import fabricWhite from "@/assets/fabric-texture-white.jpg";
import fabricBlack from "@/assets/fabric-texture-black.jpg";
import fabricNavy from "@/assets/fabric-texture-navy.jpg";
import fabricCoral from "@/assets/fabric-texture-coral.jpg";
import fabricOlive from "@/assets/fabric-texture-olive.jpg";
import fabricBeige from "@/assets/fabric-texture-beige.jpg";

// Import real product images
import img001RomanticLisa from "@/assets/products/001_Romantic_Lisa.jpg";
import img003RomanticSlim from "@/assets/products/003_Romantic_Slim_Alto_Rendimento.jpg";
import img009RomanticEstampado from "@/assets/products/009_ROMANTIC_ESTAMPADO.jpeg";
import img09ACRomanticArcoIris from "@/assets/products/09AC_-_ROMANTIC_ARCO_IRIS.jpg";
import img010RomanticMescla from "@/assets/products/010_ROMANTIC_MESCLA.jpg";
import img075MicroPremium from "@/assets/products/075_Micro_Premium.jpeg";
import img101SuplexLiso from "@/assets/products/101_SUPLEX_LISO_320G.jpg";
import img102SuplexZero from "@/assets/products/102_SUPLEX_LISO_ZERO_TRANSPARENCIA_280G.jpg";
import img114Micropower from "@/assets/products/114_MICROPOWER_280G.jpg";
import img301MeiaMalha from "@/assets/products/301_MEIA_MALHA_PP.jpg";
import img304MeiaMalha from "@/assets/products/304_MEIA_MALHA_PP.jpg";
import img306MalhaMescla from "@/assets/products/306_MALHA_PP_RAMADA_MESCLA.jpg";
import img401MicrofibraLight from "@/assets/products/401_MICROFIBRA_POLIAMIDA_LIGHT.jpg";
import img401MicrofibraMax from "@/assets/products/401_MICROFIBRA_POLIAMIDA_PEDRINI.jpg";
import img501SuplexPoliamida from "@/assets/products/501_SUPLEX_POLIAMIDA.jpg";
import img801MeiaMalhaPV from "@/assets/products/801_meia_malha_pv.jpg";

const fabricImages = [fabricWhite, fabricBlack, fabricNavy, fabricCoral, fabricOlive, fabricBeige];

// Map product codes/names to real images
// Some products need full code+name matching for specific variants
const getProductImageFromMap = (code: string, name: string): string | null => {
  const nameLower = name.toLowerCase();
  const fullCode = code.toUpperCase();
  
  // Specific 401 variants
  if (fullCode.includes("401")) {
    if (nameLower.includes("max")) return img401MicrofibraMax;
    if (nameLower.includes("light")) return img401MicrofibraLight;
    // Other 401 variants use fallback textures
    return null;
  }
  
  // Specific 001 variants
  if (fullCode.includes("001")) {
    if (nameLower.includes("light")) return null; // 001 LIGHT uses fallback texture
    return img001RomanticLisa;
  }
  
  // Standard code-based mappings
  const productImageMap: Record<string, string> = {
    "003": img003RomanticSlim,
    "009": img009RomanticEstampado,
    "09AC": img09ACRomanticArcoIris,
    "010": img010RomanticMescla,
    "075": img075MicroPremium,
    "101": img101SuplexLiso,
    "102": img102SuplexZero,
    "114": img114Micropower,
    "301": img301MeiaMalha,
    "304": img304MeiaMalha,
    "306": img306MalhaMescla,
    "501": img501SuplexPoliamida,
    "801": img801MeiaMalhaPV,
  };
  
  const codeKey = code.split('-')[0];
  return productImageMap[codeKey] || null;
};

// Function to get product image - prioritizes real images, falls back to textures
const getProductImage = (code: string, name: string): string => {
  // Check if we have a real image for this product
  const realImage = getProductImageFromMap(code, name);
  if (realImage) {
    return realImage;
  }
  
  const nameLower = name.toLowerCase();
  
  // Fallback: assign texture images based on product name keywords
  if (nameLower.includes("romantic") || nameLower.includes("delicate")) return fabricBeige;
  if (nameLower.includes("microfibra") || nameLower.includes("poliamida")) return fabricNavy;
  if (nameLower.includes("suplex") || nameLower.includes("athletic")) return fabricOlive;
  if (nameLower.includes("preto") || nameLower.includes("black")) return fabricBlack;
  if (nameLower.includes("branco") || nameLower.includes("white")) return fabricWhite;
  if (nameLower.includes("coral") || nameLower.includes("rosa") || nameLower.includes("pink")) return fabricCoral;
  
  // Use code hash to get consistent image for other products
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fabricImages[hash % fabricImages.length];
};

interface Product {
  id: string;
  code: string;
  name: string;
  composition: string | null;
  weight_gsm: number | null;
  width_cm: number | null;
  yield_m_kg: number | null;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, code, name, composition, weight_gsm, width_cm, yield_m_kg")
        .eq("is_active", true)
        .order("code");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.code.toLowerCase().includes(searchLower) ||
      (product.composition?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá, gostaria de fazer um orçamento");
    window.open(`https://wa.me/5522998833821?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-hero py-16">
          <div className="container mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-poppins text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground text-center"
            >
              Nossos Produtos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-primary-foreground/90 text-center mt-4 max-w-2xl mx-auto"
            >
              Catálogo completo de malhas e tecidos premium
            </motion.p>
            
            {/* WhatsApp CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mt-8"
            >
              <Button 
                onClick={handleWhatsAppClick}
                size="lg"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-poppins font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Fazer Orçamento Agora
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produto por nome, código ou composição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground text-center">
              Exibindo <span className="font-bold text-foreground">{filteredProducts.length}</span> produtos
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-72 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 h-full group">
                    {/* Product Image */}
                    <div 
                      className="relative h-72 overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage({ 
                        src: getProductImage(product.code, product.name), 
                        name: product.name 
                      })}
                    >
                      <img 
                        src={getProductImage(product.code, product.name)} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                          {product.code}
                        </span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-poppins text-lg font-bold text-card-foreground mb-4 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Ficha Técnica */}
                      <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-accent">
                        <h4 className="font-poppins text-xs font-bold text-foreground mb-2 uppercase tracking-wide">
                          Ficha Técnica
                        </h4>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          {product.weight_gsm && (
                            <li>Gramatura: {product.weight_gsm} g/m²</li>
                          )}
                          {product.width_cm && (
                            <li>Largura: {Number(product.width_cm).toFixed(2)} m</li>
                          )}
                          {product.yield_m_kg && (
                            <li>Rendimento: {Number(product.yield_m_kg).toFixed(2)} m/kg</li>
                          )}
                          {product.composition && (
                            <li>Composição: {product.composition}</li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Nenhum produto encontrado com os filtros selecionados
              </p>
            </div>
          )}

          {/* Bottom WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-16"
          >
            <Button 
              onClick={handleWhatsAppClick}
              size="lg"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white font-poppins font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Fazer Orçamento Agora
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          <div className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors z-10"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
            {selectedImage && (
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
