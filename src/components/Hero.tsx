import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import heroTexture from "@/assets/hero-texture.jpg";

export const Hero = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5522998833821", "_blank");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroTexture})`,
          filter: "brightness(0.4)"
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-charcoal/90" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-poppins text-5xl md:text-7xl lg:text-8xl font-black text-primary-foreground mb-6 tracking-tight">
            FAST Malhas: Sua Fábrica<br />Têxtil Particular
          </h1>
          
          <p className="font-sans text-xl md:text-2xl text-primary-foreground/90 mb-4 max-w-4xl mx-auto leading-relaxed">
            Consultoria completa em malhas Premium
          </p>
          
          <p className="font-sans text-lg md:text-xl text-primary-foreground/80 mb-12 max-w-3xl mx-auto">
            Da compra do fio à entrega do tecido pronto, com o melhor preço e a qualidade que constrói marcas
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              size="lg"
              onClick={handleWhatsAppClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-poppins font-bold text-lg px-8 py-6 h-auto shadow-premium transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="mr-2 h-6 w-6" />
              FALE COM O GERENTE E FAÇA SEU PEDIDO
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-2">
          <motion.div 
            className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};
