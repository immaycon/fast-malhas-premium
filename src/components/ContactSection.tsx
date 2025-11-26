import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

export const ContactSection = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5522998833821", "_blank");
  };

  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_12%,rgba(255,255,255,.05)_12.5%,rgba(255,255,255,.05)_87%,transparent_87.5%,transparent),linear-gradient(150deg,transparent_12%,rgba(255,255,255,.05)_12.5%,rgba(255,255,255,.05)_87%,transparent_87.5%,transparent),linear-gradient(30deg,transparent_12%,rgba(255,255,255,.05)_12.5%,rgba(255,255,255,.05)_87%,transparent_87.5%,transparent),linear-gradient(150deg,transparent_12%,rgba(255,255,255,.05)_12.5%,rgba(255,255,255,.05)_87%,transparent_87.5%,transparent)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="font-oswald text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Fale com a Gerência e Inicie Sua Produção
          </h2>
          
          <p className="text-xl text-primary-foreground/90 mb-12 leading-relaxed">
            Nossos consultores estão prontos para entender seu projeto e oferecer o tecido Premium com o preço de atacado que você precisa
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card/10 backdrop-blur-sm border border-primary-foreground/20 p-8 rounded-lg shadow-premium"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Phone className="w-6 h-6 text-accent" />
              <h3 className="font-oswald text-2xl font-bold text-primary-foreground">
                Gerente de Contas
              </h3>
            </div>

            <Button
              size="lg"
              onClick={handleWhatsAppClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-oswald text-xl px-10 py-7 h-auto shadow-premium transition-all duration-300 hover:scale-105 w-full md:w-auto"
            >
              <MessageCircle className="mr-3 h-7 w-7" />
              (22) 99883-3821
            </Button>

            <p className="text-primary-foreground/80 mt-6 font-sans">
              Seu contato direto para pedidos e consultoria técnica
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
