import { useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Hook para registrar acesso do usuário
export const useAccessLog = (currentUser, currentPage = '/') => {
  useEffect(() => {
    const logAccess = async () => {
      try {
        // Verificar se Supabase está disponível antes de tentar registrar
        // Se houver erro de rede, apenas ignora silenciosamente
        
        // Obter dados do perfil se usuário estiver logado
        let userCity = null
        let userName = null
        let userState = null

        if (currentUser && !currentUser?.isGuest) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('city, state, full_name')
              .eq('id', currentUser.id)
              .maybeSingle()

            if (profile) {
              userCity = profile.city
              userState = profile.state
              userName = profile.full_name
            }
          } catch (err) {
            // Ignorar erro de perfil silenciosamente
            console.debug('Perfil não disponível')
          }
        }

        // Para usuários convidados, não registrar no Supabase
        if (currentUser?.isGuest) {
          console.log('👤 Acesso como convidado:', currentPage)
          return
        }

        // Criar ID de sessão único
        let sessionId = sessionStorage.getItem('cyberlife_session_id')
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          sessionStorage.setItem('cyberlife_session_id', sessionId)
        }

        // Registrar log de acesso - não bloqueia se falhar
        try {
          const { error } = await supabase
            .from('access_logs')
            .insert([{
              user_id: currentUser?.id || null,
              user_email: currentUser?.email || null,
              user_name: userName,
              city: userCity,
              state: userState,
              user_agent: navigator.userAgent,
              page_visited: currentPage,
              session_id: sessionId
            }])

          if (error) {
            console.debug('Log não registrado:', error.message)
          } else {
            console.log('✅ Acesso registrado:', { page: currentPage, user: currentUser?.email || 'anônimo' })
          }
        } catch (networkError) {
          // Ignorar erros de rede completamente
          console.debug('Supabase não disponível - continuando sem logs')
        }
      } catch (error) {
        // Nunca deixar erro de log quebrar a aplicação
        console.debug('Erro ao registrar acesso:', error.message)
      }
    }

    // Registrar acesso após 1 segundo (evitar registros duplicados rápidos)
    const timer = setTimeout(logAccess, 1000)

    return () => clearTimeout(timer)
  }, [currentUser, currentPage])
}

export default useAccessLog
