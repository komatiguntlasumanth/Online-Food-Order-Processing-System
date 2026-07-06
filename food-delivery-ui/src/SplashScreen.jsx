import React, { useEffect, useState } from 'react';

/**
 * SplashScreen – 3.5-second premium Swiggy Express logo intro animation.
 * Calls onComplete() once the animation finishes.
 */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'hold' | 'exit'

  useEffect(() => {
    // Phase timeline:
    //  0 ms  – logo enters (scale + fade)
    //  1200 ms – hold, tagline fades in
    //  3000 ms – begin exit (fade-out + scale-up)
    //  3500 ms – call onComplete
    const t1 = setTimeout(() => setPhase('hold'), 1200);
    const t2 = setTimeout(() => setPhase('exit'), 3000);
    const t3 = setTimeout(() => onComplete?.(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdfbf7 0%, #fff7ed 30%, #ffedd5 60%, #fef3e2 100%)',
        overflow: 'hidden',
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.4s ease-in' : 'none',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* ── Ambient glow orbs ── */}
      <div style={{
        position: 'absolute',
        width: 520,
        height: 520,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,128,25,0.15) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'splash-pulse 2s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,128,25,0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      {/* ── Logo card ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          transform: phase === 'enter'
            ? 'scale(0.72) translateY(20px)'
            : phase === 'hold'
            ? 'scale(1) translateY(0)'
            : 'scale(1.06) translateY(-8px)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: phase === 'enter'
            ? 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease-out'
            : 'transform 0.4s ease-in, opacity 0.4s ease-in',
        }}
      >
        {/* Food cloche icon */}
        <div style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: 'linear-gradient(160deg, #ff9340 0%, #fc8019 55%, #e06510 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 60px 18px rgba(252,128,25,0.25), 0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
        }}>
          {/* Steam animations */}
          <div className="steam" style={{ position: 'absolute', top: -10, left: '35%', width: 6, height: 20, background: 'rgba(252,128,25,0.4)', borderRadius: 10, filter: 'blur(4px)' }} />
          <div className="steam" style={{ position: 'absolute', top: -15, left: '50%', width: 8, height: 24, background: 'rgba(252,128,25,0.5)', borderRadius: 10, filter: 'blur(4px)', animationDelay: '0.4s' }} />
          <div className="steam" style={{ position: 'absolute', top: -8, left: '65%', width: 6, height: 16, background: 'rgba(252,128,25,0.35)', borderRadius: 10, filter: 'blur(4px)', animationDelay: '0.8s' }} />
          
          {/* Food Cloche SVG */}
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 44, height: 44, transform: 'translateY(2px)' }}>
            <path d="M12 3V2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 14a10 10 0 0 0-20 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 14h20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 17H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Brand name */}
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <div style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#fc8019',
            fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
            textShadow: '0 0 40px rgba(252,128,25,0.30)',
          }}>
            swiggy
          </div>
          {/* EXPRESS label */}
          <div style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.45em',
            color: '#78716c',
            textTransform: 'uppercase',
            marginTop: 2,
            opacity: phase === 'hold' ? 1 : 0,
            transform: phase === 'hold' ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.4s 0.1s ease-out, transform 0.4s 0.1s ease-out',
          }}>
            EXPRESS
          </div>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#a8a29e',
          letterSpacing: '0.04em',
          marginTop: 2,
          opacity: phase === 'hold' ? 1 : 0,
          transform: phase === 'hold' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.45s 0.2s ease-out, transform 0.45s 0.2s ease-out',
        }}>
          Delivering happiness, faster.
        </p>
      </div>

      {/* ── Animated bottom loading bar ── */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        width: 160,
        height: 3,
        borderRadius: 99,
        background: 'rgba(252,128,25,0.12)',
        overflow: 'hidden',
        opacity: phase === 'hold' ? 1 : 0,
        transition: 'opacity 0.3s 0.15s ease-out',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #fc8019, #ff9340)',
          borderRadius: 99,
          animation: 'splash-bar 1.8s cubic-bezier(0.4,0,0.2,1) forwards',
          boxShadow: '0 0 10px 2px rgba(252,128,25,0.35)',
        }} />
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          50%       { transform: translate(-50%, -50%) scale(1.12); opacity: 0.7; }
        }
        @keyframes splash-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes steam-rise {
          0% { transform: translateY(0) scaleX(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-20px) scaleX(1.5); opacity: 0; }
        }
        .steam {
          animation: steam-rise 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

