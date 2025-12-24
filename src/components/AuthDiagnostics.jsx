import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Componente de Diagnóstico de Autenticação
 * Útil para debugar problemas de sessão e tokens
 * 
 * Para usar: Adicione <AuthDiagnostics /> em qualquer tela durante desenvolvimento
 */
export default function AuthDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    session: null,
    user: null,
    localStorage: [],
    sessionStorage: [],
    lastError: null,
    authEvents: []
  })

  useEffect(() => {
    checkAuthState()

    // Listener de eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setDiagnostics(prev => ({
        ...prev,
        authEvents: [
          ...prev.authEvents.slice(-4), // Manter últimos 5 eventos
          {
            event,
            timestamp: new Date().toISOString(),
            hasSession: !!session
          }
        ]
      }))
      
      // Atualizar estado quando houver mudança
      checkAuthState()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuthState = async () => {
    try {
      // Verificar sessão
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // Verificar localStorage
      const localStorageItems = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('cyberlife'))) {
          localStorageItems.push({
            key,
            size: localStorage.getItem(key)?.length || 0
          })
        }
      }

      // Verificar sessionStorage
      const sessionStorageItems = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('cyberlife'))) {
          sessionStorageItems.push({
            key,
            size: sessionStorage.getItem(key)?.length || 0
          })
        }
      }

      setDiagnostics(prev => ({
        ...prev,
        session: session ? {
          userId: session.user?.id,
          email: session.user?.email,
          expiresAt: new Date(session.expires_at * 1000).toLocaleString(),
          hasRefreshToken: !!session.refresh_token
        } : null,
        user: session?.user || null,
        localStorage: localStorageItems,
        sessionStorage: sessionStorageItems,
        lastError: error
      }))
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        lastError: error.message
      }))
    }
  }

  const clearAllAuth = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de autenticação?')) {
      // Limpar localStorage
      diagnostics.localStorage.forEach(item => {
        localStorage.removeItem(item.key)
      })

      // Limpar sessionStorage
      diagnostics.sessionStorage.forEach(item => {
        sessionStorage.removeItem(item.key)
      })

      // Fazer logout
      await supabase.auth.signOut()

      // Recarregar
      window.location.reload()
    }
  }

  // Não renderizar em produção
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace',
      boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)',
      border: '1px solid #00ff00'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>🔍 Auth Diagnostics</h3>
        <button
          onClick={clearAllAuth}
          style={{
            background: '#ff0000',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Limpar Tudo
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong>{' '}
        <span style={{ color: diagnostics.session ? '#00ff00' : '#ff0000' }}>
          {diagnostics.session ? '✅ Autenticado' : '❌ Não autenticado'}
        </span>
      </div>

      {diagnostics.session && (
        <div style={{ marginBottom: '10px', paddingLeft: '10px' }}>
          <div>User ID: {diagnostics.session.userId}</div>
          <div>Email: {diagnostics.session.email}</div>
          <div>Expira: {diagnostics.session.expiresAt}</div>
          <div>Refresh Token: {diagnostics.session.hasRefreshToken ? '✅' : '❌'}</div>
        </div>
      )}

      {diagnostics.lastError && (
        <div style={{ 
          marginBottom: '10px',
          color: '#ff0000',
          padding: '8px',
          background: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '4px'
        }}>
          <strong>❌ Erro:</strong> {diagnostics.lastError}
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <strong>LocalStorage ({diagnostics.localStorage.length}):</strong>
        {diagnostics.localStorage.length > 0 ? (
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {diagnostics.localStorage.map((item, i) => (
              <li key={i}>
                {item.key} ({item.size} bytes)
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: '#888' }}>Nenhum item</div>
        )}
      </div>

      {diagnostics.authEvents.length > 0 && (
        <div>
          <strong>Eventos Recentes:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {diagnostics.authEvents.slice().reverse().map((event, i) => (
              <li key={i}>
                <span style={{ color: event.hasSession ? '#00ff00' : '#ff9900' }}>
                  {event.event}
                </span>
                {' '}
                <span style={{ color: '#888', fontSize: '10px' }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={checkAuthState}
        style={{
          width: '100%',
          marginTop: '10px',
          background: '#00ff00',
          color: 'black',
          border: 'none',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔄 Atualizar
      </button>
    </div>
  )
}
