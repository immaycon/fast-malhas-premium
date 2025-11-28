import { motion } from "framer-motion";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LocationContact = () => {
  const whatsappNumber = "5522997550012";
  const whatsappMessage = encodeURIComponent(
    "Olá! Gostaria de conhecer os produtos da Serra Malhas."
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const phoneNumber = "tel:+552225280012";

  return (
    <section id="contato" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Location Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 text-center">
            Visite Nossa Loja Física<br />em Nova Friburgo
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-12 font-inter">
            Nossos especialistas estão prontos para oferecer consultoria técnica e<br />
            te ajudar a escolher o material perfeito para a sua coleção.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Address Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card border border-border rounded-xl p-8 shadow-elegant"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-poppins text-xl font-bold text-card-foreground mb-2">
                    Endereço
                  </h3>
                  <p className="text-muted-foreground font-inter leading-relaxed">
                    Rua Folly, 46 - Olaria<br />
                    Nova Friburgo, RJ<br />
                    CEP: 28623-790
                  </p>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-inter">
                    Mapa da localização
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Information Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-primary to-secondary rounded-xl p-8 text-white shadow-premium flex flex-col justify-between"
            >
              <div>
                <h3 className="font-poppins text-2xl font-bold mb-6">
                  Fale Conosco
                </h3>
                <p className="font-inter text-white/90 mb-8 leading-relaxed">
                  Entre em contato para consultoria técnica, orçamentos ou para conhecer nosso showroom.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <Phone className="w-6 h-6 text-white flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white/80 font-inter">Telefone Fixo</p>
                    <a href={phoneNumber} className="text-lg font-poppins font-bold hover:text-white/80 transition-colors">
                      (22) 2528-0012
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6 text-white flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white/80 font-inter">WhatsApp</p>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-lg font-poppins font-bold hover:text-white/80 transition-colors">
                      (22) 99755-0012
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-muted/50 rounded-2xl p-12 border border-border"
        >
          <h3 className="font-poppins text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fale com a Gerência e<br />Inicie Sua Produção
          </h3>
          <p className="text-lg text-muted-foreground mb-8 font-inter max-w-2xl mx-auto">
            Nossos consultores estão prontos para entender seu projeto e oferecer o tecido<br />
            Premium com o preço de atacado que você precisa.
          </p>
          <Button 
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-poppins font-bold text-lg px-12 py-6 h-auto shadow-elegant"
            asChild
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              FALE NO WHATSAPP AGORA
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4 font-inter">
            Seu contato direto para pedidos e consultoria técnica
          </p>
        </motion.div>
      </div>
    </section>
  );
};
