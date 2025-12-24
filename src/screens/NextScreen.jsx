import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../supabaseClient'
import bgGif from '../imagens/1.gif'

export default function NextScreen({ onNavigate }){
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }
  return (
    <div className="next-screen" style={{backgroundImage:`url(${bgGif})`}}>
      <header className="header">
        <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img src="/cyberlife-icone2.png" alt="CyberLife Logo" style={{height: '60px', verticalAlign: 'middle'}} />
          <span style={{fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.7rem', color: '#00d9ff', letterSpacing: '2px'}}>CyberLife</span>
        </div>
        <nav className="nav">
          <button className="nav-button">Início</button>
          <button className="nav-button">Contato</button>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            title="Fazer logout"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff1744',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              hover: {
                backgroundColor: 'rgba(255, 23, 68, 0.1)'
              }
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 23, 68, 0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <LogOut size={24} />
          </button>
        </nav>
      </header>
      <div className="menu-container">
        <div className="menu-item" onClick={() => onNavigate('loja-geek')}>
          <h2>Loja Geek</h2>
        </div>
        <div className="menu-item" onClick={() => onNavigate('game-house')}>
          <h2>Game House</h2>
        </div>
        <div className="menu-item">
          <h2>Smart Home</h2>
        </div>
      </div>
    </div>
  )
}
