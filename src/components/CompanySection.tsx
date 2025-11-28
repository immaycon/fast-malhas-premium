import { motion } from "framer-motion";
import { Factory, Store, Award } from "lucide-react";

export const CompanySection = () => {
  const features = [
    {
      icon: Factory,
      title: "Fábrica e Atacado",
      description: "Nosso processo de consultoria otimiza a produção de malhas para sua marca (fio > tecelagem > tinturaria > entrega)."
    },
    {
      icon: Store,
      title: "Varejo e Loja",
      description: "Somos o ponto de encontro de Friburgo para tecidos de alta costura e aviamentos."
    },
    {
      icon: Award,
      title: "Qualidade Certificada",
      description: "Tradição e tecnologia unidas para entregar a excelência do fio ao acabamento."
    }
  ];

  return (
    <section id="empresa" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">
            Tradição, Tecnologia e Confiança
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Serra Malhas é referência em Nova Friburgo, combinando a expertise de fábrica<br />
            com a acessibilidade de uma loja completa de tecidos e aviamentos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-8 shadow-card hover:shadow-elegant transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-6 mx-auto">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-poppins text-xl font-bold text-card-foreground mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-center font-inter leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-center shadow-premium"
        >
          <p className="font-poppins text-2xl md:text-3xl font-bold text-white italic">
            "Qualidade certificada do fio ao acabamento."
          </p>
        </motion.div>
      </div>
    </section>
  );
};
