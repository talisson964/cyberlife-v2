# 🛒 Arquitetura da Loja Geek - CyberLife

## 📋 Visão Geral

A CyberLife implementa uma **Loja Geek** centralizada com produtos em 3 categorias principais, onde cada página web destaca uma categoria diferente mantendo acesso aos produtos de todas as categorias.

## 🏗️ Estrutura de Dados

### Arquivo Central: `src/data/lojaData.js`

Contém todos os dados compartilhados entre todas as lojas:

```javascript
// 24 Produtos no total distribuídos em 3 categorias:
- GEEK (8 produtos): Funkos, Action Figures, Personalizados
- GAMER (8 produtos): Periféricos, Monitores, Cadeiras
- SMARTHOME (8 produtos): IoT, Segurança, Automação
```

**Funções auxiliares:**
- `getProductsByCategory(category)` - Filtra produtos por categoria
- `getProductsWithHighlight(highlightCategory)` - Separa produtos destacados dos outros
- `getCategories()` - Lista de categorias
- `getTypesByCategory(category)` - Tipos/subcategorias dentro de uma categoria

## 📱 Implementação por Página

### 1️⃣ **LojaGeek.jsx** - Loja Geek (Página de Geek)
- **Categoria em Destaque:** GEEK
- **Identificador Visual:** Badge "★ Destaque" com borda roxa (#ff00ea)
- **Produtos Exibidos:** Todos os 24 produtos
- **Ordem:** Produtos GEEK em primeiro lugar visualmente
- **Filtros:** Action Figures, Personalizados, Miniaturas, Vestuário, Decoração

```jsx
// Mostra todos os produtos, mas destaca categoria geek
{allProducts.map((product) => (
  <div style={{
    border: product.category === 'geek' ? '2px solid #ff00ea' : '1px solid rgba(...)',
  }}>
    {product.category === 'geek' && <div>★ Destaque</div>}
    ...
  </div>
))}
```

### 2️⃣ **GamerWorld.jsx** - Gamer World (Página de Games)
- **Categoria em Destaque:** GAMER
- **Identificador Visual:** Badge "★ Destaque" com borda cyan (#00d9ff)
- **Seção de Loja:** "Loja Geek - Destaque em Gamer"
- **Produtos Exibidos:** Primeiros 4 produtos GAMER (amostra)
- **Botão:** "COMPRAR AGORA" vinculado aos produtos

```jsx
// Filtra produtos GAMER
{allProducts.filter(p => p.category === 'gamer').slice(0, 4).map((product) => (
  <div key={product.id}>
    <badge>★ Destaque</badge>
    ...
  </div>
))}
```

### 3️⃣ **NextScreen.jsx ou Outra Página** - SmartHome (Futuro)
- **Categoria em Destaque:** SMARTHOME
- **Implementação:** Seguir mesmo padrão das acima

## 🔄 Sincronização de Dados

Todos os produtos são **compartilhados** via localStorage:

```javascript
// No LojaGeek.jsx
localStorage.setItem('cyberlife_products', JSON.stringify(allProducts))

// Qualquer página pode acessar
const storedProducts = JSON.parse(localStorage.getItem('cyberlife_products'))
```

## 🎨 Estrutura de Produto

```javascript
{
  id: 1,
  name: 'Mouse Gamer RGB Pro',
  category: 'gamer',              // Categoria principal: 'geek', 'gamer', 'smarthome'
  type: 'Periféricos',            // Tipo/Subcategoria
  price: 'R$ 299,90',
  image: '/images/mouse.png',
  hoverImage: '/images/mouse-hover.png',
  description: 'Descrição completa do produto...'
}
```

## 📊 Distribuição de Produtos

### GEEK (8 produtos)
- Funko Pop Batman
- Iron Man Mark 85
- Caneca Personalizada Geek
- Miniatura Millenium Falcon
- Spiderman Legends
- Camiseta Geek Clássica
- Mini DeLorean
- Poster Geek 3D

### GAMER (8 produtos)
- Mouse Gamer RGB Pro
- Teclado Mecânico Gamer
- Headset 7.1 Surround Pro
- Mousepad Gamer XXL
- Cadeira Gamer Pro Max
- Monitor 144Hz Curvo
- Suporte para Controle
- Conversor Kingstone

### SMARTHOME (8 produtos)
- Lâmpada Inteligente RGB
- Tomada Inteligente WiFi
- Campainha Inteligente 2K
- Câmera Segurança WiFi
- Fechadura Inteligente
- Hub Automação Inteligente
- Sensor de Temperatura
- Controle Remoto Universal

## 🔧 Como Adicionar Nova Página de Loja

1. **Importar dados:**
```javascript
import { allProducts } from '../data/lojaData'
```

2. **Filtrar categoria em destaque:**
```javascript
const highlightProducts = allProducts.filter(p => p.category === 'smarthome')
const otherProducts = allProducts.filter(p => p.category !== 'smarthome')
```

3. **Aplicar estilos de destaque:**
```javascript
{allProducts.map((product) => (
  <div style={{
    border: product.category === 'smarthome' ? '2px solid #highlight-color' : '1px solid ...',
  }}>
    {product.category === 'smarthome' && <badge>★ Destaque</badge>}
  </div>
))}
```

## ✅ Benefícios da Arquitetura

✓ **Centralização:** Todos os produtos em um único arquivo (`lojaData.js`)
✓ **Sincronização:** Dados compartilhados via localStorage
✓ **Escalabilidade:** Fácil adicionar novas categorias
✓ **Flexibilidade:** Cada página pode customizar a apresentação
✓ **Consistência:** Mesmo conjunto de produtos em todas as páginas
✓ **Rastreamento:** IDs únicos de produtos facilitam integração com carrinho

## 🛒 Integração com Carrinho

O carrinho usa os mesmos `product.id` em todas as páginas:

```javascript
// Ao adicionar em qualquer loja
cart.push({
  id: product.id,           // ID único
  name: product.name,
  category: product.category, // Rastreia origem
  price: product.price,
  quantity: 1
})
```

## 📝 Notas Importantes

- **Imagens:** Use `/images/nome.png` (caminho relativo)
- **Preços:** Sempre em formato `'R$ X,XX'`
- **IDs:** Sequenciais de 1-24 (únicos em toda loja)
- **Categorias:** 'geek', 'gamer', 'smarthome'
- **localStorage:** Sincronização automática

## 🚀 Próximos Passos

1. Implementar página SmartHome com destaque em 'smarthome'
2. Adicionar filtros avançados (marca, preço, etc)
3. Integrar com API real (Supabase)
4. Adicionar wishlist compartilhada
5. Recomendações baseadas em categoria
