import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { stopAudio } from '../utils/audioPlayer';
import { supabase } from '../supabaseClient';

export default function CarrinhoPage({ onBack }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  // Parar a música ao entrar nesta tela
  useEffect(() => {
    stopAudio()
  }, [])

  useEffect(() => {
    // Carregar carrinho do localStorage
    const storedCart = localStorage.getItem('cyberlife_cart');
    let cartData = storedCart ? JSON.parse(storedCart) : [];
    
    console.log('Dados do carrinho carregados (raw):', cartData);
    
    // Limpar itens sem imagem (de versões antigas)
    const cleanedCart = cartData.map(item => {
      if (!item.image) {
        console.log('⚠️ Item sem imagem detectado:', item);
        return {
          ...item,
          image: '/cyberlife-icone2.png' // Adicionar fallback para itens antigos
        };
      }
      return item;
    });
    
    // Salvar carrinho limpo se houve mudanças
    if (JSON.stringify(cartData) !== JSON.stringify(cleanedCart)) {
      localStorage.setItem('cyberlife_cart', JSON.stringify(cleanedCart));
      console.log('Carrinho limpo e salvo:', cleanedCart);
    }
    
    setCartItems(cleanedCart);
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setLoadingCoupon(true);
    setCouponError('');
    
    try {
      // Buscar cupom no banco de dados
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        setCouponError('Cupom não encontrado ou inativo');
        return;
      }

      // Verificar se o cupom ainda é válido
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        setCouponError('Cupom expirado');
        return;
      }

      // Verificar se atingiu o limite de usos
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        setCouponError('Cupom esgotado');
        return;
      }

      // Verificar valor mínimo do pedido
      if (coupon.min_order_value && subtotal < coupon.min_order_value) {
        setCouponError(`Valor mínimo do pedido: R$ ${coupon.min_order_value.toFixed(2).replace('.', ',')}`);
        return;
      }

      // Aplicar cupom
      setAppliedCoupon({
        code: coupon.code,
        discount: coupon.discount_value,
        type: coupon.discount_type,
        description: coupon.description
      });
      setCouponCode('');
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setCouponError('Erro ao validar cupom');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleFinalizePurchase = async () => {
    if (cartItems.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    try {
      setProcessingPurchase(true);

      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para finalizar a compra.');
        navigate('/login');
        return;
      }

      // Calcular valores finais
      const orderData = {
        user_id: user.id,
        user_email: user.email,
        total_amount: subtotal,
        discount_amount: discount,
        shipping_amount: shipping,
        final_amount: total,
        coupon_code: appliedCoupon?.code || null,
        payment_method: 'pix',
        payment_status: 'pending',
        order_status: 'pending',
        pix_key: '433f47be-5ba8-4c77-a98d-b9a4bdbe3238'
      };

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: typeof item.price === 'string' 
          ? parseFloat(item.price.replace('R$', '').replace(',', '.').trim())
          : parseFloat(item.price),
        quantity: item.quantity,
        subtotal: (typeof item.price === 'string' 
          ? parseFloat(item.price.replace('R$', '').replace(',', '.').trim())
          : parseFloat(item.price)) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Atualizar contador de uso do cupom se aplicado
      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', {
          coupon_code: appliedCoupon.code
        });
      }

      // Limpar carrinho
      localStorage.removeItem('cyberlife_cart');
      setCartItems([]);
      setAppliedCoupon(null);

      // Redirecionar para página de pagamento PIX
      navigate(`/pagamento-pix/${order.id}`);

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      alert('Erro ao finalizar compra: ' + error.message);
    } finally {
      setProcessingPurchase(false);
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
  
  // Calcular desconto do cupom
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else {
      discount = appliedCoupon.discount;
    }
  }
  
  const total = subtotal + shipping - discount;

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
              {cartItems.map((item) => {
                console.log('=== ITEM CARRINHO ===');
                console.log('ID:', item.id);
                console.log('Nome:', item.name);
                console.log('Image:', item.image);
                console.log('Images array:', item.images);
                console.log('Debug image_url:', item.debug_original_image_url);
                console.log('Debug image:', item.debug_original_image);
                console.log('Debug images:', item.debug_original_images);
                console.log('Item completo:', JSON.stringify(item, null, 2));
                console.log('===================');
                
                return (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {/* Teste: forçar uma URL de imagem conhecida para debug */}
                    <img 
                      src={item.image || 'https://via.placeholder.com/120x120/00d9ff/ffffff?text=Produto'} 
                      alt={item.name}
                      onError={(e) => {
                        console.log('❌ ERRO ao carregar imagem:', item.image);
                        console.log('Item que causou erro:', item);
                        e.target.src = '/cyberlife-icone2.png';
                      }}
                      onLoad={(e) => {
                        console.log('✅ Imagem carregada:', e.target.src);
                        if (e.target.src.includes('cyberlife-icone2.png')) {
                          console.log('⚠️ ATENÇÃO: Carregou fallback, não imagem real!');
                        } else if (e.target.src.includes('placeholder')) {
                          console.log('🔧 TESTE: Carregou placeholder porque item.image estava vazio');
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
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
                );
              })}
            </div>

            <div className="carrinho-summary" style={{
              position: 'sticky',
              top: '20px',
              alignSelf: 'flex-start'
            }}>
              <h2 className="summary-title">Resumo do Pedido</h2>
              
              <div className="summary-line">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <div className="summary-line">
                <span>Frete</span>
                <span>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}</span>
              </div>
              
              {/* Seção Cupom */}
              <div className="coupon-section" style={{
                margin: '20px 0',
                padding: '15px',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                borderRadius: '8px',
                background: 'rgba(0, 217, 255, 0.05)'
              }}>
                <h3 style={{
                  color: '#00d9ff',
                  fontSize: '1rem',
                  marginBottom: '10px',
                  fontFamily: 'Rajdhani, sans-serif'
                }}>Cupom de Desconto</h3>
                
                {!appliedCoupon ? (
                  <div className="coupon-input-group" style={{display: 'flex', gap: '10px'}}>
                    <input
                      type="text"
                      placeholder="Digite seu cupom"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '4px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || loadingCoupon}
                      style={{
                        padding: '10px 15px',
                        background: (couponCode.trim() && !loadingCoupon) ? '#00d9ff' : 'rgba(0, 217, 255, 0.3)',
                        color: (couponCode.trim() && !loadingCoupon) ? '#000' : '#888',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (couponCode.trim() && !loadingCoupon) ? 'pointer' : 'not-allowed',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      {loadingCoupon ? 'Verificando...' : 'Aplicar'}
                    </button>
                  </div>
                ) : (
                  <div className="coupon-applied" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 255, 136, 0.3)'
                  }}>
                    <div>
                      <span style={{color: '#00ff88', fontWeight: '600'}}>{appliedCoupon.code}</span>
                      <br />
                      <small style={{color: '#00ff88', opacity: 0.8}}>{appliedCoupon.description}</small>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 0, 0, 0.5)',
                        color: '#ff6666',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remover
                    </button>
                  </div>
                )}
                
                {couponError && (
                  <p style={{
                    color: '#ff6666',
                    fontSize: '0.8rem',
                    margin: '5px 0 0 0'
                  }}>{couponError}</p>
                )}
              </div>
              
              {appliedCoupon && discount > 0 && (
                <div className="summary-line" style={{color: '#00ff88'}}>
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <div className="summary-divider"></div>
              
              <div className="summary-total">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <button 
                className="btn-checkout"
                onClick={handleFinalizePurchase}
                disabled={cartItems.length === 0 || processingPurchase}
              >
                {processingPurchase ? 'Processando compra...' : 'Finalizar Compra'}
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
