import React, { useState, useEffect } from 'react';
import AccessLogsView from '../components/AccessLogsView';
import { stopAudio } from '../utils/audioPlayer';

const AdminPanel = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  
  // Estados de pesquisa
  const [searchProduct, setSearchProduct] = useState('');
  const [searchOffer, setSearchOffer] = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  
  // Parar a música ao entrar nesta tela
  useEffect(() => {
    stopAudio()
  }, [])
  
  // Produtos
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    id: Date.now(),
    name: '',
    category: 'Action Figures',
    price: '',
    image: '',
    hoverImage: '',
    description: ''
  });
  
  // Banners promocionais
  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    id: Date.now(),
    title: '',
    discount: '',
    image: ''
  });

  // Eventos
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    id: Date.now(),
    title: '',
    date: '',
    prize: '',
    inscription: '',
    slug: '',
    type: 'Torneio',
    image: ''
  });

  useEffect(() => {
    // Carregar dados do localStorage
    const storedProducts = localStorage.getItem('cyberlife_products');
    const storedOffers = localStorage.getItem('cyberlife_offers');
    const storedEvents = localStorage.getItem('cyberlife_events');
    
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedOffers) setOffers(JSON.parse(storedOffers));
    if (storedEvents) setEvents(JSON.parse(storedEvents));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '251207') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Senha incorreta!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // === PRODUTOS ===
  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = { ...productForm, id: Date.now() };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('cyberlife_products', JSON.stringify(updatedProducts));
    setProductForm({
      id: Date.now(),
      name: '',
      category: 'Action Figures',
      price: '',
      image: '',
      hoverImage: '',
      description: ''
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.id);
    setProductForm(product);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    const updatedProducts = products.map(p => 
      p.id === editingProduct ? productForm : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('cyberlife_products', JSON.stringify(updatedProducts));
    setEditingProduct(null);
    setProductForm({
      id: Date.now(),
      name: '',
      category: 'Action Figures',
      price: '',
      image: '',
      hoverImage: '',
      description: ''
    });
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('cyberlife_products', JSON.stringify(updatedProducts));
    }
  };

  // === OFERTAS ===
  const handleAddOffer = (e) => {
    e.preventDefault();
    const newOffer = { ...offerForm, id: Date.now() };
    const updatedOffers = [...offers, newOffer];
    setOffers(updatedOffers);
    localStorage.setItem('cyberlife_offers', JSON.stringify(updatedOffers));
    setOfferForm({
      id: Date.now(),
      title: '',
      discount: '',
      image: ''
    });
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer.id);
    setOfferForm(offer);
  };

  const handleUpdateOffer = (e) => {
    e.preventDefault();
    const updatedOffers = offers.map(o => 
      o.id === editingOffer ? offerForm : o
    );
    setOffers(updatedOffers);
    localStorage.setItem('cyberlife_offers', JSON.stringify(updatedOffers));
    setEditingOffer(null);
    setOfferForm({
      id: Date.now(),
      title: '',
      discount: '',
      image: ''
    });
  };

  const handleDeleteOffer = (id) => {
    if (confirm('Deseja realmente excluir esta oferta?')) {
      const updatedOffers = offers.filter(o => o.id !== id);
      setOffers(updatedOffers);
      localStorage.setItem('cyberlife_offers', JSON.stringify(updatedOffers));
    }
  };

  // === EVENTOS ===
  const handleAddEvent = (e) => {
    e.preventDefault();
    const newEvent = { ...eventForm, id: Date.now() };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('cyberlife_events', JSON.stringify(updatedEvents));
    setEventForm({
      id: Date.now(),
      title: '',
      date: '',
      prize: '',
      inscription: '',
      slug: '',
      type: 'Torneio',
      image: ''
    });
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event.id);
    setEventForm(event);
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    const updatedEvents = events.map(ev => 
      ev.id === editingEvent ? eventForm : ev
    );
    setEvents(updatedEvents);
    localStorage.setItem('cyberlife_events', JSON.stringify(updatedEvents));
    setEditingEvent(null);
    setEventForm({
      id: Date.now(),
      title: '',
      date: '',
      prize: '',
      inscription: '',
      slug: '',
      type: 'Torneio',
      image: ''
    });
  };

  const handleDeleteEvent = (id) => {
    if (confirm('Deseja realmente excluir este evento?')) {
      const updatedEvents = events.filter(ev => ev.id !== id);
      setEvents(updatedEvents);
      localStorage.setItem('cyberlife_events', JSON.stringify(updatedEvents));
    }
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-box">
          <h1>ADMIN PANEL</h1>
          <h2>CyberLife</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit">ACESSAR</button>
          </form>
          <button className="btn-back" onClick={() => onNavigate('start')}>
            VOLTAR
          </button>
        </div>
      </div>
    );
  }

  // Painel Admin Autenticado
  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>ADMIN PANEL - CyberLife</h1>
        <div className="admin-actions">
          <button onClick={() => onNavigate('loja-geek')}>VER LOJA</button>
          <button onClick={handleLogout}>SAIR</button>
        </div>
      </header>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          PRODUTOS ({products.length})
        </button>
        <button 
          className={activeTab === 'offers' ? 'active' : ''}
          onClick={() => setActiveTab('offers')}
        >
          BANNERS PROMOCIONAIS ({offers.length})
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          EVENTOS ({events.length})
        </button>
        <button 
          className={activeTab === 'logs' ? 'active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          LOGS DE ACESSO
        </button>
      </div>

      {/* TAB LOGS */}
      {activeTab === 'logs' && (
        <div className="admin-content">
          <AccessLogsView />
        </div>
      )}

      {/* TAB PRODUTOS */}
      {activeTab === 'products' && (
        <div className="admin-content">
          <div className="admin-form">
            <h2>{editingProduct ? 'EDITAR PRODUTO' : 'ADICIONAR PRODUTO'}</h2>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
              <input
                type="text"
                placeholder="Nome do produto"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
              />
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
              >
                <option>Action Figures</option>
                <option>Personalizados</option>
                <option>Miniaturas</option>
              </select>
              <input
                type="text"
                placeholder="Preço (ex: R$ 199,90)"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="URL da imagem padrão"
                value={productForm.image}
                onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="URL da imagem hover"
                value={productForm.hoverImage}
                onChange={(e) => setProductForm({...productForm, hoverImage: e.target.value})}
                required
              />
              <textarea
                placeholder="Descrição do produto"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                rows="4"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid #333',
                  borderRadius: '10px',
                  padding: '12px 15px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontFamily: 'Rajdhani, sans-serif',
                  resize: 'vertical'
                }}
              />
              <div className="form-buttons">
                <button type="submit">
                  {editingProduct ? 'ATUALIZAR' : 'ADICIONAR'}
                </button>
                {editingProduct && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        id: Date.now(),
                        name: '',
                        category: 'Action Figures',
                        price: '',
                        image: '',
                        hoverImage: '',
                        description: ''
                      });
                    }}
                  >
                    CANCELAR
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-list">
            <h2>PRODUTOS CADASTRADOS</h2>
            
            {/* Campo de pesquisa de produtos */}
            <div style={{
              marginBottom: '20px',
              position: 'relative',
            }}>
              <input
                type="text"
                placeholder="🔍 Pesquisar produtos..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00d9ff';
                  e.target.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {products.length === 0 ? (
              <p className="empty-state">Nenhum produto cadastrado</p>
            ) : (
              <div className="product-grid">
                {products
                  .filter(product => 
                    searchProduct === '' ||
                    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchProduct.toLowerCase()) ||
                    (product.description && product.description.toLowerCase().includes(searchProduct.toLowerCase()))
                  )
                  .map(product => (
                  <div key={product.id} className="product-admin-card">
                    <img src={product.image} alt={product.name} />
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <p className="price">{product.price}</p>
                    <div className="card-actions">
                      <button onClick={() => handleEditProduct(product)}>EDITAR</button>
                      <button onClick={() => handleDeleteProduct(product.id)}>EXCLUIR</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB OFERTAS */}
      {activeTab === 'offers' && (
        <div className="admin-content">
          <div className="admin-form">
            <h2>{editingOffer ? 'EDITAR BANNER' : 'ADICIONAR BANNER'}</h2>
            <form onSubmit={editingOffer ? handleUpdateOffer : handleAddOffer}>
              <input
                type="text"
                placeholder="Título da oferta"
                value={offerForm.title}
                onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Desconto (ex: ATÉ 50% OFF)"
                value={offerForm.discount}
                onChange={(e) => setOfferForm({...offerForm, discount: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="URL da imagem do banner"
                value={offerForm.image}
                onChange={(e) => setOfferForm({...offerForm, image: e.target.value})}
                required
              />
              <div className="form-buttons">
                <button type="submit">
                  {editingOffer ? 'ATUALIZAR' : 'ADICIONAR'}
                </button>
                {editingOffer && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingOffer(null);
                      setOfferForm({
                        id: Date.now(),
                        title: '',
                        discount: '',
                        image: ''
                      });
                    }}
                  >
                    CANCELAR
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-list">
            <h2>BANNERS CADASTRADOS</h2>
            
            {/* Campo de pesquisa de banners */}
            <div style={{
              marginBottom: '20px',
              position: 'relative',
            }}>
              <input
                type="text"
                placeholder="🔍 Pesquisar banners..."
                value={searchOffer}
                onChange={(e) => setSearchOffer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00d9ff';
                  e.target.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {offers.length === 0 ? (
              <p className="empty-state">Nenhum banner cadastrado</p>
            ) : (
              <div className="offers-grid">
                {offers
                  .filter(offer =>
                    searchOffer === '' ||
                    offer.title.toLowerCase().includes(searchOffer.toLowerCase()) ||
                    offer.discount.toLowerCase().includes(searchOffer.toLowerCase())
                  )
                  .map(offer => (
                  <div key={offer.id} className="offer-admin-card">
                    <img src={offer.image} alt={offer.title} />
                    <h3>{offer.title}</h3>
                    <p className="discount">{offer.discount}</p>
                    <div className="card-actions">
                      <button onClick={() => handleEditOffer(offer)}>EDITAR</button>
                      <button onClick={() => handleDeleteOffer(offer.id)}>EXCLUIR</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB EVENTOS */}
      {activeTab === 'events' && (
        <div className="admin-content">
          <div className="admin-form">
            <h2>{editingEvent ? 'EDITAR EVENTO' : 'ADICIONAR EVENTO'}</h2>
            <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}>
              <input
                type="text"
                placeholder="Título do evento (ex: Campeonato League of Legends)"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Data (ex: 20 de Janeiro, 2025)"
                value={eventForm.date}
                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                required
              />
              {eventForm.type === 'Torneio' && (
                <input
                  type="text"
                  placeholder="Prêmio (ex: R$ 15.000)"
                  value={eventForm.prize}
                  onChange={(e) => setEventForm({...eventForm, prize: e.target.value})}
                  required
                />
              )}
              <input
                type="text"
                placeholder="Inscrições (ex: Inscrições abertas até 15/01)"
                value={eventForm.inscription}
                onChange={(e) => setEventForm({...eventForm, inscription: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Slug (ex: league-of-legends)"
                value={eventForm.slug}
                onChange={(e) => setEventForm({...eventForm, slug: e.target.value})}
                required
              />
              <select
                value={eventForm.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setEventForm({
                    ...eventForm, 
                    type: newType,
                    // Limpar prêmio se não for Torneio
                    prize: newType === 'Torneio' ? eventForm.prize : ''
                  });
                }}
                required
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid #333',
                  borderRadius: '10px',
                  padding: '12px 15px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontFamily: 'Rajdhani, sans-serif',
                  cursor: 'pointer'
                }}
              >
                <option value="Torneio">🏆 Torneio</option>
                <option value="Corujão">🦉 Corujão</option>
                <option value="Rush Play">⚡ Rush Play</option>
              </select>
              <input
                type="text"
                placeholder="URL da imagem do evento"
                value={eventForm.image}
                onChange={(e) => setEventForm({...eventForm, image: e.target.value})}
                required
              />
              <div className="form-buttons">
                <button type="submit">
                  {editingEvent ? 'ATUALIZAR' : 'ADICIONAR'}
                </button>
                {editingEvent && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingEvent(null);
                      setEventForm({
                        id: Date.now(),
                        title: '',
                        date: '',
                        prize: '',
                        inscription: '',
                        slug: '',
                        type: 'Torneio',
                        image: ''
                      });
                    }}
                  >
                    CANCELAR
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-list">
            <h2>EVENTOS CADASTRADOS</h2>
            
            {/* Campo de pesquisa de eventos */}
            <div style={{
              marginBottom: '20px',
              position: 'relative',
            }}>
              <input
                type="text"
                placeholder="🔍 Pesquisar eventos..."
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '2px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00d9ff';
                  e.target.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {events.length === 0 ? (
              <p className="empty-state">Nenhum evento cadastrado</p>
            ) : (
              <div className="events-grid">
                {events
                  .filter(event =>
                    searchEvent === '' ||
                    event.title.toLowerCase().includes(searchEvent.toLowerCase()) ||
                    event.type.toLowerCase().includes(searchEvent.toLowerCase()) ||
                    event.date.toLowerCase().includes(searchEvent.toLowerCase()) ||
                    (event.prize && event.prize.toLowerCase().includes(searchEvent.toLowerCase())) ||
                    event.slug.toLowerCase().includes(searchEvent.toLowerCase())
                  )
                  .map(event => (
                  <div key={event.id} className="event-admin-card">
                    {event.image && <img src={event.image} alt={event.title} />}
                    <div className="event-content">
                      <h3>{event.title}</h3>
                      <p className="event-type" style={{
                        color: '#ff00ea',
                        fontSize: '13px',
                        fontWeight: 700,
                        fontFamily: 'Rajdhani, sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}>
                        {event.type === 'Torneio' && '🏆'}
                        {event.type === 'Corujão' && '🦉'}
                        {event.type === 'Rush Play' && '⚡'}
                        {' '}{event.type}
                      </p>
                      <p className="event-date">📅 {event.date}</p>
                      {event.type === 'Torneio' && event.prize && (
                        <p className="event-prize">🏆 {event.prize}</p>
                      )}
                      <p className="event-inscription">{event.inscription}</p>
                      <p className="event-slug">Slug: {event.slug}</p>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => handleEditEvent(event)}>EDITAR</button>
                      <button onClick={() => handleDeleteEvent(event.id)}>EXCLUIR</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
