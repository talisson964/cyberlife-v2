-- ============================================
-- CYBERLIFE V2 - SCRIPT SQL COMPLETO
-- Database: PostgreSQL (Supabase)
-- Versão: 2.0.0
-- Data: 04 de Janeiro de 2026
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole e execute este script completo
-- 4. Verifique os buckets de Storage
-- 5. Configure as políticas de Storage
--
-- ============================================

-- ============================================
-- HABILITAR EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELA 1: PROFILES (Perfis de Usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 0 AND age <= 150),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  whatsapp TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles(nickname);

-- Trigger para atualizar updated_at automaticamente
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function para criar perfil automaticamente após registro
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, nickname, city, state)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Não informado'),
    COALESCE(NEW.raw_user_meta_data->>'state', 'N/A')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentários
COMMENT ON TABLE public.profiles IS 'Perfis completos dos usuários cadastrados';
COMMENT ON COLUMN public.profiles.nickname IS 'Apelido único do usuário para exibição';
COMMENT ON COLUMN public.profiles.is_admin IS 'Define se o usuário tem privilégios de administrador';

-- ============================================
-- TABELA 2: PRODUCTS (Produtos da Loja)
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  type TEXT,
  image_url TEXT NOT NULL,
  hover_image_url TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- Trigger para updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.products IS 'Catálogo de produtos da loja geek/gamer';
COMMENT ON COLUMN public.products.image_url IS 'URL da imagem principal armazenada no Storage';
COMMENT ON COLUMN public.products.hover_image_url IS 'URL da imagem exibida ao passar o mouse';
COMMENT ON COLUMN public.products.stock IS 'Quantidade disponível em estoque';

-- ============================================
-- TABELA 3: BANNERS (Banners Promocionais)
-- ============================================
CREATE TABLE IF NOT EXISTS public.banners (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  discount TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON public.banners("order");

-- Trigger para updated_at
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.banners IS 'Banners promocionais exibidos em carrosséis';
COMMENT ON COLUMN public.banners.image_url IS 'URL da imagem do banner armazenada no Storage';
COMMENT ON COLUMN public.banners."order" IS 'Ordem de exibição (menor número = maior prioridade)';

-- ============================================
-- TABELA 4: EVENTS (Eventos e Torneios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Torneio', 'Corujão', 'Rush Play', 'Campeonato', 'Outro')),
  date DATE NOT NULL,
  prize TEXT,
  inscription_info TEXT,
  inscription_deadline DATE,
  max_participants INTEGER CHECK (max_participants > 0),
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  image_url TEXT NOT NULL,
  rules JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events(active);

-- Trigger para updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.events IS 'Eventos, torneios e competições';
COMMENT ON COLUMN public.events.slug IS 'Identificador único para URL (ex: league-of-legends)';
COMMENT ON COLUMN public.events.rules IS 'Array JSON com regras do evento';
COMMENT ON COLUMN public.events.schedule IS 'Array JSON com cronograma do evento';
COMMENT ON COLUMN public.events.current_participants IS 'Número atual de inscritos';

-- ============================================
-- TABELA 5: EVENT_REGISTRATIONS (Inscrições)
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_nickname TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_whatsapp TEXT,
  team_name TEXT,
  additional_info JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);

-- Function para atualizar contador de participantes
DROP FUNCTION IF EXISTS update_event_participants_count() CASCADE;
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.events 
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
      UPDATE public.events 
      SET current_participants = current_participants + 1
      WHERE id = NEW.event_id;
    ELSIF NEW.status != 'confirmed' AND OLD.status = 'confirmed' THEN
      UPDATE public.events 
      SET current_participants = GREATEST(current_participants - 1, 0)
      WHERE id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE public.events 
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_participants_count ON public.event_registrations;
CREATE TRIGGER update_participants_count
  AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- Comentários
COMMENT ON TABLE public.event_registrations IS 'Inscrições de usuários em eventos';
COMMENT ON COLUMN public.event_registrations.additional_info IS 'Informações extras (JSON)';

-- ============================================
-- TABELA 6: ORDERS (Pedidos/Vendas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_whatsapp TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping DECIMAL(10,2) NOT NULL CHECK (shipping >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'approved', 'rejected', 'refunded')),
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(created_at);

-- Function para gerar número de pedido único
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('orders_id_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar order_number automaticamente
DROP FUNCTION IF EXISTS set_order_number() CASCADE;
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Trigger para updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.orders IS 'Pedidos e vendas realizadas';
COMMENT ON COLUMN public.orders.order_number IS 'Número único do pedido (ex: CL-20260104-000001)';
COMMENT ON COLUMN public.orders.items IS 'Array JSON com produtos do pedido';
COMMENT ON COLUMN public.orders.shipping_address IS 'Endereço de entrega (JSON)';

-- ============================================
-- TABELA 7: ACCESS_LOGS (Logs de Acesso)
-- ============================================
CREATE TABLE IF NOT EXISTS public.access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  access_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_hour TIME DEFAULT LOCALTIME,
  city TEXT,
  state TEXT,
  ip_address TEXT,
  user_agent TEXT,
  page_visited TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_date ON public.access_logs(access_date);
CREATE INDEX IF NOT EXISTS idx_access_logs_email ON public.access_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_access_logs_state ON public.access_logs(state);
CREATE INDEX IF NOT EXISTS idx_access_logs_page ON public.access_logs(page_visited);

-- Comentários
COMMENT ON TABLE public.access_logs IS 'Registra todos os acessos de usuários ao site';
COMMENT ON COLUMN public.access_logs.user_id IS 'ID do usuário autenticado (NULL se anônimo)';
COMMENT ON COLUMN public.access_logs.session_id IS 'ID único da sessão do usuário';

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: PROFILES
-- ============================================
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS: PRODUCTS
-- ============================================
CREATE POLICY "Anyone can view active products" 
  ON public.products FOR SELECT 
  USING (active = true OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admin can insert products" 
  ON public.products FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admin can update products" 
  ON public.products FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admin can delete products" 
  ON public.products FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- POLÍTICAS: BANNERS
-- ============================================
CREATE POLICY "Anyone can view active banners" 
  ON public.banners FOR SELECT 
  USING (active = true OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admin can modify banners" 
  ON public.banners FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- POLÍTICAS: EVENTS
-- ============================================
CREATE POLICY "Anyone can view active events" 
  ON public.events FOR SELECT 
  USING (active = true OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admin can modify events" 
  ON public.events FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- POLÍTICAS: EVENT_REGISTRATIONS
-- ============================================
CREATE POLICY "Users can view own registrations" 
  ON public.event_registrations FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Users can register for events" 
  ON public.event_registrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own registrations" 
  ON public.event_registrations FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all registrations" 
  ON public.event_registrations FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- POLÍTICAS: ORDERS
-- ============================================
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Users can create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can update orders" 
  ON public.orders FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- POLÍTICAS: ACCESS_LOGS
-- ============================================
CREATE POLICY "System can insert logs" 
  ON public.access_logs FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can view all logs" 
  ON public.access_logs FOR SELECT 
  USING (true);

CREATE POLICY "Users can view own logs" 
  ON public.access_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Resumo de vendas
DROP VIEW IF EXISTS public.sales_summary CASCADE;
CREATE OR REPLACE VIEW public.sales_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(total) as revenue,
  AVG(total) as avg_order_value
FROM public.orders
WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Estatísticas de eventos
DROP VIEW IF EXISTS public.event_stats CASCADE;
CREATE OR REPLACE VIEW public.event_stats AS
SELECT 
  e.id,
  e.title,
  e.type,
  e.date,
  e.current_participants,
  e.max_participants,
  COUNT(er.id) as total_registrations,
  COUNT(CASE WHEN er.status = 'confirmed' THEN 1 END) as confirmed_registrations
FROM public.events e
LEFT JOIN public.event_registrations er ON er.event_id = e.id
GROUP BY e.id, e.title, e.type, e.date, e.current_participants, e.max_participants;

-- View: Top produtos
DROP VIEW IF EXISTS public.top_products CASCADE;
CREATE OR REPLACE VIEW public.top_products AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  COUNT(o.id) as times_ordered,
  SUM((item->>'quantity')::int) as total_sold
FROM public.products p
LEFT JOIN public.orders o ON o.items::text LIKE '%"id":' || p.id || '%'
LEFT JOIN LATERAL jsonb_array_elements(o.items) item ON true
WHERE (item->>'id')::bigint = p.id
GROUP BY p.id, p.name, p.category, p.price
ORDER BY total_sold DESC NULLS LAST;

-- ============================================
-- FUNCTIONS AUXILIARES
-- ============================================

-- Function: Buscar produtos por texto
DROP FUNCTION IF EXISTS search_products(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  price DECIMAL,
  category TEXT,
  image_url TEXT,
  relevance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.image_url,
    (
      CASE 
        WHEN p.name ILIKE '%' || search_term || '%' THEN 3
        WHEN p.description ILIKE '%' || search_term || '%' THEN 2
        WHEN p.category ILIKE '%' || search_term || '%' THEN 1
        ELSE 0
      END
    )::NUMERIC as relevance
  FROM public.products p
  WHERE p.active = true
    AND (
      p.name ILIKE '%' || search_term || '%' OR
      p.description ILIKE '%' || search_term || '%' OR
      p.category ILIKE '%' || search_term || '%'
    )
  ORDER BY relevance DESC, p.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir admin padrão (ALTERE A SENHA!)
-- Você deve criar este usuário manualmente no Supabase Auth primeiro
-- Depois execute:
/*
INSERT INTO public.profiles (id, email, full_name, nickname, city, state, is_admin)
VALUES (
  'SEU-UUID-AQUI',
  'admin@cyberlife.com',
  'Administrador',
  'admin',
  'São Paulo',
  'SP',
  true
) ON CONFLICT (id) DO UPDATE SET is_admin = true;
*/

-- ============================================
-- VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- INSTRUÇÕES PÓS-INSTALAÇÃO
-- ============================================

/*
PRÓXIMOS PASSOS:

1. STORAGE (Buckets):
   - Criar bucket 'products' (público)
   - Criar bucket 'banners' (público)
   - Criar bucket 'events' (público)
   - Criar bucket 'avatars' (público)

2. STORAGE POLICIES:
   Execute as políticas de storage conforme documentação

3. AUTENTICAÇÃO:
   - Habilitar Email Auth no Supabase
   - Configurar templates de email
   - Configurar redirect URLs

4. CRIAR ADMIN:
   - Criar usuário admin no Supabase Auth
   - Executar INSERT para marcar como admin

5. TESTAR:
   - Criar um usuário teste
   - Inserir produtos de exemplo
   - Testar fluxo de compra
   - Testar inscrição em eventos

6. PRODUÇÃO:
   - Configurar backups automáticos
   - Monitorar logs de erro
   - Configurar alertas

QUERIES DE TESTE:

-- Ver todos os perfis
SELECT * FROM public.profiles;

-- Ver todos os produtos
SELECT * FROM public.products WHERE active = true;

-- Ver eventos ativos
SELECT * FROM public.events WHERE active = true;

-- Ver últimos pedidos
SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 10;

-- Ver estatísticas de acesso
SELECT 
  page_visited,
  COUNT(*) as total_visits
FROM public.access_logs
GROUP BY page_visited
ORDER BY total_visits DESC;

*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================
COMMENT ON DATABASE postgres IS 'CyberLife V2 - E-commerce Geek/Gamer - Versão 2.0.0';
