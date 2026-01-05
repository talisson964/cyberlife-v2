-- ============================================
-- CYBERLIFE V2 - VIEWS E FUNCTIONS PARA ADMIN DASHBOARD
-- Database: PostgreSQL (Supabase)
-- Versão: 2.0.0
-- Data: 04 de Janeiro de 2026
-- ============================================
-- 
-- INSTRUÇÕES:
-- Execute este script após o script principal
-- Estas views facilitam as consultas no AdminPanel
--
-- ============================================

-- ============================================
-- VIEW: DASHBOARD_STATS (Estatísticas Gerais)
-- ============================================
DROP VIEW IF EXISTS public.dashboard_stats CASCADE;
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.products WHERE active = true) as total_products,
  (SELECT COUNT(DISTINCT id) FROM public.profiles) as total_customers,
  (SELECT COUNT(*) FROM public.orders) as total_orders,
  (SELECT COUNT(*) FROM public.events WHERE active = true) as total_events,
  (SELECT COALESCE(SUM(total), 0) FROM public.orders WHERE status IN ('paid', 'processing', 'shipped', 'delivered')) as total_revenue,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM public.event_registrations WHERE status = 'pending') as pending_registrations,
  (SELECT COUNT(*) FROM public.products WHERE stock < 10 AND active = true) as low_stock_products;

COMMENT ON VIEW public.dashboard_stats IS 'Estatísticas gerais para o dashboard administrativo';

-- ============================================
-- VIEW: RECENT_ORDERS (Pedidos Recentes)
-- ============================================
DROP VIEW IF EXISTS public.recent_orders CASCADE;
CREATE OR REPLACE VIEW public.recent_orders AS
SELECT 
  o.id,
  o.order_number,
  o.user_email,
  o.user_name,
  o.total,
  o.status,
  o.payment_status,
  o.created_at,
  jsonb_array_length(o.items) as items_count,
  p.nickname as user_nickname,
  p.city,
  p.state
FROM public.orders o
LEFT JOIN public.profiles p ON p.id = o.user_id
ORDER BY o.created_at DESC
LIMIT 50;

COMMENT ON VIEW public.recent_orders IS 'Últimos 50 pedidos com informações do cliente';

-- ============================================
-- VIEW: CUSTOMER_STATS (Estatísticas de Clientes)
-- ============================================
DROP VIEW IF EXISTS public.customer_stats CASCADE;
CREATE OR REPLACE VIEW public.customer_stats AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.nickname,
  p.city,
  p.state,
  p.created_at as registered_at,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(o.total), 0) as total_spent,
  COUNT(DISTINCT er.id) as total_event_registrations,
  MAX(o.created_at) as last_order_date,
  COUNT(DISTINCT al.id) as total_visits
FROM public.profiles p
LEFT JOIN public.orders o ON o.user_id = p.id
LEFT JOIN public.event_registrations er ON er.user_id = p.id
LEFT JOIN public.access_logs al ON al.user_id = p.id
WHERE p.is_admin = false
GROUP BY p.id, p.email, p.full_name, p.nickname, p.city, p.state, p.created_at
ORDER BY total_spent DESC;

COMMENT ON VIEW public.customer_stats IS 'Estatísticas detalhadas de cada cliente';

-- ============================================
-- VIEW: PRODUCT_PERFORMANCE (Desempenho de Produtos)
-- ============================================
DROP VIEW IF EXISTS public.product_performance CASCADE;
CREATE OR REPLACE VIEW public.product_performance AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.type,
  p.price,
  p.stock,
  p.active,
  COUNT(DISTINCT o.id) as times_ordered,
  COALESCE(SUM((item->>'quantity')::int), 0) as total_sold,
  COALESCE(SUM((item->>'quantity')::int * p.price), 0) as total_revenue,
  p.created_at
FROM public.products p
LEFT JOIN public.orders o ON o.items::text LIKE '%"id":' || p.id || '%'
LEFT JOIN LATERAL jsonb_array_elements(o.items) item ON (item->>'id')::bigint = p.id
GROUP BY p.id, p.name, p.category, p.type, p.price, p.stock, p.active, p.created_at
ORDER BY total_sold DESC;

COMMENT ON VIEW public.product_performance IS 'Desempenho de vendas por produto';

-- ============================================
-- VIEW: SALES_BY_PERIOD (Vendas por Período)
-- ============================================
DROP VIEW IF EXISTS public.sales_by_period CASCADE;
CREATE OR REPLACE VIEW public.sales_by_period AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as orders_count,
  SUM(total) as revenue,
  AVG(total) as avg_order_value,
  SUM(CASE WHEN status IN ('paid', 'processing', 'shipped', 'delivered') THEN 1 ELSE 0 END) as completed_orders,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
FROM public.orders
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 90;

COMMENT ON VIEW public.sales_by_period IS 'Vendas agrupadas por dia (últimos 90 dias)';

-- ============================================
-- VIEW: SALES_BY_CATEGORY (Vendas por Categoria)
-- ============================================
DROP VIEW IF EXISTS public.sales_by_category CASCADE;
CREATE OR REPLACE VIEW public.sales_by_category AS
SELECT 
  p.category,
  COUNT(DISTINCT o.id) as orders_count,
  COALESCE(SUM((item->>'quantity')::int), 0) as units_sold,
  COALESCE(SUM((item->>'quantity')::int * p.price), 0) as total_revenue,
  COUNT(DISTINCT p.id) as products_count
FROM public.products p
LEFT JOIN public.orders o ON o.items::text LIKE '%"id":' || p.id || '%'
LEFT JOIN LATERAL jsonb_array_elements(o.items) item ON (item->>'id')::bigint = p.id
WHERE p.active = true
GROUP BY p.category
ORDER BY total_revenue DESC;

COMMENT ON VIEW public.sales_by_category IS 'Vendas agrupadas por categoria de produto';

-- ============================================
-- VIEW: EVENT_REGISTRATION_STATS (Estatísticas de Eventos)
-- ============================================
DROP VIEW IF EXISTS public.event_registration_stats CASCADE;
CREATE OR REPLACE VIEW public.event_registration_stats AS
SELECT 
  e.id,
  e.title,
  e.type,
  e.date,
  e.max_participants,
  e.current_participants,
  COUNT(er.id) as total_registrations,
  COUNT(CASE WHEN er.status = 'pending' THEN 1 END) as pending_registrations,
  COUNT(CASE WHEN er.status = 'confirmed' THEN 1 END) as confirmed_registrations,
  COUNT(CASE WHEN er.status = 'cancelled' THEN 1 END) as cancelled_registrations,
  CASE 
    WHEN e.max_participants IS NULL THEN 0
    ELSE ROUND((e.current_participants::numeric / e.max_participants::numeric) * 100, 2)
  END as fill_percentage
FROM public.events e
LEFT JOIN public.event_registrations er ON er.event_id = e.id
WHERE e.active = true
GROUP BY e.id, e.title, e.type, e.date, e.max_participants, e.current_participants
ORDER BY e.date ASC;

COMMENT ON VIEW public.event_registration_stats IS 'Estatísticas de inscrições por evento';

-- ============================================
-- VIEW: TOP_CUSTOMERS (Melhores Clientes)
-- ============================================
DROP VIEW IF EXISTS public.top_customers CASCADE;
CREATE OR REPLACE VIEW public.top_customers AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.nickname,
  p.city,
  p.state,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total) as total_spent,
  AVG(o.total) as avg_order_value,
  MAX(o.created_at) as last_order_date,
  MIN(o.created_at) as first_order_date
FROM public.profiles p
INNER JOIN public.orders o ON o.user_id = p.id
WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered')
GROUP BY p.id, p.email, p.full_name, p.nickname, p.city, p.state
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY total_spent DESC
LIMIT 20;

COMMENT ON VIEW public.top_customers IS 'Top 20 clientes por valor gasto';

-- ============================================
-- VIEW: LOW_STOCK_ALERT (Alerta de Estoque Baixo)
-- ============================================
DROP VIEW IF EXISTS public.low_stock_alert CASCADE;
CREATE OR REPLACE VIEW public.low_stock_alert AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.type,
  p.stock,
  p.price,
  COALESCE(SUM((item->>'quantity')::int), 0) as total_sold_last_30_days,
  CASE 
    WHEN COALESCE(SUM((item->>'quantity')::int), 0) > 0 THEN 
      ROUND(p.stock::numeric / (COALESCE(SUM((item->>'quantity')::int), 0) / 30.0), 1)
    ELSE NULL
  END as days_until_stockout
FROM public.products p
LEFT JOIN public.orders o ON o.items::text LIKE '%"id":' || p.id || '%' 
  AND o.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN LATERAL jsonb_array_elements(o.items) item ON (item->>'id')::bigint = p.id
WHERE p.active = true AND p.stock < 20
GROUP BY p.id, p.name, p.category, p.type, p.stock, p.price
ORDER BY p.stock ASC, days_until_stockout ASC NULLS LAST;

COMMENT ON VIEW public.low_stock_alert IS 'Produtos com estoque baixo e previsão de esgotamento';

-- ============================================
-- VIEW: REVENUE_BY_MONTH (Receita Mensal)
-- ============================================
DROP VIEW IF EXISTS public.revenue_by_month CASCADE;
CREATE OR REPLACE VIEW public.revenue_by_month AS
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') as month,
  COUNT(*) as orders_count,
  SUM(total) as revenue,
  AVG(total) as avg_order_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM public.orders
WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC
LIMIT 12;

COMMENT ON VIEW public.revenue_by_month IS 'Receita mensal dos últimos 12 meses';

-- ============================================
-- VIEW: GEOGRAPHIC_SALES (Vendas por Região)
-- ============================================
DROP VIEW IF EXISTS public.geographic_sales CASCADE;
CREATE OR REPLACE VIEW public.geographic_sales AS
SELECT 
  p.state,
  p.city,
  COUNT(DISTINCT p.id) as customers_count,
  COUNT(DISTINCT o.id) as orders_count,
  COALESCE(SUM(o.total), 0) as total_revenue,
  COALESCE(AVG(o.total), 0) as avg_order_value
FROM public.profiles p
LEFT JOIN public.orders o ON o.user_id = p.id
WHERE p.state IS NOT NULL AND p.state != 'N/A'
GROUP BY p.state, p.city
ORDER BY total_revenue DESC;

COMMENT ON VIEW public.geographic_sales IS 'Vendas agrupadas por estado e cidade';

-- ============================================
-- FUNCTION: GET_ORDER_DETAILS (Detalhes Completos do Pedido)
-- ============================================
DROP FUNCTION IF EXISTS get_order_details(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION get_order_details(order_id BIGINT)
RETURNS TABLE (
  order_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  total DECIMAL,
  status TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  items JSONB,
  shipping_address JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.order_number,
    o.user_name,
    o.user_email,
    o.user_whatsapp,
    o.total,
    o.status,
    o.payment_status,
    o.created_at,
    o.items,
    o.shipping_address
  FROM public.orders o
  WHERE o.id = order_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_order_details IS 'Retorna todos os detalhes de um pedido específico';

-- ============================================
-- FUNCTION: UPDATE_ORDER_STATUS (Atualizar Status do Pedido)
-- ============================================
DROP FUNCTION IF EXISTS update_order_status(BIGINT, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION update_order_status(
  order_id BIGINT,
  new_status TEXT,
  new_payment_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE public.orders
  SET 
    status = new_status,
    payment_status = COALESCE(new_payment_status, payment_status),
    updated_at = NOW()
  WHERE id = order_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_order_status IS 'Atualiza o status de um pedido';

-- ============================================
-- VERIFICAÇÕES
-- ============================================

-- Verificar views criadas
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%dashboard%'
     OR table_name LIKE '%customer%'
     OR table_name LIKE '%sales%'
     OR table_name LIKE '%revenue%'
ORDER BY table_name;

-- Testar dashboard_stats
SELECT * FROM public.dashboard_stats;

-- Testar recent_orders
SELECT * FROM public.recent_orders LIMIT 10;

-- Testar customer_stats
SELECT * FROM public.customer_stats LIMIT 10;

-- ============================================
-- QUERIES ÚTEIS PARA O ADMIN
-- ============================================

/*
-- Buscar pedidos por status
SELECT * FROM public.recent_orders WHERE status = 'pending';

-- Buscar clientes por cidade
SELECT * FROM public.customer_stats WHERE city = 'São Paulo';

-- Produtos mais vendidos
SELECT * FROM public.product_performance ORDER BY total_sold DESC LIMIT 10;

-- Eventos com mais inscrições
SELECT * FROM public.event_registration_stats ORDER BY total_registrations DESC;

-- Receita do mês atual
SELECT 
  SUM(revenue) as monthly_revenue,
  SUM(orders_count) as monthly_orders
FROM public.sales_by_period
WHERE date >= DATE_TRUNC('month', CURRENT_DATE);

-- Top 10 estados por receita
SELECT 
  state,
  SUM(total_revenue) as revenue,
  SUM(orders_count) as orders
FROM public.geographic_sales
GROUP BY state
ORDER BY revenue DESC
LIMIT 10;
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================
