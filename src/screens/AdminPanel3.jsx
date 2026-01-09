import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AccessLogsView from '../components/AccessLogsView';
import { stopAudio } from '../utils/audioPlayer';
import { allProducts } from '../data/lojaData';
import './AdminPanel3.css';

const AdminPanel3 = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  
  // Produtos
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormPosition, setProductFormPosition] = useState({ x: 30, y: 120 });
  const [isDragging, setIsDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'geek',
    type: 'Action Figures',
    price: '',
    image_url: '',
    hover_image_url: '',
    description: '',
    stock: 0
  });
  
  // Banners
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchBanner, setSearchBanner] = useState('');
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerFormPosition, setBannerFormPosition] = useState({ x: 30, y: 120 });
  const [bannerForm, setBannerForm] = useState({
    title: '',
    discount: '',
    description: '',
    image_url: '',
    link_url: '',
    order: 0
  });

  // Eventos
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchEvent, setSearchEvent] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormPosition, setEventFormPosition] = useState({ x: 30, y: 120 });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    prize: '',
    max_participants: '',
    type: 'Torneio',
    image_url: ''
  });

  // Cupons
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchCoupon, setSearchCoupon] = useState('');
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponFormPosition, setCouponFormPosition] = useState({ x: 30, y: 120 });
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_uses: '',
    valid_until: ''
  });

  // Pedidos
  const [orders, setOrders] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Clientes
  const [customers, setCustomers] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');

  // Parar música
  useEffect(() => {
    stopAudio();
  }, []);

  // Carregar dados quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      await Promise.all([
        loadDashboardData(),
        loadProducts(),
        loadBanners(),
        loadEvents(),
        loadCoupons(),
        loadOrders(),
        loadCustomers()
      ]);
      
      console.log('Todos os dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do banco. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '251207') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Recarregar dados quando muda de aba
  useEffect(() => {
    if (isAuthenticated) {
      switch(activeTab) {
        case 'products':
          loadProducts();
          break;
        case 'banners':
          loadBanners();
          break;
        case 'events':
          loadEvents();
          break;
        case 'orders':
          loadOrders();
          break;
        case 'customers':
          loadCustomers();
          break;
        case 'dashboard':
          loadDashboardData();
          break;
        default:
          break;
      }
    }
  }, [activeTab, isAuthenticated]);

  // DASHBOARD DATA
  const loadDashboardData = async () => {
    try {
      console.log('Carregando dados do dashboard...');
      
      const { data: stats, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      const { data: orders, error: ordersError } = await supabase
        .from('recent_orders')
        .select('*')
        .limit(10);

      const { data: customers, error: customersError } = await supabase
        .from('top_customers')
        .select('*')
        .limit(10);

      const { data: categories, error: categoriesError } = await supabase
        .from('sales_by_category')
        .select('*');

      const { data: lowStockData, error: lowStockError } = await supabase
        .from('low_stock_alert')
        .select('*');

      // Não gerar erro se as views não existirem ainda
      if (statsError) console.warn('View dashboard_stats não encontrada:', statsError.message);
      if (ordersError) console.warn('View recent_orders não encontrada:', ordersError.message);
      if (customersError) console.warn('View top_customers não encontrada:', customersError.message);
      if (categoriesError) console.warn('View sales_by_category não encontrada:', categoriesError.message);
      if (lowStockError) console.warn('View low_stock_alert não encontrada:', lowStockError.message);

      if (!statsError) setDashboardStats(stats);
      if (!ordersError) setRecentOrders(orders || []);
      if (!customersError) setTopCustomers(customers || []);
      if (!categoriesError) setSalesByCategory(categories || []);
      if (!lowStockError) setLowStock(lowStockData || []);
      
      console.log('Dados do dashboard carregados');

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  // PRODUTOS
  const loadProducts = async () => {
    try {
      console.log('Carregando produtos...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }
      
      console.log('Produtos carregados:', data?.length || 0);
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]); // Garantir que sempre seja um array
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
          stock: parseInt(productForm.stock) || 0
        }])
        .select();

      if (error) throw error;
      
      await loadProducts(); // Recarregar lista do banco
      setShowProductForm(false); // Fechar formulário
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
          stock: parseInt(productForm.stock) || 0
        })
        .eq('id', editingProduct);

      if (error) throw error;

      await loadProducts(); // Recarregar lista do banco
      setEditingProduct(null);
      setShowProductForm(false); // Fechar formulário
      resetProductForm();
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadProducts(); // Recarregar lista do banco
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
      stock: 0
    });
  };

  // DRAG AND DROP FUNCTIONS
  const handleMouseDown = (e, formType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDragging(formType);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 420, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
      
      if (isDragging === 'product') {
        setProductFormPosition({ x: newX, y: newY });
      } else if (isDragging === 'banner') {
        setBannerFormPosition({ x: newX, y: newY });
      } else if (isDragging === 'event') {
        setEventFormPosition({ x: newX, y: newY });
      } else if (isDragging === 'coupon') {
        setCouponFormPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // BANNERS
  const loadBanners = async () => {
    try {
      console.log('Carregando banners...');
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error('Erro ao buscar banners:', error);
        throw error;
      }
      
      console.log('Banners carregados:', data?.length || 0);
      setBanners(data || []);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      setBanners([]); // Garantir que sempre seja um array
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      // Mapear os dados do formulário para a estrutura do banco
      const bannerData = {
        title: bannerForm.title,
        discount: bannerForm.discount,
        description: bannerForm.description,
        image_url: bannerForm.image_url,
        link_url: bannerForm.link_url,
        "order": parseInt(bannerForm.order || 0),
        active: true
      };

      const { data, error } = await supabase
        .from('banners')
        .insert([bannerData])
        .select();

      if (error) throw error;
      
      await loadBanners(); // Recarregar lista do banco
      setShowBannerForm(false); // Fechar formulário
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
      // Mapear os dados do formulário para a estrutura do banco
      const bannerData = {
        title: bannerForm.title,
        discount: bannerForm.discount,
        description: bannerForm.description,
        image_url: bannerForm.image_url,
        link_url: bannerForm.link_url,
        "order": parseInt(bannerForm.order || 0),
        active: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', editingBanner);

      if (error) throw error;

      await loadBanners(); // Recarregar lista do banco
      setEditingBanner(null);
      setShowBannerForm(false); // Fechar formulário
      resetBannerForm();
      alert('Banner atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      alert('Erro ao atualizar banner: ' + error.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadBanners(); // Recarregar lista do banco
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
      order: 0
    });
  };

  // EVENTOS
  const loadEvents = async () => {
    try {
      console.log('Carregando eventos...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        throw error;
      }
      
      console.log('Eventos carregados:', data?.length || 0);
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEvents([]); // Garantir que sempre seja um array
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      // Mapear os dados do formulário para a estrutura do banco
      const eventData = {
        title: eventForm.title,
        slug: eventForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: eventForm.description,
        type: eventForm.type || 'Torneio',
        date: eventForm.date,
        prize: eventForm.prize,
        inscription_info: `Vagas: ${eventForm.max_participants || 'Ilimitadas'}`,
        max_participants: parseInt(eventForm.max_participants) || null,
        image_url: eventForm.image_url,
        active: true
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) throw error;
      
      await loadEvents(); // Recarregar lista do banco
      setShowEventForm(false); // Fechar formulário
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
      // Mapear os dados do formulário para a estrutura do banco
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        type: eventForm.type || 'Torneio',
        date: eventForm.date,
        prize: eventForm.prize,
        inscription_info: `Vagas: ${eventForm.max_participants || 'Ilimitadas'}`,
        max_participants: parseInt(eventForm.max_participants) || null,
        image_url: eventForm.image_url,
        active: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent);

      if (error) throw error;

      await loadEvents(); // Recarregar lista do banco
      setEditingEvent(null);
      setShowEventForm(false); // Fechar formulário
      resetEventForm();
      alert('Evento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      alert('Erro ao atualizar evento: ' + error.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadEvents(); // Recarregar lista do banco
      alert('Evento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento: ' + error.message);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      prize: '',
      max_participants: '',
      type: 'Torneio',
      image_url: ''
    });
  };

  // ==================== FUNÇÕES DE CUPONS ====================
  
  const loadCoupons = async () => {
    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar cupons:', error);
        return;
      }

      setCoupons(coupons || []);
    } catch (error) {
      console.error('Erro ao conectar com banco (cupons):', error);
    }
  };

  const saveCoupon = async () => {
    try {
      setLoading(true);

      const couponData = {
        code: couponForm.code.toUpperCase(),
        description: couponForm.description,
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        min_order_value: parseFloat(couponForm.min_order_value) || 0,
        max_uses: parseInt(couponForm.max_uses) || null,
        valid_until: couponForm.valid_until || null
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
        alert('Cupom atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert(couponData);

        if (error) throw error;
        alert('Cupom criado com sucesso!');
      }

      await loadCoupons();
      setShowCouponForm(false);
      setEditingCoupon(null);
      resetCouponForm();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      alert('Erro ao salvar cupom: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;

      await loadCoupons();
      alert(`Cupom ${coupon.is_active ? 'pausado' : 'ativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status do cupom:', error);
      alert('Erro ao alterar status do cupom: ' + error.message);
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadCoupons();
      alert('Cupom excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      alert('Erro ao excluir cupom: ' + error.message);
    }
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '',
      max_uses: '',
      valid_until: ''
    });
  };

  // PEDIDOS
  const loadOrders = async () => {
    try {
      console.log('Carregando pedidos...');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        throw error;
      }
      
      console.log('Pedidos carregados:', data?.length || 0);
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]); // Garantir que sempre seja um array
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      await loadOrders(); // Recarregar lista do banco
      alert('Status do pedido atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffd700';
      case 'processing': return '#00d9ff';
      case 'shipped': return '#ff6600';
      case 'delivered': return '#00ff00';
      case 'cancelled': return '#ff4444';
      default: return '#fff';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // CLIENTES
  const loadCustomers = async () => {
    try {
      console.log('Carregando clientes...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }
      
      console.log('Clientes carregados:', data?.length || 0);
      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setCustomers([]); // Garantir que sempre seja um array
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-modern">
        <div className="login-container-modern">
          <div className="login-header">
            <h1>🚀 CYBERLIFE ADMIN</h1>
            <p>Sistema Administrativo v3.0</p>
          </div>
          <form onSubmit={handleLogin} className="login-form-modern">
            <div className="input-group">
              <input
                type="password"
                placeholder="Digite sua senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" className="btn-login-modern">
                🔓 ENTRAR
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-modern">
      <div className="admin-container">
        {/* Header */}
        <header className="admin-header-modern">
          <div className="header-brand">
            <h1>🚀 CYBERLIFE ADMIN</h1>
            <span className="version">v3.0</span>
          </div>
          <div className="header-actions">
            <span className="admin-welcome">Bem-vindo, Administrador</span>
            <button onClick={() => onNavigate('/')} className="btn-home">
              🏠 SITE
            </button>
            <button onClick={handleLogout} className="btn-logout-modern">
              🚪 SAIR
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="admin-nav-modern">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard', color: '#00d9ff' },
            { id: 'products', icon: '📦', label: 'Produtos', color: '#00ff00' },
            { id: 'banners', icon: '🖼️', label: 'Banners', color: '#ff00ea' },
            { id: 'events', icon: '🏆', label: 'Eventos', color: '#ffd700' },
            { id: 'coupons', icon: '🎟️', label: 'Cupons', color: '#00d9ff' },
            { id: 'orders', icon: '🛒', label: 'Pedidos', color: '#ff6600' },
            { id: 'customers', icon: '👥', label: 'Clientes', color: '#9400d3' },
            { id: 'logs', icon: '📋', label: 'Logs', color: '#ff4444' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                borderColor: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? tab.color : '#fff'
              }}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="admin-content-modern">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <p>Carregando dados do banco...</p>
              </div>
            </div>
          )}
          
          {/* Dashboard refatorado será aqui */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-modern">
              <div className="dashboard-welcome">
                <h2>🎯 Dashboard Administrativo</h2>
                <p>Visão geral completa da sua loja</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card revenue">
                  <div className="stat-header">
                    <span className="stat-icon">💰</span>
                    <h3>Receita Total</h3>
                  </div>
                  <div className="stat-value">R$ {dashboardStats ? parseFloat(dashboardStats.total_revenue || 0).toFixed(2) : '0,00'}</div>
                  <div className="stat-footer">
                    <span>Vendas realizadas</span>
                  </div>
                </div>
                
                <div className="stat-card orders">
                  <div className="stat-header">
                    <span className="stat-icon">🛒</span>
                    <h3>Pedidos</h3>
                  </div>
                  <div className="stat-value">{dashboardStats?.total_orders || 0}</div>
                  <div className="stat-footer">
                    <span>{dashboardStats?.pending_orders || 0} pendentes</span>
                  </div>
                </div>
                
                <div className="stat-card products">
                  <div className="stat-header">
                    <span className="stat-icon">📦</span>
                    <h3>Produtos</h3>
                  </div>
                  <div className="stat-value">{dashboardStats?.total_products || 0}</div>
                  <div className="stat-footer">
                    <span>{dashboardStats?.low_stock_products || 0} estoque baixo</span>
                  </div>
                </div>
                
                <div className="stat-card customers">
                  <div className="stat-header">
                    <span className="stat-icon">👥</span>
                    <h3>Clientes</h3>
                  </div>
                  <div className="stat-value">{dashboardStats?.total_customers || 0}</div>
                  <div className="stat-footer">
                    <span>Usuários registrados</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>📋 Pedidos Recentes</h3>
                    <button onClick={() => setActiveTab('orders')} className="btn-link">Ver todos →</button>
                  </div>
                  <div className="card-content">
                    {recentOrders.length > 0 ? (
                      <div className="recent-orders">
                        {recentOrders.slice(0, 5).map(order => (
                          <div key={order.id} className="order-preview">
                            <div className="order-info">
                              <span className="order-id">#{order.order_number}</span>
                              <span className="order-customer">{order.user_name}</span>
                            </div>
                            <div className="order-meta">
                              <span className="order-value">R$ {parseFloat(order.total).toFixed(2)}</span>
                              <span className={`status ${order.status}`}>{order.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">Nenhum pedido encontrado</div>
                    )}
                  </div>
                </div>

                {lowStock.length > 0 && (
                  <div className="dashboard-card alert">
                    <div className="card-header">
                      <h3>⚠️ Estoque Baixo</h3>
                      <button onClick={() => setActiveTab('products')} className="btn-link">Gerenciar →</button>
                    </div>
                    <div className="card-content">
                      <div className="stock-alerts">
                        {lowStock.slice(0, 5).map(product => (
                          <div key={product.id} className="stock-alert">
                            <span className="product-name">{product.name}</span>
                            <span className="stock-level">{product.stock} unidades</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>🌟 Top Clientes</h3>
                    <button onClick={() => setActiveTab('customers')} className="btn-link">Ver todos →</button>
                  </div>
                  <div className="card-content">
                    {topCustomers.length > 0 ? (
                      <div className="top-customers">
                        {topCustomers.slice(0, 5).map(customer => (
                          <div key={customer.id} className="customer-preview">
                            <div className="customer-info">
                              <span className="customer-name">{customer.full_name || customer.nickname}</span>
                              <span className="customer-orders">{customer.total_orders} pedidos</span>
                            </div>
                            <span className="customer-value">R$ {parseFloat(customer.total_spent || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">Nenhum cliente encontrado</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Produtos modernos */}
          {activeTab === 'products' && (
            <div className="products-modern">
              <div className="section-header">
                <div className="section-title">
                  <h2>📦 Gerenciamento de Produtos</h2>
                  <p>Gerencie o catálogo da sua loja</p>
                </div>
              </div>

              <div className="products-layout">
                {/* Form Panel */}
                {showProductForm && (
                <div 
                  className="form-panel draggable"
                  style={{
                    left: `${productFormPosition.x}px`,
                    top: `${productFormPosition.y}px`,
                    cursor: isDragging === 'product' ? 'grabbing' : 'auto'
                  }}
                >
                  <div 
                    className="panel-header draggable-header"
                    onMouseDown={(e) => handleMouseDown(e, 'product')}
                    style={{ cursor: 'grab' }}
                  >
                    <h3>{editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}</h3>
                    <div className="header-buttons">
                      <button 
                        type="button" 
                        onClick={() => setShowProductForm(false)}
                        className="btn-close-float"
                        title="Fechar formulário"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="modern-form">
                    <div className="form-group">
                      <label>Nome do Produto</label>
                      <input
                        type="text"
                        placeholder="Ex: Funko Pop Batman"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Categoria</label>
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
                      
                      <div className="form-group">
                        <label>Tipo</label>
                        <input
                          type="text"
                          placeholder="Ex: Action Figures"
                          value={productForm.type}
                          onChange={(e) => setProductForm({...productForm, type: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Preço (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Estoque</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>URL da Imagem</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                      />
                      {productForm.image_url && (
                        <div className="image-preview">
                          <img 
                            src={productForm.image_url} 
                            alt="Preview" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                            onLoad={(e) => {
                              e.target.style.display = 'block';
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'none';
                              }
                            }}
                          />
                          <div className="preview-error" style={{display: 'none'}}>
                            ❌ Não foi possível carregar a imagem
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>URL da Imagem Hover (Opcional)</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/imagem-hover.jpg"
                        value={productForm.hover_image_url}
                        onChange={(e) => setProductForm({...productForm, hover_image_url: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea
                        placeholder="Descreva o produto..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        rows="4"
                        required
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        {editingProduct ? '✅ ATUALIZAR' : '➕ ADICIONAR'}
                      </button>
                      {editingProduct && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingProduct(null);
                            setShowProductForm(false);
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
                )}

                {/* Botão para mostrar form quando escondido */}
                {!showProductForm && (
                  <button 
                    onClick={() => {
                      setShowProductForm(true);
                      setProductFormPosition({ x: 30, y: 120 });
                    }}
                    className="btn-show-form"
                    title="Mostrar formulário de produto"
                  >
                    ➕ Novo Produto
                  </button>
                )}

                {/* List Panel */}
                <div className="list-panel">
                  <div className="panel-header">
                    <h3>📋 Produtos ({products.length})</h3>
                    <input
                      type="text"
                      placeholder="🔍 Buscar produtos..."
                      value={searchProduct}
                      onChange={(e) => {
                        setSearchProduct(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="search-input"
                    />
                  </div>
                  
                  <div className="products-grid-modern">
                    {(() => {
                      const filteredProducts = products.filter(p => 
                        searchProduct === '' ||
                        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchProduct.toLowerCase()) ||
                        p.type?.toLowerCase().includes(searchProduct.toLowerCase())
                      );
                      
                      if (filteredProducts.length === 0) {
                        return (
                          <div className="empty-state-modern">
                            <div className="empty-icon">📦</div>
                            <h4>Nenhum produto encontrado</h4>
                            <p>
                              {products.length === 0 
                                ? 'Comece adicionando produtos ou importe os dados.'
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
                        <div key={product.id} className="product-card-modern">
                          <div className="product-images">
                            <div className="image-container main-image">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  onLoad={(e) => {
                                    e.target.style.display = 'block';
                                    if (e.target.nextElementSibling) {
                                      e.target.nextElementSibling.style.display = 'none';
                                    }
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) {
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }
                                  }}
                                  style={{ display: 'block' }}
                                />
                              ) : null}
                              <div className="no-image" style={{display: product.image_url ? 'none' : 'flex'}}>
                                📷
                              </div>
                              <div className="image-label">Principal</div>
                            </div>
                            
                            <div className="image-container hover-image">
                              {product.hover_image_url ? (
                                <img 
                                  src={product.hover_image_url} 
                                  alt={`${product.name} - Hover`}
                                  onLoad={(e) => {
                                    e.target.style.display = 'block';
                                    if (e.target.nextElementSibling) {
                                      e.target.nextElementSibling.style.display = 'none';
                                    }
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) {
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }
                                  }}
                                  style={{ display: 'block' }}
                                />
                              ) : null}
                              <div className="no-image" style={{display: product.hover_image_url ? 'none' : 'flex'}}>
                                📷
                              </div>
                              <div className="image-label">Hover</div>
                            </div>
                          </div>
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <div className="product-meta">
                              <span className="category">{product.category}</span>
                              {product.type && <span className="type">{product.type}</span>}
                            </div>
                            <div className="product-price">R$ {parseFloat(product.price).toFixed(2)}</div>
                            <div className="product-stock">
                              <span className={product.stock < 10 ? 'low-stock' : 'normal-stock'}>
                                {product.stock} em estoque
                              </span>
                            </div>
                          </div>
                          <div className="product-actions">
                            <button 
                              onClick={() => {
                                setEditingProduct(product.id);
                                setProductForm(product);
                                setShowProductForm(true);
                                setProductFormPosition({ x: 30, y: 120 });
                              }}
                              className="btn-edit-modern"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="btn-delete-modern"
                              title="Excluir"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  
                  {/* Pagination */}
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
                      <div className="pagination-modern">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="btn-pagination-modern"
                        >
                          ← Anterior
                        </button>
                        
                        <span className="pagination-info">
                          Página {currentPage} de {totalPages}
                        </span>
                        
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="btn-pagination-modern"
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

          {/* Banners */}
          {activeTab === 'banners' && (
            <div className="banners-modern">
              <div className="section-header">
                <div className="section-title">
                  <h2>🖼️ Gerenciamento de Banners</h2>
                  <p>Gerencie os banners promocionais da loja</p>
                </div>
              </div>

              <div className="banners-layout">
                {/* Form Panel */}
                {showBannerForm && (
                <div 
                  className="form-panel draggable"
                  style={{
                    left: `${bannerFormPosition.x}px`,
                    top: `${bannerFormPosition.y}px`,
                    cursor: isDragging === 'banner' ? 'grabbing' : 'auto'
                  }}
                >
                  <div 
                    className="panel-header draggable-header"
                    onMouseDown={(e) => handleMouseDown(e, 'banner')}
                    style={{ cursor: 'grab' }}
                  >
                    <h3>{editingBanner ? '✏️ Editar Banner' : '➕ Novo Banner'}</h3>
                    <div className="header-buttons">
                      <button 
                        type="button" 
                        onClick={() => setShowBannerForm(false)}
                        className="btn-close-float"
                        title="Fechar formulário"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                  <form onSubmit={editingBanner ? handleUpdateBanner : handleAddBanner} className="modern-form">
                    <div className="form-group">
                      <label>Título</label>
                      <input
                        type="text"
                        placeholder="Ex: Super Promoção!"
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Desconto (%)</label>
                        <input
                          type="text"
                          placeholder="Ex: 20% OFF"
                          value={bannerForm.discount}
                          onChange={(e) => setBannerForm({...bannerForm, discount: e.target.value})}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Ordem</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={bannerForm.order}
                          onChange={(e) => setBannerForm({...bannerForm, order: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea
                        placeholder="Descrição do banner..."
                        value={bannerForm.description}
                        onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>URL da Imagem</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/banner.jpg"
                        value={bannerForm.image_url}
                        onChange={(e) => setBannerForm({...bannerForm, image_url: e.target.value})}
                      />
                      {bannerForm.image_url && (
                        <div className="image-preview">
                          <img src={bannerForm.image_url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>URL de Destino</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/pagina"
                        value={bannerForm.link_url}
                        onChange={(e) => setBannerForm({...bannerForm, link_url: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn-save-modern">
                        {editingBanner ? '💾 ATUALIZAR' : '➕ ADICIONAR'}
                      </button>
                      {editingBanner && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBanner(null);
                            setShowBannerForm(false);
                            resetBannerForm();
                          }}
                          className="btn-cancel-modern"
                        >
                          ❌ CANCELAR
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                )}

                {/* Botão para mostrar form quando escondido */}
                {!showBannerForm && (
                  <button 
                    onClick={() => {
                      setShowBannerForm(true);
                      setBannerFormPosition({ x: 30, y: 120 });
                    }}
                    className="btn-show-form"
                    title="Mostrar formulário de banner"
                  >
                    ➕ Novo Banner
                  </button>
                )}
                
                <div className="content-panel">
                  <div className="panel-header">
                    <h3>📋 Lista de Banners ({banners.length})</h3>
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="🔍 Buscar banners..."
                        value={searchBanner}
                        onChange={(e) => setSearchBanner(e.target.value)}
                        className="search-input-modern"
                      />
                    </div>
                  </div>
                  
                  <div className="banners-grid">
                    {banners
                      .filter(banner => 
                        searchBanner === '' ||
                        banner.title.toLowerCase().includes(searchBanner.toLowerCase()) ||
                        banner.description?.toLowerCase().includes(searchBanner.toLowerCase())
                      )
                      .map(banner => (
                        <div key={banner.id} className="banner-card">
                          <div className="banner-image">
                            {banner.image_url ? (
                              <img src={banner.image_url} alt={banner.title} />
                            ) : (
                              <div className="no-image">🖼️</div>
                            )}
                            <div className="banner-order">#{banner.order}</div>
                          </div>
                          
                          <div className="banner-info">
                            <h4>{banner.title}</h4>
                            {banner.discount && (
                              <div className="banner-discount">{banner.discount}</div>
                            )}
                            {banner.description && (
                              <p className="banner-description">{banner.description}</p>
                            )}
                            {banner.link_url && (
                              <div className="banner-link">
                                <a href={banner.link_url} target="_blank" rel="noopener noreferrer">🔗 Ver Link</a>
                              </div>
                            )}
                          </div>
                          
                          <div className="banner-actions">
                            <button 
                              onClick={() => {
                                setEditingBanner(banner.id);
                                setBannerForm({
                                  title: banner.title || '',
                                  discount: banner.discount || '',
                                  description: banner.description || '',
                                  image_url: banner.image_url || '',
                                  link_url: banner.link_url || '',
                                  order: banner.order || 0
                                });
                                setShowBannerForm(true);
                                setBannerFormPosition({ x: 30, y: 120 });
                              }}
                              className="btn-edit-modern"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="btn-delete-modern"
                              title="Excluir"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eventos */}
          {activeTab === 'events' && (
            <div className="events-modern">
              <div className="section-header">
                <div className="section-title">
                  <h2>🏆 Gerenciamento de Eventos</h2>
                  <p>Organize torneios e eventos da loja</p>
                </div>
              </div>

              <div className="events-layout">
                {/* Form Panel */}
                {showEventForm && (
                <div 
                  className="form-panel draggable"
                  style={{
                    left: `${eventFormPosition.x}px`,
                    top: `${eventFormPosition.y}px`,
                    cursor: isDragging === 'event' ? 'grabbing' : 'auto'
                  }}
                >
                  <div 
                    className="panel-header draggable-header"
                    onMouseDown={(e) => handleMouseDown(e, 'event')}
                    style={{ cursor: 'grab' }}
                  >
                    <h3>{editingEvent ? '✏️ Editar Evento' : '➕ Novo Evento'}</h3>
                    <div className="header-buttons">
                      <button 
                        type="button" 
                        onClick={() => setShowEventForm(false)}
                        className="btn-close-float"
                        title="Fechar formulário"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                  <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent} className="modern-form">
                    <div className="form-group">
                      <label>Título do Evento</label>
                      <input
                        type="text"
                        placeholder="Ex: Torneio de FIFA 25"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Data</label>
                        <input
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Horário</label>
                        <input
                          type="time"
                          value={eventForm.time}
                          onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Tipo</label>
                        <select
                          value={eventForm.type}
                          onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                        >
                          <option value="Torneio">🏆 Torneio</option>
                          <option value="Corujão">🦉 Corujão</option>
                          <option value="Rush Play">⚡ Rush Play</option>
                          <option value="Campeonato">🏅 Campeonato</option>
                          <option value="Outro">🎮 Outro</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Max Participantes</label>
                        <input
                          type="number"
                          placeholder="16"
                          value={eventForm.max_participants}
                          onChange={(e) => setEventForm({...eventForm, max_participants: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Prêmio</label>
                      <input
                        type="text"
                        placeholder="Ex: Produto da loja + troféu"
                        value={eventForm.prize}
                        onChange={(e) => setEventForm({...eventForm, prize: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>URL da Imagem</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/evento.jpg"
                        value={eventForm.image_url}
                        onChange={(e) => setEventForm({...eventForm, image_url: e.target.value})}
                      />
                      {eventForm.image_url && (
                        <div className="image-preview">
                          <img src={eventForm.image_url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea
                        placeholder="Descrição detalhada do evento..."
                        value={eventForm.description}
                        onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn-save-modern">
                        {editingEvent ? '💾 ATUALIZAR' : '➕ ADICIONAR'}
                      </button>
                      {editingEvent && (
                        <button
                          type="button" 
                          onClick={() => {
                            setEditingEvent(null);
                            setShowEventForm(false);
                            resetEventForm();
                          }}
                          className="btn-cancel-modern"
                        >
                          ❌ CANCELAR
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                )}

                {/* Botão para mostrar form quando escondido */}
                {!showEventForm && (
                  <button 
                    onClick={() => {
                      setShowEventForm(true);
                      setEventFormPosition({ x: 30, y: 120 });
                    }}
                    className="btn-show-form"
                    title="Mostrar formulário de evento"
                  >
                    ➕ Novo Evento
                  </button>
                )}
                
                <div className="content-panel">
                  <div className="panel-header">
                    <h3>📋 Lista de Eventos ({events.length})</h3>
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="🔍 Buscar eventos..."
                        value={searchEvent}
                        onChange={(e) => setSearchEvent(e.target.value)}
                        className="search-input-modern"
                      />
                    </div>
                  </div>
                  
                  <div className="events-grid">
                    {events
                      .filter(event => 
                        searchEvent === '' ||
                        event.title.toLowerCase().includes(searchEvent.toLowerCase()) ||
                        event.description?.toLowerCase().includes(searchEvent.toLowerCase()) ||
                        event.type.toLowerCase().includes(searchEvent.toLowerCase())
                      )
                      .map(event => (
                        <div key={event.id} className="event-card">
                          <div className="event-image">
                            {event.image_url ? (
                              <img src={event.image_url} alt={event.title} />
                            ) : (
                              <div className="no-image">
                                {event.type === 'tournament' && '🏆'}
                                {event.type === 'workshop' && '🎓'}
                                {event.type === 'launch' && '🚀'}
                                {event.type === 'promo' && '🎉'}
                              </div>
                            )}
                          </div>
                          
                          <div className="event-content">
                            <div className="event-header">
                              <div className="event-type">
                                {event.type === 'tournament' && '🏆'}
                                {event.type === 'workshop' && '🎓'}
                                {event.type === 'launch' && '🚀'}
                                {event.type === 'promo' && '🎉'}
                              </div>
                              <h4>{event.title}</h4>
                            </div>
                            
                            <div className="event-datetime">
                              <span className="date">📅 {new Date(event.date).toLocaleDateString('pt-BR')}</span>
                              <span className="time">⏰ {event.time}</span>
                            </div>
                            
                            {event.max_participants && (
                              <div className="event-participants">
                                👥 Máx: {event.max_participants} participantes
                              </div>
                            )}
                            
                            {event.prize && (
                              <div className="event-prize">
                                🎁 {event.prize}
                              </div>
                            )}
                            
                            <div className="event-description">
                              {event.description}
                            </div>
                            
                            <div className="event-actions">
                              <button 
                                onClick={() => {
                                  setEditingEvent(event.id);
                                  setEventForm({
                                    title: event.title || '',
                                    description: event.description || '',
                                    date: event.date || '',
                                    time: '', // Campo não existe no banco
                                    prize: event.prize || '',
                                    max_participants: event.max_participants || '',
                                    type: event.type || 'Torneio',
                                    image_url: event.image_url || ''
                                  });
                                  setShowEventForm(true);
                                  setEventFormPosition({ x: 30, y: 120 });
                                }}
                                className="btn-edit-modern"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="btn-delete-modern"
                                title="Excluir"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cupons */}
          {activeTab === 'coupons' && (
            <div className="coupons-modern">
              <div className="section-header">
                <div className="section-title">
                  <h2>🎟️ Gerenciamento de Cupons</h2>
                  <p>Crie e gerencie cupons de desconto</p>
                </div>
              </div>

              <div className="section-content">
                {/* Formulário de Cupom */}
                {showCouponForm && (
                <div 
                  className="form-panel draggable"
                  style={{
                    left: `${couponFormPosition.x}px`,
                    top: `${couponFormPosition.y}px`,
                    cursor: isDragging === 'coupon' ? 'grabbing' : 'auto'
                  }}
                >
                  <div 
                    className="panel-header draggable-header"
                    onMouseDown={(e) => handleMouseDown(e, 'coupon')}
                    style={{ cursor: 'grab' }}
                  >
                    <h3>{editingCoupon ? '✏️ Editar Cupom' : '➕ Novo Cupom'}</h3>
                    <div className="header-buttons">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowCouponForm(false);
                          setEditingCoupon(null);
                          resetCouponForm();
                        }}
                        className="btn-close-float"
                        title="Fechar formulário"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                  <form className="modern-form" onSubmit={(e) => { e.preventDefault(); saveCoupon(); }}>
                    <div className="form-group">
                      <label>Código do Cupom</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                        placeholder="Ex: CYBER10"
                        required
                        disabled={editingCoupon}
                      />
                    </div>

                    <div className="form-group">
                      <label>Descrição</label>
                      <input
                        type="text"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                        placeholder="Ex: 10% de desconto"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Tipo de Desconto</label>
                        <select
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({...couponForm, discount_type: e.target.value})}
                          required
                        >
                          <option value="percentage">📊 Percentual (%)</option>
                          <option value="fixed">💰 Valor Fixo (R$)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Valor do Desconto</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({...couponForm, discount_value: e.target.value})}
                          placeholder={couponForm.discount_type === 'percentage' ? '10' : '20.00'}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Valor Mínimo do Pedido (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={couponForm.min_order_value}
                          onChange={(e) => setCouponForm({...couponForm, min_order_value: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group">
                        <label>Máximo de Usos</label>
                        <input
                          type="number"
                          min="1"
                          value={couponForm.max_uses}
                          onChange={(e) => setCouponForm({...couponForm, max_uses: e.target.value})}
                          placeholder="Ilimitado"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Data de Expiração</label>
                      <input
                        type="date"
                        value={couponForm.valid_until}
                        onChange={(e) => setCouponForm({...couponForm, valid_until: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={loading}>
                        💾 {loading ? 'Salvando...' : (editingCoupon ? 'Atualizar' : 'Criar')} Cupom
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowCouponForm(false);
                          setEditingCoupon(null);
                          resetCouponForm();
                        }}
                        className="btn-secondary"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </form>
                </div>
                )}

                {/* Botão para mostrar form quando escondido */}
                {!showCouponForm && (
                  <button 
                    onClick={() => {
                      setShowCouponForm(true);
                      setCouponFormPosition({ x: 30, y: 120 });
                      resetCouponForm();
                      setEditingCoupon(null);
                    }}
                    className="btn-show-form"
                    title="Mostrar formulário de cupom"
                  >
                    ➕ Novo Cupom
                  </button>
                )}

                <div className="section-filters">
                  <input
                    type="text"
                    placeholder="🔍 Buscar cupons..."
                    value={searchCoupon}
                    onChange={(e) => setSearchCoupon(e.target.value)}
                    className="search-input"
                  />
                  
                  <div className="filter-stats">
                    <div className="stat-item">
                      <span className="stat-number">{coupons.filter(c => c.is_active).length}</span>
                      <span className="stat-label">Ativos</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{coupons.filter(c => !c.is_active).length}</span>
                      <span className="stat-label">Pausados</span>
                    </div>
                  </div>
                </div>

                <div className="data-grid">
                  <h3>🎟️ Lista de Cupons ({coupons.length})</h3>
                  
                  <div className="grid-container">
                    {coupons
                      .filter(coupon => 
                        coupon.code.toLowerCase().includes(searchCoupon.toLowerCase()) ||
                        coupon.description.toLowerCase().includes(searchCoupon.toLowerCase())
                      )
                      .map(coupon => (
                        <div key={coupon.id} className={`grid-item ${!coupon.is_active ? 'inactive' : ''}`}>
                          <div className="coupon-header">
                            <div className="coupon-code">
                              <strong>{coupon.code}</strong>
                              <span className={`coupon-status ${coupon.is_active ? 'active' : 'inactive'}`}>
                                {coupon.is_active ? '✅ Ativo' : '⏸️ Pausado'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="coupon-info">
                            <div className="coupon-discount">
                              {coupon.discount_type === 'percentage' 
                                ? `${coupon.discount_value}% de desconto`
                                : `R$ ${coupon.discount_value} de desconto`
                              }
                            </div>
                            
                            {coupon.min_order_value > 0 && (
                              <div className="coupon-min">
                                💰 Pedido mínimo: R$ {coupon.min_order_value}
                              </div>
                            )}
                            
                            {coupon.max_uses && (
                              <div className="coupon-usage">
                                📊 Usos: {coupon.current_uses || 0}/{coupon.max_uses}
                              </div>
                            )}
                            
                            {coupon.valid_until && (
                              <div className="coupon-expiry">
                                📅 Válido até: {new Date(coupon.valid_until).toLocaleDateString()}
                              </div>
                            )}
                            
                            <div className="coupon-description">
                              {coupon.description}
                            </div>
                          </div>
                          
                          <div className="coupon-actions">
                            <button 
                              onClick={() => {
                                setCouponForm({
                                  code: coupon.code,
                                  description: coupon.description,
                                  discount_type: coupon.discount_type,
                                  discount_value: coupon.discount_value.toString(),
                                  min_order_value: coupon.min_order_value.toString(),
                                  max_uses: coupon.max_uses?.toString() || '',
                                  valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : ''
                                });
                                setEditingCoupon(coupon);
                                setShowCouponForm(true);
                              }}
                              className="action-btn edit-btn"
                            >
                              ✏️
                            </button>
                            
                            <button 
                              onClick={() => toggleCouponStatus(coupon)}
                              className={`action-btn ${coupon.is_active ? 'pause-btn' : 'play-btn'}`}
                            >
                              {coupon.is_active ? '⏸️' : '▶️'}
                            </button>
                            
                            <button 
                              onClick={() => deleteCoupon(coupon.id)}
                              className="action-btn delete-btn"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {coupons.length === 0 && (
                    <div className="no-data">
                      <p>🎟️ Nenhum cupom cadastrado ainda.</p>
                      <button 
                        onClick={() => {
                          setShowCouponForm(true);
                          resetCouponForm();
                          setEditingCoupon(null);
                        }}
                        className="create-first-btn"
                      >
                        Criar Primeiro Cupom
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pedidos */}
          {activeTab === 'orders' && (
            <div className="orders-modern">
              <div className="section-header">
                <div className="section-title">
                  <h2>🛒 Gerenciamento de Pedidos</h2>
                  <p>Acompanhe e gerencie todos os pedidos</p>
                </div>
                <div className="section-actions">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="🔍 Buscar pedidos..."
                      value={searchOrder}
                      onChange={(e) => setSearchOrder(e.target.value)}
                      className="search-input-modern"
                    />
                  </div>
                </div>
              </div>

              <div className="orders-grid">
                {orders
                  .filter(order => 
                    searchOrder === '' ||
                    order.order_number?.toString().includes(searchOrder) ||
                    order.user_name?.toLowerCase().includes(searchOrder.toLowerCase()) ||
                    order.status?.toLowerCase().includes(searchOrder.toLowerCase())
                  )
                  .map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h4>#{order.order_number || order.id}</h4>
                          <span className="order-date">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div 
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </div>
                      </div>
                      
                      <div className="order-customer">
                        <span className="customer-name">
                          👤 {order.user_name || order.customer_name || 'Cliente não informado'}
                        </span>
                        {order.customer_email && (
                          <span className="customer-email">📧 {order.customer_email}</span>
                        )}
                      </div>
                      
                      <div className="order-total">
                        💰 R$ {parseFloat(order.total || 0).toFixed(2)}
                      </div>
                      
                      {order.items_count && (
                        <div className="order-items">
                          📦 {order.items_count} itens
                        </div>
                      )}
                      
                      <div className="order-actions">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">⏳ Pendente</option>
                          <option value="processing">⚙️ Processando</option>
                          <option value="shipped">🚚 Enviado</option>
                          <option value="delivered">✅ Entregue</option>
                          <option value="cancelled">❌ Cancelado</option>
                        </select>
                        
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="btn-view-modern"
                          title="Ver Detalhes"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Clientes */}
          {activeTab === 'customers' && (
            <div className="customers-modern">
              <div className="section-header">
                <div className="section-title">
                  <h2>👥 Gerenciamento de Clientes</h2>
                  <p>Visualize informações dos clientes cadastrados</p>
                </div>
                <div className="section-actions">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="🔍 Buscar clientes..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="search-input-modern"
                    />
                  </div>
                </div>
              </div>

              <div className="customers-grid">
                {customers
                  .filter(customer => 
                    searchCustomer === '' ||
                    customer.full_name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                    customer.nickname?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(searchCustomer.toLowerCase())
                  )
                  .map(customer => (
                    <div key={customer.id} className="customer-card">
                      <div className="customer-avatar">
                        {customer.avatar_url ? (
                          <img src={customer.avatar_url} alt={customer.full_name} />
                        ) : (
                          <div className="avatar-placeholder">👤</div>
                        )}
                      </div>
                      
                      <div className="customer-info">
                        <h4>{customer.full_name || customer.nickname || 'Nome não informado'}</h4>
                        
                        {customer.email && (
                          <div className="customer-email">
                            📧 {customer.email}
                          </div>
                        )}
                        
                        {customer.phone && (
                          <div className="customer-phone">
                            📱 {customer.phone}
                          </div>
                        )}
                        
                        <div className="customer-joined">
                          📅 Cadastro: {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        
                        {customer.total_orders && (
                          <div className="customer-stats">
                            <span className="orders-count">🛒 {customer.total_orders} pedidos</span>
                            {customer.total_spent && (
                              <span className="total-spent">💰 R$ {parseFloat(customer.total_spent).toFixed(2)}</span>
                            )}
                          </div>
                        )}
                        
                        {customer.last_login && (
                          <div className="customer-last-login">
                            🕐 Último acesso: {new Date(customer.last_login).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                      
                      <div className="customer-actions">
                        <button 
                          className="btn-view-modern"
                          title="Ver Pedidos"
                          onClick={() => {
                            setSearchOrder(customer.email || customer.full_name || '');
                            setActiveTab('orders');
                          }}
                        >
                          🛒
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <AccessLogsView />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel3;