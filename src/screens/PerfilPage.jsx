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
    whatsapp: ''
  });

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
        const fazerLogin = confirm('Você precisa estar logado para ver seu perfil.\n\nDeseja fazer login agora?');
        if (fazerLogin) {
          window.location.href = '/login';
        } else {
          window.location.href = '/';
        }
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
        whatsapp: profile.whatsapp || ''
      });
    }
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
          whatsapp: editForm.whatsapp
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
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="perfil-page" style={{ minHeight: '100vh', background: '#000', color: '#fff', margin: 0, padding: 0 }}>
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
                      <img src={profile.avatar_url} alt="Avatar" style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }} />
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
                    <div>
                      <p style={{color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '5px'}}>CyberPoints</p>
                      <p style={{color: '#00ff88', fontSize: '1.2rem', fontWeight: 700}}>🎮 {profile.cyber_points} pontos</p>
                    </div>
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
              
              <button style={{
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
                }}>Idade</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={editForm.age}
                  onChange={(e) => setEditForm({...editForm, age: e.target.value})}
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

      <CommunityFab />
    </div>
  );
}
