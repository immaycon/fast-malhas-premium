import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroTexture from "@/assets/serra-hero-texture.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroTexture})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-poppins text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-tight">
            Serra Malhas:<br />A Excelência Têxtil<br />de Nova Friburgo
          </h1>
          
          <p className="font-inter text-xl md:text-2xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed">
            Fabricação, Consultoria e Varejo Premium. Seu parceiro completo em<br />
            <span className="font-semibold">Tecidos e Aviamentos para Moda, Lingerie e Fitness.</span>
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-poppins font-bold text-lg px-12 py-6 h-auto shadow-elegant"
              asChild
            >
              <a href="#tecidos">
                VEJA NOSSOS PRODUTOS
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
