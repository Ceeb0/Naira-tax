import React, { useEffect, useRef } from 'react';

const ParallaxBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const y = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

      // Update CSS variables for performant animation via transform
      containerRef.current.style.setProperty('--x', x.toString());
      containerRef.current.style.setProperty('--y', y.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        // Default values to prevent calc errors before JS loads
        '--x': '0', 
        '--y': '0' 
      } as React.CSSProperties}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'translate(calc(var(--x) * -15px), calc(var(--y) * -15px))',
          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      ></div>

      {/* Orb 1: Royal Blue (Top Left) */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 dark:opacity-20 dark:mix-blend-screen bg-blue-600 dark:bg-royal-700"
        style={{
          transform: 'translate(calc(var(--x) * 30px), calc(var(--y) * 30px))',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      ></div>

      {/* Orb 2: Gold (Bottom Right) */}
      <div 
        className="absolute -bottom-[10%] -right-[10%] w-[45vw] h-[45vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 dark:opacity-10 dark:mix-blend-screen bg-gold-400 dark:bg-gold-500"
        style={{
          transform: 'translate(calc(var(--x) * -40px), calc(var(--y) * -40px))',
          transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      ></div>

      {/* Orb 3: Accent (Center/Random) */}
      <div 
        className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full mix-blend-overlay filter blur-[60px] opacity-10 dark:opacity-10 bg-purple-500"
        style={{
          transform: 'translate(calc(var(--x) * -20px), calc(var(--y) * 20px))',
          transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      ></div>
    </div>
  );
};

export default ParallaxBackground;