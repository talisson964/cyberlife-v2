# 📊 DOCUMENTAÇÃO COMPLETA - BANCO DE DADOS CYBERLIFE V2

## 📑 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Tabelas Necessárias](#tabelas-necessárias)
4. [Funcionalidades do Sistema](#funcionalidades-do-sistema)
5. [Políticas de Segurança (RLS)](#políticas-de-segurança-rls)
6. [Storage (Armazenamento de Imagens)](#storage-armazenamento-de-imagens)
7. [Fluxo de Dados](#fluxo-de-dados)

---

## 🎯 VISÃO GERAL

O **CyberLife V2** é uma plataforma completa de e-commerce geek/gamer que inclui:
- Sistema de autenticação de usuários
- Loja virtual com produtos
- Sistema de eventos e torneios
- Gerenciamento de carrinho de compras
- Painel administrativo
- Logs de acesso de usuários
- Perfil de usuários com nickname
- Sistema de vendas
- Sistema de inscrições em eventos

### Tecnologias Utilizadas
- **Frontend**: React + Vite
- **Backend/Database**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage (para imagens)
- **Estado Local**: LocalStorage (cache temporário)

---

## ⚙️ CONFIGURAÇÃO DO SUPABASE

### Credenciais (arquivo: `src/supabaseClient.js`)
```javascript
const supabaseUrl = 'https://tvukdcbvqweechmawdac.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Configurações de Autenticação
- **Auto Refresh Token**: Habilitado
- **Persist Session**: Habilitado  
- **Storage Key**: `cyberlife-auth-token`
- **Flow Type**: PKCE (recomendado para segurança)

---

## 📋 TABELAS NECESSÁRIAS

### 1. **PROFILES** (Perfis de Usuários)
**Descrição**: Armazena informações detalhadas dos usuários cadastrados.

**Campos**:
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID | ID do usuário (referência auth.users) | ✅ |
| `email` | TEXT | Email do usuário | ✅ |
| `full_name` | TEXT | Nome completo | ✅ |
| `nickname` | TEXT | Apelido/nome de exibição | ✅ |
| `age` | INTEGER | Idade | ❌ |
| `city` | TEXT | Cidade | ✅ |
| `state` | TEXT | Estado (UF) | ✅ |
| `whatsapp` | TEXT | Número WhatsApp | ❌ |
| `avatar_url` | TEXT | URL do avatar (Storage) | ❌ |
| `created_at` | TIMESTAMP | Data de criação | ✅ |
| `updated_at` | TIMESTAMP | Última atualização | ✅ |

**Usada em**: 
- LoginPage.jsx (cadastro e login)
- PerfilPage.jsx (exibição e edição)
- useAccessLog.js (dados do usuário nos logs)

---

### 2. **PRODUCTS** (Produtos da Loja)
**Descrição**: Catálogo completo de produtos disponíveis para venda.

**Campos**:
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | BIGSERIAL | ID único do produto | ✅ |
| `name` | TEXT | Nome do produto | ✅ |
| `description` | TEXT | Descrição detalhada | ✅ |
| `price` | DECIMAL(10,2) | Preço (ex: 199.90) | ✅ |
| `category` | TEXT | Categoria (geek, gamer, tech, etc) | ✅ |
| `type` | TEXT | Subcategoria (Action Figures, etc) | ❌ |
| `image_url` | TEXT | URL da imagem principal | ✅ |
| `hover_image_url` | TEXT | URL da imagem hover | ❌ |
| `stock` | INTEGER | Quantidade em estoque | ✅ |
| `active` | BOOLEAN | Produto ativo/inativo | ✅ |
| `created_at` | TIMESTAMP | Data de cadastro | ✅ |
| `updated_at` | TIMESTAMP | Última atualização | ✅ |

**Usada em**:
- AdminPanel.jsx (CRUD de produtos)
- LojaGeek.jsx (listagem e exibição)
- GameHouse.jsx (seção de loja)
- ProductDetailPage.jsx (detalhes do produto)
- CarrinhoPage.jsx (itens do carrinho)

**Imagens**: Armazenadas no Supabase Storage (bucket: `products`)

---

### 3. **BANNERS** (Banners Promocionais)
**Descrição**: Banners e ofertas exibidos em carrosséis.

**Campos**:
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | BIGSERIAL | ID único do banner | ✅ |
| `title` | TEXT | Título da oferta | ✅ |
| `discount` | TEXT | Desconto (ex: "ATÉ 50% OFF") | ❌ |
| `description` | TEXT | Descrição da promoção | ❌ |
| `image_url` | TEXT | URL da imagem do banner | ✅ |
| `link_url` | TEXT | URL de destino ao clicar | ❌ |
| `active` | BOOLEAN | Banner ativo/inativo | ✅ |
| `order` | INTEGER | Ordem de exibição | ❌ |
| `start_date` | DATE | Data de início da promoção | ❌ |
| `end_date` | DATE | Data de término | ❌ |
| `created_at` | TIMESTAMP | Data de criação | ✅ |

**Usada em**:
- AdminPanel.jsx (gerenciamento de banners)
- LojaGeek.jsx (carrossel de ofertas)

**Imagens**: Armazenadas no Supabase Storage (bucket: `banners`)

---

### 4. **EVENTS** (Eventos e Torneios)
**Descrição**: Eventos, torneios, corujões e rush plays.

**Campos**:
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | BIGSERIAL | ID único do evento | ✅ |
| `title` | TEXT | Nome do evento | ✅ |
| `slug` | TEXT | Slug para URL (único) | ✅ |
| `description` | TEXT | Descrição completa | ✅ |
| `type` | TEXT | Tipo (Torneio, Corujão, Rush Play) | ✅ |
| `date` | DATE | Data do evento | ✅ |
| `prize` | TEXT | Premiação (ex: "R$ 15.000") | ❌ |
| `inscription_info` | TEXT | Info sobre inscrições | ❌ |
| `inscription_deadline` | DATE | Prazo de inscrição | ❌ |
| `max_participants` | INTEGER | Máximo de participantes | ❌ |
| `image_url` | TEXT | URL da imagem do evento | ✅ |
| `rules` | JSONB | Regras do evento (array) | ❌ |
| `schedule` | JSONB | Cronograma (array) | ❌ |
| `active` | BOOLEAN | Evento ativo/inativo | ✅ |
| `created_at` | TIMESTAMP | Data de criação | ✅ |
| `updated_at` | TIMESTAMP | Última atualização | ✅ |

**Usada em**:
- AdminPanel.jsx (CRUD de eventos)
- GameHouse.jsx (listagem de eventos)
- EventoPage.jsx (detalhes do evento)

**Imagens**: Armazenadas no Supabase Storage (bucket: `events`)

---

### 5. **EVENT_REGISTRATIONS** (Inscrições em Eventos)
**Descrição**: Registro de inscrições de usuários nos eventos.

**Campos**:
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | BIGSERIAL | ID único da inscrição | ✅ |
| `event_id` | BIGINT | ID do evento (FK) | ✅ |
| `user_id` | UUID | ID do usuário (FK) | ✅ |
| `user_nickname` | TEXT | Nickname do participante | ✅ |
| `user_email` | TEXT | Email do participante | ✅ |
| `user_whatsapp` | TEXT | WhatsApp para contato | ❌ |
| `team_name` | TEXT | Nome da equipe (se aplicável) | ❌ |
| `additional_info` | JSONB | Informações adicionais | ❌ |
| `status` | TEXT | Status (pending, confirmed, cancelled) | ✅ |
| `created_at` | TIMESTAMP | Data da inscrição | ✅ |

**Constraint**: UNIQUE (event_id, user_id) - Evita inscrições duplicadas

**Usada em**:
- EventoPage.jsx (formulário de inscrição)
- AdminPanel.jsx (gestão de inscritos)
- PerfilPage.jsx (eventos inscritos do usuário)

---

### 6. **ORDERS** (Pedidos/Vendas)
**Descrição**: Registro de todas as vendas realizadas.

**Campos**:
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | BIGSERIAL | ID único do pedido | ✅ |
| `order_number` | TEXT | Número do pedido (único) | ✅ |
| `user_id` | UUID | ID do usuário (FK) | ❌ |
| `user_email` | TEXT | Email do comprador | ✅ |
| `user_name` | TEXT | Nome do comprador | ✅ |
| `user_whatsapp` | TEXT | WhatsApp para contato | ❌ |
| `items` | JSONB | Itens do pedido (array) | ✅ |
| `subtotal` | DECIMAL(10,2) | Subtotal dos produtos | ✅ |
| `shipping` | DECIMAL(10,2) | Valor do frete | ✅ |
| `total` | DECIMAL(10,2) | Valor total | ✅ |
| `status` | TEXT | Status (pending, paid, shipped, delivered, cancelled) | ✅ |
| `payment_method` | TEXT | Método de pagamento | ❌ |
| `payment_status` | TEXT | Status do pagamento | ❌ |
| `shipping_address` | JSONB | Endereço de entrega | ❌ |
| `notes` | TEXT | Observações | ❌ |
| `created_at` | TIMESTAMP | Data do pedido | ✅ |
| `updated_at` | TIMESTAMP | Última atualização | ✅ |

**Exemplo de `items` (JSONB)**:
```json
[
  {
    "id": 1,
    "name": "Action Figure Superman",
    "price": 199.90,
    "quantity": 2,
    "image_url": "https://..."
  }
]
```

**Usada em**:
- CarrinhoPage.jsx (finalização de compra)
- AdminPanel.jsx (gestão de pedidos)
- PerfilPage.jsx (histórico de compras)

---

### 7. **ACCESS_LOGS** (Logs de Acesso)
**Descrição**: Registra todos os acessos ao site para análise.

**Campos**:
| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | BIGSERIAL | ID único do log | ✅ |
| `user_id` | UUID | ID do usuário (NULL se anônimo) | ❌ |
| `user_email` | TEXT | Email do usuário | ❌ |
| `user_name` | TEXT | Nome do usuário | ❌ |
| `access_date` | TIMESTAMP | Data e hora do acesso | ✅ |
| `access_hour` | TIME | Hora do acesso | ✅ |
| `city` | TEXT | Cidade do usuário | ❌ |
| `state` | TEXT | Estado do usuário | ❌ |
| `ip_address` | TEXT | Endereço IP | ❌ |
| `user_agent` | TEXT | Navegador/dispositivo | ❌ |
| `page_visited` | TEXT | Página acessada | ✅ |
| `session_id` | TEXT | ID da sessão | ❌ |
| `created_at` | TIMESTAMP | Data de criação | ✅ |

**Usada em**:
- useAccessLog.js (registro automático)
- AccessLogsView.jsx (visualização admin)
- AdminPanel.jsx (análise de dados)

---

## 🔐 POLÍTICAS DE SEGURANÇA (RLS)

O Supabase usa **Row Level Security (RLS)** para proteger os dados.

### Políticas por Tabela:

#### **PROFILES**
```sql
-- Usuários podem ler todos os perfis públicos
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

-- Usuários podem editar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

#### **PRODUCTS**
```sql
-- Todos podem visualizar produtos ativos
CREATE POLICY "Anyone can view active products" 
  ON products FOR SELECT USING (active = true);

-- Apenas admin pode inserir/atualizar/deletar
CREATE POLICY "Only admin can modify products" 
  ON products FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### **BANNERS**
```sql
-- Todos podem visualizar banners ativos
CREATE POLICY "Anyone can view active banners" 
  ON banners FOR SELECT USING (active = true);

-- Apenas admin pode modificar
CREATE POLICY "Only admin can modify banners" 
  ON banners FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### **EVENTS**
```sql
-- Todos podem visualizar eventos ativos
CREATE POLICY "Anyone can view active events" 
  ON events FOR SELECT USING (active = true);

-- Apenas admin pode modificar
CREATE POLICY "Only admin can modify events" 
  ON events FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### **EVENT_REGISTRATIONS**
```sql
-- Usuários podem ver suas próprias inscrições
CREATE POLICY "Users can view own registrations" 
  ON event_registrations FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem se inscrever
CREATE POLICY "Users can register for events" 
  ON event_registrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin pode ver todas as inscrições
CREATE POLICY "Admin can view all registrations" 
  ON event_registrations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### **ORDERS**
```sql
-- Usuários podem ver apenas seus pedidos
CREATE POLICY "Users can view own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Usuários podem criar pedidos
CREATE POLICY "Users can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

-- Admin pode ver todos os pedidos
CREATE POLICY "Admin can view all orders" 
  ON orders FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### **ACCESS_LOGS**
```sql
-- Sistema pode inserir logs
CREATE POLICY "System can insert logs" 
  ON access_logs FOR INSERT 
  WITH CHECK (true);

-- Admin pode ver todos os logs
CREATE POLICY "Admin can view all logs" 
  ON access_logs FOR SELECT 
  USING (true);
```

---

## 📦 STORAGE (ARMAZENAMENTO DE IMAGENS)

### Buckets Necessários:

#### 1. **products** (Imagens de Produtos)
- **Tipo**: Public
- **Tamanho máximo**: 5MB por arquivo
- **Formatos aceitos**: JPG, PNG, WEBP, AVIF
- **Estrutura**: `/products/{product_id}/{image_name}.jpg`

#### 2. **banners** (Imagens de Banners)
- **Tipo**: Public
- **Tamanho máximo**: 10MB por arquivo
- **Formatos aceitos**: JPG, PNG, WEBP
- **Estrutura**: `/banners/{banner_id}/{image_name}.jpg`

#### 3. **events** (Imagens de Eventos)
- **Tipo**: Public
- **Tamanho máximo**: 5MB por arquivo
- **Formatos aceitos**: JPG, PNG, WEBP
- **Estrutura**: `/events/{event_id}/{image_name}.jpg`

#### 4. **avatars** (Fotos de Perfil)
- **Tipo**: Public
- **Tamanho máximo**: 2MB por arquivo
- **Formatos aceitos**: JPG, PNG
- **Estrutura**: `/avatars/{user_id}/{avatar_name}.jpg`

### Políticas de Storage:

```sql
-- Bucket: products
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Bucket: banners
CREATE POLICY "Anyone can view banner images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Admin can upload banner images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Bucket: events
CREATE POLICY "Anyone can view event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'events');

CREATE POLICY "Admin can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'events' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Bucket: avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 🔄 FLUXO DE DADOS

### 1. **Autenticação e Perfil**
```
LoginPage → Supabase Auth → Profile criado automaticamente (trigger)
```

### 2. **Gestão de Produtos (Admin)**
```
AdminPanel → Upload de imagem (Storage) → Insert/Update em products
```

### 3. **Carrinho e Checkout**
```
LojaGeek → LocalStorage (carrinho temporário) → CarrinhoPage → 
Finalizar compra → Insert em orders → Email confirmação
```

### 4. **Inscrição em Eventos**
```
EventoPage → Formulário → Insert em event_registrations → 
Email confirmação
```

### 5. **Logs de Acesso**
```
Toda navegação → useAccessLog → Insert em access_logs
```

---

## 📊 QUERIES ÚTEIS

### Produtos mais vendidos:
```sql
SELECT 
  p.name,
  SUM((item->>'quantity')::int) as total_vendido
FROM orders o,
     jsonb_array_elements(o.items) item
JOIN products p ON p.id = (item->>'id')::bigint
GROUP BY p.name
ORDER BY total_vendido DESC
LIMIT 10;
```

### Eventos com mais inscrições:
```sql
SELECT 
  e.title,
  COUNT(er.id) as total_inscricoes
FROM events e
LEFT JOIN event_registrations er ON er.event_id = e.id
GROUP BY e.id, e.title
ORDER BY total_inscricoes DESC;
```

### Receita total:
```sql
SELECT 
  SUM(total) as receita_total,
  COUNT(*) as total_pedidos
FROM orders
WHERE status IN ('paid', 'shipped', 'delivered');
```

### Usuários mais ativos:
```sql
SELECT 
  user_email,
  user_name,
  COUNT(*) as total_acessos
FROM access_logs
WHERE user_id IS NOT NULL
GROUP BY user_email, user_name
ORDER BY total_acessos DESC
LIMIT 20;
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Banco de Dados:
- [ ] Executar script SQL completo
- [ ] Criar buckets no Storage
- [ ] Configurar políticas RLS
- [ ] Configurar políticas de Storage
- [ ] Criar triggers e functions

### Backend/Supabase:
- [ ] Configurar autenticação por email
- [ ] Configurar templates de email
- [ ] Configurar webhooks (opcional)
- [ ] Testar políticas de segurança

### Frontend:
- [ ] Integrar upload de imagens
- [ ] Sincronizar localStorage com banco
- [ ] Implementar checkout completo
- [ ] Implementar sistema de inscrições
- [ ] Adicionar campo nickname no perfil
- [ ] Testar fluxo completo

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar o script SQL** (arquivo: `CYBERLIFE-DATABASE-COMPLETE.sql`)
2. **Configurar Storage** no painel do Supabase
3. **Testar autenticação** e criação de perfil
4. **Migrar dados do localStorage** para o banco de dados
5. **Implementar upload de imagens** no AdminPanel
6. **Testar fluxo de compra** completo
7. **Testar sistema de eventos** e inscrições

---

## 📞 SUPORTE

Para dúvidas sobre a estrutura do banco de dados, consulte:
- Documentação oficial do Supabase: https://supabase.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Código fonte do projeto: `src/`

---

**Última atualização**: 04 de Janeiro de 2026
**Versão**: 2.0.0
