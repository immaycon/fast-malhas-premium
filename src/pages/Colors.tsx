import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

type ColorScale = "amarelo" | "azul" | "bege" | "branco" | "cinza" | "laranja" | "marrom" | "preto" | "rosa" | "roxo" | "verde" | "vermelho";

interface ColorItem {
  name: string;
  image: string;
  scale: ColorScale;
}

// Color data with image paths and scale
const colorDatabase: ColorItem[] = [
  { name: "Aço", image: "/colors/aco.png", scale: "cinza" },
  { name: "Amarelo Biscoito / Sunkiss", image: "/colors/amarelo-biscoito.png", scale: "amarelo" },
  { name: "Amêndoa", image: "/colors/amendoa.jpg", scale: "marrom" },
  { name: "Aquaril", image: "/colors/aquaril.png", scale: "verde" },
  { name: "Atalaia", image: "/colors/atalaia.png", scale: "azul" },
  { name: "Azulejo", image: "/colors/azulejo.png", scale: "roxo" },
  { name: "Bandana", image: "/colors/bandana.png", scale: "rosa" },
  { name: "Bege", image: "/colors/bege.png", scale: "bege" },
  { name: "Bic / Lace", image: "/colors/bic-lace.png", scale: "azul" },
  { name: "Branco", image: "/colors/branco.png", scale: "branco" },
  { name: "Callas / Marrocos", image: "/colors/callas-marrocos.png", scale: "rosa" },
  { name: "Canela", image: "/colors/canela.png", scale: "marrom" },
  { name: "Chronos", image: "/colors/chronos.png", scale: "laranja" },
  { name: "Coral", image: "/colors/coral.png", scale: "vermelho" },
  { name: "Cru / Lavação", image: "/colors/cru-lavacao.png", scale: "branco" },
  { name: "Dusk", image: "/colors/dusk.png", scale: "azul" },
  { name: "Eros", image: "/colors/eros.png", scale: "roxo" },
  { name: "Fantástico", image: "/colors/fantastico.png", scale: "roxo" },
  { name: "Florence", image: "/colors/florence.png", scale: "verde" },
  { name: "Floresta", image: "/colors/floresta.png", scale: "verde" },
  { name: "Frozen", image: "/colors/frozen.png", scale: "azul" },
  { name: "Fúcsia", image: "/colors/fuscsia.png", scale: "rosa" },
  { name: "Herança", image: "/colors/heranca.png", scale: "verde" },
  { name: "Íris", image: "/colors/iris.png", scale: "rosa" },
  { name: "Laranja", image: "/colors/laranja.png", scale: "laranja" },
  { name: "Lichia", image: "/colors/lichia.png", scale: "vermelho" },
  { name: "Lipstick", image: "/colors/lipstick.png", scale: "vermelho" },
  { name: "Loteria", image: "/colors/loteria.png", scale: "azul" },
  { name: "Louise", image: "/colors/louise.png", scale: "marrom" },
  { name: "Luciana", image: "/colors/luciana.png", scale: "rosa" },
  { name: "Major", image: "/colors/major.png", scale: "verde" },
  { name: "Marfim", image: "/colors/marfim.png", scale: "bege" },
  { name: "Marinho", image: "/colors/marinho.png", scale: "azul" },
  { name: "Marrom Coffee", image: "/colors/marrom-coffee.png", scale: "marrom" },
  { name: "Mastruz", image: "/colors/mastruz.png", scale: "verde" },
  { name: "Mocassim", image: "/colors/mocassim.png", scale: "rosa" },
  { name: "Mocha Mousse", image: "/colors/mocha-mousse.png", scale: "marrom" },
  { name: "Morado", image: "/colors/morado.png", scale: "roxo" },
  { name: "Ninfa", image: "/colors/ninfa.png", scale: "vermelho" },
  { name: "Odalisca", image: "/colors/odalisca.png", scale: "roxo" },
  { name: "Pantera", image: "/colors/pantera.png", scale: "rosa" },
  { name: "Pimenta / Ruby", image: "/colors/pimenta-ruby.png", scale: "vermelho" },
  { name: "Preto", image: "/colors/preto.png", scale: "preto" },
  { name: "Racy / Pink", image: "/colors/racy-pink.png", scale: "rosa" },
  { name: "Romance / Bubblegum", image: "/colors/romance-bubblegum.png", scale: "rosa" },
  { name: "Rosa BB", image: "/colors/rosa-bb.png", scale: "rosa" },
  { name: "Rouse Delicate", image: "/colors/rouse-delicate.png", scale: "rosa" },
  { name: "Royal", image: "/colors/royal.png", scale: "azul" },
  { name: "Rubro", image: "/colors/rubro.png", scale: "vermelho" },
  { name: "Sandia", image: "/colors/sandia.png", scale: "rosa" },
  { name: "Sanremo", image: "/colors/sanremo.png", scale: "azul" },
  { name: "Satim / Tulipero", image: "/colors/satim-tulipero.png", scale: "roxo" },
  { name: "Tame", image: "/colors/tame.png", scale: "azul" },
  { name: "Teos", image: "/colors/teos.png", scale: "cinza" },
  { name: "Terra", image: "/colors/terra.png", scale: "vermelho" },
  { name: "Tibeton", image: "/colors/tibeton.png", scale: "amarelo" },
  { name: "Turquesa", image: "/colors/turquesa.png", scale: "azul" },
  { name: "Verde Oliva", image: "/colors/verde-oliva.png", scale: "verde" },
  { name: "Verde TW", image: "/colors/verde-tw.png", scale: "verde" },
  { name: "Vermelho", image: "/colors/vermelho.png", scale: "vermelho" },
];

const scales = [
  { value: "amarelo", label: "Amarelo" },
  { value: "azul", label: "Azul" },
  { value: "bege", label: "Bege" },
  { value: "branco", label: "Branco" },
  { value: "cinza", label: "Cinza" },
  { value: "laranja", label: "Laranja" },
  { value: "marrom", label: "Marrom" },
  { value: "preto", label: "Preto" },
  { value: "rosa", label: "Rosa" },
  { value: "roxo", label: "Roxo" },
  { value: "verde", label: "Verde" },
  { value: "vermelho", label: "Vermelho" },
];

export default function Colors() {
  const [selectedScales, setSelectedScales] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFilter = (value: string) => {
    setSelectedScales(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const filteredColors = colorDatabase.filter(color => {
    const scaleMatch = selectedScales.length === 0 || selectedScales.includes(color.scale);
    const searchMatch = color.name.toLowerCase().includes(searchTerm.toLowerCase());
    return scaleMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20">
        <div className="bg-gradient-hero py-16">
          <div className="container mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-poppins text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground text-center"
            >
              Cartela de Cores
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-primary-foreground/90 text-center mt-4 max-w-2xl mx-auto"
            >
              Ampla variedade de cores para seus projetos têxteis
            </motion.p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="font-poppins text-xl font-bold text-card-foreground mb-6">
                  Filtros
                </h2>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar cor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                  </div>
                </div>

                {/* Escala de Cores */}
                <div>
                  <h3 className="font-poppins text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                    Escala de Cores
                  </h3>
                  <ScrollArea className="h-80">
                    <div className="space-y-3 pr-4">
                      {scales.map(scale => (
                        <div key={scale.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`scale-${scale.value}`}
                            checked={selectedScales.includes(scale.value)}
                            onCheckedChange={() => toggleFilter(scale.value)}
                          />
                          <Label
                            htmlFor={`scale-${scale.value}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {scale.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {selectedScales.length > 0 && (
                  <button
                    onClick={() => setSelectedScales([])}
                    className="mt-4 text-sm text-accent hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </aside>

            {/* Color Grid */}
            <div className="flex-1">
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Exibindo <span className="font-bold text-foreground">{filteredColors.length}</span> cores
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredColors.map((color, index) => (
                  <motion.div
                    key={color.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="group"
                  >
                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 hover:scale-105">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={color.image}
                          alt={color.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <p className="font-poppins font-bold text-sm text-card-foreground">
                          {color.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredColors.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    Nenhuma cor encontrada com os filtros selecionados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
