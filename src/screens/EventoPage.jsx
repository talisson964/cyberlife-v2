import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CommunityFab from '../components/CommunityFab';
import { supabase } from '../supabaseClient';

export default function EventoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCallback, setConfirmationCallback] = useState(null);

  // Função para exibir popup personalizado
  const showCustomPopup = (message, type, showBuyButton = false) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setShowBuyButton(showBuyButton);

    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  // Função para exibir confirmação personalizada
  const showCustomConfirmation = (message, callback) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
    setConfirmationCallback(() => callback);
  };

  // Função para lidar com a confirmação
  const handleConfirm = () => {
    if (confirmationCallback) {
      confirmationCallback(true);
    }
    setShowConfirmation(false);
  };

  // Função para lidar com o cancelamento
  const handleCancel = () => {
    if (confirmationCallback) {
      confirmationCallback(false);
    }
    setShowConfirmation(false);
  };

  // Carregar evento do banco de dados por UUID
  useEffect(() => {
    const loadEvento = async () => {
      try {
        setLoading(true);
        
        // Buscar evento por UUID (não por slug)
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erro ao carregar evento:', error);
          setEvento(null);
          return;
        }

        // Formatar a data para TIMESTAMPTZ
        let formattedDate = 'Data ainda não determinada';
        if (data.date) {
          const dateObj = new Date(data.date);
          formattedDate = dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        }

        // Formatar horário se existir
        let formattedTime = null;
        if (data.date) {
          const dateObj = new Date(data.date);
          formattedTime = dateObj.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        setEvento({
          ...data,
          date: formattedDate,
          time: formattedTime
        });
      } catch (error) {
        console.error('Erro ao conectar com banco:', error);
        setEvento(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvento();
  }, [id]);

  // Carregar pontos do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('cyber_points')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Erro ao carregar perfil:', error);
            setUserPoints(0);
          } else {
            setUserPoints(profile?.cyber_points || 0);
          }
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        setUserPoints(0);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para inscrever-se no evento com verificação de cyberpoints
  const registerForEvent = async () => {
    if (!evento) {
      showCustomPopup('Evento não carregado.', 'error');
      return;
    }

    // Verificar se o usuário está logado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      showCustomPopup('Você precisa estar logado para se inscrever no evento.', 'error');
      return;
    }

    // Verificar se o evento tem preço de inscrição em cyberpoints
    const inscriptionCost = evento.inscription_price_cyberpoints || 0;

    // Se houver custo, verificar se o usuário tem pontos suficientes
    if (inscriptionCost > 0) {
      if (userPoints < inscriptionCost) {
        showCustomPopup(`Você não tem CyberPoints suficientes para se inscrever neste evento.\nCusto: ${inscriptionCost} CyberPoints\nSeu saldo: ${userPoints} CyberPoints`, 'error', true);
        return;
      }

      // Confirmar com o usuário o custo da inscrição
      showCustomConfirmation(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Confirmação de Inscrição</title>
        </head>
        <body>
          <div style="font-family: Rajdhani, sans-serif; line-height: 1.8;">
            <h3 style="color: #00d9ff; margin-top: 0; margin-bottom: 15px; font-size: 1.4em; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Confirmação de Inscrição</h3>
            <p style="margin: 10px 0; font-size: 1.1em;"><strong>Evento:</strong></p>
            <p style="margin: 10px 0; font-weight: bold; color: #00d9ff; font-size: 1.2em; text-align: center; padding: 10px; background-color: rgba(0, 217, 255, 0.1); border-radius: 5px; border: 1px solid #00d9ff;">${evento.title}</p>
            <p style="margin: 15px 0; font-size: 1.1em;"><strong>Custo da inscrição:</strong> <span style="color: #ff00ea; font-weight: bold; font-size: 1.2em;">${inscriptionCost} CyberPoints</span></p>
            <p style="margin: 15px 0; font-size: 1.1em;"><strong>Seu saldo após inscrição:</strong> <span style="color: #00ff88; font-weight: bold; font-size: 1.2em;">${userPoints - inscriptionCost} CyberPoints</span></p>
            <p style="margin: 20px 0 0 0; font-size: 1.2em; text-align: center; color: #ffffff; font-weight: bold; padding: 10px; background-color: rgba(0, 217, 255, 0.2); border-radius: 5px;">Deseja confirmar sua inscrição?</p>
          </div>
        </body>
        </html>`,
        async (confirmed) => {
          if (confirmed) {
            await performRegistration(inscriptionCost);
          }
        }
      );
    } else {
      // Confirmar inscrição gratuita
      showCustomConfirmation(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Confirmação de Inscrição</title>
        </head>
        <body>
          <div style="font-family: Rajdhani, sans-serif; line-height: 1.8;">
            <h3 style="color: #00d9ff; margin-top: 0; margin-bottom: 15px; font-size: 1.4em; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Confirmação de Inscrição</h3>
            <p style="margin: 10px 0; font-size: 1.1em;"><strong>Evento:</strong></p>
            <p style="margin: 10px 0; font-weight: bold; color: #00d9ff; font-size: 1.2em; text-align: center; padding: 10px; background-color: rgba(0, 217, 255, 0.1); border-radius: 5px; border: 1px solid #00d9ff;">${evento.title}</p>
            <p style="margin: 15px 0; font-size: 1.2em; text-align: center; color: #00ff88; font-weight: bold; padding: 10px; background-color: rgba(0, 255, 136, 0.1); border-radius: 5px; border: 1px solid #00ff88;">🎉 A inscrição é gratuita!</p>
            <p style="margin: 20px 0 0 0; font-size: 1.2em; text-align: center; color: #ffffff; font-weight: bold; padding: 10px; background-color: rgba(0, 217, 255, 0.2); border-radius: 5px;">Deseja confirmar sua inscrição?</p>
          </div>
        </body>
        </html>`,
        async (confirmed) => {
          if (confirmed) {
            await performRegistration(0);
          }
        }
      );
    }
  };

  // Função auxiliar para realizar a inscrição
  const performRegistration = async (cost) => {
    setRegistrationLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showCustomPopup('Usuário não autenticado.', 'error');
        return;
      }

      // Verificar se já está inscrito
      const { data: existingRegistration } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', evento.id)
        .eq('user_id', user.id)
        .single();

      if (existingRegistration) {
        showCustomPopup('Você já está inscrito neste evento!', 'info');
        setRegistrationLoading(false);
        return;
      }

      // Se tiver custo, debitar os pontos primeiro
      if (cost > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ cyber_points: userPoints - cost })
          .eq('id', user.id);

        if (updateError) {
          console.error('Erro ao debitar pontos:', updateError);
          showCustomPopup('Erro ao processar pagamento. Tente novamente.', 'error');
          setRegistrationLoading(false);
          return;
        }
      }

      // Criar inscrição na tabela event_registrations
      const { error: insertError } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: evento.id,
          user_id: user.id
        }]);

      if (insertError) {
        console.error('Erro ao criar inscrição:', insertError);
        // Reembolsar pontos se houve erro
        if (cost > 0) {
          await supabase
            .from('profiles')
            .update({ cyber_points: userPoints })
            .eq('id', user.id);
        }
        showCustomPopup(`Erro ao se inscrever no evento: ${insertError.message}`, 'error');
        return;
      }

      // Atualizar estado local
      if (cost > 0) {
        setUserPoints(prev => prev - cost);
      }

      showCustomPopup('Inscrição realizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao se inscrever no evento:', error);
      showCustomPopup('Erro inesperado ao se inscrever no evento.', 'error');
    } finally {
      setRegistrationLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Rajdhani, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
          <h2 style={{ color: '#00d9ff', fontSize: '1.5rem' }}>Carregando evento...</h2>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', color: '#00d9ff', fontSize: '2rem', marginBottom: '20px' }}>Evento não encontrado</h2>
          <Link to="/gamer-world" style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#000',
            background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
            border: '2px solid #00d9ff',
            padding: '12px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 5px 20px rgba(0, 217, 255, 0.4)',
          }}>
            ← Voltar para Eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
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
        @keyframes pulse-live {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <div className="evento-page" style={{ minHeight: '100vh', background: '#000', color: '#fff', margin: 0, padding: 0 }}>
      {/* Header */}
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

          <Link to="/gamer-world">
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
              Voltar
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
            { name: 'Gamer World', path: '/gamer-world' },
            { name: 'Eventos', path: '/gamer-world#eventos' },
            { name: 'Perfil', path: '/perfil' },
            { name: 'Menu Principal', path: '/menu' },
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.paddingLeft = '15px';
                e.currentTarget.style.color = '#00d9ff';
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Conteúdo Principal do Evento */}
      <section style={{
        padding: isMobile ? '40px 20px' : '60px 48px',
        background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
        minHeight: 'calc(100vh - 68px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Título do Evento */}
          <h1 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? '2rem' : '3.5rem',
            color: '#00d9ff',
            textAlign: 'center',
            marginBottom: isMobile ? '15px' : '25px',
            letterSpacing: isMobile ? '2px' : '4px',
            textShadow: '0 0 30px rgba(0, 217, 255, 0.8)',
            textTransform: 'uppercase',
          }}>{evento.title}</h1>

          {/* Linha decorativa */}
          <div style={{
            width: '150px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #ff00ea, transparent)',
            margin: '0 auto 40px',
            boxShadow: '0 0 15px #ff00ea',
          }} />

          {/* Seção Evento Ao Vivo */}
          {evento.is_live && (
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b15 0%, #ee5a6f15 100%)',
              border: '3px solid #ff6b6b',
              borderRadius: '20px',
              padding: isMobile ? '25px' : '40px',
              marginBottom: '40px',
              boxShadow: '0 0 30px rgba(255, 107, 107, 0.4)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#ff6b6b',
                  padding: '10px 25px',
                  borderRadius: '30px',
                  marginBottom: '15px',
                  animation: 'pulse-live 2s ease-in-out infinite',
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: '#fff',
                    borderRadius: '50%',
                    animation: 'blink-dot 1s ease-in-out infinite',
                  }}></div>
                  <span style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '2px',
                  }}>EVENTO AO VIVO</span>
                </div>
                {evento.game_name && (
                  <h3 style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: isMobile ? '1.3rem' : '1.8rem',
                    color: '#00d9ff',
                    fontWeight: 600,
                    marginBottom: '10px',
                  }}>🎮 {evento.game_name}</h3>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '25px',
              }}>
                {/* Placar */}
                {evento.current_scores && evento.current_scores.length > 0 && (
                  <div style={{
                    background: 'rgba(255, 107, 107, 0.1)',
                    border: '2px solid rgba(255, 107, 107, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <h4 style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: '#ff6b6b',
                      marginBottom: '15px',
                    }}>📊 Placar Atual</h4>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {evento.current_scores.map((score, idx) => (
                        <li key={idx} style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '1rem',
                          color: '#fff',
                          padding: '8px 12px',
                          background: 'rgba(255, 107, 107, 0.15)',
                          borderRadius: '6px',
                        }}>{score}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ranking */}
                {evento.ranking && evento.ranking.length > 0 && (
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <h4 style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: '#ffd700',
                      marginBottom: '15px',
                    }}>🏆 Ranking</h4>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {evento.ranking.map((rank, idx) => (
                        <li key={idx} style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '1rem',
                          color: '#fff',
                          padding: '8px 12px',
                          background: 'rgba(255, 215, 0, 0.15)',
                          borderRadius: '6px',
                          fontWeight: idx === 0 ? 700 : 400,
                        }}>{rank}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Participantes */}
              {evento.participants && evento.participants.length > 0 && (
                <div style={{
                  background: 'rgba(138, 43, 226, 0.1)',
                  border: '2px solid rgba(138, 43, 226, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                }}>
                  <h4 style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#ba55d3',
                    marginBottom: '15px',
                  }}>👥 Participantes</h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '10px',
                  }}>
                    {evento.participants.map((participant, idx) => (
                      <li key={idx} style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1rem',
                        color: '#fff',
                        padding: '10px 15px',
                        background: 'rgba(138, 43, 226, 0.15)',
                        borderRadius: '6px',
                      }}>{participant}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comentários */}
              {evento.live_comments && (
                <div style={{
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                }}>
                  <h4 style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#00d9ff',
                    marginBottom: '15px',
                  }}>💬 Comentários</h4>
                  <p style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}>{evento.live_comments}</p>
                </div>
              )}

              {/* Link de Transmissão */}
              {evento.stream_link && (
                <div style={{ textAlign: 'center' }}>
                  <a
                    href={evento.stream_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#000',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                      padding: '15px 40px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      boxShadow: '0 5px 20px rgba(255, 107, 107, 0.4)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 107, 107, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 107, 107, 0.4)';
                    }}
                  >
                    📺 Assistir Ao Vivo
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Grid de Informações */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '30px',
            marginBottom: '50px',
          }}>
            {/* Card de Info Principal */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
              border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '16px',
              padding: isMobile ? '25px' : '35px',
            }}>
              <h3 style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#ff00ea',
                marginBottom: '20px',
              }}>Detalhes do Evento</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Tipo de Evento */}
                {evento.type && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>🎮 Tipo</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.2rem',
                      color: '#00d9ff',
                      fontWeight: 600,
                    }}>{evento.type}</div>
                  </div>
                )}

                {/* Status do Evento */}
                {evento.status && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>📊 Status</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.2rem',
                      color: evento.status === 'ativo' ? '#00ff88' : '#aaa',
                      fontWeight: 600,
                    }}>{evento.status}</div>
                  </div>
                )}

                <div>
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.9rem',
                    color: '#aaa',
                    marginBottom: '5px',
                  }}>📅 Data</div>
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1.2rem',
                    color: '#fff',
                    fontWeight: 600,
                  }}>{evento.date}</div>
                </div>

                {evento.time && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>🕐 Horário</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.2rem',
                      color: '#00d9ff',
                      fontWeight: 600,
                    }}>{evento.time}</div>
                  </div>
                )}

                {evento.prize && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>🏆 Prêmio</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.5rem',
                      color: '#ffea00',
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(255, 234, 0, 0.6)',
                    }}>{evento.prize}</div>
                  </div>
                )}

                {evento.inscription_price && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>💰 Valor da Inscrição</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.3rem',
                      color: '#00ff88',
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
                    }}>{evento.inscription_price}</div>
                  </div>
                )}

                {evento.inscription_price_cyberpoints && evento.inscription_price_cyberpoints > 0 && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>🎮 Valor da Inscrição em CyberPoints</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.3rem',
                      color: '#a855f7',
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
                    }}>{evento.inscription_price_cyberpoints} CyberPoints</div>
                  </div>
                )}

                {!evento.inscription_price && (!evento.inscription_price_cyberpoints || evento.inscription_price_cyberpoints === 0) && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>💰 Valor da Inscrição</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.3rem',
                      color: '#00ff88',
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
                    }}>GRÁTIS</div>
                  </div>
                )}

                {evento.max_participants && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>👥 Participantes</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.1rem',
                      color: '#fff',
                      fontWeight: 600,
                    }}>Máximo de {evento.max_participants} participantes</div>
                  </div>
                )}

                {evento.reward_points && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>🎁 Recompensa</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.3rem',
                      color: '#a855f7',
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
                    }}>+{evento.reward_points} CyberPoints</div>
                  </div>
                )}
              </div>

              {/* Botão de Inscrição */}
              <button
                onClick={registerForEvent}
                disabled={registrationLoading}
                style={{
                  width: '100%',
                  marginTop: '30px',
                  padding: '15px',
                  background: registrationLoading
                    ? 'linear-gradient(135deg, #666 0%, #444 100%)'
                    : 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: registrationLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
                onMouseEnter={(e) => {
                  if (!registrationLoading) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 217, 255, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!registrationLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}>
                {registrationLoading
                  ? 'PROCESSANDO...'
                  : evento.inscription_price_cyberpoints > 0
                    ? `Inscrever-se Agora (${evento.inscription_price_cyberpoints} CyberPoints)`
                    : 'Inscrever-se Agora (GRÁTIS)'}
              </button>
            </div>

            {/* Card de Descrição */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
              border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '16px',
              padding: isMobile ? '25px' : '35px',
            }}>
              <h3 style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#ff00ea',
                marginBottom: '20px',
              }}>Sobre o Evento</h3>

              <p style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
              }}>{evento.description}</p>

              {/* Imagem do Evento */}
              {evento.image_url && (
                <div style={{
                  marginTop: '25px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
                }}>
                  <img
                    src={evento.image_url}
                    alt={evento.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Componente de Popup Personalizado */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          maxWidth: '400px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            background: popupType === 'success' ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.9) 0%, rgba(0, 153, 204, 0.9) 100%)' :
                     popupType === 'error' ? 'linear-gradient(135deg, rgba(255, 0, 234, 0.9) 0%, rgba(255, 0, 138, 0.9) 100%)' :
                     'linear-gradient(135deg, rgba(0, 217, 255, 0.9) 0%, rgba(255, 0, 234, 0.9) 100%)',
            color: '#fff',
            padding: '15px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 217, 255, 0.3)',
            border: '2px solid rgba(0, 217, 255, 0.3)',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 'bold',
            fontSize: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                fontSize: '1.4rem',
                fontWeight: 'normal'
              }}>
                {popupType === 'success' ? '✅' :
                 popupType === 'error' ? '⚠️' : 'ℹ️'}
              </span>
              <span style={{
                flex: 1,
                lineHeight: '1.4',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}>
                {popupMessage}
              </span>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
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
            {showBuyButton && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px'
              }}>
                <button
                  onClick={() => navigate('/comprar-cyberpoints')}
                  style={{
                    background: 'linear-gradient(135deg, #00d9ff 0%, #ff00ea 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 5px 15px rgba(0, 217, 255, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
                  }}
                >
                  Comprar CyberPoints
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Componente de Confirmação Personalizado */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            color: '#fff',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 217, 255, 0.4)',
            border: '2px solid #00d9ff',
            fontFamily: 'Rajdhani, sans-serif'
          }}>
            <div
              dangerouslySetInnerHTML={{ __html: confirmationMessage }}
              style={{ marginBottom: '20px' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={handleCancel}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <CommunityFab />
    </div>
    </>
  );
}
