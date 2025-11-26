import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  name: string;
  description: string;
  specs: string[];
  image: string;
  index: number;
}

export const ProductCard = ({ name, description, specs, image, index }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 h-full">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
        </div>
        
        <CardContent className="p-8">
          <h3 className="font-oswald text-2xl font-bold text-card-foreground mb-4">
            {name}
          </h3>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          
          <div className="bg-muted/50 p-6 rounded-lg border-l-4 border-accent">
            <h4 className="font-oswald text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
              Ficha Técnica
            </h4>
            <ul className="space-y-2">
              {specs.map((spec, i) => (
                <li key={i} className="text-sm text-muted-foreground font-sans">
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
