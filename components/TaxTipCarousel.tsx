
import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Zap, Briefcase, TrendingDown } from 'lucide-react';

interface TaxTip {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TAX_TIPS: TaxTip[] = [
  {
    title: "Zero-Tax Threshold",
    description: "Under NTA 2025, if your annual income is below ₦800,000, you are legally exempt from all PAYE tax liabilities.",
    icon: <ShieldCheck className="text-emerald-400" size={24} />
  },
  {
    title: "Relief Optimization",
    description: "Statutory payments like NHF (2.5%) and NHIS are deducted before tax calculation, effectively lowering your taxable base.",
    icon: <TrendingDown className="text-blue-400" size={24} />
  },
  {
    title: "SME CIT Exemption",
    description: "Small companies with an annual turnover of less than ₦100 Million are now taxed at 0% Company Income Tax.",
    icon: <Briefcase className="text-gold-400" size={24} />
  },
  {
    title: "Consolidated Relief",
    description: "The CRA (Consolidated Relief Allowance) is now set at ₦200,000 or 1% of gross income (whichever is higher) plus 20% of gross income.",
    icon: <Zap className="text-purple-400" size={24} />
  },
  {
    title: "Timely Filing",
    description: "PAYE returns must be filed by the 10th of every month. Early filing improves your compliance score with state IRS.",
    icon: <Sparkles className="text-amber-400" size={24} />
  }
];

const TaxTipCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TAX_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % TAX_TIPS.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + TAX_TIPS.length) % TAX_TIPS.length);

  return (
    <div 
      className="relative w-full mt-10 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-500 hover:bg-white/10">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Lightbulb size={120} className="text-gold-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 animate-liquid shadow-xl">
            {TAX_TIPS[currentIndex].icon}
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-500 bg-gold-400/10 px-3 py-1 rounded-full">Pro Tip #{currentIndex + 1}</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
              {TAX_TIPS[currentIndex].title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl text-sm font-medium">
              {TAX_TIPS[currentIndex].description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar Indicators */}
        <div className="flex justify-center md:justify-start gap-2 mt-8">
          {TAX_TIPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-gold-400 shadow-[0_0_10px_rgba(242,201,76,0.5)]' : 'w-2 bg-white/10 hover:bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxTipCarousel;
