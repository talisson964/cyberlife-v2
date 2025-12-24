import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react'
import { supabase } from '../supabaseClient'
import './LoginPage.css'

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
    city: '',
    state: '',
    whatsapp: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
    }
    
    setMessage({ type: 'success', text: 'Entrando como convidado...' })
    setTimeout(() => onLoginSuccess(guestUser), 500)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Limpar qualquer sessão antiga antes de fazer login
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error

      // Buscar dados do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, pode não ter perfil ainda
        throw profileError
      }

      setMessage({ type: 'success', text: 'Login realizado com sucesso!' })
      setTimeout(() => onLoginSuccess({ user: data.user, profile }), 1000)
    } catch (error) {
      console.error('Erro no login:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao fazer login' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validações
    if (!formData.fullName || !formData.age || !formData.city || !formData.state || !formData.whatsapp) {
      setMessage({ type: 'error', text: 'Preencha todos os campos' })
      setLoading(false)
      return
    }

    if (formData.age < 13) {
      setMessage({ type: 'error', text: 'Você deve ter pelo menos 13 anos' })
      setLoading(false)
      return
    }

    try {
      // 1. Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error

      // 2. Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: formData.email,
            full_name: formData.fullName,
            age: parseInt(formData.age),
            city: formData.city,
            state: formData.state,
            whatsapp: formData.whatsapp,
            created_at: new Date().toISOString()
          }
        ])

      if (profileError) throw profileError

      setMessage({ 
        type: 'success', 
        text: 'Conta criada! Verifique seu email para confirmar o cadastro.' 
      })
      
      setTimeout(() => {
        setMode('login')
        setFormData({ ...formData, password: '', fullName: '', age: '', city: '', state: '', whatsapp: '' })
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao criar conta' })
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
    <div className="login-page">
      <div className="login-background">
        <div className="cyber-grid"></div>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <img src="/cyberlife-icone2.png" alt="CyberLife" className="login-logo" />
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
                <Mail size={20} />
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
                <Lock size={20} />
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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
                <User size={20} />
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
                  <Calendar size={20} />
                  Idade
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="18"
                  min="13"
                  max="120"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={20} />
                  Estado
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  {estados.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <MapPin size={20} />
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
                <Phone size={20} />
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
                <Mail size={20} />
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
                <Lock size={20} />
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                <Mail size={20} />
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
      </div>
    </div>
  )
}
