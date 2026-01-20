import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AccessLogsView from '../components/AccessLogsView';
import { stopAudio } from '../utils/audioPlayer';
import { allProducts } from '../data/lojaData';
import './AdminPanel2.css';

const AdminPanel2 = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [salesByPeriod, setSalesByPeriod] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  
  // Produtos
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'geek',
    type: 'Action Figures',
    price: '',
    image_url: '',
    hover_image_url: '',
    description: '',
    stock: 0,
    reward_points: ''
  });
  
  // Banners
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchBanner, setSearchBanner] = useState('');
  const [bannerForm, setBannerForm] = useState({
    title: '',
    discount: '',
    description: '',
    image_url: '',
    link_url: '',
    order: 0,
    reward_points: '',
    original_price: '',
    final_price: ''
  });

  // Eventos
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchEvent, setSearchEvent] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    slug: '',
    description: '',
    type: 'Torneio',
    date: '',
    prize: '',
    inscription_info: '',
    inscription_price: '', // Preço da inscrição em reais
    inscription_price_cyberpoints: '', // Preço da inscrição em cyberpoints
    max_participants: null,
    image_url: '',
    rules: [],
    schedule: [],
    reward_points: ''
  });

  // Pedidos
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchOrder, setSearchOrder] = useState('');
  
  // Clientes
  const [customers, setCustomers] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');

  // Parar música
  useEffect(() => {
    stopAudio();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '251207') {
      setIsAuthenticated(true);
      setPassword('');
      // Carregar dados após login
      loadDashboardData();
      loadProducts();
      loadBanners();
      loadEvents();
    } else {
      alert('Senha incorreta!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // ============================================
  // DASHBOARD
  // ============================================
  
  const loadDashboardData = async () => {
    try {
      // Stats gerais
      const { data: stats } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();
      setDashboardStats(stats);

      // Pedidos recentes
      const { data: orders } = await supabase
        .from('recent_orders')
        .select('*')
        .limit(10);
      setRecentOrders(orders || []);

      // Top clientes
      const { data: customers } = await supabase
        .from('top_customers')
        .select('*')
        .limit(5);
      setTopCustomers(customers || []);

      // Vendas por categoria
      const { data: categories } = await supabase
        .from('sales_by_category')
        .select('*');
      setSalesByCategory(categories || []);

      // Vendas por período (últimos 7 dias)
      const { data: period } = await supabase
        .from('sales_by_period')
        .select('*')
        .limit(7);
      setSalesByPeriod(period || []);

      // Estoque baixo
      const { data: stock } = await supabase
        .from('low_stock_alert')
        .select('*')
        .limit(10);
      setLowStock(stock || []);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  // ============================================
  // PRODUTOS
  // ============================================
  
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  // Função para importar produtos do lojaData.js para o banco
  const importProductsFromLojaData = async () => {
    try {
      // Verificar se já existem produtos na tabela
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (existingProducts && existingProducts.length > 0) {
        if (!confirm('Já existem produtos cadastrados. Deseja importar mesmo assim?')) {
          return;
        }
      }

      const productsToInsert = allProducts.map(product => ({
        name: product.name,
        category: product.category,
        type: product.type,
        price: parseFloat(product.price.replace('R$ ', '').replace(',', '.')),
        image_url: product.image,
        hover_image_url: product.hoverImage,
        description: product.description,
        stock: Math.floor(Math.random() * 50) + 10, // Stock aleatório entre 10-59
        active: true
      }));

      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) throw error;
      
      await loadProducts(); // Recarregar lista
      alert(`${data.length} produtos importados com sucesso do lojaData.js!`);
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      alert('Erro ao importar produtos: ' + error.message);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          reward_points: productForm.reward_points ? parseInt(productForm.reward_points) : null
        }])
        .select();

      if (error) throw error;
      
      setProducts([data[0], ...products]);
      resetProductForm();
      alert('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto: ' + error.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          reward_points: productForm.reward_points ? parseInt(productForm.reward_points) : null
        })
        .eq('id', editingProduct);

      if (error) throw error;
      
      await loadProducts();
      setEditingProduct(null);
      resetProductForm();
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      alert('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto: ' + error.message);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: 'geek',
      type: 'Action Figures',
      price: '',
      image_url: '',
      hover_image_url: '',
      description: '',
      stock: 0,
      reward_points: ''
    });
  };

  // ============================================
  // BANNERS
  // ============================================
  
  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([{
          ...bannerForm,
          order: parseInt(bannerForm.order) || 0,
          reward_points: bannerForm.reward_points ? parseInt(bannerForm.reward_points) : null,
          original_price: bannerForm.original_price ? parseFloat(bannerForm.original_price) : null,
          final_price: bannerForm.final_price ? parseFloat(bannerForm.final_price) : null
        }])
        .select();

      if (error) throw error;
      
      setBanners([...banners, data[0]]);
      resetBannerForm();
      alert('Banner adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar banner:', error);
      alert('Erro ao adicionar banner: ' + error.message);
    }
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('banners')
        .update({
          ...bannerForm,
          order: parseInt(bannerForm.order) || 0,
          reward_points: bannerForm.reward_points ? parseInt(bannerForm.reward_points) : null,
          original_price: bannerForm.original_price ? parseFloat(bannerForm.original_price) : null,
          final_price: bannerForm.final_price ? parseFloat(bannerForm.final_price) : null
        })
        .eq('id', editingBanner);

      if (error) throw error;
      
      await loadBanners();
      setEditingBanner(null);
      resetBannerForm();
      alert('Banner atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      alert('Erro ao atualizar banner: ' + error.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Deseja realmente excluir este banner?')) return;
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBanners(banners.filter(b => b.id !== id));
      alert('Banner excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir banner:', error);
      alert('Erro ao excluir banner: ' + error.message);
    }
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: '',
      discount: '',
      description: '',
      image_url: '',
      link_url: '',
      order: 0,
      reward_points: '',
      original_price: '',
      final_price: ''
    });
  };

  // ============================================
  // EVENTOS
  // ============================================
  
  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventForm,
          max_participants: eventForm.max_participants ? parseInt(eventForm.max_participants) : null,
          rules: Array.isArray(eventForm.rules) ? eventForm.rules : [],
          schedule: Array.isArray(eventForm.schedule) ? eventForm.schedule : [],
          reward_points: eventForm.reward_points ? parseInt(eventForm.reward_points) : null,
          inscription_price: eventForm.inscription_price ? parseFloat(eventForm.inscription_price) : null,
          inscription_price_cyberpoints: eventForm.inscription_price_cyberpoints ? parseInt(eventForm.inscription_price_cyberpoints) : null
        }])
        .select();

      if (error) throw error;
      
      setEvents([...events, data[0]]);
      resetEventForm();
      alert('Evento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      alert('Erro ao adicionar evento: ' + error.message);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...eventForm,
          max_participants: eventForm.max_participants ? parseInt(eventForm.max_participants) : null,
          rules: Array.isArray(eventForm.rules) ? eventForm.rules : [],
          schedule: Array.isArray(eventForm.schedule) ? eventForm.schedule : [],
          reward_points: eventForm.reward_points ? parseInt(eventForm.reward_points) : null,
          inscription_price: eventForm.inscription_price ? parseFloat(eventForm.inscription_price) : null,
          inscription_price_cyberpoints: eventForm.inscription_price_cyberpoints ? parseInt(eventForm.inscription_price_cyberpoints) : null
        })
        .eq('id', editingEvent);

      if (error) throw error;
      
      await loadEvents();
      setEditingEvent(null);
      resetEventForm();
      alert('Evento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      alert('Erro ao atualizar evento: ' + error.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== id));
      alert('Evento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento: ' + error.message);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      slug: '',
      description: '',
      type: 'Torneio',
      date: '',
      prize: '',
      inscription_info: '',
      inscription_price: '',
      inscription_price_cyberpoints: '',
      max_participants: null,
      image_url: '',
      rules: [],
      schedule: [],
      reward_points: ''
    });
  };

  // ============================================
  // PEDIDOS
  // ============================================
  
  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('recent_orders')
        .select('*')
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      await loadOrders();
      alert('Status do pedido atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  // ============================================
  // CLIENTES
  // ============================================
  
  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_stats')
        .select('*')
        .limit(100);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>🎮 CYBERLIFE ADMIN</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Digite a senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit">ENTRAR</button>
          </form>
          <button onClick={() => onNavigate('menu')} className="btn-back">
            ← Voltar ao menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <h1>🎮 CYBERLIFE ADMIN PANEL</h1>
        <div className="header-actions">
          <button onClick={handleLogout} className="btn-logout">
            🚪 SAIR
          </button>
          <button onClick={() => onNavigate('menu')} className="btn-voltar">
            ← VOLTAR AO SITE
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 DASHBOARD
        </button>
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          🎮 PRODUTOS
        </button>
        <button 
          className={activeTab === 'banners' ? 'active' : ''}
          onClick={() => setActiveTab('banners')}
        >
          🖼️ BANNERS
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          🏆 EVENTOS
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => {
            setActiveTab('orders');
            loadOrders();
          }}
        >
          🛒 PEDIDOS
        </button>
        <button 
          className={activeTab === 'customers' ? 'active' : ''}
          onClick={() => {
            setActiveTab('customers');
            loadCustomers();
          }}
        >
          👥 CLIENTES
        </button>
        <button 
          className={activeTab === 'logs' ? 'active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          📝 LOGS
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        
        {/* TAB DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-container">
            <h2>📊 DASHBOARD GERAL</h2>
            
            {/* Stats Cards */}
            {dashboardStats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total de Produtos</h3>
                  <p className="stat-value">{dashboardStats.total_products}</p>
                </div>
                <div className="stat-card">
                  <h3>Total de Clientes</h3>
                  <p className="stat-value">{dashboardStats.total_customers}</p>
                </div>
                <div className="stat-card">
                  <h3>Total de Pedidos</h3>
                  <p className="stat-value">{dashboardStats.total_orders}</p>
                </div>
                <div className="stat-card">
                  <h3>Receita Total</h3>
                  <p className="stat-value">R$ {parseFloat(dashboardStats.total_revenue || 0).toFixed(2)}</p>
                </div>
                <div className="stat-card alert">
                  <h3>Pedidos Pendentes</h3>
                  <p className="stat-value">{dashboardStats.pending_orders}</p>
                </div>
                <div className="stat-card alert">
                  <h3>Estoque Baixo</h3>
                  <p className="stat-value">{dashboardStats.low_stock_products}</p>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="dashboard-section">
              <h3>📦 Pedidos Recentes</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.order_number}</td>
                      <td>{order.user_name}</td>
                      <td>R$ {parseFloat(order.total).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Customers */}
            <div className="dashboard-section">
              <h3>⭐ Top 5 Clientes</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Pedidos</th>
                    <th>Total Gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td>{customer.full_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.total_orders}</td>
                      <td>R$ {parseFloat(customer.total_spent).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sales by Category */}
            <div className="dashboard-section">
              <h3>📊 Vendas por Categoria</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Pedidos</th>
                    <th>Unidades</th>
                    <th>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByCategory.map(cat => (
                    <tr key={cat.category}>
                      <td>{cat.category}</td>
                      <td>{cat.orders_count}</td>
                      <td>{cat.units_sold}</td>
                      <td>R$ {parseFloat(cat.total_revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
              <div className="dashboard-section alert">
                <h3>⚠️ Alerta de Estoque Baixo</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Estoque</th>
                      <th>Preço</th>
                      <th>Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td className="low-stock">{product.stock}</td>
                        <td>R$ {parseFloat(product.price).toFixed(2)}</td>
                        <td>{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB PRODUCTS */}
        {activeTab === 'products' && (
          <div className="products-container-split">
            {/* COLUNA ESQUERDA - FORMULÁRIO */}
            <div className="products-form-column">
              <div className="admin-form-section sticky-form">
                <h2>{editingProduct ? '✏️ EDITAR PRODUTO' : '➕ ADICIONAR PRODUTO'}</h2>
                
                {/* Botão para importar produtos do lojaData.js */}
                {!editingProduct && (
                  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <button 
                      type="button"
                      onClick={importProductsFromLojaData}
                      className="btn-secondary"
                      style={{ 
                        background: 'rgba(255, 0, 234, 0.1)', 
                        borderColor: '#ff00ea',
                        color: '#ff00ea'
                      }}
                    >
                      📦 IMPORTAR PRODUTOS DO ARQUIVO
                    </button>
                    <small style={{ display: 'block', marginTop: '5px', color: '#aaa' }}>
                      Importa todos os produtos do lojaData.js para o banco de dados
                    </small>
                  </div>
                )}
                
                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  <div className="form-row">
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
                      required
                    >
                      <option value="geek">🎭 Geek</option>
                      <option value="gamer">🎮 Gamer</option>
                      <option value="smarthome">🏠 Smart Home</option>
                    </select>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Tipo (ex: Action Figures, Mouse, Lâmpada)"
                    value={productForm.type}
                    onChange={(e) => setProductForm({...productForm, type: e.target.value})}
                  />
                  
                  <div className="form-row">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Preço (R$)"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Estoque"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      required
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="URL da imagem principal"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="URL da imagem hover (opcional)"
                    value={productForm.hover_image_url}
                    onChange={(e) => setProductForm({...productForm, hover_image_url: e.target.value})}
                  />
                  
                  <textarea
                    placeholder="Descrição do produto"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows="4"
                    required
                  />
                  
                  <div style={{
                    marginTop: '15px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <label htmlFor="product-reward-points" style={{
                      display: 'block',
                      marginBottom: '10px',
                      color: '#667eea',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      🎮 CyberPoints (Opcional)
                      <span style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#999',
                        fontWeight: 'normal',
                        marginTop: '5px'
                      }}>Deixe vazio para usar regra padrão (R$ 50 = 30 pontos)</span>
                    </label>
                    <input
                      id="product-reward-points"
                      type="number"
                      min="0"
                      placeholder="Ex: 100 pontos"
                      value={productForm.reward_points}
                      onChange={(e) => setProductForm({...productForm, reward_points: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        border: '2px solid rgba(102, 126, 234, 0.4)',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#fff'
                      }}
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">
                      {editingProduct ? '✅ ATUALIZAR' : '➕ ADICIONAR'}
                    </button>
                    {editingProduct && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingProduct(null);
                          resetProductForm();
                        }}
                        className="btn-secondary"
                      >
                        ❌ CANCELAR
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* COLUNA DIREITA - LISTA DE PRODUTOS */}
            <div className="products-list-column">
              <div className="admin-list-section">
                <h2>📦 PRODUTOS CADASTRADOS</h2>
                
                <input
                  type="text"
                  placeholder="🔍 Pesquisar produtos..."
                  value={searchProduct}
                  onChange={(e) => {
                    setSearchProduct(e.target.value);
                    setCurrentPage(1); // Reset para primeira página ao buscar
                  }}
                  className="search-input"
                />
                
                <div className="products-grid">
                  {(() => {
                    const filteredProducts = products.filter(p => 
                      searchProduct === '' ||
                      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchProduct.toLowerCase()) ||
                      p.type?.toLowerCase().includes(searchProduct.toLowerCase())
                    );
                    
                    if (filteredProducts.length === 0) {
                      return (
                        <div style={{
                          gridColumn: '1 / -1',
                          textAlign: 'center',
                          padding: '40px',
                          color: '#aaa'
                        }}>
                          <h3>📦 Nenhum produto encontrado</h3>
                          <p>
                            {products.length === 0 
                              ? 'Não há produtos cadastrados. Use o botão "IMPORTAR PRODUTOS DO ARQUIVO" para começar.'
                              : 'Nenhum produto corresponde à sua busca.'
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    const itemsPerPage = 12;
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
                    
                    return currentProducts.map(product => (
                      <div key={product.id} className="product-card">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} />
                        )}
                        <h3>{product.name}</h3>
                        <p className="product-category">{product.category} - {product.type}</p>
                        <p className="product-price">R$ {parseFloat(product.price).toFixed(2)}</p>
                        <p className="product-stock">Estoque: {product.stock}</p>
                        <div className="card-actions">
                          <button 
                            onClick={() => {
                              setEditingProduct(product.id);
                              setProductForm({
                                ...product,
                                reward_points: product.reward_points ?? ''
                              });
                            }}
                            className="btn-edit"
                          >
                            ✏️ EDITAR
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="btn-delete"
                          >
                            🗑️ EXCLUIR
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                
                {/* Paginação */}
                {(() => {
                  const filteredProducts = products.filter(p => 
                    searchProduct === '' ||
                    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchProduct.toLowerCase()) ||
                    p.type?.toLowerCase().includes(searchProduct.toLowerCase())
                  );
                  
                  const itemsPerPage = 12;
                  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                  
                  if (totalPages <= 1) return null;
                  
                  return (
                    <div className="pagination">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="btn-secondary"
                      >
                        ← Anterior
                      </button>
                      
                      <span>
                        Página {currentPage} de {totalPages}
                      </span>
                      
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="btn-secondary"
                      >
                        Próxima →
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB BANNERS */}
        {activeTab === 'banners' && (
          <div className="banners-container">
            <div className="admin-form-section">
              <h2>{editingBanner ? '✏️ EDITAR BANNER' : '➕ ADICIONAR BANNER'}</h2>
              <form onSubmit={editingBanner ? handleUpdateBanner : handleAddBanner}>
                <input
                  type="text"
                  placeholder="Título do banner"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                  required
                />
                
                <input
                  type="text"
                  placeholder="Desconto (ex: 50% OFF)"
                  value={bannerForm.discount}
                  onChange={(e) => setBannerForm({...bannerForm, discount: e.target.value})}
                />
                
                <input
                  type="text"
                  placeholder="Descrição"
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})}
                />
                
                <input
                  type="text"
                  placeholder="URL da imagem"
                  value={bannerForm.image_url}
                  onChange={(e) => setBannerForm({...bannerForm, image_url: e.target.value})}
                  required
                />
                
                <input
                  type="text"
                  placeholder="Link do banner (opcional)"
                  value={bannerForm.link_url}
                  onChange={(e) => setBannerForm({...bannerForm, link_url: e.target.value})}
                />
                
                <input
                  type="number"
                  placeholder="Ordem de exibição (0 = primeiro)"
                  value={bannerForm.order}
                  onChange={(e) => setBannerForm({...bannerForm, order: e.target.value})}
                />
                
                <div className="price-fields" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginTop: '10px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#00d9ff',
                      fontSize: '0.9rem',
                      marginBottom: '5px',
                      fontWeight: 600
                    }}>💰 De: (Preço Original)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 599.90"
                      value={bannerForm.original_price}
                      onChange={(e) => setBannerForm({...bannerForm, original_price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#00ff88',
                      fontSize: '0.9rem',
                      marginBottom: '5px',
                      fontWeight: 600
                    }}>✨ Por apenas: (Preço Final)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 399.90"
                      value={bannerForm.final_price}
                      onChange={(e) => setBannerForm({...bannerForm, final_price: e.target.value})}
                    />
                  </div>
                </div>
                
                <div style={{
                  marginTop: '15px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  border: '2px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px'
                }}>
                  <label htmlFor="banner-reward-points" style={{
                    display: 'block',
                    marginBottom: '10px',
                    color: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    🎮 CyberPoints (Opcional)
                    <span style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#999',
                      fontWeight: 'normal',
                      marginTop: '5px'
                    }}>Pontos promocionais especiais deste banner</span>
                  </label>
                  <input
                    id="banner-reward-points"
                    type="number"
                    min="0"
                    placeholder="Ex: 500 pontos de bônus"
                    value={bannerForm.reward_points}
                    onChange={(e) => setBannerForm({...bannerForm, reward_points: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid rgba(102, 126, 234, 0.4)',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff'
                    }}
                  />
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    {editingBanner ? '✅ ATUALIZAR' : '➕ ADICIONAR'}
                  </button>
                  {editingBanner && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingBanner(null);
                        resetBannerForm();
                      }}
                      className="btn-secondary"
                    >
                      ❌ CANCELAR
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-list-section">
              <h2>🖼️ BANNERS CADASTRADOS</h2>
              
              <input
                type="text"
                placeholder="🔍 Pesquisar banners..."
                value={searchBanner}
                onChange={(e) => setSearchBanner(e.target.value)}
                className="search-input"
              />
              
              <div className="banners-grid">
                {banners
                  .filter(b => 
                    searchBanner === '' ||
                    b.title.toLowerCase().includes(searchBanner.toLowerCase()) ||
                    b.discount?.toLowerCase().includes(searchBanner.toLowerCase())
                  )
                  .map(banner => (
                    <div key={banner.id} className="banner-card">
                      {banner.image_url && (
                        <img src={banner.image_url} alt={banner.title} />
                      )}
                      <h3>{banner.title}</h3>
                      {banner.discount && <p className="banner-discount">{banner.discount}</p>}
                      <p className="banner-order">Ordem: {banner.order}</p>
                      <div className="card-actions">
                        <button 
                          onClick={() => {
                            setEditingBanner(banner.id);
                            setBannerForm({
                              ...banner,
                              reward_points: banner.reward_points ?? '',
                              original_price: banner.original_price ?? '',
                              final_price: banner.final_price ?? ''
                            });
                          }}
                          className="btn-edit"
                        >
                          ✏️ EDITAR
                        </button>
                        <button 
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="btn-delete"
                        >
                          🗑️ EXCLUIR
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB EVENTS */}
        {activeTab === 'events' && (
          <div className="events-container">
            <div className="admin-form-section">
              <h2>{editingEvent ? '✏️ EDITAR EVENTO' : '➕ ADICIONAR EVENTO'}</h2>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}>
                <input
                  type="text"
                  placeholder="Título do evento"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
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
                  onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                  required
                >
                  <option value="Torneio">🏆 Torneio</option>
                  <option value="Corujão">🦉 Corujão</option>
                  <option value="Rush Play">⚡ Rush Play</option>
                  <option value="Campeonato">🏅 Campeonato</option>
                  <option value="Outro">📅 Outro</option>
                </select>
                
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                  required
                />
                
                <input
                  type="text"
                  placeholder="Prêmio (ex: R$ 15.000)"
                  value={eventForm.prize}
                  onChange={(e) => setEventForm({...eventForm, prize: e.target.value})}
                />
                
                <input
                  type="text"
                  placeholder="Informações de inscrição"
                  value={eventForm.inscription_info}
                  onChange={(e) => setEventForm({...eventForm, inscription_info: e.target.value})}
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor da inscrição em reais (ex: 50.00)"
                  value={eventForm.inscription_price}
                  onChange={(e) => setEventForm({...eventForm, inscription_price: e.target.value})}
                />

                <input
                  type="number"
                  placeholder="Valor da inscrição em CyberPoints (ex: 100)"
                  value={eventForm.inscription_price_cyberpoints}
                  onChange={(e) => setEventForm({...eventForm, inscription_price_cyberpoints: e.target.value})}
                />

                <input
                  type="number"
                  placeholder="Máximo de participantes (deixe em branco para ilimitado)"
                  value={eventForm.max_participants || ''}
                  onChange={(e) => setEventForm({...eventForm, max_participants: e.target.value})}
                />
                
                <input
                  type="text"
                  placeholder="URL da imagem"
                  value={eventForm.image_url}
                  onChange={(e) => setEventForm({...eventForm, image_url: e.target.value})}
                  required
                />
                
                <textarea
                  placeholder="Descrição do evento"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows="4"
                  required
                />
                
                <div style={{
                  marginTop: '15px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  border: '2px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px'
                }}>
                  <label htmlFor="event-reward-points" style={{
                    display: 'block',
                    marginBottom: '10px',
                    color: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    🎮 CyberPoints (Opcional)
                    <span style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#999',
                      fontWeight: 'normal',
                      marginTop: '5px'
                    }}>Pontos que participantes ganham ao se inscrever</span>
                  </label>
                  <input
                    id="event-reward-points"
                    type="number"
                    min="0"
                    placeholder="Ex: 200 pontos por participação"
                    value={eventForm.reward_points}
                    onChange={(e) => setEventForm({...eventForm, reward_points: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid rgba(102, 126, 234, 0.4)',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff'
                    }}
                  />
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    {editingEvent ? '✅ ATUALIZAR' : '➕ ADICIONAR'}
                  </button>
                  {editingEvent && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingEvent(null);
                        resetEventForm();
                      }}
                      className="btn-secondary"
                    >
                      ❌ CANCELAR
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-list-section">
              <h2>🏆 EVENTOS CADASTRADOS</h2>
              
              <input
                type="text"
                placeholder="🔍 Pesquisar eventos..."
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                className="search-input"
              />
              
              <div className="events-grid">
                {events
                  .filter(e => 
                    searchEvent === '' ||
                    e.title.toLowerCase().includes(searchEvent.toLowerCase()) ||
                    e.type.toLowerCase().includes(searchEvent.toLowerCase()) ||
                    e.slug.toLowerCase().includes(searchEvent.toLowerCase())
                  )
                  .map(event => (
                    <div key={event.id} className="event-card">
                      {event.image_url && (
                        <img src={event.image_url} alt={event.title} />
                      )}
                      <h3>{event.title}</h3>
                      <p className="event-type">
                        {event.type === 'Torneio' && '🏆'}
                        {event.type === 'Corujão' && '🦉'}
                        {event.type === 'Rush Play' && '⚡'}
                        {event.type === 'Campeonato' && '🏅'}
                        {' '}{event.type}
                      </p>
                      <p className="event-date">📅 {new Date(event.date).toLocaleDateString()}</p>
                      {event.prize && <p className="event-prize">🏆 {event.prize}</p>}
                      <p className="event-participants">
                        👥 {event.current_participants}/{event.max_participants || '∞'}
                      </p>
                      <div className="card-actions">
                        <button 
                          onClick={() => {
                            setEditingEvent(event.id);
                            setEventForm({
                              ...event,
                              reward_points: event.reward_points ?? '',
                              inscription_price: event.inscription_price ?? '',
                              inscription_price_cyberpoints: event.inscription_price_cyberpoints ?? ''
                            });
                          }}
                          className="btn-edit"
                        >
                          ✏️ EDITAR
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="btn-delete"
                        >
                          🗑️ EXCLUIR
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB ORDERS */}
        {activeTab === 'orders' && (
          <div className="orders-container">
            <h2>🛒 GERENCIAR PEDIDOS</h2>
            
            <input
              type="text"
              placeholder="🔍 Pesquisar pedidos..."
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              className="search-input"
            />
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(o => 
                    searchOrder === '' ||
                    o.order_number.toLowerCase().includes(searchOrder.toLowerCase()) ||
                    o.user_name.toLowerCase().includes(searchOrder.toLowerCase()) ||
                    o.user_email.toLowerCase().includes(searchOrder.toLowerCase())
                  )
                  .map(order => (
                    <tr key={order.id}>
                      <td>{order.order_number}</td>
                      <td>{order.user_name}</td>
                      <td>{order.user_email}</td>
                      <td>R$ {parseFloat(order.total).toFixed(2)}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="processing">Processando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td>
                        <span className={`payment-badge ${order.payment_status}`}>
                          {order.payment_status || 'N/A'}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="btn-view"
                        >
                          👁️ VER
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {selectedOrder && (
              <div className="order-modal" onClick={() => setSelectedOrder(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>📦 Detalhes do Pedido {selectedOrder.order_number}</h3>
                  <p><strong>Cliente:</strong> {selectedOrder.user_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.user_email}</p>
                  <p><strong>Total:</strong> R$ {parseFloat(selectedOrder.total).toFixed(2)}</p>
                  <p><strong>Itens:</strong> {selectedOrder.items_count}</p>
                  <button onClick={() => setSelectedOrder(null)}>❌ FECHAR</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="customers-container">
            <h2>👥 GERENCIAR CLIENTES</h2>
            
            <input
              type="text"
              placeholder="🔍 Pesquisar clientes..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              className="search-input"
            />
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Nickname</th>
                  <th>Cidade/Estado</th>
                  <th>Pedidos</th>
                  <th>Total Gasto</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {customers
                  .filter(c => 
                    searchCustomer === '' ||
                    c.full_name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                    c.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                    c.nickname.toLowerCase().includes(searchCustomer.toLowerCase())
                  )
                  .map(customer => (
                    <tr key={customer.id}>
                      <td>{customer.full_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.nickname}</td>
                      <td>{customer.city}/{customer.state}</td>
                      <td>{customer.total_orders}</td>
                      <td>R$ {parseFloat(customer.total_spent || 0).toFixed(2)}</td>
                      <td>{new Date(customer.registered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB LOGS */}
        {activeTab === 'logs' && (
          <AccessLogsView />
        )}
      </div>
    </div>
  );
};

export default AdminPanel2;
