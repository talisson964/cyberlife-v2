import React, { useState } from 'react'
import { Power } from 'lucide-react'
import { supabase } from '../supabaseClient'
import bgGif from '../imagens/1.gif'

export default function NextScreen({ onNavigate }){
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const showDevelopmentPopup = (storeName) => {
    setPopupMessage(`⚠️ Atenção: ${storeName} está em desenvolvimento e temporariamente bloqueada!`);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage('');
  };

  return (
    <div className="next-screen" style={{backgroundImage:`url(${bgGif})`}}>
      <header className="header">
        <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img
            src="/cyberlife-icone2.png"
            alt="CyberLife Logo"
            style={{height: '60px', verticalAlign: 'middle'}}
            loading="lazy"
            decoding="async"
          />
          <span style={{fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.7rem', color: '#00d9ff', letterSpacing: '2px'}}>CyberLife</span>
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
        <div className="menu-item" onClick={() => showDevelopmentPopup('Loja Geek')}>
          <h2>Loja Geek</h2>
        </div>
        <div className="menu-item" onClick={() => onNavigate('gamer-world')}>
          <h2>Gamer World</h2>
        </div>
        <div className="menu-item" onClick={() => showDevelopmentPopup('Loja Smart Home')}>
          <h2>Smart Home</h2>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }} onClick={closePopup}>
          <div className="popup-content" style={{
            backgroundColor: '#1a1a2e',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '80%',
            textAlign: 'center',
            border: '2px solid #00d9ff',
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              color: '#00d9ff',
              marginBottom: '15px',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.5rem'
            }}>⚠️ Aviso de Desenvolvimento</h3>
            <p style={{
              color: '#ffffff',
              fontSize: '1.1rem',
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>{popupMessage}</p>
            <button
              onClick={closePopup}
              style={{
                backgroundColor: '#00d9ff',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
