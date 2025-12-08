import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import Results from './components/Results';
import MadLoader from './components/MadLoader';
import { FinancialInput, TaxResult } from './types';
import { calculateTax } from './utils/taxLogic';
import { Moon, Sun, Calculator as CalcIcon } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [currentInput, setCurrentInput] = useState<number>(0);

  useEffect(() => {
    // Check system preference on mount or stick to default dark
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleCalculate = (data: FinancialInput, isAnnual: boolean) => {
    setLoading(true);
    setCurrentInput(data.monthlyIncome);
    
    // Simulate "crunching" time for the mad loader effect
    setTimeout(() => {
      const res = calculateTax(data, isAnnual);
      setResult(res);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-soft-50 dark:bg-[#050E24] transition-colors duration-500 font-sans selection:bg-gold-400 selection:text-black">
      
      {/* Navbar */}
      <nav className="fixed w-full z-30 top-0 start-0 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#050E24]/80 backdrop-blur-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="#" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="bg-gradient-to-tr from-gold-400 to-yellow-600 p-2 rounded-lg">
              <CalcIcon className="text-royal-900" size={24} />
            </div>
            <span className="self-center text-2xl font-display font-bold whitespace-nowrap dark:text-white tracking-tight">
              Naira<span className="text-gold-400">Tax</span> Pro
            </span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[85vh]">
        
        {/* Hero Text */}
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-200">Income</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Accurate, instant PAYE tax calculations for Nigerian professionals. 
            Optimized for the modern economy.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="w-full max-w-lg relative">
            {/* Decorative background glow */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <div className="relative bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-2xl">
               <Calculator onCalculate={handleCalculate} />
            </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-500 dark:text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} NairaTax Pro. Built for Nigeria 🇳🇬</p>
      </footer>

      {/* Overlays */}
      {loading && <MadLoader />}
      {result && !loading && (
        <Results 
          result={result} 
          monthlyIncome={currentInput}
          onClose={() => setResult(null)} 
        />
      )}
      
    </div>
  );
};

export default App;
