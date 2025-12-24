import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Users, Clock, MapPin, Monitor, Calendar, TrendingUp } from 'lucide-react'
import './AccessLogsView.css'

export default function AccessLogsView() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({
    totalAccess: 0,
    uniqueUsers: 0,
    topStates: [],
    recentAccess: []
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'logged', 'anonymous'

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('access_logs')
        .select('*')
        .order('access_date', { ascending: false })
        .limit(100)

      if (filter === 'logged') {
        query = query.not('user_id', 'is', null)
      } else if (filter === 'anonymous') {
        query = query.is('user_id', null)
      }

      const { data, error } = await query

      if (error) throw error

      setLogs(data || [])

      // Calcular estatísticas
      const totalAccess = data?.length || 0
      const uniqueUsers = new Set(data?.filter(l => l.user_id).map(l => l.user_id)).size

      const stateCount = {}
      data?.forEach(log => {
        if (log.state) {
          stateCount[log.state] = (stateCount[log.state] || 0) + 1
        }
      })

      const topStates = Object.entries(stateCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([state, count]) => ({ state, count }))

      setStats({
        totalAccess,
        uniqueUsers,
        topStates,
        recentAccess: data?.slice(0, 10) || []
      })
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="access-logs-view">
      <div className="logs-header">
        <h2>📊 Logs de Acesso</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={filter === 'logged' ? 'active' : ''}
            onClick={() => setFilter('logged')}
          >
            Logados
          </button>
          <button
            className={filter === 'anonymous' ? 'active' : ''}
            onClick={() => setFilter('anonymous')}
          >
            Anônimos
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.totalAccess}</div>
            <div className="stat-label">Total de Acessos</div>
          </div>
        </div>

        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.uniqueUsers}</div>
            <div className="stat-label">Usuários Únicos</div>
          </div>
        </div>

        <div className="stat-card">
          <MapPin className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.topStates[0]?.state || 'N/A'}</div>
            <div className="stat-label">Estado Mais Ativo</div>
          </div>
        </div>
      </div>

      {/* Top Estados */}
      {stats.topStates.length > 0 && (
        <div className="top-states">
          <h3>🗺️ Top Estados</h3>
          <div className="states-list">
            {stats.topStates.map(({ state, count }) => (
              <div key={state} className="state-item">
                <span className="state-name">{state}</span>
                <div className="state-bar">
                  <div
                    className="state-bar-fill"
                    style={{ width: `${(count / stats.totalAccess) * 100}%` }}
                  />
                </div>
                <span className="state-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Logs */}
      <div className="logs-table-container">
        <h3>📋 Últimos Acessos</h3>
        {loading ? (
          <div className="loading">Carregando logs...</div>
        ) : logs.length === 0 ? (
          <div className="no-logs">Nenhum acesso registrado</div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th><Users size={16} /> Usuário</th>
                <th><Calendar size={16} /> Data/Hora</th>
                <th><MapPin size={16} /> Local</th>
                <th><Monitor size={16} /> Página</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-name">
                        {log.user_name || log.user_email || 'Anônimo'}
                      </div>
                      {log.user_email && (
                        <div className="user-email">{log.user_email}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      {formatDate(log.access_date)}
                    </div>
                  </td>
                  <td>
                    <div className="location-cell">
                      {log.city && log.state ? (
                        `${log.city} - ${log.state}`
                      ) : (
                        <span className="no-data">Não informado</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="page-cell">
                      <code>{log.page_visited || '/'}</code>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
