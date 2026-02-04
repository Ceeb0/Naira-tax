
import React, { useEffect, useState } from 'react';

interface MadLoaderProps {
  duration?: number;
}

const MadLoader: React.FC<MadLoaderProps> = ({ duration = 4500 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(timer);
      }
    }, 16); 

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050E24]/90 backdrop-blur-3xl overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-gold-400 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-10">
        <div className="relative mb-16 group">
          <div className="w-40 h-40 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl animate-liquid shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold-400/20 to-transparent animate-spin-slow"></div>
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-gold-400/20 animate-spin-slow"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-3xl font-display font-bold text-white drop-shadow-lg">{Math.floor(progress)}%</span>
                  <div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-ping mt-2"></div>
              </div>
          </div>
          <div className="absolute inset-[-20px] border border-white/5 rounded-full animate-spin-slow" style={{animationDuration: '15s'}}></div>
          <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-spin-slow" style={{animationDuration: '20s', animationDirection: 'reverse'}}></div>
        </div>

        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.5em] animate-pulse">Calculating Your Tax</h2>
            <div className="h-0.5 w-12 bg-gold-400/30 mx-auto rounded-full"></div>
          </div>
          
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-gold-400 to-yellow-500 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(242,201,76,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="absolute top-0 h-full w-20 bg-white/20 blur-xl transition-all duration-300"
              style={{ left: `calc(${progress}% - 40px)` }}
            ></div>
          </div>

          <div className="text-center px-4">
             <h3 className="text-xs font-display font-bold text-white/60 tracking-widest uppercase transition-all">
                {progress < 25 && "Checking tax rules..."}
                {progress >= 25 && progress < 50 && "Applying state rates..."}
                {progress >= 50 && progress < 75 && "Adding up your income..."}
                {progress >= 75 && progress < 98 && "Double-checking the math..."}
                {progress >= 98 && "Finishing up..."}
             </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MadLoader;
