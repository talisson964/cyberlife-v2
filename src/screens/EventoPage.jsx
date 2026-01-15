import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommunityFab from '../components/CommunityFab';
import { supabase } from '../supabaseClient';

const eventosData = {
  'league-of-legends': {
    title: 'Campeonato League of Legends',
    date: '20 de Janeiro, 2025',
    prize: 'R$ 15.000',
    inscription: 'Inscrições abertas até 15/01',
    description: 'O maior campeonato de League of Legends da região! Participe e mostre suas habilidades no Summoner\'s Rift. Equipes de 5 jogadores competirão pelo prêmio e pelo título de campeão.',
    rules: [
      'Equipes de 5 jogadores',
      'Formato de eliminatórias duplas',
      'Patch mais recente do jogo',
      'Idade mínima: 16 anos',
      'Inscrição online obrigatória'
    ],
    schedule: [
      'Fase de Grupos: 20/01 - 10:00',
      'Quartas de Final: 20/01 - 14:00',
      'Semifinais: 20/01 - 17:00',
      'Grande Final: 20/01 - 20:00'
    ]
  },
  'csgo-masters': {
    title: 'Torneio CS:GO Masters',
    date: '05 de Fevereiro, 2025',
    prize: 'R$ 20.000',
    inscription: 'Inscrições abertas até 25/01',
    description: 'O torneio definitivo de Counter-Strike: Global Offensive. Equipes profissionais e semi-profissionais competem pelo maior prêmio do ano.',
    rules: [
      'Equipes de 5 jogadores + 1 reserva',
      'Formato de campeonato suíço',
      'Mapas competitivos oficiais',
      'Idade mínima: 18 anos',
      'Registro de equipe obrigatório'
    ],
    schedule: [
      'Fase Classificatória: 05/02 - 09:00',
      'Playoffs: 05/02 - 14:00',
      'Semifinais: 05/02 - 18:00',
      'Grande Final: 05/02 - 21:00'
    ]
  },
  'valorant-championship': {
    title: 'Valorant Championship',
    date: '15 de Fevereiro, 2025',
    prize: 'R$ 12.000',
    inscription: 'Inscrições abertas até 05/02',
    description: 'Campeonato oficial de Valorant com as melhores equipes da região. Mostre suas habilidades táticas e conquiste o título.',
    rules: [
      'Equipes de 5 jogadores',
      'Formato de bracket duplo',
      'Patch oficial mais recente',
      'Idade mínima: 16 anos',
      'Conta Riot Games verificada'
    ],
    schedule: [
      'Rodada de Abertura: 15/02 - 10:00',
      'Upper Bracket: 15/02 - 13:00',
      'Lower Bracket: 15/02 - 16:00',
      'Grande Final: 15/02 - 19:00'
    ]
  },
  'free-fire-battle': {
    title: 'Free Fire Battle Royale',
    date: '28 de Fevereiro, 2025',
    prize: 'R$ 8.000',
    inscription: 'Inscrições abertas até 20/02',
    description: 'O maior torneio de Free Fire Battle Royale! Equipes de 4 jogadores lutam pela sobrevivência e pela vitória.',
    rules: [
      'Equipes de 4 jogadores',
      'Sistema de pontos por partida',
      'Versão oficial do jogo',
      'Idade mínima: 14 anos',
      'UID válido obrigatório'
    ],
    schedule: [
      'Partidas Classificatórias: 28/02 - 10:00',
      'Rodada Intermediária: 28/02 - 14:00',
      'Finais: 28/02 - 17:00',
      'Match Final: 28/02 - 19:00'
    ]
  },
  'fortnite-arena': {
    title: 'Fortnite Arena Cup',
    date: '10 de Março, 2025',
    prize: 'R$ 10.000',
    inscription: 'Inscrições abertas até 01/03',
    description: 'Fortnite Arena Cup reúne os melhores construtores e atiradores. Competição individual e por equipes.',
    rules: [
      'Modo Solo e Duo',
      'Sistema de Arena Points',
      'Construção permitida',
      'Idade mínima: 13 anos',
      'Conta Epic Games ativa'
    ],
    schedule: [
      'Qualificatórias Solo: 10/03 - 10:00',
      'Qualificatórias Duo: 10/03 - 13:00',
      'Finais Solo: 10/03 - 16:00',
      'Finais Duo: 10/03 - 19:00'
    ]
  },
  'rocket-league': {
    title: 'Rocket League Tournament',
    date: '22 de Março, 2025',
    prize: 'R$ 7.500',
    inscription: 'Inscrições abertas até 15/03',
    description: 'Futebol com carros! O torneio mais emocionante de Rocket League. Equipes de 3 jogadores competem em partidas intensas.',
    rules: [
      'Equipes de 3 jogadores',
      'Formato 3v3',
      'Regras competitivas oficiais',
      'Idade mínima: 16 anos',
      'Plataforma cruzada permitida'
    ],
    schedule: [
      'Fase de Grupos: 22/03 - 11:00',
      'Oitavas de Final: 22/03 - 14:00',
      'Semifinais: 22/03 - 17:00',
      'Grande Final: 22/03 - 20:00'
    ]
  }
};

export default function EventoPage() {
  const { eventoId } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  // Carregar evento do banco de dados
  useEffect(() => {
    const loadEvento = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', eventoId)
          .single();

        if (error) {
          console.error('Erro ao carregar evento:', error);
          setEvento(null);
          return;
        }

        // Formatar a data se necessário
        let formattedDate = data.date;
        if (data.date) {
          const dateObj = new Date(data.date);
          formattedDate = dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        }

        setEvento({
          ...data,
          date: formattedDate,
          inscription: data.inscription_info || 'Informações em breve'
        });
      } catch (error) {
        console.error('Erro ao conectar com banco:', error);
        setEvento(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvento();
  }, [eventoId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="evento-page" style={{ minHeight: '100vh', background: '#000', color: '#fff', margin: 0, padding: 0 }}>
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
            <>
              <style>{`
                @keyframes pulse-live {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                }
                @keyframes blink-dot {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}</style>
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
            </>
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

                {evento.inscription && (
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.9rem',
                      color: '#aaa',
                      marginBottom: '5px',
                    }}>✍️ Inscrição</div>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.1rem',
                      color: '#fff',
                      fontWeight: 600,
                    }}>{evento.inscription}</div>
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
              <button style={{
                width: '100%',
                marginTop: '30px',
                padding: '15px',
                background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 217, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                Inscrever-se Agora
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

          {/* Grid de Regras e Cronograma */}
          {((evento.rules && evento.rules.length > 0) || (evento.schedule && evento.schedule.length > 0)) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '30px',
              marginTop: '30px',
            }}>
              {/* Regras */}
              {evento.rules && evento.rules.length > 0 && (
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
                    color: '#00d9ff',
                    marginBottom: '20px',
                  }}>📋 Regras</h3>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    {evento.rules.map((rule, idx) => (
                      <li key={idx} style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: '10px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                      }}>
                        • {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cronograma */}
              {evento.schedule && evento.schedule.length > 0 && (
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
                    color: '#00d9ff',
                    marginBottom: '20px',
                  }}>⏰ Cronograma</h3>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    {evento.schedule.map((item, idx) => (
                      <li key={idx} style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: '10px 15px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                      }}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <CommunityFab />
    </div>
  );
}
