import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/fast-malhas-logo.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "#tecidos", label: "Tecidos" },
    { path: "#aviamentos", label: "Aviamentos" },
    { path: "#empresa", label: "A Empresa" },
    { path: "#contato", label: "Contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <div className="h-12 w-48 bg-gradient-to-r from-forest-green to-cobalt-blue rounded flex items-center justify-center">
              <span className="font-poppins font-black text-2xl text-white">SERRA MALHAS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`font-poppins font-semibold text-base transition-colors ${
                  link.path === "/" && location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground hover:text-secondary"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 font-poppins font-semibold text-lg ${
                  link.path === "/" && location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
