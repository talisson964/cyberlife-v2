import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Estados para a funcionalidade de apostas
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount] = useState(10); // Aposta fixa de 10 CyberPoints
  const [userPoints, setUserPoints] = useState(100); // Isso viria do perfil do usuário
  const [bets, setBets] = useState([]); // Armazena as apostas do usuário
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'success', 'error', 'info'
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

    // Fechar o popup automaticamente após 5 segundos
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
        } else {
          formattedDate = 'Data ainda não determinada';
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
            setUserPoints(100); // Valor padrão
          } else {
            setUserPoints(profile.cyber_points || 0);
          }
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        setUserPoints(100); // Valor padrão
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

  // Estado para armazenar os participantes do evento
  const [eventParticipants, setEventParticipants] = useState([]);

  // Carregar participantes do evento
  useEffect(() => {
    const loadEventParticipants = async () => {
      if (evento && evento.id) {
        try {
          // Buscar inscrições confirmadas para este evento
          const { data: registrations, error } = await supabase
            .from('event_registrations')
            .select('user_id, user_nickname')
            .eq('event_id', evento.id)
            .eq('status', 'confirmed');

          if (error) {
            console.error('Erro ao carregar participantes:', error);
            // Se não houver registros no banco, usar dados do evento como fallback
            if (evento.participants) {
              setEventParticipants(evento.participants.map((p, idx) => ({ id: idx + 1, name: p, odds: (Math.random() * 3 + 1.5).toFixed(2) })));
            } else {
              setEventParticipants([]);
            }
            return;
          }

          // Transformar os dados para o formato esperado
          const participants = registrations.map((reg, idx) => ({
            id: reg.user_id,
            name: reg.user_nickname,
            odds: (Math.random() * 3 + 1.5).toFixed(2) // Odds aleatórias como exemplo
          }));

          setEventParticipants(participants);
        } catch (error) {
          console.error('Erro ao conectar com banco para participantes:', error);
          setEventParticipants([]);
        }
      }
    };

    loadEventParticipants();
  }, [evento]);

  // Calcular potencial ganho baseado na regra: 75% do total apostado dividido pelos acertadores
  const potentialWin = 0; // O valor real será calculado após o evento terminar

  // Função para fazer a aposta
  const placeBet = async () => {
    if (!selectedBet || userPoints < 10) {
      showCustomPopup('Por favor, selecione um jogador e tenha pelo menos 10 CyberPoints para apostar.', 'error', true);
      return;
    }

    try {
      // Verificar se o usuário tem pontos suficientes
      if (userPoints < 10) {
        showCustomPopup(`Você não tem CyberPoints suficientes para esta aposta (mínimo 10).\nSeu saldo: ${userPoints} CyberPoints`, 'error', true);
        return;
      }

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showCustomPopup('Você precisa estar logado para fazer uma aposta.', 'error');
        return;
      }

      // Criar a aposta no banco de dados
      const betData = {
        user_id: user.id,
        event_id: evento.id,
        selected_option: selectedBet,
        amount: 10, // Aposta fixa de 10 CyberPoints
        created_at: new Date().toISOString()
      };

      const { error: betError } = await supabase
        .from('event_bets')
        .insert([betData]);

      if (betError) {
        console.error('Erro ao salvar aposta:', betError);
        showCustomPopup('Erro ao registrar sua aposta. Tente novamente.', 'error');
        return;
      }

      // Atualizar pontos do usuário (subtrair valor da aposta)
      const newPoints = userPoints - 10;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cyber_points: newPoints })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar pontos:', updateError);
        showCustomPopup('Erro ao atualizar seus pontos. Tente novamente.', 'error');
        return;
      }

      // Atualizar estado local
      setUserPoints(newPoints);
      setBets([...bets, betData]);
      setSelectedBet(null);

      showCustomPopup('Aposta registrada com sucesso! Boa sorte!', 'success');
    } catch (error) {
      console.error('Erro ao fazer aposta:', error);
      showCustomPopup('Erro ao fazer sua aposta. Tente novamente.', 'error');
    }
  };

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

      // Confirmar com o usuário o custo da inscrição usando confirmação personalizada
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
        (confirmed) => {
          if (confirmed) {
            performRegistration();
          }
        }
      );
    } else {
      // Confirmar inscrição gratuita com confirmação personalizada
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
        (confirmed) => {
          if (confirmed) {
            performRegistration();
          }
        }
      );
    }
  };

  // Função auxiliar para realizar a inscrição
  const performRegistration = async () => {
    setRegistrationLoading(true);

    try {
      // Chamar a função RPC no banco de dados para inscrever o usuário
      const { data, error } = await supabase
        .rpc('register_for_event_with_cyberpoints', { p_event_id: evento.id });

      if (error) {
        console.error('Erro na inscrição:', error);
        showCustomPopup(`Erro ao se inscrever no evento: ${error.message}`, 'error');
        return;
      }

      if (data && data.success) {
        // Atualizar o saldo de pontos localmente
        if (inscriptionCost > 0) {
          setUserPoints(prev => prev - inscriptionCost);
        }

        showCustomPopup(data.message, 'success');
      } else if (data && !data.success) {
        if (data.already_registered) {
          showCustomPopup(data.message, 'info');
        } else {
          showCustomPopup(`Erro na inscrição: ${data.message}`, 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao se inscrever no evento:', error);
      showCustomPopup(`Erro inesperado ao se inscrever no evento: ${error.message}`, 'error');
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

        /* Estilos específicos para dispositivos móveis */
        @media (max-width: 768px) {
          .evento-rules-list,
          .evento-schedule-list {
            max-height: 200px;
            overflow-y: auto;
          }

          .evento-card-content {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
        }
      `}</style>
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
        padding: isMobile ? '30px 15px' : '60px 48px',
        background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
        minHeight: 'calc(100vh - 68px)',
        overflowX: 'hidden', /* Evitar rolagem horizontal desnecessária */
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

          {/* Container isolado para o Grid de Informações */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '20px' : '30px',
            marginBottom: isMobile ? '40px' : '50px',
            width: '100%', /* Garantir largura total */
            clear: 'both', /* Limpar flutuação de elementos anteriores */
            position: 'relative', /* Garantir contexto de posicionamento */
            zIndex: 1, /* REDUZIR O Z-INDEX PARA GARANTIR QUE ESTE CONTAINER FIQUE ATRÁS DOS CARDS SEGUINTES */
            overflow: 'visible', /* Garantir que nada fique escondido */
            isolation: 'isolate', /* Isolar completamente este container */
          }}>
            {/* Card de Info Principal */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
              border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '35px',
              overflow: 'hidden', /* Evitar que elementos saiam do card */
              position: 'relative', /* Garantir posicionamento correto */
              clear: 'both', /* Garantir que este card não interfira com os seguintes */
              isolation: 'isolate', /* Isolar completamente este card */
              transform: 'translateZ(0)', /* Forçar aceleração de hardware para evitar sobreposição */
              willChange: 'transform', /* Otimizar para mudanças */
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
                    color: evento.time ? '#00d9ff' : '#666',
                    fontWeight: 600,
                  }}>
                    {evento.time ? evento.time : 'Horário ainda não determinado'}
                  </div>
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

                {evento.inscription_price_cyberpoints && (
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

                {!evento.inscription_price && !evento.inscription_price_cyberpoints && (
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

              {/* Botão de Inscrição - AGORA COM FUNCIONALIDADE */}
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
              padding: isMobile ? '20px' : '35px',
              overflow: 'hidden', /* Evitar que elementos saiam do card */
              position: 'relative', /* Garantir posicionamento correto */
              clear: 'both', /* Garantir que este card não interfira com os seguintes */
              isolation: 'isolate', /* Isolar completamente este card */
              transform: 'translateZ(0)', /* Forçar aceleração de hardware para evitar sobreposição */
              willChange: 'transform', /* Otimizar para mudanças */
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
                  position: 'relative', /* Garantir contexto de posicionamento */
                  zIndex: 1, /* Garantir que a imagem fique na camada correta */
                }}>
                  <img
                    src={evento.image_url}
                    alt={evento.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      position: 'relative', /* Garantir que a imagem também tenha posicionamento relativo */
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Divisor isolado para evitar sobreposição em mobile */}
          <div style={{
            height: '0px', /* Altura zero para não ocupar espaço visível */
            clear: 'both',
            display: 'block',
            width: '100%',
            border: 'none', /* Remover borda visível */
            padding: isMobile ? '30px 0' : '40px 0', /* AUMENTAR ESPAÇAMENTO */
            visibility: 'hidden', /* Torna o elemento invisível mas mantém o espaço */
            minHeight: '30px', /* FORÇAR ALTURA MÍNIMA */
            content: '', /* Garantir que o elemento exista */
            overflow: 'hidden', /* Garantir que nada transborde */
            isolation: 'isolate', /* Isolar completamente este elemento */
            position: 'relative', /* Garantir contexto de posicionamento */
            zIndex: 20, /* AUMENTAR AINDA MAIS O Z-INDEX PARA GARANTIR SEPARAÇÃO TOTAL */
          }} />

          {/* WRAPPER ISOLADO PARA O CARD DE CRONOGRAMA */}
          <div style={{
            position: 'relative',
            width: '100%',
            zIndex: 25,
            isolation: 'isolate',
            contain: 'layout style paint',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}>
          {/* Card de Cronograma - Separado após o card "Sobre o Evento" */}
          {evento.schedule && evento.schedule.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
              border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '35px',
              marginTop: isMobile ? '40px' : '30px', /* Aumentar margem em mobile para mais espaçamento */
              overflow: 'hidden', /* Evitar que elementos saiam do card */
              position: 'relative', /* Garantir posicionamento correto */
              minHeight: isMobile ? '150px' : 'auto', /* Altura mínima para evitar sobreposição */
              maxHeight: isMobile ? '250px' : 'none', /* Reduzir altura máxima em mobile para evitar sobreposição */
              display: 'block', /* Forçar display block para melhor controle de layout */
              clear: 'both', /* Forçar quebra de linha para evitar sobreposição */
              float: 'none', /* Garantir que não flutue */
              width: '100%', /* Forçar largura total */
              boxSizing: 'border-box', /* Incluir padding na largura total */
              flex: '0 0 auto', /* Garantir que o card não encolha nem cresça */
              alignSelf: 'stretch', /* Garantir que o card ocupe a largura total */
              isolation: 'isolate', /* Isolar completamente este card */
              contain: 'layout style paint', /* Contenção total para evitar interferência */
              transform: 'translateZ(0)', /* Forçar aceleração de hardware para evitar sobreposição */
              willChange: 'transform', /* Otimizar para mudanças */
              zIndex: 25, /* FORÇAR ESTE CARD A FICAR ACIMA DO CARD ANTERIOR */
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
                overflowY: 'auto', /* Adiciona rolagem vertical se necessário */
                flex: 1, /* Permite que a lista ocupe o espaço disponível */
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
                    wordWrap: 'break-word', /* Quebra palavras longas */
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3, /* Limita a 3 linhas */
                    WebkitBoxOrient: 'vertical',
                  }}>
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div> {/* Fechamento do wrapper isolado do cronograma */}

          {/* WRAPPER ISOLADO PARA O CARD DE REGRAS */}
          <div style={{
            position: 'relative',
            width: '100%',
            zIndex: 30,
            isolation: 'isolate',
            contain: 'layout style paint',
            transform: 'translateZ(0)',
            willChange: 'transform',
            marginTop: isMobile ? '80px' : '60px', /* AUMENTAR AINDA MAIS O ESPAÇAMENTO EM MOBILE */
          }}>
          {/* Card de Regras - MOVIDO PARA O FINAL, após todos os outros cards */}
          {evento.rules && evento.rules.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 234, 0.05) 100%)',
              border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '35px',
              marginTop: isMobile ? '80px' : '40px', /* AUMENTAR AINDA MAIS A MARGEM EM MOBILE PARA MAIS ESPAÇAMENTO */
              overflow: 'hidden', /* Evitar que elementos saiam do card */
              position: 'relative', /* Garantir posicionamento correto */
              minHeight: isMobile ? '150px' : 'auto', /* Altura mínima para evitar sobreposição */
              maxHeight: isMobile ? '250px' : 'none', /* Reduzir altura máxima em mobile para evitar sobreposição */
              display: 'block', /* Forçar display block para melhor controle de layout */
              clear: 'both', /* Forçar quebra de linha para evitar sobreposição */
              float: 'none', /* Garantir que não flutue */
              width: '100%', /* Forçar largura total */
              boxSizing: 'border-box', /* Incluir padding na largura total */
              flex: '0 0 auto', /* Garantir que o card não encolha nem cresça */
              alignSelf: 'stretch', /* Garantir que o card ocupe a largura total */
              isolation: 'isolate', /* Isolar completamente este card */
              contain: 'layout style paint', /* Contenção total para evitar interferência */
              transform: 'translateZ(0)', /* Forçar aceleração de hardware para evitar sobreposição */
              willChange: 'transform', /* Otimizar para mudanças */
              zIndex: 30, /* FORÇAR ESTE CARD A FICAR ACIMA DE TODOS OS OUTROS CARDS */
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
                overflowY: 'auto', /* Adiciona rolagem vertical se necessário */
                flex: 1, /* Permite que a lista ocupe o espaço disponível */
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
                    wordWrap: 'break-word', /* Quebra palavras longas */
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3, /* Limita a 3 linhas */
                    WebkitBoxOrient: 'vertical',
                  }}>
                    • {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div> {/* Fechamento do wrapper isolado das regras */}

          {/* Seção de Apostas em Jogadores Vencedores */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(0, 217, 255, 0.15) 100%)',
            border: '2px solid rgba(138, 43, 226, 0.4)',
            borderRadius: '20px',
            padding: isMobile ? '25px 15px' : '40px',
            margin: isMobile ? '40px auto' : '50px auto',
            maxWidth: '1000px',
            boxShadow: '0 0 30px rgba(138, 43, 226, 0.3)',
            overflow: 'hidden', /* Evitar overflow */
          }}>
            <h2 style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              fontWeight: 700,
              color: '#00d9ff',
              textAlign: 'center',
              marginBottom: '30px',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
            }}>🎯 Aposte no Vencedor!</h2>

            <p style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              marginBottom: '30px',
              lineHeight: '1.6',
            }}>
              Faça sua aposta em qual jogador ou equipe você acha que vai vencer este evento!
              Ganhe CyberPoints extras se seu palpite estiver correto!
            </p>

            {/* Opções de Aposta */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '15px' : '20px',
              marginBottom: '30px',
              overflowX: 'auto', /* Permitir rolagem horizontal se necessário em dispositivos pequenos */
              padding: isMobile ? '5px 0' : '0', /* Pequeno padding para rolagem */
            }}>
              {eventParticipants.length > 0 ? (
                eventParticipants.map((option) => (
                  <div
                    key={option.id}
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '2px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: isMobile ? '320px' : '300px', /* Altura mínima para evitar problemas de layout */
                    }}
                    onClick={() => setSelectedBet(option.id)}
                  >
                    {/* Efeito de seleção */}
                    {selectedBet === option.id && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: '3px solid #00d9ff',
                        borderRadius: '12px',
                        pointerEvents: 'none',
                        boxShadow: '0 0 20px rgba(0, 217, 255, 0.8)',
                      }} />
                    )}

                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
                      margin: '0 auto 15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      overflow: 'hidden',
                    }}>
                      <img
                        src="/default-avatar.png"
                        alt={option.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => e.target.src='/default-avatar.png'}
                      />
                    </div>

                    <h3 style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '10px',
                    }}>{option.name}</h3>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '15px',
                    }}>
                      <span style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '0.9rem',
                        color: '#aaa',
                      }}>Odd:</span>
                      <span style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#00d9ff',
                        textShadow: '0 0 10px rgba(0, 217, 255, 0.6)',
                      }}>{option.odds}</span>
                    </div>

                    <button style={{
                      background: selectedBet === option.id
                        ? 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)'
                        : 'rgba(0, 217, 255, 0.1)',
                      border: '2px solid #00d9ff',
                      color: selectedBet === option.id ? '#000' : '#00d9ff',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}>
                      {selectedBet === option.id ? 'Selecionado' : 'Apostar'}
                    </button>
                  </div>
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '40px',
                  color: '#aaa',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1.2rem',
                }}>
                  Nenhum participante confirmado para este evento ainda.
                </div>
              )}
            </div>

            {/* Formulário de Aposta */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '12px',
              padding: isMobile ? '15px' : '25px',
              marginTop: '20px',
              overflow: 'hidden', /* Evitar overflow */
            }}>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                gap: '20px',
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1rem',
                    color: '#00d9ff',
                    marginBottom: '10px',
                  }}>Quantidade de CyberPoints para apostar:</label>
                  <div style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                    10 CyberPoints
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#aaa',
                    marginTop: '5px',
                  }}>Aposta fixa de 10 CyberPoints | Seu saldo: {userPoints} CyberPoints</div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1rem',
                    color: '#00d9ff',
                    marginBottom: '10px',
                  }}>Como Funciona:</label>
                  <div style={{
                    background: 'rgba(0, 217, 255, 0.1)',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.9rem',
                    color: '#00d9ff',
                    lineHeight: '1.5',
                  }}>
                    <p style={{ margin: '0 0 8px 0' }}>• Você aposta 10 CyberPoints no jogador</p>
                    <p style={{ margin: '0 0 8px 0' }}>• Se ele vencer, 75% do total apostado por todos os apostadores de todos os jogadores será dividido entre os acertadores</p>
                    <p style={{ margin: '0 0 0 0' }}>• O valor exato só é conhecido após o evento</p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  height: '100%'
                }}>
                  <button
                    disabled={!selectedBet || userPoints < 10}
                    onClick={placeBet}
                    style={{
                      background: !selectedBet || userPoints < 10
                        ? 'rgba(255, 0, 234, 0.2)'
                        : 'linear-gradient(135deg, #ff00ea 0%, #cc00ba 100%)',
                      border: '2px solid #ff00ea',
                      color: !selectedBet || userPoints < 10
                        ? '#666'
                        : '#fff',
                      padding: '12px 25px',
                      borderRadius: '8px',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: !selectedBet || userPoints < 10
                        ? 'not-allowed'
                        : 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Confirmar Aposta (10 CyberPoints)
                  </button>
                </div>
              </div>
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