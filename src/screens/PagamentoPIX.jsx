import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function PagamentoPIX() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutos em segundos
  const [pixCopied, setPixCopied] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chave PIX fornecida
  const pixKey = '433f47be-5ba8-4c77-a98d-b9a4bdbe3238';

  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) {
        navigate('/carrinho');
        return;
      }

      try {
        // Buscar dados do pedido
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              product_name,
              product_price,
              quantity,
              subtotal
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        setOrderData(order);
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
        alert('Pedido não encontrado');
        navigate('/carrinho');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, navigate]);

  useEffect(() => {
    if (!orderData || loading) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Tempo expirado! Redirecionando para o carrinho.');
          navigate('/carrinho');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderData, navigate, loading]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    });
  };

  const handlePaymentConfirmation = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'confirmed',
          order_status: 'processing'
        })
        .eq('id', orderId);

      if (error) throw error;

      alert('Pagamento confirmado com sucesso! Obrigado por comprar conosco.');
      navigate('/');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Erro ao confirmar pagamento');
    }
  };

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  if (loading) {
    return (
      <div className="pagamento-pix-container">
        <div className="pagamento-pix-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Carregando dados do pedido...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="pagamento-pix-container">
      <div className="pagamento-pix-content">
        <div className="pagamento-header">
          <div className="pagamento-status">
            <div className="status-indicator pending"></div>
            <h2>Aguardando Pagamento</h2>
          </div>
          <div className="timer">
            <span>Tempo restante: {formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="order-summary">
          <h3>Resumo do Pedido</h3>
          <div className="order-details">
            <div className="order-id">
              <strong>Pedido: #{orderData.id}</strong>
            </div>
            <div className="order-items">
              {orderData.order_items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.product_name}</span>
                  <span>{item.quantity}x {formatPrice(item.product_price)}</span>
                </div>
              ))}
            </div>
            {orderData.discount_amount > 0 && (
              <div className="order-discount">
                <span>Desconto ({orderData.coupon_code}):</span>
                <span>-{formatPrice(orderData.discount_amount)}</span>
              </div>
            )}
            <div className="order-total">
              <strong>
                <span>Total:</span>
                <span>{formatPrice(orderData.final_amount)}</span>
              </strong>
            </div>
          </div>
        </div>

        <div className="pix-payment-section">
          <h3>Pagamento via PIX</h3>
          
          <div className="pix-qr-placeholder">
            <div className="qr-code-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
                <rect x="15" y="15" width="2" height="2" fill="currentColor"/>
                <rect x="18" y="15" width="2" height="2" fill="currentColor"/>
                <rect x="15" y="18" width="2" height="2" fill="currentColor"/>
                <rect x="18" y="18" width="2" height="2" fill="currentColor"/>
              </svg>
            </div>
            <p>QR Code PIX</p>
            <small>Escaneie com seu banco ou carteira digital</small>
          </div>

          <div className="pix-key-section">
            <h4>Ou copie a chave PIX:</h4>
            <div className="pix-key-container">
              <input 
                type="text" 
                value={pixKey} 
                readOnly 
                className="pix-key-input"
              />
              <button 
                onClick={copyPixKey}
                className={`copy-button ${pixCopied ? 'copied' : ''}`}
              >
                {pixCopied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="payment-instructions">
            <h4>Como pagar:</h4>
            <ol>
              <li>Abra o app do seu banco ou carteira digital</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole a chave PIX</li>
              <li>Confirme o pagamento de {formatPrice(orderData.final_amount)}</li>
              <li>O pagamento será confirmado automaticamente</li>
            </ol>
          </div>

          <div className="payment-info">
            <div className="info-item">
              <strong>Valor:</strong> {formatPrice(orderData.final_amount)}
            </div>
            <div className="info-item">
              <strong>Favorecido:</strong> CyberLife Store
            </div>
            <div className="info-item">
              <strong>Chave PIX:</strong> {pixKey}
            </div>
          </div>
        </div>

        <div className="pagamento-actions">
          <button 
            onClick={() => navigate('/carrinho')} 
            className="btn-voltar"
          >
            Voltar ao Carrinho
          </button>
          <button 
            onClick={handlePaymentConfirmation}
            className="btn-confirmar"
          >
            Já fiz o pagamento
          </button>
        </div>

        <div className="pagamento-footer">
          <p>
            <strong>Importante:</strong> Mantenha esta página aberta até confirmar o pagamento.
            O pedido será cancelado automaticamente se não for pago em 15 minutos.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PagamentoPIX;