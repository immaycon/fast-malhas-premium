import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import microfibraTexture from "@/assets/microfibra-texture.jpg";
import romanticTexture from "@/assets/romantic-texture.jpg";
import suplexTexture from "@/assets/suplex-texture.jpg";

const products = [
  {
    name: "MICROFIBRA DE POLIAMIDA",
    description: "O toque suave da poliamida com alta respirabilidade e secagem rápida. Perfeito para moda fitness e casual de luxo.",
    specs: [
      "Gramatura: $$XX$$ g/m²",
      "Largura: $$XX$$ cm",
      "Rendimento: $$XX$$ m/kg",
      "Composição: $$% Poliamida, % Elastano$$"
    ],
    image: microfibraTexture
  },
  {
    name: "ROMANTIC LISA",
    description: "Caimento leve e fluido, ideal para peças que exigem elegância e movimento. Resistente ao amarrotamento.",
    specs: [
      "Gramatura: $$XX$$ g/m²",
      "Largura: $$XX$$ cm",
      "Rendimento: $$XX$$ m/kg",
      "Composição: $$% Poliéster, % Elastano$$"
    ],
    image: romanticTexture
  },
  {
    name: "SUPLEX",
    description: "Elasticidade e compressão excepcionais, oferecendo suporte e conforto. Ideal para leggings e vestuário de alta performance.",
    specs: [
      "Gramatura: $$XX$$ g/m²",
      "Largura: $$XX$$ cm",
      "Rendimento: $$XX$$ m/kg",
      "Composição: $$% Poliamida, % Elastano$$"
    ],
    image: suplexTexture
  }
];

export const ProductsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-oswald text-4xl md:text-5xl font-bold text-foreground mb-6">
            Qualidade de Fio a Fio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tecidos premium selecionados para construir marcas de excelência
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
