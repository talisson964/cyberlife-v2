import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react'
import { supabase } from '../supabaseClient'
import img1 from '../imagens/mexendo-pc.png'
import img2 from '../imagens/mascarado-com-controle.png'
import img3 from '../imagens/um-homem-em-um-terno-de-neon-esta-sentado-em-uma-cadeira-com-um-letreiro-de-neon-que-diz-palavra.jpg'
import img4 from '../imagens/maos-jogador-no-controlador.jpg'
import emailjs from '@emailjs/browser'
import { playRandomAudio } from '../utils/audioPlayer'
import AudioVisualizer from '../components/AudioVisualizer'

// Inicializar EmailJS
emailjs.init('SxPIIDojWJxViW_q_')

const images = [img1,img2, img3, img4]

export default function StartScreen({ onStart }){
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeText, setWelcomeText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot', 'awaiting-confirmation'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [registeredEmail, setRegisteredEmail] = useState('') // Email que acabou de se registrar
  const [showGuestModal, setShowGuestModal] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    birthDate: '',  // Armazena a data no formato DD/MM/AAAA para exibição
    internalBirthDate: '', // Armazena a data no formato YYYY-MM-DD para envio ao backend
    city: '',
    state: '',
    whatsapp: ''
  })
  const [rememberMe, setRememberMe] = useState(false)

  // Pré-carregar todas as imagens para evitar flashes brancos
  useEffect(() => {
    const preloadImages = images.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, []);

  // Background image carousel - com transições mais suaves
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % images.length)
        // Pequeno delay antes de iniciar a transição de fadeIn para garantir que a nova imagem esteja carregada
        setTimeout(() => {
          setFade(true)
        }, 100) // Aumentei o delay para garantir que a imagem esteja completamente carregada
      }, 1200) // Aumentei o tempo para completar a transição de fade-out
    }, 7000) // Ajustei o intervalo total para dar tempo suficiente para as transições
    return () => clearInterval(t)
  }, [])

  // Listener para detectar confirmação de email
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth event:', event, 'Mode:', mode)
      
      // Quando o usuário confirma o email, ele é redirecionado de volta
      if (event === 'SIGNED_IN' && mode === 'awaiting-confirmation' && session?.user) {
        console.log('✅ Email confirmado! Buscando perfil...')
        
        // Aguardar 2 segundos para dar tempo do trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Tentar buscar perfil com retry (3 tentativas)
        let profile = null
        for (let i = 0; i < 3; i++) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          
          if (data) {
            profile = data
            console.log('📋 Perfil encontrado:', profile)
            break
          }
          
          console.log(`⏳ Tentativa ${i + 1}/3: Perfil ainda não criado, aguardando...`)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }

        // Notificar admin sobre novo usuário
        await notifyAdminNewUser(session.user, profile)

        setMessage({ type: 'success', text: 'Email confirmado! Faça login para entrar.' })
        setTimeout(() => {
          // Fechar o card de login e voltar para tela inicial
          setShowLogin(false)
          setMode('login')
          setFormData({ ...formData, email: registeredEmail })
        }, 2500)
      }
      
      // Se o token de confirmação está na URL
      if (event === 'TOKEN_REFRESHED' && mode === 'awaiting-confirmation' && session?.user) {
        console.log('🔄 Token atualizado! Buscando perfil...')
        
        // Aguardar 2 segundos para dar tempo do trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Tentar buscar perfil com retry (3 tentativas)
        let profile = null
        for (let i = 0; i < 3; i++) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          
          if (data) {
            profile = data
            console.log('📋 Perfil encontrado:', profile)
            break
          }
          
          console.log(`⏳ Tentativa ${i + 1}/3: Perfil ainda não criado, aguardando...`)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }

        // Notificar admin sobre novo usuário
        await notifyAdminNewUser(session.user, profile)

        setMessage({ type: 'success', text: 'Email confirmado com sucesso! Faça login para entrar.' })
        setTimeout(() => {
          // Fechar o card de login e voltar para tela inicial
          setShowLogin(false)
          setMode('login')
          setFormData({ ...formData, email: registeredEmail })
        }, 2500)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [mode, registeredEmail])

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tratamento especial para o campo de data de nascimento
    if (name === 'birthDate' || name === 'birthDateCalendar') {
      if (name === 'birthDateCalendar') {
        // Quando o usuário seleciona uma data no calendário
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - selectedDate.getFullYear();
          const monthDiff = today.getMonth() - selectedDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
            age--;
          }

          if (age < 13) {
            setMessage({ type: 'error', text: 'Você deve ter pelo menos 13 anos para se cadastrar.' });
            return; // Não atualiza o estado se a idade for menor que 13
          } else {
            setMessage({ type: '', text: '' }); // Limpa mensagem de erro
          }
        }

        setFormData(prev => ({
          ...prev,
          birthDate: value ? new Date(value).toLocaleDateString('pt-BR') : '', // Formato DD/MM/AAAA para exibição
          internalBirthDate: value // Formato YYYY-MM-DD para armazenamento interno
        }));
      } else {
        // Quando o usuário digita manualmente a data
        setFormData(prev => ({
          ...prev,
          birthDate: value, // Atualiza o campo de exibição
          // O internalBirthDate será atualizado separadamente no onChange do campo de texto
        }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const notifyAdminNewUser = async (user, profile) => {
    try {
      console.log('📧 Iniciando envio de notificação...')
      console.log('👤 User:', user)
      console.log('📋 Profile:', profile)
      
      // Se não houver perfil, usar user_metadata como fallback
      const userData = profile || user.user_metadata || {}
      
      // Preparar parâmetros do template do EmailJS
      const templateParams = {
        to_email: 'cyberlife964@gmail.com',
        user_name: userData.full_name || user.user_metadata?.full_name || 'Não informado',
        user_email: user.email,
        user_age: userData.age || user.user_metadata?.age || 'Não informado',
        user_location: `${userData.city || user.user_metadata?.city || 'Não informado'} - ${userData.state || user.user_metadata?.state || 'Não informado'}`,
        user_whatsapp: userData.whatsapp || user.user_metadata?.whatsapp || 'Não informado',
        user_id: user.id,
        registration_date: new Date().toLocaleString('pt-BR', {
          dateStyle: 'full',
          timeStyle: 'short'
        })
      }

      // Log dos parâmetros
      console.log('� Parâmetros do email:', templateParams)

      // Enviar email via EmailJS
      console.log('🚀 Enviando email via EmailJS...')
      const response = await emailjs.send(
        'service_vvcar35',      // Service ID
        'template_suhs0ik',     // Template ID
        templateParams,
        'SxPIIDojWJxViW_q_'     // Public Key
      )

      console.log('📬 Resposta EmailJS:', response)

      if (response.status === 200) {
        console.log('✅ Email enviado com sucesso ao admin!')
      } else {
        console.warn('⚠️ Email enviado mas status não é 200:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao notificar admin:', error)
      console.error('❌ Detalhes do erro:', error.message, error.text)
      // Não propagar erro - notificação é secundária
    }
  }

  const handleGuestLogin = () => {
    // Mostrar modal de aviso
    setShowGuestModal(true)
    
    // Após 3 segundos, fazer transição
    setTimeout(() => {
      setShowGuestModal(false)
      setTimeout(() => {
        onStart() // Avança para a próxima tela
      }, 300) // Aguarda animação de fade out
    }, 3000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
        options: {
          // Se "Mantenha-me conectado" estiver marcado, a sessão dura 60 dias
          // Caso contrário, dura apenas até fechar o navegador
          persistSession: rememberMe
        }
      })

      if (error) throw error

      // Se "Mantenha-me conectado" estiver ativo, salvar preferência no localStorage
      if (rememberMe) {
        localStorage.setItem('cyberlife_remember_me', 'true')
      } else {
        localStorage.removeItem('cyberlife_remember_me')
      }

      // Buscar dados do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      // Se o perfil não existir, criar um básico
      if (!profile) {
        console.warn('Perfil não encontrado, criando perfil básico...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || 'Usuário',
            birth_date: data.user.user_metadata?.birth_date || '2000-01-01',
            age: data.user.user_metadata?.age || 18,
            city: data.user.user_metadata?.city || 'Não informado',
            state: data.user.user_metadata?.state || 'SP',
            whatsapp: data.user.user_metadata?.whatsapp || ''
          }])
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar perfil:', createError)
          // Continuar sem o perfil se falhar
      setMessage({ type: 'success', text: 'Login realizado com sucesso!' })
      setTimeout(() => {
        onStart({ user: data.user, profile: null })
      }, 1000)
          return
        }

        setMessage({ type: 'success', text: 'Login realizado com sucesso!' })
        setTimeout(() => {
          onStart({ user: data.user, profile: newProfile })
        }, 1000)
        return
      }

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError)
      }

      setMessage({ type: 'success', text: 'Login realizado com sucesso!' })
      setTimeout(() => {
        onStart({ user: data.user, profile })
      }, 1000)
    } catch (error) {
      // Verificar se o erro é por email não confirmado
      if (error.message?.includes('Email not confirmed')) {
        setMessage({ 
          type: 'error', 
          text: 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.' 
        })
      } else {
        setMessage({ type: 'error', text: error.message || 'Erro ao fazer login' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validações
    if (!formData.fullName || !formData.internalBirthDate || !formData.city || !formData.state || !formData.whatsapp) {
      setMessage({ type: 'error', text: 'Preencha todos os campos' })
      setLoading(false)
      return
    }

    // Usar internalBirthDate se estiver disponível, caso contrário usar birthDate
    const dateToUse = formData.internalBirthDate || formData.birthDate;
    const age = calculateAge(dateToUse);
    if (age < 13) {
      setMessage({ type: 'error', text: 'Você deve ter pelo menos 13 anos' })
      setLoading(false)
      return
    }

    try {
      // Criar usuário no Supabase Auth
      // O trigger handle_new_user() vai criar o perfil automaticamente
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            birth_date: formData.internalBirthDate,
            age: age,
            city: formData.city,
            state: formData.state,
            whatsapp: formData.whatsapp
          }
        }
      })

      if (error) throw error

      if (!data.user) {
        throw new Error('Erro ao criar usuário')
      }

      // Salvar email registrado e mudar para tela de confirmação
      setRegisteredEmail(formData.email)
      setMessage({
        type: 'success',
        text: 'Conta criada com sucesso!'
      })

      setTimeout(() => {
        setMode('awaiting-confirmation')
        setFormData({ ...formData, password: '', fullName: '', birthDate: '', internalBirthDate: '', city: '', state: '', whatsapp: '' })
      }, 1500)
    } catch (error) {
      console.error('Registration error:', error)

      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao criar conta'

      if (error.message?.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado'
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido'
      } else if (error.message?.includes('Password')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres'
      } else if (error.message) {
        errorMessage = error.message
      }

      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: window.location.origin + '/reset-password'
      })

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: 'Email de recuperação enviado! Verifique sua caixa de entrada.' 
      })
      
      setTimeout(() => setMode('login'), 2000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar email' })
    } finally {
      setLoading(false)
    }
  }

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  return (
    <div className="start-screen">
      {/* Container de fundo permanente para evitar flashes brancos */}
      <div className="background-container">
        {/* Carregamento otimizado para mobile - apenas uma imagem visível por vez */}
        <div
          className={`background-image ${fade ? 'fade-in' : 'fade-out'}`}
          style={{backgroundImage:`url(${images[index]})`}}
          // Otimização para mobile: carregamento preguiçoso
          loading="lazy"
        />
      </div>
      {!showLogin ? (
        <>
          <button className="start-button" onClick={() => {
            playRandomAudio()
            setShowLoading(true)
            setTimeout(() => {
              setShowLoading(false)
              // Mensagem animada tipo máquina de escrever
              const frases = [
                'Welcome to CyberLife',
                'Bem Vindo à CyberLife'
              ]
              let frase = frases[Math.floor(Math.random() * frases.length)]
              if (!frase.trim().endsWith('!')) frase = frase.trim() + '!'
              setWelcomeText(frase)
              setTypedText('')
              setShowWelcome(true)
              let i = 0
              let current = ''
              const typeInterval = setInterval(() => {
                current += frase[i]
                setTypedText(current)
                i++
                if (i >= frase.length) {
                  clearInterval(typeInterval)
                  setTimeout(() => {
                    setShowWelcome(false)
                    setShowLogin(true)
                  }, 2500)
                }
              }, Math.max(50, Math.floor(1500 / frase.length)))
            }, 4000)
          }}>START</button>
          {showLoading && (
            <div
              className="cyberlife-loading-overlay"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.85)',
                flexDirection: 'column',
                gap: 32,
                padding: 0,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  width: '100%',
                  maxWidth: 400,
                  margin: 0,
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '6px solid #00d9ff',
                    borderTop: '6px solid #e322bc',
                    animation: 'cyberlife-spin 1.1s linear infinite',
                    marginBottom: 16,
                    boxShadow: '0 0 32px #00d9ff99, 0 0 16px #e322bc99',
                  }}
                />
                <span
                  style={{
                    color: '#00d9ff',
                    fontWeight: 700,
                    fontSize: '2rem',
                    letterSpacing: 1.5,
                    textShadow: '0 0 16px #00d9ff, 0 0 8px #e322bc',
                    fontFamily: 'inherit',
                    marginBottom: 8,
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '90vw',
                    wordBreak: 'break-word',
                  }}
                >
                  Carregando CyberLife...
                </span>
                <span
                  style={{
                    color: '#e322bc',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    letterSpacing: 1,
                    textShadow: '0 0 8px #e322bc',
                    fontFamily: 'inherit',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '90vw',
                    wordBreak: 'break-word',
                  }}
                >
                  Preparando sua experiência digital
                </span>
              </div>
              <style>{`
                @keyframes cyberlife-spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @media (max-width: 640px) {
                  .cyberlife-loading-overlay span {
                    font-size: 1.1rem !important;
                    padding: 0 2vw;
                  }
                  .cyberlife-loading-overlay div[style*='width: 80px'] {
                    width: 48px !important;
                    height: 48px !important;
                  }
                }
              `}</style>
            </div>
          )}
          {showWelcome && (
            <div
              className="cyberlife-welcome-overlay"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                pointerEvents: 'none',
                background: 'rgba(10,10,20,0.88)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55) inset',
                transition: 'background 0.4s',
                padding: 0,
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '2.3rem',
                  color: '#00d9ff',
                  textShadow: '0 2px 12px #00334d, 0 0 8px #00d9ff99',
                  fontFamily: 'inherit',
                  letterSpacing: 1.5,
                  filter: 'brightness(0.85) drop-shadow(0 0 4px #00d9ff88)',
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  background: 'none',
                  borderRadius: 0,
                  animation: 'cyberlife-fade-in 0.5s, cyberlife-fade-out 0.7s 3.3s',
                  transition: 'all 0.3s',
                  whiteSpace: 'pre-line',
                  textAlign: 'center',
                  minWidth: 0,
                  textRendering: 'optimizeLegibility',
                  width: '100%',
                  maxWidth: '90vw',
                  wordBreak: 'break-word',
                  lineHeight: 1.15,
                  display: 'block',
                }}
              >
                {typedText}
              </span>
              <style>{`
                @keyframes cyberlife-fade-in {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }
                @keyframes cyberlife-fade-out {
                  from { opacity: 1; transform: scale(1); }
                  to { opacity: 0; transform: scale(1.08); }
                }
                @media (max-width: 640px) {
                  .cyberlife-welcome-overlay span {
                    font-size: 1.2rem !important;
                    padding: 0 2vw;
                    line-height: 1.2;
                  }
                }
              `}</style>
            </div>
          )}
        </>
      ) : (
        <div className="login-card">
          <div className="login-card-content">
            <div className="login-header">
              <h1 className="login-title">CyberLife</h1>
              <p className="login-subtitle">
                {mode === 'login' && 'Entre na sua conta'}
                {mode === 'register' && 'Crie sua conta'}
                {mode === 'forgot' && 'Recuperar senha'}
              </p>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {mode === 'login' && (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Lock size={18} />
                  Senha
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="remember-me-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Mantenha-me conectado</label>
              </div>

              <button type="button" className="forgot-link" onClick={() => setMode('forgot')}>
                Esqueci minha senha
              </button>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button 
                type="button" 
                className="guest-button" 
                onClick={handleGuestLogin}
                disabled={loading}
              >
                Entrar como Convidado
              </button>

              <div className="switch-mode">
                Não tem conta?{' '}
                <button type="button" onClick={() => setMode('register')}>
                  Criar conta
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="login-form register-form">
              <div className="form-group">
                <label>
                  <User size={18} />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="João Silva"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Calendar size={18} />
                    Data de Nascimento
                  </label>
                  <div className="date-input-wrapper">
                    <input
                      type="date"
                      name="birthDateCalendar"
                      value={formData.internalBirthDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]} // Limite mínimo de 120 anos atrás
                      required
                      className="date-input-calendar"
                      style={{ display: 'none' }} // Esconder o campo de data padrão em favor do campo de texto
                    />
                    <input
                      type="text"
                      inputMode="numeric"  // Força teclado numérico em dispositivos móveis
                      name="birthDate"
                      value={formData.birthDate || ''}
                      onChange={(e) => {
                        // Handle manual input - convert DD/MM/YYYY to YYYY-MM-DD format for internal storage
                        const value = e.target.value;
                        if (/^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(value)) {
                          // Format the input as DD/MM/YYYY as the user types
                          let formattedValue = value.replace(/\D/g, '');

                          if (formattedValue.length > 2) {
                            formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
                          }

                          if (formattedValue.length > 5) {
                            formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 10);
                          }

                          // Update the displayed value
                          e.target.value = formattedValue;

                          // Convert to YYYY-MM-DD format for internal storage if complete
                          if (formattedValue.length === 10) {
                            const [day, month, year] = formattedValue.split('/');
                            if (day.length === 2 && month.length === 2 && year.length === 4) {
                              // More robust validation of the date
                              const dayInt = parseInt(day, 10);
                              const monthInt = parseInt(month, 10);
                              const yearInt = parseInt(year, 10);

                              // Basic range checks
                              if (dayInt >= 1 && dayInt <= 31 && monthInt >= 1 && monthInt <= 12 && yearInt >= 1900 && yearInt <= new Date().getFullYear()) {
                                // Create date object to validate if the date actually exists
                                const dateObj = new Date(yearInt, monthInt - 1, dayInt); // month is 0-indexed in JS

                                // Check if the date is valid by comparing the original input values with the created date object
                                // This validates real dates like Feb 30 (which would create a different date object)
                                // Create a reference date to compare against
                                const referenceDate = new Date(yearInt, monthInt - 1, dayInt);

                                if (dateObj.getDate() === referenceDate.getDate() &&
                                    dateObj.getMonth() === referenceDate.getMonth() &&
                                    dateObj.getFullYear() === referenceDate.getFullYear()) {

                                  // Additional validation to ensure the date is not in the future
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  if (dateObj <= today) {
                                    // Verifica se o usuário tem pelo menos 13 anos
                                    const todayForAge = new Date();
                                    let age = todayForAge.getFullYear() - dateObj.getFullYear();
                                    const monthDiff = todayForAge.getMonth() - dateObj.getMonth();

                                    if (monthDiff < 0 || (monthDiff === 0 && todayForAge.getDate() < dateObj.getDate())) {
                                      age--;
                                    }

                                    if (age < 13) {
                                      setMessage({ type: 'error', text: 'Você deve ter pelo menos 13 anos para se cadastrar.' });
                                      return; // Não atualiza o estado se a idade for menor que 13
                                    } else {
                                      setMessage({ type: '', text: '' }); // Limpa mensagem de erro
                                    }

                                    setFormData(prev => ({
                                      ...prev,
                                      birthDate: formattedValue, // Armazena a data formatada para exibição
                                      internalBirthDate: dateObj.toISOString().split('T')[0] // Armazena a data no formato interno
                                    }));
                                  }
                                }
                              }
                            }
                          } else {
                            // Atualiza apenas o valor formatado para exibição
                            setFormData(prev => ({
                              ...prev,
                              birthDate: formattedValue
                            }));
                          }
                        }
                      }}
                      placeholder="DD/MM/AAAA"
                      className="date-input-text"
                      maxLength="10"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <MapPin size={18} />
                    Estado
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">UF</option>
                    {estados.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={18} />
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="São Paulo"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={18} />
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Lock size={18} />
                  Senha
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Conta'}
              </button>

              <div className="switch-mode">
                Já tem conta?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Entrar
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="login-form">
              <p className="forgot-description">
                Digite seu email para receber um link de recuperação de senha.
              </p>

              <div className="form-group">
                <label>
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>

              <div className="switch-mode">
                Lembrou a senha?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Fazer login
                </button>
              </div>
            </form>
          )}

          {mode === 'awaiting-confirmation' && (
            <div className="confirmation-screen">
              <div className="confirmation-icon">
                <Mail size={64} />
              </div>
              <h2 className="confirmation-title">Confirme seu Email</h2>
              <p className="confirmation-text">
                Enviamos um email de confirmação para:
              </p>
              <p className="confirmation-email">{registeredEmail}</p>
              <p className="confirmation-instructions">
                Por favor, verifique sua caixa de entrada (e também o spam) e clique no link de confirmação para ativar sua conta.
              </p>
              <div className="confirmation-info">
                <p>⏰ O link expira em 24 horas</p>
                <p>📧 Após confirmar, você será redirecionado automaticamente para o login</p>
                <p>🔄 Aguardando confirmação...</p>
              </div>
              <button 
                type="button" 
                className="submit-button" 
                onClick={() => {
                  setMode('login')
                  setFormData({ ...formData, email: registeredEmail })
                }}
              >
                Ir para Login Agora
              </button>
              <div className="switch-mode">
                Não recebeu o email?{' '}
                <button 
                  type="button" 
                  onClick={async () => {
                    setLoading(true)
                    try {
                      await supabase.auth.resend({
                        type: 'signup',
                        email: registeredEmail
                      })
                      setMessage({ type: 'success', text: 'Email reenviado!' })
                    } catch (error) {
                      setMessage({ type: 'error', text: 'Erro ao reenviar email' })
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  Reenviar email
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Modal de Aviso Modo Convidado */}
      {showGuestModal && (
        <div className="guest-modal-overlay">
          <div className="guest-modal">
            <div className="guest-modal-icon">⚠️</div>
            <h2 className="guest-modal-title">Modo Convidado</h2>
            <p className="guest-modal-text">
              Para melhor experiência CyberLife, fazer compras e participar de eventos, 
              é necessário fazer login com uma conta.
            </p>
            <div className="guest-modal-loading">
              <div className="loading-bar"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
