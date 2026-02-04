import React, { useState } from 'react'
import { Power } from 'lucide-react'
import { supabase } from '../supabaseClient'
import bgGif from '../imagens/1.gif'

export default function NextScreen({ onNavigate }) {

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Detectar se é mobile ou desktop
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Função para mostrar popup de desenvolvimento
  const showDevelopmentPopup = (featureName) => {
    alert(`${featureName} está em desenvolvimento!`)
  }

  return (
    <div className="next-screen" style={{ backgroundImage: `url(${bgGif})` }}>
      <header className="header">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/cyberlife-icone2.png"
            alt="CyberLife Logo"
            style={{ height: '60px', verticalAlign: 'middle' }}
            loading="lazy"
            decoding="async"
          />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.7rem', color: '#00d9ff', letterSpacing: '2px' }}>CyberLife</span>
        </div>
        <nav className="nav">
          <button className="nav-button">Início</button>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Fazer logout"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00d9ff',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => e.target.style.backgroundColor = 'rgba(0, 217, 255, 0.08)'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            <Power size={24} color="#00d9ff" />
          </button>
        </nav>
      </header>
      <div className="menu-container">
        <div className="menu-item" onClick={() => onNavigate('gamer-world')}>
          <h2>Gamer World</h2>
        </div>
      </div>

    </div>
  )
}
