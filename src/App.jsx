import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { initAuthErrorHandler, checkAndCleanSession } from './utils/authErrorHandler'
import useAccessLog from './hooks/useAccessLog'
import LazySection from './components/LazySection'
import StartScreen from './screens/StartScreen'
import NextScreen from './screens/NextScreen'
import LojaGeek from './screens/LojaGeek'
import AdminPanel3 from './screens/AdminPanel3';
import CarrinhoPage from './screens/CarrinhoPage'
import CompraCyberPoints from './screens/CompraCyberPoints'
import GameHouse from './screens/GameHouse'
import LoginGamer from './screens/LoginGamer'
import PerfilPage from './screens/PerfilPage'
import EventoPage from './screens/EventoPage'
import AtividadePage from './screens/AtividadePage'
import JogoPage from './screens/JogoPage'
import ProductDetailPage from './screens/ProductDetailPage'
import AudioVisualizer from './components/AudioVisualizer'
import CommunityFab from './components/CommunityFab'
import DownloadAppButton from './components/DownloadAppButton'
import { isAudioPlaying } from './utils/audioPlayer'

// Componente para registrar acessos
function AccessLogger({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Inicializar gerenciador de erros de autenticação
    try {
      initAuthErrorHandler()
    } catch (err) {
      console.debug('Error handler não disponível')
    }

    // Verificar usuário logado com tratamento de erro
    const initSession = async () => {
      try {
        // Verificar se o usuário tinha a opção "Mantenha-me conectado" ativada
        const rememberMeEnabled = localStorage.getItem('cyberlife_remember_me') === 'true';

        // Se a opção "Mantenha-me conectado" estava ativada, forçar persistência
        if (rememberMeEnabled) {
          console.log('Restaurando sessão com persistência ativada para dispositivo móvel');
        }

        const session = await checkAndCleanSession()
        setCurrentUser(session?.user || null)
      } catch (err) {
        console.debug('Sessão não disponível - modo offline')
        setCurrentUser(null)
      } finally {
        setIsInitialized(true)
      }
    }

    initSession()

    // Listener para mudanças de autenticação - com proteção contra erro
    let subscription = null
    try {
      const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event)

        // Verificar se o usuário tinha a opção "Mantenha-me conectado" ativada
        const rememberMeEnabled = localStorage.getItem('cyberlife_remember_me') === 'true';

        // Se houver erro no token, fazer logout
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          // Se "Mantenha-me conectado" estava ativado, garantir persistência da sessão
          if (rememberMeEnabled && session?.session) {
            console.log('Garantindo persistência da sessão para dispositivo móvel');
          }
          setCurrentUser(session?.user || null)
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // Limpar preferência quando o usuário faz logout
          localStorage.removeItem('cyberlife_remember_me');
          setCurrentUser(null)
        }
      })
      subscription = authListener.data.subscription
    } catch (err) {
      console.debug('Auth listener não disponível - modo offline')
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  // Registrar acesso
  useAccessLog(currentUser, location.pathname)

  return children
}

// Componente de proteção para redirecionar mobile para o gamer-world
function MobileRedirect({ children }) {
  const navigate = useNavigate()
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  React.useEffect(() => {
    if (isMobile) {
      navigate('/gamer-world')
    }
  }, [isMobile, navigate])

  if (isMobile) return null
  return children
}

function StartWrapper() {
  const navigate = useNavigate()

  // Detectar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Função para mostrar o carregamento e depois ir para gamer-world no mobile ou menu no desktop
  const startWithLoading = () => {
    // Simular o carregamento como no StartScreen
    setTimeout(() => {
      if (isMobile) {
        navigate('/gamer-world')
      } else {
        navigate('/menu')
      }
    }, 4000) // 4 segundos como no StartScreen
  }

  // Se for mobile, iniciar o carregamento automaticamente
  React.useEffect(() => {
    if (isMobile) {
      startWithLoading()
    }
  }, [isMobile, navigate])

  // Se for mobile, renderizar o StartScreen com o carregamento automático, senão renderizar normalmente
  if (isMobile) {
    return <StartScreen onStart={() => navigate('/gamer-world')} autoStart={true} />
  }

  return <StartScreen onStart={() => navigate('/menu')} />
}

function MenuWrapper() {
  const navigate = useNavigate()
  return (
    <MobileRedirect>
      <NextScreen onNavigate={(page) => navigate(`/${page}`)} />
    </MobileRedirect>
  )
}

function LojaWrapper() {
  const navigate = useNavigate()
  return (
    <MobileRedirect>
      <LojaGeek onBack={() => navigate('/menu')} />
    </MobileRedirect>
  )
}

function AdminWrapper() {
  const navigate = useNavigate()
  return (
    <MobileRedirect>
      <AdminPanel3 onNavigate={(page) => navigate(`/${page}`)} />
    </MobileRedirect>
  )
}

function CarrinhoWrapper() {
  const navigate = useNavigate()
  return (
    <MobileRedirect>
      <CarrinhoPage onBack={() => navigate('/loja-geek')} />
    </MobileRedirect>
  )
}

function GameHouseWrapper() {
  const navigate = useNavigate()
  return <GameHouse onBack={() => navigate('/gamer-world')} />
}


export default function App() {
  // Forçar atualização do AudioVisualizer quando o áudio começa
  const [audioTick, setAudioTick] = useState(0)
  const location = window.location.pathname
  useEffect(() => {
    const handler = () => setAudioTick(t => t + 1)
    window.addEventListener('cyberlife-audio-tick', handler)
    return () => window.removeEventListener('cyberlife-audio-tick', handler)
  }, [])
  return (
    <BrowserRouter>
      <AccessLogger>
        {/* Visualizador de áudio global, sempre visível - ocultar em dispositivos móveis para melhor performance */}
        {!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '100%', zIndex: 9999, pointerEvents: 'none', background: 'rgba(0,0,0,0.15)' }}>
            <AudioVisualizer key={audioTick} />
          </div>
        )}
        {/* Botão flutuante de download do app - não aparece na tela inicial */}
        {location !== '/' && <DownloadAppButton />}
        {/* CommunityFab aparece em todas as telas exceto na tela inicial */}
        {location !== '/' && <CommunityFab />}
        <Routes>
          <Route path="/" element={
            <LazySection>
              <StartWrapper />
            </LazySection>
          } />
          <Route path="/menu" element={
            <LazySection>
              <MenuWrapper />
            </LazySection>
          } />
          <Route path="/loja-geek" element={
            <LazySection>
              <LojaWrapper />
            </LazySection>
          } />
          <Route path="/produto/:id" element={
            <MobileRedirect>
              <LazySection>
                <ProductDetailPage />
              </LazySection>
            </MobileRedirect>
          } />
          <Route path="/carrinho" element={
            <LazySection>
              <CarrinhoWrapper />
            </LazySection>
          } />
          <Route path="/admin" element={
            <LazySection>
              <AdminWrapper />
            </LazySection>
          } />
          <Route path="/loja-geek/admin" element={
            <MobileRedirect>
              <LazySection>
                <AdminWrapper />
              </LazySection>
            </MobileRedirect>
          } />
          <Route path="/gamer-world" element={
            <LazySection>
              <GameHouseWrapper />
            </LazySection>
          } />
          <Route path="/perfil" element={
            <MobileRedirect>
              <LazySection>
                <PerfilPage />
              </LazySection>
            </MobileRedirect>
          } />
          <Route path="/evento/:eventoId" element={
            <MobileRedirect>
              <LazySection>
                <EventoPage />
              </LazySection>
            </MobileRedirect>
          } />
          <Route path="/atividade/:atividadeId" element={
            <MobileRedirect>
              <LazySection>
                <AtividadePage />
              </LazySection>
            </MobileRedirect>
          } />
          <Route path="/jogo/:jogoId" element={
            <MobileRedirect>
              <LazySection>
                <JogoPage />
              </LazySection>
            </MobileRedirect>
          } />
          <Route path="/comprar-cyberpoints" element={
            <MobileRedirect>
              <LazySection>
                <CompraCyberPoints />
              </LazySection>
            </MobileRedirect>
          } />
          <Route path="/login" element={
            <MobileRedirect>
              <LazySection>
                <LoginGamer />
              </LazySection>
            </MobileRedirect>
          } />
        </Routes>
      </AccessLogger>
    </BrowserRouter>
  )
}
