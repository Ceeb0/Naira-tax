import React, { useEffect, useState, useRef, useMemo } from 'react';
import { TaxResult, SalaryTier, FinancialInput } from '../types';
import { formatCurrency, calculateTax, getSalaryTier } from '../utils/taxLogic';
import { IncomePieChart, TaxBarChart } from './Charts';
import { Download, TrendingUp, DollarSign, Briefcase, Loader2, PieChart, Activity, Calendar, Calculator, Wallet, ShieldCheck, Repeat, FileText, CalendarDays, List, HelpCircle, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultsProps {
  result: TaxResult;
  onClose: () => void;
  monthlyIncome: number;
  currency: string;
}

const Tooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1.5 z-50 align-middle">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`transition-colors duration-200 focus:outline-none ${isOpen ? 'text-gold-500' : 'text-gray-400 hover:text-gold-500'}`}
        aria-label="More information"
      >
        <HelpCircle size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 p-3 bg-royal-900 dark:bg-white text-white dark:text-royal-900 text-[11px] leading-relaxed rounded-xl shadow-2xl border border-gold-400/30 font-medium text-center z-[60] animate-fade-in-up">
           <div className="relative pt-1">
              {text}
              <button 
                 onClick={() => setIsOpen(false)}
                 className="absolute -top-2 -right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                 aria-label="Close tooltip"
              >
                 <X size={12} />
              </button>
           </div>
           {/* Arrow */}
           <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-royal-900 dark:border-t-white"></div>
        </div>
      )}
      {/* Backdrop for mobile to close when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
};

const Results: React.FC<ResultsProps> = ({ result, onClose, monthlyIncome, currency }) => {
  const tier = useMemo(() => getSalaryTier(monthlyIncome), [monthlyIncome]);
  const [visible, setVisible] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('overview');
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  const theme = useMemo(() => {
    switch (tier) {
      case SalaryTier.ELITE:
        return {
          badge: 'bg-gold-100 text-yellow-800 border-gold-300 dark:bg-gold-500/20 dark:text-gold-300 dark:border-gold-500/50',
          gradient: 'from-yellow-600 to-amber-800',
          subCardBg: 'bg-amber-50 dark:bg-amber-900/10',
          subCardBorder: 'border-amber-100 dark:border-amber-500/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          textColor: 'text-amber-700 dark:text-amber-400',
          tableHeaderRow: 'bg-amber-50/50 dark:bg-amber-900/10'
        };
      case SalaryTier.HIGH:
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/50',
          gradient: 'from-indigo-600 to-purple-800',
          subCardBg: 'bg-indigo-50 dark:bg-indigo-900/10',
          subCardBorder: 'border-indigo-100 dark:border-indigo-500/20',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          textColor: 'text-indigo-700 dark:text-indigo-400',
          tableHeaderRow: 'bg-indigo-50/50 dark:bg-indigo-900/10'
        };
      case SalaryTier.MID:
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50',
          gradient: 'from-emerald-600 to-teal-800',
          subCardBg: 'bg-emerald-50 dark:bg-emerald-900/10',
          subCardBorder: 'border-emerald-100 dark:border-emerald-500/20',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          textColor: 'text-emerald-700 dark:text-emerald-400',
          tableHeaderRow: 'bg-emerald-50/50 dark:bg-emerald-900/10'
        };
      case SalaryTier.LOW:
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
          gradient: 'from-slate-600 to-slate-800',
          subCardBg: 'bg-slate-50 dark:bg-white/5',
          subCardBorder: 'border-slate-100 dark:border-white/10',
          iconColor: 'text-slate-600 dark:text-slate-400',
          textColor: 'text-slate-700 dark:text-slate-400',
          tableHeaderRow: 'bg-slate-50/50 dark:bg-white/5'
        };
    }
  }, [tier]);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = printRef.current;
      const isDark = document.documentElement.classList.contains('dark');
      const dateStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0B1533' : '#ffffff',
        logging: false,
        onclone: (documentClone) => {
            const el = documentClone.getElementById('results-content');
            if (el) {
                el.style.overflow = 'visible';
                el.style.maxHeight = 'none';
                el.style.borderRadius = '0';
                
                // Ensure ledger is visible for PDF
                // (Depends on current tab, but we might want to force showing it if needed)
                
                const header = documentClone.createElement('div');
                header.style.padding = '32px';
                header.style.backgroundColor = isDark ? '#0B1533' : '#ffffff';
                header.innerHTML = `
                    <div style="border-bottom: 2px solid #F2C94C; padding-bottom: 10px; margin-bottom: 20px;">
                        <h1 style="font-size: 24px; color: ${isDark ? '#fff' : '#000'}; font-weight: bold;">CACS NairaTax Pro</h1>
                        <p style="color: #666;">Generated on ${dateStr} - ${result.period} Summary</p>
                    </div>
                `;
                el.insertBefore(header, el.firstChild);
            }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`NairaTax_Report_${result.period}.pdf`);
    } catch (error) {
      console.error('PDF Error', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-40 flex items-end justify-center sm:items-center p-0 sm:p-4 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      ></div>
      
      <div 
        id="results-content"
        ref={printRef}
        className={`relative w-full max-w-5xl bg-white dark:bg-[#0B1533] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto transform transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${visible ? 'translate-y-0 scale-100' : 'translate-y-full scale-95'}`}
      >
        
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B1533]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 pb-2 gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Financial Analysis
                <span className={`text-xs px-2.5 py-1 rounded-full border font-mono uppercase tracking-wider font-bold ${theme.badge} transition-colors duration-500`}>
                  {tier}
                </span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {result.period} Income Tax & Expense Breakdown
              </p>
            </div>

            <div className="flex gap-2 self-start md:self-center">
              <button 
                  onClick={handleDownloadPdf} 
                  disabled={isGeneratingPdf}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gold-400 hover:text-black dark:hover:bg-gold-400 dark:hover:text-black transition-all text-gray-600 dark:text-gray-300 disabled:opacity-50 text-sm font-semibold" 
              >
                  {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {isGeneratingPdf ? 'Generating...' : 'Export PDF'}
              </button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity">
                Close
              </button>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex px-6 gap-6 overflow-x-auto border-b border-gray-100 dark:border-white/5">
             <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-gold-400 text-gold-500 dark:text-gold-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Activity size={16} /> Overview
             </button>
             <button
                onClick={() => setActiveTab('ledger')}
                className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'ledger'
                    ? 'border-gold-400 text-gold-500 dark:text-gold-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <List size={16} /> Transaction Ledger ({result.transactionHistory.length})
             </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 print:p-0 pt-6">
          
          {activeTab === 'overview' ? (
              <>
                {/* Hero Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Final Balance - Hero */}
                    <div className={`lg:col-span-2 p-6 rounded-3xl bg-gradient-to-br ${theme.gradient} text-white relative overflow-hidden group animate-fade-in-up transition-colors duration-500`}>
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-white/80 mb-2">
                            <Wallet size={18} />
                            <span className="font-medium text-sm tracking-wide uppercase">
                            {result.period} Disposable
                            </span>
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">{formatCurrency(result.finalBalance, currency)}</h3>
                        <p className="text-white/70 text-xs mt-2">Available after Tax & Personal Expenses</p>
                    </div>
                    </div>

                    {/* Net Income */}
                    <div className={`p-6 rounded-3xl ${theme.subCardBg} border ${theme.subCardBorder} relative overflow-hidden group animate-fade-in-up delay-100 transition-colors duration-500`}>
                    <div className="relative z-10">
                        <div className={`flex items-center gap-2 ${theme.iconColor} mb-2`}>
                            <DollarSign size={18} />
                            <span className="font-medium text-sm">{result.period} Net Income</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-display">{formatCurrency(result.netIncome, currency)}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Before living expenses</p>
                    </div>
                    </div>

                    {/* Effective Rate */}
                    <div className={`p-6 rounded-3xl ${theme.subCardBg} border ${theme.subCardBorder} relative overflow-hidden group animate-fade-in-up delay-200 transition-colors duration-500`}>
                    <div className="relative z-10">
                        <div className={`flex items-center gap-2 ${theme.iconColor} mb-2`}>
                            <Activity size={18} />
                            <span className="font-medium text-sm">Effective Tax Rate</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-display">{result.effectiveTaxRate.toFixed(1)}%</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Actual tax burden</p>
                    </div>
                    </div>
                </div>

                {/* Visualization & Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up delay-300">
                    <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <PieChart size={20} className="text-gray-400" />
                        Where Your Money Goes
                    </h3>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <IncomePieChart result={result} currency={currency} />
                    </div>
                    
                    {result.totalPersonalExpenses > 0 && (
                        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 flex justify-between items-center">
                            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Total Personal Expenses</span>
                            <span className="text-lg font-bold text-orange-700 dark:text-orange-400">-{formatCurrency(result.totalPersonalExpenses, currency)}</span>
                        </div>
                    )}
                    </div>

                    <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase size={20} className="text-gray-400" />
                        {result.period} Breakdown
                    </h3>
                    <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            <tr className={`group ${theme.tableHeaderRow} transition-colors`}>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">Total Gross Income</td>
                            <td className={`px-6 py-4 font-bold text-right ${theme.textColor} group-hover:scale-105 transition-transform origin-right`}>{formatCurrency(result.grossIncome, currency)}</td>
                            </tr>
                            
                            <tr className="bg-gray-50/50 dark:bg-white/5">
                            <td colSpan={2} className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Statutory Deductions</td>
                            </tr>
                            
                            <tr className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400 pl-8 flex items-center">
                                Pension Contribution (8%)
                                <Tooltip text="Mandatory 8% contribution of your Gross Income towards your Retirement Savings Account." />
                            </td>
                            <td className="px-6 py-3 font-medium text-right text-gold-600 dark:text-gold-400">-{formatCurrency(result.pension, currency)}</td>
                            </tr>
                            
                            {result.totalTaxDeductible > 0 && (
                            <tr className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-3 text-gray-500 dark:text-gray-400 pl-8 flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                        Other Tax Exempt <ShieldCheck size={12} className="text-green-500"/>
                                    </span>
                                    <Tooltip text="Items like National Housing Fund (NHF), NHIS, and Life Assurance are deducted before tax calculation." />
                                </td>
                                <td className="px-6 py-3 font-medium text-right text-purple-600 dark:text-purple-400">-{formatCurrency(result.totalTaxDeductible, currency)}</td>
                            </tr>
                            )}
                            
                            <tr className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400 pl-8 flex items-center">
                                PAYE Tax
                                <Tooltip text={`Calculated on Taxable Income (Gross - Pension - Exemptions - CRA). Includes Consolidated Relief Allowance (CRA) of ${formatCurrency(result.consolidatedRelief, currency)}.`} />
                            </td>
                            <td className="px-6 py-3 font-medium text-right text-red-500">-{formatCurrency(result.payeTax, currency)}</td>
                            </tr>

                            <tr className="bg-emerald-50/30 dark:bg-emerald-900/10 font-bold border-t border-b border-emerald-100 dark:border-emerald-500/20">
                            <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Net Income (Take Home)</td>
                            <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(result.netIncome, currency)}</td>
                            </tr>

                            {result.totalPersonalExpenses > 0 && (
                                <>
                                <tr className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">Personal Expenses</td>
                                    <td className="px-6 py-3 font-medium text-right text-orange-600 dark:text-orange-400">-{formatCurrency(result.totalPersonalExpenses, currency)}</td>
                                </tr>
                                <tr className="bg-blue-50/50 dark:bg-blue-900/10 font-bold">
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Disposable Balance</td>
                                    <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400">{formatCurrency(result.finalBalance, currency)}</td>
                                </tr>
                                </>
                            )}
                        </tbody>
                        </table>
                    </div>
                    </div>
                </div>
            </>
          ) : (
             <div className="space-y-6 animate-fade-in-up">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <List size={20} className="text-gray-400" />
                    Transaction History
                 </h3>
                 <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Month</th>
                                    <th className="px-6 py-4 font-semibold">Description</th>
                                    <th className="px-6 py-4 font-semibold">Bank</th>
                                    <th className="px-6 py-4 font-semibold">Receipt Ref</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {result.transactionHistory.map((tx, i) => (
                                    <tr key={tx.id + i} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {tx.date ? new Date(tx.date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs font-bold">
                                                {tx.month}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{tx.description}</div>
                                            <div className={`text-xs mt-0.5 ${tx.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                                                {tx.type} {tx.isTaxDeductible && '(Tax Exempt)'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {tx.bank || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-500 font-mono text-xs">
                                            {tx.receiptRef || '-'}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                            {tx.type === 'Expense' ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                                        </td>
                                    </tr>
                                ))}
                                {result.transactionHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                                            No detailed transactions recorded.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
             </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-8 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-white/5 mt-8 bg-gray-50/50 dark:bg-black/20">
           Calculated via CACSNairaTax Pro. Based on Nigerian Personal Income Tax Act (PITA) 2011 (Amended).
        </div>
      </div>
    </div>
  );
};

export default Results;
