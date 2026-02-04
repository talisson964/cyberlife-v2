import React from 'react';

const DownloadAppButton = () => {
  const handleDownloadApp = () => {
    // Aqui você pode adicionar a lógica para direcionar o usuário para a página de download
    // Por enquanto, vou deixar um alerta como placeholder
    alert('Funcionalidade de download do app em desenvolvimento!');

    // Exemplo de como seria implementado futuramente:
    // window.open('https://play.google.com/store/apps/details?id=com.cyberlife', '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px', // Posicionado logo abaixo do cabeçalho (assumindo altura de 60px)
        right: '20px',
        zIndex: 10000, // Garante que fique acima de outros elementos
        pointerEvents: 'auto', // Permite interações com o botão
      }}
    >
      <button
        onClick={handleDownloadApp}
        style={{
          background: 'linear-gradient(135deg, #00d9ff 0%, #e322bc 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '30px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0, 217, 255, 0.3), 0 0 15px rgba(227, 34, 188, 0.3)',
          transition: 'all 0.3s ease',
          fontFamily: 'Rajdhani, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          opacity: 0.9, // Menos opacidade
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px) scale(1.05)';
          e.target.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.5), 0 0 20px rgba(227, 34, 188, 0.5)';
          e.target.style.opacity = '1'; // Mais opaco no hover
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 217, 255, 0.3), 0 0 15px rgba(227, 34, 188, 0.3)';
          e.target.style.opacity = '0.9'; // Opacidade normal
        }}
      >
        Baixar App
      </button>
    </div>
  );
};

export default DownloadAppButton;