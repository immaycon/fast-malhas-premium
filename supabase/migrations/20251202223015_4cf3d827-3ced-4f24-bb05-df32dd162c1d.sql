-- ===========================================
-- SISTEMA DE PRECIFICAÇÃO FAST MALHAS
-- ===========================================

-- 1. ENUM para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Tabela de roles de usuário
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Função de verificação de role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policies para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Tabela de perfis
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Primeiro usuário é admin
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- TABELAS DO SISTEMA DE PRECIFICAÇÃO
-- ===========================================

-- 5. Tipos de Fio (Poliéster, Elastano, Poliamida, etc.)
CREATE TABLE public.yarn_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL DEFAULT 'KG',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.yarn_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view yarn types" ON public.yarn_types
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage yarn types" ON public.yarn_types
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Preços de Fios (atualizados diariamente)
CREATE TABLE public.yarn_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yarn_type_id UUID REFERENCES public.yarn_types(id) ON DELETE CASCADE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (yarn_type_id, effective_date)
);

ALTER TABLE public.yarn_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view yarn prices" ON public.yarn_prices
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage yarn prices" ON public.yarn_prices
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. Produtos/Artigos
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    composition TEXT,
    weight_gsm INTEGER, -- gramatura
    width_cm DECIMAL(5, 2), -- largura
    yield_m_kg DECIMAL(5, 2), -- rendimento
    efficiency_factor DECIMAL(4, 2) NOT NULL DEFAULT 0.93, -- fator de aproveitamento
    weaving_cost DECIMAL(10, 2) NOT NULL DEFAULT 3.75, -- custo tecelagem por artigo
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view products" ON public.products
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage products" ON public.products
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 8. Ficha Técnica - Proporções de Fio por Produto
CREATE TABLE public.product_yarns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    yarn_type_id UUID REFERENCES public.yarn_types(id) ON DELETE CASCADE NOT NULL,
    proportion DECIMAL(5, 4) NOT NULL, -- ex: 0.94 para 94%
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (product_id, yarn_type_id)
);

ALTER TABLE public.product_yarns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view product yarns" ON public.product_yarns
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage product yarns" ON public.product_yarns
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 9. Cores
CREATE TABLE public.colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    hex_code TEXT,
    category TEXT, -- ex: Especial, Normal, Programável
    scale TEXT, -- ex: Amarelo, Azul, Vermelho
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view colors" ON public.colors
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage colors" ON public.colors
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 10. Custos de Tinturaria por Cor (por produto)
CREATE TABLE public.dyeing_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    color_id UUID REFERENCES public.colors(id) ON DELETE CASCADE NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (product_id, color_id)
);

ALTER TABLE public.dyeing_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view dyeing costs" ON public.dyeing_costs
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage dyeing costs" ON public.dyeing_costs
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 11. Histórico de Orçamentos/Cotações
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL NOT NULL,
    total_kg DECIMAL(10, 2) NOT NULL,
    average_cost_per_kg DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(12, 2) NOT NULL,
    quote_data JSONB, -- detalhamento completo
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotes" ON public.quotes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quotes" ON public.quotes
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create quotes" ON public.quotes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dyeing_costs_updated_at
BEFORE UPDATE ON public.dyeing_costs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();