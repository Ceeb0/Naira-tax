import React from 'react';

const MadLoader: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-royal-900/90 backdrop-blur-md">
      <div className="relative">
        {/* Spinning Rings */}
        <div className="w-24 h-24 border-4 border-gold-400/30 rounded-full animate-spin-slow"></div>
        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-gold-400 rounded-full animate-spin"></div>
        
        {/* Inner Pulse */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-3xl font-bold text-white font-display animate-pulse">₦</span>
        </div>

        {/* Floating Numbers */}
        <div className="absolute -top-8 -right-8 animate-float" style={{ animationDelay: '0s' }}>
          <span className="text-xs text-gold-400 font-mono opacity-60">11%</span>
        </div>
        <div className="absolute -bottom-6 -left-8 animate-float" style={{ animationDelay: '1s' }}>
           <span className="text-xs text-blue-300 font-mono opacity-60">19%</span>
        </div>
        <div className="absolute top-1/2 -right-12 animate-float" style={{ animationDelay: '0.5s' }}>
           <span className="text-xs text-green-400 font-mono opacity-60">+24%</span>
        </div>
      </div>
      <h3 className="mt-8 text-xl font-display text-white tracking-widest uppercase animate-pulse">Crunching Numbers...</h3>
    </div>
  );
};

export default MadLoader;
