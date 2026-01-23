import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { stopAudio } from '../utils/audioPlayer';

export default function CarrinhoPage({ onBack }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // Parar a música ao entrar nesta tela
  useEffect(() => {
    stopAudio()
  }, [])

  useEffect(() => {
    // Carregar carrinho do localStorage
    const storedCart = localStorage.getItem('cyberlife_cart');
    setCartItems(storedCart ? JSON.parse(storedCart) : []);
  }, []);

  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cyberlife_cart', JSON.stringify(newCart));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const handleRemoveItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    updateCart(updatedCart);
  };

  const handleClearCart = () => {
    if (confirm('Deseja realmente limpar o carrinho?')) {
      updateCart([]);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace('R$', '').replace(',', '.').trim())
        : parseFloat(item.price);
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  // Calcular CyberPoints que serão ganhos com a compra (sem frete)
  const calculateCyberPoints = () => {
    let totalPoints = 0;

    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      
      // Se o produto tem reward_points customizado, usar ele
      if (item.reward_points && item.reward_points > 0) {
        totalPoints += item.reward_points * item.quantity;
      } else {
        // Caso contrário, usar a regra padrão: R$50 = 2 pontos
        const pointsForThisItem = Math.floor((itemTotal / 50) * 2);
        totalPoints += pointsForThisItem;
      }
    });

    return totalPoints;
  };

  const cyberPointsToEarn = calculateCyberPoints();

  const [userPoints, setUserPoints] = useState(0);
  const [usingCyberPoints, setUsingCyberPoints] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'success', 'error', 'info'
  const [showPopup, setShowPopup] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);

  // Função para exibir popup personalizado
  const showCustomPopup = (message, type, showBuyButton = false) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setShowBuyButton(showBuyButton);

    // Fechar o popup automaticamente após 5 segundos
    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  // Carregar pontos do usuário
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('cyber_points')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar pontos do usuário:', error);
        } else {
          setUserPoints(profile.cyber_points || 0);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleCheckout = async () => {
    if (usingCyberPoints) {
      // Calcular valor total em reais
      const totalValue = cartItems.reduce((total, item) => {
        const price = typeof item.price === 'string'
          ? parseFloat(item.price.replace('R$', '').replace(',', '.').trim())
          : parseFloat(item.price);
        return total + (price * item.quantity);
      }, 0);

      // Converter para cyberpoints (1 real = 1 cyberpoint, por exemplo)
      const totalInCyberPoints = Math.round(totalValue);

      // Verificar se o usuário tem pontos suficientes
      if (userPoints < totalInCyberPoints) {
        showCustomPopup(`Você não tem CyberPoints suficientes para esta compra.\nNecessário: ${totalInCyberPoints} CyberPoints\nSeu saldo: ${userPoints} CyberPoints`, 'error', true);
        return;
      }

      // Confirmar pagamento com cyberpoints
      const confirmPayment = window.confirm(`Você está prestes a pagar ${totalInCyberPoints} CyberPoints pelo seu pedido. Deseja confirmar?`);

      if (confirmPayment) {
        // Processar pagamento com cyberpoints
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Atualizar saldo de cyberpoints do usuário
          const newBalance = userPoints - totalInCyberPoints;
          const { error } = await supabase
            .from('profiles')
            .update({ cyber_points: newBalance })
            .eq('id', user.id);

          if (error) {
            console.error('Erro ao atualizar pontos do usuário:', error);
            showCustomPopup('Erro ao processar pagamento com CyberPoints. Tente novamente.', 'error');
            return;
          }

          // Registrar histórico de transação
          const currentProfile = await supabase
            .from('profiles')
            .select('cyber_points')
            .eq('id', user.id)
            .single();

          const currentBalance = currentProfile.data?.cyber_points || 0;
          const updatedBalance = Math.max(0, currentBalance - totalInCyberPoints);

          await supabase
            .from('cyber_points_history')
            .insert([{
              user_id: user.id,
              points: -totalInCyberPoints,
              type: 'spent',
              source: 'purchase',
              description: `Pagamento por produto(s) no carrinho`,
              balance_before: currentBalance,
              balance_after: updatedBalance,
              created_at: new Date().toISOString()
            }]);

          // Atualizar estado local
          setUserPoints(updatedBalance);

          // Limpar carrinho e redirecionar
          localStorage.removeItem('cyberlife_cart');
          updateCart([]);
          showCustomPopup('Pagamento realizado com sucesso usando CyberPoints!', 'success');
          navigate('/perfil');
        }
      }
    } else {
      // Navegar para pagamento tradicional
      navigate('/pagamento-pix');
    }
  };

  return (
    <div className="carrinho-page">
      <header className="header">
        <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img src="/cyberlife-icone2.png" alt="CyberLife Logo" style={{height: '80px', verticalAlign: 'middle'}} />
          <span style={{fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#00d9ff', letterSpacing: '2px'}}>CyberLife</span>
        </div>
        <nav className="nav">
          <button className="nav-button" onClick={() => onBack ? onBack() : navigate('/loja-geek')}>Voltar à Loja</button>
          <button className="nav-button">Contato</button>
        </nav>
      </header>

      <section className="carrinho-container">
        <div className="carrinho-header">
          <h1 className="carrinho-title" style={{marginTop: '48px'}}>
            <ShoppingCart size={40} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Meu Carrinho
          </h1>
          <p className="carrinho-subtitle">
            {cartItems.length === 0 
              ? 'Seu carrinho está vazio' 
              : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'} no carrinho`
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="carrinho-empty">
            <div className="empty-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L7.17 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4H16.83L15 2H9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>Carrinho Vazio</h2>
            <p>Adicione produtos incríveis da nossa loja!</p>
            <button className="btn-back-shop" onClick={() => {
              if (onBack) {
                onBack();
                sessionStorage.setItem('scrollToCatalog', 'true');
              } else {
                navigate('/loja-geek');
              }
            }}>
              Explorar Produtos
            </button>
          </div>
        ) : (
          <div className="carrinho-content">
            <div className="carrinho-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {item.model_3d ? (
                      <model-viewer
                        src={item.model_3d?.replace('https://tvukdcbvqweechmawdac.supabase.co/storage/v1/object/public/product-3d-models/', '/models/3d/') || item.model_3d}
                        alt={`Modelo 3D de ${item.name}`}
                        shadow-intensity="1"
                        disable-pan
                        disable-zoom
                        camera-orbit="90deg 75deg 2.5m"
                        field-of-view="30deg"
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                        }}
                      />
                    ) : item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.name} />
                    ) : item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#666'
                      }}>
                        📦
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <span className="item-category">{item.category}</span>
                    <span className="item-price">{item.price}</span>
                  </div>
                  <div className="item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="item-total">
                    R$ {((typeof item.price === 'string' 
                      ? parseFloat(item.price.replace('R$', '').replace(',', '.').trim())
                      : parseFloat(item.price)) * item.quantity).toFixed(2).replace('.', ',')}
                  </div>
                  <button 
                    className="item-remove"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="carrinho-summary">
              <h2 className="summary-title">Resumo do Pedido</h2>
              
              <div className="summary-line">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <div className="summary-line">
                <span>Frete</span>
                <span>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-total">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              {/* CyberPoints que serão ganhos */}
              {cyberPointsToEarn > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
                  border: '2px solid rgba(102, 126, 234, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                }}>
                  <div style={{
                    fontSize: '32px',
                    animation: 'float 3s ease-in-out infinite'
                  }}>
                    🎮
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginBottom: '4px',
                      fontFamily: 'Rajdhani, sans-serif'
                    }}>
                      Você vai ganhar:
                    </div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      color: '#667eea',
                      fontFamily: 'Rajdhani, sans-serif',
                      textShadow: '0 2px 10px rgba(102, 126, 234, 0.5)'
                    }}>
                      +{cyberPointsToEarn} CyberPoints
                    </div>
                  </div>
                </div>
              )}

              {/* Opção de pagamento com CyberPoints */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(0, 255, 136, 0.15))',
                border: '2px solid rgba(0, 217, 255, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 15px rgba(0, 217, 255, 0.2)'
              }}>
                <input
                  type="checkbox"
                  id="useCyberPoints"
                  checked={usingCyberPoints}
                  onChange={(e) => setUsingCyberPoints(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="useCyberPoints" style={{
                  flex: 1,
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1rem',
                  color: '#fff'
                }}>
                  <div style={{fontWeight: 'bold', color: '#00d9ff'}}>Pagar com CyberPoints</div>
                  <div style={{fontSize: '0.9rem', color: '#ccc'}}>Saldo disponível: {userPoints} CyberPoints</div>
                </label>
              </div>

              <button className="btn-checkout" onClick={handleCheckout}>
                {usingCyberPoints ? `Pagar ${Math.round(total)} CyberPoints` : 'Finalizar Compra'}
              </button>

              <button className="btn-clear" onClick={handleClearCart}>
                Limpar Carrinho
              </button>

              {/* Componente de Popup Personalizado */}
              {showPopup && (
                <div style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  zIndex: 10000,
                  maxWidth: '400px',
                  animation: 'slideInRight 0.3s ease-out'
                }}>
                  <div style={{
                    background: popupType === 'success' ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.9) 0%, rgba(0, 153, 204, 0.9) 100%)' :
                             popupType === 'error' ? 'linear-gradient(135deg, rgba(255, 0, 234, 0.9) 0%, rgba(255, 0, 138, 0.9) 100%)' :
                             'linear-gradient(135deg, rgba(0, 217, 255, 0.9) 0%, rgba(255, 0, 234, 0.9) 100%)',
                    color: '#fff',
                    padding: '15px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 217, 255, 0.3)',
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        fontSize: '1.4rem',
                        fontWeight: 'normal'
                      }}>
                        {popupType === 'success' ? '✅' :
                         popupType === 'error' ? '⚠️' : 'ℹ️'}
                      </span>
                      <span style={{
                        flex: 1,
                        lineHeight: '1.4',
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                      }}>
                        {popupMessage}
                      </span>
                      <button
                        onClick={() => setShowPopup(false)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#fff',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {showBuyButton && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '10px'
                      }}>
                        <button
                          onClick={() => navigate('/comprar-cyberpoints')}
                          style={{
                            background: 'linear-gradient(135deg, #00d9ff 0%, #ff00ea 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            boxShadow: '0 5px 15px rgba(0, 217, 255, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 217, 255, 0.4)';
                          }}
                        >
                          Comprar CyberPoints
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="summary-benefits">
                <div className="benefit-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Frete grátis acima de R$ 200</span>
                </div>
                <div className="benefit-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Devolução em até 30 dias</span>
                </div>
                <div className="benefit-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Pagamento 100% seguro</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
