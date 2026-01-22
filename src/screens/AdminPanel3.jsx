import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AccessLogsView from '../components/AccessLogsView';
import ProductImageUploader from '../components/ProductImageUploader';
import Model3DUploader from '../components/Model3DUploader';
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
    rarity: 'common'
  });
  const [badgeImageFile, setBadgeImageFile] = useState(null);
  const [badgeImagePreview, setBadgeImagePreview] = useState('');
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
    stock: 0,
    detailed_description: '',
    features: '',
    dimensions: '',
    weight: '',
    brand: '',
    warranty: '',
    material: '',
    images: [], // Array de imagens adicionais
    model_3d: '', // URL do modelo 3D .glb
    reward_points: '' // CyberPoints customizados
  });
  const [productImages, setProductImages] = useState([]); // Estado separado para gerenciar upload
  const [product3DModel, setProduct3DModel] = useState(null); // Estado para modelo 3D
  const [useModelAsCover, setUseModelAsCover] = useState(true); // Usar modelo 3D como capa
  
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
    original_price: '',
    final_price: '',
    reward_points: '' // CyberPoints do banner
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
    inscription_info: '',
    inscription_price: '',
    inscription_price_cyberpoints: '',
    max_participants: '',
    type: 'Torneio',
    image_url: '',
    rules: '',
    schedule: '',
    reward_points: '', // CyberPoints do evento
    // Campos para torneio ao vivo
    is_live: false,
    game_name: '',
    stream_link: '',
    current_scores: '',
    ranking: '',
    participants: '',
    live_comments: ''
  });

  // Pedidos
  const [orders, setOrders] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Clientes
  const [customers, setCustomers] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');

  // Preview Modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState(null); // 'product', 'banner', 'event'
  const [previewData, setPreviewData] = useState(null);

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
        loadOrders(),
        loadCustomers(),
        loadCyberPointsCustomers()
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
        case 'cyberpoints':
          loadCyberPointsCustomers();
          break;
        case 'badges':
          loadBadges();
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

  // Função auxiliar para fazer upload de imagens para o Supabase Storage
  const uploadImagesToStorage = async (images, productId) => {
    const uploadedUrls = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image.file) continue; // Pular se já foi feito upload
      
      const fileExt = image.file.name.split('.').pop();
      const fileName = `products/${productId}/image_${i + 1}_${Date.now()}.${fileExt}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, image.file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) throw error;
        
        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push({
          url: publicUrl,
          order: i + 1
        });
      } catch (error) {
        console.error(`Erro ao fazer upload da imagem ${i + 1}:`, error);
      }
    }
    
    return uploadedUrls;
  };

  // Função para fazer upload de modelo 3D para o Supabase Storage
  const upload3DModelToStorage = async (modelFile, productId) => {
    if (!modelFile) return null;
    
    const fileName = `products/${productId}/model_${Date.now()}.glb`;
    
    try {
      const { data, error } = await supabase.storage
        .from('product-3d-models')
        .upload(fileName, modelFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'model/gltf-binary'
        });
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-3d-models')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do modelo 3D:', error);
      return null;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fazer upload das imagens primeiro se houver
      let uploadedUrls = [];
      let finalImageUrl = productForm.image_url;
      let finalHoverImageUrl = productForm.hover_image_url;
      let model3DUrl = null;
      
      // Inserir produto temporariamente para obter ID
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productForm,
          price: parsePriceToNumber(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          reward_points: productForm.reward_points ? parseInt(productForm.reward_points) : null,
          weight: productForm.weight ? parseInt(productForm.weight) : null,
          images: [] // Inicialmente vazio
        }])
        .select();

      if (error) throw error;
      
      const newProductId = data[0].id;
      
      // Fazer upload do modelo 3D se houver
      if (product3DModel) {
        model3DUrl = await upload3DModelToStorage(product3DModel, newProductId);
      }
      
      // Fazer upload das imagens se houver
      if (productImages.length > 0) {
        uploadedUrls = await uploadImagesToStorage(productImages, newProductId);
      }
      
      // LÓGICA DE PRIORIDADE PARA IMAGEM DE CAPA:
      // 1ª Prioridade: Modelo 3D (se marcado para usar como capa)
      // 2ª Prioridade: Links manuais (image_url e hover_image_url)
      // 3ª Prioridade: Primeira e segunda imagens do array
      
      if (model3DUrl && useModelAsCover) {
        // Usar modelo 3D como capa
        finalImageUrl = model3DUrl;
        // Hover usa segunda imagem ou link manual
        if (!finalHoverImageUrl && uploadedUrls.length > 0) {
          finalHoverImageUrl = uploadedUrls[0].url;
        }
      } else {
        // Fallback para links manuais ou imagens do array
        if (!finalImageUrl && uploadedUrls.length > 0) {
          finalImageUrl = uploadedUrls[0].url;
        }
        if (!finalHoverImageUrl && uploadedUrls.length > 1) {
          finalHoverImageUrl = uploadedUrls[1].url;
        }
      }
      
      // Atualizar produto com todas as informações
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          images: uploadedUrls,
          image_url: finalImageUrl,
          hover_image_url: finalHoverImageUrl,
          model_3d: model3DUrl
        })
        .eq('id', newProductId);
      
      if (updateError) {
        console.error('Erro ao salvar informações do produto:', updateError);
      }
      
      await loadProducts(); // Recarregar lista do banco
      setShowProductForm(false); // Fechar formulário
      resetProductForm();
      setProductImages([]);
      setProduct3DModel(null);
      setUseModelAsCover(true);
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
      // Obter todas as imagens na ordem atual (existentes + novas)
      let updatedImages = [];
      
      // Processar todas as imagens na ordem atual do estado productImages
      for (let i = 0; i < productImages.length; i++) {
        const img = productImages[i];
        if (img.uploaded) {
          // Imagem já existe, manter URL
          updatedImages.push({ url: img.url, order: i + 1 });
        } else if (img.file) {
          // Nova imagem, fazer upload
          const uploaded = await uploadImagesToStorage([img], editingProduct);
          if (uploaded.length > 0) {
            updatedImages.push({ url: uploaded[0].url, order: i + 1 });
          }
        }
      }
      
      // Fazer upload do modelo 3D se houver um novo
      let model3DUrl = productForm.model_3d; // Manter URL existente
      if (product3DModel) {
        const newModel3DUrl = await upload3DModelToStorage(product3DModel, editingProduct);
        if (newModel3DUrl) {
          model3DUrl = newModel3DUrl;
        }
      }
      
      // LÓGICA DE PRIORIDADE PARA IMAGEM DE CAPA:
      // 1ª Prioridade: Modelo 3D (se marcado para usar como capa)
      // 2ª Prioridade: Links manuais (image_url e hover_image_url)
      // 3ª Prioridade: Primeira e segunda imagens do array
      
      let finalImageUrl = productForm.image_url;
      let finalHoverImageUrl = productForm.hover_image_url;
      
      if (model3DUrl && useModelAsCover) {
        // Usar modelo 3D como capa
        finalImageUrl = model3DUrl;
        // Hover usa segunda imagem ou link manual ou primeira imagem
        if (!finalHoverImageUrl && updatedImages.length > 0) {
          finalHoverImageUrl = updatedImages[0].url;
        }
      } else {
        // Fallback para links manuais ou imagens do array
        if (!finalImageUrl && updatedImages.length > 0) {
          finalImageUrl = updatedImages[0].url;
        }
        if (!finalHoverImageUrl && updatedImages.length > 1) {
          finalHoverImageUrl = updatedImages[1].url;
        }
      }
      
      const { error } = await supabase
        .from('products')
        .update({
          ...productForm,
          price: parsePriceToNumber(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          reward_points: productForm.reward_points ? parseInt(productForm.reward_points) : null,
          weight: productForm.weight ? parseInt(productForm.weight) : null,
          images: updatedImages,
          image_url: finalImageUrl,
          hover_image_url: finalHoverImageUrl,
          model_3d: model3DUrl
        })
        .eq('id', editingProduct);

      if (error) throw error;

      await loadProducts(); // Recarregar lista do banco
      setEditingProduct(null);
      setShowProductForm(false); // Fechar formulário
      resetProductForm();
      setProductImages([]);
      setProduct3DModel(null);
      setUseModelAsCover(true);
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
      type: 'Action Figures',
      price: '',
      image_url: '',
      hover_image_url: '',
      description: '',
      stock: 0,
      detailed_description: '',
      features: '',
      dimensions: '',
      weight: '',
      brand: '',
      warranty: '',
      material: '',
      images: [],
      model_3d: ''
    });
    setProductImages([]);
    setProduct3DModel(null);
    setUseModelAsCover(true);
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

  const formatDimensions = (value) => {
    // Remove tudo exceto números e x
    const cleaned = value.replace(/[^\d]/g, '');
    if (!cleaned) return '';
    
    // Divide em partes (até 3 números)
    const parts = [];
    for (let i = 0; i < cleaned.length && parts.length < 3; i += 2) {
      parts.push(cleaned.substr(i, 2));
    }
    
    return parts.join(' x ');
  };

  const formatWeight = (value) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    return numbers + 'g';
  };

  const handlePriceChange = (value) => {
    const formatted = formatPrice(value);
    setProductForm({...productForm, price: formatted});
  };

  const handleDimensionsChange = (value) => {
    // Permite apenas números e x, depois formata
    const clean = value.replace(/[^\d]/g, '');
    setProductForm({...productForm, dimensions: clean});
  };

  const handleWeightChange = (value) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    setProductForm({...productForm, weight: numbers});
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
        original_price: bannerForm.original_price,
        final_price: bannerForm.final_price,
        reward_points: bannerForm.reward_points ? parseInt(bannerForm.reward_points) : null,
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
        original_price: bannerForm.original_price,
        final_price: bannerForm.final_price,
        reward_points: bannerForm.reward_points ? parseInt(bannerForm.reward_points) : null,
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
      order: 0,
      original_price: '',
      final_price: ''
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
      // Converter regras e cronograma de texto para array
      const rulesArray = eventForm.rules ? eventForm.rules.split('\n').filter(r => r.trim()) : [];
      const scheduleArray = eventForm.schedule ? eventForm.schedule.split('\n').filter(s => s.trim()) : [];
      
      // Converter placar, ranking e participantes de texto para array
      const scoresArray = eventForm.current_scores ? eventForm.current_scores.split('\n').filter(s => s.trim()) : [];
      const rankingArray = eventForm.ranking ? eventForm.ranking.split('\n').filter(r => r.trim()) : [];
      const participantsArray = eventForm.participants ? eventForm.participants.split('\n').filter(p => p.trim()) : [];
      
      // Mapear os dados do formulário para a estrutura do banco
      const eventData = {
        title: eventForm.title,
        slug: eventForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: eventForm.description || 'Evento sem descrição',
        type: eventForm.type || 'Torneio',
        date: eventForm.date, // Nome correto da coluna: date
        prize: eventForm.prize || null,
        inscription_info: eventForm.inscription_info || `Vagas: ${eventForm.max_participants || 'Ilimitadas'}`,
        inscription_price: eventForm.inscription_price || null,
        max_participants: parseInt(eventForm.max_participants) || null,
        image_url: eventForm.image_url || '/images/default-event.png',
        rules: rulesArray,
        schedule: scheduleArray,
        reward_points: eventForm.reward_points ? parseInt(eventForm.reward_points) : null,
        is_live: eventForm.is_live || false,
        game_name: eventForm.game_name || null,
        stream_link: eventForm.stream_link || null,
        current_scores: scoresArray,
        ranking: rankingArray,
        participants: participantsArray,
        live_comments: eventForm.live_comments || null,
        active: true // Nome correto da coluna: active
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
      // Converter regras e cronograma de texto para array
      const rulesArray = eventForm.rules ? eventForm.rules.split('\n').filter(r => r.trim()) : [];
      const scheduleArray = eventForm.schedule ? eventForm.schedule.split('\n').filter(s => s.trim()) : [];
      
      // Converter placar, ranking e participantes de texto para array
      const scoresArray = eventForm.current_scores ? eventForm.current_scores.split('\n').filter(s => s.trim()) : [];
      const rankingArray = eventForm.ranking ? eventForm.ranking.split('\n').filter(r => r.trim()) : [];
      const participantsArray = eventForm.participants ? eventForm.participants.split('\n').filter(p => p.trim()) : [];
      
      // Mapear os dados do formulário para a estrutura do banco
      const eventData = {
        title: eventForm.title,
        description: eventForm.description || 'Evento sem descrição',
        type: eventForm.type || 'Torneio',
        date: eventForm.date, // Nome correto da coluna: date
        time: eventForm.time || null, // Adicionando o campo de hora
        prize: eventForm.prize || null,
        inscription_info: eventForm.inscription_info || `Vagas: ${eventForm.max_participants || 'Ilimitadas'}`,
        inscription_price: eventForm.inscription_price || null,
        inscription_price_cyberpoints: eventForm.inscription_price_cyberpoints || null, // Adicionando o campo de preço em CyberPoints
        max_participants: parseInt(eventForm.max_participants) || null,
        image_url: eventForm.image_url || '/images/default-event.png',
        rules: rulesArray,
        schedule: scheduleArray,
        reward_points: eventForm.reward_points ? parseInt(eventForm.reward_points) : null,
        is_live: eventForm.is_live || false,
        game_name: eventForm.game_name || null,
        stream_link: eventForm.stream_link || null,
        current_scores: scoresArray,
        ranking: rankingArray,
        participants: participantsArray,
        live_comments: eventForm.live_comments || null,
        active: true // Nome correto da coluna: active
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
      inscription_info: '',
      inscription_price: '',
      max_participants: '',
      type: 'Torneio',
      image_url: '',
      rules: '',
      schedule: '',
      reward_points: '',
      is_live: false,
      game_name: '',
      stream_link: '',
      current_scores: '',
      ranking: '',
      participants: '',
      live_comments: ''
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
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar insígnias:', error);
        throw error;
      }

      console.log('Insígnias carregadas:', data?.length || 0);
      setBadges(data || []);
    } catch (error) {
      console.error('Erro ao carregar insígnias:', error);
      setBadges([]); // Garantir que sempre seja um array
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
            { id: 'orders', icon: '🛒', label: 'Pedidos', color: '#ff6600' },
            { id: 'customers', icon: '👥', label: 'Clientes', color: '#9400d3' },
            { id: 'badges', icon: '🎖️', label: 'Insígnias', color: '#ffd700' },
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
                        <label>💰 Preço</label>
                        <input
                          type="text"
                          placeholder="R$ 0,00"
                          value={productForm.price}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          required
                        />
                        <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem'}}>
                          Digite apenas números (ex: 15000 = R$ 150,00)
                        </small>
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
                      <label>🖼️ URL da Imagem de Capa (Opcional)</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                      />
                      <small style={{color: 'rgba(0, 255, 157, 0.8)', fontSize: '0.85rem', marginTop: '5px', display: 'block'}}>
                        💡 Se não preencher, a 1ª imagem do upload será usada como capa
                      </small>
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
                      <label>✨ URL da Imagem Hover (Opcional)</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/imagem-hover.jpg"
                        value={productForm.hover_image_url}
                        onChange={(e) => setProductForm({...productForm, hover_image_url: e.target.value})}
                      />
                      <small style={{color: 'rgba(0, 255, 157, 0.8)', fontSize: '0.85rem', marginTop: '5px', display: 'block'}}>
                        💡 Se não preencher, a 2ª imagem do upload será usada no hover
                      </small>
                    </div>
                    
                    {/* Componente de Upload de Múltiplas Imagens */}
                    <div style={{background: 'rgba(0, 255, 157, 0.05)', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(0, 255, 157, 0.2)'}}>
                      <p style={{margin: '0 0 10px 0', color: '#00ff9d', fontWeight: '600', fontSize: '0.9rem'}}>
                        📌 IMPORTANTE - Ordem das Imagens:
                      </p>
                      <ul style={{margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem'}}>
                        <li>Arraste as imagens para reordená-las</li>
                        <li><strong>1ª imagem</strong> = Imagem de Capa (se URL não preenchida)</li>
                        <li><strong>2ª imagem</strong> = Imagem de Hover (se URL não preenchida)</li>
                        <li><strong>Demais imagens</strong> = Galeria na página de detalhes</li>
                      </ul>
                    </div>
                    <ProductImageUploader
                      images={productImages}
                      onChange={setProductImages}
                      maxImages={9}
                    />
                    
                    <Model3DUploader
                      onModelChange={setProduct3DModel}
                      currentModel={productForm.model_3d ? { url: productForm.model_3d } : null}
                      maxSizeMB={20}
                    />
                    
                    {(product3DModel || productForm.model_3d) && (
                      <div className="form-group" style={{
                        background: 'rgba(0, 217, 255, 0.1)',
                        border: '2px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '10px',
                        padding: '15px',
                        marginTop: '15px'
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={useModelAsCover}
                            onChange={(e) => setUseModelAsCover(e.target.checked)}
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              cursor: 'pointer',
                              accentColor: '#00d9ff'
                            }}
                          />
                          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#00d9ff' }}>
                            🎯 Usar Modelo 3D como Imagem de Capa
                          </span>
                        </label>
                        <p style={{ 
                          margin: '10px 0 0 30px', 
                          fontSize: '0.9rem', 
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: '1.5'
                        }}>
                          <strong>Prioridade de Capa:</strong><br/>
                          1️⃣ Modelo 3D (se marcado)<br/>
                          2️⃣ Links manuais de imagem<br/>
                          3️⃣ Primeira imagem do array
                        </p>
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label>Descrição Curta</label>
                      <textarea
                        placeholder="Descrição breve do produto (exibida nos cards)..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        rows="3"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>📝 Descrição Detalhada</label>
                      <textarea
                        placeholder="Descrição completa com todos os detalhes do produto..."
                        value={productForm.detailed_description}
                        onChange={(e) => setProductForm({...productForm, detailed_description: e.target.value})}
                        rows="6"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>✨ Características (separe por linha)</label>
                      <textarea
                        placeholder="Exemplo:\nMaterial premium\nEdição limitada\nArticulações móveis\nColecionável autêntico"
                        value={productForm.features}
                        onChange={(e) => setProductForm({...productForm, features: e.target.value})}
                        rows="5"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>📏 Dimensões (A x L x P em cm)</label>
                        <input
                          type="text"
                          placeholder="Ex: 20 x 15 x 10"
                          value={productForm.dimensions ? productForm.dimensions.match(/.{1,2}/g)?.join(' x ') || productForm.dimensions : ''}
                          onChange={(e) => handleDimensionsChange(e.target.value)}
                        />
                        <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem'}}>
                          Digite apenas números (ex: 201510 = 20 x 15 x 10)
                        </small>
                      </div>
                      <div className="form-group">
                        <label>⚖️ Peso (gramas)</label>
                        <input
                          type="text"
                          placeholder="Ex: 500"
                          value={productForm.weight ? productForm.weight + 'g' : ''}
                          onChange={(e) => handleWeightChange(e.target.value)}
                        />
                        <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem'}}>
                          Digite apenas números (ex: 500 = 500g)
                        </small>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>🏷️ Marca</label>
                        <input
                          type="text"
                          placeholder="Ex: Hot Toys, Funko, etc."
                          value={productForm.brand}
                          onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>🧱 Material</label>
                        <input
                          type="text"
                          placeholder="Ex: Plástico ABS, PVC, Resina"
                          value={productForm.material}
                          onChange={(e) => setProductForm({...productForm, material: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>🛡️ Garantia</label>
                      <input
                        type="text"
                        placeholder="Ex: 90 dias, 1 ano"
                        value={productForm.warranty}
                        onChange={(e) => setProductForm({...productForm, warranty: e.target.value})}
                      />
                    </div>

                    {/* CyberPoints Field */}
                    <div className="form-group" style={{
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
                      border: '2px solid rgba(102, 126, 234, 0.4)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginTop: '20px'
                    }}>
                      <label style={{
                        color: '#667eea',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        🎮 CyberPoints (Opcional)
                      </label>
                      <small style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.85rem',
                        display: 'block',
                        marginTop: '5px',
                        marginBottom: '10px'
                      }}>
                        Deixe vazio para usar regra padrão (R$ 50 = 2 pontos)
                      </small>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 100 pontos"
                        value={productForm.reward_points}
                        onChange={(e) => setProductForm({...productForm, reward_points: e.target.value})}
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '2px solid rgba(102, 126, 234, 0.5)',
                          borderRadius: '8px'
                        }}
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
                              onClick={() => openPreview('product', product)}
                              className="btn-preview-modern"
                              title="Visualizar"
                            >
                              👁️
                            </button>
                            <button 
                              onClick={() => {
                                setEditingProduct(product.id);
                                // Formatar price para exibição
                                const formattedProduct = {
                                  ...product,
                                  price: product.price ? formatPrice((product.price * 100).toString()) : '',
                                  images: product.images || [],
                                  model_3d: product.model_3d || ''
                                };
                                setProductForm(formattedProduct);
                                
                                // Carregar imagens existentes para o uploader
                                if (product.images && Array.isArray(product.images)) {
                                  const existingImages = product.images.map((img, index) => ({
                                    url: img.url,
                                    order: img.order || index + 1,
                                    uploaded: true
                                  }));
                                  setProductImages(existingImages);
                                } else {
                                  setProductImages([]);
                                }
                                
                                // Resetar modelo 3D (usuário pode fazer novo upload se quiser)
                                setProduct3DModel(null);
                                
                                // Verificar se modelo 3D está sendo usado como capa
                                const isUsingModelAsCover = product.model_3d && product.image_url === product.model_3d;
                                setUseModelAsCover(isUsingModelAsCover);
                                
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
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>💰 De: (Preço Original)</label>
                        <input
                          type="text"
                          placeholder="Ex: R$ 299,99"
                          value={bannerForm.original_price}
                          onChange={(e) => setBannerForm({...bannerForm, original_price: e.target.value})}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>✨ Por apenas: (Preço Final)</label>
                        <input
                          type="text"
                          placeholder="Ex: R$ 199,99"
                          value={bannerForm.final_price}
                          onChange={(e) => setBannerForm({...bannerForm, final_price: e.target.value})}
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

                    {/* CyberPoints Field */}
                    <div className="form-group" style={{
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
                      border: '2px solid rgba(102, 126, 234, 0.4)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginTop: '20px'
                    }}>
                      <label style={{
                        color: '#667eea',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        🎮 CyberPoints (Opcional)
                      </label>
                      <small style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.85rem',
                        display: 'block',
                        marginTop: '5px',
                        marginBottom: '10px'
                      }}>
                        Pontos promocionais especiais deste banner
                      </small>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 500 pontos de bônus"
                        value={bannerForm.reward_points}
                        onChange={(e) => setBannerForm({...bannerForm, reward_points: e.target.value})}
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '2px solid rgba(102, 126, 234, 0.5)',
                          borderRadius: '8px'
                        }}
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
                                  original_price: banner.original_price || '',
                                  final_price: banner.final_price || ''
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
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Informações de Inscrição</label>
                        <input
                          type="text"
                          placeholder="Ex: Inscrições abertas até 15/01"
                          value={eventForm.inscription_info}
                          onChange={(e) => setEventForm({...eventForm, inscription_info: e.target.value})}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Valor da Inscrição</label>
                        <input
                          type="text"
                          placeholder="Ex: R$ 50,00 ou Gratuito"
                          value={eventForm.inscription_price}
                          onChange={(e) => setEventForm({...eventForm, inscription_price: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Valor da Inscrição em CyberPoints</label>
                      <input
                        type="number"
                        placeholder="Ex: 100 (deixe em branco para gratuito em CyberPoints)"
                        value={eventForm.inscription_price_cyberpoints}
                        onChange={(e) => setEventForm({...eventForm, inscription_price_cyberpoints: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Regras (uma por linha)</label>
                      <textarea
                        placeholder="Equipes de 5 jogadores&#10;Formato de eliminatórias duplas&#10;Idade mínima: 16 anos"
                        value={eventForm.rules}
                        onChange={(e) => setEventForm({...eventForm, rules: e.target.value})}
                        rows={5}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Cronograma (um item por linha)</label>
                      <textarea
                        placeholder="Fase de Grupos: 20/01 - 10:00&#10;Quartas de Final: 20/01 - 14:00&#10;Semifinais: 20/01 - 17:00"
                        value={eventForm.schedule}
                        onChange={(e) => setEventForm({...eventForm, schedule: e.target.value})}
                        rows={5}
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

                    {/* Campo CyberPoints */}
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <label style={{ 
                        color: '#fff', 
                        fontWeight: 'bold', 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '14px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        🎁 CyberPoints (Pontos de Recompensa)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 100 pontos (opcional)"
                        value={eventForm.reward_points}
                        onChange={(e) => setEventForm({...eventForm, reward_points: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          fontSize: '14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: '#333'
                        }}
                      />
                      <small style={{ 
                        color: '#fff', 
                        display: 'block', 
                        marginTop: '6px', 
                        fontSize: '12px',
                        opacity: '0.9'
                      }}>
                        Deixe em branco para usar o padrão (R$ 50 = 2 pontos)
                      </small>
                    </div>

                    {/* Seção Torneio Ao Vivo */}
                    <div style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      marginTop: '20px'
                    }}>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '16px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          <input
                            type="checkbox"
                            checked={eventForm.is_live}
                            onChange={(e) => setEventForm({...eventForm, is_live: e.target.checked})}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          🔴 Torneio Acontecendo Agora (Ao Vivo)
                        </label>
                        <small style={{ 
                          color: '#fff', 
                          display: 'block', 
                          marginTop: '6px', 
                          fontSize: '12px',
                          opacity: '0.9',
                          marginLeft: '26px'
                        }}>
                          Marque para exibir este torneio na seção "Torneio Atual"
                        </small>
                      </div>

                      {eventForm.is_live && (
                        <>
                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>🎮 Nome do Jogo</label>
                            <input
                              type="text"
                              placeholder="Ex: League of Legends, CS:GO, FIFA 25"
                              value={eventForm.game_name}
                              onChange={(e) => setEventForm({...eventForm, game_name: e.target.value})}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '14px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#333'
                              }}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>📺 Link de Transmissão</label>
                            <input
                              type="url"
                              placeholder="https://youtube.com/... ou https://twitch.tv/..."
                              value={eventForm.stream_link}
                              onChange={(e) => setEventForm({...eventForm, stream_link: e.target.value})}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '14px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#333'
                              }}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>📊 Placar Atual (um por linha)</label>
                            <textarea
                              placeholder="Time A 2 x 1 Time B&#10;Time C 3 x 0 Time D"
                              value={eventForm.current_scores}
                              onChange={(e) => setEventForm({...eventForm, current_scores: e.target.value})}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '14px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#333'
                              }}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>🏆 Ranking (um por linha)</label>
                            <textarea
                              placeholder="1º - Time A (15 pontos)&#10;2º - Time B (12 pontos)&#10;3º - Time C (10 pontos)"
                              value={eventForm.ranking}
                              onChange={(e) => setEventForm({...eventForm, ranking: e.target.value})}
                              rows={4}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '14px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#333'
                              }}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>👥 Participantes (um por linha)</label>
                            <textarea
                              placeholder="Time A&#10;Time B&#10;Time C&#10;Jogador Solo 1"
                              value={eventForm.participants}
                              onChange={(e) => setEventForm({...eventForm, participants: e.target.value})}
                              rows={4}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '14px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#333'
                              }}
                            />
                          </div>

                          <div className="form-group">
                            <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>💬 Comentários</label>
                            <textarea
                              placeholder="Atualizações sobre o andamento do torneio..."
                              value={eventForm.live_comments}
                              onChange={(e) => setEventForm({...eventForm, live_comments: e.target.value})}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '14px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#333'
                              }}
                            />
                          </div>
                        </>
                      )}
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
                                    time: event.time || '',
                                    prize: event.prize || '',
                                    inscription_info: event.inscription_info || '',
                                    inscription_price: event.inscription_price || '',
                                    inscription_price_cyberpoints: event.inscription_price_cyberpoints || '',
                                    max_participants: event.max_participants || '',
                                    type: event.type || 'Torneio',
                                    image_url: event.image_url || '',
                                    rules: Array.isArray(event.rules) ? event.rules.join('\n') : '',
                                    schedule: Array.isArray(event.schedule) ? event.schedule.join('\n') : '',
                                    reward_points: event.reward_points || '',
                                    is_live: event.is_live || false,
                                    game_name: event.game_name || '',
                                    stream_link: event.stream_link || '',
                                    current_scores: Array.isArray(event.current_scores) ? event.current_scores.join('\n') : '',
                                    ranking: Array.isArray(event.ranking) ? event.ranking.join('\n') : '',
                                    participants: Array.isArray(event.participants) ? event.participants.join('\n') : '',
                                    live_comments: event.live_comments || ''
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
                            🎮 CyberPoints: {customer.cyber_points} <br/>
                            <small style={{color: 'rgba(0, 255, 136, 0.8)', fontSize: '0.85rem'}}>Máximo: {customer.max_cyber_points || customer.cyber_points}</small> <br/>
                            <small style={{color: 'rgba(255, 217, 0, 0.8)', fontSize: '0.85rem'}}>Total Obtido: {customer.total_earned_cyber_points || 0}</small> <br/>
                            <small style={{color: 'rgba(255, 100, 100, 0.8)', fontSize: '0.85rem'}}>Total Gasto: {customer.total_spent_cyber_points || 0}</small>
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
                        icon: '🏆',
                        image_url: '',
                        rarity: 'common',
                        points_required: 0,
                        active: true
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
                      <div className="badge-icon">
                        {badge.image_url ? (
                          <img src={badge.image_url} alt={badge.name} onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }} />
                        ) : (
                          <div className="icon-placeholder" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{badge.icon}</div>
                        )}
                        {!badge.image_url && (
                          <div className="icon-placeholder" style={{display: 'none', alignItems: 'center', justifyContent: 'center'}}>{badge.icon}</div>
                        )}
                      </div>

                      <div className="badge-info">
                        <h4>{badge.name}</h4>
                        <p className="badge-description">{badge.description}</p>
                        <div className="badge-meta">
                          <span className={`rarity-${badge.rarity}`}>⭐ {badge.rarity}</span>
                          <span className="points-required">🎮 {badge.points_required} pts</span>
                          <span className={`status-${badge.active ? 'active' : 'inactive'}`}>
                            {badge.active ? '🟢 Ativo' : '🔴 Inativo'}
                          </span>
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
                              rarity: badge.rarity || 'common'
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
                  let imageUrl = badgeForm.image_url;

                  // Fazer upload da imagem se houver um novo arquivo
                  if (badgeImageFile) {
                    // Primeiro criar ou atualizar o registro para obter o ID
                    let badgeId = editingBadge;

                    if (!editingBadge) {
                      // Criar insígnia temporária sem imagem
                      const { data, error } = await supabase
                        .from('badges')
                        .insert([{...badgeForm, image_url: ''}])
                        .select()
                        .single();

                      if (error) throw error;

                      badgeId = data.id;
                    } else {
                      // Se estiver editando e houver nova imagem, atualizar sem a imagem por enquanto
                      const { error } = await supabase
                        .from('badges')
                        .update({...badgeForm, image_url: ''})
                        .eq('id', editingBadge);

                      if (error) throw error;
                    }

                    // Fazer upload da imagem
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
                  alert('Erro ao salvar insígnia: ' + error.message);
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
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    placeholder="Descrição da insígnia..."
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Raridade</label>
                  <select
                    value={badgeForm.rarity}
                    onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                  >
                    <option value="common">Comum</option>
                    <option value="rare">Raro</option>
                    <option value="epic">Épico</option>
                    <option value="legendary">Lendário</option>
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
                    onChange={(e) => setBadgeForm({...badgeForm, image_url: e.target.value})}
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
                          rarity: 'common'
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

                        <div className="customer-joined">
                          📅 Cadastro: {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                        </div>

                        {customer.cyber_points !== undefined && (
                          <div className="customer-cyberpoints">
                            🎮 CyberPoints: {customer.cyber_points} <br/>
                            <small style={{color: 'rgba(0, 255, 136, 0.8)', fontSize: '0.85rem'}}>Máximo: {customer.max_cyber_points || customer.cyber_points}</small> <br/>
                            <small style={{color: 'rgba(255, 217, 0, 0.8)', fontSize: '0.85rem'}}>Total Obtido: {customer.total_earned_cyber_points || 0}</small> <br/>
                            <small style={{color: 'rgba(255, 100, 100, 0.8)', fontSize: '0.85rem'}}>Total Gasto: {customer.total_spent_cyber_points || 0}</small>
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
                      />
                      {previewData.hover_image_url && (
                        <img
                          src={previewData.hover_image_url}
                          alt={`${previewData.name} - Hover`}
                          className="product-image-preview hover"
                        />
                      )}
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
                      {previewData.original_price && previewData.final_price && (
                        <div className="banner-price-preview">
                          <span className="original-price-preview">{previewData.original_price}</span>
                          <span className="final-price-preview">{previewData.final_price}</span>
                        </div>
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
                      {previewData.prize && (
                        <p className="event-prize-preview">🏆 {previewData.prize}</p>
                      )}
                      {previewData.inscription_info && (
                        <p className="event-inscription-preview">✍️ {previewData.inscription_info}</p>
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
                  onChange={(e) => setCyberPointsChange({...cyberPointsChange, points: Math.abs(parseInt(e.target.value) || 0)})}
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
                  onChange={(e) => setCyberPointsChange({...cyberPointsChange, reason: e.target.value})}
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
    </div>
  );
};

export default AdminPanel3;