# 🎮 CYBERLIFE V2 - ADMIN PANEL 2.0

## 📋 VISÃO GERAL

O novo Admin Panel foi completamente reformulado com dashboard completo, integração com Supabase e funcionalidades avançadas de gerenciamento.

## ✨ PRINCIPAIS MELHORIAS

### 1. **Dashboard Completo** 📊
- **Estatísticas em tempo real**: Produtos, clientes, pedidos, receita total
- **Alertas inteligentes**: Pedidos pendentes, estoque baixo
- **Pedidos recentes**: Últimos 10 pedidos com detalhes
- **Top 5 clientes**: Maiores compradores
- **Vendas por categoria**: Performance de cada categoria
- **Alerta de estoque baixo**: Produtos que precisam de reposição

### 2. **Gerenciamento de Pedidos** 🛒
- Visualização completa de todos os pedidos
- Atualização de status em tempo real
- Filtro de pedidos por número, cliente ou email
- Modal com detalhes completos do pedido
- Status disponíveis: Pendente, Pago, Processando, Enviado, Entregue, Cancelado

### 3. **Gerenciamento de Clientes** 👥
- Lista completa de clientes cadastrados
- Estatísticas por cliente:
  - Total de pedidos
  - Total gasto
  - Eventos inscritos
  - Total de visitas
- Filtro por nome, email ou nickname
- Visualização de cidade/estado

### 4. **Produtos, Banners e Eventos** 🎮
- Interface moderna e responsiva
- Formulários completos com validação
- Upload de imagens via URL
- Edição inline
- Sistema de busca em tempo real
- Integração completa com Supabase

### 5. **Logs de Acesso** 📝
- Componente AccessLogsView integrado
- Visualização de todos os acessos
- Filtros avançados

## 🗄️ ARQUIVOS CRIADOS

### 1. **AdminPanel2.jsx** (1.200+ linhas)
```
src/screens/AdminPanel2.jsx
```

**Principais funcionalidades:**
- ✅ Verificação de autenticação e permissão admin
- ✅ 7 tabs: Dashboard, Produtos, Banners, Eventos, Pedidos, Clientes, Logs
- ✅ CRUD completo para produtos, banners e eventos
- ✅ Atualização de status de pedidos
- ✅ Visualização de estatísticas de clientes
- ✅ Integração total com Supabase

### 2. **AdminPanel2.css** (700+ linhas)
```
src/screens/AdminPanel2.css
```

**Características do design:**
- 🎨 Tema cyberpunk com gradientes neon
- 📱 Totalmente responsivo
- ✨ Animações suaves
- 🌈 Cards coloridos e informativos
- 📊 Tabelas estilizadas
- 🎯 Badges de status com cores intuitivas

### 3. **ADMIN-DASHBOARD-VIEWS.sql** (400+ linhas)
```
ADMIN-DASHBOARD-VIEWS.sql
```

**Views criadas:**
- `dashboard_stats` - Estatísticas gerais
- `recent_orders` - Pedidos recentes com dados do cliente
- `customer_stats` - Estatísticas detalhadas de clientes
- `product_performance` - Desempenho de vendas por produto
- `sales_by_period` - Vendas por período (últimos 90 dias)
- `sales_by_category` - Vendas por categoria
- `event_registration_stats` - Estatísticas de eventos
- `top_customers` - Top 20 clientes
- `low_stock_alert` - Produtos com estoque baixo
- `revenue_by_month` - Receita mensal
- `geographic_sales` - Vendas por região

**Funções criadas:**
- `get_order_details(order_id)` - Detalhes completos do pedido
- `update_order_status(order_id, status, payment_status)` - Atualizar status

## 📊 ESTRUTURA DO DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  🎮 CYBERLIFE ADMIN PANEL        [← VOLTAR AO SITE]    │
├─────────────────────────────────────────────────────────┤
│ [📊 DASHBOARD] [🎮 PRODUTOS] [🖼️ BANNERS] [🏆 EVENTOS] │
│ [🛒 PEDIDOS] [👥 CLIENTES] [📝 LOGS]                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │Produtos│ │Clientes│ │Pedidos │ │Receita │          │
│  │  124   │ │   458  │ │  2,341 │ │R$89.5K │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                         │
│  ┌────────┐ ┌────────┐                                 │
│  │Pedidos │ │Estoque │  ⚠️ ALERTAS                     │
│  │Pendente│ │ Baixo  │                                 │
│  │   12   │ │    5   │                                 │
│  └────────┘ └────────┘                                 │
│                                                         │
│  📦 PEDIDOS RECENTES                                    │
│  ┌─────────────────────────────────────────────┐       │
│  │ #CL-20260104-000015 │ João Silva │ R$299.90 │       │
│  │ #CL-20260104-000014 │ Maria     │ R$149.90 │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  ⭐ TOP 5 CLIENTES                                      │
│  📊 VENDAS POR CATEGORIA                                │
│  ⚠️ ALERTA DE ESTOQUE BAIXO                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🚀 COMO USAR

### Passo 1: Executar SQL das Views
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: ADMIN-DASHBOARD-VIEWS.sql
```

### Passo 2: Atualizar Rota no App.jsx
```jsx
import AdminPanel2 from './screens/AdminPanel2';

// Trocar de AdminPanel para AdminPanel2
case 'admin':
  return <AdminPanel2 onNavigate={setCurrentScreen} />;
```

### Passo 3: Criar Usuário Admin
```sql
-- 1. Criar usuário no Supabase Auth
-- 2. Marcar como admin:
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'seu-admin@email.com';
```

### Passo 4: Acessar Admin Panel
```
http://localhost:5173/#admin
```

## 🎯 FUNCIONALIDADES POR TAB

### 📊 DASHBOARD
- Visão geral de todas as métricas
- Cards com estatísticas principais
- Tabelas de pedidos recentes
- Top clientes
- Vendas por categoria
- Alertas de estoque baixo

### 🎮 PRODUTOS
- Adicionar novo produto
- Editar produto existente
- Excluir produto
- Buscar produtos
- Upload de imagem principal + hover
- Controle de estoque
- Categorização (geek, gamer, smarthome)

### 🖼️ BANNERS
- Criar banners promocionais
- Definir ordem de exibição
- Link customizado
- Editar/excluir banners
- Sistema de busca

### 🏆 EVENTOS
- Criar eventos/torneios
- Tipos: Torneio, Corujão, Rush Play, Campeonato
- Controle de participantes
- Prêmios e regras
- Data e slug customizado

### 🛒 PEDIDOS
- Lista completa de pedidos
- Atualizar status em tempo real
- Visualizar detalhes
- Filtrar por número, cliente, email
- Status: Pendente → Pago → Processando → Enviado → Entregue

### 👥 CLIENTES
- Lista de todos os clientes
- Estatísticas individuais
- Total de pedidos
- Valor total gasto
- Localização (cidade/estado)
- Data de cadastro

### 📝 LOGS
- Componente AccessLogsView
- Todos os acessos registrados
- Filtros avançados

## 🎨 DESIGN SYSTEM

### Cores Principais
- **Ciano Neon**: `#00d9ff` - Primário
- **Magenta Neon**: `#ff00ea` - Secundário
- **Verde Neon**: `#00ff00` - Sucesso
- **Vermelho**: `#ff0000` - Erro/Alerta
- **Laranja**: `#ffa500` - Atenção
- **Ouro**: `#ffd700` - Destaque

### Status Colors
```css
.pending    → Laranja (pendente)
.paid       → Verde (pago)
.processing → Ciano (processando)
.shipped    → Roxo (enviado)
.delivered  → Verde claro (entregue)
.cancelled  → Vermelho (cancelado)
```

## 📱 RESPONSIVIDADE

- **Desktop** (>768px): Layout em grid completo
- **Mobile** (<768px): Layout em coluna única
- Tabelas adaptáveis
- Navegação responsiva
- Cards empilhados

## 🔒 SEGURANÇA

### Verificações Implementadas
1. ✅ Autenticação obrigatória
2. ✅ Verificação de permissão `is_admin`
3. ✅ RLS (Row Level Security) no Supabase
4. ✅ Redirect automático se não autorizado
5. ✅ Sessão persistente

### Políticas RLS Aplicadas
- Apenas admins podem INSERT/UPDATE/DELETE
- Views retornam apenas dados permitidos
- Functions validam permissões

## 📈 QUERIES ÚTEIS

### Ver estatísticas do dashboard
```sql
SELECT * FROM dashboard_stats;
```

### Ver pedidos recentes
```sql
SELECT * FROM recent_orders LIMIT 10;
```

### Ver top clientes
```sql
SELECT * FROM top_customers;
```

### Ver produtos com estoque baixo
```sql
SELECT * FROM low_stock_alert;
```

### Atualizar status de pedido
```sql
SELECT update_order_status(1, 'shipped', 'approved');
```

### Receita mensal
```sql
SELECT * FROM revenue_by_month;
```

### Vendas por estado
```sql
SELECT 
  state,
  SUM(total_revenue) as revenue,
  SUM(orders_count) as orders
FROM geographic_sales
GROUP BY state
ORDER BY revenue DESC;
```

## 🐛 TROUBLESHOOTING

### Erro: "Acesso Negado"
**Solução**: Verificar se o usuário tem `is_admin = true`
```sql
UPDATE profiles SET is_admin = true WHERE email = 'seu@email.com';
```

### Views não aparecem
**Solução**: Executar `ADMIN-DASHBOARD-VIEWS.sql` no Supabase

### Produtos não carregam
**Solução**: Verificar RLS policies e executar `CYBERLIFE-DATABASE-COMPLETE.sql`

### Erro ao atualizar pedido
**Solução**: Verificar permissões admin e policies da tabela `orders`

## 🎯 PRÓXIMOS PASSOS

1. ✅ Executar `ADMIN-DASHBOARD-VIEWS.sql` no Supabase
2. ✅ Trocar AdminPanel por AdminPanel2 no App.jsx
3. ✅ Criar usuário admin
4. ✅ Testar todas as funcionalidades
5. ⏳ Configurar upload de imagens no Supabase Storage
6. ⏳ Implementar notificações em tempo real
7. ⏳ Adicionar gráficos com Chart.js

## 📞 SUPORTE

Caso encontre problemas:
1. Verificar console do navegador (F12)
2. Verificar logs do Supabase
3. Confirmar que todas as views foram criadas
4. Validar permissões RLS

---

**Versão**: 2.0.0  
**Data**: 04 de Janeiro de 2026  
**Compatibilidade**: Supabase + React 19.2.3 + Vite 7.3.0
