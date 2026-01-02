import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommunityFab from '../components/CommunityFab';

export default function PerfilPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                👤
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
                }}>Nome do Usuário</h3>
                <p style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  color: '#00d9ff',
                  marginBottom: '5px',
                }}>usuario@email.com</p>
                <p style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}>Membro desde Janeiro 2026</p>
              </div>
            </div>

            {/* Estatísticas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '30px',
            }}>
              {[
                { label: 'Jogos Favoritos', value: '12' },
                { label: 'Compras', value: '8' },
                { label: 'Pontos', value: '2,450' },
              ].map((stat, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 234, 0.1) 100%)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: isMobile ? '1.8rem' : '2rem',
                    fontWeight: 700,
                    color: '#00d9ff',
                    marginBottom: '5px',
                  }}>{stat.value}</p>
                  <p style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Botões de Ação */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '15px',
            }}>
              <button style={{
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
                Editar Perfil
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
                Configurações
              </button>
            </div>
          </div>

          {/* Jogos Recentes */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
            border: '2px solid rgba(0, 217, 255, 0.4)',
            borderRadius: '16px',
            padding: isMobile ? '25px 20px' : '35px 40px',
          }}>
            <h3 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '1.4rem' : '1.8rem',
              color: '#00d9ff',
              marginBottom: '20px',
            }}>Atividade Recente</h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}>
              {[
                'Comprou Cyberpunk 2077',
                'Adicionou God of War aos favoritos',
                'Avaliou The Last of Us - 5 estrelas',
              ].map((activity, idx) => (
                <div key={idx} style={{
                  padding: '15px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '1px solid rgba(0, 217, 255, 0.2)',
                  borderRadius: '8px',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  • {activity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CommunityFab />
    </div>
  );
}
