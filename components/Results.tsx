import React, { useEffect, useState } from 'react';
import { TaxResult, SalaryTier } from '../types';
import { formatCurrency, calculateTax } from '../utils/taxLogic';
import { IncomePieChart, TaxBarChart } from './Charts';
import { Download, TrendingUp, DollarSign, Briefcase } from 'lucide-react';

interface ResultsProps {
  result: TaxResult;
  onClose: () => void;
  monthlyIncome: number;
}

const Results: React.FC<ResultsProps> = ({ result, onClose, monthlyIncome }) => {
  const [tier, setTier] = useState<SalaryTier>(SalaryTier.LOW);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    if (monthlyIncome < 200000) setTier(SalaryTier.LOW);
    else if (monthlyIncome < 1000000) setTier(SalaryTier.MID);
    else if (monthlyIncome < 5000000) setTier(SalaryTier.HIGH);
    else setTier(SalaryTier.ELITE);
  }, [monthlyIncome]);

  const comparison10 = calculateTax({ monthlyIncome: monthlyIncome * 1.1, additionalEarnings: 0 }, result.period === 'Annual');
  const comparison20 = calculateTax({ monthlyIncome: monthlyIncome * 1.2, additionalEarnings: 0 }, result.period === 'Annual');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`fixed inset-0 z-40 flex items-end justify-center sm:items-center p-0 sm:p-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className={`relative w-full max-w-4xl bg-white dark:bg-royal-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto transform transition-transform duration-500 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between p-6 bg-white/90 dark:bg-royal-900/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10 no-print">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Tax Analysis</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                tier === SalaryTier.ELITE ? 'bg-gold-400 text-black' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
              }`}>
                {tier} Tier
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{result.period} View</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={handlePrint} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300" title="Export PDF">
                <Download size={20} />
             </button>
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
               Close
             </button>
          </div>
        </div>

        <div className="p-6 space-y-8 print:p-0">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-royal-50 dark:bg-white/5 border border-royal-100 dark:border-white/10 relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gross Income</p>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-display">{formatCurrency(result.grossIncome)}</h3>
               <Briefcase className="absolute bottom-4 right-4 text-gray-300 dark:text-gray-600 opacity-50" size={24} />
            </div>

            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
               <p className="text-sm text-red-600 dark:text-red-300 mb-1">Total Deductions (Tax+Pension)</p>
               <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 font-display">{formatCurrency(result.payeTax + result.pension)}</h3>
               <TrendingUp className="absolute bottom-4 right-4 text-red-300 dark:text-red-500 opacity-50" size={24} />
            </div>

            <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 relative overflow-hidden shadow-lg shadow-green-900/5 group">
               <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
               <p className="text-sm text-green-600 dark:text-green-300 mb-1">Net Income (Take Home)</p>
               <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 font-display">{formatCurrency(result.netIncome)}</h3>
               <DollarSign className="absolute bottom-4 right-4 text-green-300 dark:text-green-500 opacity-50" size={24} />
            </div>
          </div>

          {/* Detailed Breakdown & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gold-400 rounded-full"></span>
                Visual Breakdown
              </h3>
              <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                <IncomePieChart result={result} />
              </div>
              <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                 <TaxBarChart result={result} />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Salary Details
              </h3>
              <div className="bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Monthly Gross</td>
                      <td className="px-6 py-4 font-medium text-right text-gray-900 dark:text-white">{formatCurrency(result.grossIncome)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Consolidated Relief</td>
                      <td className="px-6 py-4 font-medium text-right text-gray-900 dark:text-white">-{formatCurrency(result.consolidatedRelief)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Pension (8%)</td>
                      <td className="px-6 py-4 font-medium text-right text-red-500">-{formatCurrency(result.pension)}</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Taxable Income</td>
                      <td className="px-6 py-4 font-medium text-right text-gray-900 dark:text-white">{formatCurrency(result.taxableIncome)}</td>
                    </tr>
                    <tr className="bg-royal-50/50 dark:bg-royal-900/50">
                      <td className="px-6 py-4 font-bold text-royal-900 dark:text-blue-300">PAYE Tax</td>
                      <td className="px-6 py-4 font-bold text-right text-red-500">-{formatCurrency(result.payeTax)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

               {/* Projection */}
               <div className="mt-8 no-print">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Projections</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 opacity-70 hover:opacity-100 transition-opacity">
                     <span className="text-sm text-gray-600 dark:text-gray-300">If you earned +10%</span>
                     <span className="font-mono text-green-500 font-bold">{formatCurrency(comparison10.netIncome)} <span className="text-xs text-gray-400">net</span></span>
                  </div>
                   <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 opacity-70 hover:opacity-100 transition-opacity">
                     <span className="text-sm text-gray-600 dark:text-gray-300">If you earned +20%</span>
                     <span className="font-mono text-green-500 font-bold">{formatCurrency(comparison20.netIncome)} <span className="text-xs text-gray-400">net</span></span>
                  </div>
                </div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Footer for print */}
        <div className="hidden print-only p-8 text-center text-xs text-gray-400 border-t mt-8">
           Calculated via NairaTax Pro. Based on Nigerian Personal Income Tax Act (PITA) 2011 (Amended).
        </div>
      </div>
    </div>
  );
};

export default Results;
