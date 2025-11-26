import { motion } from "framer-motion";
import { Award, Truck, Droplets, Scissors } from "lucide-react";

const steps = [
  {
    icon: Scissors,
    title: "Consultoria e Fio",
    description: "A FAST Malhas adquire o fio e o elastano conforme as especificações do cliente"
  },
  {
    icon: Award,
    title: "Tecelagem",
    description: "O material é enviado para a tecelagem sob supervisão da FAST"
  },
  {
    icon: Droplets,
    title: "Tinturaria",
    description: "Contratamos a tinturaria especializada para tingimento, garantindo cores perfeitas"
  },
  {
    icon: Truck,
    title: "Entrega Final",
    description: "O tecido finalizado, com rótulos da FAST, é enviado diretamente e rapidamente ao cliente"
  }
];

export const ProcessSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-poppins text-4xl md:text-5xl font-black text-foreground mb-6">
            A Cadeia de Valor Otimizada
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Processo completo de fabricação com supervisão especializada em cada etapa
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card border border-border p-8 rounded-lg shadow-card hover:shadow-premium transition-all duration-300 h-full">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="font-poppins text-xl font-bold text-card-foreground mb-3">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-accent/30" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-accent p-8 rounded-lg text-center shadow-premium"
        >
          <p className="font-poppins text-2xl font-bold text-accent-foreground">
            Reconhecida por qualidade Premium, entrega rápida e confiança inabalável
          </p>
        </motion.div>
      </div>
    </section>
  );
};
