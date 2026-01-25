import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CommunityFab from '../components/CommunityFab';
import { supabase } from '../supabaseClient';
import './LoginPage.css'; // Mantendo os estilos existentes

export default function LoginGamer({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
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
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session) {
        navigate('/perfil'); // Redirecionar para perfil se já estiver logado
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      if (data.user) {
        // Verificar se o email foi confirmado
        if (!data.user.email_confirmed_at) {
          setMessage({ 
            type: 'error', 
            text: 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.' 
          });
          setLoading(false);
          return;
        }

        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          throw profileError;
        }

        const userData = {
          user: data.user,
          profile: profileData
        };

        setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
        setTimeout(() => {
          onLoginSuccess(userData);
          navigate('/perfil');
        }, 1000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao fazer login' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            email: formData.email,
            age: formData.age ? parseInt(formData.age) : null,
            city: formData.city,
            state: formData.state,
            whatsapp: formData.whatsapp
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Criar perfil na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            full_name: formData.fullName,
            email: formData.email,
            age: formData.age ? parseInt(formData.age) : null,
            city: formData.city,
            state: formData.state,
            whatsapp: formData.whatsapp,
            cyber_points: 0 // Iniciar com 0 pontos
          }]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não lançar erro aqui, pois o usuário já foi criado
        }

        // Conceder automaticamente a insígnia de boas-vindas
        try {
          // Primeiro, encontrar o ID da insígnia "Bem Vindo à CyberLife"
          const { data: badgeData, error: badgeError } = await supabase
            .from('badges')
            .select('id')
            .eq('name', 'Bem Vindo à CyberLife')
            .single();

          if (badgeError) {
            console.error('Erro ao buscar insígnia de boas-vindas:', badgeError);
          } else if (badgeData) {
            // Conceder a insígnia ao novo usuário
            const { error: awardError } = await supabase
              .from('user_badges')
              .insert([{
                user_id: data.user.id,
                badge_id: badgeData.id
              }]);

            if (awardError) {
              console.error('Erro ao conceder insígnia de boas-vindas:', awardError);
            } else {
              console.log('Insígnia de boas-vindas concedida com sucesso!');
            }
          }
        } catch (error) {
          console.error('Erro ao conceder insígnia de boas-vindas:', error);
        }

        setMessage({
          type: 'success',
          text: 'Conta criada com sucesso! Um email de confirmação foi enviado para seu email. Confirme seu email para poder fazer login.'
        });
        setMode('login');
        setFormData({ ...formData, password: '' });
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao criar conta' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Instruções para redefinição de senha foram enviadas para seu email.' 
      });
      setTimeout(() => setMode('login'), 3000);
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar email de recuperação' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Login como convidado - sem autenticação
    const guestUser = {
      user: {
        id: 'guest-' + Date.now(),
        email: 'convidado@cyberlife.com',
        user_metadata: {
          full_name: 'Convidado'
        }
      },
      profile: {
        id: 'guest-' + Date.now(),
        full_name: 'Convidado',
        email: 'convidado@cyberlife.com',
        city: 'Não informado',
        state: 'N/A',
        age: 0,
        whatsapp: 'N/A',
        isGuest: true
      }
    };

    setMessage({ type: 'success', text: 'Entrando como convidado...' });
    setTimeout(() => onLoginSuccess(guestUser), 500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

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
        onClick={() => navigate('/')}
        >
          <img
            src="/cyberlife-icone2.png"
            alt="CyberLife Logo"
            loading="lazy"
            decoding="async"
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

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/perfil">
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
                  Perfil
                </button>
              </Link>
              <button onClick={handleLogout} style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 234, 0.1) 0%, rgba(204, 0, 102, 0.1) 100%)',
                border: '2px solid #ff00ea',
                color: '#ff00ea',
                fontSize: isMobile ? '0.85rem' : '1rem',
                cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 'bold',
                letterSpacing: isMobile ? '1px' : '2px',
                padding: isMobile ? '6px 14px' : '8px 20px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(255, 0, 234, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 0, 234, 0.3) 0%, rgba(204, 0, 102, 0.3) 100%)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 234, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 0, 234, 0.1) 0%, rgba(204, 0, 102, 0.1) 100%)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 234, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                Sair
              </button>
            </div>
          ) : (
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
          )}
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
            { name: 'Início', id: 'hero', isScroll: true, path: '/' },
            { name: 'CyberHouse', id: 'cyberhouse', isScroll: true, path: '/gamer-world#cyberhouse' },
            { name: 'Eventos', id: 'eventos', isScroll: true, path: '/gamer-world#eventos' },
            { name: 'Explore Jogos', id: 'galeria', isScroll: true, path: '/gamer-world#galeria' },
            { name: 'Loja Gamer', id: 'loja', isScroll: true, path: '/gamer-world#loja' },
            { name: 'Perfil', id: 'perfil', isScroll: false, path: '/perfil' },
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
                e.currentTarget.querySelector('div')?.style?.setProperty && e.currentTarget.querySelector('div').style.setProperty('height', '100%');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.paddingLeft = '15px';
                e.currentTarget.style.color = '#00d9ff';
                e.currentTarget.querySelector('div')?.style?.setProperty && e.currentTarget.querySelector('div').style.setProperty('height', '0%');
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

      <section style={{
        padding: isMobile ? '60px 20px' : '100px 48px',
        background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 68px)',
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
            border: '2px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '16px',
            padding: isMobile ? '30px 20px' : '40px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)',
          }}>
            <h2 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              color: '#00d9ff',
              textAlign: 'center',
              marginBottom: '30px',
              letterSpacing: isMobile ? '1px' : '2px',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
            }}>
              {mode === 'login' && '🔐 Entrar na Conta'}
              {mode === 'register' && '會員註冊 Criar Conta'}
              {mode === 'forgot' && '🔄 Recuperar Senha'}
            </h2>

            {message.text && (
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                background: message.type === 'error' 
                  ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.15) 0%, rgba(200, 0, 0, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 255, 0, 0.15) 0%, rgba(0, 200, 0, 0.15) 100%)',
                border: `2px solid ${message.type === 'error' ? '#ff4444' : '#00ff88'}`,
                color: message.type === 'error' ? '#ff4444' : '#00ff88',
              }}>
                {message.text}
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#00d9ff',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}>📧 Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '14px 15px' : '12px 15px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '2px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: isMobile ? '1.1rem' : '1rem',
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
                  }}>🔒 Senha</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: isMobile ? '14px 45px 14px 15px' : '12px 45px 12px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: isMobile ? '1.1rem' : '1rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#00d9ff',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
                    boxShadow: '0 5px 20px rgba(0, 217, 255, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 217, 255, 0.4)';
                  }}
                >
                  {loading ? 'Entrando...' : '🔐 Entrar'}
                </button>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px',
                  gap: '10px',
                }}>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff00ea',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Esqueceu a senha?
                  </button>
                  
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>OU</span>
                  
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00ff88',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Criar conta
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
                      border: '2px solid rgba(255, 215, 0, 0.3)',
                      color: '#ffd700',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 15px rgba(255, 215, 0, 0.3)';
                    }}
                  >
                    👤 Entrar como Convidado
                  </button>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#00d9ff',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}>👤 Nome Completo</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '14px 15px' : '12px 15px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '2px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: isMobile ? '1.1rem' : '1rem',
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
                  }}>📧 Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '14px 15px' : '12px 15px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '2px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: isMobile ? '1.1rem' : '1rem',
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
                  }}>🔒 Senha</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      style={{
                        width: '100%',
                        padding: isMobile ? '14px 45px 14px 15px' : '12px 45px 12px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: isMobile ? '1.1rem' : '1rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#00d9ff',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#00d9ff',
                      fontSize: '0.9rem',
                      marginBottom: '8px',
                      fontWeight: 600,
                    }}>🎂 Idade</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="13"
                      max="120"
                      style={{
                        width: '100%',
                        padding: isMobile ? '14px 15px' : '12px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: isMobile ? '1.1rem' : '1rem',
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
                    }}>📱 WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="(XX) XXXXX-XXXX"
                      style={{
                        width: '100%',
                        padding: isMobile ? '14px 15px' : '12px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: isMobile ? '1.1rem' : '1rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#00d9ff',
                      fontSize: '0.9rem',
                      marginBottom: '8px',
                      fontWeight: 600,
                    }}>🏙️ Cidade</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: isMobile ? '14px 15px' : '12px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: isMobile ? '1.1rem' : '1rem',
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
                    }}>📍 UF</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      maxLength="2"
                      placeholder="SP"
                      style={{
                        width: '100%',
                        padding: isMobile ? '14px 15px' : '12px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: isMobile ? '1.1rem' : '1rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                      }}
                      onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '15px',
                    background: 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#000',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 20px rgba(0, 255, 136, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 255, 136, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 255, 136, 0.4)';
                  }}
                >
                  {loading ? 'Criando conta...' : '會員註冊 Criar Conta'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00d9ff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Já tem uma conta? Faça login
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#00d9ff',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}>📧 Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Digite seu email cadastrado"
                    style={{
                      width: '100%',
                      padding: isMobile ? '14px 15px' : '12px 15px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '2px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: isMobile ? '1.1rem' : '1rem',
                      fontFamily: 'Rajdhani, sans-serif',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '15px',
                    background: 'linear-gradient(135deg, #ff6600 0%, #cc5200 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 20px rgba(255, 102, 0, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 102, 0, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 102, 0, 0.4)';
                  }}
                >
                  {loading ? 'Enviando...' : '🔄 Enviar Instruções'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00d9ff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Voltar para login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <CommunityFab />
    </div>
  );
}