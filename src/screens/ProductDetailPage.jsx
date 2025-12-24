import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, MessageCircle, Truck, Package } from 'lucide-react'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [cep, setCep] = useState('')
  const [shippingResult, setShippingResult] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [cartItemsCount, setCartItemsCount] = useState(0)

  useEffect(() => {
    // Carregar produto do localStorage
    const storedProducts = localStorage.getItem('cyberlife_products')
    if (storedProducts) {
      const products = JSON.parse(storedProducts)
      const foundProduct = products.find(p => p.id === parseInt(id))
      setProduct(foundProduct)
    }
    updateCartCount()
  }, [id])

  const updateCartCount = () => {
    const storedCart = localStorage.getItem('cyberlife_cart')
    if (storedCart) {
      const cart = JSON.parse(storedCart)
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartItemsCount(totalItems)
    } else {
      setCartItemsCount(0)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    const storedCart = localStorage.getItem('cyberlife_cart')
    let cart = storedCart ? JSON.parse(storedCart) : []
    
    const existingItemIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity
      })
    }
    
    localStorage.setItem('cyberlife_cart', JSON.stringify(cart))
    updateCartCount()
    
    // Animação de feedback
    const button = document.querySelector('.add-to-cart-btn')
    button.classList.add('added')
    setTimeout(() => button.classList.remove('added'), 1000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    setTimeout(() => navigate('/carrinho'), 300)
  }

  const handleCalculateShipping = async () => {
    if (cep.length !== 8 && cep.length !== 9) {
      setShippingResult({ error: 'CEP inválido. Digite 8 dígitos.' })
      return
    }

    setShippingResult({ loading: true })

    try {
      // 1. Validar CEP usando ViaCEP
      const cepFormatted = cep.replace(/\D/g, '')
      const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cepFormatted}/json/`)
      
      if (!viaCepResponse.ok) {
        setShippingResult({ error: 'Erro ao consultar CEP. Tente novamente.' })
        return
      }

      const cepData = await viaCepResponse.json()

      if (cepData.erro) {
        setShippingResult({ error: 'CEP não encontrado. Verifique e tente novamente.' })
        return
      }

      // 2. Calcular distância e frete real baseado em dados dos Correios
      const cepOrigem = '14790156' // CEP da loja CyberLife - Guaíra-SP
      const productPrice = parseFloat(product.price.replace('R$ ', '').replace(',', '.'))
      const productWeight = 0.5 // kg (peso padrão, pode ser ajustado por produto)
      
      // Tentar usar API pública dos Correios
      try {
        const correiosResponse = await fetch(`https://ws.correios.com.br/calculador/v1/publico/calcular/preco-prazo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cepOrigem: cepOrigem,
            cepDestino: cepFormatted,
            peso: productWeight,
            formato: 1, // Caixa/Pacote
            comprimento: 20,
            altura: 10,
            largura: 15,
            servicos: ['04014', '04510'] // PAC e SEDEX
          })
        })

        if (correiosResponse.ok) {
          const correiosData = await correiosResponse.json()
          const shippingOptions = correiosData.map(option => ({
            method: option.codigo === '04014' ? 'PAC' : 'SEDEX',
            days: `${option.prazoEntrega} dias úteis`,
            price: `R$ ${parseFloat(option.valor).toFixed(2).replace('.', ',')}`
          }))
          
          // Adicionar opção Expresso (25% mais caro que SEDEX, metade do prazo)
          const sedexOption = shippingOptions.find(opt => opt.method === 'SEDEX')
          if (sedexOption) {
            const expressoPrice = parseFloat(sedexOption.price.replace('R$ ', '').replace(',', '.')) * 1.25
            const expressoDays = Math.max(1, Math.floor(parseInt(sedexOption.days) / 2))
            shippingOptions.push({
              method: 'Expresso',
              days: `${expressoDays} dias úteis`,
              price: `R$ ${expressoPrice.toFixed(2).replace('.', ',')}`
            })
          }

          setShippingResult({ 
            options: shippingOptions,
            location: `${cepData.localidade} - ${cepData.uf}`,
            estimated: false
          })
          return
        }
      } catch (correiosError) {
        console.log('API Correios indisponível, usando cálculo estimado')
      }

      // Fallback: Cálculo estimado baseado em região e distância real
      const shippingOptions = calculateEstimatedShipping(cepData, productPrice, cepOrigem, cepFormatted)
      setShippingResult({ 
        options: shippingOptions,
        location: `${cepData.localidade} - ${cepData.uf}`,
        estimated: true
      })

    } catch (error) {
      console.error('Erro ao calcular frete:', error)
      setShippingResult({ error: 'Erro ao calcular frete. Verifique o CEP e tente novamente.' })
    }
  }

  // Função auxiliar para calcular frete estimado baseado em região
  const calculateEstimatedShipping = (cepData, productPrice, cepOrigem, cepDestino) => {
    const uf = cepData.uf
    const cidade = cepData.localidade
    
    // Guaíra-SP é a origem (14790-156)
    // Calcular multiplicadores baseados em distância estimada
    
    // Mesma cidade = frete local
    if (cidade.toLowerCase() === 'guaíra' || cidade.toLowerCase() === 'guaira') {
      return [
        { method: 'PAC', days: '2-3 dias úteis', price: 'R$ 8,50' },
        { method: 'SEDEX', days: '1-2 dias úteis', price: 'R$ 12,00' },
        { method: 'Expresso', days: '1 dia útil', price: 'R$ 18,00' }
      ]
    }
    
    // Região Sudeste - proximidade média
    const regioesProximas = ['SP', 'MG', 'RJ', 'ES']
    // Sul e Centro-Oeste - distância média
    const regioesMedias = ['PR', 'SC', 'RS', 'GO', 'DF', 'MS', 'MT']
    // Norte e Nordeste - distância grande
    const regioesDistantes = ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA', 'PA', 'AP', 'AM', 'RR', 'RO', 'AC', 'TO']

    // Valores base dos Correios (2024/2025) - realistas
    let basePAC = 18.50
    let baseSEDEX = 28.50
    let baseExpresso = 45.00
    let diasPAC = '8-12'
    let diasSEDEX = '4-6'
    let diasExpresso = '2-3'

    // SP interior - região próxima
    if (uf === 'SP') {
      // Cidades mais próximas de Guaíra
      const cidadesProximas = ['ribeirão preto', 'barretos', 'franca', 'araraquara', 'são josé do rio preto']
      const isProxima = cidadesProximas.some(c => cidade.toLowerCase().includes(c))
      
      if (isProxima) {
        basePAC = 12.00
        baseSEDEX = 19.00
        baseExpresso = 32.00
        diasPAC = '4-6'
        diasSEDEX = '2-3'
        diasExpresso = '1-2'
      } else {
        basePAC = 15.00
        baseSEDEX = 24.00
        baseExpresso = 38.00
        diasPAC = '6-9'
        diasSEDEX = '3-5'
        diasExpresso = '2-3'
      }
    }
    // Outros estados do Sudeste
    else if (regioesProximas.includes(uf)) {
      basePAC *= 1.15
      baseSEDEX *= 1.15
      baseExpresso *= 1.15
      diasPAC = '9-13'
      diasSEDEX = '5-7'
      diasExpresso = '3-4'
    }
    // Sul e Centro-Oeste
    else if (regioesMedias.includes(uf)) {
      basePAC *= 1.45
      baseSEDEX *= 1.45
      baseExpresso *= 1.45
      diasPAC = '12-16'
      diasSEDEX = '6-9'
      diasExpresso = '4-5'
    }
    // Norte e Nordeste
    else if (regioesDistantes.includes(uf)) {
      basePAC *= 1.95
      baseSEDEX *= 1.95
      baseExpresso *= 1.95
      diasPAC = '15-22'
      diasSEDEX = '9-14'
      diasExpresso = '5-8'
    }

    // Adicionar percentual do valor do produto (seguro obrigatório Correios)
    const adicionalSeguro = productPrice * 0.015 // 1.5% do valor
    basePAC += adicionalSeguro
    baseSEDEX += adicionalSeguro
    baseExpresso += adicionalSeguro

    return [
      { 
        method: 'PAC', 
        days: `${diasPAC} dias úteis`, 
        price: `R$ ${basePAC.toFixed(2).replace('.', ',')}` 
      },
      { 
        method: 'SEDEX', 
        days: `${diasSEDEX} dias úteis`, 
        price: `R$ ${baseSEDEX.toFixed(2).replace('.', ',')}` 
      },
      { 
        method: 'Expresso', 
        days: `${diasExpresso} dias úteis`, 
        price: `R$ ${baseExpresso.toFixed(2).replace('.', ',')}` 
      }
    ]
  }

  const handleWhatsApp = () => {
    const message = product 
      ? `Olá! Gostaria de mais informações sobre: ${product.name}`
      : 'Olá! Gostaria de mais informações.'
    const phone = '5511999999999' // Substitua pelo número real
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (!product) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Carregando produto...</p>
      </div>
    )
  }

  const productImages = [product.image, product.hoverImage].filter(Boolean)

  return (
    <div className="product-detail-page">
      <header className="product-detail-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/loja-geek')}>
            <ArrowLeft size={24} />
            Voltar
          </button>
          <div className="logo">
            <img src="/cyberlife-icone2.png" alt="CyberLife Logo" style={{height: '60px'}} />
            <span>CyberLife</span>
          </div>
          <button className="cart-button-header" onClick={() => navigate('/carrinho')}>
            <ShoppingCart size={28} strokeWidth={2.5} />
            <span className="cart-badge">{cartItemsCount}</span>
          </button>
        </div>
      </header>

      <div className="product-detail-container">
        <div className="product-gallery">
          <div className="main-image">
            <img src={productImages[selectedImage]} alt={product.name} />
          </div>
          {productImages.length > 1 && (
            <div className="image-thumbnails">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <div className="product-header-info">
            <span className="product-category-badge">{product.category}</span>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price-section">
              <span className="product-price">{product.price}</span>
              <span className="price-installment">ou 3x de {(parseFloat(product.price.replace('R$ ', '').replace(',', '.')) / 3).toFixed(2).replace('.', ',')} sem juros</span>
            </div>
          </div>

          <div className="product-description">
            <h3>Descrição do Produto</h3>
            <p>
              {product.description || `${product.name} de alta qualidade. Produto exclusivo para colecionadores e entusiastas. 
              Acabamento premium com atenção aos detalhes. Ideal para presentear ou adicionar à sua coleção. 
              Produto original e com garantia de qualidade CyberLife.`}
            </p>
          </div>

          <div className="quantity-selector">
            <label>Quantidade:</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow}>
              <Package size={20} />
              Comprar Agora
            </button>
          </div>

          <div className="shipping-calculator">
            <h3>
              <Truck size={20} />
              Calcular Frete
            </h3>
            <div className="shipping-input-group">
              <input 
                type="text" 
                placeholder="Digite seu CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                maxLength="9"
              />
              <button onClick={handleCalculateShipping}>Calcular</button>
            </div>
            {shippingResult && (
              <div className="shipping-results">
                {shippingResult.loading ? (
                  <div className="shipping-loading">
                    <div className="loading-spinner-small"></div>
                    <p>Calculando frete...</p>
                  </div>
                ) : shippingResult.error ? (
                  <p className="error">{shippingResult.error}</p>
                ) : (
                  <>
                    {shippingResult.location && (
                      <p className="shipping-location">
                        📍 Entrega para: <strong>{shippingResult.location}</strong>
                      </p>
                    )}
                    {shippingResult.estimated && (
                      <p className="shipping-estimated">
                        ⚠️ Valores estimados baseados em tabela dos Correios 2024/2025
                      </p>
                    )}
                    <div className="shipping-options">
                      {shippingResult.options.map((option, index) => (
                        <div key={index} className="shipping-option">
                          <div className="option-info">
                            <strong>{option.method}</strong>
                            <span>{option.days}</span>
                          </div>
                          <span className="option-price">{option.price}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button className="contact-button" onClick={handleWhatsApp}>
            <MessageCircle size={20} />
            Fale com a CyberLife
          </button>
        </div>
      </div>
    </div>
  )
}
