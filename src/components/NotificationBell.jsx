import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const NotificationBell = ({ userId, showNotification }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [userId]);

  // Fechar painel ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 Nova notificação:', payload.new);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Exibir notificação com o novo design
          if (showNotification) {
            showNotification(payload.new.title || payload.new.message || 'Nova notificação recebida', 'info');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Ícone de notificação */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 234, 0.1) 100%)',
          border: '2px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(255, 0, 234, 0.2) 100%)';
          e.currentTarget.style.borderColor = '#00d9ff';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 234, 0.1) 100%)';
          e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ fontSize: '24px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'linear-gradient(135deg, #00d9ff, #ff00ea)',
            color: '#fff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 0 15px rgba(0, 217, 255, 0.6), 0 0 25px rgba(255, 0, 234, 0.6)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          width: '400px',
          maxHeight: '500px',
          background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.98) 0%, rgba(0, 5, 16, 0.98) 100%)',
          border: '2px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 217, 255, 0.3)',
          overflow: 'hidden',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              color: '#00d9ff',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
            }}>
              Notificações
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 234, 0.1) 100%)',
                  border: '1px solid rgba(0, 217, 255, 0.4)',
                  color: '#00d9ff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(255, 0, 234, 0.2) 100%)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 234, 0.1) 100%)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div style={{
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#888',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  marginBottom: '10px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}>⏳</div>
                <div>Carregando notificações...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#888',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '10px',
                  filter: 'grayscale(100%) opacity(0.7)'
                }}>🔔</div>
                <div>Nenhuma notificação</div>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                  style={{
                    padding: '15px',
                    marginBottom: '8px',
                    background: notification.is_read
                      ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(200, 200, 200, 0.02) 100%)'
                      : 'linear-gradient(90deg, rgba(0, 217, 255, 0.08) 0%, rgba(255, 0, 234, 0.08) 100%)',
                    border: `1px solid ${notification.is_read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 217, 255, 0.2)'}`,
                    borderRadius: '12px',
                    cursor: notification.is_read ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!notification.is_read) {
                      e.currentTarget.style.background = 'linear-gradient(90deg, rgba(0, 217, 255, 0.12) 0%, rgba(255, 0, 234, 0.12) 100%)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.2)';
                    } else {
                      e.currentTarget.style.background = 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(200, 200, 200, 0.05) 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.is_read
                      ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(200, 200, 200, 0.02) 100%)'
                      : 'linear-gradient(90deg, rgba(0, 217, 255, 0.08) 0%, rgba(255, 0, 234, 0.08) 100%)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {!notification.is_read && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      width: '8px',
                      height: '8px',
                      background: 'linear-gradient(135deg, #00d9ff, #ff00ea)',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(0, 217, 255, 0.8), 0 0 15px rgba(255, 0, 234, 0.6)'
                    }} />
                  )}

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '28px' }}>{notification.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        fontSize: '14px',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        color: '#ddd',
                        fontSize: '13px',
                        marginBottom: '6px',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        color: '#888',
                        fontSize: '11px'
                      }}>
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
