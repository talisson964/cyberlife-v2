import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AccessLogsView from '../components/AccessLogsView';
import MissionsManager from '../components/MissionsManager';
import { stopAudio } from '../utils/audioPlayer';
import { allProducts } from '../data/lojaData';
import './AdminPanel3.css';

const AdminPanel3 = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cyberPointsCustomers, setCyberPointsCustomers] = useState([]);
  const [searchCyberPointsCustomer, setSearchCyberPointsCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCyberPointsModal, setShowCyberPointsModal] = useState(false);
  const [cyberPointsChange, setCyberPointsChange] = useState({ operation: 'add', points: 0, reason: '' });

  // Função para upload de imagem da insígnia
  const handleBadgeImageUpload = async (file) => {
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF)');
      return;
    }

    // Verificar tamanho do arquivo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setBadgeImageFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setBadgeImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Função para upload da imagem para o storage do Supabase
  const uploadBadgeImageToStorage = async (file, badgeId) => {
    if (!file) return null;

    const fileName = `badges/${badgeId}/insignia_${Date.now()}_${file.name}`;

    try {
      const { data, error } = await supabase.storage
        .from('badge-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('badge-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem da insígnia:', error);
      return null;
    }
  };

  // Estados para insígnias
  const [badges, setBadges] = useState([]);
  const [editingBadge, setEditingBadge] = useState(null);
  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [searchBadge, setSearchBadge] = useState('');
  const [badgeFormPosition, setBadgeFormPosition] = useState({ x: 30, y: 120 });
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    image_url: '',
    icon_url: '',
    rarity: 'comum'
  });
  const [badgeImageFile, setBadgeImageFile] = useState(null);
  const [badgeImagePreview, setBadgeImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para atribuição de insígnias
  const [showAssignBadgeModal, setShowAssignBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [customersForAssignment, setCustomersForAssignment] = useState([]);
  const [selectedCustomerForAssignment, setSelectedCustomerForAssignment] = useState('');
  const [searchCustomerForAssignment, setSearchCustomerForAssignment] = useState('');

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
    price: '',
    image_url: '',
    description: '',
    stock: 0
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');

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
    order: 0,
    active: true
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
    inscription_price: '',
    max_participants: '',
    type: 'Torneio',
    status: 'pending',
    game_name: '',
    image_url: ''
  });

  // Estados para upload de imagem do evento
  const [eventImageFile, setEventImageFile] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState('');

  // Função para upload da imagem do evento para o storage do Supabase
  const uploadEventImageToStorage = async (file, eventId) => {
    if (!file) return null;

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF)');
      return null;
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `events/${eventId}/event_image_${Date.now()}.${fileExt}`;

      // Fazer upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('product-images') // Usando o mesmo bucket que outros uploads
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl }, error: urlError } = await supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem do evento:', error);
      alert('Erro ao fazer upload da imagem do evento: ' + error.message);
      return null;
    }
  };

  // Função para manipular o upload de imagem do evento
  const handleEventImageUpload = async (file) => {
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF)');
      return;
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setEventImageFile(file);

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      setEventImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Pedidos
  const [orders, setOrders] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Clientes
  const [customers, setCustomers] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');

  // Estados para gerenciamento de insígnias do cliente
  const [showManageBadgesModal, setShowManageBadgesModal] = useState(false);
  const [selectedCustomerBadges, setSelectedCustomerBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  // Estados para gerenciamento de lives
  const [lives, setLives] = useState([]);
  const [editingLive, setEditingLive] = useState(null);
  const [searchLive, setSearchLive] = useState('');
  const [showLiveForm, setShowLiveForm] = useState(false);
  const [liveFormPosition, setLiveFormPosition] = useState({ x: 30, y: 120 });
  const [liveForm, setLiveForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    stream_url: '',
    viewer_count: 0,
    status: 'draft',
    game_name: '',
    started_at: ''
  });

  // Preview Modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState(null); // 'product', 'banner', 'event'
  const [previewData, setPreviewData] = useState(null);

  // Parar música (exceto em dispositivos móveis)
  useEffect(() => {
    // Detectar se é um dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Só para o áudio se não for mobile
    if (!isMobile) {
      stopAudio();
    }
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
        loadOrders(),
        loadCustomers(),
        loadCyberPointsCustomers(),
        loadCustomersForAssignment() // Carregar clientes para atribuição de insígnias
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

  // Função para abrir o preview
  const openPreview = (type, data) => {
    setPreviewType(type);
    setPreviewData(data);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewType(null);
    setPreviewData(null);
  };

  // Recarregar dados quando muda de aba
  useEffect(() => {
    if (isAuthenticated) {
      switch (activeTab) {
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
        case 'cyberpoints':
          loadCyberPointsCustomers();
          break;
        case 'badges':
          loadBadges();
          loadCustomersForAssignment(); // Carregar clientes para atribuição de insígnias
          break;
        case 'lives':
          loadLives();
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

      // Carregar estatísticas principais
      const { data: stats, error: statsError } = await supabase
        .rpc('get_dashboard_stats');

      // Se a função RPC não existir, calcular estatísticas manualmente
      if (statsError) {
        console.warn('Função RPC get_dashboard_stats não encontrada:', statsError.message);

        // Calcular receita total a partir dos pedidos completos
        const { data: completedOrders, error: ordersTotalError } = await supabase
          .from('orders')
          .select('total')
          .eq('status', 'completed');

        let totalRevenue = 0;
        if (!ordersTotalError && completedOrders) {
          totalRevenue = completedOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        }

        // Definir estatísticas com cálculos manuais
        setDashboardStats({
          total_revenue: totalRevenue,
          total_orders: 0, // Será atualizado posteriormente
          total_customers: 0, // Será atualizado posteriormente
          total_products: 0, // Será atualizado posteriormente
          low_stock_products: 0,
          pending_orders: 0 // Será atualizado posteriormente
        });
      } else {
        setDashboardStats(stats[0] || {
          total_revenue: 0,
          total_orders: 0,
          total_customers: 0,
          total_products: 0,
          low_stock_products: 0,
          pending_orders: 0
        });
      }

      // Carregar pedidos recentes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name, nickname)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) {
        console.warn('Erro ao carregar pedidos recentes:', ordersError.message);
        setRecentOrders([]);
      } else {
        // Processar os dados para ter o formato esperado
        const processedOrders = orders.map(order => ({
          id: order.id,
          order_number: order.id,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
          user_name: order.profiles?.full_name || order.profiles?.nickname || 'Cliente'
        }));
        setRecentOrders(processedOrders);

        // Calcular estatísticas de pedidos
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;

        // Atualizar as estatísticas com a contagem real de pedidos
        setDashboardStats(prevStats => ({
          ...prevStats,
          total_orders: totalOrders,
          pending_orders: pendingOrders
        }));
      }

      // Carregar clientes
      const { data: customers, error: customersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (customersError) {
        console.warn('Erro ao carregar clientes:', customersError.message);
        setTopCustomers([]);
      } else {
        setTopCustomers(customers);
      }

      // Carregar contagem total de clientes para estatísticas
      const { count: totalCustomersCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.warn('Erro ao contar clientes:', countError.message);
      } else {
        // Atualizar as estatísticas com a contagem real de clientes
        setDashboardStats(prevStats => ({
          ...prevStats,
          total_customers: totalCustomersCount || 0
        }));
      }

      // Carregar categorias/produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.warn('Erro ao carregar produtos:', productsError.message);
        setSalesByCategory([]);
      } else {
        // Agrupar produtos por categoria para simular vendas por categoria
        const productsByCategory = products.reduce((acc, product) => {
          const category = acc.find(cat => cat.category === product.category);
          if (category) {
            category.count = (category.count || 0) + 1;
          } else {
            acc.push({ category: product.category, count: 1 });
          }
          return acc;
        }, []);
        setSalesByCategory(productsByCategory);
      }

      // Carregar contagem total de produtos para estatísticas
      const { count: totalProductsCount, error: productsCountError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsCountError) {
        console.warn('Erro ao contar produtos:', productsCountError.message);
      } else {
        // Atualizar as estatísticas com a contagem real de produtos
        setDashboardStats(prevStats => ({
          ...prevStats,
          total_products: totalProductsCount || 0
        }));
      }

      // Carregar produtos com estoque baixo
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 5)
        .gt('stock', 0)
        .order('stock', { ascending: true })
        .limit(10);

      const { data: outOfStockData, error: outOfStockError } = await supabase
        .from('products')
        .select('*')
        .eq('stock', 0)
        .limit(10);

      if (lowStockError) {
        console.warn('Erro ao carregar produtos com estoque baixo:', lowStockError.message);
      }
      if (outOfStockError) {
        console.warn('Erro ao carregar produtos sem estoque:', outOfStockError.message);
      }

      const allLowStock = [
        ...(lowStockData || []),
        ...(outOfStockData || [])
      ];
      setLowStock(allLowStock);

      console.log('Dados do dashboard carregados');

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Definir valores padrão em caso de erro
      setDashboardStats({
        total_revenue: 0,
        total_orders: 0,
        total_customers: 0,
        total_products: 0,
        low_stock_products: 0,
        pending_orders: 0
      });
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
      setProducts([]);
    }
  };

  // Função para upload de imagem do produto para o Supabase Storage
  const uploadProductImageToStorage = async (file, productId) => {
    if (!file) return null;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF)');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `products/${productId || 'new'}/product_image_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem do produto:', error);
      return null;
    }
  };

  // Função para manipular o upload de imagem do produto
  const handleProductImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setProductImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setProductImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Função para importar produtos do lojaData.js para o banco
  const importProductsFromLojaData = async () => {
    try {
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
        price: parseFloat(product.price.replace('R$ ', '').replace(',', '.')),
        image_url: product.image,
        description: product.description,
        stock: Math.floor(Math.random() * 50) + 10
      }));

      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) throw error;

      await loadProducts();
      alert(`${data.length} produtos importados com sucesso do lojaData.js!`);
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      alert('Erro ao importar produtos: ' + error.message);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = productForm.image_url;

      // Se houver imagem local para upload, fazer upload
      if (productImageFile) {
        const uploadedImageUrl = await uploadProductImageToStorage(productImageFile, null);
        if (uploadedImageUrl) {
          finalImageUrl = uploadedImageUrl;
        }
      }

      // Inserir produto
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productForm.name,
          category: productForm.category,
          price: parsePriceToNumber(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          image_url: finalImageUrl,
          description: productForm.description
        }])
        .select();

      if (error) throw error;

      await loadProducts();
      setShowProductForm(false);
      resetProductForm();
      setProductImageFile(null);
      setProductImagePreview('');
      alert('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = productForm.image_url;

      // Se houver imagem local para upload, fazer upload
      if (productImageFile) {
        const uploadedImageUrl = await uploadProductImageToStorage(productImageFile, editingProduct);
        if (uploadedImageUrl) {
          finalImageUrl = uploadedImageUrl;
        }
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: productForm.name,
          category: productForm.category,
          price: parsePriceToNumber(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          image_url: finalImageUrl,
          description: productForm.description
        })
        .eq('id', editingProduct);

      if (error) throw error;

      await loadProducts();
      setEditingProduct(null);
      setShowProductForm(false);
      resetProductForm();
      setProductImageFile(null);
      setProductImagePreview('');
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    } finally {
      setLoading(false);
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
      price: '',
      image_url: '',
      description: '',
      stock: 0
    });
  };

  // FORMATAÇÃO AUTOMÁTICA
  const formatPrice = (value) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    // Converte para número e formata
    const numberValue = parseInt(numbers) / 100;
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const parsePriceToNumber = (formattedPrice) => {
    // Remove "R$", espaços, e converte vírgula para ponto
    const cleaned = formattedPrice.replace(/[R$\s]/g, '').replace(',', '.');
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
  };

  const handlePriceChange = (value) => {
    const formatted = formatPrice(value);
    setProductForm({ ...productForm, price: formatted });
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
      } else if (isDragging === 'live') {
        setLiveFormPosition({ x: newX, y: newY });
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
      const bannerData = {
        title: bannerForm.title,
        discount: bannerForm.discount,
        description: bannerForm.description,
        image_url: bannerForm.image_url,
        link_url: bannerForm.link_url,
        order: parseInt(bannerForm.order || 0),
        active: true
      };

      const { data, error } = await supabase
        .from('banners')
        .insert([bannerData])
        .select();

      if (error) throw error;

      await loadBanners();
      setShowBannerForm(false);
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
      const bannerData = {
        title: bannerForm.title,
        discount: bannerForm.discount,
        description: bannerForm.description,
        image_url: bannerForm.image_url,
        link_url: bannerForm.link_url,
        order: parseInt(bannerForm.order || 0),
        active: true
      };

      const { error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', editingBanner);

      if (error) throw error;

      await loadBanners();
      setEditingBanner(null);
      setShowBannerForm(false);
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
      order: 0,
      active: true
    });
  };

  // EVENTOS
  const loadEvents = async () => {
    try {
      console.log('Carregando eventos...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false, nullsFirst: false });

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
      let imageUrl = eventForm.image_url || '/images/default-event.png';

      // Se houver imagem local para upload, fazer upload
      if (eventImageFile) {
        const { data: eventData, error: insertError } = await supabase
          .from('events')
          .insert([{
            title: eventForm.title,
            description: eventForm.description || 'Evento sem descrição',
            type: eventForm.type || 'Torneio',
            status: eventForm.status || 'pending',
            date: eventForm.date || null,
            inscription_price: eventForm.inscription_price ? parseInt(eventForm.inscription_price) : null,
            max_participants: parseInt(eventForm.max_participants) || null,
            game_name: eventForm.game_name || null,
            image_url: '/images/default-event.png'
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        const uploadedImageUrl = await uploadEventImageToStorage(eventImageFile, eventData.id);
        if (uploadedImageUrl) {
          const { error: updateError } = await supabase
            .from('events')
            .update({ image_url: uploadedImageUrl })
            .eq('id', eventData.id);

          if (updateError) throw updateError;
          imageUrl = uploadedImageUrl;
        }
      }

      if (!eventImageFile) {
        const { data, error } = await supabase
          .from('events')
          .insert([{
            title: eventForm.title,
            description: eventForm.description || 'Evento sem descrição',
            type: eventForm.type || 'Torneio',
            status: eventForm.status || 'pending',
            date: eventForm.date || null,
            inscription_price: eventForm.inscription_price ? parseInt(eventForm.inscription_price) : null,
            max_participants: parseInt(eventForm.max_participants) || null,
            game_name: eventForm.game_name || null,
            image_url: imageUrl
          }])
          .select();

        if (error) throw error;
      }

      await loadEvents();
      setShowEventForm(false);
      resetEventForm();
      setEventImageFile(null);
      setEventImagePreview('');
      alert('Evento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      alert('Erro ao adicionar evento: ' + error.message);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = eventForm.image_url || '/images/default-event.png';

      if (eventImageFile) {
        const uploadedImageUrl = await uploadEventImageToStorage(eventImageFile, editingEvent);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }

      const eventData = {
        title: eventForm.title,
        description: eventForm.description || 'Evento sem descrição',
        type: eventForm.type || 'Torneio',
        status: eventForm.status || 'pending',
        date: eventForm.date || null,
        inscription_price: eventForm.inscription_price ? parseInt(eventForm.inscription_price) : null,
        max_participants: parseInt(eventForm.max_participants) || null,
        game_name: eventForm.game_name || null,
        image_url: imageUrl
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent);

      if (error) throw error;

      await loadEvents();
      setEditingEvent(null);
      setShowEventForm(false);
      resetEventForm();
      setEventImageFile(null);
      setEventImagePreview('');
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
      inscription_price: '',
      max_participants: '',
      type: 'Torneio',
      status: 'pending',
      game_name: '',
      image_url: ''
    });
    setEventImageFile(null);
    setEventImagePreview('');
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
    switch (status) {
      case 'pending': return '#ffd700';
      case 'processing': return '#00d9ff';
      case 'shipped': return '#ff6600';
      case 'delivered': return '#00ff00';
      case 'cancelled': return '#ff4444';
      default: return '#fff';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
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

      // Primeiro tenta com o client normal
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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

  // Função para carregar todas as insígnias
  const loadAllBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setAllBadges(data || []);
    } catch (error) {
      console.error('Erro ao carregar insígnias:', error);
      setAllBadges([]);
      alert('Erro ao carregar insígnias: ' + error.message);
    }
  };

  // Função para carregar insígnias do cliente
  const loadCustomerBadges = async (customerId) => {
    try {
      setLoadingBadges(true);

      // Carregar todas as insígnias
      await loadAllBadges();

      // Carregar insígnias do cliente
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', customerId);

      if (error) throw error;

      setSelectedCustomerBadges(data || []);
    } catch (error) {
      console.error('Erro ao carregar insígnias do cliente:', error);
      setSelectedCustomerBadges([]);
      alert('Erro ao carregar insígnias do cliente: ' + error.message);
    } finally {
      setLoadingBadges(false);
    }
  };

  // Função para desatribuir uma insígnia do cliente
  const removeBadgeFromCustomer = async (userBadgeId, badgeName) => {
    if (!confirm(`Tem certeza que deseja remover a insígnia "${badgeName}" do cliente?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('id', userBadgeId);

      if (error) throw error;

      // Recarregar insígnias do cliente
      await loadCustomerBadges(selectedCustomerBadges[0]?.user_id || selectedCustomer?.id);
      alert('Insígnia removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover insígnia:', error);
      alert('Erro ao remover insígnia: ' + error.message);
    }
  };

  // Função para atribuir uma insígnia ao cliente
  const assignBadgeToCustomerFromManagement = async (customerId, badgeId) => {
    try {
      // Verificar se o cliente já tem essa insígnia
      const { data: existingBadge, error: checkError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', customerId)
        .eq('badge_id', badgeId);

      if (checkError) throw checkError;

      if (existingBadge && existingBadge.length > 0) {
        alert('Este cliente já possui esta insígnia!');
        return;
      }

      // Atribuir a insígnia ao cliente
      const { error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: customerId,
          badge_id: badgeId
        });

      if (insertError) throw insertError;

      // Criar notificação para o usuário
      const { data: badgeData } = await supabase
        .from('badges')
        .select('name, icon')
        .eq('id', badgeId)
        .single();

      if (badgeData) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: customerId,
            type: 'badge',
            title: 'Nova Insígnia Recebida!',
            message: `Você recebeu a insígnia "${badgeData.name}"`,
            icon: badgeData.icon || '🏆'
          });

        if (notificationError) {
          console.error('Erro ao criar notificação:', notificationError);
        }
      }

      // Recarregar insígnias do cliente
      await loadCustomerBadges(customerId);
      alert('Insígnia atribuída com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir insígnia:', error);
      alert('Erro ao atribuir insígnia: ' + error.message);
    }
  };

  // FUNÇÕES PARA GERENCIAMENTO DE LIVES
  const loadLives = async () => {
    try {
      console.log('Carregando lives...');
      const { data, error } = await supabase
        .from('lives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar lives:', error);
        throw error;
      }

      console.log('Lives carregadas:', data?.length || 0);
      setLives(data || []);
    } catch (error) {
      console.error('Erro ao carregar lives:', error);
      setLives([]);
    }
  };

  const handleAddLive = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const liveData = {
        title: liveForm.title,
        description: liveForm.description,
        thumbnail_url: liveForm.thumbnail_url,
        stream_url: liveForm.stream_url,
        viewer_count: parseInt(liveForm.viewer_count) || 0,
        status: liveForm.status,
        game_name: liveForm.game_name,
        started_at: liveForm.started_at || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('lives')
        .insert([liveData])
        .select();

      if (error) throw error;

      await loadLives();
      setShowLiveForm(false);
      resetLiveForm();
      alert('Live adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar live:', error);
      alert('Erro ao adicionar live: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLive = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const liveData = {
        title: liveForm.title,
        description: liveForm.description,
        thumbnail_url: liveForm.thumbnail_url,
        stream_url: liveForm.stream_url,
        viewer_count: parseInt(liveForm.viewer_count) || 0,
        status: liveForm.status,
        game_name: liveForm.game_name,
        started_at: liveForm.started_at
      };

      const { error } = await supabase
        .from('lives')
        .update(liveData)
        .eq('id', editingLive);

      if (error) throw error;

      await loadLives();
      setEditingLive(null);
      setShowLiveForm(false);
      resetLiveForm();
      alert('Live atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar live:', error);
      alert('Erro ao atualizar live: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLive = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta live?')) return;

    try {
      const { error } = await supabase
        .from('lives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadLives(); // Recarregar lista do banco
      alert('Live excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir live:', error);
      alert('Erro ao excluir live: ' + error.message);
    }
  };

  const resetLiveForm = () => {
    setLiveForm({
      title: '',
      description: '',
      thumbnail_url: '',
      stream_url: '',
      viewer_count: 0,
      status: 'draft',
      game_name: '',
      started_at: ''
    });
  };

  // Função para carregar clientes com cyberpoints
  const loadCyberPointsCustomers = async () => {
    try {
      console.log('Carregando clientes com CyberPoints...');

      // Primeiro, carrega os perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('cyber_points', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar clientes com CyberPoints:', profilesError);
        throw profilesError;
      }

      // Em seguida, obtem o histórico de pontos para cada cliente para encontrar o máximo e o total
      const customersWithMaxPoints = await Promise.all(profilesData.map(async (customer) => {
        const { data: historyData, error: historyError } = await supabase
          .from('cyber_points_history')
          .select('balance_after')
          .eq('user_id', customer.id)
          .order('balance_after', { ascending: false })
          .limit(1);

        // Obter o total de pontos ganhos (apenas valores positivos)
        const { data: totalEarnedData, error: totalEarnedError } = await supabase
          .from('cyber_points_history')
          .select('points')
          .eq('user_id', customer.id)
          .gt('points', 0); // Apenas pontos ganhos (valores positivos)

        // Obter o total de pontos gastos (valores negativos)
        const { data: totalSpentData, error: totalSpentError } = await supabase
          .from('cyber_points_history')
          .select('points')
          .eq('user_id', customer.id)
          .lt('points', 0); // Apenas pontos gastos (valores negativos)

        if (historyError) {
          console.error('Erro ao buscar histórico de pontos para cliente:', customer.id, historyError);
          return { ...customer, max_cyber_points: customer.cyber_points || 0, total_earned_cyber_points: 0, total_spent_cyber_points: 0 };
        }

        const maxHistoryPoint = historyData && historyData.length > 0 ? historyData[0].balance_after : 0;
        const currentPoints = customer.cyber_points || 0;

        // O máximo é o maior entre o histórico e o saldo atual
        const maxPoints = Math.max(maxHistoryPoint, currentPoints);

        // Calcular o total de pontos ganhos
        let totalEarned = 0;
        if (totalEarnedData && totalEarnedData.length > 0) {
          totalEarned = totalEarnedData.reduce((sum, record) => sum + record.points, 0);
        }

        // Calcular o total de pontos gastos (em valor absoluto)
        let totalSpent = 0;
        if (totalSpentData && totalSpentData.length > 0) {
          totalSpent = Math.abs(totalSpentData.reduce((sum, record) => sum + record.points, 0));
        }

        return {
          ...customer,
          max_cyber_points: maxPoints,
          total_earned_cyber_points: totalEarned,
          total_spent_cyber_points: totalSpent
        };
      }));

      console.log('Clientes com CyberPoints carregados:', customersWithMaxPoints?.length || 0);
      setCyberPointsCustomers(customersWithMaxPoints || []);
    } catch (error) {
      console.error('Erro ao carregar clientes com CyberPoints:', error);
      setCyberPointsCustomers([]); // Garantir que sempre seja um array
    }
  };

  // Função para carregar insígnias
  const loadBadges = async () => {
    try {
      console.log('Carregando insígnias...');
      const { data: badgesData, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar insígnias:', error);
        throw error;
      }

      // Para cada insígnia, contar quantos usuários a possuem
      const badgesWithCounts = await Promise.all(badgesData.map(async (badge) => {
        const { count, error: countError } = await supabase
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('badge_id', badge.id);

        if (countError) {
          console.error('Erro ao contar usuários com insígnia:', countError);
          return { ...badge, user_count: 0 };
        }

        return { ...badge, user_count: count || 0 };
      }));

      console.log('Insígnias carregadas:', badgesWithCounts?.length || 0);
      setBadges(badgesWithCounts || []);
    } catch (error) {
      console.error('Erro ao carregar insígnias:', error);
      setBadges([]); // Garantir que sempre seja um array
    }
  };

  // Função para carregar clientes para atribuição de insígnias
  const loadCustomersForAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, nickname, email, avatar_url')
        .order('full_name', { ascending: true });

      if (error) throw error;

      setCustomersForAssignment(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes para atribuição:', error);
      setCustomersForAssignment([]);
      alert('Erro ao carregar clientes: ' + error.message);
    }
  };

  // Função para atribuir insígnia a um cliente
  const assignBadgeToCustomer = async () => {
    if (!selectedBadge || !selectedCustomerForAssignment) {
      alert('Selecione uma insígnia e um cliente para continuar.');
      return;
    }

    try {
      setLoading(true);

      // Verificar se o cliente já tem essa insígnia
      const { data: existingBadge, error: checkError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', selectedCustomerForAssignment)
        .eq('badge_id', selectedBadge.id);

      if (checkError) throw checkError;

      if (existingBadge && existingBadge.length > 0) {
        alert('Este cliente já possui esta insígnia!');
        setShowAssignBadgeModal(false);
        return;
      }

      // Atribuir a insígnia ao cliente
      const { error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: selectedCustomerForAssignment,
          badge_id: selectedBadge.id
        });

      if (insertError) throw insertError;

      // Criar notificação para o usuário
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedCustomerForAssignment,
          type: 'badge',
          title: 'Nova Insígnia Recebida!',
          message: `Você recebeu a insígnia "${selectedBadge.name}"`,
          icon: selectedBadge.icon || '🏆'
        });

      if (notificationError) {
        console.error('Erro ao criar notificação:', notificationError);
      }

      alert('Insígnia atribuída com sucesso!');
      setShowAssignBadgeModal(false);
      setSelectedCustomerForAssignment('');
    } catch (error) {
      console.error('Erro ao atribuir insígnia:', error);
      alert('Erro ao atribuir insígnia: ' + error.message);
    } finally {
      setLoading(false);
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
            { id: 'lives', icon: '📺', label: 'Lives', color: '#ff4500' },
            { id: 'orders', icon: '🛒', label: 'Pedidos', color: '#ff6600' },
            { id: 'customers', icon: '👥', label: 'Clientes', color: '#9400d3' },
            { id: 'badges', icon: '🎖️', label: 'Insígnias', color: '#ffd700' },
            { id: 'logs', icon: '📋', label: 'Logs', color: '#ff4444' },
            { id: 'missions', icon: '🎯', label: 'Missões', color: '#00ffcc' }
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
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Categoria</label>
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            required
                          >
                            <option value="geek">🎭 Geek</option>
                            <option value="gamer">🎮 Gamer</option>
                            <option value="smarthome">🏠 Smart Home</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>💰 Preço</label>
                          <input
                            type="text"
                            placeholder="R$ 0,00"
                            value={productForm.price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            required
                          />
                          <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                            Digite apenas números (ex: 15000 = R$ 150,00)
                          </small>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Estoque</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>🖼️ URL da Imagem (Opcional)</label>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/imagem.jpg"
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                        />
                        {productForm.image_url && (
                          <div className="image-preview">
                            <img src={productForm.image_url} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }} />
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>📁 Upload de Imagem (Opcional)</label>
                        <div className="image-upload-area" style={{
                          border: '2px dashed rgba(0, 255, 157, 0.5)',
                          borderRadius: '12px',
                          padding: '20px',
                          textAlign: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          marginBottom: '15px'
                        }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#00ff9d';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.5)';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.5)';
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleProductImageUpload(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleProductImageUpload(e.target.files[0]);
                              }
                            }}
                            style={{ display: 'none' }}
                            id="product-image-upload"
                          />
                          <label htmlFor="product-image-upload" style={{ cursor: 'pointer', color: '#00ff9d', fontSize: '1rem' }}>
                            {productImagePreview ? (
                              <div>
                                <img src={productImagePreview} alt="Prévia" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', marginBottom: '10px', display: 'block', margin: '0 auto 10px' }} />
                                <p>Clique ou arraste para substituir</p>
                              </div>
                            ) : (
                              <div>
                                <p>📁 Clique ou arraste uma imagem aqui</p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>PNG, JPG, GIF até 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Descrição Curta</label>
                        <textarea
                          placeholder="Descrição breve do produto..."
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          rows="3"
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
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : null}
                              <div className="no-image" style={{ display: product.image_url ? 'none' : 'flex' }}>
                                📷
                              </div>
                              <div className="image-label">Principal</div>
                            </div>
                          </div>
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <div className="product-meta">
                              <span className="category">{product.category}</span>
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
                              onClick={() => openPreview('product', product)}
                              className="btn-preview-modern"
                              title="Visualizar"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(product.id);
                                const formattedProduct = {
                                  ...product,
                                  price: product.price ? formatPrice((product.price * 100).toString()) : ''
                                };
                                setProductForm(formattedProduct);
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
                          onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
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
                            onChange={(e) => setBannerForm({ ...bannerForm, discount: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Ordem</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={bannerForm.order}
                            onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                          placeholder="Descrição do banner..."
                          value={bannerForm.description}
                          onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="form-group">
                        <label>URL da Imagem</label>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/banner.jpg"
                          value={bannerForm.image_url}
                          onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                        />
                        {bannerForm.image_url && (
                          <div className="image-preview">
                            <img src={bannerForm.image_url} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} />
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>URL de Destino</label>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/pagina"
                          value={bannerForm.link_url}
                          onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
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
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                loading="lazy"
                                decoding="async"
                              />
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
                              onClick={() => openPreview('banner', banner)}
                              className="btn-preview-modern"
                              title="Visualizar"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => {
                                setEditingBanner(banner.id);
                                setBannerForm({
                                  title: banner.title || '',
                                  discount: banner.discount || '',
                                  description: banner.description || '',
                                  image_url: banner.image_url || '',
                                  link_url: banner.link_url || '',
                                  order: banner.order || 0,
                                  active: true
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
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Data (opcional)</label>
                        <input
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        />
                        <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Deixe em branco se a data ainda não estiver definida</small>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Tipo</label>
                          <select
                            value={eventForm.type}
                            onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                          >
                            <option value="Torneio">🏆 Torneio</option>
                            <option value="Corujão">🦉 Corujão</option>
                            <option value="Rush Play">⚡ Rush Play</option>
                            <option value="Campeonato">🏅 Campeonato</option>
                            <option value="Outro">🎮 Outro</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={eventForm.status}
                            onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                          >
                            <option value="pending">⏳ Pendente</option>
                            <option value="active">🟢 Ativo</option>
                            <option value="completed">✅ Concluído</option>
                            <option value="cancelled">❌ Cancelado</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Max Participantes</label>
                          <input
                            type="number"
                            placeholder="16"
                            value={eventForm.max_participants}
                            onChange={(e) => setEventForm({ ...eventForm, max_participants: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Valor da Inscrição</label>
                          <input
                            type="text"
                            placeholder="Ex: R$ 50,00 ou Gratuito"
                            value={eventForm.inscription_price}
                            onChange={(e) => setEventForm({ ...eventForm, inscription_price: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>🎮 Nome do Jogo</label>
                        <input
                          type="text"
                          placeholder="Ex: League of Legends, CS:GO, FIFA 25"
                          value={eventForm.game_name}
                          onChange={(e) => setEventForm({ ...eventForm, game_name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Imagem do Evento</label>
                        <div className="image-upload-area" style={{
                          border: '2px dashed rgba(255, 215, 0, 0.5)',
                          borderRadius: '12px',
                          padding: '20px',
                          textAlign: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          marginBottom: '15px'
                        }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#ffd700';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleEventImageUpload(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleEventImageUpload(e.target.files[0]);
                              }
                            }}
                            style={{ display: 'none' }}
                            id="event-image-upload"
                          />
                          <label htmlFor="event-image-upload" style={{ cursor: 'pointer', color: '#ffd700', fontSize: '1rem' }}>
                            {eventImagePreview ? (
                              <div>
                                <img src={eventImagePreview} alt="Prévia" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', marginBottom: '10px', display: 'block', margin: '0 auto 10px' }} />
                                <p>Clique ou arraste para substituir</p>
                              </div>
                            ) : (
                              <div>
                                <p>📁 Clique ou arraste uma imagem aqui</p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>PNG, JPG, GIF até 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                        <input
                          type="url"
                          placeholder="Ou insira URL da imagem..."
                          value={eventForm.image_url}
                          onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                          placeholder="Descrição detalhada do evento..."
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
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
                              <img
                                src={event.image_url}
                                alt={event.title}
                                loading="lazy"
                                decoding="async"
                              />
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
                              <span className="event-type">
                                {event.type === 'Torneio' && '🏆'}
                                {event.type === 'Corujão' && '🦉'}
                                {event.type === 'Rush Play' && '⚡'}
                                {event.type === 'Campeonato' && '🏅'}
                                {event.type === 'Outro' && '🎮'}
                              </span>
                              <h4>{event.title}</h4>
                            </div>

                            {event.date && (
                              <div className="event-datetime">
                                <span className="date">📅 {new Date(event.date).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}

                            {event.max_participants && (
                              <div className="event-participants">
                                👥 Máx: {event.max_participants} participantes
                              </div>
                            )}

                            {event.inscription_price && (
                              <div className="event-inscription">
                                💰 Inscrição: {typeof event.inscription_price === 'number' ? `R$ ${event.inscription_price.toFixed(2)}` : event.inscription_price}
                              </div>
                            )}

                            {event.game_name && (
                              <div className="event-game">
                                🎮 {event.game_name}
                              </div>
                            )}

                            {event.status && (
                              <div className="event-status">
                                {event.status === 'pending' && '⏳ Pendente'}
                                {event.status === 'active' && '🟢 Ativo'}
                                {event.status === 'completed' && '✅ Concluído'}
                                {event.status === 'cancelled' && '❌ Cancelado'}
                              </div>
                            )}

                            <div className="event-description">
                              {event.description}
                            </div>

                            <div className="event-actions">
                              <button
                                onClick={() => openPreview('event', event)}
                                className="btn-preview-modern"
                                title="Visualizar"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => {
                                  setEditingEvent(event.id);
                                  setEventForm({
                                    title: event.title || '',
                                    description: event.description || '',
                                    date: event.date || '',
                                    inscription_price: event.inscription_price || '',
                                    max_participants: event.max_participants || '',
                                    type: event.type || 'Torneio',
                                    status: event.status || 'pending',
                                    game_name: event.game_name || '',
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
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name}
                            loading="lazy"
                            decoding="async"
                          />
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

                        {customer.whatsapp && (
                          <div className="customer-whatsapp">
                            📱 {customer.whatsapp}
                          </div>
                        )}

                        <div className="customer-joined">
                          📅 Cadastro: {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                        </div>

                        {customer.city && (
                          <div className="customer-city">
                            📍 {customer.city}, {customer.state || ''}
                          </div>
                        )}

                        {customer.age && (
                          <div className="customer-age">
                            👤 Idade: {customer.age} anos
                          </div>
                        )}

                        {customer.cyber_points !== undefined && (
                          <div className="customer-cyberpoints">
                            🎮 CyberPoints: {customer.cyber_points} <br />
                            <small style={{ color: 'rgba(0, 255, 136, 0.8)', fontSize: '0.85rem' }}>Máximo: {customer.max_cyber_points || customer.cyber_points}</small> <br />
                            <small style={{ color: 'rgba(255, 217, 0, 0.8)', fontSize: '0.85rem' }}>Total Obtido: {customer.total_earned_cyber_points || 0}</small> <br />
                            <small style={{ color: 'rgba(255, 100, 100, 0.8)', fontSize: '0.85rem' }}>Total Gasto: {customer.total_spent_cyber_points || 0}</small>
                          </div>
                        )}

                        <div className="customer-badges-count" style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <span style={{
                            background: 'rgba(255, 215, 0, 0.15)',
                            color: '#ffd700',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            🎖️ Insígnias: <span style={{ fontSize: '1.1em' }}>{customer.badges_count || 0}</span>
                          </span>
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
                        <button
                          className="btn-add-cyberpoints"
                          title="Adicionar CyberPoints"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCyberPointsChange({ operation: 'add', points: 0, reason: '' });
                            setShowCyberPointsModal(true);
                          }}
                        >
                          ➕
                        </button>
                        <button
                          className="btn-remove-cyberpoints"
                          title="Remover CyberPoints"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCyberPointsChange({ operation: 'subtract', points: 0, reason: '' });
                            setShowCyberPointsModal(true);
                          }}
                        >
                          ➖
                        </button>
                        <button
                          className="btn-manage-badges"
                          title="Gerenciar Insígnias"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            loadCustomerBadges(customer.id);
                            setShowManageBadgesModal(true);
                          }}
                        >
                          🏆
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

          {activeTab === 'missions' && (
            <MissionsManager />
          )}

          {/* Lives Management */}
          {activeTab === 'lives' && (
            <div className="lives-modern">
              <div className="section-header">
                <div className="section-title">
                  <h2>📺 Gerenciamento de Lives</h2>
                  <p>Cadastre e gerencie as transmissões ao vivo</p>
                </div>
              </div>

              <div className="lives-layout">
                {/* Form Panel */}
                {showLiveForm && (
                  <div
                    className="form-panel draggable"
                    style={{
                      left: `${liveFormPosition.x}px`,
                      top: `${liveFormPosition.y}px`,
                      cursor: isDragging === 'live' ? 'grabbing' : 'auto'
                    }}
                  >
                    <div
                      className="panel-header draggable-header"
                      onMouseDown={(e) => handleMouseDown(e, 'live')}
                      style={{ cursor: 'grab' }}
                    >
                      <h3>{editingLive ? '✏️ Editar Live' : '➕ Nova Live'}</h3>
                      <div className="header-buttons">
                        <button
                          type="button"
                          onClick={() => setShowLiveForm(false)}
                          className="btn-close-float"
                          title="Fechar formulário"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                    <form onSubmit={editingLive ? handleUpdateLive : handleAddLive} className="modern-form">
                      <div className="form-group">
                        <label>Título</label>
                        <input
                          type="text"
                          placeholder="Ex: GLOBAL TOURNAMENT 2026"
                          value={liveForm.title}
                          onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                          placeholder="Descrição da live..."
                          value={liveForm.description}
                          onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>🎮 Nome do Jogo</label>
                          <input
                            type="text"
                            placeholder="Ex: League of Legends, CS:GO"
                            value={liveForm.game_name}
                            onChange={(e) => setLiveForm({ ...liveForm, game_name: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>👥 Viewers</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={liveForm.viewer_count}
                            onChange={(e) => setLiveForm({ ...liveForm, viewer_count: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>📺 URL da Live</label>
                        <input
                          type="url"
                          placeholder="https://twitch.tv/usuario ou https://youtube.com/watch?v=..."
                          value={liveForm.stream_url}
                          onChange={(e) => setLiveForm({ ...liveForm, stream_url: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>🖼️ URL da Thumbnail</label>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/thumbnail.jpg"
                          value={liveForm.thumbnail_url}
                          onChange={(e) => setLiveForm({ ...liveForm, thumbnail_url: e.target.value })}
                        />
                        {liveForm.thumbnail_url && (
                          <div className="image-preview">
                            <img src={liveForm.thumbnail_url} alt="Thumbnail" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }} />
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Data de Início</label>
                        <input
                          type="datetime-local"
                          value={liveForm.started_at ? liveForm.started_at.substring(0, 16) : ''}
                          onChange={(e) => setLiveForm({ ...liveForm, started_at: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={liveForm.status}
                          onChange={(e) => setLiveForm({ ...liveForm, status: e.target.value })}
                        >
                          <option value="active">🟢 Active (Visível)</option>
                          <option value="draft">📝 Draft (Oculto)</option>
                          <option value="scheduled">📅 Scheduled (Oculto)</option>
                          <option value="completed">✅ Completed (Oculto)</option>
                          <option value="cancelled">❌ Cancelled (Oculto)</option>
                        </select>
                        <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                          Apenas "active" torna a live visível publicamente
                        </small>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-save-modern">
                          {editingLive ? '💾 ATUALIZAR' : '➕ ADICIONAR'}
                        </button>
                        {editingLive && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLive(null);
                              setShowLiveForm(false);
                              resetLiveForm();
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

                {/* Bot��o para mostrar form quando escondido */}
                {!showLiveForm && (
                  <button
                    onClick={() => {
                      setShowLiveForm(true);
                      setLiveFormPosition({ x: 30, y: 120 });
                    }}
                    className="btn-show-form"
                    title="Mostrar formulário de live"
                  >
                    ➕ Nova Live
                  </button>
                )}

                <div className="content-panel">
                  <div className="panel-header">
                    <h3>📋 Lista de Lives ({lives.length})</h3>
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="🔍 Buscar lives..."
                        value={searchLive}
                        onChange={(e) => setSearchLive(e.target.value)}
                        className="search-input-modern"
                      />
                    </div>
                  </div>

                  <div className="lives-grid">
                    {lives
                      .filter(live =>
                        searchLive === '' ||
                        live.game_name?.toLowerCase().includes(searchLive.toLowerCase()) ||
                        live.title?.toLowerCase().includes(searchLive.toLowerCase()) ||
                        live.description?.toLowerCase().includes(searchLive.toLowerCase())
                      )
                      .map(live => (
                        <div key={live.id} className="live-card">
                          <div className="live-image">
                            {live.thumbnail_url ? (
                              <img src={live.thumbnail_url} alt={live.title} loading="lazy" decoding="async" />
                            ) : (
                              <div className="no-image">🎮</div>
                            )}
                          </div>

                          <div className="live-info">
                            <div className="live-header">
                              <h4>{live.title}</h4>
                              <span className={`status-badge status-${live.status}`}>
                                {live.status === 'active' && '🟢 Ativo'}
                                {live.status === 'draft' && '📝 Rascunho'}
                                {live.status === 'scheduled' && '📅 Agendado'}
                                {live.status === 'completed' && '✅ Concluído'}
                                {live.status === 'cancelled' && '❌ Cancelado'}
                              </span>
                            </div>

                            {live.description && (
                              <div className="live-description">{live.description}</div>
                            )}

                            {live.game_name && (
                              <div className="live-game">🎮 {live.game_name}</div>
                            )}

                            {live.viewer_count !== undefined && (
                              <div className="live-viewers">👥 {live.viewer_count} viewers</div>
                            )}

                            <div className="live-link">
                              <a href={live.stream_url} target="_blank" rel="noopener noreferrer">📺 ASSISTIR AGORA</a>
                            </div>
                          </div>

                          <div className="live-actions">
                            <button
                              onClick={() => {
                                setEditingLive(live.id);
                                setLiveForm({
                                  title: live.title || '',
                                  description: live.description || '',
                                  thumbnail_url: live.thumbnail_url || '',
                                  stream_url: live.stream_url || '',
                                  viewer_count: live.viewer_count || 0,
                                  status: live.status || 'draft',
                                  game_name: live.game_name || '',
                                  started_at: live.started_at || ''
                                });
                                setShowLiveForm(true);
                                setLiveFormPosition({ x: 30, y: 120 });
                              }}
                              className="btn-edit-modern"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteLive(live.id)}
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

          {/* Badges Management */}
          {activeTab === 'badges' && (
            <div className="badges-management">
              <div className="section-header">
                <div className="section-title">
                  <h2>🎖️ Gerenciamento de Insígnias</h2>
                  <p>Crie, edite e gerencie as insígnias do sistema</p>
                </div>
                <div className="section-actions">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="🔍 Buscar insígnias..."
                      value={searchBadge}
                      onChange={(e) => setSearchBadge(e.target.value)}
                      className="search-input-modern"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingBadge(null);
                      setBadgeForm({
                        name: '',
                        description: '',
                        image_url: '',
                        icon_url: '',
                        rarity: 'comum'
                      });
                      setShowBadgeForm(true);
                      setBadgeFormPosition({ x: 30, y: 120 });
                    }}
                    className="btn-add-modern"
                    title="Adicionar Insígnia"
                  >
                    ➕ Nova Insígnia
                  </button>
                </div>
              </div>

              <div className="badges-grid">
                {badges
                  .filter(badge =>
                    searchBadge === '' ||
                    badge.name.toLowerCase().includes(searchBadge.toLowerCase()) ||
                    badge.description?.toLowerCase().includes(searchBadge.toLowerCase())
                  )
                  .map(badge => (
                    <div key={badge.id} className="badge-card">
                      <div className="badge-header">
                        <div className="badge-icon">
                          {badge.image_url ? (
                            <img
                              src={badge.image_url}
                              alt={badge.name}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="icon-placeholder">🎖️</div>
                          )}
                        </div>

                        <div className="badge-content">
                          <div className="badge-info">
                            <h4>{badge.name}</h4>
                            <p className="badge-description">{badge.description}</p>
                          </div>

                          <div className="badge-meta">
                            <span className={`rarity-${badge.rarity}`}>⭐ {badge.rarity}</span>
                            <span className="users-count">👥 {badge.user_count} usuários</span>
                          </div>
                        </div>
                      </div>

                      <div className="badge-actions">
                        <button
                          onClick={() => {
                            setEditingBadge(badge.id);
                            setBadgeForm({
                              name: badge.name || '',
                              description: badge.description || '',
                              image_url: badge.image_url || '',
                              icon_url: badge.icon_url || '',
                              rarity: badge.rarity || 'comum'
                            });
                            setShowBadgeForm(true);
                            setBadgeFormPosition({ x: 30, y: 120 });
                          }}
                          className="btn-edit-modern"
                          title="Editar Insígnia"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza que deseja excluir esta insígnia?')) {
                              try {
                                const { error } = await supabase
                                  .from('badges')
                                  .delete()
                                  .eq('id', badge.id);

                                if (error) throw error;

                                await loadBadges(); // Recarregar lista
                                alert('Insígnia excluída com sucesso!');
                              } catch (error) {
                                console.error('Erro ao excluir insígnia:', error);
                                alert('Erro ao excluir insígnia: ' + error.message);
                              }
                            }
                          }}
                          className="btn-delete-modern"
                          title="Excluir Insígnia"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBadge(badge);
                            setShowAssignBadgeModal(true);
                          }}
                          className="btn-assign-modern"
                          title="Atribuir Insígnia"
                        >
                          👤+
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Formulário de Insígnia */}
          {showBadgeForm && (
            <div
              className="form-panel draggable"
              style={{
                left: `${badgeFormPosition.x}px`,
                top: `${badgeFormPosition.y}px`,
                cursor: isDragging === 'badge' ? 'grabbing' : 'auto'
              }}
            >
              <div
                className="panel-header draggable-header"
                onMouseDown={(e) => handleMouseDown(e, 'badge')}
                style={{ cursor: 'grab' }}
              >
                <h3>{editingBadge ? '✏️ Editar Insígnia' : '➕ Nova Insígnia'}</h3>
                <div className="header-buttons">
                  <button
                    type="button"
                    onClick={() => setShowBadgeForm(false)}
                    className="btn-close-float"
                    title="Fechar formulário"
                  >
                    ❌
                  </button>
                </div>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  // Verificar se o token ainda é válido antes de prosseguir
                  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                  if (!session || sessionError) {
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    handleLogout();
                    return;
                  }

                  let imageUrl = badgeForm.image_url;

                  // Fazer upload da imagem se houver um novo arquivo
                  if (badgeImageFile) {
                    // Primeiro criar ou atualizar o registro para obter o ID
                    let badgeId = editingBadge;

                    if (!editingBadge) {
                      // Criar insígnia temporária sem imagem para obter o ID
                      const { data, error } = await supabase
                        .from('badges')
                        .insert([{ ...badgeForm, image_url: '' }])
                        .select()
                        .single();

                      if (error) throw error;

                      badgeId = data.id;
                    }

                    // Fazer upload da imagem com o ID agora disponível
                    const uploadedImageUrl = await uploadBadgeImageToStorage(badgeImageFile, badgeId);
                    if (uploadedImageUrl) {
                      imageUrl = uploadedImageUrl;

                      // Atualizar o registro com a URL da imagem
                      const { error } = await supabase
                        .from('badges')
                        .update({ image_url: uploadedImageUrl })
                        .eq('id', badgeId);

                      if (error) throw error;
                    }
                  } else if (!editingBadge) {
                    // Criar nova insígnia sem imagem
                    const { error } = await supabase
                      .from('badges')
                      .insert([badgeForm])
                      .select();

                    if (error) throw error;
                  } else {
                    // Atualizar insígnia existente (mantendo a imagem existente ou usando a URL)
                    const { error } = await supabase
                      .from('badges')
                      .update(badgeForm)
                      .eq('id', editingBadge);

                    if (error) throw error;
                  }

                  await loadBadges(); // Recarregar lista
                  setShowBadgeForm(false);
                  setBadgeImageFile(null);
                  setBadgeImagePreview('');
                  alert(editingBadge ? 'Insígnia atualizada com sucesso!' : 'Insígnia criada com sucesso!');
                } catch (error) {
                  console.error('Erro ao salvar insígnia:', error);
                  if (error.message.includes('JWT') || error.message.includes('expired')) {
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    handleLogout();
                  } else {
                    alert('Erro ao salvar insígnia: ' + error.message);
                  }
                } finally {
                  setLoading(false);
                }
              }} className="modern-form">
                <div className="form-group">
                  <label>Nome da Insígnia</label>
                  <input
                    type="text"
                    placeholder="Ex: Aventureiro"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    placeholder="Descrição da insígnia..."
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Raridade</label>
                  <select
                    value={badgeForm.rarity}
                    onChange={(e) => setBadgeForm({ ...badgeForm, rarity: e.target.value })}
                  >
                    <option value="comum">Comum</option>
                    <option value="rara">Rara</option>
                    <option value="epica">Épica</option>
                    <option value="lendaria">Lendária</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Imagem da Insígnia (Opcional)</label>
                  <div className="image-upload-area" style={{
                    border: '2px dashed rgba(255, 215, 0, 0.5)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    marginBottom: '15px',
                    transition: 'border-color 0.3s ease'
                  }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#ffd700';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleBadgeImageUpload(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleBadgeImageUpload(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                      id="badge-image-upload"
                    />
                    <label htmlFor="badge-image-upload" style={{
                      cursor: 'pointer',
                      color: '#ffd700',
                      fontSize: '1rem'
                    }}>
                      {badgeImagePreview ? (
                        <div>
                          <img
                            src={badgeImagePreview}
                            alt="Prévia da imagem"
                            loading="lazy"
                            decoding="async"
                            style={{
                              maxWidth: '100px',
                              maxHeight: '100px',
                              borderRadius: '8px',
                              marginBottom: '10px',
                              display: 'block',
                              margin: '0 auto 10px'
                            }}
                          />
                          <p>Clique ou arraste para substituir</p>
                        </div>
                      ) : (
                        <div>
                          <p>📁 Clique ou arraste uma imagem aqui</p>
                          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>PNG, JPG, GIF até 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="Ou insira URL da imagem..."
                    value={badgeForm.image_url}
                    onChange={(e) => setBadgeForm({ ...badgeForm, image_url: e.target.value })}
                  />
                </div>


                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Salvando...' : (editingBadge ? 'Atualizar' : 'Criar')}
                  </button>
                  {editingBadge && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBadge(null);
                        setBadgeForm({
                          name: '',
                          description: '',
                          image_url: '',
                          icon_url: '',
                          rarity: 'comum'
                        });
                      }}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* CyberPoints Management */}
          {activeTab === 'cyberpoints' && (
            <div className="cyberpoints-management">
              <div className="section-header">
                <div className="section-title">
                  <h2>🎮 Gerenciamento de CyberPoints</h2>
                  <p>Visualize e altere os pontos dos clientes</p>
                </div>
                <div className="section-actions">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="🔍 Buscar clientes..."
                      value={searchCyberPointsCustomer}
                      onChange={(e) => setSearchCyberPointsCustomer(e.target.value)}
                      className="search-input-modern"
                    />
                  </div>
                </div>
              </div>

              <div className="customers-grid">
                {cyberPointsCustomers
                  .filter(customer =>
                    searchCyberPointsCustomer === '' ||
                    customer.full_name?.toLowerCase().includes(searchCyberPointsCustomer.toLowerCase()) ||
                    customer.nickname?.toLowerCase().includes(searchCyberPointsCustomer.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(searchCyberPointsCustomer.toLowerCase())
                  )
                  .map(customer => (
                    <div key={customer.id} className="customer-card">
                      <div className="customer-avatar">
                        {customer.avatar_url ? (
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name}
                            loading="lazy"
                            decoding="async"
                          />
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

                        <div className="customer-joined">
                          📅 Cadastro: {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                        </div>

                        {customer.cyber_points !== undefined && (
                          <div className="customer-cyberpoints">
                            🎮 CyberPoints: {customer.cyber_points} <br />
                            <small style={{ color: 'rgba(0, 255, 136, 0.8)', fontSize: '0.85rem' }}>Máximo: {customer.max_cyber_points || customer.cyber_points}</small> <br />
                            <small style={{ color: 'rgba(255, 217, 0, 0.8)', fontSize: '0.85rem' }}>Total Obtido: {customer.total_earned_cyber_points || 0}</small> <br />
                            <small style={{ color: 'rgba(255, 100, 100, 0.8)', fontSize: '0.85rem' }}>Total Gasto: {customer.total_spent_cyber_points || 0}</small>
                          </div>
                        )}

                        {customer.total_orders && (
                          <div className="customer-stats">
                            <span className="orders-count">🛒 {customer.total_orders} pedidos</span>
                            {customer.total_spent && (
                              <span className="total-spent">💰 R$ {parseFloat(customer.total_spent).toFixed(2)}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="customer-actions">
                        <button
                          className="btn-add-cyberpoints"
                          title="Adicionar CyberPoints"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCyberPointsChange({ operation: 'add', points: 0, reason: '' });
                            setShowCyberPointsModal(true);
                          }}
                        >
                          ➕
                        </button>
                        <button
                          className="btn-remove-cyberpoints"
                          title="Remover CyberPoints"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCyberPointsChange({ operation: 'subtract', points: 0, reason: '' });
                            setShowCyberPointsModal(true);
                          }}
                        >
                          ➖
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Preview */}
      {showPreview && previewData && (
        <div className="preview-modal-overlay" onClick={closePreview}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3>
                {previewType === 'product' && '📦 Preview do Produto'}
                {previewType === 'banner' && '🎨 Preview do Banner'}
                {previewType === 'event' && '🏆 Preview do Evento'}
              </h3>
              <button onClick={closePreview} className="btn-close-preview">✕</button>
            </div>

            <div className="preview-modal-body">
              {/* Preview de Produto */}
              {previewType === 'product' && (
                <div className="product-preview-container">
                  <div className="product-card-site-preview">
                    <div className="product-image-wrapper-preview">
                      <img
                        src={previewData.image_url}
                        alt={previewData.name}
                        className="product-image-preview default"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="product-info-preview">
                      <span className="product-category-preview">
                        {previewData.category ? previewData.category.toUpperCase() : 'GEEK'}
                      </span>
                      <h3 className="product-name-preview">{previewData.name}</h3>
                      <p className="product-price-site-preview">
                        R$ {parseFloat(previewData.price).toFixed(2)}
                      </p>
                      <button className="product-btn-preview">
                        Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                  <p className="preview-note">💡 Esta é uma prévia de como o produto aparecerá na loja</p>
                </div>
              )}

              {/* Preview de Banner */}
              {previewType === 'banner' && (
                <div className="banner-preview-container">
                  <div className="banner-card-site-preview">
                    <img
                      src={previewData.image_url}
                      alt={previewData.title}
                      className="banner-image-preview"
                    />
                    <div className="banner-info-preview">
                      <h3 className="banner-title-preview">{previewData.title}</h3>
                      {previewData.description && (
                        <p className="banner-description-preview">{previewData.description}</p>
                      )}
                    </div>
                  </div>
                  <p className="preview-note">💡 Esta é uma prévia de como o banner aparecerá na loja</p>
                </div>
              )}

              {/* Preview de Evento */}
              {previewType === 'event' && (
                <div className="event-preview-container">
                  <div className="event-card-site-preview">
                    <img
                      src={previewData.image_url}
                      alt={previewData.title}
                      className="event-image-preview"
                    />
                    <div className="event-info-preview">
                      <h3 className="event-title-preview">{previewData.title}</h3>
                      <p className="event-date-preview">📅 {previewData.date}</p>
                      {previewData.inscription_price && (
                        <p className="event-inscription-preview">💰 Inscrição: {typeof previewData.inscription_price === 'number' ? `R$ ${previewData.inscription_price.toFixed(2)}` : previewData.inscription_price}</p>
                      )}
                    </div>
                  </div>
                  <p className="preview-note">💡 Esta é uma prévia de como o evento aparecerá na página</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de CyberPoints */}
      {showCyberPointsModal && selectedCustomer && (
        <div className="cyberpoints-modal-overlay" onClick={() => setShowCyberPointsModal(false)}>
          <div className="cyberpoints-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cyberpoints-modal-header">
              <h3>🎮 Editar CyberPoints de {selectedCustomer.nickname || selectedCustomer.full_name}</h3>
              <button onClick={() => setShowCyberPointsModal(false)} className="btn-close-cyberpoints">✕</button>
            </div>

            <div className="cyberpoints-modal-body">
              <div className="current-cyberpoints">
                <p>Saldo atual: <strong>{selectedCustomer.cyber_points || 0}</strong> CyberPoints</p>
              </div>

              <div className="operation-type-indicator">
                <p>Tipo de Operação: <strong>{cyberPointsChange.operation === 'add' ? 'Adicionar (Crédito)' : 'Remover (Débito)'}</strong></p>
              </div>

              <div className="cyberpoints-input-section">
                <label htmlFor="cyberpoints-change">Quantidade de CyberPoints</label>
                <input
                  id="cyberpoints-change"
                  type="number"
                  placeholder="Ex: 100"
                  value={cyberPointsChange.points}
                  onChange={(e) => setCyberPointsChange({ ...cyberPointsChange, points: Math.abs(parseInt(e.target.value) || 0) })}
                  className="cyberpoints-input"
                />
              </div>

              <div className="cyberpoints-reason-section">
                <label htmlFor="cyberpoints-reason">Motivo da Alteração</label>
                <input
                  id="cyberpoints-reason"
                  type="text"
                  placeholder="Ex: Bônus de fidelidade, Compra realizada, Penalidade, etc."
                  value={cyberPointsChange.reason}
                  onChange={(e) => setCyberPointsChange({ ...cyberPointsChange, reason: e.target.value })}
                  className="cyberpoints-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={async () => {
                    try {
                      // Verificar se a sessão ainda é válida
                      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                      if (!session || sessionError) {
                        alert('Sua sessão expirou. Faça login novamente para continuar.');
                        window.location.href = '/login';
                        return;
                      }

                      // Debug: Log para verificar os valores
                      console.log('Operação selecionada:', cyberPointsChange.operation);
                      console.log('Pontos a alterar:', cyberPointsChange.points);

                      // Determinar o valor baseado na operação
                      const operationValue = cyberPointsChange.operation === 'add'
                        ? parseInt(cyberPointsChange.points) || 0
                        : -(parseInt(cyberPointsChange.points) || 0);

                      console.log('Valor da operação (operationValue):', operationValue);

                      // Calcular o novo saldo
                      const currentBalance = selectedCustomer.cyber_points || 0;
                      const newBalance = Math.max(0, currentBalance + operationValue);

                      console.log('Saldo atual:', currentBalance);
                      console.log('Novo saldo:', newBalance);

                      // Atualizar o perfil do usuário
                      const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ cyber_points: newBalance })
                        .eq('id', selectedCustomer.id);

                      if (updateError) throw updateError;

                      // Registrar a transação no histórico
                      const { error: historyError } = await supabase
                        .from('cyber_points_history')
                        .insert([{
                          user_id: selectedCustomer.id,
                          points: operationValue,
                          type: cyberPointsChange.operation === 'add' ? 'earned' : 'spent',
                          source: 'admin',
                          description: cyberPointsChange.reason || `Operação administrativa: ${cyberPointsChange.operation === 'add' ? '+' : '-'}${cyberPointsChange.points} pontos`,
                          balance_before: currentBalance,
                          balance_after: newBalance,
                          created_at: new Date().toISOString()
                        }]);

                      if (historyError) throw historyError;

                      // Registrar a notificação
                      const { error: notificationError } = await supabase
                        .from('notifications')
                        .insert([{
                          user_id: selectedCustomer.id,
                          type: 'points',
                          title: 'CyberPoints Atualizados!',
                          message: `Seu saldo de CyberPoints foi ${cyberPointsChange.operation === 'add' ? 'adicionado' : 'deduzido'} em ${cyberPointsChange.points} pontos. Motivo: ${cyberPointsChange.reason || 'Operação administrativa'}`,
                          icon: cyberPointsChange.operation === 'add' ? '🎁' : '💸',
                          points: operationValue
                        }]);

                      if (notificationError) throw notificationError;

                      // Atualizar a lista de clientes
                      await loadCustomers();
                      await loadCyberPointsCustomers(); // Carregar novamente a lista de clientes com cyberpoints

                      setShowCyberPointsModal(false);
                      alert(`CyberPoints ${cyberPointsChange.operation === 'add' ? 'adicionados' : 'removidos'} com sucesso!`);
                    } catch (error) {
                      console.error('Erro ao atualizar CyberPoints:', error);
                      if (error.message.includes('JWT')) {
                        alert('Sua sessão expirou. Faça login novamente para continuar.');
                        window.location.href = '/login';
                      } else {
                        alert('Erro ao atualizar CyberPoints: ' + error.message);
                      }
                    }
                  }}
                  className="btn-update-cyberpoints"
                >
                  ✅ Confirmar Alteração
                </button>
                <button
                  onClick={() => setShowCyberPointsModal(false)}
                  className="btn-cancel-cyberpoints"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atribuição de Insígnia */}
      {showAssignBadgeModal && selectedBadge && (
        <div className="modal-overlay" onClick={() => setShowAssignBadgeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👤 Atribuir Insígnia</h3>
              <button onClick={() => setShowAssignBadgeModal(false)} className="btn-close-modal">✕</button>
            </div>

            <div className="modal-body">
              <div className="selected-badge-preview">
                <h4>Insígnia Selecionada:</h4>
                <div className="badge-preview-item">
                  <div className="badge-icon-large">
                    {selectedBadge.image_url ? (
                      <img
                        src={selectedBadge.image_url}
                        alt={selectedBadge.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="icon-placeholder-large">{selectedBadge.icon}</div>
                    )}
                  </div>
                  <div className="badge-info-preview">
                    <h5>{selectedBadge.name}</h5>
                    <p>{selectedBadge.description}</p>
                  </div>
                </div>
              </div>

              <div className="assign-customer-section">
                <h4>Selecione o Cliente:</h4>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="🔍 Buscar cliente..."
                    value={searchCustomerForAssignment}
                    onChange={(e) => setSearchCustomerForAssignment(e.target.value)}
                    className="search-input-modern"
                  />
                </div>

                <div className="customers-list-assignment">
                  {customersForAssignment
                    .filter(customer =>
                      searchCustomerForAssignment === '' ||
                      customer.full_name?.toLowerCase().includes(searchCustomerForAssignment.toLowerCase()) ||
                      customer.nickname?.toLowerCase().includes(searchCustomerForAssignment.toLowerCase()) ||
                      customer.email?.toLowerCase().includes(searchCustomerForAssignment.toLowerCase())
                    )
                    .map(customer => (
                      <div
                        key={customer.id}
                        className={`customer-option ${selectedCustomerForAssignment === customer.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCustomerForAssignment(customer.id)}
                      >
                        <div className="customer-avatar-small">
                          {customer.avatar_url ? (
                            <img
                              src={customer.avatar_url}
                              alt={customer.full_name}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="avatar-placeholder">👤</div>
                          )}
                        </div>
                        <div className="customer-info-small">
                          <strong>{customer.full_name || customer.nickname || 'Nome não informado'}</strong>
                          <small>{customer.email}</small>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={assignBadgeToCustomer}
                className="btn-primary-modern"
                disabled={!selectedCustomerForAssignment || loading}
              >
                {loading ? 'Atribuindo...' : '✅ Atribuir Insígnia'}
              </button>
              <button
                onClick={() => setShowAssignBadgeModal(false)}
                className="btn-secondary-modern"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Insígnias do Cliente */}
      {showManageBadgesModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowManageBadgesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏆 Gerenciar Insígnias de {selectedCustomer.full_name || selectedCustomer.nickname || 'Cliente'}</h3>
              <button onClick={() => setShowManageBadgesModal(false)} className="btn-close-modal">✕</button>
            </div>

            <div className="modal-body">
              <div className="manage-badges-section">
                <h4>Insígnias do Cliente:</h4>
                {loadingBadges ? (
                  <p>Carregando insígnias...</p>
                ) : selectedCustomerBadges.length > 0 ? (
                  <div className="customer-badges-list">
                    {selectedCustomerBadges.map((userBadge) => (
                      <div key={userBadge.id} className="customer-badge-item">
                        <div className="badge-info-small">
                          {userBadge.badges?.image_url ? (
                            <img
                              src={userBadge.badges.image_url}
                              alt={userBadge.badges.name}
                              className="badge-icon-small"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span className="badge-icon-placeholder">{userBadge.badges?.icon || '🎮'}</span>
                          )}
                          <div>
                            <strong>{userBadge.badges?.name}</strong>
                            <small>{userBadge.badges?.description}</small>
                            <p className="acquired-date">
                              Adquirida em: {(() => {
                                const date = new Date(userBadge.created_at);
                                return isNaN(date.getTime()) ? 'Data desconhecida' : date.toLocaleDateString('pt-BR');
                              })()}
                            </p>
                          </div>
                        </div>
                        <button
                          className="btn-remove-customer-badge"
                          onClick={() => removeBadgeFromCustomer(userBadge.id, userBadge.badges?.name)}
                          title="Remover insígnia"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhuma insígnia atribuída a este cliente.</p>
                )}
              </div>

              <div className="assign-new-badge-section">
                <h4>Atribuir Nova Insígnia:</h4>
                <div className="available-badges-list">
                  {allBadges
                    .filter(badge => !selectedCustomerBadges.some(cb => cb.badge_id === badge.id))
                    .map(badge => (
                      <div key={badge.id} className="available-badge-item">
                        <div className="badge-info-small">
                          {badge.image_url ? (
                            <img
                              src={badge.image_url}
                              alt={badge.name}
                              className="badge-icon-small"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span className="badge-icon-placeholder">{badge.icon || '🎮'}</span>
                          )}
                          <div>
                            <strong>{badge.name}</strong>
                            <small>{badge.description}</small>
                          </div>
                        </div>
                        <button
                          className="btn-assign-customer-badge"
                          onClick={() => assignBadgeToCustomerFromManagement(selectedCustomer.id, badge.id)}
                          title="Atribuir insígnia"
                        >
                          ➕
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowManageBadgesModal(false)}
                className="btn-secondary-modern"
              >
                ✅ Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel3;