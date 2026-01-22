import React, { useState, useEffect } from 'react';
import CommunityFab from '../components/CommunityFab';
import { Link, useNavigate } from 'react-router-dom';
import img2 from '../imagens base/2.jpeg';
import img3 from '../imagens base/3.jpeg';
import img5 from '../imagens base/5.jpeg';
import imgPlague from '../imagens base/A plague tale.webp';
import imgBeyond from '../imagens base/beyond.webp';
import imgConcret from '../imagens base/concret.webp';
import imgFortnite from '../imagens base/fortnite.jpg';
import imgHollow from '../imagens base/hollow.webp';
import imgSubzero from '../imagens/subzero.png';
import imgChunLi from '../imagens base/Chun-li.png';
import caraJogando from '../imagens/cara-jogando.png';
import { supabase } from '../supabaseClient';
import { stopAudio } from '../utils/audioPlayer';

const images = [
  img2,
  img3,
  img5,
  imgPlague,
  imgBeyond,
  imgConcret,
  imgFortnite,
  imgHollow,
];

const gamesData = [
  {
    title: 'A Plague Tale',
    slug: 'a-plague-tale',
    image: imgPlague,
    description: 'Uma jornada emocionante através da França medieval devastada pela peste negra. Acompanhe Amicia e Hugo em sua luta pela sobrevivência.',
  },
  {
    title: 'Beyond: Two Souls',
    slug: 'beyond-two-souls',
    image: imgBeyond,
    description: 'Uma experiência cinematográfica única que explora a conexão entre Jodie e uma entidade sobrenatural chamada Aiden.',
  },
  {
    title: 'Concrete Genie',
    slug: 'concrete-genie',
    image: imgConcret,
    description: 'Use o poder da arte para transformar uma cidade cinzenta em um lugar cheio de vida e cor nesta aventura mágica.',
  },
  {
    title: 'Fortnite',
    slug: 'fortnite',
    image: imgFortnite,
    description: 'O battle royale mais popular do mundo. Lute, construa e seja o último jogador em pé em partidas épicas com até 100 jogadores.',
  },
  {
    title: 'Hollow Knight',
    slug: 'hollow-knight',
    image: imgHollow,
    description: 'Explore um reino vasto e em ruínas repleto de insetos e heróis neste desafiador jogo de ação e aventura em 2D.',
  },
  {
    title: 'Cyberpunk Series',
    slug: 'cyberpunk-series',
    image: img2,
    description: 'Mergulhe em um mundo futurista de alta tecnologia e baixa vida, onde cada escolha molda seu destino em Night City.',
  },
  {
    title: 'The Last of Us',
    slug: 'the-last-of-us',
    image: img3,
    description: 'Uma história comovente de sobrevivência em um mundo pós-apocalíptico infestado por infectados e a busca pela humanidade.',
  },
  {
    title: 'God of War',
    slug: 'god-of-war',
    image: img5,
    description: 'Acompanhe Kratos e Atreus em uma jornada épica pela mitologia nórdica cheia de batalhas intensas e momentos emocionantes.',
  },
  {
    title: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    image: imgPlague,
    description: 'Viva a vida de um fora da lei no Velho Oeste americano em uma das narrativas mais envolventes já criadas.',
  },
  {
    title: 'Spider-Man',
    slug: 'spider-man',
    image: imgBeyond,
    description: 'Balance-se pelos arranha-céus de Nova York como o amigável vizinho Spider-Man e proteja a cidade dos vilões.',
  },
  {
    title: 'Ghost of Tsushima',
    slug: 'ghost-of-tsushima',
    image: imgConcret,
    description: 'Explore a bela ilha de Tsushima como um samurai em uma jornada para libertar sua terra da invasão mongol.',
  },
  {
    title: 'Horizon Zero Dawn',
    slug: 'horizon-zero-dawn',
    image: imgFortnite,
    description: 'Descubra os mistérios de um mundo pós-apocalíptico dominado por máquinas em forma de dinossauros.',
  },
  {
    title: 'Uncharted 4',
    slug: 'uncharted-4',
    image: imgHollow,
    description: 'Junte-se a Nathan Drake em sua última aventura em busca do tesouro perdido do pirata Henry Avery.',
  },
  {
    title: 'Bloodborne',
    slug: 'bloodborne',
    image: img2,
    description: 'Enfrente os horrores de Yharnam neste desafiador action RPG gótico dos criadores de Dark Souls.',
  },
  {
    title: 'Persona 5',
    slug: 'persona-5',
    image: img3,
    description: 'Viva a vida dupla de um estudante do ensino médio e ladrão fantasma que muda os corações das pessoas corruptas.',
  },
  {
    title: 'Final Fantasy VII Remake',
    slug: 'final-fantasy-vii-remake',
    image: img5,
    description: 'Reviva o clássico JRPG reimaginado com gráficos modernos e sistema de combate renovado.',
  },
  {
    title: 'Resident Evil Village',
    slug: 'resident-evil-village',
    image: imgPlague,
    description: 'Continue a história de Ethan Winters em uma vila misteriosa cheia de criaturas aterrorizantes e segredos obscuros.',
  },
  {
    title: 'Elden Ring',
    slug: 'elden-ring',
    image: imgBeyond,
    description: 'Explore as Terras Intermédias em um mundo aberto épico criado por FromSoftware e George R.R. Martin.',
  },
  {
    title: 'Assassins Creed Valhalla',
    slug: 'assassins-creed-valhalla',
    image: imgConcret,
    description: 'Conduza seu clã viking da Noruega para a Inglaterra medieval e construa um novo lar através da conquista.',
  },
  {
    title: 'The Witcher 3',
    slug: 'the-witcher-3',
    image: imgFortnite,
    description: 'Siga Geralt de Rivia em sua busca para encontrar Ciri enquanto navega por um mundo repleto de monstros e intrigas políticas.',
  },
];

export default function GamerWorld() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(0);
  const [currentGame, setCurrentGame] = useState(0);
  const [searchGame, setSearchGame] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [user, setUser] = useState(null);

  // Estados para notificações
  const [notification, setNotification] = useState(null);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Função para mostrar notificações com novo design
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotification({ id, message, type });

    // Remover notificação após duração
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };
  
  // Estado para produtos da loja centralizada
  const [storeProducts, setStoreProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [addedToCart, setAddedToCart] = useState(null);
  
  // Função para adicionar ao carrinho
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cyberlife_cart') || '[]');
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cyberlife_cart', JSON.stringify(cart));
    setAddedToCart(product.id);
    
    setTimeout(() => setAddedToCart(null), 2000);
  };

  // Parar a música ao entrar nesta tela
  useEffect(() => {
    stopAudio()
  }, [])

  // Carregar usuário autenticado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Carregar produtos do banco de dados
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar produtos:', error);
          // Fallback para localStorage se houver erro
          const storedProducts = localStorage.getItem('cyberlife_products');
          if (storedProducts) {
            setStoreProducts(JSON.parse(storedProducts));
          }
          return;
        }

        setStoreProducts(products || []);
      } catch (error) {
        console.error('Erro ao conectar com banco:', error);
        // Fallback para localStorage
        const storedProducts = localStorage.getItem('cyberlife_products');
        if (storedProducts) {
          setStoreProducts(JSON.parse(storedProducts));
        }
      }
    };
    
    loadProducts();
    
    // Recarregar produtos quando a aba voltar ao foco
    const handleFocus = () => {
      loadProducts();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const totalGames = gamesData.length; // 20 jogos total

  const eventImages = [
    img2,
    img3,
    img5,
    imgPlague,
    imgBeyond,
    imgConcret,
  ];
  
  const eventsData = [
    {
      title: 'Campeonato League of Legends',
      date: '20 de Janeiro, 2025',
      prize: 'R$ 15.000',
      inscription: 'Inscrições abertas até 15/01',
      slug: 'league-of-legends',
      type: 'Torneio',
    },
    {
      title: 'Corujão CS:GO Noturno',
      date: '05 de Fevereiro, 2025',
      inscription: 'Inscrições abertas até 25/01',
      slug: 'csgo-corujao',
      type: 'Corujão',
    },
    {
      title: 'Rush Play Valorant',
      date: '15 de Fevereiro, 2025',
      inscription: 'Inscrições abertas até 05/02',
      slug: 'valorant-rush',
      type: 'Rush Play',
    },
    {
      title: 'Torneio Free Fire Masters',
      date: '28 de Fevereiro, 2025',
      prize: 'R$ 12.000',
      inscription: 'Inscrições abertas até 20/02',
      slug: 'free-fire-battle',
      type: 'Torneio',
    },
    {
      title: 'Corujão Fortnite Night',
      date: '10 de Março, 2025',
      inscription: 'Inscrições abertas até 01/03',
      slug: 'fortnite-corujao',
      type: 'Corujão',
    },
    {
      title: 'Rush Play Rocket League',
      date: '22 de Março, 2025',
      inscription: 'Inscrições abertas até 15/03',
      slug: 'rocket-league-rush',
      type: 'Rush Play',
    },
  ];

  // Carregar eventos do banco de dados
  const [displayEvents, setDisplayEvents] = useState(eventsData);
  const [displayEventImages, setDisplayEventImages] = useState(eventImages);

  const loadEvents = async () => {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Erro ao carregar eventos:', error);
        // Fallback para dados padrão
        setDisplayEvents(eventsData);
        setDisplayEventImages(eventImages);
        return;
      }

      if (events && events.length > 0) {
        // Converter eventos do banco para o formato esperado
        const formattedEvents = events.map(event => ({
          title: event.title,
          date: new Date(event.date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          prize: event.prize || '',
          inscription: `Inscrições abertas`,
          slug: event.slug, // Usar o slug do banco de dados
          type: event.type || 'Torneio',
        }));
        
        setDisplayEvents(formattedEvents);
        
        // Usar imagens dos eventos se existirem
        const eventImageUrls = events
          .map(event => event.image_url)
          .filter(Boolean);
        
        if (eventImageUrls.length > 0) {
          setDisplayEventImages(eventImageUrls);
        } else {
          setDisplayEventImages(eventImages);
        }
      } else {
        // Se não há eventos no banco, usar dados padrão
        setDisplayEvents(eventsData);
        setDisplayEventImages(eventImages);
      }
    } catch (error) {
      console.error('Erro ao conectar com banco:', error);
      // Fallback para dados padrão
      setDisplayEvents(eventsData);
      setDisplayEventImages(eventImages);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    
    // Só iniciar timer se houver mais de 1 evento
    let eventTimer;
    if (displayEventImages.length > 1) {
      eventTimer = setInterval(() => {
        setCurrentEvent((prev) => (prev + 1) % displayEventImages.length);
      }, 4000);
    }
    
    const gameTimer = setInterval(() => {
      setCurrentGame((prev) => (prev + 1) % totalGames);
    }, 5000);
    
    // Animação de entrada do texto
    setTimeout(() => setTextVisible(true), 300);
    
    return () => {
      clearInterval(timer);
      if (eventTimer) clearInterval(eventTimer);
      clearInterval(gameTimer);
    };
  }, [images.length, totalGames, displayEventImages.length]);

  // Auto-fechar menu após 5 segundos
  useEffect(() => {
    let menuTimer;
    
    if (menuOpen) {
      menuTimer = setTimeout(() => {
        setMenuOpen(false);
      }, 5000);
    }
    
    return () => {
      if (menuTimer) {
        clearTimeout(menuTimer);
      }
    };
  }, [menuOpen]);

  // Show tutorial on every visit
  useEffect(() => {
    setTimeout(() => {
      setShowTutorial(true);
    }, 1000); // Show tutorial after 1 second to allow page to load
  }, []);

  // Tutorial data
  const tutorialSteps = [
    {
      title: "Bem-vindo à CyberLife!",
      description: "Este é o Gamer World na CyberLife, um espaço dedicado aos verdadeiros Gamers e Competidores!",
      elementId: null,
      position: "center"
    },
    {
      title: "Menu de Navegação",
      description: "Este é o menu principal. Clique no ícone de \"traços\" para abrir a barra lateral.",
      elementId: "menu-toggle", // Using a ref or element ID
      position: "bottom-right"
    },
    {
      title: "Seção Início",
      description: "Agora que o menu está aberto, este é o botão para voltar à página inicial.",
      elementId: "inicio-link",
      position: "bottom-left"
    },
    {
      title: "CyberHouse",
      description: "Conheça nossa casa de games, com os melhores equipamentos e experiências.",
      elementId: "cyberhouse-link",
      position: "bottom-left"
    },
    {
      title: "Eventos",
      description: "Confira nossos eventos, torneios, corujões e rush plays.",
      elementId: "eventos-link",
      position: "bottom-left"
    },
    {
      title: "Explore Jogos",
      description: "Descubra nossa galeria de jogos disponíveis para experimentar.",
      elementId: "galeria-link",
      position: "bottom-left"
    },
    {
      title: "Loja Gamer",
      description: "Acesse nossa loja especializada em produtos para gamers.",
      elementId: "loja-link",
      position: "bottom-left"
    },
    {
      title: "Perfil",
      description: "Acesse suas informações pessoais e histórico de atividades.",
      elementId: "perfil-link",
      position: "bottom-left"
    }
  ];

  const currentTutorialStep = tutorialSteps[tutorialStep];

  // Effect to handle menu opening during tutorial
  useEffect(() => {
    // Open menu when we reach the menu items steps (step 2 and onwards)
    if (showTutorial && tutorialStep >= 2 && !menuOpen) {
      setMenuOpen(true);
    }

    // Close menu when leaving the menu items steps (before step 2)
    if (showTutorial && tutorialStep < 2 && menuOpen) {
      setMenuOpen(false);
    }

    // Update menu dropdown styling when tutorial is active
    if (showTutorial && menuOpen) {
      const menuDropdown = document.querySelector('[style*="backdropFilter"]');
      if (menuDropdown) {
        menuDropdown.style.setProperty('--tutorial-active', 'true');
      }
    }
  }, [tutorialStep, showTutorial, menuOpen]);

  const nextTutorialStep = () => {
    // Special handling for step 1 (click menu to open sidebar)
    if (tutorialStep === 1) {
      // Toggle menu open if it's closed
      if (!menuOpen) {
        setMenuOpen(true);
      }
      // Move to next step after a delay to allow menu to open
      setTimeout(() => {
        setTutorialStep(prev => prev + 1);
      }, 500);
      return;
    }

    if (tutorialStep < tutorialSteps.length - 1) {
      const nextStep = tutorialStep + 1;
      setTutorialStep(nextStep);

      // Scroll to the section for the new step if it has an elementId
      setTimeout(() => {
        const nextStepData = tutorialSteps[nextStep];
        if (nextStepData && nextStepData.elementId) {
          // Map tutorial element IDs to section IDs
          const sectionMap = {
            'inicio-link': 'hero',
            'cyberhouse-link': 'cyberhouse',
            'eventos-link': 'eventos',
            'galeria-link': 'galeria',
            'loja-link': 'loja'
          };

          if (sectionMap[nextStepData.elementId]) {
            // Scroll to the corresponding section
            const sectionElement = document.getElementById(sectionMap[nextStepData.elementId]);
            if (sectionElement) {
              sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            // For other elements, scroll to the element directly
            const element = document.getElementById(nextStepData.elementId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      }, 100);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
      // Close menu when tutorial ends
      if (menuOpen) {
        setMenuOpen(false);
      }
      // Scroll to top of hero section when tutorial ends
      setTimeout(() => {
        const heroSection = document.getElementById('hero');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback to top of page if hero section is not found
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      }, 10);
    }
  };

  const prevTutorialStep = () => {
    // Special handling when going back from step 2 to step 1
    if (tutorialStep === 2) {
      // Move to previous step first
      setTutorialStep(prev => prev - 1);
      // Then close menu if it's open
      if (menuOpen) {
        setMenuOpen(false);
      }
      return;
    }

    if (tutorialStep > 0) {
      const prevStep = tutorialStep - 1;
      setTutorialStep(prevStep);

      // Scroll to the section for the previous step if it has an elementId
      setTimeout(() => {
        const prevStepData = tutorialSteps[prevStep];
        if (prevStepData && prevStepData.elementId) {
          // Map tutorial element IDs to section IDs
          const sectionMap = {
            'inicio-link': 'hero',
            'cyberhouse-link': 'cyberhouse',
            'eventos-link': 'eventos',
            'galeria-link': 'galeria',
            'loja-link': 'loja'
          };

          if (sectionMap[prevStepData.elementId]) {
            // Scroll to the corresponding section
            const sectionElement = document.getElementById(sectionMap[prevStepData.elementId]);
            if (sectionElement) {
              sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            // For other elements, scroll to the element directly
            const element = document.getElementById(prevStepData.elementId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      }, 100);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
    // Close menu when tutorial is skipped
    if (menuOpen) {
      setMenuOpen(false);
    }
    // Scroll to top of hero section when tutorial is skipped
    setTimeout(() => {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback to top of page if hero section is not found
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }, 10);
  };

  // Detectar mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="gamer-world-page" style={{ minHeight: '100vh', background: '#000', color: '#fff', margin: 0, padding: 0 }}>
      <header className="header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '10px 16px' : '12px 36px',
        margin: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 100%)',
        borderBottom: '2px solid #00d9ff',
        boxShadow: 'none',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxSizing: 'border-box',
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
              height: isMobile ? '32px' : '40px',
              verticalAlign: 'middle',
              filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))',
            }}
          />
          <span style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? '1.1rem' : '1.4rem',
            color: '#00d9ff',
            letterSpacing: isMobile ? '1px' : '2px',
            textShadow: '0 0 20px rgba(0, 217, 255, 0.8)',
          }}>CyberLife</span>
        </div>
        <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Botão Menu Hambúrguer */}
          <button
            id="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              padding: '8px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              width: '30px',
              height: '3px',
              background: menuOpen ? '#ff00ea' : '#00d9ff',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(45deg) translateY(8px)' : 'rotate(0)',
              boxShadow: `0 0 10px ${menuOpen ? '#ff00ea' : '#00d9ff'}`,
            }} />
            <div style={{
              width: '30px',
              height: '3px',
              background: menuOpen ? '#ff00ea' : '#00d9ff',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              opacity: menuOpen ? 0 : 1,
              boxShadow: `0 0 10px ${menuOpen ? '#ff00ea' : '#00d9ff'}`,
            }} />
            <div style={{
              width: '30px',
              height: '3px',
              background: menuOpen ? '#ff00ea' : '#00d9ff',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'rotate(0)',
              boxShadow: `0 0 10px ${menuOpen ? '#ff00ea' : '#00d9ff'}`,
            }} />
          </button>


          <Link to="/menu">
            <button id="inicio-btn" style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 217, 255, 0.05) 100%)',
              border: '2px solid #00d9ff',
              color: '#00d9ff',
              fontSize: isMobile ? '0.85rem' : '1rem',
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 'bold',
              letterSpacing: isMobile ? '1px' : '2px',
              padding: isMobile ? '6px 14px' : '8px 20px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.3) 0%, rgba(0, 217, 255, 0.15) 100%)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 217, 255, 0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 217, 255, 0.05) 100%)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              Início
            </button>
          </Link>
        </nav>
      </header>
      
      {/* Menu Bar Dropdown */}
      <nav style={{
        position: 'absolute',
        top: isMobile ? '52px' : '68px',
        right: isMobile ? '10px' : '120px',
        background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.98) 0%, rgba(0, 5, 16, 0.98) 100%)',
        backdropFilter: 'blur(15px)',
        border: '2px solid rgba(138, 43, 226, 0.4)',
        borderRadius: '0 0 12px 12px',
        borderTop: 'none',
        zIndex: 98,
        boxShadow: '0 8px 30px rgba(138, 43, 226, 0.4)',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        maxHeight: menuOpen ? '400px' : '0',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
        overflow: 'hidden',
        minWidth: '220px',
      }}>
        <div style={{
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {[
            { name: 'Início', id: 'hero', isScroll: true, tutorialId: 'inicio-link' },
            { name: 'CyberHouse', id: 'cyberhouse', isScroll: true, tutorialId: 'cyberhouse-link' },
            { name: 'Eventos', id: 'eventos', isScroll: true, tutorialId: 'eventos-link' },
            { name: 'Explore Jogos', id: 'galeria', isScroll: true, tutorialId: 'galeria-link' },
            { name: 'Loja Gamer', id: 'loja', isScroll: true, tutorialId: 'loja-link' },
            { name: 'Perfil', id: 'perfil', isScroll: false, tutorialId: 'perfil-link' },
          ].map((item, idx) => (
            item.isScroll ? (
              <a
                key={idx}
                id={item.tutorialId}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                color: '#00d9ff',
                textDecoration: 'none',
                padding: '12px 16px',
                position: 'relative',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                borderRadius: '8px',
                background: 'rgba(0, 217, 255, 0.05)',
                cursor: 'pointer',
                overflow: 'hidden',
                animation: menuOpen ? `slideInMenu 0.4s ease-out ${idx * 0.1}s both` : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.paddingLeft = '24px';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)';
                e.currentTarget.style.color = '#00d9ff';
                e.currentTarget.style.paddingLeft = '16px';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {item.name}
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '0%',
                background: 'linear-gradient(180deg, #ff00ea 0%, #00d9ff 100%)',
                transition: 'height 0.3s ease',
                boxShadow: '0 0 10px #ff00ea',
              }} />
            </a>
            ) : (
              <Link
                key={idx}
                id={item.tutorialId}
                to={`/${item.id}`}
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#00d9ff',
                  textDecoration: 'none',
                  padding: '12px 16px',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.5px',
                  borderRadius: '8px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  animation: menuOpen ? `slideInMenu 0.4s ease-out ${idx * 0.1}s both` : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.paddingLeft = '24px';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)';
                  e.currentTarget.style.color = '#00d9ff';
                  e.currentTarget.style.paddingLeft = '16px';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {item.name}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '0%',
                  background: 'linear-gradient(180deg, #ff00ea 0%, #00d9ff 100%)',
                  transition: 'height 0.3s ease',
                  boxShadow: '0 0 10px #ff00ea',
                }} />
              </Link>
            )
          ))}
        </div>
      </nav>
      
      <section id="hero" className="gamer-world-hero" style={{
        position: 'relative', 
        height: 'calc(100vh - 68px)', 
        width: '100vw',
        overflow: 'hidden',
        padding: '0', 
        margin: 0,
        boxShadow: '0 20px 60px rgba(0, 217, 255, 0.4)',
      }}>
        {/* Carrossel ocupando toda a seção */}
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Gamer World Banner"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: index === 4 ? 'top' : 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: index === current ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: index === current ? 1 : 0,
            }}
          />
        ))}
        
        {/* Overlay escuro para melhor legibilidade do texto */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)',
          zIndex: 2,
        }} />
        
        {/* Partículas flutuantes decorativas - Múltiplas camadas */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i < 6 ? '4px' : '2px',
            height: i < 6 ? '4px' : '2px',
            background: i % 2 === 0 ? '#00d9ff' : '#ff00ea',
            borderRadius: '50%',
            top: `${15 + (i * 8)}%`,
            left: i < 6 ? `${2 + i * 2}%` : `${85 + (i - 6) * 2}%`,
            zIndex: 2,
            boxShadow: `0 0 ${i < 6 ? '10px' : '6px'} ${i % 2 === 0 ? 'rgba(0, 217, 255, 0.8)' : 'rgba(255, 0, 234, 0.8)'}`,
            animation: `floatParticle ${2.5 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
        
        {/* Círculos expandindo de fundo */}
        {[...Array(3)].map((_, i) => (
          <div key={`circle-${i}`} style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            border: `2px solid ${i % 2 === 0 ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 0, 234, 0.1)'}`,
            borderRadius: '50%',
            top: '40%',
            left: '8%',
            zIndex: 1,
            animation: `rippleExpand ${4 + i}s ease-out infinite`,
            animationDelay: `${i * 1.3}s`,
          }} />
        ))}
        
        {/* Texto sobreposto - Novo Design Futurista */}
        <div style={{
          position: 'absolute', 
          top: '30%', 
          left: '8vw', 
          zIndex: 3, 
          textAlign: 'left', 
          maxWidth: '700px',
          transform: textVisible ? 'translateY(0)' : 'translateY(30px)',
          opacity: textVisible ? 1 : 0,
          transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Tag superior decorativa */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            animation: 'slideRight 1s ease-out',
          }}>
            <div style={{
              width: '40px',
              height: '2px',
              background: 'linear-gradient(90deg, #00d9ff, transparent)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '0.9rem',
              color: '#00d9ff',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontWeight: 600,
              textShadow: '0 0 10px rgba(0, 217, 255, 0.6)',
            }}>
              // GAME MODE ACTIVATED
            </span>
          </div>
          
          {/* Título principal - Stack vertical */}
          <div style={{ marginBottom: '25px' }}>
            {['ARE', 'YOU', 'PLAYER?'].map((word, idx) => (
              <div key={idx} style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 900,
                fontSize: idx === 2 ? '4.5rem' : '4rem',
                lineHeight: '0.9',
                marginBottom: idx === 2 ? '0' : '5px',
                color: '#fff',
                textShadow: `
                  0 0 20px ${idx === 2 ? 'rgba(255, 0, 234, 0.8)' : 'rgba(0, 217, 255, 0.8)'},
                  0 0 40px ${idx === 2 ? 'rgba(255, 0, 234, 0.5)' : 'rgba(0, 217, 255, 0.5)'}
                `,
                animation: `slideUp ${0.8 + idx * 0.2}s ease-out ${idx * 0.15}s both, letterGlow 3s ease-in-out infinite ${idx * 0.3}s`,
                position: 'relative',
                display: 'inline-block',
              }}>
                {word}
                {/* Barra vertical decorativa */}
                {idx === 2 && (
                  <div style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '80%',
                    background: 'linear-gradient(180deg, #00d9ff, #ff00ea)',
                    boxShadow: '0 0 15px rgba(255, 0, 234, 0.8)',
                    animation: 'heightPulse 2s ease-in-out infinite',
                  }} />
                )}
              </div>
            ))}
          </div>
          
          {/* Grid de pontos decorativos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 4px)',
            gap: '8px',
            marginBottom: '20px',
            animation: 'fadeIn 1s ease-out 0.8s both',
          }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                width: '4px',
                height: '4px',
                background: i === 3 || i === 4 ? '#ff00ea' : '#00d9ff',
                boxShadow: `0 0 8px ${i === 3 || i === 4 ? '#ff00ea' : '#00d9ff'}`,
                animation: `dotBlink ${1 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
          
          {/* Subtítulo moderno */}
          <div style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.4rem',
            color: '#fff',
            lineHeight: '1.6',
            maxWidth: '550px',
            opacity: 0.9,
            animation: 'fadeIn 1s ease-out 1s both',
            borderLeft: '3px solid #ff00ea',
            paddingLeft: '20px',
            boxShadow: '-5px 0 15px rgba(255, 0, 234, 0.3)',
          }}>
            <span style={{
              color: '#00d9ff',
              fontWeight: 600,
              textShadow: '0 0 10px rgba(0, 217, 255, 0.6)',
            }}>
              Being a gamer
            </span>
            {' is realizing that '}
            <span style={{
              color: '#ff00ea',
              fontWeight: 600,
              fontStyle: 'italic',
              textShadow: '0 0 10px rgba(255, 0, 234, 0.6)',
            }}>
              real life is very boring!
            </span>
          </div>
          
          {/* Elemento decorativo inferior */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '30px',
            alignItems: 'center',
            animation: 'fadeIn 1s ease-out 1.2s both',
          }}>
            <div style={{
              width: '60px',
              height: '2px',
              background: '#00d9ff',
              animation: 'expandWidth 1.5s ease-out 1.3s both',
              boxShadow: '0 0 10px #00d9ff',
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              background: '#ff00ea',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 15px #ff00ea',
              animation: 'rotatePulse 3s ease-in-out infinite',
            }} />
          </div>
        </div>
        
        {/* Estilos de animação */}
        <style>{`
          @keyframes glowPulse {
            0%, 100% {
              text-shadow: 
                0 0 10px rgba(0, 217, 255, 0.8),
                0 0 20px rgba(0, 217, 255, 0.6),
                0 0 30px rgba(0, 217, 255, 0.4),
                0 0 40px rgba(0, 217, 255, 0.2);
              transform: scale(1);
            }
            50% {
              text-shadow: 
                0 0 15px rgba(0, 217, 255, 1),
                0 0 30px rgba(0, 217, 255, 0.8),
                0 0 45px rgba(0, 217, 255, 0.6),
                0 0 60px rgba(0, 217, 255, 0.4);
              transform: scale(1.02);
            }
          }
          
          @keyframes expandLine {
            from {
              width: 0;
              opacity: 0;
            }
            to {
              width: 80px;
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes floatParticle {
            0%, 100% {
              transform: translateY(0) translateX(0);
              opacity: 0.3;
            }
            25% {
              transform: translateY(-15px) translateX(5px);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-8px) translateX(-5px);
              opacity: 1;
            }
            75% {
              transform: translateY(-20px) translateX(3px);
              opacity: 0.5;
            }
          }
          
          @keyframes cornerGlow {
            0%, 100% {
              box-shadow: 0 0 5px currentColor;
              opacity: 0.6;
            }
            50% {
              box-shadow: 0 0 20px currentColor;
              opacity: 1;
            }
          }
          
          @keyframes scanLine {
            0% {
              top: 0;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }
          
          @keyframes scanLineHorizontal {
            0% {
              left: 0;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: 100%;
              opacity: 0;
            }
          }
          
          @keyframes rippleExpand {
            0% {
              transform: scale(0);
              opacity: 0.8;
            }
            70% {
              opacity: 0.3;
            }
            100% {
              transform: scale(3);
              opacity: 0;
            }
          }
          
          @keyframes borderPulse {
            0%, 100% {
              border-color: rgba(0, 217, 255, 0.3);
              box-shadow: 0 8px 32px rgba(0, 217, 255, 0.2), inset 0 0 20px rgba(0, 217, 255, 0.1);
            }
            50% {
              border-color: rgba(0, 217, 255, 0.6);
              box-shadow: 0 8px 40px rgba(0, 217, 255, 0.4), inset 0 0 30px rgba(0, 217, 255, 0.2);
            }
          }
          
          @keyframes gradientShift {
            0%, 100% {
              transform: rotate(0deg) scale(1);
              opacity: 0.5;
            }
            50% {
              transform: rotate(180deg) scale(1.1);
              opacity: 0.8;
            }
          }
          
          @keyframes lightTrail {
            0% {
              left: -100px;
              opacity: 0;
            }
            50% {
              opacity: 0.6;
            }
            100% {
              left: 100%;
              opacity: 0;
            }
          }
          
          @keyframes slideRight {
            from {
              transform: translateX(-30px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              width: 40px;
              opacity: 0.6;
            }
            50% {
              width: 60px;
              opacity: 1;
            }
          }
          
          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes letterGlow {
            0%, 100% {
              filter: brightness(1);
            }
            50% {
              filter: brightness(1.3);
            }
          }
          
          @keyframes heightPulse {
            0%, 100% {
              height: 80%;
              opacity: 0.8;
            }
            50% {
              height: 100%;
              opacity: 1;
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes dotBlink {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.3);
            }
          }
          
          @keyframes expandWidth {
            from {
              width: 0;
            }
            to {
              width: 60px;
            }
          }
          
          @keyframes rotatePulse {
            0%, 100% {
              transform: rotate(45deg) scale(1);
            }
            50% {
              transform: rotate(45deg) scale(1.3);
            }
          }
          
          @keyframes floatSlow {
            0%, 100% {
              transform: translateY(-50%) translateX(0);
            }
            50% {
              transform: translateY(-50%) translateX(10px);
            }
          }
          
          @keyframes randomFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -40px) scale(1.2); }
            50% { transform: translate(-20px, 30px) scale(0.9); }
            75% { transform: translate(40px, 20px) scale(1.1); }
          }
          
          @keyframes randomFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-50px, 20px) scale(1.3); }
            66% { transform: translate(30px, -30px) scale(0.8); }
          }
          
          @keyframes randomFloat3 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            20% { transform: translate(20px, -50px) rotate(45deg); }
            40% { transform: translate(-40px, 10px) rotate(-30deg); }
            60% { transform: translate(10px, 40px) rotate(60deg); }
            80% { transform: translate(-30px, -20px) rotate(-45deg); }
          }
          
          @keyframes morphShape {
            0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            50% { border-radius: 50% 30% 50% 60% / 30% 50% 70% 40%; }
            75% { border-radius: 40% 70% 60% 30% / 70% 40% 50% 60%; }
          }
          
          @keyframes diagonalMorph {
            0%, 100% {
              clip-path: polygon(0 8%, 100% 0, 100% 92%, 0 100%);
            }
            25% {
              clip-path: polygon(0 3%, 100% 2%, 100% 97%, 0 95%);
            }
            50% {
              clip-path: polygon(0 12%, 100% 1%, 100% 88%, 0 99%);
            }
            75% {
              clip-path: polygon(0 5%, 100% 4%, 100% 95%, 0 96%);
            }
          }
          
          @keyframes borderSlide {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes slideInMenu {
            0% {
              opacity: 0;
              transform: translateX(-20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes ambilightPulse {
            0%, 100% {
              opacity: 0.6;
              transform: translateX(-50%) scale(1);
            }
            50% {
              opacity: 1;
              transform: translateX(-50%) scale(1.1);
            }
          }
        `}</style>
        
        {/* Gradiente escuro no fim da seção */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '120px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)',
          zIndex: 2,
        }} />
        
        {/* Ambilight effect na transição */}
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '150px',
          background: 'radial-gradient(ellipse at center, rgba(0, 217, 255, 0.4) 0%, rgba(255, 0, 234, 0.3) 40%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 3,
          animation: 'ambilightPulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      </section>

      {/* Seção Sobre CyberHouse */}
      <section id="cyberhouse" style={{
        padding: isMobile ? '60px 20px' : '120px 48px',
        background: 'linear-gradient(180deg, #000 0%, #0a0a0a 50%, #000 100%)',
        borderTop: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 -40px 80px rgba(0, 217, 255, 0.3), 0 -20px 40px rgba(255, 0, 234, 0.2)',
      }}>
        {/* Background Chun-Li - Esquerda */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: isMobile ? '200px' : '400px',
          height: isMobile ? '250px' : '500px',
          backgroundImage: `url(${imgChunLi})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          opacity: isMobile ? 0.15 : 0.3,
          filter: 'drop-shadow(0 0 30px rgba(0, 217, 255, 0.4))',
          animation: 'floatSlow 6s ease-in-out infinite',
          zIndex: 1,
          display: isMobile ? 'none' : 'block',
        }} />
        
        {/* Background Subzero - Direita */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: isMobile ? '200px' : '400px',
          height: isMobile ? '250px' : '500px',
          backgroundImage: `url(${imgSubzero})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          opacity: isMobile ? 0.15 : 0.3,
          filter: 'drop-shadow(0 0 30px rgba(255, 0, 234, 0.4))',
          animation: 'floatSlow 6s ease-in-out infinite 3s',
          zIndex: 1,
          display: isMobile ? 'none' : 'block',
        }} />
        
        {/* Overlay com gradiente */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.7) 70%)',
          zIndex: 2,
        }} />
        
        <div style={{maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 3}}>
          {/* Tag superior */}
          <div style={{
            textAlign: 'center',
            marginBottom: isMobile ? '15px' : '20px',
          }}>
            <span style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '0.75rem' : '0.9rem',
              color: '#00d9ff',
              letterSpacing: isMobile ? '2px' : '4px',
              textTransform: 'uppercase',
              fontWeight: 600,
              textShadow: '0 0 10px rgba(0, 217, 255, 0.8)',
            }}>
              // ABOUT US
            </span>
          </div>
          
          {/* Título */}
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 900,
            fontSize: isMobile ? '2.5rem' : '4rem',
            color: '#fff',
            textAlign: 'center',
            marginBottom: isMobile ? '30px' : '50px',
            letterSpacing: isMobile ? '2px' : '4px',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #00d9ff 0%, #fff 50%, #ff00ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(0, 217, 255, 0.6))',
            lineHeight: '1.2',
            wordWrap: 'break-word',
            padding: isMobile ? '0 10px' : '0',
          }}>Cyber<span style={{color: '#ff00ea', textShadow: '0 0 30px rgba(255, 0, 234, 0.8)'}}>House</span></h2>
          
          {/* Card de conteúdo */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(0, 217, 255, 0.3)',
            borderRadius: isMobile ? '15px' : '20px',
            padding: isMobile ? '30px 20px' : '50px 60px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 217, 255, 0.2), inset 0 0 30px rgba(0, 217, 255, 0.1)',
            boxSizing: 'border-box',
            margin: isMobile ? '0 10px' : '0',
          }}>
            {/* Borda animada superior */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00d9ff, #ff00ea, transparent)',
              animation: 'borderSlide 3s linear infinite',
            }} />
            
            {/* Texto descritivo */}
            <p style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '1rem' : '1.3rem',
              color: '#fff',
              textAlign: 'center',
              lineHeight: isMobile ? '1.6' : '1.9',
              margin: isMobile ? '0 auto 20px' : '0 auto 30px',
              opacity: 0.95,
              fontWeight: 400,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}>
              A <span style={{color: '#00d9ff', fontWeight: 700, textShadow: '0 0 10px rgba(0, 217, 255, 0.6)'}}>CyberHouse</span> é o paraíso dos gamers! 
              Oferecemos os melhores jogos, hardware de última geração e uma comunidade apaixonada por games.
            </p>
            
            <p style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '1rem' : '1.3rem',
              color: '#fff',
              textAlign: 'center',
              lineHeight: isMobile ? '1.6' : '1.9',
              margin: '0 auto',
              opacity: 0.95,
              fontWeight: 400,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}>
              Aqui você encontra tudo o que precisa para levar sua experiência de jogo ao próximo nível. 
              Seja você um jogador <span style={{color: '#ff00ea', fontWeight: 700, textShadow: '0 0 10px rgba(255, 0, 234, 0.6)'}}>casual</span> ou{' '}
              <span style={{color: '#00d9ff', fontWeight: 700, textShadow: '0 0 10px rgba(0, 217, 255, 0.6)'}}>profissional</span>, 
              temos o equipamento perfeito para você dominar suas partidas.
            </p>
            
            {/* Grid de features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '20px' : '30px',
              marginTop: isMobile ? '30px' : '50px',
            }}>
              {[
                { icon: '🎮', title: 'Jogos', color: '#00d9ff' },
                { icon: '⚡', title: 'Performance', color: '#ff00ea' },
                { icon: '🏆', title: 'Torneios', color: '#00d9ff' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  textAlign: 'center',
                  padding: isMobile ? '15px' : '20px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${item.color}40`,
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 10px 30px ${item.color}60`;
                  e.currentTarget.style.borderColor = item.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = `${item.color}40`;
                }}>
                  <div style={{fontSize: isMobile ? '2.5rem' : '3rem', marginBottom: '10px'}}>{item.icon}</div>
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    color: item.color,
                    fontWeight: 700,
                    letterSpacing: isMobile ? '1px' : '2px',
                    textShadow: `0 0 10px ${item.color}`,
                    whiteSpace: 'nowrap',
                  }}>{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Eventos */}
      <section id="eventos" style={{
        padding: isMobile ? '50px 15px' : '100px 48px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
        borderTop: '1px solid rgba(0, 217, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background animado com gradientes */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 0, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
          animation: 'gradientMove 15s ease-in-out infinite',
          zIndex: 0,
        }} />
        
        {/* Partículas flutuantes de fundo */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: i % 3 === 0 ? '#ff00ea' : i % 3 === 1 ? '#00d9ff' : '#ffea00',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.3,
            animation: `floatParticleEvents ${8 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: `0 0 10px ${i % 3 === 0 ? '#ff00ea' : i % 3 === 1 ? '#00d9ff' : '#ffea00'}`,
            zIndex: 0,
          }} />
        ))}
        
        {/* Grid pattern de fundo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.4,
          zIndex: 0,
        }} />
        
        {/* Linhas escaneando */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00d9ff, transparent)',
          animation: 'scanLineVertical 8s ease-in-out infinite',
          boxShadow: '0 0 20px #00d9ff',
          zIndex: 0,
        }} />
        
        <div style={{maxWidth: isMobile ? '100%' : '1200px', margin: '0 auto', position: 'relative', zIndex: 1, padding: isMobile ? '0 5px' : '0'}}>
          {/* Tag line superior */}
          <div style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '0.9rem',
            color: '#ff00ea',
            textAlign: 'center',
            marginBottom: '10px',
            letterSpacing: '3px',
            opacity: 0.8,
            animation: 'fadeIn 1s ease-out',
          }}>// UPCOMING EVENTS</div>
          
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? '2.2rem' : '3.5rem',
            color: '#00d9ff',
            textAlign: 'center',
            marginBottom: isMobile ? '10px' : '15px',
            letterSpacing: isMobile ? '2px' : '4px',
            textShadow: '0 0 30px rgba(0, 217, 255, 0.8), 0 0 60px rgba(0, 217, 255, 0.4)',
            wordWrap: 'break-word',
            textTransform: 'uppercase',
            animation: 'glowPulse 3s ease-in-out infinite',
          }}>Eventos</h2>
          
          {/* Linha decorativa sob título */}
          <div style={{
            width: '120px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #ff00ea, transparent)',
            margin: '0 auto 20px',
            boxShadow: '0 0 15px #ff00ea',
            animation: 'expandWidth 1.5s ease-out',
          }} />
          
          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.3rem',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '50px',
            opacity: 0.9,
            animation: 'fadeIn 1s ease-out 0.3s both',
          }}>
            Experiências <span style={{color: '#ff00ea', fontWeight: 700}}>exclusivas</span> para gamers de <span style={{color: '#00d9ff', fontWeight: 700}}>verdade</span>
          </p>
          
          {/* Carrossel Próximos Eventos */}
          <div style={{
            marginBottom: '80px',
            position: 'relative',
            animation: 'fadeInUp 1s ease-out 0.5s both',
          }}>
            <h3 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 700,
              color: '#ff00ea',
              textAlign: 'center',
              marginBottom: isMobile ? '20px' : '30px',
              letterSpacing: isMobile ? '2px' : '3px',
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(255, 0, 234, 0.6)',
              animation: 'glowPulse 3s ease-in-out infinite, slideRight 1s ease-out',
            }}>Próximos Eventos</h3>
            
            <div style={{
              position: 'relative',
              maxWidth: isMobile ? '100%' : '1100px',
              margin: '0 auto',
              height: isMobile ? '350px' : '500px',
              borderRadius: isMobile ? '12px' : '20px',
              overflow: 'hidden',
              border: isMobile ? '2px solid #00d9ff' : '3px solid #00d9ff',
              boxShadow: '0 0 30px rgba(0, 217, 255, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.3)',
              animation: 'borderPulseCarousel 3s ease-in-out infinite',
            }}>
              {/* Brilho animado nas bordas */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                background: 'linear-gradient(45deg, transparent 30%, rgba(0, 217, 255, 0.3) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'borderShine 3s linear infinite',
                zIndex: 4,
                pointerEvents: 'none',
              }} />
              
              {/* Partículas decorativas */}
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: i % 2 === 0 ? '#00d9ff' : '#ff00ea',
                  borderRadius: '50%',
                  top: `${10 + i * 12}%`,
                  left: `${5 + i * 10}%`,
                  opacity: 0.6,
                  animation: `carouselParticle ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: `0 0 10px ${i % 2 === 0 ? '#00d9ff' : '#ff00ea'}`,
                  zIndex: 3,
                }} />
              ))}
              
              {/* Imagens do carrossel */}
              {displayEventImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Evento ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: index === currentEvent ? 1 : 0,
                    transform: index === currentEvent ? 'scale(1)' : 'scale(1.05)',
                    transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',
                    zIndex: index === currentEvent ? 1 : 0,
                    borderRadius: '20px',
                  }}
                />
              ))}
              
              {/* Overlay gradiente geral */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
                zIndex: 2,
                borderRadius: '20px',
              }} />
              
              {/* Informações do Evento - Lado Esquerdo */}
              {displayEvents.map((event, index) => (
                <div key={index} style={{
                  position: 'absolute',
                  left: '70px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  maxWidth: isMobile ? '95%' : '500px',
                  opacity: index === currentEvent ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out',
                  zIndex: index === currentEvent ? 20 : 0,
                  animation: index === currentEvent ? 'slideInLeft 0.8s ease-out' : 'none',
                  pointerEvents: index === currentEvent ? 'auto' : 'none',
                  paddingRight: isMobile ? '10px' : '20px',
                  paddingLeft: isMobile ? '10px' : '0',
                  boxSizing: 'border-box',
                }}>
                  {/* Tag superior */}
                  <div style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '0.85rem',
                    color: '#ff00ea',
                    marginBottom: '12px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    opacity: 0.9,
                  }}>// Próximo Evento</div>
                  
                  {/* Tipo de evento */}
                  {event.type && (
                    <div style={{
                      display: 'inline-block',
                      background: event.type === 'Torneio' 
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))'
                        : event.type === 'Corujão'
                        ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2))'
                        : 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 150, 255, 0.2))',
                      border: `2px solid ${
                        event.type === 'Torneio' ? '#FFD700'
                        : event.type === 'Corujão' ? '#8a2be2'
                        : '#00d9ff'
                      }`,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      marginBottom: '15px',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: event.type === 'Torneio' ? '#FFD700'
                        : event.type === 'Corujão' ? '#8a2be2'
                        : '#00d9ff',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      boxShadow: `0 0 15px ${
                        event.type === 'Torneio' ? 'rgba(255, 215, 0, 0.4)'
                        : event.type === 'Corujão' ? 'rgba(138, 43, 226, 0.4)'
                        : 'rgba(0, 217, 255, 0.4)'
                      }`,
                    }}>
                      {event.type === 'Torneio' && '🏆'}
                      {event.type === 'Corujão' && '🦉'}
                      {event.type === 'Rush Play' && '⚡'}
                      {' '}{event.type}
                    </div>
                  )}
                  
                  {/* Título */}
                  <h4 style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: isMobile ? '1.6rem' : '2.5rem',
                    fontWeight: 700,
                    color: '#00d9ff',
                    marginBottom: isMobile ? '12px' : '18px',
                    lineHeight: '1.2',
                    textShadow: '0 0 20px rgba(0, 217, 255, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8)',
                    letterSpacing: '1px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}>{event.title}</h4>
                  
                  {/* Linha decorativa */}
                  <div style={{
                    width: '80px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #ff00ea, #00d9ff)',
                    marginBottom: '20px',
                    boxShadow: '0 0 10px rgba(255, 0, 234, 0.6)',
                  }} />
                  
                  {/* Detalhes do evento */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginBottom: '30px',
                  }}>
                    {/* Data */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                      }}>📅</div>
                      <div>
                        <div style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '0.9rem',
                          color: '#aaa',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}>Data</div>
                        <div style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: isMobile ? '1rem' : '1.2rem',
                          color: '#fff',
                          fontWeight: 600,
                          wordWrap: 'break-word',
                        }}>{event.date}</div>
                      </div>
                    </div>
                    
                    {/* Prêmio - só exibir para Torneio */}
                    {event.type === 'Torneio' && event.prize && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                      }}>
                        <div style={{
                          fontSize: '1.5rem',
                        }}>🏆</div>
                        <div>
                          <div style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            fontSize: '0.9rem',
                            color: '#aaa',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          }}>Prêmio</div>
                          <div style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            color: '#ffea00',
                            fontWeight: 700,
                            textShadow: '0 0 10px rgba(255, 234, 0, 0.6)',
                          }}>{event.prize}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Inscrição */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                      }}>✍️</div>
                      <div>
                        <div style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '0.9rem',
                          color: '#aaa',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}>Inscrição</div>
                        <div style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '1.1rem',
                          color: '#fff',
                          fontWeight: 600,
                        }}>{event.inscription}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão Saiba Mais */}
                  <Link to={`/evento/${event.slug}`} style={{ textDecoration: 'none' }}>
                    <button style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: isMobile ? '0.95rem' : '1.1rem',
                      fontWeight: 700,
                      color: '#000',
                      background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                      border: '2px solid #00d9ff',
                      padding: isMobile ? '12px 28px' : '16px 40px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      letterSpacing: isMobile ? '1px' : '2px',
                      textTransform: 'uppercase',
                      boxShadow: '0 5px 20px rgba(0, 217, 255, 0.4)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      position: 'relative',
                      zIndex: 20,
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.6)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #00ffff 0%, #00d9ff 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 217, 255, 0.4)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)';
                    }}>
                      Saiba Mais
                      <span style={{ fontSize: '1.2rem' }}>▶</span>
                    </button>
                  </Link>
                </div>
              ))}
              
              {/* Botões de navegação - só mostrar se houver mais de 1 evento */}
              {displayEventImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentEvent((prev) => (prev - 1 + displayEventImages.length) % displayEventImages.length)}
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 217, 255, 0.15)',
                      border: '1px solid rgba(0, 217, 255, 0.4)',
                      color: '#00d9ff',
                      width: '45px',
                      height: '45px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      fontWeight: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 5,
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-50%) translateX(-5px)';
                      e.currentTarget.style.borderColor = '#00d9ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-50%)';
                      e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)';
                    }}
                  >&lt;</button>
                  
                  <button
                    onClick={() => setCurrentEvent((prev) => (prev + 1) % displayEventImages.length)}
                    style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 217, 255, 0.15)',
                  border: '1px solid rgba(0, 217, 255, 0.4)',
                  color: '#00d9ff',
                  width: '45px',
                  height: '45px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 5,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 217, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-50%) translateX(5px)';
                  e.currentTarget.style.borderColor = '#00d9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-50%)';
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)';
                }}
              >&gt;</button>
                </>
              )}
              
              {/* Indicadores - só mostrar se houver mais de 1 evento */}
              {displayEventImages.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '12px',
                  zIndex: 5,
                  animation: 'fadeIn 1s ease-out 0.8s both',
                }}>
                  {displayEventImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEvent(index)}
                      style={{
                        width: index === currentEvent ? '40px' : '12px',
                        height: '12px',
                        borderRadius: '6px',
                        background: index === currentEvent ? '#ff00ea' : 'rgba(255, 255, 255, 0.3)',
                        border: index === currentEvent ? '2px solid #ff00ea' : '2px solid rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        boxShadow: index === currentEvent ? '0 0 15px #ff00ea' : 'none',
                        animation: index === currentEvent ? 'indicatorPulse 1s ease-in-out infinite' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (index !== currentEvent) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                          e.currentTarget.style.transform = 'scale(1.3)';
                        }
                      }}
                    onMouseLeave={(e) => {
                      if (index !== currentEvent) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  />
                ))}
                </div>
              )}
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: isMobile ? '25px' : '40px',
            padding: isMobile ? '0 5px' : '0',
          }}>
            {[
              { 
                icon: '🦉',
                title: 'Corujões', 
                description: 'Faça reuniões com amigos e jogue a noite toda!',
                details: 'Sextas e Sábados • 22h às 6h',
                color: '#ff00ea',
                gradient: 'linear-gradient(135deg, rgba(255, 0, 234, 0.15) 0%, rgba(255, 0, 234, 0.05) 100%)',
                slug: 'corujoes',
              },
              { 
                icon: '🏆',
                title: 'Torneios', 
                description: 'Jogue, compita e ganhe prêmios incríveis!',
                details: 'Quinzenalmente • Premiação de até R$ 5.000',
                color: '#00d9ff',
                gradient: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(0, 217, 255, 0.05) 100%)',
                slug: 'torneios',
              },
              { 
                icon: '⚡',
                title: 'Rush Play', 
                description: 'A jogatina só acaba quando o jogo terminar!',
                details: 'Domingos • 14h - Game até zerar',
                color: '#ffea00',
                gradient: 'linear-gradient(135deg, rgba(255, 234, 0, 0.15) 0%, rgba(255, 234, 0, 0.05) 100%)',
                slug: 'rush-play',
              },
            ].map((event, idx) => (
              <div key={idx} style={{
                background: event.gradient,
                border: `2px solid ${event.color}`,
                borderRadius: isMobile ? '15px' : '20px',
                padding: isMobile ? '20px 15px' : '25px 20px',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                animation: `fadeInUp 0.8s ease-out ${idx * 0.2}s both`,
                boxSizing: 'border-box',
                wordWrap: 'break-word',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 25px 50px ${event.color}80, inset 0 0 30px ${event.color}20`;
                e.currentTarget.style.borderWidth = '3px';
                setHoveredEvent(idx);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderWidth = '2px';
                setHoveredEvent(null);
              }}>
                {/* Efeito de luz rotativa */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `conic-gradient(from 0deg, transparent, ${event.color}20, transparent 30%)`,
                  animation: 'rotateLight 8s linear infinite',
                  pointerEvents: 'none',
                }} />
                
                {/* Elemento decorativo de canto superior */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '120px',
                  height: '120px',
                  background: `radial-gradient(circle at top right, ${event.color}40 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                
                {/* Elemento decorativo de canto inferior */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle at bottom left, ${event.color}25 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                
                {/* Partículas internas */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: '3px',
                    height: '3px',
                    background: event.color,
                    borderRadius: '50%',
                    top: `${20 + i * 15}%`,
                    right: `${10 + i * 5}%`,
                    opacity: 0.4,
                    animation: `particlePulse ${2 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    boxShadow: `0 0 8px ${event.color}`,
                  }} />
                ))}
                
                <div style={{
                  fontSize: isMobile ? '2.5rem' : '3rem',
                  marginBottom: isMobile ? '10px' : '12px',
                  textAlign: 'center',
                  filter: `drop-shadow(0 0 15px ${event.color})`,
                  animation: 'iconBounce 2s ease-in-out infinite',
                  position: 'relative',
                  zIndex: 2,
                }}>{event.icon}</div>
                
                <h3 style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: isMobile ? '1.3rem' : '1.6rem',
                  color: event.color,
                  marginBottom: isMobile ? '6px' : '8px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: isMobile ? '1px' : '2px',
                  textShadow: `0 0 20px ${event.color}cc, 0 0 40px ${event.color}66`,
                  position: 'relative',
                  zIndex: 2,
                  wordWrap: 'break-word',
                }}>{event.title}</h3>
                
                <p style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: '#fff',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  opacity: 0.95,
                  marginBottom: isMobile ? '12px' : '18px',
                  position: 'relative',
                  zIndex: 2,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}>{event.description}</p>
                
                {/* Botão de ação */}
                <div style={{
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <Link to={`/atividade/${event.slug}`} style={{ textDecoration: 'none' }}>
                    <button style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: 700,
                      color: '#000',
                      background: event.color,
                      border: 'none',
                      padding: isMobile ? '6px 18px' : '8px 22px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      letterSpacing: isMobile ? '1px' : '2px',
                      textTransform: 'uppercase',
                      boxShadow: `0 5px 20px ${event.color}60`,
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = `0 8px 30px ${event.color}80`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = `0 5px 20px ${event.color}60`;
                    }}>
                      Saiba Mais
                    </button>
                  </Link>
                </div>
                
                {/* Linha decorativa inferior */}
                <div style={{
                  width: '80px',
                  height: '3px',
                  background: `linear-gradient(90deg, transparent, ${event.color}, transparent)`,
                  margin: '25px auto 0',
                  boxShadow: `0 0 15px ${event.color}`,
                  animation: 'expandWidth 1.5s ease-out',
                  position: 'relative',
                  zIndex: 2,
                }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Estilos de animação específicos */}
        <style>{`
          @keyframes gradientMove {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, 30px) scale(1.1); }
          }
          
          @keyframes floatParticleEvents {
            0%, 100% { 
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0.3;
            }
            25% { 
              transform: translateY(-20px) translateX(10px) scale(1.2);
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-10px) translateX(-15px) scale(1);
              opacity: 0.4;
            }
            75% { 
              transform: translateY(-30px) translateX(5px) scale(1.1);
              opacity: 0.5;
            }
          }
          
          @keyframes scanLineVertical {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          
          @keyframes rotateLight {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes particlePulse {
            0%, 100% { 
              opacity: 0.2;
              transform: scale(1);
            }
            50% { 
              opacity: 0.6;
              transform: scale(1.5);
            }
          }
          
          @keyframes iconBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes borderPulseCarousel {
            0%, 100% { 
              box-shadow: 0 0 30px rgba(0, 217, 255, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.3);
            }
            50% { 
              box-shadow: 0 0 50px rgba(0, 217, 255, 0.8), inset 0 0 30px rgba(0, 0, 0, 0.3);
            }
          }
          
          @keyframes borderShine {
            0% { background-position: 200% 200%; }
            100% { background-position: -200% -200%; }
          }
          
          @keyframes carouselParticle {
            0%, 100% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 0.3;
            }
            25% {
              transform: translateY(-15px) translateX(10px) rotate(90deg);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-8px) translateX(-12px) rotate(180deg);
              opacity: 0.5;
            }
            75% {
              transform: translateY(-20px) translateX(8px) rotate(270deg);
              opacity: 0.6;
            }
          }
          
          @keyframes carouselZoomIn {
            0% {
              transform: scale(1.2);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes buttonFloat {
            0%, 100% {
              transform: translateY(-50%) translateX(0);
            }
            50% {
              transform: translateY(-50%) translateX(-5px);
            }
          }
          
          @keyframes indicatorPulse {
            0%, 100% {
              box-shadow: 0 0 15px #ff00ea;
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 25px #ff00ea, 0 0 35px rgba(255, 0, 234, 0.5);
              transform: scale(1.05);
            }
          }
          
          @keyframes slideInLeft {
            0% {
              transform: translateY(-50%) translateX(-50px);
              opacity: 0;
            }
            100% {
              transform: translateY(-50%) translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes shimmerSlide {
            0% {
              left: -100%;
            }
            50% {
              left: 100%;
            }
            100% {
              left: 100%;
            }
          }

          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.7), 0 0 20px #00d9ff;
            }
            50% {
              box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.7), 0 0 30px #00d9ff, 0 0 40px #00d9ff;
            }
          }
        `}</style>
      </section>

      {/* Seção Explore Jogos */}
      <section id="galeria" style={{
        padding: '120px 48px',
        background: `linear-gradient(135deg, rgba(10, 0, 21, 0.85) 0%, rgba(0, 5, 16, 0.9) 50%, rgba(0, 16, 32, 0.85) 100%), url(${caraJogando})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
        clipPath: 'polygon(0 8%, 100% 0, 100% 92%, 0 100%)',
        marginTop: '-3%',
        marginBottom: '-3%',
      }}>
        {/* Bordas diagonais brilhantes */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(138, 43, 226, 0.8) 30%, rgba(0, 217, 255, 0.8) 70%, transparent 100%)',
          transform: 'skewY(-2deg)',
          boxShadow: '0 0 20px rgba(138, 43, 226, 0.6), 0 0 40px rgba(0, 217, 255, 0.4)',
          animation: 'borderSlide 3s linear infinite',
          zIndex: 2,
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 0, 234, 0.8) 30%, rgba(0, 217, 255, 0.8) 70%, transparent 100%)',
          transform: 'skewY(-2deg)',
          boxShadow: '0 0 20px rgba(255, 0, 234, 0.6), 0 0 40px rgba(0, 217, 255, 0.4)',
          animation: 'borderSlide 3s linear infinite reverse',
          zIndex: 2,
        }} />
        {/* Elementos flutuantes aleatórios */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${150 + Math.random() * 200}px`,
            height: `${150 + Math.random() * 200}px`,
            background: i % 3 === 0 
              ? 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)'
              : i % 3 === 1
              ? 'radial-gradient(ellipse, rgba(0, 217, 255, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 0, 234, 0.1) 0%, transparent 70%)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `randomFloat${(i % 3) + 1} ${15 + Math.random() * 10}s ease-in-out infinite, morphShape ${20 + Math.random() * 15}s ease-in-out infinite`,
            borderRadius: '50%',
            filter: 'blur(40px)',
            opacity: 0.6,
            zIndex: 0,
          }} />
        ))}
        <div style={{maxWidth: isMobile ? '100%' : '1200px', margin: '0 auto', position: 'relative', zIndex: 1, padding: isMobile ? '0 10px' : '0'}}>
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            color: '#00d9ff',
            textAlign: 'center',
            marginBottom: isMobile ? '30px' : '50px',
            letterSpacing: isMobile ? '1px' : '2px',
            textShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
          }}>Explore Jogos</h2>
          
          {/* Barra de Pesquisa */}
          <div style={{
            maxWidth: isMobile ? '90%' : '600px',
            margin: isMobile ? '0 auto 25px' : '0 auto 40px',
            position: 'relative',
          }}>
            <input
              type="text"
              placeholder={isMobile ? "Buscar jogos..." : "Buscar jogos e colocar em destaque..."}
              value={searchGame}
              onChange={(e) => {
                const value = e.target.value;
                setSearchGame(value);
                
                // Busca em tempo real
                if (value.trim()) {
                  const foundIndex = gamesData.findIndex(game => 
                    game.title.toLowerCase().includes(value.toLowerCase())
                  );
                  
                  if (foundIndex !== -1) {
                    setCurrentGame(foundIndex);
                  }
                }
              }}
              style={{
                width: '100%',
                padding: isMobile ? '12px 45px 12px 15px' : '15px 50px 15px 20px',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                color: '#fff',
                background: 'rgba(138, 43, 226, 0.05)',
                border: '2px solid rgba(138, 43, 226, 0.3)',
                borderRadius: isMobile ? '10px' : '12px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8a2be2';
                e.target.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.4)';
                e.target.style.background = 'rgba(138, 43, 226, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(138, 43, 226, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(138, 43, 226, 0.05)';
              }}
            />
            <div style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.5rem',
              color: '#8a2be2',
              pointerEvents: 'none',
            }}>🔍</div>
          </div>

          {/* Carrossel de Jogos - 3 Cards com Destaque Central */}
          <div style={{
            position: 'relative',
            maxWidth: isMobile ? '100%' : '1200px',
            height: isMobile ? '450px' : '550px',
            padding: isMobile ? '20px 0' : '40px 0',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '2000px',
          }}>
            {/* Cards do Carrossel - 3 visíveis (anterior, atual, próximo) ou 1 em mobile */}
            {(isMobile ? [0] : [-1, 0, 1]).map((offset) => {
              const gameIndex = (currentGame + offset + totalGames) % totalGames;
              const gameCard = gamesData[gameIndex];
              const isCenter = offset === 0;
              
              return (
                <div
                  key={offset}
                  onClick={() => !isCenter && setCurrentGame(gameIndex)}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    width: isMobile ? '85%' : (isCenter ? '350px' : '280px'),
                    height: isMobile ? '400px' : (isCenter ? '480px' : '400px'),
                    borderRadius: isMobile ? '15px' : '20px',
                    border: isCenter ? '4px solid rgba(138, 43, 226, 0.8)' : '3px solid rgba(138, 43, 226, 0.3)',
                    overflow: 'hidden',
                    cursor: isCenter ? 'default' : 'pointer',
                    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: `url(${gameCard.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: isMobile 
                      ? 'translateX(-50%)'
                      : `
                        translateX(calc(-50% + ${offset * 350}px))
                        translateZ(${isCenter ? '0px' : '-150px'})
                        scale(${isCenter ? '1' : '0.85'})
                      `,
                    opacity: isCenter ? '1' : '0.6',
                    boxShadow: isCenter 
                      ? '0 20px 60px rgba(138, 43, 226, 0.6), 0 0 80px rgba(138, 43, 226, 0.4), 0 0 0 2px rgba(138, 43, 226, 0.6) inset'
                      : '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(138, 43, 226, 0.2) inset',
                    zIndex: isCenter ? '10' : '5',
                    filter: isCenter ? 'brightness(1.1)' : 'brightness(0.7)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCenter) {
                      e.currentTarget.style.opacity = '0.85';
                      e.currentTarget.style.transform = `
                        translateX(calc(-50% + ${offset * 350}px))
                        translateZ(-100px)
                        scale(0.9)
                      `;
                      e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCenter) {
                      e.currentTarget.style.opacity = '0.6';
                      e.currentTarget.style.transform = `
                        translateX(calc(-50% + ${offset * 350}px))
                        translateZ(-150px)
                        scale(0.85)
                      `;
                      e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.3)';
                    }
                  }}
                >
                  {/* Overlay com gradiente */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: isCenter 
                      ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.9) 100%)'
                      : 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.9) 100%)',
                    zIndex: 1,
                  }} />
                  
                  {/* Efeito de brilho no topo (apenas centro) */}
                  {isCenter && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: isMobile ? '80px' : '120px',
                      background: 'linear-gradient(180deg, rgba(138, 43, 226, 0.2) 0%, transparent 100%)',
                      zIndex: 1,
                    }} />
                  )}
                  
                  {/* Título do jogo */}
                  <div style={{
                    position: 'absolute',
                    bottom: isCenter ? '25px' : '15px',
                    left: isCenter ? '25px' : '15px',
                    right: isCenter ? '25px' : '15px',
                    zIndex: 2,
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: isCenter ? '1.7rem' : '1.3rem',
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    textShadow: isCenter 
                      ? '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 40px rgba(138, 43, 226, 1)'
                      : '0 2px 10px rgba(0, 0, 0, 0.8)',
                    lineHeight: '1.2',
                  }}>
                    {gameCard.title}
                  </div>
                  
                  {/* Badge "EM DESTAQUE" apenas no card central */}
                  {isCenter && (
                    <div style={{
                      position: 'absolute',
                      top: isMobile ? '12px' : '20px',
                      right: isMobile ? '12px' : '20px',
                      background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.95) 0%, rgba(0, 217, 255, 0.95) 100%)',
                      padding: isMobile ? '6px 12px' : '8px 16px',
                      borderRadius: isMobile ? '15px' : '20px',
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: isMobile ? '1px' : '1.5px',
                      zIndex: 2,
                      boxShadow: '0 4px 20px rgba(138, 43, 226, 0.6)',
                      animation: 'borderPulseCarousel 2s ease-in-out infinite',
                      whiteSpace: 'nowrap',
                    }}>
                      ⭐ Em Destaque
                    </div>
                  )}

                  {/* Hover Overlay - Design Moderno com Glassmorphism */}
                  {isCenter && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.75) 0%, rgba(0, 5, 16, 0.85) 30%, rgba(0, 16, 32, 0.9) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                    padding: isMobile ? '25px' : '40px',
                    opacity: 0,
                    transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    zIndex: 3,
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                  }}>
                    {/* Efeitos de luz ambiente */}
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-20%',
                      width: '400px',
                      height: '400px',
                      background: 'radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, transparent 70%)',
                      filter: 'blur(80px)',
                      animation: 'float 6s ease-in-out infinite',
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-30%',
                      left: '-10%',
                      width: '350px',
                      height: '350px',
                      background: 'radial-gradient(circle, rgba(0, 217, 255, 0.3) 0%, transparent 70%)',
                      filter: 'blur(80px)',
                      animation: 'float 8s ease-in-out infinite reverse',
                      pointerEvents: 'none',
                    }} />
                    
                    {/* Barra de categoria/tag */}
                    <div style={{
                      position: 'absolute',
                      top: isMobile ? '20px' : '30px',
                      left: isMobile ? '20px' : '30px',
                      background: 'rgba(138, 43, 226, 0.25)',
                      border: '1px solid rgba(138, 43, 226, 0.5)',
                      backdropFilter: 'blur(10px)',
                      padding: isMobile ? '6px 14px' : '8px 18px',
                      borderRadius: '25px',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: isMobile ? '0.75rem' : '0.85rem',
                      fontWeight: 700,
                      color: '#00d9ff',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      boxShadow: '0 4px 15px rgba(138, 43, 226, 0.3)',
                    }}>
                      🎮 Jogo em Destaque
                    </div>
                    
                    {/* Container de conteúdo */}
                    <div style={{
                      position: 'relative',
                      zIndex: 1,
                      width: '100%',
                    }}>
                      {/* Título do jogo */}
                      <h3 style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: isMobile ? '1.6rem' : '2.2rem',
                        fontWeight: 900,
                        color: '#fff',
                        marginBottom: isMobile ? '12px' : '16px',
                        textShadow: '0 4px 20px rgba(0, 0, 0, 0.9), 0 0 40px rgba(138, 43, 226, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: isMobile ? '1.5px' : '2.5px',
                        lineHeight: '1.2',
                        background: 'linear-gradient(135deg, #fff 0%, #00d9ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>{gameCard.title}</h3>
                      
                      {/* Linha decorativa */}
                      <div style={{
                        width: isMobile ? '60px' : '80px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #8a2be2 0%, #00d9ff 100%)',
                        marginBottom: isMobile ? '12px' : '16px',
                        borderRadius: '2px',
                        boxShadow: '0 0 20px rgba(138, 43, 226, 0.8)',
                      }} />
                      
                      {/* Descrição do jogo */}
                      <p style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: isMobile ? '0.9rem' : '1.05rem',
                        color: 'rgba(255, 255, 255, 0.95)',
                        lineHeight: isMobile ? '1.6' : '1.75',
                        marginBottom: isMobile ? '18px' : '24px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
                        fontWeight: 400,
                        maxWidth: '95%',
                      }}>{gameCard.description}</p>
                      
                      {/* Botão de ação */}
                      <Link to="#" onClick={(e) => {
                          e.preventDefault();
                          showNotification(`Abrindo o jogo ${gameCard.title}`, 'info');
                          setTimeout(() => navigate(`/jogo/${gameCard.slug}`), 500);
                        }} style={{ textDecoration: 'none' }}>
                        <button style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: isMobile ? '0.95rem' : '1.15rem',
                          fontWeight: 800,
                          color: '#0a0015',
                          background: 'linear-gradient(135deg, #00d9ff 0%, #8a2be2 50%, #ff00ea 100%)',
                          backgroundSize: '200% 100%',
                          backgroundPosition: '0% 0%',
                          border: 'none',
                          padding: isMobile ? '12px 32px' : '16px 45px',
                          borderRadius: '50px',
                          cursor: 'pointer',
                          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          textTransform: 'uppercase',
                          letterSpacing: isMobile ? '1.5px' : '2.5px',
                          boxShadow: '0 8px 30px rgba(0, 217, 255, 0.5), 0 0 50px rgba(138, 43, 226, 0.3)',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundPosition = '100% 0%';
                          e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 217, 255, 0.9), 0 0 80px rgba(138, 43, 226, 0.6), 0 0 100px rgba(255, 0, 234, 0.4)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundPosition = '0% 0%';
                          e.currentTarget.style.transform = 'scale(1) translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.5), 0 0 50px rgba(138, 43, 226, 0.3)';
                          e.currentTarget.style.color = '#0a0015';
                        }}>
                          <span style={{ position: 'relative', zIndex: 1 }}>Ver Detalhes</span>
                          <span style={{ 
                            fontSize: isMobile ? '1.2rem' : '1.4rem',
                            position: 'relative', 
                            zIndex: 1,
                            transition: 'transform 0.3s ease',
                          }}>→</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}

            {/* Botões de Navegação Melhorados */}
            <button
              onClick={() => setCurrentGame((prev) => (prev - 1 + totalGames) % totalGames)}
              style={{
                position: 'absolute',
                left: isMobile ? '10px' : '-25px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: isMobile ? '45px' : '60px',
                height: isMobile ? '45px' : '60px',
                borderRadius: '50%',
                border: '3px solid rgba(138, 43, 226, 0.6)',
                background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.98) 0%, rgba(26, 0, 51, 0.98) 100%)',
                color: '#8a2be2',
                fontSize: isMobile ? '1.3rem' : '1.8rem',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 5px 25px rgba(138, 43, 226, 0.5), 0 0 40px rgba(138, 43, 226, 0.2)',
                zIndex: 10,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8a2be2 0%, #00d9ff 100%)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.2) rotate(-5deg)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#00d9ff';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 217, 255, 0.8), 0 0 60px rgba(138, 43, 226, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(10, 0, 21, 0.98) 0%, rgba(26, 0, 51, 0.98) 100%)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1) rotate(0deg)';
                e.currentTarget.style.color = '#8a2be2';
                e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.6)';
                e.currentTarget.style.boxShadow = '0 5px 25px rgba(138, 43, 226, 0.5), 0 0 40px rgba(138, 43, 226, 0.2)';
              }}
            >
              &lt;
            </button>

            <button
              onClick={() => setCurrentGame((prev) => (prev + 1) % totalGames)}
              style={{
                position: 'absolute',
                right: isMobile ? '10px' : '-25px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: isMobile ? '45px' : '60px',
                height: isMobile ? '45px' : '60px',
                borderRadius: '50%',
                border: '3px solid rgba(138, 43, 226, 0.6)',
                background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.98) 0%, rgba(26, 0, 51, 0.98) 100%)',
                color: '#8a2be2',
                fontSize: isMobile ? '1.3rem' : '1.8rem',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 5px 25px rgba(138, 43, 226, 0.5), 0 0 40px rgba(138, 43, 226, 0.2)',
                zIndex: 10,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8a2be2 0%, #00d9ff 100%)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.2) rotate(5deg)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#00d9ff';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 217, 255, 0.8), 0 0 60px rgba(138, 43, 226, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(10, 0, 21, 0.98) 0%, rgba(26, 0, 51, 0.98) 100%)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1) rotate(0deg)';
                e.currentTarget.style.color = '#8a2be2';
                e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.6)';
                e.currentTarget.style.boxShadow = '0 5px 25px rgba(138, 43, 226, 0.5), 0 0 40px rgba(138, 43, 226, 0.2)';
              }}
            >
              &gt;
            </button>

            {/* Indicadores Melhorados - 20 indicadores (um por jogo) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isMobile ? '5px' : '8px',
              marginTop: isMobile ? '25px' : '40px',
              flexWrap: 'wrap',
              maxWidth: isMobile ? '95%' : '800px',
              margin: isMobile ? '25px auto 0' : '40px auto 0',
              padding: isMobile ? '0 10px' : '0',
            }}>
              {Array.from({ length: totalGames }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentGame(idx)}
                  style={{
                    width: currentGame === idx ? (isMobile ? '35px' : '50px') : (isMobile ? '10px' : '14px'),
                    height: isMobile ? '10px' : '14px',
                    borderRadius: isMobile ? '5px' : '7px',
                    border: currentGame === idx ? '2px solid rgba(0, 217, 255, 0.6)' : '2px solid transparent',
                    background: currentGame === idx 
                      ? 'linear-gradient(90deg, #8a2be2 0%, #00d9ff 100%)'
                      : 'rgba(138, 43, 226, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: currentGame === idx 
                      ? '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(0, 217, 255, 0.5)' 
                      : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (currentGame !== idx) {
                      e.currentTarget.style.background = 'rgba(138, 43, 226, 0.7)';
                      e.currentTarget.style.transform = 'scale(1.3)';
                      e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.8)';
                    } else {
                      e.currentTarget.style.transform = 'scale(1.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentGame !== idx) {
                      e.currentTarget.style.background = 'rgba(138, 43, 226, 0.4)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'transparent';
                    } else {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {/* Efeito de pulso no indicador ativo */}
                  {currentGame === idx && (
                    <div style={{
                      position: 'absolute',
                      inset: '-4px',
                      border: '2px solid rgba(0, 217, 255, 0.4)',
                      borderRadius: '9px',
                      animation: 'indicatorPulse 2s ease-in-out infinite',
                      pointerEvents: 'none',
                    }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Loja Gamer */}
      <section id="loja" style={{
        padding: '10px 48px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
        borderTop: '1px solid rgba(0, 217, 255, 0.2)',
        marginTop: '-5%',
      }}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? '2rem' : '2.5rem',
            color: '#00d9ff',
            textAlign: 'center',
            marginBottom: isMobile ? '15px' : '20px',
            marginTop: isMobile ? '40px' : '60px',
            letterSpacing: isMobile ? '1px' : '2px',
            textShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
            wordWrap: 'break-word',
          }}>Loja Única</h2>
          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: isMobile ? '0.95rem' : '1.1rem',
            color: '#00d9ff',
            textAlign: 'center',
            marginBottom: isMobile ? '20px' : '30px',
            marginTop: isMobile ? '20px' : '30px',
            opacity: 0.8,
          }}>
            Destaque em <span style={{color: '#00d9ff', fontWeight: 700}}>Gamer</span>
            <br/>
            <small style={{fontSize: '0.85rem'}}>Explore também: Geek & SmartHome</small>
          </p>
          
          {/* Barra de Pesquisa e Carrinho */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '10px' : '15px',
            maxWidth: isMobile ? '100%' : '700px',
            margin: isMobile ? '0 auto 25px' : '0 auto 40px',
            padding: isMobile ? '0 10px' : '0',
            boxSizing: 'border-box',
          }}>
            <div style={{
              flex: 1,
              position: 'relative',
            }}>
              <input
                type="text"
                placeholder={isMobile ? 'Buscar...' : 'Buscar produtos...'}
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 45px 12px 15px' : '15px 50px 15px 20px',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  color: '#fff',
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00d9ff';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.4)';
                  e.target.style.background = 'rgba(0, 217, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(0, 217, 255, 0.05)';
                }}
              />
              <div style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.5rem',
                color: '#00d9ff',
                pointerEvents: 'none',
              }}>🔍</div>
            </div>
            
            {/* Botão do Carrinho */}
            <button
              onClick={() => navigate('/carrinho')}
              style={{
                padding: isMobile ? '12px 16px' : '15px 24px',
                background: 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)',
                border: '2px solid rgba(255, 0, 234, 0.4)',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ff 0%, #ff00ea 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 0, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🛒 {isMobile ? '' : 'Carrinho'}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 350px))',
            gap: isMobile ? '20px' : '30px',
            padding: isMobile ? '0 10px' : '0',
            justifyContent: 'center',
          }}>
            {storeProducts
              .filter(p => {
                // Se houver busca, procurar em TODAS as categorias
                if (searchProduct !== '') {
                  return p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                         (p.description && p.description.toLowerCase().includes(searchProduct.toLowerCase()));
                }
                // Sem busca, mostrar apenas categoria 'gamer'
                return p.category === 'gamer';
              })
              .slice(0, 4)
              .length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1.2rem',
                }}>
                  {searchProduct ? '🔍 Nenhum produto encontrado' : '📦 Nenhum produto disponível'}
                  <p style={{fontSize: '0.9rem', marginTop: '10px'}}>
                    {searchProduct ? 'Tente outra busca' : 'Adicione produtos no painel admin'}
                  </p>
                </div>
              ) : (
                storeProducts
                  .filter(p => {
                    // Se houver busca, procurar em TODAS as categorias
                    if (searchProduct !== '') {
                      return p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                             (p.description && p.description.toLowerCase().includes(searchProduct.toLowerCase()));
                    }
                    // Sem busca, mostrar apenas categoria 'gamer'
                    return p.category === 'gamer';
                  })
                  .slice(0, 4)
                  .map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/produto/${product.id}`)}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, rgba(255, 0, 234, 0.08) 100%)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '16px',
                  padding: isMobile ? '20px' : '28px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = '#00d9ff';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 217, 255, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(255, 0, 234, 0.15) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, rgba(255, 0, 234, 0.08) 100%)';
                }}>
                
                {/* Badge de categoria */}
                {product.category !== 'gamer' && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: product.category === 'geek' 
                      ? 'linear-gradient(135deg, #ff00ea, #cc00ba)'
                      : product.category === 'smarthome'
                      ? 'linear-gradient(135deg, #00ff88, #00cc66)'
                      : 'linear-gradient(135deg, #ff00ea, #cc00ba)',
                    color: '#fff',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontFamily: 'Rajdhani, sans-serif',
                    zIndex: 2,
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  }}>
                    {product.category === 'geek' ? '🎮 Geek' : product.category === 'smarthome' ? '🏠 Smart' : '🎮 Geek'}
                  </div>
                )}
                
                {/* Feedback de adicionado ao carrinho */}
                {addedToCart === product.id && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                    color: '#000',
                    padding: '8px 15px',
                    borderRadius: '25px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'Rajdhani, sans-serif',
                    zIndex: 3,
                    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.6)',
                    animation: 'pulse 0.5s ease-in-out',
                  }}>
                    ✓ Adicionado!
                  </div>
                )}
                
                {/* Imagem ou Modelo 3D do produto */}
                <div 
                  style={{
                    width: '100%',
                    height: isMobile ? '180px' : '220px',
                    marginBottom: '20px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {product.model_3d ? (
                    <>
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
                          height: '100%',
                          background: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '12px',
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
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'linear-gradient(135deg, #00d9ff, #0099cc)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'Rajdhani, sans-serif',
                        boxShadow: '0 4px 15px rgba(0, 217, 255, 0.5)',
                        zIndex: 2,
                      }}>
                        🎮 3D
                      </div>
                    </>
                  ) : product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontSize: '3rem',
                    }}>
                      📦
                    </div>
                  )}
                </div>
                
                <h3 style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: isMobile ? '1.3rem' : '1.5rem',
                  color: '#00d9ff',
                  marginBottom: '12px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  lineHeight: '1.3',
                }}>{product.name}</h3>
                
                <p style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: '#fff',
                  opacity: 0.75,
                  marginBottom: '18px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  lineHeight: '1.5',
                  maxHeight: '4.5em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>{product.description}</p>
                
                <p style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: isMobile ? '1.5rem' : '1.8rem',
                  color: '#ff00ea',
                  fontWeight: 'bold',
                  marginBottom: '18px',
                  textShadow: '0 0 20px rgba(255, 0, 234, 0.5)',
                }}>
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(product.price)}
                </p>
                
                {/* Botões de ação */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                }}>
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    style={{
                      flex: 1,
                      padding: isMobile ? '12px' : '14px',
                      background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#000',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.95rem' : '1.05rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.background = 'linear-gradient(135deg, #00ffff 0%, #00d9ff 100%)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.background = 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    🛒 Adicionar
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/produto/${product.id}`);
                    }}
                    style={{
                      padding: isMobile ? '12px 16px' : '14px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.95rem' : '1.05rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.borderColor = '#fff';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                    👁️
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </section>
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
          zIndex: 10000,
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          paddingBottom: isMobile ? '20px' : '0',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a2a 100%)',
            border: '2px solid #00d9ff',
            borderRadius: '15px',
            padding: isMobile ? '20px' : '30px',
            maxWidth: '500px',
            width: isMobile ? '95%' : '90%',
            position: 'relative',
            boxShadow: '0 0 40px rgba(0, 217, 255, 0.8), 0 0 60px rgba(0, 217, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 10001,
            maxHeight: isMobile ? '80vh' : 'none',
            overflowY: isMobile ? 'auto' : 'visible',
            // Position the tutorial modal near the element being highlighted
            ...(currentTutorialStep.elementId && (() => {
              const element = document.getElementById(currentTutorialStep.elementId);
              if (element) {
                const rect = element.getBoundingClientRect();
                // Calculate position to ensure it fits on screen
                const modalWidth = isMobile ? window.innerWidth * 0.9 : 500; // Adjust for mobile
                const adjustedLeft = Math.max(
                  10, // Minimum left margin
                  Math.min(
                    rect.left + rect.width / 2 - (modalWidth / 2), // Centered position
                    window.innerWidth - modalWidth - 10 // Maximum right margin
                  )
                );

                // Calculate top position to ensure it's visible on screen
                const topPosition = Math.min(
                  rect.bottom + 20 + window.scrollY, // Default position below element
                  window.innerHeight - 200 + window.scrollY // Ensure it doesn't go off screen
                );

                return {
                  position: 'fixed',
                  top: topPosition + 'px',
                  left: adjustedLeft + 'px',
                  transform: isMobile ? 'none' : 'translateX(-50%)',
                };
              }
              return {};
            })())
          }}>
            <div style={{
              position: 'absolute',
              top: isMobile ? '10px' : '15px',
              right: isMobile ? '10px' : '15px',
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              cursor: 'pointer',
              color: '#ff00ea',
              textShadow: '0 0 10px rgba(255, 0, 234, 0.7)',
            }} onClick={skipTutorial}>✕</div>

            <h3 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '1.3rem' : '1.5rem',
              color: '#00d9ff',
              marginBottom: '15px',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(0, 217, 255, 0.7)',
            }}>{currentTutorialStep.title}</h3>

            <p style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '0.9rem' : '1rem',
              color: '#fff',
              marginBottom: '25px',
              textAlign: 'center',
              lineHeight: '1.5',
              textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
            }}>{currentTutorialStep.description}</p>

            <div style={{
              display: isMobile ? 'flex' : 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'center' : 'space-between',
              alignItems: isMobile ? 'center' : 'center',
              gap: isMobile ? '10px' : '0',
            }}>
              <div style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                color: '#00d9ff',
                textShadow: '0 0 5px rgba(0, 217, 255, 0.5)',
                marginBottom: isMobile ? '10px' : '0',
              }}>
                Passo {tutorialStep + 1} de {tutorialSteps.length}
              </div>

              <div style={{
                display: 'flex',
                gap: isMobile ? '5px' : '10px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                {tutorialStep > 0 && (
                  <button
                    onClick={prevTutorialStep}
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(0, 150, 200, 0.3))',
                      border: '1px solid #00d9ff',
                      color: '#00d9ff',
                      padding: isMobile ? '6px 10px' : '8px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 'bold',
                      textShadow: '0 0 5px rgba(0, 217, 255, 0.5)',
                      fontSize: isMobile ? '0.8rem' : '1rem',
                    }}
                  >
                    {isMobile ? 'Ant.' : 'Anterior'}
                  </button>
                )}

                <button
                  onClick={nextTutorialStep}
                  style={{
                    background: 'linear-gradient(135deg, #00d9ff, #0099cc)',
                    border: 'none',
                    color: '#000',
                    padding: isMobile ? '6px 10px' : '8px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
                    fontSize: isMobile ? '0.8rem' : '1rem',
                  }}
                >
                  {tutorialStep === tutorialSteps.length - 1 ? (isMobile ? 'Fim' : 'Concluir') : (isMobile ? 'Próx.' : 'Próximo')}
                </button>
              </div>
            </div>
          </div>

          {/* Highlight overlay for the current element */}
          {currentTutorialStep.elementId && (() => {
            const element = document.getElementById(currentTutorialStep.elementId);
            if (element) {
              const rect = element.getBoundingClientRect();
              return (
                <div style={{
                  position: 'fixed',
                  top: rect.top + window.scrollY + 'px',
                  left: rect.left + window.scrollX + 'px',
                  width: rect.width + 'px',
                  height: rect.height + 'px',
                  border: isMobile ? '2px solid #00d9ff' : '3px solid #00d9ff',
                  borderRadius: '8px',
                  boxShadow: '0 0 15px #00d9ff, 0 0 25px rgba(0, 217, 255, 0.8)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  animation: 'pulse-glow 1.5s infinite',
                }}></div>
              );
            }
            return null;
          })()}

          {/* Special highlight for menu dropdown when it should be open */}
          {tutorialStep >= 3 && tutorialStep <= 8 && showTutorial && (
            <div style={{
              position: isMobile ? 'fixed' : 'fixed',
              top: isMobile ? '52px' : '68px',
              right: isMobile ? '5px' : '120px',
              background: 'transparent',
              border: '2px solid #00d9ff',
              borderRadius: '0 0 12px 12px',
              borderTop: 'none',
              zIndex: 9998,
              boxShadow: '0 8px 30px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.6)',
              animation: 'pulse-glow 1.5s infinite',
              pointerEvents: 'none',
              width: isMobile ? '200px' : '220px',
              maxHeight: '400px',
            }}></div>
          )}
        </div>
      )}

      <CommunityFab />

      {/* Componente de Notificação com Novo Design */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          maxWidth: '400px',
          animation: 'slideInRight 0.3s ease-out, fadeOut 0.5s ease-out 4.5s forwards'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95) 0%, rgba(20, 5, 30, 0.95) 100%)',
            border: '2px solid',
            borderColor: notification.type === 'error' ? '#ff0055' :
                         notification.type === 'success' ? '#00cc66' : '#00d9ff',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5),
                        0 0 20px ${notification.type === 'error' ? 'rgba(255, 0, 85, 0.4)' :
                                   notification.type === 'success' ? 'rgba(0, 204, 102, 0.4)' :
                                   'rgba(0, 217, 255, 0.4)'},
                        inset 0 0 15px rgba(255, 255, 255, 0.1)`,
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: '500',
            fontSize: '1rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}>
            <div style={{
              fontSize: '1.4rem',
              marginTop: '2px'
            }}>
              {notification.type === 'error' ? '⚠️' :
               notification.type === 'success' ? '✅' : '📢'}
            </div>
            <div style={{
              flex: 1,
              lineHeight: '1.5',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
            }}>
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                minWidth: '28px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Adicionando estilos CSS para as animações
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

// Adicionando os estilos ao documento
if (!document.querySelector('#notification-styles')) {
  styleSheet.id = 'notification-styles';
  document.head.appendChild(styleSheet);
}
