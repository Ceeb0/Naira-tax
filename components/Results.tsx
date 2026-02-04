
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { TaxResult, SalaryTier } from '../types';
import { formatCurrency, getSalaryTier } from '../utils/taxLogic';
import { IncomePieChart } from './Charts';
import { Download, TrendingUp, DollarSign, Loader2, PieChart, Activity, Wallet, ShieldCheck, List, HelpCircle, X, Bell, Check, Clock, Calendar, Repeat } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReminderService } from '../services/api';

interface ResultsProps {
  result: TaxResult;
  onClose: () => void;
  monthlyIncome: number;
  currency: string;
  userId?: string;
}

const Tooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1.5 z-50 align-middle">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`transition-colors duration-200 focus:outline-none ${isOpen ? 'text-gold-500' : 'text-gray-400 hover:text-gold-500'}`}
      >
        <HelpCircle size={14} />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-liquid-glass-strong text-white text-[11px] leading-relaxed rounded-2xl shadow-2xl border border-gold-400/30 font-medium text-center z-[60] animate-scale-in">
          <div className="relative pt-1">
            {text}
            <button onClick={() => setIsOpen(false)} className="absolute -top-2 -right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
              <X size={12} />
            </button>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/10"></div>
        </div>
      )}
      {isOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
};

const Results: React.FC<ResultsProps> = ({ result, onClose, monthlyIncome, currency, userId }) => {
  const tier = useMemo(() => getSalaryTier(monthlyIncome), [monthlyIncome]);
  const [visible, setVisible] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('overview');
  const [perspective, setPerspective] = useState<'monthly' | 'annual'>(
    result.durationMonths === 12 ? 'annual' : 'monthly'
  );
  
  const [reminderDate, setReminderDate] = useState('');
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [reminderSaved, setReminderSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(10);
    setReminderDate(d.toISOString().split('T')[0]);
  }, []);

  const theme = useMemo(() => {
    switch (tier) {
      case SalaryTier.ELITE:
        return { badge: 'bg-gold-400/20 text-gold-400 border-gold-400/50', gradient: 'from-amber-600 to-yellow-800', accentColor: 'text-gold-400' };
      case SalaryTier.HIGH:
        return { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/50', gradient: 'from-indigo-600 to-purple-800', accentColor: 'text-purple-400' };
      case SalaryTier.MID:
        return { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50', gradient: 'from-emerald-600 to-teal-800', accentColor: 'text-emerald-400' };
      default:
        return { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/50', gradient: 'from-slate-600 to-slate-800', accentColor: 'text-blue-400' };
    }
  }, [tier]);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#050E24' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`NairaTax_Report_${result.period}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSetQuickReminder = async () => {
    if (!userId || userId === 'guest') return;
    setIsSettingReminder(true);
    try {
      await ReminderService.addReminder({
        userId,
        taxType: 'Tax Payment Plan',
        dueDate: reminderDate,
        amount: result.payeTax,
        notes: `Scheduled payment for the ${result.period} calculation.`,
        isCompleted: false
      });
      setReminderSaved(true);
      setTimeout(() => setReminderSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSettingReminder(false);
    }
  };

  // Logic to convert values based on selected perspective
  const factor = perspective === 'annual' 
    ? (result.durationMonths === 12 ? 1 : 12) 
    : (result.durationMonths === 12 ? 1/12 : 1);

  const displayValues = {
    gross: result.grossIncome * factor,
    tax: result.payeTax * factor,
    net: result.netIncome * factor,
    final: result.finalBalance * factor
  };

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center p-0 sm:p-4 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" onClick={onClose}></div>
      <div 
        ref={printRef}
        className={`relative w-full max-w-6xl bg-liquid-glass rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto transform transition-all duration-700 ${visible ? 'translate-y-0 scale-100' : 'translate-y-full scale-95'}`}
      >
        <div className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/5 no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-8 pb-4 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">Tax Summary</h2>
                <span className={`text-[10px] px-3 py-1.5 rounded-full border font-bold uppercase tracking-widest ${theme.badge}`}> {tier} </span>
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest opacity-60"> {result.period} Report </p>
            </div>
            
            <div className="flex items-center gap-4 bg-black/30 p-1.5 rounded-2xl border border-white/5">
                <button 
                    onClick={() => setPerspective('monthly')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${perspective === 'monthly' ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-white'}`}
                >
                    <Clock size={12} /> Monthly
                </button>
                <button 
                    onClick={() => setPerspective('annual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${perspective === 'annual' ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-white'}`}
                >
                    <Calendar size={12} /> Annual
                </button>
            </div>

            <div className="flex gap-3">
              <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 hover:bg-gold-400 hover:text-black transition-all text-gray-300 font-bold text-xs uppercase tracking-widest disabled:opacity-50 border border-white/5">
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isGeneratingPdf ? 'Wait...' : 'Save as PDF'}
              </button>
              <button onClick={onClose} className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-white text-black hover:scale-105 transition-all"> Close </button>
            </div>
          </div>
          <div className="flex px-8 gap-8 border-b border-white/5">
            <button onClick={() => setActiveTab('overview')} className={`pb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'overview' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500 hover:text-white'}`}>
              <Activity size={16} /> Overview
            </button>
            <button onClick={() => setActiveTab('ledger')} className={`pb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'ledger' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500 hover:text-white'}`}>
              <List size={16} /> Detailed Ledger
            </button>
          </div>
        </div>
        <div className="p-8 sm:p-12 space-y-12">
          {activeTab === 'overview' ? (
            <div className="space-y-12 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`lg:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} text-white relative overflow-hidden group shadow-2xl transition-all hover:scale-[1.02]`}>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2.5 text-white/60">
                      <Wallet size={20} /> <span className="font-bold text-[10px] uppercase tracking-[0.2em]">Net Savings / Disposable</span>
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-bold font-display tracking-tight">{formatCurrency(displayValues.final, currency)}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Estimated {perspective} balance after tax and expenses</p>
                  </div>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 shadow-xl transition-all hover:bg-white/10">
                  <div className={`flex items-center gap-2.5 ${theme.accentColor}`}>
                    <DollarSign size={20} /> <span className="font-bold text-[10px] uppercase tracking-widest">Gross Income</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">{formatCurrency(displayValues.gross, currency)}</h3>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 shadow-xl transition-all hover:bg-white/10">
                  <div className="flex items-center gap-2.5 text-red-400">
                    <TrendingUp size={20} /> <span className="font-bold text-[10px] uppercase tracking-widest">PAYE Tax Liability</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">{formatCurrency(displayValues.tax, currency)}</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <div className="bg-black/20 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <h4 className="font-bold font-display text-lg text-white flex items-center gap-3"> <ShieldCheck size={20} className="text-gold-400" /> Statutory Breakdown ({perspective}) </h4>
                      <Tooltip text="Detailed tax bands applied to your income based on 2025 Nigerian law." />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-[9px] uppercase font-bold text-gray-500 tracking-[0.2em] border-b border-white/5 bg-black/10">
                          <tr> <th className="px-8 py-5">Income Band</th> <th className="px-8 py-5">Rate</th> <th className="px-8 py-5 text-right">Tax Charged</th> </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {result.breakdown.map((b, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-all">
                              <td className="px-8 py-5 font-bold text-gray-400">{b.band}</td>
                              <td className="px-8 py-5 text-gray-600 font-mono text-xs">{(b.rate * 100).toFixed(0)}%</td>
                              <td className="px-8 py-5 text-right font-bold text-white font-display">{formatCurrency(b.amount * factor, currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gold-400 text-black font-bold">
                            <td colSpan={2} className="px-8 py-6 uppercase tracking-widest text-[10px]">Total {perspective} Tax</td>
                            <td className="px-8 py-6 text-right font-display text-xl">{formatCurrency(displayValues.tax, currency)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  
                  {/* Tax Planning Suggestion */}
                  <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 flex items-center gap-6 shadow-xl">
                      <div className="w-16 h-16 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 flex-shrink-0 animate-pulse">
                          <Activity size={24} />
                      </div>
                      <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Effective Tax Rate</h4>
                          <p className="text-2xl font-display font-bold text-blue-400">{result.effectiveTaxRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">You are paying {result.effectiveTaxRate.toFixed(1)}% of your gross earnings as tax.</p>
                      </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="bg-black/20 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                    <h4 className="font-bold text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3"> <PieChart size={16} className="text-gold-400" /> Disposable Income Share </h4>
                    <IncomePieChart result={result} currency={currency} />
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Gross Income ({perspective})</span>
                            <span className="text-xs font-bold text-white">{formatCurrency(displayValues.gross, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Total Deductions</span>
                            <span className="text-xs font-bold text-red-400">-{formatCurrency((displayValues.gross - displayValues.final), currency)}</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/20 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-fade-in-up">
              <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h4 className="font-bold font-display text-xl text-white"> Transaction Audit Ledger </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Calendar size={14} /> {result.transactionHistory.length} Entries recorded
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[9px] uppercase font-bold text-gray-500 tracking-[0.3em] border-b border-white/5 bg-black/20">
                    <tr> <th className="px-10 py-6">Period</th> <th className="px-10 py-6">Description</th> <th className="px-10 py-6">Category</th> <th className="px-10 py-6 text-right">Amount</th> </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.transactionHistory.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-all">
                        <td className="px-10 py-6"> <div className="font-bold text-white uppercase">{t.month}</div> </td>
                        <td className="px-10 py-6 text-gray-300"> {t.description} </td>
                        <td className="px-10 py-6"> <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase border ${t.type === 'Income' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}> {t.type} </span> </td>
                        <td className={`px-10 py-6 text-right font-display font-bold text-base ${t.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}> {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount, currency)} </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
