import React, { useState, useEffect } from 'react';
import { sendOtp, verifyOtp } from '../api/auth';
import { ShoppingBag, Truck, Smartphone, Lock, ArrowRight, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function UnifiedLogin({ onLogin }) {
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Mobile/Name Entry, 3: OTP Verification
  const [role, setRole] = useState(null); // 'CUSTOMER' or 'DELIVERY'
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [otpVisible, setOtpVisible] = useState(''); // Holds generated OTP for visual simulation

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Listener to receive local events about simulated OTP codes
  useEffect(() => {
    const handleOtpSent = (e) => {
      const { mobile: targetMobile, otp, role: targetRole } = e.detail;
      setOtpVisible(otp);
      setOtpSentMessage(`[AI Notification] SMS sent to ${targetMobile}: Your one-time password code is ${otp}.`);
    };
    window.addEventListener('swiggy-otp-sent', handleOtpSent);
    return () => window.removeEventListener('swiggy-otp-sent', handleOtpSent);
  }, []);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    setStep(2);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobile.trim() || mobile.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(mobile.trim(), role);
      setTimer(30);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpInput.trim() || otpInput.trim().length !== 4) {
      setError('Please enter the 4-digit OTP code');
      return;
    }
    setLoading(true);
    try {
      const authenticatedUser = await verifyOtp(mobile.trim(), otpInput.trim(), role, fullName);
      onLogin(authenticatedUser);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendOtp(mobile.trim(), role);
      setTimer(30);
      setOtpInput('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)' }}>
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fc8019, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute -bottom-48 -right-48 w-[30rem] h-[30rem] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ff6b35, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #feb47b, transparent 70%)', animation: 'float 12s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-slide-up">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #fc8019, #ff6b35)' }}>
            <ShoppingBag className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            SWIGGY<span className="text-[#fc8019]">EXPRESS</span>
          </h1>
          <p className="text-slate-600 text-xs mt-0.5">Premium Login Portal</p>
        </div>

        {/* glassmorphic card container */}
        <div className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border transition-all duration-300"
          style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
          
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl flex items-center gap-3 text-xs animate-zoom-in"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-slate-900">Choose Your Portal</h2>
                <p className="text-slate-600 text-xs mt-1">Select how you would like to access Swiggy Express</p>
              </div>

              <div className="space-y-4">
                {/* Customer Card */}
                <button
                  onClick={() => handleSelectRole('CUSTOMER')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all duration-300 group hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#fc8019';
                    e.currentTarget.style.background = 'rgba(252, 128, 25, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#fc8019] group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Swiggy Express Customer</h3>
                      <p className="text-slate-600 text-[11px] mt-0.5">Order delicious meals from nearby stores</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-[#fc8019] transition-colors" />
                </button>

                {/* Delivery Partner Card */}
                <button
                  onClick={() => handleSelectRole('DELIVERY')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all duration-300 group hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#fc8019';
                    e.currentTarget.style.background = 'rgba(252, 128, 25, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Delivery Partner</h3>
                      <p className="text-slate-600 text-[11px] mt-0.5">Deliver food packages & earn steady payout</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-green-400 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MOBILE & REGISTER OPTION */}
          {step === 2 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-[#fc8019]">
                  {role === 'DELIVERY' ? 'Delivery Partner' : 'Customer Account'}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Enter Mobile Number</h2>
                <p className="text-slate-600 text-xs">We will send an OTP verification code via SMS</p>
              </div>

              <div className="space-y-4">
                {/* optional full name for registering new accounts */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name to register"
                    className="w-full px-4 py-3 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none transition-all text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Mobile Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-semibold">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-14 pr-4 py-3 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none transition-all text-sm font-semibold tracking-wider"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #fc8019, #ff6b35)' }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <>Send OTP Code <Smartphone className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="p-1 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-600">+91 {mobile}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-500/10 text-[#fc8019] border border-orange-500/20">
                  Verifying OTP
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Enter OTP Code</h2>
                <p className="text-slate-600 text-xs">Verify the 4-digit code sent by Swiggy AI</p>
              </div>

              {/* simulated notification alert */}
              {otpSentMessage && (
                <div className="p-3 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 rounded-xl text-[11px] font-medium animate-zoom-in leading-relaxed">
                  <span className="font-extrabold uppercase block text-orange-600 mb-0.5">🔔 Swiggy AI OTP Delivery</span>
                  {otpSentMessage}
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  autoFocus
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 4-Digit OTP"
                  className="w-full text-center py-4 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none transition-all text-xl font-bold tracking-[0.6em]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={(e) => e.target.style.borderColor = '#fc8019'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Did not receive?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timer > 0 || loading}
                    className={`font-bold transition-all ${timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-[#fc8019] hover:underline'}`}
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #fc8019, #ff6b35)' }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                ) : (
                  <>Verify & Proceed <Check className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-600 mt-6">
          © 2026 SwiggyExpress — Microservice OTP Food Delivery System
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.03); }
        }
      `}</style>
    </div>
  );
}
