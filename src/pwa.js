// src/pwa.js
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
        })
        .catch(error => {
          console.log('Falha ao registrar o Service Worker:', error);
        });
    });
  }
};

export const unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
};

// Função para solicitar permissão de notificação push
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
};

// Função para verificar se o app está instalado
export const isPWAInstalled = () => {
  return (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
};

// Função para verificar suporte a PWA
export const checkPWASupport = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Função para mostrar mensagem de instalação
export const showInstallPrompt = () => {
  // Verifica se o evento beforeinstallprompt está disponível
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    return window.deferredPrompt.userChoice
      .then(choiceResult => {
        window.deferredPrompt = null;
        return choiceResult.outcome;
      });
  }
  return Promise.resolve('not_available');
};

// Função para detectar se o usuário pode instalar o PWA
export const canInstallPWA = () => {
  return !!window.deferredPrompt;
};

// Event listener para capturar o evento de instalação
window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o popup padrão de instalação
  e.preventDefault();
  // Guarda o evento para que possa ser acionado mais tarde
  window.deferredPrompt = e;
});