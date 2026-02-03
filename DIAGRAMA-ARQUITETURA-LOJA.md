# 📊 Diagrama da Arquitetura - Loja Geek CyberLife

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     🛒 LOJA GEEK CENTRALIZADA                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    src/data/lojaData.js                         │  │
│  │                   (24 PRODUTOS - FONTE ÚNICA)                   │  │
│  │                                                                  │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐│  │
│  │  │   GEEK (8)      │  │   GAMER (8)     │  │  SMARTHOME (8)   ││  │
│  │  │  ★ Action Fig   │  │  ★ Mouse        │  │  ★ Lâmpada       ││  │
│  │  │  ★ Coleções     │  │  ★ Teclado      │  │  ★ Câmeras       ││  │
│  │  │  ★ Miniaturas   │  │  ★ Monitor      │  │  ★ Sensores      ││  │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────┘│  │
│  │                                                                  │  │
│  │  Funções Exportadas:                                            │  │
│  │  • allProducts → Array completo (24 itens)                     │  │
│  │  • getProductsByCategory(cat) → Filtra por categoria          │  │
│  │  • getTypesByCategory(cat) → Tipos dentro da categoria        │  │
│  │  • defaultOffers → Ofertas padrão                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                   ┌────────────────┼────────────────┐
                   │                │                │
                   ▼                ▼                ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │  LojaGeek.jsx    │  │ GamerWorld.jsx    │  │ SmartHome.jsx    │
         │  (GEEK)          │  │ (GAMER)          │  │ (SMARTHOME)      │
         │                  │  │                  │  │                  │
         │ ★ Importa:       │  │ ★ Importa:       │  │ ★ Importa:       │
         │ allProducts      │  │ allProducts      │  │ allProducts      │
         │                  │  │                  │  │                  │
         │ ★ Exibe:         │  │ ★ Exibe:         │  │ ★ Exibe:         │
         │ 24 produtos      │  │ 4 produtos       │  │ Todos produtos   │
         │                  │  │ (amostra)        │  │                  │
         │ ★ Destaca:       │  │ ★ Destaca:       │  │ ★ Destaca:       │
         │ Categoria GEEK   │  │ Categoria GAMER  │  │ Cat SMARTHOME    │
         │ (borda roxa)     │  │ (borda cyan)     │  │ (borda cyan)     │
         │                  │  │                  │  │                  │
         │ ★ Filtros:       │  │ ★ Filtros:       │  │ ★ Filtros:       │
         │ 6 subcategorias  │  │ Integrado        │  │ 6 subcategorias  │
         │                  │  │                  │  │                  │
         │ ★ Paginação:     │  │ ★ Modo:          │  │ ★ Paginação:     │
         │ SIM (8/página)   │  │ Vitrine (4 items)│  │ SIM (8/página)   │
         └──────────────────┘  └──────────────────┘  └──────────────────┘
         (Página Completa)      (Seção na página)   (Template pronto)
                   │                │                │
                   └────────────────┼────────────────┘
                                    │
                                    ▼
                   ┌─────────────────────────────────┐
                   │   localStorage (SINCRONIZADO)   │
                   │                                 │
                   │ cyberlife_products (24 items)   │
                   │ cyberlife_cart                  │
                   │ cyberlife_offers                │
                   └─────────────────────────────────┘
                                    │
                                    ▼
                   ┌─────────────────────────────────┐
                   │   Carrinho Compartilhado        │
                   │                                 │
                   │ Mesmo carrinho em todas as      │
                   │ páginas! (ID único do produto)  │
                   └─────────────────────────────────┘
```

---

## 🎯 Fluxo de Dados

### 1. Carregamento Inicial
```
Usuario acessa LojaGeek
    ↓
Importa allProducts de lojaData.js
    ↓
Salva no localStorage
    ↓
Renderiza 24 produtos com destaque GEEK
```

### 2. Adição ao Carrinho
```
Usuario clica "Adicionar ao Carrinho"
    ↓
Busca product.id (único em toda loja)
    ↓
Verifica se já existe no carrinho
    ↓
Atualiza quantidade OU adiciona novo item
    ↓
Salva em localStorage['cyberlife_cart']
    ↓
Contador de carrinho atualiza
```

### 3. Navegação Entre Páginas
```
Usuario vai de LojaGeek → GameHouse
    ↓
GameHouse importa allProducts (mesmos dados)
    ↓
localStorage sincroniza automaticamente
    ↓
Carrinho mantém mesmos itens
    ↓
GameHouse mostra produtos com destaque GAMER
```

---

## 🎨 Estrutura Visual de Destaque

### GEEK (LojaGeek.jsx)
```
┌─────────────────────────────────┐
│  ★ DESTAQUE (Roxo/Magenta)     │  ← Badge #ff00ea
├─────────────────────────────────┤
│                                 │
│         Imagem Produto          │
│                                 │
├─────────────────────────────────┤
│ Nome: Funko Pop Batman          │
│ Categoria: GEEK                 │  ← Texto magenta
│ Preço: R$ 129,90                │
│                                 │
│ [Adicionar ao Carrinho]         │
│                                 │
└─────────────────────────────────┘  ← Borda roxa (#ff00ea)
   Glow effect roxo
```

### GAMER (GamerWorld.jsx)
```
┌─────────────────────────────────┐
│  ★ DESTAQUE (Cyan)              │  ← Badge #00d9ff
├─────────────────────────────────┤
│ Mouse Gamer RGB Pro             │
│ DPI ajustável até 16.000        │
│ R$ 299,90                       │
│                                 │
│ [COMPRAR AGORA]                 │
│                                 │
└─────────────────────────────────┘  ← Borda cyan (#00d9ff)
   Glow effect cyan
```

---

## 📈 Distribuição de Produtos

### Visão Geral
```
TOTAL: 24 Produtos

GEEK (8 produtos)        GAMER (8 produtos)       SMARTHOME (8 produtos)
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ 1. Funko Pop     │    │ 9. Mouse         │    │ 17. Lâmpada      │
│ 2. Iron Man      │    │ 10. Teclado      │    │ 18. Tomada       │
│ 3. Caneca        │    │ 11. Headset      │    │ 19. Campainha    │
│ 4. Millenium     │    │ 12. Mousepad     │    │ 20. Câmera       │
│ 5. Spiderman     │    │ 13. Cadeira      │    │ 21. Fechadura    │
│ 6. Camiseta      │    │ 14. Monitor      │    │ 22. Hub          │
│ 7. DeLorean      │    │ 15. Suporte      │    │ 23. Sensor       │
│ 8. Poster        │    │ 16. Conversor    │    │ 24. Controle     │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 🔀 Sincronização Entre Páginas

### localStorage Compartilhado
```
┌─────────────────────────────────────────────────────────┐
│          localStorage['cyberlife_products']             │
│                                                         │
│  [                                                      │
│    {id: 1, name: 'Funko...', category: 'geek'},      │
│    {id: 2, name: 'Iron Man...', category: 'geek'},   │
│    ...                                                 │
│    {id: 9, name: 'Mouse...', category: 'gamer'},     │
│    ...                                                 │
│    {id: 17, name: 'Lâmpada...', category: 'smart'},  │
│    ...                                                 │
│  ]                                                     │
│                                                         │
│  ✅ Acessível de qualquer página                      │
│  ✅ Atualizado quando produtos mudam                  │
│  ✅ Mantém sincronização entre abas                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           localStorage['cyberlife_cart']                │
│                                                         │
│  [                                                      │
│    {id: 1, name: 'Funko...', quantity: 2},          │
│    {id: 12, name: 'Mousepad...', quantity: 1},      │
│    {id: 20, name: 'Câmera...', quantity: 1}         │
│  ]                                                     │
│                                                         │
│  ✅ Mesmo carrinho em todas as páginas                │
│  ✅ ID de produto vinculado aos dados centrais        │
│  ✅ Persistente entre sessões                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Identidade Visual por Página

| Aspecto | LojaGeek | GameHouse | SmartHome |
|---------|----------|-----------|-----------|
| **Categoria** | GEEK | GAMER | SMARTHOME |
| **Cor Destaque** | #ff00ea (Roxa) | #00d9ff (Cyan) | #00d9ff (Cyan)* |
| **Badge** | ★ Roxo | ★ Cyan | ★ Cyan* |
| **Produtos Exib.** | 24 (todos) | 4 (amostra) | 24 (todos)* |
| **Layout** | Página completa | Seção vitrine | Página completa* |
| **Filtros** | 6 tipos | N/A | 6 tipos* |
| **Paginação** | Sim | Não | Sim* |

*SmartHome é um template pronto para customizar

---

## 💼 Caso de Uso: Compra Completa

```
1. Usuario acessa LojaGeek
   └─ Vê 24 produtos da loja geek
   └─ Destaque visual em produtos GEEK

2. Usuario busca por "Mouse"
   └─ Encontra "Mouse Gamer RGB Pro" (GAMER)
   └─ Mesmo produto está em todas as lojas

3. Usuario clica "Adicionar ao Carrinho"
   └─ Produto adicionado com ID único
   └─ localStorage sincroniza

4. Usuario navega para GameHouse
   └─ Mesmo produto está no carrinho
   └─ Agora vê destaque em GAMER

5. Usuario vai para Carrinho
   └─ Produtos de ambas lojas aparecem
   └─ Preços e IDs consistentes

6. Usuario finaliza compra
   └─ Dados sincronizados com API
   └─ Histórico de pedidos atualizado
```

---

## ✨ Benefícios Técnicos

```
┌─────────────────────────────────────────────┐
│   SEM ARQUITETURA ÚNICA                     │
├─────────────────────────────────────────────┤
│ ❌ Produtos duplicados em vários arquivos   │
│ ❌ Difícil manter sincronização             │
│ ❌ Risco de inconsistências                 │
│ ❌ Hard to scale para novas lojas          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│   COM ARQUITETURA ÚNICA ✅                 │
├─────────────────────────────────────────────┤
│ ✅ Fonte única de dados (DRY)               │
│ ✅ Sincronização automática                 │
│ ✅ Garantia de consistência                 │
│ ✅ Fácil adicionar novas lojas             │
│ ✅ Pronto para API real                    │
│ ✅ Melhor performance                       │
│ ✅ Mais seguro (menos lugares pra atualizar)│
└─────────────────────────────────────────────┘
```

---

## 🚀 Escalabilidade Futura

```
HOJE (v1)
└─ lojaData.js com dados hardcoded
   ├─ LojaGeek (GEEK)
   ├─ GameHouse (GAMER)
   └─ SmartHome.example (template)

AMANHÃ (v2) - Com Supabase
└─ API externa (Supabase)
   ├─ produtos table
   ├─ categorias table
   └─ ofertas table
   
   ├─ LojaGeek (auto-sync GEEK)
   ├─ GameHouse (auto-sync GAMER)
   └─ SmartHome (auto-sync SMARTHOME)

FUTURO (v3) - Admin Panel
└─ CRUD Interface
   ├─ Adicionar/editar/deletar produtos
   ├─ Gerir categorias
   ├─ Criar ofertas
   └─ Analytics em tempo real
   
   └─ Todas lojas atualizam em tempo real
```

---

## 📝 Resumo Executivo

| Item | Status | Detalhes |
|------|--------|----------|
| **Dados Centralizados** | ✅ | `lojaData.js` com 24 produtos |
| **LojaGeek Atualizada** | ✅ | Mostra todos + destaca GEEK |
| **GameHouse Atualizada** | ✅ | Amostra GAMER (4 produtos) |
| **SmartHome Template** | ✅ | Pronto para ser ativado |
| **Sincronização localStorage** | ✅ | Automática entre páginas |
| **Carrinho Compartilhado** | ✅ | Mesmo em todas as páginas |
| **Documentação Completa** | ✅ | 3 arquivos .md + exemplos |
| **Teste de Validação** | ✅ | Script JavaScript pronto |

**Status Geral:** ✅ **IMPLEMENTAÇÃO 100% COMPLETA**
