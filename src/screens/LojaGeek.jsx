import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Instagram, Store, ShoppingBag, MessageCircle, Mail, MapPin, Phone, Zap, Heart, ArrowRight } from 'lucide-react'
import geekConvention from '../imagens/Geek convention-rafiki.png'
import { defaultOffers } from '../data/lojaData'
import { supabase } from '../supabaseClient'
import { stopAudio } from '../utils/audioPlayer'

// Função para formatar preços para reais brasileiros
const formatPrice = (price) => {
  // Se já é uma string formatada, retorna como está
  if (typeof price === 'string' && price.includes('R$')) {
    return price
  }
  
  // Se é um número, formata para reais
  if (typeof price === 'number') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }
  
  // Se é uma string com apenas números, converte e formata
  if (typeof price === 'string') {
    const numericPrice = parseFloat(price.replace(/[^\d,.-]/g, '').replace(',', '.'))
    if (!isNaN(numericPrice)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numericPrice)
    }
  }
  
  return price // Retorna como está se não conseguir processar
}

// Função para determinar a imagem principal do produto
const getProductMainImage = (product) => {
  console.log('Determinando imagem principal para produto:', product.name, {
    images: product.images,
    image_url: product.image_url,
    image: product.image
  });
  
  let selectedImage = null;
  
  // Prioridade 1: primeira imagem do array de imagens
  if (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0].url) {
    selectedImage = product.images[0].url;
    console.log('✅ Usando primeira imagem do array:', selectedImage);
  }
  // Prioridade 2: campo image_url do banco
  else if (product.image_url) {
    selectedImage = product.image_url;
    console.log('✅ Usando image_url:', selectedImage);
  }
  // Prioridade 3: campo image tradicional  
  else if (product.image) {
    selectedImage = product.image;
    console.log('✅ Usando image tradicional:', selectedImage);
  }
  // Fallback
  else {
    selectedImage = '/cyberlife-icone2.png';
    console.log('⚠️ Usando fallback logo');
  }
  
  return selectedImage;
}

// Função para determinar a imagem de hover do produto
const getProductHoverImage = (product) => {
  console.log('Determinando imagem hover para produto:', product.name);
  
  // Prioridade 1: segunda imagem do array de imagens
  if (product.images && Array.isArray(product.images) && product.images.length > 1) {
    return product.images[1].url;
  }
  
  // Prioridade 2: campo hover_image_url do banco
  if (product.hover_image_url) {
    return product.hover_image_url;
  }
  
  // Prioridade 3: campo hoverImage tradicional
  if (product.hoverImage) {
    return product.hoverImage;
  }
  
  // Fallback para imagem principal
  return getProductMainImage(product);
}

export default function LojaGeek({ onBack }){
  const navigate = useNavigate()
  const [currentOffer, setCurrentOffer] = useState(0)
  const [isOffersVisible, setIsOffersVisible] = useState(false)
  const [isCatalogVisible, setIsCatalogVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [offers, setOffers] = useState([])
  const [products, setProducts] = useState([])
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [catMood, setCatMood] = useState('neutral') // 'happy', 'sad', 'neutral'
  const offersRef = useRef(null)
  const catalogRef = useRef(null)
  const productsPerPage = 8
  
  // Parar a música ao entrar nesta tela
  useEffect(() => {
    stopAudio()
  }, [])
  
  // Mostrar popup de notificação após carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000);
    
    // Auto-fechar após 10 segundos
    const autoCloseTimer = setTimeout(() => {
      setShowPopup(false);
    }, 12000); // 2s + 10s
    
    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, []);
  
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  
  const handleVerLojaOnline = () => {
    setShowPopup(false);
    setShowConfirmation(true);
  };
  
  const handleConfirmYes = () => {
    setShowConfirmation(false);
    // Redirecionar para loja online
    window.open('https://shopee.com.br/cyberlife', '_blank');
  };
  
  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };
  
  // Detectar scroll para header float
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])
  
  // Carregar dados do localStorage
  useEffect(() => {
// Carregar produtos do banco de dados
  const loadProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'geek')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        // Fallback para localStorage se houver erro
        const storedProducts = localStorage.getItem('cyberlife_products');
        if (storedProducts) {
          const allProducts = JSON.parse(storedProducts);
          const geekProducts = allProducts.filter(p => p.category === 'geek');
          console.log('Produtos carregados do localStorage:', geekProducts);
          setProducts(geekProducts);
        }
        return;
      }

      console.log('Produtos carregados do banco:', products);
      setProducts(products || []);
      
      // Debug: verificar estrutura das imagens  
      if (products && products.length > 0) {
        console.log('=== ANÁLISE DE PRODUTOS DO BANCO ===');
        console.log('Total de produtos:', products.length);
        console.log('Estrutura do primeiro produto:', products[0]);
        
        products.slice(0, 3).forEach((p, index) => {
          console.log(`--- Produto ${index + 1}: ${p.name} ---`);
          console.log('ID:', p.id);
          console.log('image:', p.image);
          console.log('image_url:', p.image_url);
          console.log('images (array):', p.images);
          console.log('hover_image_url:', p.hover_image_url);
          console.log('Estrutura completa:', JSON.stringify(p, null, 2));
        });
        
        console.log('=== FIM ANÁLISE ===');
      }
    } catch (error) {
      console.error('Erro ao conectar com banco:', error);
      // Fallback para localStorage
      const storedProducts = localStorage.getItem('cyberlife_products');
      if (storedProducts) {
        const allProducts = JSON.parse(storedProducts);
        setProducts(allProducts.filter(p => p.category === 'geek'));
      }
    }
  };

// Carregar banners do banco de dados
  const loadBanners = async () => {
    try {
      const { data: banners, error } = await supabase
        .from('banners')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error('Erro ao carregar banners:', error);
        // Fallback para localStorage e defaultOffers
        const storedOffers = localStorage.getItem('cyberlife_offers');
        setOffers(storedOffers ? JSON.parse(storedOffers) : defaultOffers);
        return;
      }

      // Converter banners do banco para formato de ofertas
      const offersFromBanners = banners.map(banner => ({
        id: banner.id,
        title: banner.title,
        description: banner.description,
        discount: banner.discount,
        image: banner.image_url,
        link: banner.link_url,
        originalPrice: banner.original_price,
        finalPrice: banner.final_price,
        tag: banner.tag || 'OFERTA'
      }));

      setOffers(offersFromBanners.length > 0 ? offersFromBanners : defaultOffers);
    } catch (error) {
      console.error('Erro ao conectar com banco:', error);
      // Fallback para localStorage
      const storedOffers = localStorage.getItem('cyberlife_offers');
      setOffers(storedOffers ? JSON.parse(storedOffers) : defaultOffers);
    }
  };

  const loadData = () => {
    // Carregar banners do banco de dados
    loadBanners();
    // Carregar produtos do banco de dados
    loadProducts();

      // Carregar quantidade de itens no carrinho
      updateCartCount()
    };
    
    loadData();
    
    // Recarregar quando a aba voltar ao foco
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [])

  const updateCartCount = () => {
    const storedCart = localStorage.getItem('cyberlife_cart')
    if (storedCart) {
      const cart = JSON.parse(storedCart)
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartItemsCount(totalItems)
    } else {
      setCartItemsCount(0)
    }
  }

  const handleAddToCart = (product) => {
    console.log('=== INÍCIO AddToCart ===');
    console.log('Produto sendo adicionado ao carrinho:', product);
    
    const storedCart = localStorage.getItem('cyberlife_cart')
    let cart = storedCart ? JSON.parse(storedCart) : []
    
    const existingItemIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1
      console.log('Quantidade atualizada para produto existente');
    } else {
      // Usar as funções helper para garantir a imagem correta
      const mainImage = getProductMainImage(product);
      console.log('Imagem principal determinada:', mainImage);
      
      // Mapear campos do banco de dados para estrutura do carrinho
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1,
        image: mainImage || '/cyberlife-icone2.png', // Garantir que sempre tenha uma imagem
        images: product.images || [],
        // Campos de debug
        debug_original_image: product.image,
        debug_original_image_url: product.image_url,
        debug_original_images: product.images
      }
      
      console.log('Item sendo salvo no carrinho:', cartItem);
      cart.push(cartItem);
    }
    
    localStorage.setItem('cyberlife_cart', JSON.stringify(cart))
    console.log('Carrinho completo atualizado:', cart);
    console.log('=== FIM AddToCart ===');
    updateCartCount()
  }
  
  const scrollToOffers = () => {
    console.log('scrollToOffers chamado', offersRef.current)
    if (offersRef.current) {
      offersRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      })
      setIsOffersVisible(true)
    }
  }

  const scrollToCatalog = () => {
    console.log('scrollToCatalog chamado', catalogRef.current)
    // Tornar visível primeiro
    setIsCatalogVisible(true)
    // Depois fazer o scroll
    setTimeout(() => {
      if (catalogRef.current) {
        catalogRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        })
      }
    }, 100)
  }
  
  // Listener para mudanças no localStorage (entre abas/janelas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cyberlife_products' && e.newValue) {
        // Recarregar do banco quando há mudanças
        loadProducts();
      }
      if (e.key === 'cyberlife_offers' && e.newValue) {
        // Recarregar banners do banco
        loadBanners();
      }
      if (e.key === 'cyberlife_cart') {
        updateCartCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === offersRef.current) {
              setIsOffersVisible(true)
            }
            if (entry.target === catalogRef.current) {
              setIsCatalogVisible(true)
            }
          }
        })
      },
      { threshold: 0.2 }
    )
    
    if (offersRef.current) {
      observer.observe(offersRef.current)
    }
    if (catalogRef.current) {
      observer.observe(catalogRef.current)
    }
    
    return () => observer.disconnect()
  }, [])

  // Verificar se deve rolar para o catálogo ao carregar
  useEffect(() => {
    const shouldScrollToCatalog = sessionStorage.getItem('scrollToCatalog');
    if (shouldScrollToCatalog === 'true') {
      sessionStorage.removeItem('scrollToCatalog');
      // Aguardar um pouco para garantir que a página está renderizada
      setTimeout(() => {
        scrollToCatalog();
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (offers.length > 0) {
      const timer = setInterval(() => {
        setCurrentOffer((prev) => (prev + 1) % offers.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [offers.length])

  const offer = offers[currentOffer] || {}

  // Categorias: mostrar todos os produtos + filtro por subcategorias
  const categories = ['Todos', 'Action Figures', 'Personalizados', 'Miniaturas', 'Vestuário', 'Decoração']
  
  // Usar produtos do state (carregados do localStorage)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || product.type === selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Reset para página 1 quando mudar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Frases rotativas para o subtítulo do hero
  const heroSubtitles = [
    "Produtos exclusivos para quem vive a cultura tech, games e sci-fi",
    "Ofertas imbatíveis para geeks de verdade!",
    "Colecionáveis com qualidade lendária"
  ];
  const [currentSubtitle, setCurrentSubtitle] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentSubtitle((prev) => (prev + 1) % heroSubtitles.length);
        setIsSliding(false);
      }, 400);
    }, 3200);
    return () => clearTimeout(timer);
  }, [currentSubtitle])

  return (
    <div className="loja-geek" style={{overflowX: 'hidden', width: '100%', maxWidth: '100vw'}}>
      <header className="header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: isScrolled ? '10px 36px' : '16px 36px', 
        margin: 0,
        background: isScrolled 
          ? 'linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.95) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
        borderBottom: isScrolled ? '2px solid #00d9ff' : '2px solid rgba(0, 217, 255, 0.2)',
        boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.8)' : 'none',
        backdropFilter: 'blur(15px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        boxSizing: 'border-box',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div className="logo" style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          transition: 'transform 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src="/cyberlife-icone2.png" 
            alt="CyberLife Logo" 
            style={{
              height: '40px', 
              verticalAlign: 'middle',
              filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))',
            }} 
          />
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', 
            fontWeight: 700, 
            fontSize: '1.4rem', 
            color: '#00d9ff', 
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(0, 217, 255, 0.8)',
          }}>CyberLife</span>
        </div>
        <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="nav-button" 
            onClick={onBack}
            style={{
              background: 'rgba(0, 217, 255, 0.1)',
              border: '2px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '8px',
              color: '#00d9ff',
              padding: '10px 20px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)';
              e.currentTarget.style.borderColor = '#00d9ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Início
          </button>
          <button 
            className="nav-button"
            style={{
              background: 'rgba(0, 217, 255, 0.1)',
              border: '2px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '8px',
              color: '#00d9ff',
              padding: '10px 20px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)';
              e.currentTarget.style.borderColor = '#00d9ff';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Contato
          </button>
          <button 
            className="nav-button cart-button" 
            onClick={() => window.location.href = '/carrinho'}
            style={{
              background: 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)',
              border: '2px solid rgba(255, 0, 234, 0.4)',
              borderRadius: '8px',
              color: '#fff',
              padding: '10px 20px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ff 0%, #ff00ea 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 0, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#00ff88',
                color: '#000',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0, 255, 136, 0.6)',
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>
        </nav>
      </header>

  <section className="hero-geek" style={{paddingTop: '80px'}}>
        <div className="hero-content">
          <div className="hero-title-wrapper">
            <h1 className="hero-title-line1">Loja Geek</h1>
            <h1 className="hero-title-line2">CyberLife!</h1>
          </div>
          <p className={`hero-subtitle${isSliding ? ' slide-up' : ''}`} style={{minHeight: '2.2em'}}>
            {heroSubtitles[currentSubtitle]}
          </p>
          <div className="hero-cta">
            <button className="cta-button primary" onClick={scrollToCatalog}>Explorar Produtos</button>
            <button className="cta-button secondary" onClick={scrollToOffers}>Ver Ofertas</button>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="cyber-grid"></div>
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="scan-line"></div>
          <div className="particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
          <div className="hexagon hex-1"></div>
          <div className="hexagon hex-2"></div>
          <div className="hexagon hex-3"></div>
        </div>
        <img 
          src={"/cyberlife-icone2.png"}
          alt="CyberLife Ícone 2"
          className="hero-bg-animated"
        />
        <div className="scroll-indicator">
          <div className="scroll-arrow" onClick={scrollToOffers}>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 5 L25 40" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeDasharray="2 3"/>
              <polygon points="25,35 18,25 32,25" fill="currentColor" opacity="0.3"/>
              <polygon points="25,45 15,30 35,30" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
              <circle cx="25" cy="12" r="3" fill="currentColor"/>
              <path d="M10 20 L40 20" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              <path d="M10 40 L40 40" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
            </svg>
            <span className="scroll-text">SCROLL</span>
          </div>
        </div>
      </section>

      <section className={`offers-section ${isOffersVisible ? 'visible' : ''}`} ref={offersRef} style={{position: 'relative', overflow: 'hidden'}}>
        <img 
          src={"/cyberlife-icone2.png"}
          alt="CyberLife Ícone"
          className="offers-bg-animated"
        />
        <div className="section-header" style={{
          textAlign: 'center',
          marginBottom: '50px',
          position: 'relative',
          zIndex: 2,
        }}>
          <h2 className="section-title" style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00d9ff 0%, #ff00ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '15px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>Ofertas Sazonais</h2>
          <p className="section-subtitle" style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'Rajdhani, sans-serif',
            letterSpacing: '1px',
          }}>🔥 Promoções exclusivas por tempo limitado 🔥</p>
        </div>
        
        <div className="carousel-container" style={{
          position: 'relative',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
        }}>
          {offers.length > 0 ? (
            <div className="offer-card-large" style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
              border: '2px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '24px',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}>
              {/* Animação de fundo */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(0, 217, 255, 0.15) 0%, transparent 50%)',
                animation: 'pulse 3s ease-in-out infinite',
                pointerEvents: 'none',
              }}></div>
              
              <div className="offer-tag" style={{
                position: 'absolute',
                top: '30px',
                left: '30px',
                background: 'linear-gradient(135deg, #ff00ea, #cc00ba)',
                color: '#fff',
                padding: '10px 25px',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                zIndex: 3,
                boxShadow: '0 4px 20px rgba(255, 0, 234, 0.5)',
              }}>{offer.tag}</div>
              
              <div className="offer-discount-badge" style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                color: '#000',
                padding: '15px 30px',
                borderRadius: '50px',
                fontSize: '1.8rem',
                fontWeight: 900,
                fontFamily: 'Rajdhani, sans-serif',
                zIndex: 3,
                boxShadow: '0 8px 30px rgba(0, 255, 136, 0.6)',
                animation: 'bounce 2s infinite',
              }}>{offer.discount}</div>
              
              <div className="offer-split" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '50px',
                alignItems: 'center',
                marginTop: '80px',
                position: 'relative',
                zIndex: 2,
              }}>
                <div className="offer-image-side" style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  height: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div className="offer-glow" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(0, 217, 255, 0.3) 0%, transparent 70%)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}></div>
                  <img src={offer.image} alt={offer.title} className="offer-image" style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    transition: 'transform 0.5s ease',
                  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
                
                <div className="offer-content-side" style={{
                  padding: '20px',
                }}>
                  <h3 className="offer-title" style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: '30px',
                    fontFamily: 'Rajdhani, sans-serif',
                    lineHeight: '1.2',
                    textShadow: '0 2px 10px rgba(0, 217, 255, 0.5)',
                  }}>{offer.title}</h3>
                  
                  {(offer.originalPrice && offer.finalPrice) && (
                    <div className="offer-prices" style={{
                      display: 'flex',
                      gap: '30px',
                      marginBottom: '40px',
                      flexWrap: 'wrap',
                    }}>
                      <div className="price-block" style={{
                        flex: 1,
                        minWidth: '150px',
                      }}>
                        <span className="price-label" style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          color: 'rgba(255, 255, 255, 0.5)',
                          marginBottom: '8px',
                          fontFamily: 'Rajdhani, sans-serif',
                          letterSpacing: '1px',
                        }}>De:</span>
                        <span className="price-original" style={{
                          display: 'block',
                          fontSize: '1.5rem',
                          color: 'rgba(255, 255, 255, 0.4)',
                          textDecoration: 'line-through',
                          fontFamily: 'Rajdhani, sans-serif',
                          fontWeight: 600,
                        }}>{formatPrice(offer.originalPrice)}</span>
                      </div>
                      <div className="price-block" style={{
                        flex: 1,
                        minWidth: '150px',
                      }}>
                        <span className="price-label" style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          color: '#00ff88',
                          marginBottom: '8px',
                          fontFamily: 'Rajdhani, sans-serif',
                          letterSpacing: '1px',
                          fontWeight: 700,
                        }}>Por apenas:</span>
                        <span className="price-final" style={{
                          display: 'block',
                          fontSize: '2.5rem',
                          color: '#00ff88',
                          fontFamily: 'Rajdhani, sans-serif',
                          fontWeight: 900,
                          textShadow: '0 0 20px rgba(0, 255, 136, 0.8)',
                        }}>{formatPrice(offer.finalPrice)}</span>
                      </div>
                    </div>
                  )}
                  
                  <button className="offer-button" style={{
                    width: '100%',
                    padding: '18px 40px',
                    background: 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)',
                    border: 'none',
                    borderRadius: '50px',
                    color: '#fff',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    fontFamily: 'Rajdhani, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    boxShadow: '0 10px 40px rgba(255, 0, 234, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ff 0%, #ff00ea 100%)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(255, 0, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 0, 234, 0.4)';
                  }}>🛒 Comprar Agora</button>
                </div>
              </div>

              <div className="carousel-indicators" style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '40px',
                position: 'relative',
                zIndex: 2,
              }}>
                {offers.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentOffer ? 'active' : ''}`}
                    onClick={() => setCurrentOffer(index)}
                    style={{
                      width: index === currentOffer ? '50px' : '15px',
                      height: '15px',
                      borderRadius: '10px',
                      border: 'none',
                      background: index === currentOffer 
                        ? 'linear-gradient(135deg, #00d9ff, #ff00ea)'
                        : 'rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease',
                      boxShadow: index === currentOffer ? '0 4px 15px rgba(0, 217, 255, 0.5)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.2rem',
            }}>
              <p>📦 Nenhuma oferta disponível no momento</p>
              <p style={{fontSize: '0.9rem', marginTop: '10px'}}>Adicione ofertas no painel admin</p>
            </div>
          )}
        </div>
      </section>

      <section className={`catalog-section ${isCatalogVisible ? 'visible' : ''}`} ref={catalogRef}>
        <div className="section-header">
          <h2 className="section-title">Catálogo Completo</h2>
        </div>

        <div className="catalog-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {currentProducts.map((product) => (
            <div key={product.id} className="product-card" style={{
              position: 'relative',
              border: product.category === 'geek' ? '2px solid #ff00ea' : '1px solid rgba(0,217,255,0.3)',
              boxShadow: product.category === 'geek' ? '0 0 20px rgba(255,0,234,0.3)' : 'none'
            }}>
              {product.category === 'geek' && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'linear-gradient(135deg, #ff00ea, #0099cc)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  zIndex: 10,
                }}>★ Destaque</div>
              )}
              <div 
                className="product-image-wrapper" 
                onClick={() => navigate(`/produto/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {product.model_3d ? (
                  <div className="product-3d-container">
                    <model-viewer
                      src={product.model_3d}
                      alt={`Modelo 3D de ${product.name}`}
                      shadow-intensity="1"
                      disable-pan
                      disable-zoom
                      camera-orbit="90deg 75deg 2.5m"
                      field-of-view="30deg"
                      style={{
                        width: '100%',
                        height: '250px',
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                      }}
                      onLoad={(e) => {
                        e.target.setAttribute('camera-orbit', '90deg 75deg 2.5m');
                      }}
                      onMouseEnter={(e) => {
                        e.target.setAttribute('auto-rotate', '');
                        e.target.setAttribute('rotation-per-second', '60deg');
                        e.target.setAttribute('camera-controls', '');
                      }}
                      onMouseLeave={(e) => {
                        e.target.removeAttribute('auto-rotate');
                        e.target.removeAttribute('camera-controls');
                        e.target.setAttribute('camera-orbit', '90deg 75deg 2.5m');
                      }}
                    />
                    <div className="model-3d-badge-catalog">🎮 3D</div>
                  </div>
                ) : (
                  <>
                    <img 
                      src={getProductMainImage(product)} 
                      alt={product.name} 
                      className="product-image default" 
                    />
                    <img 
                      src={getProductHoverImage(product)} 
                      alt={product.name} 
                      className="product-image hover" 
                    />
                  </>
                )}
              </div>
              <div className="product-info">
                <span className="product-category" style={{
                  color: product.category === 'geek' ? '#ff00ea' : '#00d9ff'
                }}>{product.category.toUpperCase()}</span>
                <h3 
                  className="product-name" 
                  onClick={() => navigate(`/produto/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {product.name}
                </h3>
                <p className="product-price">{formatPrice(product.price)}</p>
                <button className="product-btn" onClick={() => handleAddToCart(product)}>Adicionar ao Carrinho</button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-results">
            <p>Nenhum produto encontrado</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn prev"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            
            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              className="pagination-btn next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próximo →
            </button>
          </div>
        )}
      </section>

      {/* Rodapé CyberLife - Novo Design Tech */}
      <footer className="footer-cyberlife-new" style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0033 50%, #0f0015 100%)',
        color: '#00d9ff',
        padding: '80px 20px 40px 20px',
        marginTop: '80px',
        fontFamily: 'Rajdhani, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Animated Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 234, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
          animation: 'gradientShift 15s ease infinite',
        }} />

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Main Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            marginBottom: '80px',
          }} className="footer-main-grid">
            {/* Left Side - Image */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '350px',
                filter: 'drop-shadow(0 0 30px rgba(0, 217, 255, 0.3))',
                animation: 'float 6s ease-in-out infinite',
              }}>
                <img 
                  src={geekConvention} 
                  alt="Geek Convention" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '20px',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    background: 'rgba(0, 217, 255, 0.05)',
                    padding: '15px',
                    boxShadow: 'inset 0 0 30px rgba(0, 217, 255, 0.1)',
                    transition: 'all 0.3s ease',
                  }}
                  className="footer-image"
                />
              </div>
            </div>

            {/* Right Side - Info */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
            }}>
              <div>
                <div style={{
                  fontSize: '3.5rem',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #00d9ff 0%, #ff00ea 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '15px',
                  letterSpacing: '-1px',
                }}>CyberLife</div>
                <div style={{
                  fontSize: '1.3rem',
                  color: '#00d9ff',
                  fontWeight: 500,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Zap size={24} fill='currentColor' />
                  Sua Loja Geek Premium
                </div>
                <p style={{
                  color: '#aaa',
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  marginBottom: '20px',
                }}>
                  Bem-vindo ao universo geek! Aqui você encontra os melhores produtos, personalizados, ação figures e tudo que um fã de tecnologia precisa. Venha fazer parte da nossa comunidade!
                </p>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}>
                <div style={{
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '15px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }} className="stat-card-hover">
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#00d9ff',
                    marginBottom: '5px',
                  }}>500+</div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#aaa',
                    fontWeight: 500,
                  }}>Produtos</div>
                </div>
                <div style={{
                  background: 'rgba(255, 0, 234, 0.1)',
                  border: '1px solid rgba(255, 0, 234, 0.3)',
                  borderRadius: '15px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }} className="stat-card-hover">
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#ff00ea',
                    marginBottom: '5px',
                  }}>10K+</div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#aaa',
                    fontWeight: 500,
                  }}>Clientes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.5), transparent)',
            marginBottom: '60px',
          }} />

          {/* Footer Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px',
            marginBottom: '50px',
          }} className="footer-cards-grid">
            {/* Contact Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(37, 211, 102, 0.02) 100%)',
              border: '1px solid rgba(37, 211, 102, 0.2)',
              borderRadius: '18px',
              padding: '30px',
              transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
              position: 'relative',
              overflow: 'hidden',
            }} className="footer-card-hover">
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'radial-gradient(circle, rgba(37, 211, 102, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.4s',
                pointerEvents: 'none',
              }} className="card-glow" />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1,
              }}>
                <MessageCircle size={28} style={{ color: '#25D366' }} />
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}>Contato</div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                zIndex: 1,
              }}>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#25D366',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  padding: '10px 12px',
                  borderRadius: '10px',
                }} className="footer-link-hover">
                  <span style={{ width: '4px', height: '4px', background: '#25D366', borderRadius: '50%' }} />
                  WhatsApp
                  <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0, transition: 'all 0.3s' }} className="arrow-icon" />
                </a>
                <a href="https://instagram.com/cyberlife" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ff00ea',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  padding: '10px 12px',
                  borderRadius: '10px',
                }} className="footer-link-hover">
                  <span style={{ width: '4px', height: '4px', background: '#ff00ea', borderRadius: '50%' }} />
                  Instagram
                  <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0, transition: 'all 0.3s' }} className="arrow-icon" />
                </a>
              </div>
            </div>

            {/* Online Stores Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 230, 0, 0.05) 0%, rgba(255, 230, 0, 0.02) 100%)',
              border: '1px solid rgba(255, 230, 0, 0.2)',
              borderRadius: '18px',
              padding: '30px',
              transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
              position: 'relative',
              overflow: 'hidden',
            }} className="footer-card-hover">
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'radial-gradient(circle, rgba(255, 230, 0, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.4s',
                pointerEvents: 'none',
              }} className="card-glow" />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1,
              }}>
                <Store size={28} style={{ color: '#ffe600' }} />
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}>Lojas Online</div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                zIndex: 1,
              }}>
                <a href="https://www.mercadolivre.com.br/perfil/cyberlife" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ffe600',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  padding: '10px 12px',
                  borderRadius: '10px',
                }} className="footer-link-hover">
                  <span style={{ width: '4px', height: '4px', background: '#ffe600', borderRadius: '50%' }} />
                  Mercado Livre
                  <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0, transition: 'all 0.3s' }} className="arrow-icon" />
                </a>
                <a href="https://shopee.com.br/cyberlife" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ff5722',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  padding: '10px 12px',
                  borderRadius: '10px',
                }} className="footer-link-hover">
                  <span style={{ width: '4px', height: '4px', background: '#ff5722', borderRadius: '50%' }} />
                  Shopee
                  <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0, transition: 'all 0.3s' }} className="arrow-icon" />
                </a>
              </div>
            </div>

            {/* Partners Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 174, 0.05) 0%, rgba(0, 255, 174, 0.02) 100%)',
              border: '1px solid rgba(0, 255, 174, 0.2)',
              borderRadius: '18px',
              padding: '30px',
              transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
              position: 'relative',
              overflow: 'hidden',
            }} className="footer-card-hover">
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'radial-gradient(circle, rgba(0, 255, 174, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.4s',
                pointerEvents: 'none',
              }} className="card-glow" />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1,
              }}>
                <Heart size={28} style={{ color: '#00ffae' }} />
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}>Parceiros</div>
              </div>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative',
                zIndex: 1,
              }}>
                {[
                  { name: 'MeB Informatica', instagram: 'https://www.instagram.com/mebinformaticaguaira/' },
                  { name: 'ToqueDeFesta', instagram: 'https://www.instagram.com/toquedefesta_official/' },
                  { name: 'Grupo Raval', instagram: 'https://www.instagram.com/grupo_raval/' },
                  { name: 'Eletrobuty', instagram: null }
                ].map((partner, idx) => (
                  <li key={idx} style={{
                    color: '#00ffae',
                    fontWeight: 500,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: partner.instagram ? 'pointer' : 'default',
                  }} className="partner-item-hover">
                    <span style={{ width: '4px', height: '4px', background: '#00ffae', borderRadius: '50%' }} />
                    {partner.instagram ? (
                      <a 
                        href={partner.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: '#00ffae',
                          textDecoration: 'none',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#00d9ff'}
                        onMouseLeave={(e) => e.target.style.color = '#00ffae'}
                      >
                        {partner.name}
                      </a>
                    ) : (
                      partner.name
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(0, 217, 255, 0.02) 100%)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '18px',
              padding: '30px',
              transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
              position: 'relative',
              overflow: 'hidden',
            }} className="footer-card-hover">
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.4s',
                pointerEvents: 'none',
              }} className="card-glow" />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1,
              }}>
                <MapPin size={28} style={{ color: '#00d9ff' }} />
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}>Localização</div>
              </div>
              <div style={{
                color: '#00d9ff',
                fontSize: '1.15rem',
                fontWeight: 600,
                position: 'relative',
                zIndex: 1,
              }}>Guaíra-SP</div>
              <div style={{
                color: '#aaa',
                fontSize: '0.95rem',
                marginTop: '10px',
                position: 'relative',
                zIndex: 1,
              }}>Brasil</div>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{
            borderTop: '1px solid rgba(0, 217, 255, 0.2)',
            paddingTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }} className="footer-bottom">
            <div style={{
              fontSize: '0.95rem',
              color: '#aaa',
            }}>
              &copy; {new Date().getFullYear()} <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>CyberLife</span>. Todos os direitos reservados.
            </div>
            <div style={{
              fontSize: '0.95rem',
              color: '#aaa',
            }}>
              Desenvolvido com <span style={{ color: '#ff00ea' }}>❤</span> por <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>CyberLife</span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(-2deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }

          @keyframes gradientShift {
            0%, 100% { filter: hue-rotate(0deg); }
            50% { filter: hue-rotate(10deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0.8);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @media (max-width: 768px) {
            .footer-main-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }

            .footer-cards-grid {
              grid-template-columns: 1fr !important;
            }

            .footer-bottom {
              flex-direction: column !important;
              text-align: center !important;
            }
          }

          .footer-card-hover:hover {
            transform: translateY(-12px);
            box-shadow: 0 20px 60px rgba(0, 217, 255, 0.15);
            border-color: rgba(0, 217, 255, 0.5) !important;
          }

          .footer-card-hover:hover .card-glow {
            opacity: 1 !important;
          }

          .footer-link-hover:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            transform: translateX(8px) !important;
          }

          .footer-link-hover:hover .arrow-icon {
            opacity: 1 !important;
            transform: translateX(4px) !important;
          }

          .partner-item-hover:hover {
            background: rgba(0, 255, 174, 0.1) !important;
            color: #fff !important;
            text-shadow: 0 0 12px rgba(0, 255, 174, 0.5) !important;
            transform: translateX(6px) !important;
          }

          .stat-card-hover:hover {
            transform: scale(1.08);
            box-shadow: 0 0 30px rgba(0, 217, 255, 0.2);
          }

          .footer-image:hover {
            transform: scale(1.05) rotate(2deg);
            border-color: rgba(0, 217, 255, 0.6) !important;
            filter: drop-shadow(0 0 40px rgba(0, 217, 255, 0.4)) !important;
          }
        `}</style>
      </footer>

      {/* Popup de Notificação */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out',
          padding: '20px',
        }}
        onClick={handleClosePopup}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 30, 0.95) 100%)',
            border: '3px solid #00d9ff',
            borderRadius: '20px',
            padding: '35px 40px',
            maxWidth: '450px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 30px 80px rgba(0, 217, 255, 0.4), inset 0 0 60px rgba(0, 217, 255, 0.1)',
            animation: 'slideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}>
            
            {/* Efeitos de fundo */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)',
              animation: 'rotate 20s linear infinite',
              pointerEvents: 'none',
            }}></div>
            
            {/* Botão Fechar */}
            <button
              onClick={handleClosePopup}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(255, 0, 234, 0.2)',
                border: '2px solid rgba(255, 0, 234, 0.5)',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ff00ea',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 234, 0.4)';
                e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 234, 0.2)';
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              ×
            </button>
            
            {/* Ícone de Alerta */}
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #00ff88, #00cc66)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: '0 10px 40px rgba(0, 255, 136, 0.5)',
              animation: 'bounce 1s ease-in-out infinite',
              position: 'relative',
              zIndex: 2,
            }}>
              💰
            </div>
            
            {/* Título */}
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00d9ff 0%, #00ff88 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              marginBottom: '15px',
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              position: 'relative',
              zIndex: 2,
            }}>
              🎉 Preços Imbatíveis! 🎉
            </h2>
            
            {/* Mensagem */}
            <p style={{
              fontSize: '1.1rem',
              color: '#fff',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '25px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 500,
              position: 'relative',
              zIndex: 2,
            }}>
              Comprando pelo nosso site, você encontra <span style={{
                color: '#00ff88',
                fontWeight: 900,
                fontSize: '1.3rem',
                textShadow: '0 0 15px rgba(0, 255, 136, 0.8)',
              }}>PREÇOS BEM MENORES</span> do que nas lojas online tradicionais!
            </p>
            
            {/* Destaque */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 234, 0.15), rgba(0, 217, 255, 0.15))',
              border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '25px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 2,
            }}>
              <p style={{
                fontSize: '0.95rem',
                color: '#00d9ff',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 600,
                marginBottom: '5px',
              }}>
                ✨ Economia Garantida ✨
              </p>
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'Rajdhani, sans-serif',
              }}>
                Produtos autênticos • Entrega rápida • Suporte exclusivo
              </p>
            </div>
            
            {/* Botões de Ação */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative',
              zIndex: 2,
            }}>
              <button
                onClick={handleClosePopup}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)',
                  border: 'none',
                  borderRadius: '50px',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'Rajdhani, sans-serif',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(255, 0, 234, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ff 0%, #ff00ea 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 0, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 0, 234, 0.4)';
                }}>
                🛍️ Explorar Ofertas
              </button>
              
              <button
                onClick={handleVerLojaOnline}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'Rajdhani, sans-serif',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                Ver loja online mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Personalizado */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out',
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 40, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)',
            border: '3px solid #ff00ea',
            borderRadius: '24px',
            padding: '50px 60px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 30px 100px rgba(255, 0, 234, 0.5), inset 0 0 80px rgba(255, 0, 234, 0.1)',
            animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden',
            textAlign: 'center',
          }}>
            
            {/* Efeito de brilho de fundo */}
            <div style={{
              position: 'absolute',
              top: '-100%',
              left: '-100%',
              width: '300%',
              height: '300%',
              background: 'radial-gradient(circle, rgba(255, 0, 234, 0.15) 0%, transparent 70%)',
              animation: 'rotate 15s linear infinite',
              pointerEvents: 'none',
            }}></div>
            
            {/* Gatinho animado */}
            <div style={{
              fontSize: '6rem',
              marginBottom: '30px',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: catMood === 'sad' ? 'scale(0.9) rotate(-10deg)' : catMood === 'happy' ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
              filter: catMood === 'sad' ? 'grayscale(0.3)' : 'none',
              position: 'relative',
              zIndex: 2,
            }}>
              {catMood === 'sad' ? '😿' : catMood === 'happy' ? '😺' : '😸'}
            </div>
            
            {/* Título */}
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#ff00ea',
              marginBottom: '20px',
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '1px',
              textShadow: '0 0 20px rgba(255, 0, 234, 0.6)',
              position: 'relative',
              zIndex: 2,
            }}>
              Tem certeza? 🤔
            </h2>
            
            {/* Mensagem */}
            <p style={{
              fontSize: '1.2rem',
              color: '#fff',
              lineHeight: '1.6',
              marginBottom: '40px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 500,
              position: 'relative',
              zIndex: 2,
            }}>
              O site da <span style={{
                color: '#00d9ff',
                fontWeight: 900,
                textShadow: '0 0 15px rgba(0, 217, 255, 0.8)',
              }}>CyberLife</span> oferece <span style={{
                color: '#00ff88',
                fontWeight: 900,
                textShadow: '0 0 15px rgba(0, 255, 136, 0.8)',
              }}>preços melhores</span>, deseja ver outra loja online mesmo assim?
            </p>
            
            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2,
            }}>
              <button
                onClick={handleConfirmYes}
                style={{
                  flex: 1,
                  padding: '16px 30px',
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 0, 0, 0.5)',
                  borderRadius: '50px',
                  color: '#ff6b6b',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'Rajdhani, sans-serif',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  setCatMood('sad');
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = '#ff0000';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  setCatMood('neutral');
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 0, 0, 0.5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.2)';
                }}>
                😢 Sim
              </button>
              
              <button
                onClick={handleConfirmNo}
                style={{
                  flex: 1,
                  padding: '16px 30px',
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
                  border: '2px solid #00ff88',
                  borderRadius: '50px',
                  color: '#000',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'Rajdhani, sans-serif',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 30px rgba(0, 255, 136, 0.4)',
                }}
                onMouseEnter={(e) => {
                  setCatMood('happy');
                  e.currentTarget.style.background = 'linear-gradient(135deg, #00ffaa 0%, #00ff88 100%)';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.6)';
                }}
                onMouseLeave={(e) => {
                  setCatMood('neutral');
                  e.currentTarget.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 255, 136, 0.4)';
                }}>
                😊 Não
              </button>
            </div>
            
            {/* Mensagem sutil */}
            <p style={{
              marginTop: '30px',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'Rajdhani, sans-serif',
              fontStyle: 'italic',
              position: 'relative',
              zIndex: 2,
            }}>
              {catMood === 'sad' ? '😿 Gatinho triste com sua escolha...' : catMood === 'happy' ? '😺 Gatinho feliz! Boa escolha!' : '😸 O gatinho espera sua decisão...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Adicione ao CSS global ou local:
/*
.hero-subtitle {
  display: inline-block;
  transition: transform 0.4s cubic-bezier(.4,0,.2,1), opacity 0.4s cubic-bezier(.4,0,.2,1);
}
.hero-subtitle.slide-up {
  transform: translateY(-32px);
  opacity: 0;
}
*/
