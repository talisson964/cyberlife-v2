import { supabase } from '../supabaseClient'

/**
 * Gerenciador global de erros de autenticação do Supabase
 * Limpa sessões corrompidas e lida com erros de refresh token
 */

let isHandlingError = false

export const handleAuthError = async (error) => {
  // Evitar loops de tratamento de erro
  if (isHandlingError) return
  
  isHandlingError = true

  try {
    console.debug('Erro de autenticação detectado:', error)

    // Erros relacionados a token expirado ou inválido
    const tokenErrors = [
      'invalid_grant',
      'refresh_token_not_found',
      'invalid refresh token',
      'JWT expired',
      'invalid claim',
      'ERR_NAME_NOT_RESOLVED',
      'Failed to fetch'
    ]

    const errorMessage = error?.message?.toLowerCase() || ''
    const isTokenError = tokenErrors.some(err => errorMessage.includes(err.toLowerCase()))

    if (isTokenError) {
      console.debug('Limpando sessão inválida...')
      
      // Limpar localStorage
      localStorage.removeItem('cyberlife-auth-token')
      localStorage.removeItem('supabase.auth.token')
      
      // Fazer logout silencioso - não falhar se Supabase não estiver disponível
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.debug('Logout silencioso falhou, continuando...')
      }
      
      console.log('Sessão limpa. Recarregando aplicação...')
      
      // Recarregar a página para começar com estado limpo
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    }
  } catch (err) {
    console.error('Erro ao limpar sessão:', err)
  } finally {
    isHandlingError = false
  }
}

/**
 * Inicializar listener global de erros de autenticação
 */
export const initAuthErrorHandler = () => {
  try {
    // Listener de erros de autenticação
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token atualizado com sucesso')
      }
    })
  } catch (err) {
    console.debug('Auth state listener não disponível')
  }

  // Capturar erros não tratados relacionados ao Supabase
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    
    if (error && typeof error === 'object') {
      const message = error.message || error.error_description || ''
      
      // Verificar se é um erro do Supabase Auth ou erro de rede - mas não bloquear app
      if (message.includes('refresh') || 
          message.includes('token') || 
          message.includes('session') ||
          message.includes('JWT') ||
          message.includes('ERR_NAME_NOT_RESOLVED') ||
          message.includes('Failed to fetch')) {
        // Prevenir que erro apareça no console
        event.preventDefault()
        handleAuthError(error)
      }
    }
  })

  console.log('Gerenciador de erros de autenticação inicializado')
}

/**
 * Verificar e limpar sessões inválidas no carregamento
 */
export const checkAndCleanSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      await handleAuthError(error)
      return null
    }
    
    return session
  } catch (error) {
    // Não deixar erro de rede quebrar a aplicação
    console.debug('Supabase não disponível:', error.message)
    await handleAuthError(error)
    return null
  }
}
