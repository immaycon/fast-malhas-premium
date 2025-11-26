import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColorItem {
  name: string;
  hex: string;
  tone: "especial" | "normal" | "programavel";
  scale: "amarelo" | "azul" | "bege" | "branco" | "cinza" | "laranja" | "marrom" | "preto" | "rosa" | "roxo" | "verde" | "vermelho";
}

const colorDatabase: ColorItem[] = [
  { name: "Preto", hex: "#000000", tone: "normal", scale: "preto" },
  { name: "Branco", hex: "#FFFFFF", tone: "normal", scale: "branco" },
  { name: "Cinza Mescla", hex: "#888888", tone: "normal", scale: "cinza" },
  { name: "Cinza Escuro", hex: "#4A4A4A", tone: "normal", scale: "cinza" },
  { name: "Azul Marinho", hex: "#001F3F", tone: "normal", scale: "azul" },
  { name: "Azul Royal", hex: "#0074D9", tone: "especial", scale: "azul" },
  { name: "Azul Petróleo", hex: "#2C5F77", tone: "programavel", scale: "azul" },
  { name: "Azul Claro", hex: "#7FDBFF", tone: "normal", scale: "azul" },
  { name: "Verde Militar", hex: "#3D5A3D", tone: "especial", scale: "verde" },
  { name: "Verde Bandeira", hex: "#009B3A", tone: "normal", scale: "verde" },
  { name: "Verde Limão", hex: "#B8E986", tone: "programavel", scale: "verde" },
  { name: "Vermelho Ferrari", hex: "#C8102E", tone: "especial", scale: "vermelho" },
  { name: "Vermelho Cardinal", hex: "#8B0000", tone: "normal", scale: "vermelho" },
  { name: "Bordô", hex: "#6B1C23", tone: "programavel", scale: "vermelho" },
  { name: "Rosa Pink", hex: "#FF1493", tone: "especial", scale: "rosa" },
  { name: "Rosa Claro", hex: "#FFB6C1", tone: "normal", scale: "rosa" },
  { name: "Rosa Antigo", hex: "#C4A4A4", tone: "programavel", scale: "rosa" },
  { name: "Laranja", hex: "#FF8C00", tone: "normal", scale: "laranja" },
  { name: "Laranja Queimado", hex: "#CC5500", tone: "especial", scale: "laranja" },
  { name: "Amarelo Ouro", hex: "#FFD700", tone: "especial", scale: "amarelo" },
  { name: "Amarelo Canário", hex: "#FFEF00", tone: "normal", scale: "amarelo" },
  { name: "Bege", hex: "#D4C5B9", tone: "normal", scale: "bege" },
  { name: "Marrom Café", hex: "#6F4E37", tone: "programavel", scale: "marrom" },
  { name: "Roxo", hex: "#800080", tone: "especial", scale: "roxo" },
  { name: "Lilás", hex: "#C8A2C8", tone: "normal", scale: "roxo" },
];

export default function Colors() {
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedScales, setSelectedScales] = useState<string[]>([]);

  const tones = [
    { value: "especial", label: "Especial" },
    { value: "normal", label: "Normal" },
    { value: "programavel", label: "Programáveis" },
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

  const toggleFilter = (type: "tone" | "scale", value: string) => {
    if (type === "tone") {
      setSelectedTones(prev =>
        prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
      );
    } else {
      setSelectedScales(prev =>
        prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
      );
    }
  };

  const filteredColors = colorDatabase.filter(color => {
    const toneMatch = selectedTones.length === 0 || selectedTones.includes(color.tone);
    const scaleMatch = selectedScales.length === 0 || selectedScales.includes(color.scale);
    return toneMatch && scaleMatch;
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

                {/* Tonalidades */}
                <div className="mb-8">
                  <h3 className="font-poppins text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                    Tonalidades
                  </h3>
                  <div className="space-y-3">
                    {tones.map(tone => (
                      <div key={tone.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tone-${tone.value}`}
                          checked={selectedTones.includes(tone.value)}
                          onCheckedChange={() => toggleFilter("tone", tone.value)}
                        />
                        <Label
                          htmlFor={`tone-${tone.value}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {tone.label}
                        </Label>
                      </div>
                    ))}
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
                            onCheckedChange={() => toggleFilter("scale", scale.value)}
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
                    key={`${color.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="group cursor-pointer"
                  >
                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 hover:scale-105">
                      <div
                        className="h-32 flex items-center justify-center relative"
                        style={{ backgroundColor: color.hex }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                      </div>
                      <div className="p-4 text-center">
                        <p className="font-poppins font-bold text-sm text-card-foreground">
                          {color.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {color.hex}
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
