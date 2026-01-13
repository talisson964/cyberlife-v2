import React, { useEffect, useState } from 'react';

const PointsNotification = ({ points, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (points) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose && onClose(), 300);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [points, onClose]);

  if (!isVisible || !points) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      padding: '20px 30px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '400px',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          fontSize: '40px',
          animation: 'bounce 0.6s ease-in-out infinite'
        }}>
          🎮
        </div>
        <div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            +{points} CyberPoints
          </div>
          <div style={{
            fontSize: '14px',
            opacity: 0.9
          }}>
            {message || 'Você ganhou pontos!'}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default PointsNotification;
