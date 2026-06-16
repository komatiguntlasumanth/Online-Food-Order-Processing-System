import React, { useState, useEffect } from 'react';
import { Truck, Wallet, LogOut, CheckCircle2, ChevronRight, ToggleLeft, ToggleRight, Landmark, Save, RefreshCw } from 'lucide-react';
import { removeToken, getUser } from '../api/auth';
import DeliveryMap from './DeliveryMap';

export default function DeliveryPartnerDashboard() {
  const user = getUser();
  const [online, setOnline] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderStep, setOrderStep] = useState('ASSIGNED'); // 'ASSIGNED', 'PICKED_UP', 'ARRIVED', 'DELIVERED'
  const [walletBalance, setWalletBalance] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  
  // Bank details form state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Swipe slider state
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);

  // Store options
  const STORES = [
    "Swiggy Express Hub - Madhapur",
    "Swiggy Express Hub - Kondapur",
    "Swiggy Express Hub - Hitec City",
    "Swiggy Express Hub - Gachibowli"
  ];

  // Load state from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedBalance = localStorage.getItem(`wallet_${user.username}`) || '0';
      setWalletBalance(parseInt(savedBalance, 10));

      const savedDeliveries = localStorage.getItem(`deliveries_${user.username}`);
      if (savedDeliveries) setCompletedDeliveries(JSON.parse(savedDeliveries));

      const savedBank = localStorage.getItem(`bank_${user.username}`);
      if (savedBank) {
        const parsed = JSON.parse(savedBank);
        setBankName(parsed.bankName || '');
        setAccountNumber(parsed.accountNumber || '');
        setIfscCode(parsed.ifscCode || '');
      }

      const storedStore = localStorage.getItem(`store_${user.username}`) || STORES[0];
      setSelectedStore(storedStore);
    }
  }, []);

  // Poll localStorage for new active orders
  useEffect(() => {
    if (!online) {
      setCurrentOrder(null);
      return;
    }

    const checkOrders = () => {
      // Find orders that are ready to be picked up
      const ordersRaw = localStorage.getItem('swiggy_orders');
      if (ordersRaw) {
        const orders = JSON.parse(ordersRaw);
        // Find any order placed in the system that has status PLACED, PAYMENT_SUCCESS, or KITCHEN PREPARATION
        // and is not yet assigned to any driver
        const unassignedOrder = orders.find(
          (o) => (o.status === 'PAYMENT_SUCCESS' || o.status === 'KITCHEN PREPARATION' || o.status === 'PLACED') && !o.driverName
        );

        if (unassignedOrder && !currentOrder) {
          // Assign this order to this delivery partner
          unassignedOrder.driverName = user ? user.fullName : "Ramesh Kumar";
          unassignedOrder.driverMobile = user ? user.mobile : "9876543210";
          unassignedOrder.status = 'KITCHEN PREPARATION'; // Let kitchen know driver is assigned
          unassignedOrder.assignedAt = new Date().toISOString();

          // Save updated orders
          localStorage.setItem('swiggy_orders', JSON.stringify(orders));

          // Set current order locally
          setCurrentOrder(unassignedOrder);
          setOrderStep('ASSIGNED');
          setIsSwiped(false);
          setSwipeProgress(0);

          // Alert notification sound or vibration simulation
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      }
    };

    const interval = setInterval(checkOrders, 2000);
    return () => clearInterval(interval);
  }, [online, currentOrder]);

  // Sync state updates of currentOrder to localStorage
  const updateOrderStatus = (newStatus) => {
    if (!currentOrder) return;
    const ordersRaw = localStorage.getItem('swiggy_orders');
    if (ordersRaw) {
      const orders = JSON.parse(ordersRaw);
      const updated = orders.map((o) => {
        if (o.id === currentOrder.id) {
          o.status = newStatus;
          return o;
        }
        return o;
      });
      localStorage.setItem('swiggy_orders', JSON.stringify(updated));
      setCurrentOrder({ ...currentOrder, status: newStatus });
    }
  };

  const handleGoOnlineOffline = () => {
    if (!online && !selectedStore) {
      alert("Please select a nearby store first!");
      return;
    }
    setOnline(!online);
    if (user) {
      localStorage.setItem(`store_${user.username}`, selectedStore);
    }
  };

  const handlePickUp = () => {
    setOrderStep('PICKED_UP');
    updateOrderStatus('OUT_FOR_DELIVERY');
  };

  const handleArrived = () => {
    setOrderStep('ARRIVED');
  };

  const handleDelivered = () => {
    setOrderStep('DELIVERED');
    updateOrderStatus('DELIVERED');

    // Add ₹20 to wallet
    const newBalance = walletBalance + 20;
    setWalletBalance(newBalance);
    if (user) {
      localStorage.setItem(`wallet_${user.username}`, newBalance.toString());

      // Save to completed deliveries logs
      const newLogs = [
        {
          id: currentOrder.id,
          item: currentOrder.item,
          amount: currentOrder.amount,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          earnings: 20
        },
        ...completedDeliveries
      ];
      setCompletedDeliveries(newLogs);
      localStorage.setItem(`deliveries_${user.username}`, JSON.stringify(newLogs));
    }
  };

  // Simulated swipe logic for next order resetting
  const handleSwipeMouseMove = (e) => {
    if (isSwiped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const progress = Math.min(Math.max((x / width) * 100, 0), 100);
    setSwipeProgress(progress);
  };

  const handleSwipeMouseLeave = () => {
    if (swipeProgress < 85) {
      setSwipeProgress(0);
    }
  };

  const handleSwipeMouseUp = () => {
    if (swipeProgress >= 85) {
      setSwipeProgress(100);
      setIsSwiped(true);
      setTimeout(() => {
        // Reset state for next order
        setCurrentOrder(null);
        setOrderStep('ASSIGNED');
        setIsSwiped(false);
        setSwipeProgress(0);
      }, 800);
    } else {
      setSwipeProgress(0);
    }
  };

  // Touch handlers for mobile devices
  const handleTouchMove = (e) => {
    if (isSwiped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const progress = Math.min(Math.max((x / width) * 100, 0), 100);
    setSwipeProgress(progress);
  };

  const handleTouchEnd = () => {
    if (swipeProgress >= 85) {
      setSwipeProgress(100);
      setIsSwiped(true);
      setTimeout(() => {
        setCurrentOrder(null);
        setOrderStep('ASSIGNED');
        setIsSwiped(false);
        setSwipeProgress(0);
      }, 800);
    } else {
      setSwipeProgress(0);
    }
  };

  const handleSaveBankDetails = (e) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      alert("Please fill in all bank details");
      return;
    }
    const bankDetails = { bankName, accountNumber, ifscCode };
    if (user) {
      localStorage.setItem(`bank_${user.username}`, JSON.stringify(bankDetails));
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] pb-12 font-sans text-white">
      
      {/* Dashboard Top bar */}
      <header className="sticky top-0 z-40 bg-[#131A2A] border-b border-[#334155] px-6 py-4 shadow-black/50 shadow-black/70 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fc8019] rounded-xl flex items-center justify-center text-white shadow-black/60 shadow-black/80 shadow-2xl shadow-orange-500/25">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tighter text-[#fc8019]">swiggy</span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block -mt-1">Express partner</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Store selector when offline */}
            {!online ? (
              <div className="hidden md:block">
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="bg-[#0B0F19] border border-[#334155] text-xs font-bold text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                >
                  {STORES.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-extrabold text-slate-500">
                <span>Working near:</span>
                <span className="text-white">{selectedStore}</span>
              </div>
            )}

            {/* Online / Offline switch */}
            <button
              onClick={handleGoOnlineOffline}
              disabled={!!currentOrder}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black tracking-wider transition-all uppercase ${
                online
                  ? 'bg-green-500 text-white shadow-black/60 shadow-black/80 shadow-2xl shadow-green-500/20'
                  : 'bg-slate-200 text-slate-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {online ? (
                <>
                  <span className="w-2.5 h-2.5 bg-[#131A2A] rounded-full animate-ping mr-1" />
                  Online
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full mr-1" />
                  Offline
                </>
              )}
            </button>

            {/* User Logged In Info */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 hidden sm:inline">{user?.fullName || 'Partner'}</span>
              <button
                onClick={() => removeToken() || window.location.reload()}
                className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 transition-all"
                title="Logout Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid content */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column (Active workflow panels) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Job View or Waiting Area */}
          {!online ? (
            <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-12 text-center shadow-black/50 shadow-black/70 shadow-2xl space-y-5 animate-zoom-in">
              <div className="w-20 h-20 bg-[#0B0F19] border border-[#1E293B] rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Truck className="w-10 h-10" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-extrabold text-lg text-white">You are currently Offline</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Select your nearby Swiggy store location below and toggle "Online" at the top to start accepting food delivery orders.
                </p>
              </div>
              
              <div className="max-w-xs mx-auto">
                <label className="block text-[10px] text-left font-black text-slate-500 uppercase tracking-widest mb-1.5">Select store location</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#334155] text-sm font-extrabold text-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                >
                  {STORES.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : !currentOrder ? (
            /* Online but waiting for order */
            <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-12 text-center shadow-black/50 shadow-black/70 shadow-2xl space-y-5 animate-zoom-in">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-[#fc8019] animate-bounce">
                <RefreshCw className="w-9 h-9 animate-spin-slow" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-extrabold text-lg text-white">Searching for Orders...</h3>
                <p className="text-sm text-slate-500 mt-1">
                  You are active in the system. Orders placed by customers near your selected location will be automatically assigned to you.
                </p>
              </div>

              {/* Waiting status box */}
              <div className="max-w-xs mx-auto bg-[#0B0F19] border border-[#1E293B] rounded-2xl p-4 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-slate-300">Waiting for your order...</span>
              </div>
            </div>
          ) : (
            /* Active Job Lifecycle Flow */
            <div className="space-y-6">
              
              {/* Status Header Indicator */}
              <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-6 shadow-black/50 shadow-black/70 shadow-2xl flex flex-wrap justify-between items-center gap-4 animate-slide-up">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Job ID: #{currentOrder.id}</span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Delivery to: {currentOrder.customerName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Task Status:</span>
                  <span className="text-xs px-3 py-1 font-black bg-orange-50 text-[#fc8019] border border-orange-100 rounded-full uppercase tracking-wider">
                    {orderStep === 'ASSIGNED' ? 'Prepare Pickup' : orderStep === 'PICKED_UP' ? 'On The Way' : orderStep === 'ARRIVED' ? 'Arrived' : 'Completed'}
                  </span>
                </div>
              </div>

              {/* Navigation map view */}
              {orderStep !== 'ASSIGNED' && orderStep !== 'DELIVERED' && (
                <div className="animate-fade-in">
                  <DeliveryMap
                    orderStatus={orderStep === 'PICKED_UP' ? 'OUT_FOR_DELIVERY' : 'ARRIVED'}
                    isPartnerView={true}
                    onArrived={handleArrived}
                  />
                </div>
              )}

              {/* Job Details Card */}
              <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-6 shadow-black/50 shadow-black/70 shadow-2xl space-y-6 animate-slide-up">
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Order Items Package</h4>
                  <div className="space-y-2">
                    <div className="p-4 bg-[#0B0F19] rounded-2xl border border-[#1E293B]">
                      <p className="text-sm font-extrabold text-white leading-relaxed">{currentOrder.item}</p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#334155]/60 text-xs">
                        <span className="text-slate-500">COD / Online Payment:</span>
                        <span className="font-black text-white text-sm">₹{currentOrder.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Interactive Action Buttons */}
                <div className="pt-2">
                  {orderStep === 'ASSIGNED' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-2xl text-xs font-bold">
                        ⚠️ Please proceed to the store: <strong>{selectedStore}</strong>, inspect items, and click "Confirm Pick Up" to start driving.
                      </div>
                      <button
                        onClick={handlePickUp}
                        className="w-full py-4 bg-[#fc8019] hover:bg-orange-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-black/70 shadow-2xl shadow-orange-500/25 transition-all text-sm uppercase tracking-wider"
                      >
                        Confirm Pick Up Items
                      </button>
                    </div>
                  )}

                  {orderStep === 'PICKED_UP' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl text-xs font-bold animate-pulse">
                        🚴 Travelling to customer delivery location. Use the telemetry map above to track real-time position.
                      </div>
                      <button
                        onClick={handleArrived}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-black/70 shadow-2xl shadow-blue-500/25 transition-all text-sm uppercase tracking-wider"
                      >
                        Mark as Arrived
                      </button>
                    </div>
                  )}

                  {orderStep === 'ARRIVED' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 border border-green-100 text-green-800 rounded-2xl text-xs font-bold">
                        🎉 You have arrived! Please hand over the food to <strong>{currentOrder.customerName}</strong> and request confirmation.
                      </div>
                      <button
                        onClick={handleDelivered}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-black/70 shadow-2xl shadow-green-500/25 transition-all text-sm uppercase tracking-wider"
                      >
                        Handover & Mark Delivered
                      </button>
                    </div>
                  )}

                  {orderStep === 'DELIVERED' && (
                    <div className="space-y-5 text-center p-6 border-2 border-dashed border-green-200 rounded-3xl bg-green-50/50 animate-zoom-in">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto text-3xl shadow-black/70 shadow-2xl shadow-green-500/25">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-extrabold text-lg text-white">Order Delivered Successfully!</h4>
                        <p className="text-xs text-slate-500 mt-1">₹20.00 has been credited to your express partner wallet balance.</p>
                      </div>

                      {/* Swipe reset button */}
                      <div className="max-w-sm mx-auto">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Swipe to find next order</label>
                        <div
                          onMouseMove={handleSwipeMouseMove}
                          onMouseLeave={handleSwipeMouseLeave}
                          onMouseUp={handleSwipeMouseUp}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          className="swipe-button-container bg-slate-900 border border-slate-800 rounded-2xl h-14 relative flex items-center justify-center cursor-ew-resize overflow-hidden"
                        >
                          {/* Progress bar background fill */}
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#fc8019] transition-all duration-75"
                            style={{ width: `${swipeProgress}%` }}
                          />
                          
                          {/* Inner slider drag circle */}
                          <div
                            className="absolute bg-[#131A2A] rounded-xl shadow-black/70 shadow-2xl w-12 h-10 flex items-center justify-center font-extrabold text-white text-sm transition-all"
                            style={{ left: `calc(${swipeProgress}% - ${swipeProgress >= 80 ? '50px' : '0px'} + 4px)` }}
                          >
                            {isSwiped ? '✓' : '>>'}
                          </div>

                          <span className="relative z-10 text-xs font-black tracking-widest text-white uppercase mix-blend-difference pointer-events-none">
                            {isSwiped ? 'Connecting...' : 'Swipe Right to Reset'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column (Wallet & Bank account configuration details) */}
        <div className="space-y-6">
          
          {/* Earnings Wallet Card */}
          <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-6 shadow-black/50 shadow-black/70 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#fc8019]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Express Payout Wallet</h4>
                <span className="text-2xl font-black text-white font-mono">₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-semibold leading-relaxed border-t border-[#1E293B] pt-3 flex items-center gap-1">
              <span className="text-green-500 font-bold">●</span> Earnings rate: ₹20.00 standard credit per completed order.
            </div>

            {/* Delivery Logs list */}
            {completedDeliveries.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Delivery logs</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin">
                  {completedDeliveries.map((d, index) => (
                    <div key={index} className="flex justify-between items-center text-xs p-2 bg-[#0B0F19] border rounded-xl">
                      <div className="truncate pr-2 max-w-[140px]">
                        <span className="font-extrabold text-[10px] text-slate-500 uppercase mr-1">#{d.id}</span>
                        <span className="font-bold text-slate-200">{d.item}</span>
                      </div>
                      <span className="font-black text-green-600 font-mono flex-shrink-0">+₹20</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bank details settings config */}
          <div className="bg-[#131A2A] border border-[#1E293B] rounded-3xl p-6 shadow-black/50 shadow-black/70 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 flex items-center justify-center text-green-600 rounded-xl">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-slate-500">Direct Deposit Bank</h4>
                <p className="text-xs font-bold text-white">Link payout routing account</p>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-zoom-in">
                <CheckCircle2 className="w-4 h-4" /> Bank details verified and updated!
              </div>
            )}

            <form onSubmit={handleSaveBankDetails} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-3 py-2.5 bg-[#0B0F19] border border-[#334155] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Number</label>
                <input
                  type="password"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter account number"
                  className="w-full px-3 py-2.5 bg-[#0B0F19] border border-[#334155] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IFSC Code</label>
                <input
                  type="text"
                  required
                  autoCapitalize="characters"
                  maxLength="11"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="w-full px-3 py-2.5 bg-[#0B0F19] border border-[#334155] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#fc8019]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#fc8019] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-black/60 shadow-black/80 shadow-2xl transition-all uppercase tracking-wider mt-2"
              >
                Save Details <Save className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-[10px] text-yellow-800 leading-relaxed font-semibold">
              ℹ️ <strong>Weekly Settlement Rule:</strong> Earnings are computed and automatically credited to the delivery partner's verified bank account every <strong>Monday</strong>.
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
