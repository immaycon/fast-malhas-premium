import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";

// Color data with image paths
const colorDatabase = [
  { name: "Aço", image: "/colors/aco.png" },
  { name: "Amarelo Biscoito", image: "/colors/amarelo-biscoito.png" },
  { name: "Amêndoa", image: "/colors/amendoa.jpg" },
  { name: "Aquaril", image: "/colors/aquaril.png" },
  { name: "Atalaia", image: "/colors/atalaia.png" },
  { name: "Azulejo", image: "/colors/azulejo.png" },
  { name: "Bandana", image: "/colors/bandana.png" },
  { name: "Bege", image: "/colors/bege.png" },
  { name: "Bic Lace", image: "/colors/bic-lace.png" },
  { name: "Branco", image: "/colors/branco.png" },
  { name: "Callas Marrocos", image: "/colors/callas-marrocos.png" },
  { name: "Canela", image: "/colors/canela.png" },
  { name: "Chronos", image: "/colors/chronos.png" },
  { name: "Coral", image: "/colors/coral.png" },
  { name: "Cru Lavação", image: "/colors/cru-lavacao.png" },
  { name: "Dusk", image: "/colors/dusk.png" },
  { name: "Eros", image: "/colors/eros.png" },
  { name: "Fantástico", image: "/colors/fantastico.png" },
  { name: "Florence", image: "/colors/florence.png" },
  { name: "Floresta", image: "/colors/floresta.png" },
  { name: "Frozen", image: "/colors/frozen.png" },
  { name: "Fúcsia", image: "/colors/fuscsia.png" },
  { name: "Herança", image: "/colors/heranca.png" },
  { name: "Íris", image: "/colors/iris.png" },
  { name: "Laranja", image: "/colors/laranja.png" },
  { name: "Lichia", image: "/colors/lichia.png" },
  { name: "Lipstick", image: "/colors/lipstick.png" },
  { name: "Loteria", image: "/colors/loteria.png" },
  { name: "Louise", image: "/colors/louise.png" },
  { name: "Luciana", image: "/colors/luciana.png" },
  { name: "Major", image: "/colors/major.png" },
  { name: "Marfim", image: "/colors/marfim.png" },
  { name: "Marinho", image: "/colors/marinho.png" },
  { name: "Marrom Coffee", image: "/colors/marrom-coffee.png" },
  { name: "Mastruz", image: "/colors/mastruz.png" },
  { name: "Mocassim", image: "/colors/mocassim.png" },
  { name: "Mocha Mousse", image: "/colors/mocha-mousse.png" },
  { name: "Morado", image: "/colors/morado.png" },
  { name: "Ninfa", image: "/colors/ninfa.png" },
  { name: "Odalisca", image: "/colors/odalisca.png" },
  { name: "Pantera", image: "/colors/pantera.png" },
  { name: "Pimenta Ruby", image: "/colors/pimenta-ruby.png" },
  { name: "Preto", image: "/colors/preto.png" },
  { name: "Racy Pink", image: "/colors/racy-pink.png" },
  { name: "Romance Bubblegum", image: "/colors/romance-bubblegum.png" },
  { name: "Rosa BB", image: "/colors/rosa-bb.png" },
  { name: "Rouse Delicate", image: "/colors/rouse-delicate.png" },
  { name: "Royal 2", image: "/colors/royal-2.png" },
  { name: "Royal", image: "/colors/royal.png" },
  { name: "Rubro", image: "/colors/rubro.png" },
  { name: "Sandia", image: "/colors/sandia.png" },
  { name: "Sanremo", image: "/colors/sanremo.png" },
  { name: "Satim Tulipero", image: "/colors/satim-tulipero.png" },
  { name: "Tame", image: "/colors/tame.png" },
  { name: "Teos", image: "/colors/teos.png" },
  { name: "Terra", image: "/colors/terra.png" },
  { name: "Tibeton", image: "/colors/tibeton.png" },
  { name: "Turquesa", image: "/colors/turquesa.png" },
  { name: "Verde Oliva", image: "/colors/verde-oliva.png" },
  { name: "Verde TW", image: "/colors/verde-tw.png" },
  { name: "Vermelho", image: "/colors/vermelho.png" },
];

export default function Colors() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColors = colorDatabase.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {/* Search */}
          <div className="mb-8 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar cor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              Exibindo <span className="font-bold text-foreground">{filteredColors.length}</span> cores
            </p>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                Nenhuma cor encontrada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
