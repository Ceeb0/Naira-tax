import React, { useEffect, useState } from 'react';

const MadLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050E24] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,39,85,0.4),rgba(5,14,36,1))] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          {/* Spinning Rings */}
          <div className="w-32 h-32 border-[1px] border-gold-400/20 rounded-full animate-spin-slow"></div>
          <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-gold-400 rounded-full animate-spin"></div>
          <div className="absolute top-4 left-4 w-24 h-24 border-b-2 border-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          
          {/* Inner Pulse */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="text-4xl font-bold text-white font-display tracking-tighter">
              {Math.min(progress, 99)}%
            </span>
          </div>
        </div>

        <h3 className="mt-12 text-sm font-display text-blue-200/70 tracking-[0.3em] uppercase animate-pulse">
          Calculating Tax Liablity
        </h3>
        
        {/* Floating background particles */}
        <div className="absolute -top-20 -right-20 animate-float delay-100 opacity-20">
          <div className="w-16 h-16 bg-gold-400 rounded-full blur-xl"></div>
        </div>
         <div className="absolute -bottom-20 -left-20 animate-float delay-300 opacity-20">
          <div className="w-20 h-20 bg-blue-600 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default MadLoader;