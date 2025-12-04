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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="Fast Malhas" className="h-10" />
            <div>
              <h1 className="font-poppins text-lg font-bold text-cream">Sistema de Custos</h1>
              <p className="text-xs text-cream/60">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-cream/80 hover:text-cream hover:bg-military/30">
                <Home className="w-4 h-4 mr-2" />
                Site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-cream/80 hover:text-cream hover:bg-military/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-charcoal/50 border border-military/30 mb-8">
              <TabsTrigger 
                value="calculator" 
                className="font-poppins data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculadora
              </TabsTrigger>
              <TabsTrigger 
                value="yarns"
                className="font-poppins data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Preços Fios
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger 
                    value="dyeing"
                    className="font-poppins data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    <PaintBucket className="w-4 h-4 mr-2" />
                    Tinturaria
                  </TabsTrigger>
                  <TabsTrigger 
                    value="products"
                    className="font-poppins data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Produtos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="colors"
                    className="font-poppins data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Cores
                  </TabsTrigger>
                </>
              )}
            </TabsList>

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
