-- ============================================
-- SISTEMA COMPLETO DE E-COMMERCE - VERSÃO FINAL
-- Tabelas para cupons, pedidos e pagamentos
-- Data: 09 de Janeiro de 2026 - CORREÇÃO DEFINITIVA
-- ============================================

-- Remover tabelas se existirem (para recriação limpa)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;

-- Remover TODAS as funções e triggers existentes
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_coupon_usage(text) CASCADE;
DROP FUNCTION IF EXISTS validate_coupon_availability(text) CASCADE;

-- Tabela de cupons de desconto - SEM RLS
CREATE TABLE public.coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- GARANTIR QUE NÃO HÁ RLS NA TABELA CUPONS
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;

-- Tabela de pedidos
CREATE TABLE public.orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    payment_method VARCHAR(50) DEFAULT 'pix',
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'pending',
    pix_key VARCHAR(255),
    pix_qr_code TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE public.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- RLS apenas para pedidos e itens - NÃO PARA CUPONS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy para pedidos
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy para itens do pedido
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Inserir alguns cupons de exemplo
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_uses) 
VALUES 
    ('CYBER10', '10% de desconto', 'percentage', 10.00, 50.00, 100),
    ('GEEK15', '15% de desconto', 'percentage', 15.00, 100.00, 50),
    ('PRIMEIRA20', 'R$ 20 de desconto para primeira compra', 'fixed', 20.00, 80.00, 200),
    ('FRETE5', 'R$ 5 de desconto no frete', 'fixed', 5.00, 30.00, 500)
ON CONFLICT (code) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNÇÕES DE SUPORTE PARA CUPONS
-- =============================================

-- Função para incrementar o contador de uso de cupons
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code text)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons 
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE code = coupon_code 
    AND is_active = true 
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    AND (max_uses IS NULL OR COALESCE(current_uses, 0) < max_uses);
END;
$$ LANGUAGE plpgsql;

-- Função para validar cupom disponível
CREATE OR REPLACE FUNCTION validate_coupon_availability(coupon_code text)
RETURNS json AS $$
DECLARE
    result json;
    coupon_record RECORD;
BEGIN
    SELECT * INTO coupon_record 
    FROM public.coupons 
    WHERE code = coupon_code 
      AND is_active = true;
    
    IF NOT FOUND THEN
        result := json_build_object(
            'valid', false, 
            'message', 'Cupom não encontrado ou inativo'
        );
        RETURN result;
    END IF;
    
    -- Verificar data de validade
    IF coupon_record.valid_until IS NOT NULL AND coupon_record.valid_until < CURRENT_DATE THEN
        result := json_build_object(
            'valid', false, 
            'message', 'Cupom expirado'
        );
        RETURN result;
    END IF;
    
    -- Verificar limite de uso
    IF coupon_record.max_uses IS NOT NULL AND 
       COALESCE(coupon_record.current_uses, 0) >= coupon_record.max_uses THEN
        result := json_build_object(
            'valid', false, 
            'message', 'Cupom esgotado'
        );
        RETURN result;
    END IF;
    
    -- Cupom válido
    result := json_build_object(
        'valid', true,
        'coupon', row_to_json(coupon_record)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

-- Verificar se RLS está desabilitado para cupons
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'coupons';

-- Mensagem de sucesso
SELECT 'Sistema de e-commerce criado com sucesso! RLS desabilitado para cupons.' as status;