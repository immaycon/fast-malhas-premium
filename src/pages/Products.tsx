import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
                  <div className="h-48 bg-muted" />
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
                    {/* Product Image Placeholder */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-military/20 to-accent/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-poppins text-6xl font-black text-foreground/10">
                          {product.code}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
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
    </div>
  );
}
