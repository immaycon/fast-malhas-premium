import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, User, ArrowLeft, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoImage from '@/assets/fast-malhas-logo.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Erro no login',
            description: error.message === 'Invalid login credentials' 
              ? 'Email ou senha incorretos' 
              : error.message
          });
        } else {
          toast({
            title: 'Login realizado!',
            description: 'Bem-vindo ao sistema de custos.'
          });
          navigate('/admin');
        }
      } else {
        // First create the user
        const { data: signUpData, error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) {
          toast({
            variant: 'destructive',
            title: 'Erro no cadastro',
            description: signUpError.message.includes('already registered')
              ? 'Este email já está cadastrado'
              : signUpError.message
          });
          return;
        }

        // If admin key is provided, try to use it
        if (adminKey.trim() && signUpData?.user) {
          const { data: keyResult, error: keyError } = await supabase
            .rpc('use_admin_key', { 
              _key: adminKey.trim(), 
              _user_id: signUpData.user.id 
            });

          if (keyError || !keyResult) {
            toast({
              variant: 'default',
              title: 'Conta criada',
              description: 'Chave admin inválida ou já utilizada. Conta criada como usuário comum.'
            });
          } else {
            toast({
              title: 'Conta Admin criada!',
              description: 'Sua conta foi criada com acesso administrativo.'
            });
          }
        } else {
          toast({
            title: 'Cadastro realizado!',
            description: 'Sua conta foi criada com sucesso.'
          });
        }
        navigate('/admin');
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-military to-charcoal flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center text-cream/80 hover:text-cream mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao site
        </Link>

        <Card className="bg-card/95 backdrop-blur border-military/30 shadow-premium">
          <CardHeader className="text-center pb-2">
            <img src={logoImage} alt="Fast Malhas" className="h-16 mx-auto mb-4" />
            <CardTitle className="font-poppins text-2xl text-card-foreground">
              {isLogin ? 'Área Administrativa' : 'Criar Conta'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin 
                ? 'Entre para acessar o sistema de custos' 
                : 'Cadastre-se para gerenciar preços'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-card-foreground">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-background border-input"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminKey" className="text-card-foreground">
                      Chave Admin <span className="text-muted-foreground text-xs">(opcional)</span>
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminKey"
                        type="text"
                        placeholder="FAST-ADM-2025-XXXXX"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="pl-10 bg-background border-input font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Insira uma chave válida para obter acesso administrativo
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background border-input"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-poppins font-bold"
                disabled={loading}
              >
                {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;