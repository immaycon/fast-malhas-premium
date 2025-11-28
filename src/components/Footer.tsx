import { MapPin, Phone, MessageCircle } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary to-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-poppins text-2xl font-black mb-4">SERRA MALHAS</h3>
            <p className="font-inter text-white/80 leading-relaxed">
              A excelência têxtil de Nova Friburgo. Fabricação, consultoria e varejo premium.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-poppins text-lg font-bold mb-4">Navegação</h4>
            <nav className="space-y-2 font-inter">
              <a href="#" className="block text-white/80 hover:text-white transition-colors">
                Início
              </a>
              <a href="#tecidos" className="block text-white/80 hover:text-white transition-colors">
                Tecidos
              </a>
              <a href="#aviamentos" className="block text-white/80 hover:text-white transition-colors">
                Aviamentos
              </a>
              <a href="#empresa" className="block text-white/80 hover:text-white transition-colors">
                A Empresa
              </a>
              <a href="#contato" className="block text-white/80 hover:text-white transition-colors">
                Contato
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-poppins text-lg font-bold mb-4">Contato</h4>
            <div className="space-y-3 font-inter">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm">
                  Rua Folly, 46 - Olaria<br />
                  Nova Friburgo, RJ - 28623-790
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+552225280012" className="text-white/80 hover:text-white transition-colors">
                  (22) 2528-0012
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                <a 
                  href="https://wa.me/5522997550012" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  (22) 99755-0012
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
          <p className="text-center text-white/70 text-sm font-inter">
            © {currentYear} Serra Malhas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
