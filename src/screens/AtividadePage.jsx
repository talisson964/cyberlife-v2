import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommunityFab from '../components/CommunityFab';

const atividadesData = {
  'corujoes': {
    icon: '🦉',
    title: 'Corujões',
    description: 'Faça reuniões com amigos e jogue a noite toda!',
    color: '#ff00ea',
    schedule: 'Sextas e Sábados • 22h às 6h',
    fullDescription: 'Nossos eventos Corujões são perfeitos para quem ama jogar durante a madrugada! Reúna seus amigos e aproveite uma noite completa de jogos, competição e diversão. O ambiente fica aberto das 22h até as 6h da manhã.',
    benefits: [
      'Ambiente exclusivo para grupos',
      'Acesso ilimitado a todos os jogos',
      'Snacks e bebidas disponíveis',
      'Promoções especiais na madrugada',
      'Salas privativas disponíveis',
    ],
    pricing: [
      { type: 'Individual', price: 'R$ 50,00', duration: 'Por pessoa/noite' },
      { type: 'Grupo (5+ pessoas)', price: 'R$ 40,00', duration: 'Por pessoa/noite' },
      { type: 'Pacote VIP', price: 'R$ 200,00', duration: 'Sala privativa (até 10 pessoas)' },
    ],
    rules: [
      'Idade mínima: 16 anos (menores acompanhados)',
      'Reserva antecipada recomendada',
      'Respeite o horário de silêncio para outras áreas',
      'Consumo de alimentos e bebidas permitido',
    ]
  },
  'torneios': {
    icon: '🏆',
    title: 'Torneios',
    description: 'Jogue, compita e ganhe prêmios incríveis!',
    color: '#00d9ff',
    schedule: 'Quinzenalmente • Premiação de até R$ 5.000',
    fullDescription: 'Participe dos nossos torneios quinzenais e mostre suas habilidades! Competições em diversos jogos com premiações que podem chegar a R$ 5.000. Os melhores jogadores ganham reconhecimento, prêmios e bragging rights!',
    benefits: [
      'Premiações em dinheiro',
      'Troféus e medalhas',
      'Transmissão ao vivo dos jogos',
      'Ranking de jogadores',
      'Networking com outros gamers',
    ],
    pricing: [
      { type: 'Inscrição Individual', price: 'R$ 30,00', duration: 'Por torneio' },
      { type: 'Inscrição de Equipe', price: 'R$ 100,00', duration: 'Equipe completa (5 jogadores)' },
      { type: 'Passe Mensal', price: 'R$ 80,00', duration: 'Todos os torneios do mês' },
    ],
    rules: [
      'Inscrição prévia obrigatória',
      'Equipes devem ser registradas com antecedência',
      'Verificação de identidade necessária',
      'Fair play é mandatório - punições para trapaça',
      'Prêmios pagos via PIX ou transferência',
    ]
  },
  'rush-play': {
    icon: '⚡',
    title: 'Rush Play',
    description: 'A jogatina só acaba quando o jogo terminar!',
    color: '#ffea00',
    schedule: 'Domingos • 14h - Game até zerar',
    fullDescription: 'Rush Play é o desafio definitivo para gamers hardcore! Todo domingo, escolhemos um jogo e a missão é clara: jogar até zerar. Não importa quanto tempo leve, vamos continuar até completar 100% do jogo!',
    benefits: [
      'Maratona de gameplay completa',
      'Pizza e bebidas incluídas',
      'Coaching e dicas de speedrunners',
      'Certificado de conclusão',
      'Sorteio de prêmios para participantes',
    ],
    pricing: [
      { type: 'Participação Individual', price: 'R$ 60,00', duration: 'Dia completo + alimentação' },
      { type: 'Dupla', price: 'R$ 100,00', duration: '2 pessoas + alimentação' },
      { type: 'Espectador', price: 'Gratuito', duration: 'Entrada livre para assistir' },
    ],
    rules: [
      'Início pontual às 14h',
      'Não há limite de tempo - pode durar até 12h+',
      'Pausas programadas a cada 3 horas',
      'Jogos escolhidos por votação prévia',
      'Participação limitada - inscreva-se cedo!',
    ]
  }
};

export default function AtividadePage() {
  const { atividadeId } = useParams();
  const atividade = atividadesData[atividadeId];
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!atividade) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontFamily: 'Rajdhani, sans-serif', color: '#00d9ff' }}>Atividade não encontrada</h2>
      </div>
    );
  }

  return (
    <div className="atividade-page" style={{ minHeight: '100vh', background: '#000', color: '#fff', margin: 0, padding: 0 }}>
      {/* Header igual ao da Gamer World */}
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

      {/* Conteúdo Principal da Atividade */}
      <section style={{
        padding: isMobile ? '40px 20px' : '60px 48px',
        background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
        minHeight: 'calc(100vh - 68px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Título da Atividade */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              fontSize: isMobile ? '4rem' : '5rem',
              marginBottom: '20px',
              filter: `drop-shadow(0 0 20px ${atividade.color})`,
            }}>{atividade.icon}</div>
            
            <h1 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '2.5rem' : '4rem',
              color: atividade.color,
              marginBottom: isMobile ? '15px' : '25px',
              letterSpacing: isMobile ? '2px' : '4px',
              textShadow: `0 0 30px ${atividade.color}`,
              textTransform: 'uppercase',
            }}>{atividade.title}</h1>

            <p style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              color: '#fff',
              marginBottom: '10px',
            }}>{atividade.description}</p>

            <p style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.1rem',
              color: atividade.color,
              fontWeight: 600,
            }}>{atividade.schedule}</p>

            {/* Linha decorativa */}
            <div style={{
              width: '150px',
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${atividade.color}, transparent)`,
              margin: '30px auto',
              boxShadow: `0 0 15px ${atividade.color}`,
            }} />
          </div>

          {/* Descrição Completa */}
          <div style={{
            background: `linear-gradient(135deg, ${atividade.color}15 0%, ${atividade.color}05 100%)`,
            border: `2px solid ${atividade.color}`,
            borderRadius: '16px',
            padding: isMobile ? '30px 20px' : '40px',
            marginBottom: '40px',
          }}>
            <p style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.8',
              textAlign: 'center',
            }}>{atividade.fullDescription}</p>
          </div>

          {/* Grid de Informações */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '30px',
            marginBottom: '40px',
          }}>
            {/* Benefícios */}
            <div style={{
              background: `linear-gradient(135deg, ${atividade.color}15 0%, ${atividade.color}05 100%)`,
              border: `2px solid ${atividade.color}`,
              borderRadius: '16px',
              padding: isMobile ? '25px' : '35px',
            }}>
              <h3 style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: atividade.color,
                marginBottom: '20px',
              }}>✨ Benefícios</h3>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {atividade.benefits.map((benefit, idx) => (
                  <li key={idx} style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    padding: '12px 15px',
                    background: `${atividade.color}10`,
                    border: `1px solid ${atividade.color}40`,
                    borderRadius: '8px',
                  }}>
                    ✓ {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preços */}
            <div style={{
              background: `linear-gradient(135deg, ${atividade.color}15 0%, ${atividade.color}05 100%)`,
              border: `2px solid ${atividade.color}`,
              borderRadius: '16px',
              padding: isMobile ? '25px' : '35px',
            }}>
              <h3 style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: atividade.color,
                marginBottom: '20px',
              }}>💰 Valores</h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}>
                {atividade.pricing.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '15px',
                    background: `${atividade.color}10`,
                    border: `1px solid ${atividade.color}40`,
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.1rem',
                      color: '#fff',
                      fontWeight: 700,
                      marginBottom: '5px',
                    }}>{item.type}</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.5rem',
                      color: atividade.color,
                      fontWeight: 700,
                      marginBottom: '5px',
                    }}>{item.price}</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}>{item.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regras */}
          <div style={{
            background: `linear-gradient(135deg, ${atividade.color}15 0%, ${atividade.color}05 100%)`,
            border: `2px solid ${atividade.color}`,
            borderRadius: '16px',
            padding: isMobile ? '25px' : '35px',
            marginBottom: '40px',
          }}>
            <h3 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: atividade.color,
              marginBottom: '20px',
            }}>📋 Regras e Informações</h3>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {atividade.rules.map((rule, idx) => (
                <li key={idx} style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px 15px',
                  background: `${atividade.color}10`,
                  border: `1px solid ${atividade.color}40`,
                  borderRadius: '8px',
                }}>
                  • {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Botão de Reserva */}
          <div style={{ textAlign: 'center' }}>
            <button style={{
              padding: isMobile ? '15px 40px' : '20px 60px',
              background: atividade.color,
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 'bold',
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              boxShadow: `0 10px 30px ${atividade.color}60`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
              e.currentTarget.style.boxShadow = `0 15px 40px ${atividade.color}80`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = `0 10px 30px ${atividade.color}60`;
            }}>
              Fazer Reserva
            </button>
          </div>
        </div>
      </section>

      <CommunityFab />
    </div>
  );
}
