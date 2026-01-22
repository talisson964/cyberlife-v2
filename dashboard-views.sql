-- CRIAR VIEWS PARA DASHBOARD

-- 1. View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  COALESCE((SELECT SUM(total) FROM public.orders WHERE status = 'paid'), 0) as total_revenue,
  (SELECT COUNT(*) FROM public.orders) as total_orders,
  (SELECT COUNT(DISTINCT user_id) FROM public.orders) as total_customers,
  (SELECT COUNT(*) FROM public.products) as total_products,
  (SELECT COUNT(*) FROM public.products WHERE stock <= 5) as low_stock_products,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders;

-- 2. View para pedidos recentes
CREATE OR REPLACE VIEW recent_orders AS
SELECT 
  o.id,
  o.order_number,
  o.total,
  o.status,
  o.created_at,
  pr.full_name as user_name,
  pr.nickname as user_nickname
FROM orders o
JOIN profiles pr ON o.user_id = pr.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 3. View para melhores clientes
CREATE OR REPLACE VIEW top_customers AS
SELECT 
  p.id,
  p.full_name,
  p.nickname,
  COUNT(o.id) as total_orders,
  COALESCE(SUM(o.total), 0) as total_spent,
  MAX(o.created_at) as last_order
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id
GROUP BY p.id, p.full_name, p.nickname
ORDER BY total_spent DESC
LIMIT 10;

-- 4. View para vendas por categoria
CREATE OR REPLACE VIEW sales_by_category AS
SELECT 
  p.category,
  COUNT(oi.product_id) as items_sold,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.subtotal) as total_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY p.category
ORDER BY total_revenue DESC;

-- 5. View para alerta de estoque baixo
CREATE OR REPLACE VIEW low_stock_alert AS
SELECT 
  id,
  name,
  stock,
  category,
  CASE 
    WHEN stock = 0 THEN 'SEM ESTOQUE'
    WHEN stock <= 2 THEN 'CRÍTICO'
    WHEN stock <= 5 THEN 'BAIXO'
  END as stock_status
FROM products
WHERE stock <= 5
ORDER BY stock ASC;