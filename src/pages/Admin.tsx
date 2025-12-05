import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calculator, Package, Palette, DollarSign, Home, PaintBucket } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/fast-malhas-logo.png';
import { YarnPricesTab } from '@/components/admin/YarnPricesTab';
import { CostCalculator } from '@/components/admin/CostCalculator';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { ColorsTab } from '@/components/admin/ColorsTab';
import { DyeingCostsTab } from '@/components/admin/DyeingCostsTab';

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-military/20 to-charcoal flex items-center justify-center">
        <div className="text-cream text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-military/20 to-charcoal">
      {/* Header */}
      <header className="bg-charcoal/90 backdrop-blur border-b border-military/30 sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <img src={logoImage} alt="Fast Malhas" className="h-8 md:h-10 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-poppins text-sm md:text-lg font-bold text-cream truncate">Sistema de Custos</h1>
              <p className="text-[10px] md:text-xs text-cream/60 truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-cream/80 hover:text-cream hover:bg-military/30 px-2 md:px-3">
                <Home className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Site</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-cream/80 hover:text-cream hover:bg-military/30 px-2 md:px-3"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="calculator" className="w-full">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-8">
              <TabsList className="inline-flex w-auto min-w-full md:w-full md:grid md:grid-cols-5 bg-charcoal/50 border border-military/30 gap-1 p-1">
                <TabsTrigger 
                  value="calculator" 
                  className="font-poppins text-xs md:text-sm whitespace-nowrap px-3 md:px-4 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <Calculator className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Calculadora</span>
                  <span className="sm:hidden">Calc</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="yarns"
                  className="font-poppins text-xs md:text-sm whitespace-nowrap px-3 md:px-4 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <DollarSign className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Preços Fios</span>
                  <span className="sm:hidden">Fios</span>
                </TabsTrigger>
                {isAdmin && (
                  <>
                    <TabsTrigger 
                      value="dyeing"
                      className="font-poppins text-xs md:text-sm whitespace-nowrap px-3 md:px-4 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    >
                      <PaintBucket className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Tinturaria</span>
                      <span className="sm:hidden">Tint</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="products"
                      className="font-poppins text-xs md:text-sm whitespace-nowrap px-3 md:px-4 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    >
                      <Package className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Produtos</span>
                      <span className="sm:hidden">Prod</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="colors"
                      className="font-poppins text-xs md:text-sm whitespace-nowrap px-3 md:px-4 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    >
                      <Palette className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Cores</span>
                      <span className="sm:hidden">Cor</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <TabsContent value="calculator">
              <CostCalculator />
            </TabsContent>

            <TabsContent value="yarns">
              <YarnPricesTab isAdmin={isAdmin} />
            </TabsContent>

            {isAdmin && (
              <>
                <TabsContent value="dyeing">
                  <DyeingCostsTab />
                </TabsContent>

                <TabsContent value="products">
                  <ProductsTab />
                </TabsContent>

                <TabsContent value="colors">
                  <ColorsTab />
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
