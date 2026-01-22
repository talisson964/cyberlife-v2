import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CompraCyberPoints = () => {
  const navigate = useNavigate();
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'success', 'error', 'info'
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setLoading(false);
        showCustomPopup('Você precisa estar logado para comprar CyberPoints.', 'error');
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    checkAuth();
  }, [navigate]);

  // Função para exibir popup personalizado
  const showCustomPopup = (message, type) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);

    // Fechar o popup automaticamente após 5 segundos
    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  const pacotes = [
    { id: 1, cyberpoints: 15, preco: 15, descricao: "15 CyberPoints por R$ 15,00", pixCode: "00020126830014br.gov.bcb.pix0136433f47be-5ba8-4c77-a98d-b9a4bdbe32380221Parabens pelos 15 CPs520400005303986540515.005802BR5924Talisson da Silva Mendes6009Sao Paulo62240520daqr197390375172464663045ABB" },
    { id: 2, cyberpoints: 33, preco: 30, descricao: "30 + 3 bônus CyberPoints por R$ 30,00", pixCode: "00020126830014br.gov.bcb.pix0136433f47be-5ba8-4c77-a98d-b9a4bdbe32380221Parabens pelos 33 CPs520400005303986540530.005802BR5924Talisson da Silva Mendes6009Sao Paulo62240520daqr19739037517710876304B43E" },
    { id: 3, cyberpoints: 55, preco: 50, descricao: "50 + 5 bônus CyberPoints por R$ 50,00", pixCode: "00020126830014br.gov.bcb.pix0136433f47be-5ba8-4c77-a98d-b9a4bdbe32380221Parabens pelos 55 CPs520400005303986540550.005802BR5924Talisson da Silva Mendes6009Sao Paulo62240520daqr1973903751818929630450D4" },
    { id: 4, cyberpoints: 110, preco: 100, descricao: "100 + 10 bônus CyberPoints por R$ 100,00", pixCode: "00020126840014br.gov.bcb.pix0136433f47be-5ba8-4c77-a98d-b9a4bdbe32380222Parabens pelos 110 CPs5204000053039865406100.005802BR5924Talisson da Silva Mendes6009Sao Paulo62240520daqr19739037518835706304DB85" }
  ];

  const [pacoteSelecionado, setPacoteSelecionado] = useState(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const handleSelecionarPacote = (pacote) => {
    setPacoteSelecionado(pacote);
    setMostrarConfirmacao(true);
  };

  const [mostrarPixCode, setMostrarPixCode] = useState(false);

  const handleConfirmarCompra = () => {
    setMostrarConfirmacao(false);
    setMostrarPixCode(true); // Show the PIX code modal instead of success message
  };

  const handleCancelar = () => {
    setMostrarConfirmacao(false);
    setPacoteSelecionado(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff',
        fontFamily: 'Rajdhani, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '1.5rem',
          textAlign: 'center',
          color: '#00d9ff',
          textShadow: '0 0 10px rgba(0, 217, 255, 0.7)'
        }}>
          Verificando autenticação...
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: '#fff',
      fontFamily: 'Rajdhani, sans-serif',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header with personalized back to home button */}
      <header style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        padding: '10px 0',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 10000
      }}>
        <button
          onClick={() => {
            console.log('Navigating to profile');
            navigate('/perfil');
          }}
          style={{
            background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
            color: '#fff',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 5px 15px rgba(0, 217, 255, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
            zIndex: 10001
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
          }}
        >
          ← Voltar para Home
        </button>
      </header>
      {/* Imagem de fundo com baixa opacidade */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("/src/imagens/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15, // Baixa opacidade
        zIndex: 0
      }}></div>
      {/* Fundo animado com partículas */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(0, 217, 255, 0.1) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(255, 0, 234, 0.1) 0%, transparent 20%),
          radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 30%)
        `,
        zIndex: 0
      }}></div>

      {/* Animação de fundo pulsante */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(0, 217, 255, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(20px)',
        animation: 'pulse 4s infinite alternate',
        zIndex: 0
      }}></div>

      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle, rgba(255, 0, 234, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(15px)',
        animation: 'pulse 5s infinite alternate-reverse',
        zIndex: 0
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        marginBottom: '40px',
        marginTop: '20px'
      }}>
        <h1 style={{
          fontSize: '2.8rem',
          margin: '20px 0',
          background: 'linear-gradient(to right, #00d9ff, #00ff88, #ff00ea)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(0, 217, 255, 0.5)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>
          Comprar CyberPoints
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#aaa',
          maxWidth: '600px',
          margin: '0 auto 30px',
          lineHeight: '1.6'
        }}>
          Adquira CyberPoints para desbloquear recursos exclusivos, participar de eventos especiais e muito mais!
        </p>
      </div>

      {/* Seção de introdução com elementos cyberpunk animados */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '40px',
        padding: '20px',
        maxWidth: '800px',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{
            flex: '1',
            minWidth: '300px',
            padding: '20px',
            background: 'rgba(10, 10, 20, 0.6)',
            borderRadius: '15px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #00d9ff, #ff00ea, #00d9ff, transparent)',
              animation: 'scan 3s linear infinite'
            }}></div>

            <h2 style={{
              color: '#00d9ff',
              marginBottom: '15px',
              fontSize: '1.5rem',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              Como Funciona?
            </h2>
            <ul style={{
              textAlign: 'left',
              color: '#ccc',
              lineHeight: '1.8',
              padding: '0 20px',
              position: 'relative',
              zIndex: 1
            }}>
              <li style={{
                position: 'relative',
                paddingLeft: '20px',
                animation: 'fadeInUp 0.5s ease-out',
                animationDelay: '0.1s'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '0',
                  color: '#00ff88',
                  fontWeight: 'bold'
                }}>✦</span>
                Escolha o pacote que melhor se adapta às suas necessidades
              </li>
              <li style={{
                position: 'relative',
                paddingLeft: '20px',
                animation: 'fadeInUp 0.5s ease-out',
                animationDelay: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '0',
                  color: '#00ff88',
                  fontWeight: 'bold'
                }}>✦</span>
                Realize o pagamento de forma segura
              </li>
              <li style={{
                position: 'relative',
                paddingLeft: '20px',
                animation: 'fadeInUp 0.5s ease-out',
                animationDelay: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '0',
                  color: '#00ff88',
                  fontWeight: 'bold'
                }}>✦</span>
                Seus CyberPoints são creditados assim que o comprovante é confirmado via Whatsapp
              </li>
              <li style={{
                position: 'relative',
                paddingLeft: '20px',
                animation: 'fadeInUp 0.5s ease-out',
                animationDelay: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '0',
                  color: '#00ff88',
                  fontWeight: 'bold'
                }}>✦</span>
                Utilize seus pontos em eventos, produtos e serviços exclusivos
              </li>
            </ul>
          </div>

          {/* Elemento visual cyberpunk animado */}
          <div style={{
            flex: '1',
            minWidth: '300px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '250px',
              height: '250px',
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid #00d9ff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 30px rgba(0, 217, 255, 0.3)'
            }}>
              {/* Grid pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                  linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '25px 25px',
                borderRadius: '50%'
              }}></div>

              {/* Central icon */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                fontSize: '5rem',
                filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.7))',
                animation: 'pulse-icon 2s infinite alternate',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src="/src/imagens/cyberpoint.png"
                  alt="CyberPoint"
                  style={{
                    maxWidth: '250px',
                    maxHeight: '250px',
                    width: 'auto',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>

              {/* Animated rings */}
              <div style={{
                position: 'absolute',
                width: '220px',
                height: '220px',
                border: '2px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '50%',
                animation: 'rotate 10s linear infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '180px',
                border: '2px solid rgba(255, 0, 234, 0.3)',
                borderRadius: '50%',
                animation: 'rotateReverse 12s linear infinite'
              }}></div>
            </div>

            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#00d9ff' : '#ff00ea',
                  animation: `floatParticle 3s infinite ease-in-out`,
                  animationDelay: `${i * 0.2}s`,
                  top: `${20 + (i % 4) * 20}%`,
                  left: `${20 + (Math.floor(i / 2) % 4) * 20}%`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto 40px'
      }}>
        {pacotes.map((pacote) => (
          <div
            key={pacote.id}
            onClick={() => handleSelecionarPacote(pacote)}
            style={{
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a2e)',
              border: '2px solid #00d9ff',
              borderRadius: '20px',
              padding: '30px 25px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 15px 35px rgba(0, 217, 255, 0.2), inset 0 0 15px rgba(0, 217, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transform: 'perspective(1000px)',
              animation: 'float 6s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 217, 255, 0.4), inset 0 0 20px rgba(0, 217, 255, 0.2)';
              e.currentTarget.style.border = '2px solid #00ff88';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 217, 255, 0.2), inset 0 0 15px rgba(0, 217, 255, 0.1)';
              e.currentTarget.style.border = '2px solid #00d9ff';
            }}
          >
            {/* Efeito de brilho no topo */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.8), transparent)',
              opacity: 0.7
            }}></div>

            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'linear-gradient(135deg, #00d9ff, #00ff88)',
              color: '#000',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(0, 217, 255, 0.5)',
              animation: 'pulse-glow 2s infinite'
            }}>
              OFERTA ESPECIAL
            </div>

            <div style={{
              fontSize: '3rem',
              marginBottom: '15px',
              background: 'linear-gradient(to right, #00d9ff, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="/src/imagens/cyberpoint.png"
                alt="CyberPoint"
                style={{
                  maxWidth: '180px',
                  maxHeight: '180px',
                  width: 'auto',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>

            <h3 style={{
              fontSize: '1.6rem',
              margin: '15px 0',
              color: '#00d9ff',
              fontWeight: 'bold'
            }}>
              {pacote.cyberpoints} CyberPoints
            </h3>

            <div style={{
              fontSize: '2.2rem',
              margin: '20px 0',
              color: '#00ff88',
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
            }}>
              R$ {pacote.preco},00
            </div>

            <p style={{
              fontSize: '1rem',
              color: '#ccc',
              marginBottom: '25px',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {pacote.descricao.includes('+') ? pacote.descricao : `${pacote.cyberpoints} CyberPoints`}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              marginBottom: '20px',
              color: '#00ff88',
              fontSize: '0.9rem'
            }}>
              {pacote.id !== 1 && <><span>🎁</span><span>Bônus incluído!</span></>}
            </div>

            <button style={{
              background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%, #ff00ea 100%)',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              width: '100%',
              boxShadow: '0 5px 15px rgba(0, 217, 255, 0.4)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff00ea 100%)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%, #ff00ea 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
            }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Comprar Agora</span>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                transition: '0.5s'
              }}></div>
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Confirmação */}
      {mostrarConfirmacao && pacoteSelecionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            color: '#fff',
            padding: '40px',
            borderRadius: '20px',
            maxWidth: '550px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
            border: '2px solid #00d9ff',
            fontFamily: 'Rajdhani, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            animation: 'modalAppear 0.5s ease-out'
          }}>
            {/* Efeito de brilho no modal */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'conic-gradient(from 0deg, transparent, #00d9ff, #ff00ea, transparent)',
              animation: 'spin 3s linear infinite',
              opacity: 0.3,
              zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: '1.8rem',
                color: '#00d9ff',
                textAlign: 'center',
                marginBottom: '25px',
                textShadow: '0 0 15px rgba(0, 217, 255, 0.5)',
                position: 'relative',
                zIndex: 1
              }}>
                Confirmar Compra
              </h3>

              <div style={{
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '25px'
              }}>
                <p style={{
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  marginBottom: '15px',
                  color: '#fff'
                }}>
                  Você está prestes a comprar <strong style={{ color: '#00ff88' }}>{pacoteSelecionado.cyberpoints} CyberPoints</strong>
                </p>

                <p style={{
                  fontSize: '1.4rem',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#00ff88',
                  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                }}>
                  por <strong>R$ {pacoteSelecionado.preco},00</strong>
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '15px',
                  color: '#00ff88',
                  fontSize: '0.9rem'
                }}>
                  {pacoteSelecionado.id !== 1 && <><span>🎁</span><span>Inclui {pacoteSelecionado.cyberpoints - pacoteSelecionado.preco} CyberPoints de bônus!</span></>}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '15px',
                marginTop: '20px'
              }}>
                <button
                  onClick={handleCancelar}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '15px 25px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    flex: 1,
                    boxShadow: '0 5px 15px rgba(255, 107, 107, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 107, 0.3)';
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarCompra}
                  style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
                    color: '#000',
                    border: 'none',
                    padding: '15px 25px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    flex: 1,
                    boxShadow: '0 5px 15px rgba(0, 255, 136, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 255, 136, 0.3)';
                  }}
                >
                  Confirmar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Código PIX */}
      {mostrarPixCode && pacoteSelecionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            color: '#fff',
            padding: '40px',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
            border: '2px solid #00d9ff',
            fontFamily: 'Rajdhani, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            animation: 'modalAppear 0.5s ease-out'
          }}>
            {/* Efeito de brilho no modal */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'conic-gradient(from 0deg, transparent, #00d9ff, #ff00ea, transparent)',
              animation: 'spin 3s linear infinite',
              opacity: 0.3,
              zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: '1.8rem',
                color: '#00d9ff',
                textAlign: 'center',
                marginBottom: '25px',
                textShadow: '0 0 15px rgba(0, 217, 255, 0.5)',
                position: 'relative',
                zIndex: 1
              }}>
                Código PIX para Pagamento
              </h3>

              <div style={{
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '25px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '1.2rem',
                  marginBottom: '15px',
                  color: '#fff'
                }}>
                  Copie o código PIX abaixo para realizar o pagamento de <strong style={{ color: '#00ff88' }}>R$ {pacoteSelecionado.preco},00</strong>
                </p>

                <div style={{
                  background: '#000',
                  padding: '15px',
                  borderRadius: '8px',
                  margin: '20px 0',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  wordBreak: 'break-all',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {pacoteSelecionado.pixCode}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pacoteSelecionado.pixCode);
                    showCustomPopup('Código PIX copiado para a área de transferência!', 'success');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    marginTop: '10px',
                    boxShadow: '0 5px 15px rgba(0, 217, 255, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
                  }}
                >
                  Copiar Código PIX
                </button>
              </div>

              <div style={{
                textAlign: 'center',
                color: '#ccc',
                fontSize: '0.9rem',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                <p>Após efetuar o pagamento, seus CyberPoints serão creditados automaticamente na sua conta.</p>
                <p style={{ color: '#ff00ea', fontWeight: 'bold' }}>Importante: Envie o comprovante do pagamento para o whatsapp da CyberLife para receber seus CyberPoints (CPs)</p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginTop: '20px'
              }}>
                <a
                  href={`https://wa.me/5517992212246?text=Olá,%20realizei%20a%20compra%20do%20plano%20de%20${pacoteSelecionado.preco}%20reais%20(${pacoteSelecionado.cyberpoints}%20CyberPoints)%20e%20estou%20enviando%20o%20comprovante%20de%20pagamento.%20Por%20favor,%20confirme%20o%20crédito%20dos%20pontos.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '15px 25px',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: '0 5px 15px rgba(37, 211, 102, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(37, 211, 102, 0.4)';
                    }}
                  >
                    Enviar Comprovante
                  </button>
                </a>
                <button
                  onClick={() => {
                    setMostrarPixCode(false);
                    setPacoteSelecionado(null);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    boxShadow: '0 5px 15px rgba(255, 107, 107, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 107, 0.3)';
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            background: popupType === 'success' ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.95) 0%, rgba(0, 204, 102, 0.95) 100%)' :
                     popupType === 'error' ? 'linear-gradient(135deg, rgba(255, 0, 234, 0.95) 0%, rgba(255, 0, 138, 0.95) 100%)' :
                     'linear-gradient(135deg, rgba(0, 217, 255, 0.95) 0%, rgba(255, 0, 234, 0.95) 100%)',
            color: '#fff',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 217, 255, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backdropFilter: 'blur(15px)',
            animation: 'popIn 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '1.6rem',
                fontWeight: 'normal'
              }}>
                {popupType === 'success' ? '✅' :
                 popupType === 'error' ? '⚠️' : 'ℹ️'}
              </span>
              <span style={{
                flex: 1,
                lineHeight: '1.5',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}>
                {popupMessage}
              </span>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: '#fff',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Estilos CSS para animações */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes glow {
          from { text-shadow: 0 0 10px #00d9ff, 0 0 20px #00d9ff; }
          to { text-shadow: 0 0 20px #00d9ff, 0 0 30px #00d9ff, 0 0 40px #00d9ff; }
        }

        @keyframes pulse {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.2; transform: scale(1.2); }
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 10px rgba(0, 217, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.8); }
          100% { box-shadow: 0 0 10px rgba(0, 217, 255, 0.5); }
        }

        @keyframes modalAppear {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-icon {
          0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(0, 217, 255, 0.7)); }
          100% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.9)); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes floatParticle {
          0% { transform: translate(0, 0); opacity: 0.7; }
          25% { transform: translate(10px, -15px); opacity: 1; }
          50% { transform: translate(-10px, 10px); opacity: 0.5; }
          75% { transform: translate(15px, 5px); opacity: 1; }
          100% { transform: translate(0, 0); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default CompraCyberPoints;