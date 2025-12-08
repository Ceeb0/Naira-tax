import React, { useState } from 'react';
import { FinancialInput } from '../types';
import { ArrowRight, Wallet, TrendingUp } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (data: FinancialInput, isAnnual: boolean) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [additional, setAdditional] = useState<string>('');
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(monthlyIncome.replace(/,/g, '')) || 0;
    const add = parseFloat(additional.replace(/,/g, '')) || 0;
    if (income > 0) {
      onCalculate({ monthlyIncome: income, additionalEarnings: add }, isAnnual);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Monthly vs Annual Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-200 dark:bg-royal-800 p-1 rounded-full flex relative">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gold-400 rounded-full shadow-sm transition-all duration-300 ease-in-out ${isAnnual ? 'translate-x-full left-0' : 'left-1'}`}
            ></div>
            <button 
              type="button"
              onClick={() => setIsAnnual(false)} 
              className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors ${!isAnnual ? 'text-royal-900 dark:text-royal-900' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Monthly
            </button>
            <button 
              type="button"
              onClick={() => setIsAnnual(true)} 
              className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors ${isAnnual ? 'text-royal-900 dark:text-royal-900' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1 group-focus-within:text-gold-400 transition-colors">
              Base Salary (Monthly)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Wallet className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
              </div>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 500,000"
                className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all font-display text-lg"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <span className="text-gray-400 text-sm font-medium">NGN</span>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1 group-focus-within:text-gold-400 transition-colors">
              Additional Earnings (Monthly)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <TrendingUp className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
              </div>
              <input
                type="number"
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
                placeholder="e.g. 50,000 (Bonus, Allowance)"
                className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all font-display text-lg"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <span className="text-gray-400 text-sm font-medium">NGN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="relative w-full group overflow-hidden rounded-2xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gold-400 to-yellow-600 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
          <div className="relative bg-royal-900 rounded-2xl px-6 py-4 flex items-center justify-center gap-2 transition-all group-hover:bg-opacity-90">
             <span className="text-white font-bold text-lg tracking-wide uppercase">Calculate</span>
             <ArrowRight className="text-gold-400 group-hover:translate-x-1 transition-transform" />
          </div>
           {/* Neon Glow effect */}
           <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-yellow-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        </button>
      </form>
    </div>
  );
};

export default Calculator;
