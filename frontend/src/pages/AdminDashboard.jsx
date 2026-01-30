import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, LogOut, Flower2, Loader2, X, ShoppingBag, Calendar, MapPin, Phone, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  getAdminFlowers,
  createFlower,
  updateFlower,
  deleteFlower,
  uploadImage
} from '../services/api';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const AdminDashboard = () => {
  const { isAdmin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_access_token');

  // Products state
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price_amd: '',
    category: '',
    colors: [],
    description: '',
    images: [],
    is_free_delivery: false,
    sale_price_amd: '',
    to_be_on_main_page:false
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Main Page Content state
  const [mainPageContent, setMainPageContent] = useState(null);
  const [isEditingMainPage, setIsEditingMainPage] = useState(false);
  const [mainPageLoading, setMainPageLoading] = useState(false);
  const [mainPageUploading, setMainPageUploading] = useState(false);
 const [mainPageFormData, setMainPageFormData] = useState({
  id: '',                // API id
  title: '',             // main title
  subtitle: '',          // subtitle
  description: '',       // description text
  special_offer: '',     // special offer text
  extra_text: '',        // optional extra text
});

  // Fetch flowers
  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const data = await getAdminFlowers({ page_size: 100 });
      setFlowers(data.results || []);
    } catch (error) {
      console.error('Error fetching flowers:', error);
      toast.error('Չհաջողվեց բեռնել ծաղիկները');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Չհաջողվեց բեռնել պատվերները');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch main page content
  const fetchMainPageContent = async () => {
    setMainPageLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}api/main-page/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch main page content');

      const data = await response.json();
      setMainPageContent(data);
      // Pre-populate form with existing data
       setMainPageFormData({
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      special_offer: data.special_offer,
      extra_text: data.extra_text,
      main_page:data.main_image
    });
    } catch (error) {
      console.error('Error fetching main page content:', error);
      toast.error('Չհաջողվեց բեռնել main page բովանդակությունը');
    } finally {
      setMainPageLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update order');

      toast.success('Պատվերը թարմացված է');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Չհաջողվեց թարմացնել պատվերը');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFlowers();
      fetchOrders();
      fetchMainPageContent();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
    toast.success('Դուք դուրս եք եկել');
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleMainPageChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setMainPageFormData({
      ...mainPageFormData,
      [e.target.name]: value
    });
  };

  const handleMainPageFeatureChange = (index, field, value) => {
    const newFeatures = [...mainPageFormData.features];
    newFeatures[index][field] = value;
    setMainPageFormData({
      ...mainPageFormData,
      features: newFeatures
    });
  };

  const handleColorChange = (e) => {
    const colorValue = e.target.value;
    const colorsArray = colorValue.split(',').map(c => c.trim()).filter(c => c);
    setFormData({ ...formData, colors: colorsArray });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Առավելագույնը 5 նկար');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);

      const newImages = results.map((result, index) => ({
        url: result.url,
        is_main: formData.images.length === 0 && index === 0
      }));

      setFormData({
        ...formData,
        images: [...formData.images, ...newImages]
      });

      toast.success(`${files.length} նկար վերբեռնված է`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Չհաջողվեց վերբեռնել նկարները');
    } finally {
      setUploading(false);
    }
  };

  const handleMainPageImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainPageUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/main-page/upload-image/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setMainPageFormData({
        ...mainPageFormData,
        hero_image_url: data.url
      });

      toast.success('Նկարը վերբեռնված է');
    } catch (error) {
      console.error('Error uploading main page image:', error);
      toast.error('Չհաջողվեց վերբեռնել նկարը');
    } finally {
      setMainPageUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (formData.images[index].is_main && newImages.length > 0) {
      newImages[0].is_main = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const handleSetMainImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_main: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price_amd: '',
      category: '',
      colors: [],
      description: '',
      images: [],
      is_free_delivery: false,
      sale_price_amd: '',
      to_be_on_main_page:false
    });
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  const resetMainPageForm = () => {
    setIsEditingMainPage(false);
    // Keep the loaded data, don't fetch again
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price_amd || !formData.category || !formData.description) {
      toast.error('Խնդրում ենք լրացնել բոլոր դաշտերը');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Խնդրում ենք վերբեռնել առնվազն մեկ նկար');
      return;
    }

    const hasMainImage = formData.images.some(img => img.is_main);
    if (!hasMainImage) {
      toast.error('Խնդրում ենք ընտրել հիմնական նկարը');
      return;
    }

    try {
      const flowerData = {
        name: formData.name,
        price_amd: parseInt(formData.price_amd),
        category: formData.category,
        colors: formData.colors.join(','),
        description: formData.description,
        is_free_delivery: formData.is_free_delivery,
        images_data: formData.images,
        sale_price_amd: parseInt(formData.sale_price_amd),
        to_be_on_main_page:formData.to_be_on_main_page
      };

      if (editingProduct) {
        await updateFlower(editingProduct.id, flowerData);
        toast.success('Ծաղիկը թարմացված է');
      } else {
        await createFlower(flowerData);
        toast.success('Ծաղիկը ավելացված է');
      }

      resetForm();
      fetchFlowers();
    } catch (error) {
      console.error('Error saving flower:', error);
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.error ||
        'Չհաջողվեց պահպանել ծաղիկը';
      toast.error(errorMessage);
    }
  };
const handleMainPageSubmit = async (e) => {
  e.preventDefault();

  if (!mainPageFormData.title || !mainPageFormData.subtitle) {
    toast.error('Խնդրում ենք լրացնել վերնագիր և ենթավերնագիր');
    return;
  }

  try {
    delete mainPageFormData.main_image
    const response = await fetch(`${API_BASE_URL}/api/main-page/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mainPageFormData)
    });

    if (!response.ok) throw new Error('Failed to update main page content');

    const data = await response.json();
    setMainPageContent(data);

    // Update form with fresh data
    setMainPageFormData({
      title: data.title || '',
      subtitle: data.subtitle || '',
      description: data.description || '',
      special_offer: data.special_offer || '',
      extra_text: data.extra_text || '',
      main_image:data.main_image
    });

    toast.success('Main page բովանդակությունը թարմացված է');
    setIsEditingMainPage(false);
  } catch (error) {
    console.error('Error updating main page:', error);
    toast.error('Չհաջողվեց թարմացնել main page բովանդակությունը');
  }
};
  const handleEdit = (flower) => {
    setEditingProduct(flower);
    setFormData({
      name: flower.name,
      price_amd: flower.price_amd.toString(),
      category: flower.category,
      colors: flower.colors || [],
      description: flower.description,
      images: flower.images || [],
      is_free_delivery: flower.is_free_delivery || false,
      sale_price_amd: flower.sale_price_amd?.toString() || '',
      to_be_on_main_page:flower.to_be_on_main_page
    });
    setIsAddingProduct(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Վստա՞հ եք, որ ցանկանում եք հեռացնել "${name}"`)) {
      try {
        await deleteFlower(id);
        toast.success('Ծաղիկը հեռացված է');
        fetchFlowers();
      } catch (error) {
        console.error('Error deleting flower:', error);
        toast.error('Չհաջողվեց հեռացնել ծաղիկը');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      processing: 'bg-purple-50 text-purple-700 border-purple-200',
      shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const filteredOrders = orderStatusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === orderStatusFilter);

  if (loading && activeTab === 'products') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Բեռնվում է...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <Flower2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-primary">Ծաղիկ</h1>
                <p className="text-xs text-muted-foreground">Ադմին պանել</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Դուրս գալ</span>
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-border sticky top-20 z-30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Ծաղիկներ ({flowers.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Պատվերներ ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('main-page')}
              className={`py-4 px-2 font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'main-page'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
              Main Page
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {activeTab === 'products' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-2">Ծաղիկների կառավարում</h2>
                <p className="text-muted-foreground">Ընդամենը {flowers.length} ծաղիկ</p>
              </div>

              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Ավելացնել ծաղիկ</span>
              </button>
            </div>

            <AnimatePresence>
              {isAddingProduct && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm mb-8"
                >
                  <h3 className="font-serif text-2xl font-bold mb-6">
                    {editingProduct ? 'Խմբագրել ծաղիկը' : 'Ավելացնել նոր ծաղիկ'}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Անվանում *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>

                      <div style={{ flexDirection: 'row', display: 'flex', width: '100%', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <label className="block text-sm font-medium mb-2">Գին (֏) *</label>
                          <input
                            type="number"
                            name="price_amd"
                            value={formData.price_amd}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <label className="block text-sm font-medium mb-2">Գին SALE (֏) *</label>
                          <input
                            type="number"
                            name="sale_price_amd"
                            value={formData.sale_price_amd}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                           
                          />
                        </div>
                      </div>

                    <div>
  <label className="block text-sm font-medium mb-2">Կատեգորիա *</label>
  <select
    name="category"
    value={formData.category}
    onChange={handleChange}
    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
    required
  >
    <option value="">Բոլորը</option>
    <option value="Վարդեր">Վարդեր</option>
    <option value="Լիլիաներ">Լիլիաներ</option>
    <option value="Տյուլիպաններ">Տյուլիպաններ</option>
    <option value="Արևածաղիկներ">Արևածաղիկներ</option>
    <option value="Խոլորձներ">Խոլորձներ</option>
    <option value="Փունջեր">Փունջեր</option>
    <option value="Խառը">Խառը</option>
    <option value="Պրեմիում">Պրեմիում</option>
  </select>
</div>
<div>
  <label className="block text-sm font-medium mb-2">Գույներ *</label>

  {/* Select dropdown */}
  <select
    value=""
    onChange={(e) => {
      const selectedColor = e.target.value;
      if (selectedColor && !formData.colors.includes(selectedColor)) {
        setFormData(prev => ({
          ...prev,
          colors: [...prev.colors, selectedColor]
        }));
      }
    }}
    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
  >
    <option value="">Ընտրեք գույնը</option>
    <option value="Կարմիր">Կարմիր</option>
    <option value="Վարդագույն">Վարդագույն</option>
    <option value="Սպիտակ">Սպիտակ</option>
    <option value="Դեղին">Դեղին</option>
    <option value="Մանուշակագույն">Մանուշակագույն</option>
    <option value="Բազմագույն">Բազմագույն</option>
  </select>

  {/* Display selected colors */}
  <div className="mt-2 flex flex-wrap gap-2">
    {formData.colors.map((color, index) => (
      <span
        key={index}
        className="flex items-center bg-primary/20 text-primary px-3 py-1 rounded-full text-sm cursor-pointer"
        onClick={() => {
          // Remove color when clicked
          setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter(c => c !== color)
          }));
        }}
      >
        {color} <span className="ml-1 font-bold">×</span>
      </span>
    ))}
  </div>
</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Նկարագրություն *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Նկարներ (առավելագույնը 5) *</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading || formData.images.length >= 5}
                        className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      />
                      {uploading && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Վերբեռնվում է...</span>
                        </div>
                      )}

                      {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-5 gap-4">
                          {formData.images.map((img, index) => (
                            <div
                              key={index}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                                img.is_main ? 'border-primary' : 'border-border'
                              }`}
                            >
                              <img
                                src={img.url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(index)}
                                className={`absolute bottom-1 left-1 right-1 text-xs py-1 rounded ${
                                  img.is_main
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white/80 text-foreground hover:bg-white'
                                }`}
                              >
                                {img.is_main ? 'Հիմնական' : 'Դարձնել հիմնական'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                   <div className="flex items-center gap-2">
  <input
    type="checkbox"
    name="is_free_delivery"
    id="is_free_delivery"
    checked={formData.is_free_delivery}
    onChange={handleChange}
    className="w-5 h-5 text-primary rounded"
  />
  <label htmlFor="is_free_delivery" className="text-sm font-medium cursor-pointer">
    Անվճար առաքում
  </label>
</div>

<div className="flex items-center gap-2">
  <input
    type="checkbox"
    name="to_be_on_main_page"
    id="to_be_on_main_page"
    checked={formData.to_be_on_main_page}
    onChange={handleChange}
    className="w-5 h-5 text-primary rounded"
  />
  <label htmlFor="to_be_on_main_page" className="text-sm font-medium cursor-pointer">
    Գլխավոր էջում ցուցադրել
  </label>
</div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-all shadow-lg disabled:opacity-50"
                      >
                        {editingProduct ? 'Պահպանել փոփոխությունները' : 'Ավելացնել ծաղիկ'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-3 border border-border hover:bg-muted rounded-full font-medium transition-all"
                      >
                        Չեղարկել
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flowers.map((flower) => {
                const mainImage = flower.images?.find(img => img.is_main)?.url ||
                  flower.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80';

                return (
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm"
                  >
                    <div className="aspect-square bg-muted relative">
                      <img
                        src={mainImage}
                        alt={flower.name}
                        className="w-full h-full object-cover"
                      />
                      {flower.is_free_delivery && (
                        <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                          Անվճար առաքում
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-serif text-xl font-semibold mb-2">{flower.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {flower.description}
                      </p>

                      <div className="flex items-center justify-between mb-2">
                         <span className={`text-2xl font-bold text-primary ${flower.sale_price_amd ? 'line-through text-xl':''}`}>
                          {flower.price_amd.toLocaleString()} ֏
                        </span>
                        {flower.sale_price_amd &&  <span className="text-2xl font-bold text-primary">
                          { flower.sale_price_amd.toLocaleString()} ֏
                        </span>}
                        <span className="text-xs text-muted-foreground">
                          {flower.category}
                        </span>
                      </div>

                      {flower.colors && flower.colors.length > 0 && (
                        <div className="mb-4 text-xs text-muted-foreground">
                          Գույներ: {flower.colors.join(', ')}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(flower)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 border border-border hover:bg-muted rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Խմբագրել</span>
                        </button>
                        <button
                          onClick={() => handleDelete(flower.id, flower.name)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Հեռացնել</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {flowers.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  Ծաղիկներ չկան։ Ավելացրեք ձեր առաջին ծաղիկը։
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-bold mb-6">Պատվերների կառավարում</h2>

              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      orderStatusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {status === 'all' ? 'Բոլորը' : status}
                  </button>
                ))}
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Բեռնվում է...</span>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">Պատվերներ չկան</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-serif text-xl font-semibold">
                          Պատվեր #{order.id}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString('hy-AM')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {order.customer_phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {order.total_amount_amd?.toLocaleString()} ֏
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Հաճախորդ</p>
                        <p className="font-semibold">{order.customer_name}</p>
                        {order.customer_email && (
                          <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Հասցե</p>
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-semibold">{order.customer_city}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Վճարման եղանակ</p>
                      <div className="flex gap-4">
                        <span className="text-sm">
                          {order.payment_method === 'cash' ? 'Կանխիկ' : 'Քարտ'}
                        </span>
                        {order.stripe_payment_intent_id && <span className={`text-sm font-medium ${order.stripe_payment_status === 'succeeded' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {order.stripe_payment_status === 'succeeded' ? 'Վճարված' : 'Չվճարված'}
                        </span>}
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Ապրանքներ</p>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.flower?.name} x {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                      <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Բացիկ-Երկտող</p>
                      <div className="flex gap-4">
                        <span className="text-sm">
                          {order.bacik_erktox}
                        </span>
                      </div>
                    </div>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="pt-4 border-t">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="pending">Սպասվում</option>
                          <option value="confirmed">Հաստատված</option>
                          <option value="processing">Մշակվում է</option>
                          <option value="shipped">Ուղարկված</option>
                          <option value="delivered">Հասցեագրված</option>
                          <option value="cancelled">Չեղարկված</option>
                        </select>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'main-page' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-2">Main Page բովանդակության կառավարում</h2>
                <p className="text-muted-foreground">Խմբագրեք ձեր գլխավոր էջի բովանդակությունը</p>
              </div>

              <button
                onClick={() => setIsEditingMainPage(!isEditingMainPage)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>{isEditingMainPage ? 'Չեղարկել' : 'Խմբագրել'}</span>
              </button>
            </div>

            {mainPageLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-lg">Բեռնվում է...</span>
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {isEditingMainPage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm mb-8"
                    >
                      <h3 className="font-serif text-2xl font-bold mb-6">Խմբագրել Main Page բովանդակությունը</h3>
<form onSubmit={handleMainPageSubmit} className="space-y-6">
  {/* Title */}
  <div className="border-t pt-6">
    <h4 className="font-serif text-xl font-semibold mb-4">Վերնագիր և Նկարագրություն</h4>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Վերնագիր *</label>
        <input
          type="text"
          name="title"
          value={mainPageFormData.title}
          onChange={handleMainPageChange}
          className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ենթավերնագիր</label>
        <textarea
          name="subtitle"
          value={mainPageFormData.subtitle}
          onChange={handleMainPageChange}
          rows="2"
          className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Նկարագրություն</label>
        <textarea
          name="description"
          value={mainPageFormData.description}
          onChange={handleMainPageChange}
          rows="4"
          className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Հատուկ առաջարկ</label>
        <textarea
          name="special_offer"
          value={mainPageFormData.special_offer}
          onChange={handleMainPageChange}
          rows="3"
          className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Լրացուցիչ տեքստ</label>
        <textarea
          name="extra_text"
          value={mainPageFormData.extra_text || ''}
          onChange={handleMainPageChange}
          rows="2"
          className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Main նկար</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleMainPageImageUpload}
          disabled={mainPageUploading}
          className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        {mainPageUploading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Վերբեռնվում է...</span>
          </div>
        )}
        {mainPageContent.main_image && (
          <div className="mt-4">
            <img
              src={mainPageContent.main_image}
              alt="Main"
              className="w-48 h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  </div>

  <div className="flex gap-4 border-t pt-6">
    <button
      type="submit"
      disabled={mainPageUploading}
      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-all shadow-lg disabled:opacity-50"
    >
      Պահպանել փոփոխությունները
    </button>
    <button
      type="button"
      onClick={resetMainPageForm}
      className="px-8 py-3 border border-border hover:bg-muted rounded-full font-medium transition-all"
    >
      Չեղարկել
    </button>
  </div>
</form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview Section */}
                <div className="space-y-8">
                  {mainPageContent && (
                    <>
                      {/* Hero Preview */}
                      {(mainPageContent.hero_title || mainPageContent.hero_subtitle) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm"
                        >
                          <div className="relative h-96 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden">
                            {mainPageContent.hero_image_url && (
                              <img
                                src={mainPageContent.hero_image_url}
                                alt="Hero"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="relative text-center text-white px-6">
                              <h2 className="font-serif text-5xl font-bold mb-4">{mainPageContent.hero_title}</h2>
                              <p className="text-xl max-w-2xl">{mainPageContent.hero_subtitle}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* About Preview */}
                      {mainPageContent.about_section_text && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl p-8 border border-border/50 shadow-sm"
                        >
                          <h3 className="font-serif text-3xl font-bold mb-4">About</h3>
                          <p className="text-muted-foreground whitespace-pre-line">{mainPageContent.about_section_text}</p>
                        </motion.div>
                      )}

                      {/* Features Preview */}
                      {mainPageContent.features && mainPageContent.features.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl p-8 border border-border/50 shadow-sm"
                        >
                          <h3 className="font-serif text-3xl font-bold mb-8">Features</h3>
                          <div className="grid md:grid-cols-3 gap-6">
                            {mainPageContent.features.map((feature, index) => (
                              <div key={index} className="p-6 bg-muted/30 rounded-xl">
                                <h4 className="font-serif text-xl font-semibold mb-2">{feature.title}</h4>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* CTA Preview */}
                      {mainPageContent.cta_button_text && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl p-8 border border-border/50 shadow-sm text-center"
                        >
                          <a
                            href={mainPageContent.cta_button_link || '#'}
                            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-all shadow-lg"
                          >
                            {mainPageContent.cta_button_text}
                          </a>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
