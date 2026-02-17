# 🔄 Mapeamento: Banco de Dados Antigo → Novo

Este documento mapeia todas as mudanças entre o banco de dados antigo e o novo (`novo-sql-definitivo`).

---

## 📊 TABELAS PRINCIPAIS

### 1. PROFILES (Perfis de Usuários)

| Campo Antigo | Campo Novo | Tipo | Mudanças |
|-------------|------------|------|----------|
| id | id | UUID | ✅ Mesmo tipo |
| email | email | TEXT | ✅ Mesmo tipo |
| full_name | full_name | TEXT | ✅ Mesmo tipo |
| nickname | nickname | TEXT | ✅ Mesmo tipo |
| age | age | INTEGER | ⚠️ Antigo: TEXT, Novo: INTEGER |
| city | city | TEXT | ✅ Mesmo tipo |
| state | state | TEXT | ✅ Mesmo tipo |
| whatsapp | whatsapp | TEXT | ✅ Mesmo tipo |
| avatar_url | avatar_url | TEXT | ✅ Mesmo tipo |
| is_admin | ❌ REMOVIDO | - | Campo removido |
| created_at | created_at | TIMESTAMPTZ | ✅ Mesmo tipo |
| updated_at | updated_at | TIMESTAMPTZ | ✅ Mesmo tipo |
| ❌ NOVO | cyber_points | INTEGER DEFAULT 100 | 🆕 Novo campo |
| ❌ NOVO | current_xp | INTEGER DEFAULT 0 | 🆕 Novo campo |
| ❌ NOVO | level | INTEGER DEFAULT 1 | 🆕 Novo campo |
| ❌ NOVO | badges_count | INTEGER DEFAULT 0 | 🆕 Novo campo |
| ❌ NOVO | birth_date | TEXT | 🆕 Novo campo (substitui age) |

**Ações necessárias:**
- Remover uso de `is_admin` do código
- Adicionar suporte para `cyber_points`, `current_xp`, `level`, `badges_count`
- Atualizar `age` para INTEGER se necessário

---

### 2. EVENTS (Eventos)

| Campo Antigo | Campo Novo | Tipo | Mudanças |
|-------------|------------|------|----------|
| id | id | BIGSERIAL → UUID | ⚠️ **MUDANÇA CRÍTICA** |
| title | title | TEXT | ✅ Mesmo tipo |
| slug | ❌ REMOVIDO | - | Campo removido |
| description | description | TEXT | ✅ Mesmo tipo |
| date | date | DATE → TIMESTAMPTZ | ⚠️ Mudança de tipo |
| prize | prize | TEXT | ✅ Mesmo tipo |
| inscription_info | ❌ REMOVIDO | - | Campo removido |
| inscription_deadline | ❌ REMOVIDO | - | Campo removido |
| max_participants | max_participants | INTEGER | ✅ Mesmo tipo |
| current_participants | current_participants | INTEGER | ✅ Mesmo tipo |
| image_url | image_url | TEXT | ✅ Mesmo tipo |
| rules | ❌ REMOVIDO | JSONB | Campo removido |
| schedule | ❌ REMOVIDO | JSONB | Campo removido |
| active | active | BOOLEAN | ✅ Mesmo tipo |
| created_at | created_at | TIMESTAMPTZ | ✅ Mesmo tipo |
| updated_at | ❌ REMOVIDO | - | Campo removido |
| ❌ NOVO | inscription_price | INTEGER DEFAULT 0 | 🆕 Novo campo |
| ❌ NOVO | game_name | TEXT | 🆕 Novo campo |
| ❌ NOVO | type | TEXT | 🆕 Novo campo |
| ❌ NOVO | status | TEXT DEFAULT 'active' | 🆕 Novo campo |

**Ações necessárias:**
- **CRÍTICO:** `id` agora é UUID, não BIGSERIAL
- Remover uso de `slug` (usar `id` ou `title` para rotas)
- Atualizar `date` de DATE para TIMESTAMPTZ
- Remover uso de `rules`, `schedule`, `inscription_info`
- Adicionar suporte para `inscription_price`, `game_name`, `type`, `status`

---

### 3. EVENT_REGISTRATIONS (Inscrições em Eventos)

| Campo Antigo | Campo Novo | Tipo | Mudanças |
|-------------|------------|------|----------|
| id | id | BIGSERIAL → UUID | ⚠️ **MUDANÇA CRÍTICA** |
| event_id | event_id | BIGINT → UUID | ⚠️ **MUDANÇA CRÍTICA** |
| user_id | user_id | UUID | ✅ Mesmo tipo |
| user_nickname | ❌ REMOVIDO | - | Campo removido |
| user_email | ❌ REMOVIDO | - | Campo removido |
| user_whatsapp | ❌ REMOVIDO | - | Campo removido |
| team_name | ❌ REMOVIDO | - | Campo removido |
| additional_info | ❌ REMOVIDO | JSONB | Campo removido |
| status | ❌ REMOVIDO | TEXT | Campo removido |
| created_at | created_at | TIMESTAMPTZ | ✅ Mesmo tipo |

**Ações necessárias:**
- **CRÍTICO:** `id` e `event_id` agora são UUID
- Remover uso de `user_nickname`, `user_email`, `status`, etc.
- Simplificar formulário de inscrição

---

### 4. PRODUCTS (Produtos)

| Campo Antigo | Campo Novo | Tipo | Mudanças |
|-------------|------------|------|----------|
| id | id | BIGSERIAL → UUID | ⚠️ **MUDANÇA CRÍTICA** |
| name | name | TEXT | ✅ Mesmo tipo |
| description | description | TEXT | ✅ Mesmo tipo |
| price | price | DECIMAL(10,2) | ✅ Mesmo tipo |
| category | category | TEXT | ✅ Mesmo tipo |
| type | ❌ REMOVIDO | TEXT | Campo removido |
| image_url | image_url | TEXT | ✅ Mesmo tipo |
| hover_image_url | ❌ REMOVIDO | TEXT | Campo removido |
| stock | stock | INTEGER | ✅ Mesmo tipo |
| active | ❌ REMOVIDO | BOOLEAN | Campo removido |
| created_at | created_at | TIMESTAMPTZ | ✅ Mesmo tipo |
| updated_at | ❌ REMOVIDO | - | Campo removido |
| ❌ NOVO | images | ❌ REMOVIDO | Campo removido |
| ❌ NOVO | model_3d | ❌ REMOVIDO | Campo removido |
| ❌ NOVO | reward_points | ❌ REMOVIDO | Campo removido |

**Ações necessárias:**
- **CRÍTICO:** `id` agora é UUID
- Remover uso de `hover_image_url`, `type`, `active`
- Remover upload de múltiplas imagens e modelo 3D (se não existir mais)

---

### 5. BANNERS

| Campo Antigo | Campo Novo | Tipo | Mudanças |
|-------------|------------|------|----------|
| id | id | BIGSERIAL → UUID | ⚠️ **MUDANÇA CRÍTICA** |
| title | title | TEXT | ✅ Mesmo tipo |
| discount | discount | TEXT | ✅ Mesmo tipo |
| description | description | TEXT | ✅ Mesmo tipo |
| image_url | image_url | TEXT | ✅ Mesmo tipo |
| link_url | link_url | TEXT | ✅ Mesmo tipo |
| active | active | BOOLEAN | ✅ Mesmo tipo |
| order | order | INTEGER | ✅ Mesmo tipo |
| start_date | ❌ REMOVIDO | DATE | Campo removido |
| end_date | ❌ REMOVIDO | DATE | Campo removido |
| created_at | created_at | TIMESTAMPTZ | ✅ Mesmo tipo |
| updated_at | ❌ REMOVIDO | - | Campo removido |
| ❌ NOVO | original_price | ❌ REMOVIDO | Campo removido |
| ❌ NOVO | final_price | ❌ REMOVIDO | Campo removido |
| ❌ NOVO | reward_points | ❌ REMOVIDO | Campo removido |

**Ações necessárias:**
- **CRÍTICO:** `id` agora é UUID
- Remover uso de `start_date`, `end_date`, `original_price`, `final_price`, `reward_points`

---

### 6. LIVES (Transmissões Ao Vivo) - NOVA TABELA

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| title | TEXT | Título da live |
| description | TEXT | Descrição |
| thumbnail_url | TEXT | URL da thumbnail |
| stream_url | TEXT | URL da stream |
| viewer_count | INTEGER | Contagem de espectadores |
| status | TEXT DEFAULT 'offline' | 'live' ou 'offline' |
| game_name | TEXT | Nome do jogo |
| started_at | TIMESTAMPTZ | Quando iniciou |
| created_at | TIMESTAMPTZ | Data de criação |

**Ações necessárias:**
- Criar componente para exibir lives
- Adicionar CRUD no AdminPanel

---

### 7. MISSIONS (Missões) - NOVA TABELA

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| title | TEXT | Título da missão |
| description | TEXT | Descrição |
| xp_reward | INTEGER | Recompensa em XP |
| cp_reward | INTEGER | Recompensa em CyberPoints |
| icon | TEXT | Ícone Lucide |
| type | TEXT DEFAULT 'daily' | 'daily', 'weekly', 'achievement' |
| created_at | TIMESTAMPTZ | Data de criação |

**Ações necessárias:**
- Atualizar componente UserMissions.jsx
- Adicionar CRUD no AdminPanel

---

### 8. BADGES (Insígnias) - NOVA TABELA

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| name | TEXT | Nome da insígnia |
| description | TEXT | Descrição |
| image_url | TEXT | URL da imagem |
| icon_url | TEXT | URL do ícone |
| rarity | TEXT DEFAULT 'comum' | 'comum', 'rara', 'epica', 'lendaria' |
| created_at | TIMESTAMPTZ | Data de criação |

**Ações necessárias:**
- Atualizar sistema de insígnias
- Adicionar campo `rarity` no display

---

### 9. USER_BADGES (Insígnias do Usuário) - NOVA TABELA

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | ID do usuário |
| badge_id | UUID | ID da insígnia |
| obtained_at | TIMESTAMPTZ | Data de obtenção |

**Ações necessárias:**
- Atualizar queries para usar UUIDs
- Usar `obtained_at` em vez de `created_at`

---

### 10. USER_MISSIONS (Missões do Usuário) - NOVA TABELA

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | ID do usuário |
| mission_id | UUID | ID da missão |
| completed | BOOLEAN | Se está completa |
| completed_at | TIMESTAMPTZ | Data de conclusão |
| progress | INTEGER | Progresso atual |
| created_at | TIMESTAMPTZ | Data de criação |

**Ações necessárias:**
- Atualizar componente UserMissions.jsx
- Usar UUIDs em vez de BIGINT

---

### 11. ACTIVITIES (Notificações/Histórico) - NOVA TABELA

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | ID do usuário |
| type | TEXT | 'system', 'reward', 'event', 'security' |
| title | TEXT | Título |
| message | TEXT | Mensagem |
| read | BOOLEAN | Se foi lida |
| created_at | TIMESTAMPTZ | Data de criação |

**Ações necessárias:**
- Substituir tabela `notifications` por `activities`
- Atualizar NotificationBell.jsx

---

## 🔑 MUDANÇAS CRÍTICAS

### 1. IDs agora são UUIDs
- `events.id`: BIGSERIAL → UUID
- `products.id`: BIGSERIAL → UUID
- `banners.id`: BIGSERIAL → UUID
- `event_registrations.id`: BIGSERIAL → UUID
- `event_registrations.event_id`: BIGINT → UUID

**Impacto:** Todo o código que referencia IDs como números precisa ser atualizado.

### 2. Campos Removidos
- `profiles.is_admin`
- `events.slug`, `events.rules`, `events.schedule`
- `event_registrations.status`, `user_nickname`, etc.
- `products.hover_image_url`, `products.type`, `products.active`
- `banners.start_date`, `banners.end_date`

### 3. Novos Campos Importantes
- `profiles.cyber_points`, `profiles.current_xp`, `profiles.level`, `profiles.badges_count`
- `events.inscription_price`, `events.game_name`, `events.status`
- `missions.*`, `badges.*`, `lives.*`, `activities.*`

---

## 📝 ARQUIVOS QUE PRECISAM DE ATUALIZAÇÃO

1. **src/supabaseClient.js** - ✅ OK (não muda)
2. **src/screens/AdminPanel3.jsx** - ⚠️ CRÍTICO
3. **src/screens/EventoPage.jsx** - ⚠️ CRÍTICO (slug removido)
4. **src/screens/GameHouse.jsx** - ⚠️ CRÍTICO (lives)
5. **src/screens/LojaGeek.jsx** - ⚠️ CRÍTICO (products UUID)
6. **src/screens/PerfilPage.jsx** - ⚠️ CRÍTICO (novos campos)
7. **src/screens/ProductDetailPage.jsx** - ⚠️ CRÍTICO
8. **src/screens/GamerWorld.jsx** - ⚠️ CRÍTICO
9. **src/components/UserMissions.jsx** - ⚠️ CRÍTICO
10. **src/components/NotificationBell.jsx** - ⚠️ CRÍTICO (notifications → activities)
11. **src/components/MissionsManager.jsx** - ⚠️ CRÍTICO
12. **src/components/PlayerLevel.jsx** - ⚠️ CRÍTICO

---

## 🚀 ORDEM DE ATUALIZAÇÃO RECOMENDADA

1. Perfis de usuário (profiles)
2. Produtos (products)
3. Banners (banners)
4. Eventos (events) + Inscrições (event_registration)
5. Lives (lives)
6. Missões (missions + user_missions)
7. Insígnias (badges + user_badges)
8. Notificações (activities)

---

## ⚠️ ATENÇÃO

- **Backup do banco atual antes de migrar**
- **Testar em ambiente de desenvolvimento primeiro**
- **Atualizar RLS policies conforme necessário**
- **Verificar funções RPC (complete_mission, register_for_event_with_cyberpoints, etc.)**
