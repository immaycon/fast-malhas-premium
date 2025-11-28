import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import modaCasualTexture from "@/assets/moda-casual-texture.jpg";
import lingerieTexture from "@/assets/lingerie-texture.jpg";
import fitnessTexture from "@/assets/fitness-texture.jpg";
import { Scissors, Ruler, Sparkles, Package } from "lucide-react";

const fabricCategories = [
  {
    name: "Moda Casual/Feminina",
    description: "Tecidos com melhor caimento e toque para peças elegantes e confortáveis.",
    examples: "Viscolycra, Malha Fria",
    image: modaCasualTexture
  },
  {
    name: "Lingerie",
    description: "Foco em conforto e elasticidade com materiais delicados e refinados.",
    examples: "Rendas, Microfibras, Tules",
    image: lingerieTexture
  },
  {
    name: "Fitness/Performance",
    description: "Tecidos de alta tecnologia com compressão e respirabilidade superior.",
    examples: "Suplex, Poliamida, Dry Fit",
    image: fitnessTexture
  }
];

const notions = [
  { icon: Sparkles, name: "Rendas e Bordados", description: "Para Lingerie e Moda" },
  { icon: Ruler, name: "Elásticos", description: "Para Fitness e Lingerie" },
  { icon: Scissors, name: "Fios e Linhas", description: "Essenciais para Confecção" },
  { icon: Package, name: "Acessórios", description: "Aviamentos Diversos" }
];

export const ProductShowcase = () => {
  return (
    <section id="tecidos" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">
            Nosso Catálogo Completo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Tecidos premium e aviamentos para todas as suas necessidades
          </p>
        </motion.div>

        {/* MÓDULO A: TECIDOS */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-poppins text-3xl md:text-4xl font-bold text-foreground mb-12 text-center"
          >
            Tecidos Premium
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {fabricCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                </div>
                <div className="p-6">
                  <h4 className="font-poppins text-xl font-bold text-card-foreground mb-3">
                    {category.name}
                  </h4>
                  <p className="text-muted-foreground mb-4 font-inter leading-relaxed">
                    {category.description}
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-inter text-muted-foreground">
                      <span className="font-semibold text-foreground">Exemplos:</span> {category.examples}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MÓDULO B: AVIAMENTOS */}
        <div id="aviamentos">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-poppins text-3xl md:text-4xl font-bold text-foreground mb-12 text-center"
          >
            Aviamentos Completos
          </motion.h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {notions.map((notion, index) => {
              const Icon = notion.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 text-center shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-poppins text-lg font-bold text-card-foreground mb-2">
                    {notion.name}
                  </h4>
                  <p className="text-sm text-muted-foreground font-inter">
                    {notion.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-poppins font-bold text-base px-10 py-6 h-auto shadow-card"
              asChild
            >
              <a href="#contato">
                EXPLORE NOSSA LOJA DE AVIAMENTOS
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
