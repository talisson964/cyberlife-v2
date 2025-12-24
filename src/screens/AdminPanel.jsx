import React, { useState, useEffect } from 'react';
import AccessLogsView from '../components/AccessLogsView';

const AdminPanel = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  
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

  useEffect(() => {
    // Carregar dados do localStorage
    const storedProducts = localStorage.getItem('cyberlife_products');
    const storedOffers = localStorage.getItem('cyberlife_offers');
    
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedOffers) setOffers(JSON.parse(storedOffers));
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
            {products.length === 0 ? (
              <p className="empty-state">Nenhum produto cadastrado</p>
            ) : (
              <div className="product-grid">
                {products.map(product => (
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
            {offers.length === 0 ? (
              <p className="empty-state">Nenhum banner cadastrado</p>
            ) : (
              <div className="offers-grid">
                {offers.map(offer => (
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
    </div>
  );
};

export default AdminPanel;
