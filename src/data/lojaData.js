// Dados centralizados da Loja Geek
// Os produtos são compartilhados entre todas as páginas
// Cada página destaca uma categoria diferente

export const allProducts = [
  // ==================== CATEGORIA: GEEK ====================
  {
    id: 1,
    name: 'Funko Pop Batman',
    category: 'geek',
    price: 'R$ 129,90',
    image: '/images/funko1.png',
    hoverImage: '/images/funko1-hover.png',
    description: 'Funko Pop oficial do Batman. Colecionável de vinil com aproximadamente 10cm de altura. Perfeito para fãs do Cavaleiro das Trevas e colecionadores.',
    type: 'Action Figures'
  },
  {
    id: 2,
    name: 'Iron Man Mark 85',
    category: 'geek',
    price: 'R$ 299,90',
    image: '/images/ironman.png',
    hoverImage: '/images/ironman-hover.png',
    description: 'Action figure premium do Homem de Ferro Mark 85. Alta qualidade de acabamento, articulações móveis e detalhes incríveis. Edição especial Vingadores.',
    type: 'Action Figures'
  },
  {
    id: 3,
    name: 'Caneca Personalizada Geek',
    category: 'geek',
    price: 'R$ 49,90',
    image: '/images/caneca.png',
    hoverImage: '/images/caneca-hover.png',
    description: 'Caneca de porcelana 350ml com estampas geek exclusivas. Pode ser personalizada com seu design favorito. Resistente à lava-louças.',
    type: 'Personalizados'
  },
  {
    id: 4,
    name: 'Miniatura Millenium Falcon',
    category: 'geek',
    price: 'R$ 399,90',
    image: '/images/falcon.png',
    hoverImage: '/images/falcon-hover.png',
    description: 'Réplica detalhada da icônica nave Millennium Falcon de Star Wars. Escala 1:100 com mais de 200 peças. Item de colecionador premium.',
    type: 'Miniaturas'
  },
  {
    id: 5,
    name: 'Spiderman Legends',
    category: 'geek',
    price: 'R$ 199,90',
    image: '/images/spider.png',
    hoverImage: '/images/spider-hover.png',
    description: 'Action figure Marvel Legends do Homem-Aranha. Múltiplos pontos de articulação, acessórios inclusos e acabamento perfeito para poses dinâmicas.',
    type: 'Action Figures'
  },
  {
    id: 6,
    name: 'Camiseta Geek Clássica',
    category: 'geek',
    price: 'R$ 89,90',
    image: '/images/camiseta.png',
    hoverImage: '/images/camiseta-hover.png',
    description: 'Camiseta 100% algodão com estampas geek exclusivas. Alta qualidade de impressão, várias cores e tamanhos disponíveis. Confortável e durável.',
    type: 'Vestuário'
  },
  {
    id: 7,
    name: 'Mini DeLorean',
    category: 'geek',
    price: 'R$ 189,90',
    image: '/images/delorean.png',
    hoverImage: '/images/delorean-hover.png',
    description: 'Miniatura oficial do DeLorean de De Volta para o Futuro. Escala 1:24 com portas que abrem e detalhes luminosos. Peça de coleção autêntica.',
    type: 'Miniaturas'
  },
  {
    id: 8,
    name: 'Poster Geek 3D',
    category: 'geek',
    price: 'R$ 69,90',
    image: '/images/poster.png',
    hoverImage: '/images/poster-hover.png',
    description: 'Poster 3D premium de cinema e games. Moldura de alumínio, vidro protetor e LED integrado. Dimensões 50x70cm.',
    type: 'Decoração'
  },

  // ==================== CATEGORIA: GAMER ====================
  {
    id: 9,
    name: 'Mouse Gamer RGB Pro',
    category: 'gamer',
    price: 'R$ 299,90',
    image: '/images/mouse.png',
    hoverImage: '/images/mouse-hover.png',
    description: 'Mouse gamer com DPI ajustável até 16.000. 8 botões programáveis, RGB sincronizado e sensor óptico de alta precisão. Ideal para FPS e MOBA.',
    type: 'Periféricos'
  },
  {
    id: 10,
    name: 'Teclado Mecânico Gamer',
    category: 'gamer',
    price: 'R$ 549,90',
    image: '/images/keyboard.png',
    hoverImage: '/images/keyboard-hover.png',
    description: 'Teclado mecânico 100% com switches Blue, RGB customizável por tecla. Estrutura alumínio, anti-ghosting e suporte para macros.',
    type: 'Periféricos'
  },
  {
    id: 11,
    name: 'Headset 7.1 Surround Pro',
    category: 'gamer',
    price: 'R$ 399,90',
    image: '/images/headset.png',
    hoverImage: '/images/headset-hover.png',
    description: 'Headset com som 7.1 surround spatial. Microfone com cancelamento de ruído, controle de volume no cabo e conector USB. Conforto para longas sessões.',
    type: 'Audio'
  },
  {
    id: 12,
    name: 'Mousepad Gamer XXL',
    category: 'gamer',
    price: 'R$ 79,90',
    image: '/images/mousepad.png',
    hoverImage: '/images/mousepad-hover.png',
    description: 'Mousepad XXL 90x40cm com RGB integrado. Base antiderrapante, superfície de alta precisão e desenho exclusivo. Porta USB integrada.',
    type: 'Acessórios'
  },
  {
    id: 13,
    name: 'Cadeira Gamer Pro Max',
    category: 'gamer',
    price: 'R$ 1.299,90',
    image: '/images/cadeira.png',
    hoverImage: '/images/cadeira-hover.png',
    description: 'Cadeira gamer ergonômica com encosto reclinável até 180°. Suporte lombar ajustável, espuma de alta densidade e repouso de pés integrado.',
    type: 'Móveis'
  },
  {
    id: 14,
    name: 'Monitor 144Hz Curvo',
    category: 'gamer',
    price: 'R$ 1.899,90',
    image: '/images/monitor.png',
    hoverImage: '/images/monitor-hover.png',
    description: 'Monitor 27" 144Hz curved 1ms de resposta. FHD, painel VA, tecnologia FreeSync e suporte VESA. Alimentado para competição.',
    type: 'Monitores'
  },
  {
    id: 15,
    name: 'Suporte para Controle',
    category: 'gamer',
    price: 'R$ 49,90',
    image: '/images/suporte.png',
    hoverImage: '/images/suporte-hover.png',
    description: 'Suporte de parede para controles de videogame. Silicone protetor, adesivo de alta resistência. Comporta todos os modelos principais.',
    type: 'Acessórios'
  },
  {
    id: 16,
    name: 'Conversor Kingstone',
    category: 'gamer',
    price: 'R$ 199,90',
    image: '/images/conversor.png',
    hoverImage: '/images/conversor-hover.png',
    description: 'Conversor de controle para usar controles de console em PC. Compatível com Xbox e PlayStation. Conexão USB plug-and-play.',
    type: 'Adaptadores'
  },

  // ==================== CATEGORIA: SMARTHOME ====================
  {
    id: 17,
    name: 'Lâmpada Inteligente RGB',
    category: 'smarthome',
    price: 'R$ 89,90',
    image: '/images/lampada.png',
    hoverImage: '/images/lampada-hover.png',
    description: 'Lâmpada inteligente E27 16 milhões de cores. Controlável por app, controle por voz e temporizador. Economia de 80% de energia.',
    type: 'Iluminação'
  },
  {
    id: 18,
    name: 'Tomada Inteligente WiFi',
    category: 'smarthome',
    price: 'R$ 49,90',
    image: '/images/tomada.png',
    hoverImage: '/images/tomada-hover.png',
    description: 'Tomada inteligente com controle remoto via app. Medidor de consumo de energia, cronômetro e compatibilidade com assistentes de voz.',
    type: 'Energia'
  },
  {
    id: 19,
    name: 'Campainha Inteligente 2K',
    category: 'smarthome',
    price: 'R$ 299,90',
    image: '/images/campainha.png',
    hoverImage: '/images/campainha-hover.png',
    description: 'Campainha com câmera 2K, visão noturna e áudio bidirecional. Detecção de movimento, armazenamento em nuvem e alerta por app.',
    type: 'Segurança'
  },
  {
    id: 20,
    name: 'Câmera Segurança WiFi',
    category: 'smarthome',
    price: 'R$ 199,90',
    image: '/images/camera.png',
    hoverImage: '/images/camera-hover.png',
    description: 'Câmera IP 1080p com visão noturna infravermelha. Detecção de movimento, áudio bidirecional e armazenamento em nuvem automático.',
    type: 'Segurança'
  },
  {
    id: 21,
    name: 'Fechadura Inteligente',
    category: 'smarthome',
    price: 'R$ 599,90',
    image: '/images/fechadura.png',
    hoverImage: '/images/fechadura-hover.png',
    description: 'Fechadura eletrônica com controle por app, reconhecimento biométrico e código numérico. Bateria de longa duração e backup mecânico.',
    type: 'Segurança'
  },
  {
    id: 22,
    name: 'Hub Automação Inteligente',
    category: 'smarthome',
    price: 'R$ 399,90',
    image: '/images/hub.png',
    hoverImage: '/images/hub-hover.png',
    description: 'Hub central com suporte a 200+ dispositivos inteligentes. WiFi 6 integrado, backup de bateria e cenas personalizáveis.',
    type: 'Central'
  },
  {
    id: 23,
    name: 'Sensor de Temperatura',
    category: 'smarthome',
    price: 'R$ 69,90',
    image: '/images/sensor.png',
    hoverImage: '/images/sensor-hover.png',
    description: 'Sensor inteligente de temperatura e umidade. Display local, sincronização em nuvem e alertas configuráveis via app.',
    type: 'Sensores'
  },
  {
    id: 24,
    name: 'Controle Remoto Universal',
    category: 'smarthome',
    price: 'R$ 129,90',
    image: '/images/controle.png',
    hoverImage: '/images/controle-hover.png',
    description: 'Controle remoto IR inteligente para 500+ dispositivos. Controle por app, agendamento e compatibilidade com assistentes de voz.',
    type: 'Controle'
  },
]

// Ofertas padrão (aplica-se a todas as lojas)
export const defaultOffers = [
  {
    id: 1,
    title: "Mouse Gamer RGB",
    discount: "50% OFF",
    image: "/images/mouse.png",
    originalPrice: 199.90,
    finalPrice: 99.90,
    tag: "OFERTA ESPECIAL"
  },
  {
    id: 2,
    title: "Headset Pro X",
    discount: "40% OFF",
    image: "/images/headset.png",
    originalPrice: 399.90,
    finalPrice: 239.90,
    tag: "SUPER OFERTA"
  },
  {
    id: 3,
    title: "Teclado Mecânico",
    discount: "35% OFF",
    image: "/images/keyboard.png",
    originalPrice: 599.90,
    finalPrice: 389.90,
    tag: "IMPERDÍVEL"
  }
]

// Função auxiliar para obter produtos por categoria
export const getProductsByCategory = (category) => {
  return allProducts.filter(product => product.category === category)
}

// Função auxiliar para organizar produtos com categoria em destaque
export const getProductsWithHighlight = (highlightCategory) => {
  const highlighted = getProductsByCategory(highlightCategory)
  const others = allProducts.filter(product => product.category !== highlightCategory)
  return {
    highlighted,
    others,
    all: allProducts
  }
}

// Função auxiliar para obter categorias únicas
export const getCategories = () => {
  return ['geek', 'gamer', 'smarthome']
}

// Função auxiliar para obter tipos de produtos por categoria
export const getTypesByCategory = (category) => {
  const products = getProductsByCategory(category)
  const types = [...new Set(products.map(p => p.type))]
  return types
}
