import React from 'react';

export default function LockScreen({ onUnlock }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#ff7e5f] to-[#feb47b] backdrop-blur-sm">
      <div className="bg-white/30 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-white/20">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4 animate-pulse-slow">
          Swiggy Express
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Premium lock screen – unlock to explore the live order tracker.
        </p>
        <button
          onClick={onUnlock}
          className="w-full py-3 bg-[#fc8019] hover:bg-[#e07015] text-white font-semibold rounded-xl transition-colors shadow-md"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
