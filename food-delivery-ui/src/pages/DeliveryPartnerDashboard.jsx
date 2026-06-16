import React, { useState, useEffect, useRef } from 'react';
import {
  Truck, Wallet, LogOut, CheckCircle2, Landmark, Save,
  RefreshCw, Package, MapPin, Navigation, ChevronRight,
  Bell, Star, Zap
} from 'lucide-react';
import { removeToken, getUser } from '../api/auth';
import DeliveryMap from './DeliveryMap';

// Animated SVG checkmark component
const AnimatedCheck = () => (
  <svg className="w-24 h-24" viewBox="0 0 52 52">
    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
    <path className="checkmark-check" fill="none" stroke="#4ade80" strokeWidth="2.5" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
  </svg>
);

// Confetti burst component
const ConfettiPiece = ({ style }) => <div className="confetti-piece" style={style} />;

const CONFETTI_COLORS = ['#fc8019', '#4ade80', '#60a5fa', '#f472b6', '#facc15'];

export default function DeliveryPartnerDashboard() {
  const user = getUser();
  const [online, setOnline] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  // Steps: 'WAITING', 'ASSIGNED', 'PICKED_UP', 'ARRIVED', 'DELIVERED'
  const [orderStep, setOrderStep] = useState('WAITING');
  const [walletBalance, setWalletBalance] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [showDeliveredPopup, setShowDeliveredPopup] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // New order flash animation
  const [newOrderFlash, setNewOrderFlash] = useState(false);

  // Bank details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Swipe state
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const swipeRef = useRef(null);
  const isDragging = useRef(false);

  const STORES = [
    'Swiggy Express Hub - Madhapur',
    'Swiggy Express Hub - Kondapur',
    'Swiggy Express Hub - Hitec City',
    'Swiggy Express Hub - Gachibowli',
  ];

  // ── Load persisted state ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const savedBal = localStorage.getItem(`wallet_${user.username}`) || '0';
    setWalletBalance(parseInt(savedBal, 10));

    const savedDel = localStorage.getItem(`deliveries_${user.username}`);
    if (savedDel) setCompletedDeliveries(JSON.parse(savedDel));

    const savedBank = localStorage.getItem(`bank_${user.username}`);
    if (savedBank) {
      const p = JSON.parse(savedBank);
      setBankName(p.bankName || '');
      setAccountNumber(p.accountNumber || '');
      setIfscCode(p.ifscCode || '');
    }

    const storedStore = localStorage.getItem(`store_${user.username}`) || STORES[0];
    setSelectedStore(storedStore);
  }, []);

  // ── Poll for new customer orders and assign to THIS logged-in partner ─────
  useEffect(() => {
    if (!online) {
      setCurrentOrder(null);
      setOrderStep('WAITING');
      return;
    }

    const checkOrders = () => {
      if (currentOrder) return; // already have an active order
      const raw = localStorage.getItem('swiggy_orders');
      if (!raw) return;
      const orders = JSON.parse(raw);

      // Find unassigned order (no driverUsername means truly unassigned)
      const unassigned = orders.find(
        (o) =>
          ['PLACED', 'PAYMENT_SUCCESS', 'KITCHEN PREPARATION'].includes(o.status) &&
          !o.driverUsername
      );

      if (unassigned) {
        // Assign to THIS logged-in delivery partner
        unassigned.driverName = user ? (user.fullName || user.username) : 'Partner';
        unassigned.driverUsername = user ? user.username : 'partner';
        unassigned.driverMobile = user?.mobile || '9876543210';
        unassigned.status = 'KITCHEN PREPARATION';
        unassigned.assignedAt = new Date().toISOString();

        localStorage.setItem('swiggy_orders', JSON.stringify(orders));
        setCurrentOrder(unassigned);
        setOrderStep('ASSIGNED');
        setIsSwiped(false);
        setSwipeProgress(0);

        // Flash animation + vibration
        setNewOrderFlash(true);
        setTimeout(() => setNewOrderFlash(false), 2500);
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
      }
    };

    const interval = setInterval(checkOrders, 1500);
    return () => clearInterval(interval);
  }, [online, currentOrder]);

  // ── Order status sync helper ──────────────────────────────────────────────
  const updateOrderStatus = (newStatus) => {
    if (!currentOrder) return;
    const raw = localStorage.getItem('swiggy_orders');
    if (!raw) return;
    const orders = JSON.parse(raw);
    const updated = orders.map((o) =>
      o.id === currentOrder.id ? { ...o, status: newStatus } : o
    );
    localStorage.setItem('swiggy_orders', JSON.stringify(updated));
    setCurrentOrder((prev) => ({ ...prev, status: newStatus }));
  };

  // ── Step Handlers ─────────────────────────────────────────────────────────
  const handleGoOnline = () => {
    if (!selectedStore) { alert('Please select a nearby store first!'); return; }
    setOnline(true);
    if (user) localStorage.setItem(`store_${user.username}`, selectedStore);
  };

  const handleGoOffline = () => {
    if (currentOrder) { alert('Cannot go offline during an active delivery!'); return; }
    setOnline(false);
  };

  const handlePickUp = () => {
    updateOrderStatus('OUT_FOR_DELIVERY');
    setOrderStep('PICKED_UP');
  };

  const handleArrived = () => {
    setOrderStep('ARRIVED');
  };

  const handleDelivered = () => {
    updateOrderStatus('DELIVERED');
    setOrderStep('DELIVERED');

    // ₹20 wallet credit
    const newBal = walletBalance + 20;
    setWalletBalance(newBal);
    if (user) {
      localStorage.setItem(`wallet_${user.username}`, newBal.toString());
      const newLog = {
        id: currentOrder.id,
        item: currentOrder.item,
        amount: currentOrder.amount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        earnings: 20,
      };
      const logs = [newLog, ...completedDeliveries];
      setCompletedDeliveries(logs);
      localStorage.setItem(`deliveries_${user.username}`, JSON.stringify(logs));
    }

    // Confetti burst
    const pieces = Array.from({ length: 20 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 1.5}s`,
      animationDuration: `${1.5 + Math.random() * 1.5}s`,
      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      transform: `rotate(${Math.random() * 360}deg)`,
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '0',
    }));
    setConfettiPieces(pieces);
    setShowDeliveredPopup(true);
    setTimeout(() => {
      setShowDeliveredPopup(false);
      setConfettiPieces([]);
    }, 4000);
  };

  // ── Swipe "Ready for Next Order" ─────────────────────────────────────────
  const getSwipeX = (e) => {
    if (e.touches) return e.touches[0].clientX;
    return e.clientX;
  };

  const handleSwipeStart = (e) => {
    if (isSwiped) return;
    isDragging.current = true;
  };

  const handleSwipeMove = (e) => {
    if (!isDragging.current || isSwiped || !swipeRef.current) return;
    const rect = swipeRef.current.getBoundingClientRect();
    const x = getSwipeX(e) - rect.left;
    const progress = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSwipeProgress(progress);
  };

  const handleSwipeEnd = () => {
    isDragging.current = false;
    if (swipeProgress >= 85) {
      setSwipeProgress(100);
      setIsSwiped(true);
      setTimeout(() => {
        setCurrentOrder(null);
        setOrderStep('WAITING');
        setIsSwiped(false);
        setSwipeProgress(0);
      }, 800);
    } else {
      setSwipeProgress(0);
    }
  };

  // ── Bank details ─────────────────────────────────────────────────────────
  const handleSaveBank = (e) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      alert('Please fill in all bank details');
      return;
    }
    if (user) localStorage.setItem(`bank_${user.username}`, JSON.stringify({ bankName, accountNumber, ifscCode }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // ── Step pill label ───────────────────────────────────────────────────────
  const stepLabel = {
    WAITING: 'Waiting',
    ASSIGNED: 'New Order',
    PICKED_UP: 'On The Way',
    ARRIVED: 'Arrived',
    DELIVERED: 'Completed',
  }[orderStep] || orderStep;

  const stepColor = {
    WAITING: 'bg-slate-700 text-slate-300',
    ASSIGNED: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    PICKED_UP: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    ARRIVED: 'bg-green-500/20 text-green-400 border border-green-500/30',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  }[orderStep] || '';

  return (
    <div className="min-h-screen bg-[#0B0F19] pb-16 font-sans text-white">

      {/* ── Delivered Success Popup ─────────────────────────────────────── */}
      {showDeliveredPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((s, i) => <ConfettiPiece key={i} style={s} />)}
          </div>
          <div className="relative bg-[#131A2A] border border-[#1E293B] rounded-3xl p-10 max-w-sm mx-4 text-center space-y-4 animate-zoom-in shadow-2xl shadow-black/80">
            <div className="flex justify-center">
              <AnimatedCheck />
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">Items delivered successfully,<br/>return to the store.</h2>
            <p className="text-sm text-slate-400">₹20.00 has been credited to your wallet!</p>
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold">
              <Zap className="w-4 h-4" /> Wallet Balance: ₹{walletBalance.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* ── New Order Flash Notification ────────────────────────────────── */}
      {newOrderFlash && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-[#fc8019] text-white font-black px-6 py-3 rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center gap-3">
            <Bell className="w-5 h-5 animate-bounce" />
            New Order Assigned to You!
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#131A2A]/95 backdrop-blur-xl border-b border-[#1E293B] px-6 py-4 shadow-2xl shadow-black/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fc8019] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tighter text-[#fc8019]">swiggy</span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block -mt-1">Express Partner</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {online && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#fc8019]" />
                {selectedStore}
              </div>
            )}

            {/* Online / Offline toggle */}
            <button
              onClick={online ? handleGoOffline : handleGoOnline}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                online
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {online ? (
                <><span className="w-2 h-2 bg-white rounded-full animate-ping" />Online</>
              ) : (
                <><span className="w-2 h-2 bg-slate-400 rounded-full" />Offline</>
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#fc8019]/20 rounded-full flex items-center justify-center">
                <span className="text-[#fc8019] text-xs font-black">{(user?.fullName || user?.username || 'P')[0].toUpperCase()}</span>
              </div>
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">{user?.fullName || user?.username || 'Partner'}</span>
              <button
                onClick={() => { removeToken(); window.location.reload(); }}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Active Workflow */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── OFFLINE STATE ─────────────────────────────────────────── */}
          {!online && (
            <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-12 text-center space-y-6 animate-zoom-in">
              <div className="w-20 h-20 bg-[#0B0F19] border border-[#1E293B] rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-10 h-10 text-slate-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">You are Offline</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Select your nearest Swiggy hub and tap Online to start receiving orders.</p>
              </div>
              <div className="max-w-xs mx-auto">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-left">Select Hub Location</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#334155] text-sm font-bold text-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                >
                  {STORES.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={handleGoOnline}
                className="mx-auto flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-green-500/30 transition-all text-sm uppercase tracking-wider"
              >
                <Zap className="w-4 h-4" /> Go Online
              </button>
            </div>
          )}

          {/* ── ONLINE → WAITING FOR ORDER ───────────────────────────── */}
          {online && orderStep === 'WAITING' && (
            <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-12 text-center space-y-6 animate-zoom-in">
              {/* Animated radar rings */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-green-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">Searching for Orders...</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">You're active. Orders placed by customers near <span className="text-[#fc8019] font-bold">{selectedStore}</span> will be assigned to you.</p>
              </div>
              {/* Waiting status box */}
              <div className="inline-flex items-center gap-3 bg-[#0B0F19] border border-[#1E293B] rounded-2xl px-6 py-4">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-slate-300">Waiting for your order...</span>
              </div>
            </div>
          )}

          {/* ── ASSIGNED: New Order received ─────────────────────────── */}
          {online && orderStep === 'ASSIGNED' && currentOrder && (
            <div className="space-y-5 animate-slide-up">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-[#fc8019] animate-bounce" />
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">New Order Assigned!</span>
                  </div>
                  <h3 className="text-lg font-black text-white">Job #{currentOrder.id}</h3>
                  <p className="text-sm text-slate-400">Deliver to: <span className="text-white font-bold">{currentOrder.customerName}</span></p>
                </div>
                <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${stepColor}`}>{stepLabel}</span>
              </div>

              {/* Order Items Card */}
              <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-[#fc8019]" />
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Items to Pick Up</h4>
                </div>
                <div className="bg-[#0B0F19] border border-[#334155] rounded-2xl p-4">
                  <p className="text-sm font-bold text-white leading-relaxed">{currentOrder.item}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#334155]/60">
                    <span className="text-xs text-slate-500">Order Total</span>
                    <span className="font-black text-white">₹{currentOrder.amount}</span>
                  </div>
                </div>

                {currentOrder.address && (
                  <div className="bg-[#0B0F19] border border-[#334155] rounded-2xl p-4 flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#fc8019] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Delivery Address</p>
                      <p className="text-sm font-bold text-white">{currentOrder.address}</p>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-xs text-yellow-300 font-semibold">
                  ⚠️ Proceed to <strong>{selectedStore}</strong>, verify & pack the items, then click <strong>"Picked Up Items"</strong>.
                </div>

                <button
                  onClick={handlePickUp}
                  className="w-full py-4 bg-[#fc8019] hover:bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-500/25 transition-all duration-300 text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95"
                >
                  <Package className="w-5 h-5" /> Picked Up Items
                </button>
              </div>
            </div>
          )}

          {/* ── PICKED_UP: Map view + Mark as Arrived ─────────────────── */}
          {online && orderStep === 'PICKED_UP' && currentOrder && (
            <div className="space-y-5 animate-slide-up">
              {/* Status bar */}
              <div className="bg-gradient-to-r from-blue-500/20 to-transparent border border-blue-500/30 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">On The Way</span>
                  </div>
                  <h3 className="text-lg font-black text-white">Navigating to Customer</h3>
                  <p className="text-sm text-slate-400">Deliver to: <span className="text-white font-bold">{currentOrder.customerName}</span></p>
                </div>
                <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${stepColor}`}>{stepLabel}</span>
              </div>

              {/* Live Map */}
              <div className="rounded-3xl overflow-hidden border border-[#1E293B] animate-fade-in">
                <DeliveryMap
                  orderStatus="OUT_FOR_DELIVERY"
                  isPartnerView={true}
                  onArrived={handleArrived}
                />
              </div>

              {/* Customer location info */}
              {currentOrder.address && (
                <div className="bg-[#131A2A] border border-[#1E293B] rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                  <MapPin className="w-4 h-4 text-[#fc8019] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Customer Location</p>
                    <p className="text-sm font-bold text-white">{currentOrder.address}</p>
                  </div>
                </div>
              )}

              {/* Mark as Arrived */}
              <div className="bg-[#131A2A] border border-blue-500/30 rounded-3xl p-5 space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 text-xs text-blue-300 font-semibold animate-pulse">
                  🚴 You're on your way! Click below once you reach the customer's location.
                </div>
                <button
                  onClick={handleArrived}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 transition-all duration-300 text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95"
                >
                  <MapPin className="w-5 h-5" /> Mark as Arrived
                </button>
              </div>
            </div>
          )}

          {/* ── ARRIVED: Show map + Delivered button ─────────────────── */}
          {online && orderStep === 'ARRIVED' && currentOrder && (
            <div className="space-y-5 animate-slide-up">
              {/* Status bar */}
              <div className="bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Arrived at Location</span>
                  </div>
                  <h3 className="text-lg font-black text-white">Ready for Handover</h3>
                  <p className="text-sm text-slate-400">Hand over to: <span className="text-white font-bold">{currentOrder.customerName}</span></p>
                </div>
                <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${stepColor}`}>{stepLabel}</span>
              </div>

              {/* Map still showing */}
              <div className="rounded-3xl overflow-hidden border border-green-500/20 animate-fade-in">
                <DeliveryMap
                  orderStatus="ARRIVED"
                  isPartnerView={true}
                  onArrived={handleArrived}
                />
              </div>

              {/* Delivered button */}
              <div className="bg-[#131A2A] border border-green-500/30 rounded-3xl p-5 space-y-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 text-xs text-green-300 font-semibold">
                  🎉 You've arrived! Hand over the order to <strong>{currentOrder.customerName}</strong> and confirm delivery.
                </div>
                <button
                  onClick={handleDelivered}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-500/25 transition-all duration-300 text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" /> Delivered — Confirm Handover
                </button>
              </div>
            </div>
          )}

          {/* ── DELIVERED: Success + Ready for Next ──────────────────── */}
          {online && orderStep === 'DELIVERED' && (
            <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-8 space-y-7 text-center animate-zoom-in relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />

              <div className="relative flex flex-col items-center gap-4">
                <div className="flex justify-center">
                  <AnimatedCheck />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Items delivered successfully,<br/>return to the store.</h3>
                  <p className="text-sm text-slate-400 mt-2">₹20.00 credited to your wallet • Total: <span className="text-green-400 font-bold">₹{walletBalance.toFixed(2)}</span></p>
                </div>

                {/* Earnings badge */}
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-2.5 rounded-full text-sm font-black animate-pulse-slow">
                  <Star className="w-4 h-4" /> +₹20.00 Earned This Delivery
                </div>
              </div>

              {/* Swipe to accept next order */}
              <div className="relative max-w-sm mx-auto">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Swipe to accept next order</label>
                <div
                  ref={swipeRef}
                  className="swipe-button-container bg-[#0B0F19] border border-[#334155] rounded-2xl h-14 relative flex items-center justify-center cursor-ew-resize select-none overflow-hidden"
                  onMouseDown={handleSwipeStart}
                  onMouseMove={handleSwipeMove}
                  onMouseUp={handleSwipeEnd}
                  onMouseLeave={handleSwipeEnd}
                  onTouchStart={handleSwipeStart}
                  onTouchMove={handleSwipeMove}
                  onTouchEnd={handleSwipeEnd}
                >
                  {/* Progress fill */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#fc8019]/80 transition-none rounded-l-2xl"
                    style={{ width: `${swipeProgress}%` }}
                  />
                  {/* Drag handle */}
                  <div
                    className="absolute flex items-center justify-center w-11 h-10 bg-[#fc8019] rounded-xl shadow-lg shadow-orange-500/30 font-black text-white text-sm transition-none pointer-events-none"
                    style={{ left: `calc(${Math.min(swipeProgress, 90)}% - 4px)` }}
                  >
                    {isSwiped ? '✓' : '>>'}
                  </div>
                  <span className="relative z-10 text-xs font-black tracking-widest text-white uppercase mix-blend-difference pointer-events-none">
                    {isSwiped ? 'Finding next order...' : 'Ready for Next Order'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Wallet + Bank ───────────────────────────────────── */}
        <div className="space-y-6">

          {/* Wallet Card */}
          <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-6 space-y-4 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-500/15 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#fc8019]" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Express Payout Wallet</h4>
                <span className="text-3xl font-black text-white font-mono tracking-tighter">₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-[#1E293B] pt-3 flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
              <span className="text-green-500">●</span> Earnings: ₹20.00 per completed delivery
            </div>

            {/* Delivery Logs */}
            {completedDeliveries.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery Log</span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {completedDeliveries.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                      <div className="truncate max-w-[140px]">
                        <span className="text-[10px] font-black text-slate-600 uppercase mr-1">#{d.id}</span>
                        <span className="font-bold text-slate-300">{d.item}</span>
                      </div>
                      <span className="font-black text-green-500 font-mono flex-shrink-0">+₹20</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Landmark className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Direct Deposit Bank</h4>
                <p className="text-sm font-bold text-white">Link payout routing account</p>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-zoom-in">
                <CheckCircle2 className="w-4 h-4" /> Bank details saved!
              </div>
            )}

            <form onSubmit={handleSaveBank} className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-3 py-2.5 bg-[#0B0F19] border border-[#334155] rounded-xl text-sm text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Account Number</label>
                <input
                  type="password"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  className="w-full px-3 py-2.5 bg-[#0B0F19] border border-[#334155] rounded-xl text-sm text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">IFSC Code</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  autoCapitalize="characters"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="w-full px-3 py-2.5 bg-[#0B0F19] border border-[#334155] rounded-xl text-sm text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                />
              </div>

              {/* Weekly payout notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-[11px] text-blue-300 font-semibold leading-relaxed">
                  📅 <strong>Every Monday</strong> the amount will be credited to your account.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#fc8019] hover:bg-orange-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wider hover:scale-[1.02] active:scale-95"
              >
                Save Bank Details <Save className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] text-yellow-300 font-semibold leading-relaxed">
              ℹ️ <strong>Weekly Settlement:</strong> Earnings are credited to your verified bank account every <strong>Monday</strong>.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
