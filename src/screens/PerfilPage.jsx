import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommunityFab from '../components/CommunityFab';
import PointsNotification from '../components/PointsNotification';
import NotificationBell from '../components/NotificationBell';
import { supabase } from '../supabaseClient';

export default function PerfilPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    nickname: '',
    age: '',
    city: '',
    state: '',
    whatsapp: '',
    avatar_url: ''
  });
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [badges, setBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [enlargedBadge, setEnlargedBadge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const [avatarGalleryImages, setAvatarGalleryImages] = useState([]);

  // Efeito para carregar as imagens da galeria de avatares
  useEffect(() => {
    // Carregar todas as imagens da pasta public/images/avatars
    const images = [
      '/images/avatars/aloy-perfil.png',
      '/images/avatars/ellie-perfil.png',
      '/images/avatars/frieren-perfil.png',
      '/images/avatars/gojo-perfil.png',
      '/images/avatars/grace-perfil.png',
      '/images/avatars/kenpachi-perfil.png',
      '/images/avatars/leon-perfil.png',
      '/images/avatars/maomao-perfil.png',
      '/images/avatars/sasuke-perfil.png',
      '/images/avatars/zoro-perfil.png'
    ];
    setAvatarGalleryImages(images);
  }, []);

  // Efeito para adicionar estilos de scrollbar personalizada
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: #2a2a2a;
        border-radius: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #ffd700;
        border-radius: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #ffaa00;
      }

      .avatar-gallery-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      .avatar-gallery-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 217, 255, 0.1);
        border-radius: 3px;
      }

      .avatar-gallery-scrollbar::-webkit-scrollbar-thumb {
        background: #00d9ff;
        border-radius: 3px;
      }

      .avatar-gallery-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #00ff88;
      }

      /* Estilos para rolagem em dispositivos móveis */
      .touch-scroll {
        -webkit-overflow-scrolling: touch;
      }

      /* Melhorar experiência de rolagem em mobile */
      .custom-scrollbar {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const showLoginPrompt = () => {
    setShowLoginPopup(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginPopup(false);
    window.location.href = '/login';
  };

  const handleGoHome = () => {
    setShowLoginPopup(false);
    window.location.href = '/';
  };

  const openSettingsModal = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Listener separado para mudanças nos pontos
  useEffect(() => {
    if (!user) return;
    
    // Configurar listener para mudanças nos pontos em tempo real
    const channel = supabase
      .channel('points-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cyber_points_history',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🎮 Novo histórico de pontos:', payload);
          
          const points = payload.new.points;
          const description = payload.new.description || 'Você ganhou pontos!';
          
          // Mostrar notificação
          setNotification({
            points: points,
            message: description
          });
          
          // Atualizar apenas os pontos sem recarregar tudo
          setProfile(prev => ({
            ...prev,
            cyber_points: (prev?.cyber_points || 0) + points
          }));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);


  const loadBadges = async (userId) => {
    try {
      setLoadingBadges(true);
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', userId)
        .eq('badges.active', true); // Apenas insígnias ativas

      if (error) throw error;

      // Transformar os dados para incluir informações da insígnia e data de aquisição
      const badgesWithInfo = data.map(ub => ({
        ...ub.badges,
        acquired_at: ub.acquired_at, // Corrigido: usar acquired_at em vez de created_at
        user_badge_id: ub.id
      }));

      setBadges(badgesWithInfo);
      setFilteredBadges(badgesWithInfo); // Inicialmente mostrar todas as insígnias
    } catch (error) {
      console.error('Erro ao carregar insígnias:', error);
      setBadges([]);
      setFilteredBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔍 Sessão:', session?.user?.id);
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        // Mostrar popup personalizado em vez do confirm padrão
        showLoginPrompt();
        return;
      }
      
      const user = session.user;
      setUser(user);
      console.log('👤 User ID:', user.id);
      
      // Buscar perfil do usuário SEM RLS primeiro (usando service_role ou anon)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      console.log('📊 Profile Data:', profileData);
      console.log('⚠️ Profile Error:', profileError);
      
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        alert(`Erro RLS: ${profileError.message}\n\nExecute o SQL fix-profiles-rls.sql no Supabase SQL Editor!`);
        throw profileError;
      }
      
      // Se não encontrou perfil, mostrar mensagem
      if (!profileData) {
        alert('Perfil não encontrado. Entre em contato com o suporte.');
        console.error('⚠️ Perfil não existe para user_id:', user.id);
        return;
      }
      
      // Perfil encontrado com sucesso
      console.log('✅ Perfil carregado:', profileData);
      setProfile(profileData);
      setEditForm({
        full_name: profileData.full_name || '',
        nickname: profileData.nickname || '',
        age: profileData.age || '',
        city: profileData.city || '',
        state: profileData.state || '',
        whatsapp: profileData.whatsapp || ''
      });

      // Carregar insígnias do usuário
      await loadBadges(user.id);
    } catch (error) {
      console.error('💥 Erro ao carregar perfil:', error);
      alert('Erro ao carregar perfil. Verifique o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    // Restaurar valores originais
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        nickname: profile.nickname || '',
        age: profile.age || '',
        city: profile.city || '',
        state: profile.state || '',
        whatsapp: profile.whatsapp || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  };

  // Função para selecionar uma imagem de avatar
  const selectAvatarImage = (imageUrl) => {
    setEditForm(prev => ({
      ...prev,
      avatar_url: imageUrl
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!user) return;

      // Validar nickname
      if (!editForm.nickname || editForm.nickname.trim() === '') {
        alert('Nickname é obrigatório!');
        return;
      }

      // Verificar se nickname já está em uso por outro usuário
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('nickname', editForm.nickname.trim())
        .neq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar nickname:', checkError);
      }

      if (existingProfile) {
        alert(`O nickname "${editForm.nickname}" já está em uso por outro usuário. Escolha outro nickname.`);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          nickname: editForm.nickname.trim(),
          age: editForm.age ? parseInt(editForm.age) : null,
          city: editForm.city,
          state: editForm.state,
          whatsapp: editForm.whatsapp,
          avatar_url: editForm.avatar_url // Adicionando a URL do avatar
        })
        .eq('id', user.id);

      if (error) {
        // Verificar se é erro de nickname duplicado
        if (error.code === '23505' && error.message.includes('profiles_nickname_unique')) {
          alert(`O nickname "${editForm.nickname}" já está em uso. Escolha outro nickname.`);
          return;
        }
        throw error;
      }

      alert('Perfil atualizado com sucesso!');
      setEditMode(false);
      loadUserProfile(); // Recarregar dados

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recente';

    // Verificar se a data é válida
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Se a data for inválida, tentar converter de diferentes formatos
      const parsedDate = new Date(dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      }
      return 'Data desconhecida';
    }

    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Função para lidar com a pesquisa de insígnias
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredBadges(badges);
    } else {
      const filtered = badges.filter(badge =>
        badge.name.toLowerCase().includes(term) ||
        (badge.description && badge.description.toLowerCase().includes(term))
      );
      setFilteredBadges(filtered);
    }
  };

  return (
    <div className="perfil-page" style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      margin: 0,
      padding: 0,
      /* Estilos para scrollbar personalizada */
      scrollbarWidth: 'thin',
      scrollbarColor: '#ffd700 #2a2a2a'
    }}>
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
          {/* Ícone de Notificações */}
          {user && <NotificationBell userId={user.id} />}
          
          {/* Botão Menu Hambúrguer */}
          <button
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
            <button style={{
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
            { name: 'Início', path: '/gamer-world#hero' },
            { name: 'CyberHouse', path: '/gamer-world#cyberhouse' },
            { name: 'Eventos', path: '/gamer-world#eventos' },
            { name: 'Explore Jogos', path: '/gamer-world#galeria' },
            { name: 'Loja Gamer', path: '/gamer-world#loja' },
            { name: 'Perfil', path: '/perfil' },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#00d9ff',
                textDecoration: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(138, 43, 226, 0.15) 100%)';
                e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.5)';
                e.currentTarget.style.paddingLeft = '20px';
                e.currentTarget.style.color = '#00ffff';
                e.currentTarget.querySelector('div').style.height = '100%';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.paddingLeft = '15px';
                e.currentTarget.style.color = '#00d9ff';
                e.currentTarget.querySelector('div').style.height = '0%';
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
          ))}
        </div>
      </nav>

      {/* Conteúdo da Página de Perfil */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 48px',
        background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
        minHeight: 'calc(100vh - 68px)',
      }}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? '2rem' : '2.5rem',
            color: '#00d9ff',
            textAlign: 'center',
            marginBottom: isMobile ? '20px' : '30px',
            letterSpacing: isMobile ? '1px' : '2px',
            textShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
          }}>Meu Perfil</h2>
          
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#00d9ff',
              fontSize: '1.2rem',
            }}>
              Carregando...
            </div>
          ) : !profile ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#ff00ea',
              fontSize: '1.2rem',
            }}>
              Erro ao carregar perfil
            </div>
          ) : (
            <>
              {/* Container do Perfil */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
                border: '2px solid rgba(0, 217, 255, 0.4)',
                borderRadius: '16px',
                padding: isMobile ? '30px 20px' : '40px',
                marginBottom: '30px',
              }}>
                {/* Avatar e Info Principal */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                  gap: isMobile ? '20px' : '30px',
                  marginBottom: '40px',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: isMobile ? '120px' : '150px',
                    height: isMobile ? '120px' : '150px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00d9ff 0%, #ff00ea 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '3rem' : '4rem',
                    fontWeight: 700,
                    color: '#000',
                    border: '4px solid rgba(0, 217, 255, 0.6)',
                    boxShadow: '0 0 30px rgba(0, 217, 255, 0.5)',
                  }}>
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      profile.nickname?.charAt(0).toUpperCase() || '👤'
                    )}
                  </div>
                  
                  {/* Informações */}
                  <div style={{
                    flex: 1,
                    textAlign: isMobile ? 'center' : 'left',
                  }}>
                    <h3 style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '1.5rem' : '2rem',
                      color: '#fff',
                      marginBottom: '10px',
                    }}>{profile.full_name}</h3>
                    <p style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      color: '#00d9ff',
                      marginBottom: '5px',
                    }}>@{profile.nickname}</p>
                    <p style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '5px',
                    }}>{profile.email}</p>
                    <p style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                    }}>Membro desde {formatDate(profile.created_at)}</p>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '15px',
                  marginBottom: '30px',
                  padding: '20px',
                  background: 'rgba(0, 217, 255, 0.03)',
                  borderRadius: '12px',
                }}>
                  {profile.age && (
                    <div>
                      <p style={{color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '5px'}}>Idade</p>
                      <p style={{color: '#fff', fontSize: '1rem', fontWeight: 600}}>{profile.age} anos</p>
                    </div>
                  )}
                  {profile.city && (
                    <div>
                      <p style={{color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '5px'}}>Localização</p>
                      <p style={{color: '#fff', fontSize: '1rem', fontWeight: 600}}>{profile.city} - {profile.state}</p>
                    </div>
                  )}
                  {profile.whatsapp && (
                    <div>
                      <p style={{color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '5px'}}>WhatsApp</p>
                      <p style={{color: '#fff', fontSize: '1rem', fontWeight: 600}}>{profile.whatsapp}</p>
                    </div>
                  )}
                  {profile.cyber_points !== undefined && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '5px'}}>CyberPoints</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <p style={{color: '#00ff88', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>🎮 {profile.cyber_points} pontos</p>
                        <button
                          onClick={() => window.location.href = '/comprar-cyberpoints'}
                          style={{
                            background: 'linear-gradient(135deg, #ff00ea, #cc0066)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            padding: '6px 12px',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 0, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          Comprar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seção de Insígnias */}
                <div style={{
                  marginBottom: '30px',
                  padding: isMobile ? '15px' : '20px',
                  background: 'rgba(255, 217, 0, 0.05)',
                  border: 'none', /* Remover bordas */
                  borderRadius: '0', /* Remover cantos arredondados */
                  boxShadow: 'none' /* Remover sombra */
                }}>
                  <h4 style={{
                    color: '#ffd900',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: '700',
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '10px'
                  }}>
                    🏆 Minhas Insígnias
                  </h4>

                  {/* Campo de pesquisa para insígnias */}
                  <div style={{
                    marginBottom: '15px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    gap: isMobile ? '10px' : '0'
                  }}>
                    <input
                      type="text"
                      placeholder="🔍 Pesquisar insígnias..."
                      value={searchTerm}
                      onChange={handleSearch}
                      style={{
                        flex: 1,
                        padding: isMobile ? '12px' : '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 217, 0, 0.3)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#fff',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: isMobile ? '1rem' : '0.9rem',
                        width: '100%'
                      }}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilteredBadges(badges);
                        }}
                        style={{
                          marginLeft: isMobile ? '0' : '10px',
                          padding: isMobile ? '12px 15px' : '10px 15px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgba(255, 68, 68, 0.3)',
                          color: '#fff',
                          cursor: 'pointer',
                          width: isMobile ? '100%' : 'auto'
                        }}
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {badges.length > 0 ? (
                    <div>
                      <div
                        style={{
                          maxHeight: isMobile ? '300px' : '200px', /* Aumentar altura em mobile */
                          overflowY: 'auto', /* Adiciona scrollbar vertical quando necessário */
                          padding: '5px',
                          borderRadius: '8px',
                          /* Estilos personalizados para a scrollbar */
                          scrollbarWidth: isMobile ? 'none' : 'thin', /* Ocultar scrollbar em mobile */
                          scrollbarColor: isMobile ? 'transparent transparent' : '#ffd700 #2a2a2a', /* Cores da scrollbar */
                          /* Estilo alternativo para Webkit (Chrome, Safari, Edge) */
                          ...(isMobile ? {} : {
                            /* Estilos para Webkit */
                            WebkitOverflowScrolling: 'touch', // Para rolagem suave em dispositivos touch
                          })
                        }}
                        className="custom-scrollbar"
                      >
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: isMobile ? '15px' : '40px' /* Menor gap em mobile */
                        }}>
                          {filteredBadges.map((badge, index) => (
                          <div
                            key={index}
                            style={{
                              position: 'relative',
                              width: isMobile ? '100px' : '160px', /* Menor tamanho em mobile */
                              height: isMobile ? '100px' : '160px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '0',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              overflow: 'visible'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              // Remover sombra ao passar o mouse

                              // Mostrar tooltip
                              const tooltip = e.currentTarget.querySelector('.badge-tooltip');
                              if (tooltip) {
                                tooltip.style.opacity = '1';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              // Remover sombra ao sair o mouse

                              // Esconder tooltip
                              const tooltip = e.currentTarget.querySelector('.badge-tooltip');
                              if (tooltip) {
                                tooltip.style.opacity = '0';
                              }
                            }}
                            onClick={(e) => {
                              e.currentTarget.style.transform = 'scale(0.95)'; // Efeito de pressionar
                              setTimeout(() => {
                                e.currentTarget.style.transform = 'scale(1.05)'; // Volta ao hover
                              }, 100);

                              // Definir a insígnia ampliada ao clicar
                              setEnlargedBadge(badge);
                            }}
                          >
                          <div style={{
                            width: isMobile ? '70px' : '120px',
                            height: isMobile ? '70px' : '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '5px',
                            position: 'relative',
                            zIndex: '1'
                          }}>
                            {badge.image_url ? (
                              <img
                                src={badge.image_url}
                                alt={badge.name}
                                className="badge-image"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div style={{
                                fontSize: isMobile ? '2.5rem' : '4rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%'
                              }}>
                                <span className="badge-image">{badge.icon || '🎮'}</span>
                              </div>
                            )}
                            <div style={{
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              fontSize: isMobile ? '2rem' : '3.5rem'
                            }}>
                              {badge.icon || '🎮'}
                            </div>
                          </div>
                          <div style={{
                            fontSize: isMobile ? '0.6rem' : '0.7rem', // Ajustar tamanho da fonte para mobile
                            textAlign: 'center',
                            color: (() => {
                              switch(badge.rarity) {
                                case 'common': return '#cccccc'; // Cinza claro
                                case 'rare': return '#66ccff'; // Azul claro
                                case 'epic': return '#bb66ff'; // Roxo claro
                                case 'legendary': return '#ffdd66'; // Amarelo dourado claro
                                default: return '#ffdd66'; // Amarelo dourado claro padrão
                              }
                            })(),
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' // Reduzi o efeito de sombra para melhor legibilidade
                          }}>
                            {badge.name}
                          </div>

                          {/* Tooltip com data de aquisição */}
                          <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none',
                            zIndex: 1000,
                            border: '1px solid rgba(255, 217, 0, 0.5)',
                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                          }} className="badge-tooltip">
                            Adquirida em: {(() => {
                              if (!badge.acquired_at) return 'Data desconhecida';
                              const date = new Date(badge.acquired_at);
                              if (isNaN(date.getTime())) {
                                // Tentar diferentes formatos de data
                                const dateFormats = [
                                  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO
                                  /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
                                  /\d{4}-\d{2}-\d{2}/ // YYYY-MM-DD
                                ];

                                for (const format of dateFormats) {
                                  if (format.test(badge.acquired_at)) {
                                    const parsedDate = new Date(badge.acquired_at);
                                    if (!isNaN(parsedDate.getTime())) {
                                      return parsedDate.toLocaleDateString('pt-BR');
                                    }
                                  }
                                }
                                return 'Data desconhecida';
                              }
                              return date.toLocaleDateString('pt-BR');
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                ) : (
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      margin: '20px 0'
                    }}>
                      Nenhuma insígnia conquistada ainda. Continue interagindo para ganhar insígnias!
                    </p>
                  )}
                </div>

                {/* Botões de Ação */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '15px',
                }}>
                  <button 
                    onClick={handleEditProfile}
                    style={{
                      padding: '15px',
                      background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#000',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 217, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    ✏️ Editar Perfil
                  </button>
              
              <button
                onClick={openSettingsModal}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 234, 0.1) 100%)',
                  border: '2px solid #00d9ff',
                  borderRadius: '10px',
                  color: '#00d9ff',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 217, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                ⚙️ Configurações
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </section>

      {/* Modal de Edição */}
      {editMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }} onClick={handleCancelEdit}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1f 100%)',
            border: '2px solid #00d9ff',
            borderRadius: '20px',
            padding: isMobile ? '30px 20px' : '40px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 0 50px rgba(0, 217, 255, 0.5)',
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '1.8rem' : '2rem',
              color: '#00d9ff',
              marginBottom: '30px',
              textAlign: 'center',
            }}>✏️ Editar Perfil</h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#00d9ff',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>Nome Completo</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontFamily: 'Rajdhani, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#00d9ff',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>Nickname</label>
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontFamily: 'Rajdhani, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#00d9ff',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>Data de Nascimento</label>
                <input
                  type="date"
                  value={editForm.age ? new Date(Date.now() - (editForm.age * 365.25 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const birthDate = new Date(e.target.value);
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();

                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }

                      setEditForm({...editForm, age: age.toString()});
                    } else {
                      setEditForm({...editForm, age: ''});
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontFamily: 'Rajdhani, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '15px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#00d9ff',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}>Cidade</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '2px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontFamily: 'Rajdhani, sans-serif',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#00d9ff',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}>Estado</label>
                  <input
                    type="text"
                    maxLength="2"
                    value={editForm.state}
                    onChange={(e) => setEditForm({...editForm, state: e.target.value.toUpperCase()})}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '2px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontFamily: 'Rajdhani, sans-serif',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#00d9ff',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>WhatsApp</label>
                <input
                  type="text"
                  placeholder="(XX) XXXXX-XXXX"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontFamily: 'Rajdhani, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Galeria de Avatares */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#00d9ff',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>Escolher Avatar</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '10px',
                  marginBottom: '15px',
                  padding: '10px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  /* Estilos personalizados para a scrollbar */
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#00d9ff rgba(0, 217, 255, 0.1)'
                }}
                className="avatar-gallery-scrollbar"
                >
                  {avatarGalleryImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => selectAvatarImage(img)}
                      style={{
                        cursor: 'pointer',
                        border: editForm.avatar_url === img ? '3px solid #00ff88' : '2px solid transparent',
                        borderRadius: '50%',
                        padding: '5px',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={img}
                        alt={`Avatar ${index + 1}`}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(255, 255, 255, 0.2)'
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  <span style={{ color: '#00ff88', fontSize: '0.9rem' }}>Avatar atual:</span>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #00d9ff'
                  }}>
                    {editForm.avatar_url ? (
                      <img
                        src={editForm.avatar_url}
                        alt="Avatar selecionado"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 217, 255, 0.2)',
                        fontSize: '1.2rem'
                      }}>
                        👤
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginTop: '20px',
              }}>
                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: '15px',
                    background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#000',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 217, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  ✅ Salvar
                </button>

                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '15px',
                    background: 'transparent',
                    border: '2px solid #ff00ea',
                    borderRadius: '10px',
                    color: '#ff00ea',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 0, 234, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificação de pontos */}
      {notification && (
        <PointsNotification
          points={notification.points}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Popup de Login */}
      {showLoginPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(10px)'
        }} onClick={handleGoHome}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1f 100%)',
            border: '2px solid #00d9ff',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(0, 217, 255, 0.5), 0 0 100px rgba(0, 217, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            borderImage: 'linear-gradient(45deg, #00d9ff, #ff00ea) 1'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Efeitos decorativos */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)',
              animation: 'spin 20s linear infinite'
            }}></div>

            <div style={{
              position: 'absolute',
              top: '-30%',
              left: '-30%',
              width: '150%',
              height: '150%',
              background: 'conic-gradient(from 0deg, transparent, #00d9ff, #ff00ea, transparent)',
              opacity: 0.3,
              filter: 'blur(30px)'
            }}></div>

            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>

            <h2 style={{
              color: '#00d9ff',
              fontSize: '1.8rem',
              marginBottom: '20px',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.8)',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: '700',
              position: 'relative',
              zIndex: 2
            }}>
              🔐 Acesso Restrito
            </h2>

            <p style={{
              color: '#fff',
              fontSize: '1.1rem',
              marginBottom: '30px',
              lineHeight: '1.6',
              position: 'relative',
              zIndex: 2
            }}>
              Você precisa estar logado para acessar seu perfil.<br/>
              Faça login para continuar ou explore nosso site.
            </p>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 2
            }}>
              <button
                onClick={handleLoginRedirect}
                style={{
                  background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000',
                  padding: '12px 25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Rajdhani, sans-serif',
                  boxShadow: '0 5px 15px rgba(0, 217, 255, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
                }}
              >
                🔐 Fazer Login
              </button>

              <button
                onClick={handleGoHome}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 0, 234, 0.2) 0%, rgba(204, 0, 102, 0.2) 100%)',
                  border: '2px solid #ff00ea',
                  borderRadius: '10px',
                  color: '#ff00ea',
                  padding: '12px 25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Rajdhani, sans-serif',
                  boxShadow: '0 5px 15px rgba(255, 0, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 0, 234, 0.6)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 0, 234, 0.3) 0%, rgba(204, 0, 102, 0.3) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 5px 15px rgba(255, 0, 234, 0.4)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 0, 234, 0.2) 0%, rgba(204, 0, 102, 0.2) 100%)';
                }}
              >
                🏠 Ir para Início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(10px)'
        }} onClick={closeSettingsModal}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1f 100%)',
            border: '2px solid #00ff88',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '1px solid rgba(0, 255, 136, 0.3)'
            }}>
              <h3 style={{
                margin: 0,
                color: '#00ff88',
                fontSize: '1.5rem',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '700',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
              }}>
                ⚙️ Configurações da Conta
              </h3>
              <button
                onClick={closeSettingsModal}
                style={{
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 0, 0, 0.4)',
                  borderRadius: '8px',
                  color: '#ff4444',
                  padding: '8px 12px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={() => {
                  // Função para alterar senha
                  alert('Funcionalidade de alteração de senha será implementada em breve!');
                }}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 217, 255, 0.05) 100%)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '10px',
                  color: '#00d9ff',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 217, 255, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(0, 217, 255, 0.1) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 217, 255, 0.05) 100%)';
                }}
              >
                🔐 Alterar Senha
              </button>

              <button
                onClick={() => {
                  // Função para alterar email
                  alert('Funcionalidade de alteração de email será implementada em breve!');
                }}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%)',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '10px',
                  color: '#00ff88',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 255, 136, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%)';
                }}
              >
                📧 Alterar Email
              </button>

              <button
                onClick={() => {
                  // Função para gerenciar notificações
                  alert('Funcionalidade de gerenciamento de notificações será implementada em breve!');
                }}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, rgba(255, 0, 234, 0.1) 0%, rgba(255, 0, 234, 0.05) 100%)',
                  border: '2px solid rgba(255, 0, 234, 0.3)',
                  borderRadius: '10px',
                  color: '#ff00ea',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 0, 234, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 0, 234, 0.2) 0%, rgba(255, 0, 234, 0.1) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 0, 234, 0.1) 0%, rgba(255, 0, 234, 0.05) 100%)';
                }}
              >
                🔔 Gerenciar Notificações
              </button>

              <button
                onClick={() => {
                  // Função para deletar conta
                  if (window.confirm('Tem certeza que deseja deletar sua conta? Esta ação é irreversível e removerá todos os seus dados.')) {
                    alert('Funcionalidade de exclusão de conta será implementada em breve!');
                  }
                }}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(204, 0, 0, 0.1) 100%)',
                  border: '2px solid rgba(255, 68, 68, 0.3)',
                  borderRadius: '10px',
                  color: '#ff4444',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 68, 68, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(204, 0, 0, 0.2) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(204, 0, 0, 0.1) 100%)';
                }}
              >
                🗑️ Excluir Conta
              </button>
            </div>

            <div style={{
              marginTop: '25px',
              paddingTop: '15px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem'
            }}>
              Suas configurações são sincronizadas automaticamente
            </div>
          </div>
        </div>
      )}

      <CommunityFab />

      {/* Overlay para insígnia ampliada */}
      {enlargedBadge && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            cursor: 'pointer'
          }}
          onClick={() => setEnlargedBadge(null)}
        >
          <div
            style={{
              position: 'relative',
              padding: isMobile ? '10px' : '0' // Adiciona padding em mobile para evitar que fique muito perto das bordas
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {enlargedBadge.image_url ? (
              <img
                src={enlargedBadge.image_url}
                alt={enlargedBadge.name}
                style={{
                  maxWidth: isMobile ? '90vw' : '300px', /* Em mobile, usar 90% da largura da viewport */
                  maxHeight: isMobile ? '70vh' : '300px', /* Em mobile, usar 70% da altura da viewport */
                  objectFit: 'contain', /* Preserva o aspect ratio original */
                  borderRadius: '0', /* Remover bordas */
                  boxShadow: 'none' /* Remover sombra */
                }}
                onMouseEnter={(e) => {
                  // Criar tooltip com descrição e data de aquisição
                  const tooltip = document.createElement('div');
                  tooltip.className = 'enlarged-badge-tooltip';
                  const dateText = (() => {
                    if (!enlargedBadge.acquired_at) return 'Data desconhecida';
                    const date = new Date(enlargedBadge.acquired_at);
                    if (isNaN(date.getTime())) {
                      // Tentar diferentes formatos de data
                      const dateFormats = [
                        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO
                        /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
                        /\d{4}-\d{2}-\d{2}/ // YYYY-MM-DD
                      ];

                      for (const format of dateFormats) {
                        if (format.test(enlargedBadge.acquired_at)) {
                          const parsedDate = new Date(enlargedBadge.acquired_at);
                          if (!isNaN(parsedDate.getTime())) {
                            return parsedDate.toLocaleDateString('pt-BR');
                          }
                        }
                      }
                      return 'Data desconhecida';
                    }
                    return date.toLocaleDateString('pt-BR');
                  })();
                  tooltip.textContent = `${enlargedBadge.description || 'Sem descrição'}\nAdquirida em: ${dateText}`;
                  tooltip.style.position = 'absolute';
                  tooltip.style.bottom = isMobile ? '5px' : '10px'; // Posição do tooltip mais próxima em mobile
                  tooltip.style.left = '50%';
                  tooltip.style.transform = 'translateX(-50%)';
                  tooltip.style.background = 'rgba(0, 0, 0, 0.85)';
                  tooltip.style.color = '#fff';
                  tooltip.style.padding = isMobile ? '8px 12px' : '10px 15px'; // Menor padding em mobile
                  tooltip.style.borderRadius = '8px';
                  tooltip.style.fontSize = isMobile ? '12px' : '14px'; // Fonte menor em mobile
                  tooltip.style.zIndex = '10001';
                  tooltip.style.maxWidth = isMobile ? '90vw' : '300px'; // Largura máxima em mobile
                  tooltip.style.textAlign = 'center';
                  tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';

                  e.currentTarget.parentElement.appendChild(tooltip);
                }}
                onMouseLeave={(e) => {
                  // Remover tooltip
                  const tooltip = e.currentTarget.parentElement.querySelector('.enlarged-badge-tooltip');
                  if (tooltip) {
                    e.currentTarget.parentElement.removeChild(tooltip);
                  }
                }}
              />
            ) : (
              <div style={{
                fontSize: isMobile ? '5rem' : '6rem', /* Tamanho menor em mobile */
                color: '#ffd900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '250px' : '300px', // Tamanho menor em mobile
                height: isMobile ? '250px' : '300px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '0', /* Remover bordas */
                boxShadow: 'none' /* Remover sombra */
              }}
              onMouseEnter={(e) => {
                // Criar tooltip com descrição e data de aquisição
                const tooltip = document.createElement('div');
                tooltip.className = 'enlarged-badge-tooltip';
                const dateText = (() => {
                  if (!enlargedBadge.acquired_at) return 'Data desconhecida';
                  const date = new Date(enlargedBadge.acquired_at);
                  if (isNaN(date.getTime())) {
                    // Tentar diferentes formatos de data
                    const dateFormats = [
                      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO
                      /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
                      /\d{4}-\d{2}-\d{2}/ // YYYY-MM-DD
                    ];

                    for (const format of dateFormats) {
                      if (format.test(enlargedBadge.acquired_at)) {
                        const parsedDate = new Date(enlargedBadge.acquired_at);
                        if (!isNaN(parsedDate.getTime())) {
                          return parsedDate.toLocaleDateString('pt-BR');
                        }
                      }
                    }
                    return 'Data desconhecida';
                  }
                  return date.toLocaleDateString('pt-BR');
                })();
                tooltip.textContent = `${enlargedBadge.description || 'Sem descrição'}\nAdquirida em: ${dateText}`;
                tooltip.style.position = 'absolute';
                tooltip.style.bottom = isMobile ? '5px' : '10px'; // Posição do tooltip mais próxima em mobile
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.background = 'rgba(0, 0, 0, 0.85)';
                tooltip.style.color = '#fff';
                tooltip.style.padding = isMobile ? '8px 12px' : '10px 15px'; // Menor padding em mobile
                tooltip.style.borderRadius = '8px';
                tooltip.style.fontSize = isMobile ? '12px' : '14px'; // Fonte menor em mobile
                tooltip.style.zIndex = '10001';
                tooltip.style.maxWidth = isMobile ? '90vw' : '300px'; // Largura máxima em mobile
                tooltip.style.textAlign = 'center';
                tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';

                e.currentTarget.parentElement.appendChild(tooltip);
              }}
              onMouseLeave={(e) => {
                // Remover tooltip
                const tooltip = e.currentTarget.parentElement.querySelector('.enlarged-badge-tooltip');
                if (tooltip) {
                  e.currentTarget.parentElement.removeChild(tooltip);
                }
              }}
              >
                {enlargedBadge.icon || '🎮'}
              </div>
            )}
            <div style={{
              position: 'absolute',
              top: isMobile ? '5px' : '10px', // Posição mais próxima da borda em mobile
              right: isMobile ? '5px' : '10px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              borderRadius: '50%',
              width: isMobile ? '25px' : '30px', // Tamanho menor em mobile
              height: isMobile ? '25px' : '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: isMobile ? '1rem' : '1.2rem' // Fonte menor em mobile
            }}
            onClick={() => setEnlargedBadge(null)}
            >
              ×
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

