import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CommunityFab from '../components/CommunityFab';

export default function JogoPage() {
  const { jogoId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const jogosData = {
    'a-plague-tale': {
      titulo: 'A Plague Tale',
      subtitulo: 'Inocência em meio ao caos',
      descricao: 'Embarque em uma jornada emocionante através da França medieval devastada pela peste negra. Acompanhe Amicia e seu irmão Hugo em sua luta pela sobrevivência contra hordas de ratos e a Inquisição.',
      desenvolvedor: 'Asobo Studio',
      publisher: 'Focus Entertainment',
      lancamento: '14 de maio de 2019',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'PC'],
      generos: ['Ação', 'Aventura', 'Stealth'],
      caracteristicas: [
        '🎮 Narrativa cinematográfica emocionante',
        '🐀 Mecânicas únicas com enxames de ratos',
        '👥 Sistema de combate stealth e furtividade',
        '🎨 Gráficos deslumbrantes e atmosféricos',
        '🎵 Trilha sonora premiada',
        '🏆 Vários prêmios e indicações',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 7/8/10 (64-bit)',
          processador: 'Intel Core i3-2120 (3.3 GHz) / AMD FX-4100 X4 (3.6 GHz)',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 660 / AMD Radeon HD 7870',
          armazenamento: '50 GB',
        },
        recomendados: {
          so: 'Windows 7/8/10 (64-bit)',
          processador: 'Intel Core i5-4690 (3.5 GHz) / AMD FX-8300 (3.3 GHz)',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GeForce GTX 970 / AMD Radeon RX 480',
          armazenamento: '50 GB SSD',
        },
      },
    },
    'beyond-two-souls': {
      titulo: 'Beyond: Two Souls',
      subtitulo: 'Duas almas, um destino',
      descricao: 'Uma experiência cinematográfica única que explora a conexão entre Jodie Holmes e uma entidade sobrenatural chamada Aiden. Viva 15 anos da vida de Jodie nesta aventura interativa emocionante.',
      desenvolvedor: 'Quantic Dream',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '8 de outubro de 2013',
      plataformas: ['PlayStation 3', 'PlayStation 4', 'PC'],
      generos: ['Aventura', 'Drama Interativo'],
      caracteristicas: [
        '🎬 Narrativa cinematográfica com atores de Hollywood',
        '👻 Controle duas personagens simultaneamente',
        '🔀 Múltiplas escolhas que afetam a história',
        '🎭 Performance captura de Ellen Page e Willem Dafoe',
        '🌍 Jornada através de vários locais ao redor do mundo',
        '🎮 Modo cooperativo local',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 7/8/10 (64-bit)',
          processador: 'Intel Core i5-2300 / AMD FX-6350',
          memoria: '4 GB RAM',
          placa: 'NVIDIA GeForce GTX 660 / AMD Radeon HD 7870',
          armazenamento: '33 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-4430 / AMD FX-8350',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 970 / AMD Radeon R9 290',
          armazenamento: '33 GB SSD',
        },
      },
    },
    'concrete-genie': {
      titulo: 'Concrete Genie',
      subtitulo: 'A arte que ganha vida',
      descricao: 'Use o poder da arte para transformar uma cidade cinzenta em um lugar cheio de vida e cor. Ajude Ash a salvar sua cidade natal de Denska pintando criaturas mágicas que ganham vida.',
      desenvolvedor: 'PixelOpus',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '8 de outubro de 2019',
      plataformas: ['PlayStation 4', 'PlayStation 5'],
      generos: ['Aventura', 'Arte', 'Puzzle'],
      caracteristicas: [
        '🎨 Sistema de pintura criativo e intuitivo',
        '✨ Criaturas mágicas que ganham vida',
        '🌆 Transforme a cidade com sua arte',
        '🎮 Suporte para PlayStation VR',
        '💡 Mecânicas de puzzle ambientais',
        '❤️ História tocante sobre bullying e superação',
      ],
      requisitos: {
        minimos: {
          so: 'PlayStation 4 System Software',
          processador: 'AMD Jaguar 8-core',
          memoria: '8 GB GDDR5',
          placa: 'AMD Radeon based graphics',
          armazenamento: '7 GB',
        },
        recomendados: {
          so: 'PlayStation 5 System Software',
          processador: 'AMD Zen 2 8-core',
          memoria: '16 GB GDDR6',
          placa: 'AMD RDNA 2',
          armazenamento: '7 GB SSD',
        },
      },
    },
    'fortnite': {
      titulo: 'Fortnite',
      subtitulo: 'O Battle Royale definitivo',
      descricao: 'O battle royale mais popular do mundo. Lute, construa e seja o último jogador em pé em partidas épicas com até 100 jogadores. Explore eventos ao vivo, colaborações e atualizações constantes.',
      desenvolvedor: 'Epic Games',
      publisher: 'Epic Games',
      lancamento: '26 de setembro de 2017',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'Nintendo Switch', 'PC', 'Mobile'],
      generos: ['Battle Royale', 'Ação', 'Construção'],
      caracteristicas: [
        '🏗️ Sistema único de construção',
        '👥 Partidas com até 100 jogadores',
        '🎉 Eventos ao vivo espetaculares',
        '🤝 Colaborações com marcas e artistas',
        '🆓 Free-to-play com atualizações constantes',
        '🎮 Crossplay entre todas as plataformas',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 7/8/10 (64-bit)',
          processador: 'Intel Core i3-3225',
          memoria: '8 GB RAM',
          placa: 'Intel HD 4000',
          armazenamento: '26 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-7300U',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GeForce GTX 960 / AMD Radeon R9 280',
          armazenamento: '26 GB SSD',
        },
      },
    },
    'hollow-knight': {
      titulo: 'Hollow Knight',
      subtitulo: 'Descenda ao reino esquecido',
      descricao: 'Explore um reino vasto e em ruínas repleto de insetos e heróis neste desafiador jogo de ação e aventura em 2D. Descubra os segredos de Hallownest em uma jornada épica.',
      desenvolvedor: 'Team Cherry',
      publisher: 'Team Cherry',
      lancamento: '24 de fevereiro de 2017',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Nintendo Switch', 'PC'],
      generos: ['Metroidvania', 'Ação', 'Aventura'],
      caracteristicas: [
        '🗺️ Mundo vasto e interconectado para explorar',
        '⚔️ Combate desafiador e preciso',
        '🎨 Arte desenhada à mão deslumbrante',
        '🎵 Trilha sonora atmosférica memorável',
        '🏆 Mais de 130 inimigos e 30 chefes épicos',
        '💎 Dezenas de horas de conteúdo',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 7',
          processador: 'Intel Core 2 Duo E5200',
          memoria: '4 GB RAM',
          placa: 'GeForce 9800GTX+ (1GB)',
          armazenamento: '9 GB',
        },
        recomendados: {
          so: 'Windows 10',
          processador: 'Intel Core i5',
          memoria: '8 GB RAM',
          placa: 'GeForce GTX 560',
          armazenamento: '9 GB SSD',
        },
      },
    },
    'cyberpunk-series': {
      titulo: 'Cyberpunk Series',
      subtitulo: 'Bem-vindo a Night City',
      descricao: 'Mergulhe em um mundo futurista de alta tecnologia e baixa vida, onde cada escolha molda seu destino em Night City. Viva a vida de V, um mercenário em busca de um implante único.',
      desenvolvedor: 'CD Projekt Red',
      publisher: 'CD Projekt',
      lancamento: '10 de dezembro de 2020',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'PC'],
      generos: ['RPG', 'Ação', 'Mundo Aberto'],
      caracteristicas: [
        '🌃 Cidade massiva e imersiva de Night City',
        '🔫 Sistema de combate dinâmico e fluido',
        '🧬 Customização profunda de personagem',
        '📖 Narrativa ramificada com múltiplos finais',
        '🎭 Personagens memoráveis e complexos',
        '🚗 Veículos futurísticos para explorar',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-6700 / AMD Ryzen 5 1600',
          memoria: '12 GB RAM',
          placa: 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580',
          armazenamento: '70 GB SSD',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-12700 / AMD Ryzen 7 7800X3D',
          memoria: '20 GB RAM',
          placa: 'NVIDIA GeForce RTX 2060 / AMD Radeon RX 5700 XT',
          armazenamento: '70 GB SSD',
        },
      },
    },
    'the-last-of-us': {
      titulo: 'The Last of Us',
      subtitulo: 'Sobreviva juntos',
      descricao: 'Uma história comovente de sobrevivência em um mundo pós-apocalíptico infestado por infectados e a busca pela humanidade. Acompanhe Joel e Ellie em uma jornada inesquecível.',
      desenvolvedor: 'Naughty Dog',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '14 de junho de 2013',
      plataformas: ['PlayStation 3', 'PlayStation 4', 'PlayStation 5', 'PC'],
      generos: ['Ação', 'Aventura', 'Survival Horror'],
      caracteristicas: [
        '📖 Narrativa premiada e emocionante',
        '👥 Relacionamento profundo entre personagens',
        '🧟 Combate tenso contra infectados e humanos',
        '🎮 Stealth e ação balanceados',
        '🎵 Trilha sonora ganhadora do Grammy',
        '🏆 Mais de 200 prêmios de Game of the Year',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'AMD Ryzen 5 1500X / Intel Core i7-4770K',
          memoria: '16 GB RAM',
          placa: 'AMD Radeon RX 470 / NVIDIA GeForce GTX 960',
          armazenamento: '100 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'AMD Ryzen 5 3600X / Intel Core i7-8700',
          memoria: '16 GB RAM',
          placa: 'AMD Radeon RX 5700 XT / NVIDIA GeForce RTX 2070 Super',
          armazenamento: '100 GB SSD',
        },
      },
    },
    'god-of-war': {
      titulo: 'God of War',
      subtitulo: 'Uma nova jornada',
      descricao: 'Acompanhe Kratos e seu filho Atreus em uma jornada épica pela mitologia nórdica cheia de batalhas intensas e momentos emocionantes. Explore os nove reinos e enfrente deuses e monstros.',
      desenvolvedor: 'Santa Monica Studio',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '20 de abril de 2018',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'PC'],
      generos: ['Ação', 'Aventura', 'Hack and Slash'],
      caracteristicas: [
        '⚔️ Combate brutal e satisfatório',
        '👨‍👦 Relação pai e filho emocionante',
        '🌍 Explore os nove reinos nórdicos',
        '📖 Narrativa madura e envolvente',
        '🎨 Gráficos impressionantes',
        '🏆 Vencedor de centenas de prêmios',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel i5-2500k / AMD Ryzen 3 1200',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GTX 960 / AMD R9 290X',
          armazenamento: '70 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel i5-6600k / AMD Ryzen 5 2400G',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GTX 1060 / AMD RX 570',
          armazenamento: '70 GB SSD',
        },
      },
    },
    'red-dead-redemption-2': {
      titulo: 'Red Dead Redemption 2',
      subtitulo: 'Viva a vida de um fora da lei',
      descricao: 'Viva a vida de um fora da lei no Velho Oeste americano em uma das narrativas mais envolventes já criadas. Acompanhe Arthur Morgan e a gangue Van der Linde em sua luta pela sobrevivência.',
      desenvolvedor: 'Rockstar Studios',
      publisher: 'Rockstar Games',
      lancamento: '26 de outubro de 2018',
      plataformas: ['PlayStation 4', 'Xbox One', 'PC'],
      generos: ['Ação', 'Aventura', 'Mundo Aberto'],
      caracteristicas: [
        '🌄 Mundo aberto vasto e detalhado',
        '🐴 Sistema de cavalo realista',
        '🎯 Tiroteios cinematográficos',
        '📖 História épica e emocionante',
        '🎣 Atividades variadas (caça, pesca, poker)',
        '👥 Modo multiplayer Red Dead Online',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 7 SP1 (64-bit)',
          processador: 'Intel Core i5-2500K / AMD FX-6300',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 770 2GB / AMD Radeon R9 280',
          armazenamento: '150 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-4770K / AMD Ryzen 5 1500X',
          memoria: '12 GB RAM',
          placa: 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB',
          armazenamento: '150 GB SSD',
        },
      },
    },
    'spider-man': {
      titulo: 'Spider-Man',
      subtitulo: 'Seja mais que um homem',
      descricao: 'Balance-se pelos arranha-céus de Nova York como o amigável vizinho Spider-Man e proteja a cidade dos vilões. Viva a história de Peter Parker nesta aventura exclusiva.',
      desenvolvedor: 'Insomniac Games',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '7 de setembro de 2018',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'PC'],
      generos: ['Ação', 'Aventura', 'Mundo Aberto'],
      caracteristicas: [
        '🕸️ Mecânicas de balanço fluidas e divertidas',
        '🗽 Nova York aberta para exploração',
        '🎭 História original do universo Marvel',
        '👊 Combate dinâmico e acrobático',
        '🦹 Vários trajes com habilidades únicas',
        '🏆 Aclamado pela crítica e público',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i3-4160 / AMD Ryzen 3 1300X',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GTX 950 / AMD Radeon RX 470',
          armazenamento: '75 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-4670 / AMD Ryzen 5 1600',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GTX 1060 6GB / AMD Radeon RX 580',
          armazenamento: '75 GB SSD',
        },
      },
    },
    'ghost-of-tsushima': {
      titulo: 'Ghost of Tsushima',
      subtitulo: 'Honra morreu, o fantasma nasceu',
      descricao: 'Explore a bela ilha de Tsushima como um samurai em uma jornada para libertar sua terra da invasão mongol. Escolha entre seguir o código dos samurais ou abraçar as táticas do Fantasma.',
      desenvolvedor: 'Sucker Punch Productions',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '17 de julho de 2020',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'PC'],
      generos: ['Ação', 'Aventura', 'Mundo Aberto'],
      caracteristicas: [
        '⛩️ Ilha de Tsushima lindamente recriada',
        '⚔️ Combate de katana preciso e letal',
        '🍃 Sistema de guia pelo vento único',
        '🎌 Modo Kurosawa em preto e branco',
        '👘 Customização de equipamentos e habilidades',
        '🎮 Modo cooperativo Legends',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i3-7100 / AMD Ryzen 3 1200',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 960 / AMD Radeon RX 5500 XT',
          armazenamento: '75 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-8600 / AMD Ryzen 5 3600',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GeForce RTX 2060 / AMD Radeon RX 5600 XT',
          armazenamento: '75 GB SSD',
        },
      },
    },
    'horizon-zero-dawn': {
      titulo: 'Horizon Zero Dawn',
      subtitulo: 'A caçada começa',
      descricao: 'Descubra os mistérios de um mundo pós-apocalíptico dominado por máquinas em forma de dinossauros. Jogue como Aloy, uma caçadora habilidosa, e desvende os segredos do passado.',
      desenvolvedor: 'Guerrilla Games',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '28 de fevereiro de 2017',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'PC'],
      generos: ['Ação', 'RPG', 'Mundo Aberto'],
      caracteristicas: [
        '🦖 Enfrente máquinas gigantes únicas',
        '🏹 Sistema de combate estratégico',
        '🌍 Mundo pós-apocalíptico vasto',
        '📖 Mistério envolvente sobre o passado',
        '🎨 Gráficos impressionantes',
        '🎯 Caça e crafting de equipamentos',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-2500K / AMD FX 6300',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 780 / AMD Radeon R9 290',
          armazenamento: '100 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-4770K / AMD Ryzen 5 1500X',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GeForce GTX 1060 / AMD Radeon RX 580',
          armazenamento: '100 GB SSD',
        },
      },
    },
    'uncharted-4': {
      titulo: 'Uncharted 4',
      subtitulo: 'O fim de um ladrão',
      descricao: 'Junte-se a Nathan Drake em sua última aventura em busca do tesouro perdido do pirata Henry Avery. Explore locais exóticos e enfrente inimigos em uma jornada emocionante.',
      desenvolvedor: 'Naughty Dog',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '10 de maio de 2016',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'PC'],
      generos: ['Ação', 'Aventura', 'Terceira Pessoa'],
      caracteristicas: [
        '🗺️ Locais exóticos ao redor do mundo',
        '🧗 Parkour e escalada cinematográficos',
        '💥 Tiroteios e combate intensos',
        '📖 História emocionante e envolvente',
        '🎨 Gráficos de tirar o fôlego',
        '🎮 Modo multiplayer competitivo',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel i5-4330 / AMD Ryzen 3 1200',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GTX 960 / AMD R9 290X',
          armazenamento: '126 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel i7-4770 / AMD Ryzen 5 1500X',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GTX 1060 / AMD RX 570',
          armazenamento: '126 GB SSD',
        },
      },
    },
    'bloodborne': {
      titulo: 'Bloodborne',
      subtitulo: 'Encare a caçada',
      descricao: 'Enfrente os horrores de Yharnam neste desafiador action RPG gótico dos criadores de Dark Souls. Desvende os mistérios de uma cidade amaldiçoada enquanto luta por sua sobrevivência.',
      desenvolvedor: 'FromSoftware',
      publisher: 'Sony Interactive Entertainment',
      lancamento: '24 de março de 2015',
      plataformas: ['PlayStation 4', 'PlayStation 5'],
      generos: ['Action RPG', 'Souls-like', 'Horror'],
      caracteristicas: [
        '⚔️ Combate rápido e agressivo',
        '🌙 Atmosfera gótica vitoriana',
        '🐙 Criaturas lovecraftianas aterrorizantes',
        '🎯 Desafio brutal e recompensador',
        '🗺️ Mundo interconectado para explorar',
        '💀 Chefes épicos e memoráveis',
      ],
      requisitos: {
        minimos: {
          so: 'PlayStation 4 System Software',
          processador: 'AMD Jaguar 8-core',
          memoria: '8 GB GDDR5',
          placa: 'AMD Radeon based graphics',
          armazenamento: '33 GB',
        },
        recomendados: {
          so: 'PlayStation 5 System Software',
          processador: 'AMD Zen 2 8-core',
          memoria: '16 GB GDDR6',
          placa: 'AMD RDNA 2',
          armazenamento: '33 GB SSD',
        },
      },
    },
    'persona-5': {
      titulo: 'Persona 5',
      subtitulo: 'Desperte seu coração rebelde',
      descricao: 'Viva a vida dupla de um estudante do ensino médio e ladrão fantasma que muda os corações das pessoas corruptas. Forme laços, desperte Personas e salve Tóquio.',
      desenvolvedor: 'Atlus',
      publisher: 'Atlus / Sega',
      lancamento: '15 de setembro de 2016',
      plataformas: ['PlayStation 3', 'PlayStation 4', 'PlayStation 5', 'Nintendo Switch', 'PC'],
      generos: ['JRPG', 'Social Sim', 'Turn-Based'],
      caracteristicas: [
        '🎭 Sistema de Persona profundo',
        '📅 Simulação de vida estudantil',
        '👥 Relacionamentos e Social Links',
        '🎨 Estilo visual único e estiloso',
        '🎵 Trilha sonora jazz/rock memorável',
        '⚔️ Combate turn-based estratégico',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-4790 / AMD Ryzen 5 1500X',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 650 Ti / AMD Radeon R7 360',
          armazenamento: '41 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-4790 / AMD Ryzen 5 1500X',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 760 / AMD Radeon HD 7870',
          armazenamento: '41 GB SSD',
        },
      },
    },
    'final-fantasy-vii-remake': {
      titulo: 'Final Fantasy VII Remake',
      subtitulo: 'O retorno de um clássico',
      descricao: 'Reviva o clássico JRPG reimaginado com gráficos modernos e sistema de combate renovado. Acompanhe Cloud Strife e o grupo AVALANCHE em sua luta contra a Shinra.',
      desenvolvedor: 'Square Enix',
      publisher: 'Square Enix',
      lancamento: '10 de abril de 2020',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'PC'],
      generos: ['JRPG', 'Ação', 'RPG'],
      caracteristicas: [
        '⚔️ Combate em tempo real dinâmico',
        '📖 História expandida e aprofundada',
        '🎨 Gráficos impressionantes',
        '👥 Personagens icônicos reimaginados',
        '🎵 Trilha sonora remasterizada',
        '🌟 Sistema de Materia renovado',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-3330 / AMD FX-8350',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 780 / AMD Radeon RX 480',
          armazenamento: '100 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-3770 / AMD Ryzen 5 1500X',
          memoria: '12 GB RAM',
          placa: 'NVIDIA GeForce GTX 1080 / AMD Radeon RX 5700',
          armazenamento: '100 GB SSD',
        },
      },
    },
    'resident-evil-village': {
      titulo: 'Resident Evil Village',
      subtitulo: 'O terror volta para casa',
      descricao: 'Continue a história de Ethan Winters em uma vila misteriosa cheia de criaturas aterrorizantes e segredos obscuros. Enfrente Lady Dimitrescu e outros antagonistas memoráveis.',
      desenvolvedor: 'Capcom',
      publisher: 'Capcom',
      lancamento: '7 de maio de 2021',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'PC'],
      generos: ['Survival Horror', 'Ação', 'Primeira Pessoa'],
      caracteristicas: [
        '🏰 Explore uma vila gótica misteriosa',
        '👹 Enfrente inimigos únicos e aterrorizantes',
        '🔫 Combate em primeira pessoa intenso',
        '🧩 Puzzles ambientais desafiadores',
        '🎭 Personagens memoráveis',
        '🎮 Modo Mercenários de ação pura',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-7500 / AMD Ryzen 3 1200',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 560',
          armazenamento: '50 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-8700 / AMD Ryzen 5 3600',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GeForce GTX 1070 / AMD Radeon RX 5700',
          armazenamento: '50 GB SSD',
        },
      },
    },
    'elden-ring': {
      titulo: 'Elden Ring',
      subtitulo: 'Levante-se, Maculado',
      descricao: 'Explore as Terras Intermédias em um mundo aberto épico criado por FromSoftware e George R.R. Martin. Enfrente desafios brutais e descubra os mistérios do Anel Prístino.',
      desenvolvedor: 'FromSoftware',
      publisher: 'Bandai Namco',
      lancamento: '25 de fevereiro de 2022',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'PC'],
      generos: ['Action RPG', 'Souls-like', 'Mundo Aberto'],
      caracteristicas: [
        '🗺️ Mundo aberto vasto e interconectado',
        '⚔️ Combate desafiador característico',
        '📖 Lore escrito por George R.R. Martin',
        '🐴 Montaria Torrente para exploração',
        '🏰 Dungeons Legacy e masmorras secretas',
        '👥 Multiplayer cooperativo e PvP',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-8400 / AMD Ryzen 3 3300X',
          memoria: '12 GB RAM',
          placa: 'NVIDIA GeForce GTX 1060 / AMD Radeon RX 580',
          armazenamento: '60 GB',
        },
        recomendados: {
          so: 'Windows 10/11 (64-bit)',
          processador: 'Intel Core i7-8700K / AMD Ryzen 5 3600X',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GeForce GTX 1070 / AMD Radeon RX Vega 56',
          armazenamento: '60 GB SSD',
        },
      },
    },
    'assassins-creed-valhalla': {
      titulo: 'Assassin\'s Creed Valhalla',
      subtitulo: 'Conquiste a Inglaterra',
      descricao: 'Conduza seu clã viking da Noruega para a Inglaterra medieval e construa um novo lar através da conquista. Viva a era viking como nunca antes nesta épica aventura.',
      desenvolvedor: 'Ubisoft Montreal',
      publisher: 'Ubisoft',
      lancamento: '10 de novembro de 2020',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'PC'],
      generos: ['Ação', 'RPG', 'Mundo Aberto'],
      caracteristicas: [
        '⚔️ Combate viking brutal',
        '🛡️ Raids e conquistas épicas',
        '🏰 Construa e melhore seu assentamento',
        '🌍 Explore Inglaterra, Noruega e mais',
        '🎭 Escolhas que afetam a narrativa',
        '🎮 Festas e jogos vikings tradicionais',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i5-4460 / AMD Ryzen 3 1200',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 960 / AMD Radeon R9 380',
          armazenamento: '50 GB',
        },
        recomendados: {
          so: 'Windows 10 (64-bit)',
          processador: 'Intel Core i7-6700 / AMD Ryzen 7 1700',
          memoria: '16 GB RAM',
          placa: 'NVIDIA GeForce GTX 1080 / AMD Radeon RX Vega 64',
          armazenamento: '50 GB SSD',
        },
      },
    },
    'the-witcher-3': {
      titulo: 'The Witcher 3: Wild Hunt',
      subtitulo: 'Caçador de monstros, caçador de destinos',
      descricao: 'Siga Geralt de Rivia em sua busca para encontrar Ciri enquanto navega por um mundo repleto de monstros e intrigas políticas. O RPG definitivo de mundo aberto.',
      desenvolvedor: 'CD Projekt Red',
      publisher: 'CD Projekt',
      lancamento: '19 de maio de 2015',
      plataformas: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'Nintendo Switch', 'PC'],
      generos: ['RPG', 'Ação', 'Mundo Aberto'],
      caracteristicas: [
        '🗺️ Mundo aberto massivo e detalhado',
        '⚔️ Sistema de combate estratégico',
        '🧙 Magias e alquimia profundas',
        '📖 Narrativa ramificada complexa',
        '🎯 Caça de monstros variada',
        '🏆 Expansões premiadas incluídas',
      ],
      requisitos: {
        minimos: {
          so: 'Windows 7/8/10 (64-bit)',
          processador: 'Intel Core i5-2500K / AMD Phenom II X4 940',
          memoria: '6 GB RAM',
          placa: 'NVIDIA GeForce GTX 660 / AMD Radeon HD 7870',
          armazenamento: '50 GB',
        },
        recomendados: {
          so: 'Windows 7/8/10 (64-bit)',
          processador: 'Intel Core i7-3770 / AMD FX-8350',
          memoria: '8 GB RAM',
          placa: 'NVIDIA GeForce GTX 770 / AMD Radeon R9 290',
          armazenamento: '50 GB SSD',
        },
      },
    },
  };

  const jogo = jogosData[jogoId];

  if (!jogo) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0a0015 0%, #1a0033 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <h1>Jogo não encontrado</h1>
        <Link to="/gamer-world" style={{ color: '#00d9ff', marginTop: '20px' }}>
          Voltar para Gamer World
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0015 0%, #1a0033 100%)',
      color: '#fff',
      fontFamily: 'Rajdhani, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Efeitos de fundo */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(10, 0, 21, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(138, 43, 226, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '15px 20px' : '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link to="/gamer-world" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00d9ff 0%, #8a2be2 50%, #ff00ea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              letterSpacing: '2px',
              textShadow: '0 0 30px rgba(0, 217, 255, 0.5)',
            }}>
              CyberLife
            </h1>
          </Link>

          {/* Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(0, 217, 255, 0.2) 100%)',
                border: '2px solid rgba(138, 43, 226, 0.5)',
                color: '#fff',
                padding: isMobile ? '8px 16px' : '10px 20px',
                borderRadius: '25px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Rajdhani, sans-serif',
                letterSpacing: '1px',
              }}
            >
              MENU ▾
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                background: 'rgba(10, 0, 21, 0.98)',
                border: '2px solid rgba(138, 43, 226, 0.5)',
                borderRadius: '15px',
                minWidth: '200px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}>
                {[
                  { nome: 'Início', rota: '/' },
                  { nome: 'Gamer World', rota: '/gamer-world' },
                  { nome: 'Perfil', rota: '/perfil' },
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.rota}
                    style={{
                      display: 'block',
                      padding: '12px 20px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      borderBottom: index < 4 ? '1px solid rgba(138, 43, 226, 0.2)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(0, 217, 255, 0.3) 100%)';
                      e.currentTarget.style.paddingLeft = '30px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = '20px';
                    }}
                  >
                    {item.nome}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '40px 20px' : '60px 40px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Título e Subtítulo */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '40px' : '60px',
        }}>
          <h1 style={{
            fontSize: isMobile ? '2.5rem' : '4rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00d9ff 0%, #8a2be2 50%, #ff00ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            textShadow: '0 0 40px rgba(0, 217, 255, 0.5)',
          }}>
            {jogo.titulo}
          </h1>
          <p style={{
            fontSize: isMobile ? '1.1rem' : '1.5rem',
            color: '#00d9ff',
            fontWeight: 600,
            letterSpacing: '1px',
          }}>
            {jogo.subtitulo}
          </p>
        </div>

        {/* Grid de Conteúdo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '30px' : '40px',
          marginBottom: '50px',
        }}>
          {/* Descrição */}
          <div style={{
            background: 'rgba(138, 43, 226, 0.1)',
            border: '2px solid rgba(138, 43, 226, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '25px' : '35px',
            backdropFilter: 'blur(10px)',
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 800,
              color: '#8a2be2',
              marginBottom: '20px',
              letterSpacing: '2px',
            }}>
              📖 Sobre o Jogo
            </h2>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.9)',
            }}>
              {jogo.descricao}
            </p>
          </div>

          {/* Informações */}
          <div style={{
            background: 'rgba(0, 217, 255, 0.1)',
            border: '2px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '25px' : '35px',
            backdropFilter: 'blur(10px)',
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 800,
              color: '#00d9ff',
              marginBottom: '20px',
              letterSpacing: '2px',
            }}>
              ℹ️ Informações
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>
                <strong style={{ color: '#00d9ff' }}>Desenvolvedor:</strong> {jogo.desenvolvedor}
              </p>
              <p style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>
                <strong style={{ color: '#00d9ff' }}>Publisher:</strong> {jogo.publisher}
              </p>
              <p style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>
                <strong style={{ color: '#00d9ff' }}>Lançamento:</strong> {jogo.lancamento}
              </p>
              <p style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>
                <strong style={{ color: '#00d9ff' }}>Gêneros:</strong> {jogo.generos.join(', ')}
              </p>
              <p style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>
                <strong style={{ color: '#00d9ff' }}>Plataformas:</strong> {jogo.plataformas.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Características */}
        <div style={{
          background: 'rgba(255, 0, 234, 0.1)',
          border: '2px solid rgba(255, 0, 234, 0.3)',
          borderRadius: '20px',
          padding: isMobile ? '25px' : '35px',
          marginBottom: '50px',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 style={{
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 800,
            color: '#ff00ea',
            marginBottom: '25px',
            letterSpacing: '2px',
          }}>
            ⭐ Características Principais
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '15px',
          }}>
            {jogo.caracteristicas.map((caracteristica, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 0, 234, 0.1)',
                  border: '1px solid rgba(255, 0, 234, 0.2)',
                  borderRadius: '12px',
                  padding: '15px 20px',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 234, 0.2)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 234, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {caracteristica}
              </div>
            ))}
          </div>
        </div>

        {/* Requisitos do Sistema */}
        <div style={{
          background: 'rgba(0, 217, 255, 0.05)',
          border: '2px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '20px',
          padding: isMobile ? '25px' : '35px',
          marginBottom: '50px',
        }}>
          <h2 style={{
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 800,
            color: '#00d9ff',
            marginBottom: '30px',
            letterSpacing: '2px',
            textAlign: 'center',
          }}>
            💻 Requisitos do Sistema (PC)
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '25px' : '40px',
          }}>
            {/* Mínimos */}
            <div style={{
              background: 'rgba(138, 43, 226, 0.1)',
              border: '2px solid rgba(138, 43, 226, 0.3)',
              borderRadius: '15px',
              padding: isMobile ? '20px' : '25px',
            }}>
              <h3 style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                fontWeight: 700,
                color: '#8a2be2',
                marginBottom: '15px',
                textAlign: 'center',
              }}>
                Mínimos
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>SO:</strong> {jogo.requisitos.minimos.so}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Processador:</strong> {jogo.requisitos.minimos.processador}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Memória:</strong> {jogo.requisitos.minimos.memoria}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Placa de Vídeo:</strong> {jogo.requisitos.minimos.placa}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Armazenamento:</strong> {jogo.requisitos.minimos.armazenamento}
                </p>
              </div>
            </div>

            {/* Recomendados */}
            <div style={{
              background: 'rgba(0, 217, 255, 0.1)',
              border: '2px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '15px',
              padding: isMobile ? '20px' : '25px',
            }}>
              <h3 style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                fontWeight: 700,
                color: '#00d9ff',
                marginBottom: '15px',
                textAlign: 'center',
              }}>
                Recomendados
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>SO:</strong> {jogo.requisitos.recomendados.so}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Processador:</strong> {jogo.requisitos.recomendados.processador}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Memória:</strong> {jogo.requisitos.recomendados.memoria}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Placa de Vídeo:</strong> {jogo.requisitos.recomendados.placa}
                </p>
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem' }}>
                  <strong>Armazenamento:</strong> {jogo.requisitos.recomendados.armazenamento}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Voltar */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/gamer-world" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #00d9ff 0%, #8a2be2 100%)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: isMobile ? '15px 40px' : '18px 50px',
              borderRadius: '30px',
              fontSize: isMobile ? '1rem' : '1.2rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              boxShadow: '0 8px 25px rgba(0, 217, 255, 0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 217, 255, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
            }}>
              ← Voltar para Gamer World
            </button>
          </Link>
        </div>
      </main>

      <CommunityFab />
    </div>
  );
}
