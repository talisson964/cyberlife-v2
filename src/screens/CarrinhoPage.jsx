import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';

export default function CarrinhoPage({ onBack }) {
  const [cartItems, setCartItems] = useState([]);

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
      const price = parseFloat(item.price.replace('R$', '').replace(',', '.').trim());
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="carrinho-page">
      <header className="header">
        <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img src="/cyberlife-icone2.png" alt="CyberLife Logo" style={{height: '80px', verticalAlign: 'middle'}} />
          <span style={{fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#00d9ff', letterSpacing: '2px'}}>CyberLife</span>
        </div>
        <nav className="nav">
          <button className="nav-button" onClick={onBack}>Voltar à Loja</button>
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
              onBack();
              // Sinalizar que deve rolar para o catálogo
              sessionStorage.setItem('scrollToCatalog', 'true');
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
                    <img src={item.image} alt={item.name} />
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
                    R$ {(parseFloat(item.price.replace('R$', '').replace(',', '.').trim()) * item.quantity).toFixed(2).replace('.', ',')}
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

              <button className="btn-checkout">
                Finalizar Compra
              </button>

              <button className="btn-clear" onClick={handleClearCart}>
                Limpar Carrinho
              </button>

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
