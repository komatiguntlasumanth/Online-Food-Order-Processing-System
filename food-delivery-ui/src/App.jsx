import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  User,
  Utensils,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  RotateCcw,
  Check,
  ChefHat,
  CreditCard,
  Truck,
  LogIn,
  LogOut,
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronRight,
  Search,
  MapPin,
  Star,
  ChevronDown,
  PhoneCall,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import LockScreen from './LockScreen';
import UnifiedLogin from './pages/UnifiedLogin.jsx';
import DeliveryPartnerDashboard from './pages/DeliveryPartnerDashboard.jsx';
import DeliveryMap from './pages/DeliveryMap.jsx';
import { getToken, removeToken, getUser, authFetch } from './api/auth';
import Architecture from './pages/Architecture.jsx';

// In production (Netlify) this is the public ngrok URL; locally falls back to '' so Vite proxy handles /api/*
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
// Food images served from public/foodImages/ directory
const FOOD_ITEMS = {
  "What's on your mind?": [
    { id: 'b1', name: 'Idly', price: 40.00, rating: 4.5, time: '15-20 mins', image: '/foodImages/idly.png', desc: 'Soft & fluffy steamed rice cakes served with coconut chutney & hot sambar.', veg: true, restaurantName: 'Udupi Upahar' },
    { id: 'b2', name: 'Plain Dosa', price: 50.00, rating: 4.3, time: '15-20 mins', image: '/foodImages/PlainDosa.png', desc: 'Crispy golden rice crepe served with flavorful chutneys.', veg: true, restaurantName: 'A2B - Adyar Ananda Bhavan' },
    { id: 'b3', name: 'Masala Dosa', price: 70.00, rating: 4.6, time: '20-25 mins', image: '/foodImages/masala_dosa.png', desc: 'Crispy rice crepe stuffed with spiced potato mash.', veg: true, restaurantName: 'Chutneys' },
    { id: 'b5', name: 'Karam Dosa', price: 80.00, rating: 4.5, time: '20-25 mins', image: '/foodImages/karam_dosa.jpg', desc: 'Spicy red chili-garlic paste spread over crispy dosa.', veg: true, restaurantName: 'Ram ki Bandi' },
    { id: 'b6', name: 'Ghee Dosa', price: 90.00, rating: 4.7, time: '15-20 mins', image: '/foodImages/ghee_dosa.jpg', desc: 'Fragrant and crispy dosa cooked with pure ghee.', veg: true, restaurantName: 'Minerva Coffee Shop' },
    { id: 'b7', name: 'Vada', price: 45.00, rating: 4.2, time: '10-15 mins', image: '/foodImages/Vada.jpg', desc: 'Deep-fried savory lentil donuts, crispy outside, soft inside.', veg: true, restaurantName: 'Cafe Niloufer' },
    { id: 'b8', name: 'Poori', price: 60.00, rating: 4.4, time: '20-25 mins', image: '/foodImages/Poori.jpg', desc: 'Puffy deep-fried wheat flatbread served with potato curry.', veg: true, restaurantName: 'Udupi Upahar' },
    { id: 'b9', name: 'Bonda', price: 50.00, rating: 4.1, time: '10-15 mins', image: '/foodImages/Bonda.jpg', desc: 'Fried savory potato balls coated in gram flour batter.', veg: true, restaurantName: 'Utsav' }
  ],
  "Main Course Meals": [
    { id: 'm1', name: 'Veg Meals Thali', price: 120.00, rating: 4.6, time: '25-30 mins', image: '/foodImages/veg_meals_thali.jpg', desc: 'Traditional thali with rice, sambar, rasam, curries, and curd.', veg: true, restaurantName: 'Kamat Hotel' },
    { id: 'm2', name: 'Non Veg Meals Thali', price: 180.00, rating: 4.7, time: '25-30 mins', image: '/foodImages/non_veg_meals_thali.jpg', desc: 'Thali containing rice, aromatic chicken curry, fish gravy, and sides.', veg: false, restaurantName: 'Ohri\'s' },
    { id: 'm3', name: 'Hyderabadi Chicken Biryani', price: 240.00, rating: 4.8, time: '30-35 mins', image: '/foodImages/hyderabadi_chicken_biryani.jpg', desc: 'Long grain basmati rice cooked with succulent chicken and spices.', veg: false, restaurantName: 'Paradise Biryani' },
    { id: 'm4', name: 'Paneer Biryani', price: 200.00, rating: 4.4, time: '30-35 mins', image: '/foodImages/paneer_biryani.jpg', desc: 'Spiced basmati rice layered with soft paneer cubes.', veg: true, restaurantName: 'Shah Ghouse' },
    { id: 'm5', name: 'Egg Biryani', price: 170.00, rating: 4.3, time: '25-30 mins', image: '/foodImages/egg_biryani.jpg', desc: 'Fragrant biryani rice served with spiced boiled eggs.', veg: false, restaurantName: 'Bawarchi' }
  ],
  "Quick Bites & Snacks": [
    { id: 's1', name: 'Samosa (2 Pcs)', price: 25.00, rating: 4.2, time: '10-15 mins', image: '/foodImages/samosa.jpg', desc: 'Crispy pastry shells stuffed with spiced potatoes and peas.', veg: true, restaurantName: 'Bikanerwala' },
    { id: 's2', name: 'Onion Pakoda', price: 40.00, rating: 4.1, time: '10-15 mins', image: '/foodImages/onion_pakoda.jpg', desc: 'Deep-fried crispy onion fritters seasoned with spices.', veg: true, restaurantName: 'Haldiram\'s' },
    { id: 's3', name: 'Mirchi Bajji', price: 45.00, rating: 4.3, time: '15-20 mins', image: '/foodImages/mirchi_bajji.jpg', desc: 'Spicy chili peppers batter-fried and stuffed with onions.', veg: true, restaurantName: 'Gokul Chat' },
    { id: 's4', name: 'Pav Bhaji', price: 80.00, rating: 4.5, time: '15-20 mins', image: '/foodImages/pav_bhaji.jpg', desc: 'Thick vegetable curry served with soft buttered bread rolls.', veg: true, restaurantName: 'Sardarji\'s Chaat' }
  ],
  "Dinner Specialities": [
    { id: 'd1', name: 'Butter Naan & Paneer Gravy', price: 160.00, rating: 4.6, time: '25-30 mins', image: '/foodImages/butter_naan_paneer_gravy.jpg', desc: 'Soft butter naan served with rich and creamy paneer butter masala.', veg: true, restaurantName: 'Dhaba Estd 1986' },
    { id: 'd2', name: 'Chapati with Kurma', price: 80.00, rating: 4.2, time: '20-25 mins', image: '/foodImages/chapati_with_kurma.jpg', desc: 'Soft whole wheat flatbread served with mixed vegetable kurma.', veg: true, restaurantName: 'Saravana Bhavan' },
    { id: 'd3', name: 'Veg Fried Rice', price: 110.00, rating: 4.3, time: '20-25 mins', image: '/foodImages/veg_fried_rice.jpg', desc: 'Stir-fried rice loaded with veggies, soy sauce, and aromatics.', veg: true, restaurantName: 'Chung Hua' },
    { id: 'd4', name: 'Schezwan Noodles', price: 120.00, rating: 4.4, time: '20-25 mins', image: '/foodImages/schezwan_noodles.jpg', desc: 'Spicy noodles tossed with colorful vegetables and Schezwan sauce.', veg: true, restaurantName: 'Nanking' }
  ]
};

function App() {
  const [user, setUser] = useState(getUser());
  const [appMode, setAppMode] = useState(localStorage.getItem('swiggy_app_mode') || 'customer');
  const [showAuth, setShowAuth] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'overview', 'payment', 'tracking'
  
  const [activeCategory, setActiveCategory] = useState("What's on your mind?");
  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [customerName, setCustomerName] = useState(user ? (user.fullName || user.username) : '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Success animations states
  const [showOrderSuccessPopup, setShowOrderSuccessPopup] = useState(false);
  const [cancelModalOrderId, setCancelModalOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelError, setShowCancelError] = useState(false);

  // Payment & Delivery states
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Poll orders from backend and sync with local storage
  const fetchOrders = async () => {
    try {
      const response = await authFetch(`${API_BASE}/api/orders`);
      let backendOrders = [];
      if (response.ok) {
        backendOrders = await response.json();
      }

      // Load locally stored/simulated order details
      const localOrders = JSON.parse(localStorage.getItem('swiggy_orders') || '[]');
      
      // Merge backend orders with local simulation details
      const merged = [...backendOrders];
      localOrders.forEach((localOrder) => {
        const idx = merged.findIndex((o) => o.id === localOrder.id);
        if (idx !== -1) {
          merged[idx] = { ...merged[idx], ...localOrder };
        } else {
          // If order is purely local (mocked because backend was down)
          merged.push(localOrder);
        }
      });

      // Sort: descending order IDs
      setOrders(merged.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.warn('Network issue fetching orders, loading local orders registry.');
      const localOrders = JSON.parse(localStorage.getItem('swiggy_orders') || '[]');
      setOrders(localOrders.sort((a, b) => b.id - a.id));
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (data) => {
    setUser(data);
    setShowAuth(false);
    if (data) {
      const mode = data.role === 'DELIVERY' ? 'delivery-partner' : 'customer';
      setAppMode(mode);
      localStorage.setItem('swiggy_app_mode', mode);
      if (data.fullName) {
        setCustomerName(data.fullName);
      } else if (data.username) {
        setCustomerName(data.username);
      }
    }
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setCart([]);
    setOrders([]);
    setAppMode('customer');
    setViewMode('dashboard');
    localStorage.removeItem('swiggy_orders');
    localStorage.removeItem('swiggy_app_mode');
  };

  const handleCancelOrderSubmit = (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setShowCancelError(true);
      return;
    }
    
    const localOrders = JSON.parse(localStorage.getItem('swiggy_orders') || '[]');
    const updated = localOrders.map((o) => {
      if (o.id === cancelModalOrderId) {
        o.status = 'CANCELLED';
        o.cancelReason = cancelReason;
      }
      return o;
    });
    localStorage.setItem('swiggy_orders', JSON.stringify(updated));

    // Try backend cancel if active
    authFetch(`${API_BASE}/api/orders/${cancelModalOrderId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: cancelReason })
    }).catch(err => console.log('Backend sync skipped.'));

    setCancelModalOrderId(null);
    setCancelReason('');
    setShowCancelError(false);
    fetchOrders();
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart((prev) => {
      return prev.map((i) => {
        if (i.item.id === itemId) {
          const newQty = i.quantity + change;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, i) => total + (i.item.price * i.quantity), 0);
  };

  const handleCheckout = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShowCartDrawer(false);
    setViewMode('payment');
  };

  const handlePaymentSuccess = () => {
    // Show popup
    setShowOrderSuccessPopup(true);
    setTimeout(() => {
      setShowOrderSuccessPopup(false);
      setViewMode('delivery_details');
    }, 2000);
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!deliveryAddress.trim()) {
      setError('Please provide your delivery address or live location.');
      return;
    }
    if (!customerName.trim()) {
      setError('Please provide your name.');
      return;
    }
    setError(null);
    setLoading(true);

    const itemsSummary = cart.map((i) => `${i.item.name} x${i.quantity}`).join(', ');
    const totalAmount = getCartTotal();

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          customerName: customerName,
          item: itemsSummary,
          amount: totalAmount
        }),
      });

      if (response.ok) {
        const newOrder = await response.json();
        
        // Save to localStorage list for Delivery Partner synchronization
        // NOTE: driverName/driverUsername intentionally left empty so a logged-in
        // delivery partner can claim this order from their dashboard.
        const localOrders = JSON.parse(localStorage.getItem('swiggy_orders') || '[]');
        const storedOrder = {
          ...newOrder,
          status: 'PLACED',
          address: deliveryAddress,
          createdAt: new Date().toISOString()
        };
        localOrders.push(storedOrder);
        localStorage.setItem('swiggy_orders', JSON.stringify(localOrders));

        setCart([]);
        setExpandedOrderId(newOrder.id);

        setViewMode('assigning'); // Go to assigning page first
        
        // After assigning, auto redirect to tracking after a short delay
        setTimeout(() => {
          setViewMode('tracking');
        }, 5000);

        fetchOrders();
      } else {
        throw new Error('Backend failed to process order, falling back to local simulation');
      }
    } catch (err) {
      console.warn('[Sync Warning] Backend connection failed. Placing a simulated local order.');
      setError(null);
      const mockId = Math.floor(100000 + Math.random() * 900000);

      // NOTE: driverName/driverUsername intentionally left empty so a logged-in
      // delivery partner can claim this order from their dashboard.
      const newOrder = {
        id: mockId,
        customerName: customerName,
        item: itemsSummary,
        amount: totalAmount,
        status: 'PLACED',
        address: deliveryAddress,
        createdAt: new Date().toISOString()
      };

      const localOrders = JSON.parse(localStorage.getItem('swiggy_orders') || '[]');
      localOrders.push(newOrder);
      localStorage.setItem('swiggy_orders', JSON.stringify(localOrders));

      setCart([]);
      setExpandedOrderId(mockId);
      
      setViewMode('assigning');
      // Auto-navigate to tracking after showing assignment screen
      setTimeout(() => {
        setViewMode('tracking');
      }, 6000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'PLACED': return 1;
      case 'KITCHEN PREPARATION': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 1;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'DELIVERED') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'CANCELLED') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const getFilteredItems = () => {
    const items = FOOD_ITEMS[activeCategory];
    if (!searchQuery.trim()) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Switch between customer and delivery partner portals
  if (appMode === 'delivery-partner') {
    return <DeliveryPartnerDashboard />;
  }

  if (viewMode === 'overview') {
    return <Architecture onBack={() => setViewMode('dashboard')} />;
  }

  return (
    <div className="min-h-screen pb-24 relative font-sans text-slate-900 overflow-x-hidden">
      {/* ── GLASSMORPHISM BACKGROUND ── */}
      <div className="glass-bg-root" aria-hidden="true" />
      <div className="glass-orb glass-orb-1" aria-hidden="true" />
      <div className="glass-orb glass-orb-2" aria-hidden="true" />
      <div className="glass-orb glass-orb-3" aria-hidden="true" />
      <div className="glass-orb glass-orb-4" aria-hidden="true" />
      
      {/* SUCCESS ANIMATION POPUP OVERLAY */}
      {showOrderSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B0F19] border border-slate-200 rounded-3xl p-8 space-y-7 text-center animate-zoom-in relative overflow-hidden backdrop-blur-md bg-opacity-80">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-black/5 shadow-2xl shadow-green-500/30 text-slate-900">
              <Check className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Order Placed<br/>Successfully!</h2>
            <p className="text-slate-600 text-sm font-medium">Redirecting to delivery details...</p>
          </div>
        </div>
      )}

      {/* ── PREMIUM GLASS HEADER ── */}
      <header className="sticky top-0 z-40 glass-header px-6">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('dashboard')}>
              <div className="w-10 h-14 bg-[#fc8019] rounded-b-xl flex items-center justify-center text-slate-900 shadow-black/5 shadow-black/5 shadow-2xl">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tighter text-[#fc8019]">
                  swiggy
                </span>
                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-600 block -mt-1">EXPRESS</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#fc8019] cursor-pointer">
              <MapPin className="w-4 h-4 text-[#fc8019]" />
              <span>Madhapur, Hyderabad</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#fc8019]" />
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setViewMode('overview')} 
              className="text-sm font-bold text-slate-700 hover:text-[#fc8019] transition-colors"
            >
              How It Works
            </button>

            {user && orders.length > 0 && (
              <button 
                onClick={() => setViewMode('tracking')} 
                className="text-sm font-bold text-slate-700 hover:text-[#fc8019] transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-[#fc8019]" />
                Track Orders
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#fc8019]" />
                <span className="text-sm font-bold text-slate-800">{user.fullName || user.username}</span>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 hover:text-red-500 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="text-sm font-bold text-slate-700 hover:text-[#fc8019] transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-slate-600" />
                Sign In / Register
              </button>
            )}

            {/* Cart Icon */}
            <button 
              onClick={() => setShowCartDrawer(true)}
              className="relative p-2 text-slate-800 hover:text-[#fc8019] transition-colors flex items-center gap-1.5"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#fc8019] text-slate-900 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {cart.reduce((qty, i) => qty + i.quantity, 0)}
                </span>
              )}
              <span className="text-sm font-bold hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {viewMode === 'dashboard' && (
          <div className="space-y-12">
            
            {/* Search Bar section */}
            <div className="max-w-xl mx-auto relative mt-4">
              <input
                type="text"
                placeholder="Search for dishes, snacks or meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full px-5 py-3.5 pl-12 rounded-2xl text-sm font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            </div>

            {/* Category Navigation */}
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                {activeCategory}
              </h2>
              
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
                {Object.keys(FOOD_ITEMS).map((category) => (
                  <button
                    key={category}
                    onClick={() => { setActiveCategory(category); setSearchQuery(''); }}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === category ? 'pill-active' : 'pill-inactive'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredItems().map((item) => {
                  const cartItem = cart.find(i => i.item.id === item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className="glass-card glass-shimmer rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group"
                    >
                      <div className="h-44 bg-white/60 rounded-2xl flex items-center justify-center text-5xl mb-4 relative overflow-hidden group-hover:shadow-black/5 shadow-2xl transition-all">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-black/5 flex items-center gap-1 shadow-black/5 shadow-2xl">
                          <span className={item.veg ? 'text-green-500' : 'text-red-500'}>●</span>
                          <span className="text-slate-900 uppercase tracking-widest">{item.veg ? 'Veg' : 'Non-Veg'}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#fc8019] transition-colors">{item.name}</h3>
                          <span className="font-bold text-sm text-slate-900">₹{item.price}</span>
                        </div>
                        
                        {item.restaurantName && (
                          <div className="text-xs text-slate-700 font-medium mb-2 flex items-center gap-1.5">
                            <Utensils className="w-3 h-3 text-[#fc8019]" />
                            {item.restaurantName}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 mb-3">
                          <span className="flex items-center gap-0.5 text-green-600 bg-green-500/20 border border-green-500/30 px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-green-400 text-green-600" /> {item.rating}
                          </span>
                          <span>•</span>
                          <span>{item.time}</span>
                        </div>

                        <p className="text-slate-600 text-xs leading-relaxed mb-6 line-clamp-2">{item.desc}</p>
                      </div>

                      {/* Add button styled like Swiggy */}
                      <div className="relative">
                        {cartItem ? (
                          <div className="w-full flex items-center justify-between border border-[#fc8019]/60 text-[#fc8019] rounded-2xl font-bold bg-orange-500/10 backdrop-blur-sm py-2.5 px-4">
                            <button onClick={() => updateQuantity(item.id, -1)} className="hover:scale-110 active:scale-95 transition-transform">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-extrabold">{cartItem.quantity}</span>
                            <button onClick={() => addToCart(item)} className="hover:scale-110 active:scale-95 transition-transform">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full py-2.5 glass-card border-none hover:border-[#fc8019]/40 text-[#fc8019] font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Payment Screen */}
        {viewMode === 'payment' && (
          <div className="max-w-2xl mx-auto glass-card rounded-3xl p-8 space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">Select Payment Method</h2>
              <p className="text-sm text-slate-600 mt-1">Complete your transaction to proceed to delivery details.</p>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex bg-white/5 backdrop-blur-md border border-black/5 p-1 rounded-2xl">
              <button 
                onClick={() => setPaymentMethod('UPI')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${paymentMethod === 'UPI' ? 'bg-white/10 text-[#fc8019] shadow-glass' : 'text-slate-600'}`}
              >
                UPI / QR
              </button>
              <button 
                onClick={() => setPaymentMethod('CARD')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMethod === 'CARD' ? 'bg-white/10 text-[#fc8019] shadow-glass' : 'text-slate-600'}`}
              >
                <CreditCard className="w-4 h-4" /> Credit/Debit Card
              </button>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="space-y-4 animate-fade-in">
                <div className="glass-card p-4 rounded-2xl flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-600">UPI Address:</span>
                  <span className="font-bold text-[#fc8019] select-all">6300334374@ibl</span>
                </div>
                {/* Dynamic UPI Details */}
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block">Amount to Pay</span>
                    <span className="text-3xl font-black text-[#fc8019]">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="glass-card p-4 rounded-2xl flex flex-col items-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        `upi://pay?pa=6300334374@ibl&pn=SWIGGY%20EXPRESS&am=${getCartTotal()}&cu=INR`
                      )}`} 
                      alt="Dynamic UPI QR Code" 
                      className="w-56 h-56 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-600 font-bold tracking-wider uppercase mt-3">Scan to Auto-fill</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in p-6 glass-card rounded-3xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                      <input 
                        type="text" 
                        maxLength="19"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="glass-input w-full pl-12 pr-4 py-3.5 rounded-2xl font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">Expiry (MM/YY)</label>
                      <input 
                        type="text" 
                        maxLength="5"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="glass-input w-full px-4 py-3.5 rounded-2xl font-mono text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">CVV</label>
                      <input 
                        type="password" 
                        maxLength="4"
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="glass-input w-full px-4 py-3.5 rounded-2xl font-mono text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="glass-input w-full px-4 py-3.5 rounded-2xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-4">
              <button
                onClick={() => setViewMode('dashboard')}
                className="flex-1 py-4 glass-card rounded-2xl text-slate-700 font-bold transition-all hover:border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSuccess}
                className="flex-1 py-4 btn-brand text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                I Have Paid
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Delivery Details Screen */}
        {viewMode === 'delivery_details' && (
          <div className="max-w-2xl mx-auto glass-card rounded-3xl p-8 space-y-6 animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900/30 text-blue-600 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Delivery Details</h2>
              <p className="text-sm text-slate-600 mt-1">Please provide your live location or address.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 text-red-600 text-sm font-bold rounded-xl border border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="glass-input w-full px-5 py-4 rounded-2xl font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#fc8019]" /> Complete Address / Live Location
                </label>
                <textarea
                  required
                  rows="3"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 12-4-5, Near Clock Tower, Hitec City, Hyderabad"
                  className="glass-input w-full px-5 py-4 rounded-2xl font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 btn-brand text-slate-900 font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Confirm Delivery Location
                    <Check className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Assigning Delivery Partner Page */}
        {viewMode === 'assigning' && (() => {
          // Get the most recently placed order's driver info
          const localOrders = JSON.parse(localStorage.getItem('swiggy_orders') || '[]');
          const lastOrder = localOrders[localOrders.length - 1] || {};
          const driverName = lastOrder.driverName || 'Ravi Kumar';
          const driverMobile = lastOrder.driverMobile || '9876543210';
          const driverInitials = driverName.split(' ').map(n => n[0]).join('');

          return (
            <div className="max-w-lg mx-auto animate-slide-up">
              {/* Main Card */}
              <div className="glass-card rounded-3xl overflow-hidden">
                {/* Top gradient banner */}
                <div className="bg-gradient-to-br from-[#fc8019] to-orange-500 p-8 text-center text-slate-900">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest opacity-90">Payment Confirmed</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Finding Your Rider</h2>
                  <p className="text-orange-100 text-sm mt-1">Your order has been placed successfully</p>
                </div>

                {/* Pulsing rider animation */}
                <div className="flex flex-col items-center justify-center py-10 px-8 space-y-6">
                  {/* Animated pulse rings */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-28 h-28 rounded-full bg-orange-100 animate-ping opacity-40" />
                    <div className="absolute w-20 h-20 rounded-full bg-orange-200 animate-ping opacity-30" style={{ animationDelay: '0.3s' }} />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-[#fc8019] to-orange-500 rounded-full flex items-center justify-center shadow-black/5 shadow-2xl shadow-orange-400/40 text-slate-900 text-3xl">
                      🚴
                    </div>
                  </div>

                  {/* Partner Assigned Badge */}
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Delivery Partner Assigned</span>
                    <div className="flex items-center justify-center gap-3 mt-3">
                      {/* Avatar circle with initials */}
                      <div className="w-12 h-12 rounded-full bg-white/60 text-slate-900 flex items-center justify-center font-extrabold text-lg shadow-black/5 shadow-black/5 shadow-2xl">
                        {driverInitials}
                      </div>
                      <div className="text-left">
                        <div className="font-extrabold text-lg text-slate-900">{driverName}</div>
                        <div className="text-sm text-slate-600 font-medium">{driverMobile}</div>
                      </div>
                    </div>
                  </div>

                  {/* Steps timeline */}
                  <div className="w-full glass-card rounded-2xl p-5 space-y-3">
                    {[
                      { icon: '✅', label: 'Payment Verified', done: true },
                      { icon: '🤝', label: 'Delivery Partner Assigned', done: true },
                      { icon: '👨‍🍳', label: 'Kitchen Preparing Your Order', done: false },
                      { icon: '🛵', label: 'Out for Delivery', done: false },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-lg">{step.icon}</span>
                        <span className={`text-sm font-semibold ${step.done ? 'text-slate-900' : 'text-slate-600'}`}>
                          {step.label}
                        </span>
                        {step.done && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                      </div>
                    ))}
                  </div>

                  {/* Spinner + redirect notice */}
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-[#fc8019]" />
                    <span>Redirecting to live tracking in a moment...</span>
                  </div>

                  {/* Manual go to tracking button */}
                  <button
                    onClick={() => setViewMode('tracking')}
                    className="w-full py-4 btn-brand text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Truck className="w-5 h-5" />
                    Track My Order Now
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tracking Dashboard */}
        {viewMode === 'tracking' && (
          <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className="flex items-center gap-2 px-4 py-2.5 btn-brand text-slate-900 text-sm font-bold rounded-xl transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Dashboard
                </button>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Order Tracking Dashboard
                </h2>
              </div>
              <button 
                onClick={fetchOrders}
                className="p-2.5 text-slate-600 hover:text-[#fc8019] glass-card rounded-full transition-all"
                title="Refresh Status"
              >
                <RotateCcw className="w-4 h-4 animate-spin-slow" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="glass-card rounded-3xl p-16 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#1A2235] flex items-center justify-center mx-auto text-slate-700">
                  <Utensils className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">No Orders Placed Yet</h3>
                  <p className="text-sm text-slate-600 mt-1">Select items, complete the checkout and pay to view tracking pipelines here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const step = getStatusStep(order.status);
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div 
                      key={order.id}
                      className="glass-card rounded-3xl overflow-hidden transition-all duration-300 animate-slide-up"
                    >
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-5 flex justify-between items-center cursor-pointer select-none"
                      >
                        <div className="space-y-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600 uppercase">Order #{order.id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-900 truncate">
                            {order.item}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {order.customerName}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-extrabold text-slate-900">₹{order.amount}</div>
                          <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                            {isExpanded ? 'Click to hide' : 'Click to track'}
                          </div>
                        </div>
                      </div>

                      {/* Stepper Timeline Area */}
                      {isExpanded && (
                        <div className="border-t border-slate-50 bg-[#1A2235]/50 p-6 sm:p-8 space-y-6">
                          
                          {/* Live Delivered Overlay Animation inside the card */}
                          {order.status === 'DELIVERED' && (
                            <div className="p-6 text-center bg-green-900/20 border border-green-500/30 rounded-3xl space-y-4 animate-zoom-in">
                              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-slate-900 mx-auto text-2xl shadow-black/5 shadow-2xl">
                                🎉
                              </div>
                              <div>
                                <h4 className="font-black text-xl text-slate-900 tracking-tight animate-bounce">
                                  Items Delivered!
                                </h4>
                                <p className="text-sm font-semibold text-green-600 mt-1">
                                  Thank you for purchasing — Swiggy Express
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Order Cancelled details */}
                          {step === -1 && (
                            <div className="flex gap-4 items-start p-4 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-600 animate-zoom-in">
                              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-bold text-sm text-slate-900">Order Cancelled</h5>
                                <p className="text-xs text-red-600 mt-1">
                                  Reason: {order.cancelReason || 'No reason provided.'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Customer Delivery Location Details block */}
                          {order.address && (
                            <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-2xl flex items-start gap-3 animate-slide-up">
                              <MapPin className="w-5 h-5 text-[#fc8019] flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-extrabold text-sm text-slate-900">Delivery Address</h5>
                                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                                  {order.address}
                                </p>
                              </div>
                            </div>
                          )}

                          {step !== -1 && order.status !== 'DELIVERED' && (
                            <div className="relative">
                              {/* Horizontal Line connector */}
                              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden sm:block">
                                <div 
                                  className="h-full bg-[#fc8019] transition-all duration-500" 
                                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                                />
                              </div>

                              {/* Stepper Steps grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
                                {/* Step 1: PLACED */}
                                <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    step >= 1 ? 'bg-[#fc8019] text-slate-900 shadow' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">Order Placed</div>
                                    <div className="text-[10px] text-slate-600 mt-0.5">Payment Verified</div>
                                  </div>
                                </div>

                                {/* Step 2: KITCHEN PREPARATION */}
                                <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    step >= 2 ? 'bg-[#fc8019] text-slate-900 shadow' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">Kitchen Prep</div>
                                    <div className="text-[10px] text-slate-600 mt-0.5">Preparing items</div>
                                  </div>
                                </div>

                                {/* Step 3: OUT_FOR_DELIVERY */}
                                <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    step >= 3 ? 'bg-[#fc8019] text-slate-900 shadow' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {step > 3 ? <Check className="w-4 h-4" /> : '3'}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">Out for Delivery</div>
                                    <div className="text-[10px] text-slate-600 mt-0.5">
                                      {order.driverName ? `Assigned: ${order.driverName}` : 'Driver assignment'}
                                    </div>
                                  </div>
                                </div>

                                {/* Step 4: DELIVERED */}
                                <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    step >= 4 ? 'bg-green-500 text-slate-900 shadow' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    4
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">Delivered</div>
                                    <div className="text-[10px] text-slate-600 mt-0.5">Handed over</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Live tracking map if out for delivery */}
                          {order.status === 'OUT_FOR_DELIVERY' && (
                            <div className="space-y-4 animate-fade-in">
                              <h5 className="text-xs font-black text-slate-600 uppercase tracking-widest">Live Delivery Location Tracker</h5>
                              <DeliveryMap orderStatus="OUT_FOR_DELIVERY" />
                            </div>
                          )}

                          {/* Delivery partner driver details block */}
                          {order.driverName && (
                            <div className="p-4 bg-[#131A2A] border border-slate-200 rounded-2xl shadow-black/5 shadow-black/5 shadow-2xl flex items-center justify-between gap-4 animate-slide-up">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-900/30 border border-orange-500/30 flex items-center justify-center rounded-xl text-[#fc8019]">
                                  🚴
                                </div>
                                <div>
                                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Your Delivery Partner</div>
                                  <div className="text-sm font-extrabold text-slate-900">{order.driverName}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <a 
                                  href={`tel:${order.driverMobile || '9876543210'}`}
                                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100/80 hover:bg-slate-800 text-slate-900 rounded-xl text-xs font-bold transition-all"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>{order.driverMobile || '9876543210'}</span>
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {/* Cancel Order trigger button */}
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => setCancelModalOrderId(order.id)}
                                className="text-xs text-red-600 hover:text-red-300 font-extrabold transition-colors flex items-center gap-1 border border-red-500/30 hover:border-red-500/50 px-3.5 py-1.5 rounded-xl bg-red-900/20"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Slide-over Right Sidebar Drawer for Swiggy Cart */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-100/80/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCartDrawer(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#131A2A] shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#fc8019]" />
                  Cart ({cart.reduce((qty, i) => qty + i.quantity, 0)} Items)
                </h3>
                <button 
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 text-slate-600 hover:text-slate-300 hover:bg-[#1A2235] rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cart List */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="w-20 h-20 bg-[#1A2235] border rounded-3xl flex items-center justify-center text-slate-700">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-extrabold text-slate-800">Your cart is empty</h4>
                    <p className="text-slate-600 text-xs mt-1">Add items from the menu to start your order.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {cart.map((cartItem) => (
                    <div key={cartItem.item.id} className="flex justify-between items-center p-3 rounded-2xl border border-slate-200 hover:border-[#334155] transition-colors">
                      <div className="flex gap-3 items-center">
                        <span className="text-3xl">{cartItem.item.icon}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{cartItem.item.name}</h4>
                          <span className="text-xs text-[#fc8019] font-bold">₹{cartItem.item.price} each</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(cartItem.item.id, -1)}
                          className="p-1 bg-[#1A2235] border rounded-full hover:bg-slate-100"
                        >
                          <Minus className="w-3.5 h-3.5 text-slate-700" />
                        </button>
                        <span className="font-extrabold text-sm w-4 text-center">{cartItem.quantity}</span>
                        <button 
                          onClick={() => addToCart(cartItem.item)}
                          className="p-1 bg-[#1A2235] border rounded-full hover:bg-slate-100"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary & Proceed */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-200 space-y-4 bg-[#1A2235]/50">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-slate-600">To Pay:</span>
                    <span className="text-2xl font-black text-slate-900">₹{getCartTotal()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[#fc8019] hover:bg-orange-600 text-slate-900 font-extrabold rounded-2xl shadow-black/5 shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    Proceed to Checkout
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart bottom checkout banner bar */}
      {cart.length > 0 && !showCartDrawer && viewMode === 'dashboard' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
          <div className="bg-[#fc8019] text-slate-900 rounded-2xl p-4 flex justify-between items-center shadow-black/5 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold">{cart.reduce((qty, i) => qty + i.quantity, 0)} items | ₹{getCartTotal()}</span>
            </div>
            <button 
              onClick={() => setShowCartDrawer(true)}
              className="text-sm font-bold flex items-center gap-1 uppercase tracking-wider bg-[#131A2A]/20 hover:bg-[#131A2A]/30 px-4 py-2 rounded-xl transition-all"
            >
              View Cart
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-transparent">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute -top-12 right-0 p-2 text-slate-900/80 hover:text-slate-900 bg-[#131A2A]/10 hover:bg-[#131A2A]/20 rounded-full backdrop-blur-sm transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <UnifiedLogin onLogin={handleLogin} />
          </div>
        </div>
      )}

      {/* Order placed success animation full screen overlay */}
      {showOrderSuccessPopup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in">
          {/* Confetti pieces background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#fc8019', '#ff6b35', '#4ade80', '#3b82f6', '#facc15'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Large Success Box Card */}
          <div className="bg-[#131A2A] rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-6 animate-zoom-in">
            <div className="w-24 h-24 mx-auto bg-green-900/30 rounded-full flex items-center justify-center border-4 border-green-500/30">
              <svg className="w-14 h-14" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Placed Successful!</h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Your transaction has been confirmed. Redirecting to your live order tracking timeline...
              </p>
            </div>
            <div className="pt-2 flex justify-center text-orange-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal with reason details */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131A2A] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-zoom-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 bg-red-900/30 border border-red-500/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Cancel Order #{cancelModalOrderId}</h3>
                <p className="text-[11px] text-slate-600">Please provide a reason for cancelling this order</p>
              </div>
            </div>

            {showCancelError && (
              <div className="p-3 bg-red-900/30 border border-red-500/30 text-red-600 rounded-xl text-xs font-bold animate-zoom-in">
                Please enter a cancellation reason to confirm!
              </div>
            )}

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
              <textarea
                required
                value={cancelReason}
                onChange={(e) => { setCancelReason(e.target.value); setShowCancelError(false); }}
                placeholder="Reason for cancellation (e.g. Changed my mind, Selected wrong items, Address issues...)"
                className="w-full h-28 p-4 bg-[#1A2235] border border-[#334155] rounded-2xl text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition-all"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCancelModalOrderId(null); setCancelReason(''); setShowCancelError(false); }}
                  className="flex-1 py-3 border border-[#334155] text-slate-700 font-bold rounded-2xl hover:bg-[#1A2235] text-xs transition-all"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-slate-900 font-bold rounded-2xl text-xs transition-all shadow-black/5 shadow-black/5 shadow-2xl shadow-red-600/20"
                >
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
