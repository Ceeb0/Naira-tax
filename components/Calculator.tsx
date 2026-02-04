
import React, { useState, useEffect, useMemo } from 'react';
import { IncomeSource, Expense, CustomCategory, MonthlyInput, RowItem } from '../types';
import { COMMON_EXPENSES, NIGERIAN_BANKS, SPECIALIZED_TAX_RATES } from '../utils/taxLogic';
import { ArrowRight, Plus, Trash2, ShieldCheck, AlertCircle, Calendar, ChevronDown, ChevronUp, HelpCircle, X, Percent, Zap, Layers, Briefcase, Clock, Copy, Info } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (data: MonthlyInput[], customTaxRate?: number) => void;
  onOpenReminders?: () => void;
  customCategories?: CustomCategory[];
  currencySymbol: string;
}

interface MonthData {
  incomeRows: RowItem[];
  expenseRows: RowItem[];
}

const MONTHS_LIST = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_INCOME = [{ id: '1', text: 'Annual Base Salary', amount: '', isExpanded: false }];

const Tooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1.5 z-50">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`transition-colors duration-200 ${isOpen ? 'text-gold-500' : 'text-gray-400 hover:text-gold-500'}`}>
        <HelpCircle size={14} />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-liquid-glass-strong text-white text-[11px] leading-relaxed rounded-2xl shadow-2xl border border-gold-400/30 font-medium text-center z-[60] animate-scale-in">
          <div className="relative pt-1">
            {text}
            <button onClick={() => setIsOpen(false)} className="absolute -top-2 -right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"> <X size={12} /> </button>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/10"></div>
        </div>
      )}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
};

const Calculator: React.FC<CalculatorProps> = ({ onCalculate, onOpenReminders, customCategories = [], currencySymbol }) => {
  const currentMonthName = useMemo(() => MONTHS_LIST[new Date().getMonth()], []);
  
  // Mode selection: 'monthly' vs 'annual'
  const [calcPeriod, setCalcPeriod] = useState<'monthly' | 'annual'>('annual');
  
  // Data stores
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>({ 
    [currentMonthName]: { incomeRows: [{ id: '1', text: 'Base Salary', amount: '', isExpanded: false }], expenseRows: [] } 
  });
  const [annualData, setAnnualData] = useState<MonthData>({
    incomeRows: [...DEFAULT_INCOME],
    expenseRows: []
  });

  const [selectedMonths, setSelectedMonths] = useState<string[]>([currentMonthName]);
  const [activeTab, setActiveTab] = useState<string>(currentMonthName);
  const [error, setError] = useState<string>('');
  const [calcMode, setCalcMode] = useState<'Statutory' | 'Flat' | 'Special'>('Statutory');
  const [taxRate, setTaxRate] = useState<string>('7.5');
  const [selectedSpecialTax, setSelectedSpecialTax] = useState(SPECIALIZED_TAX_RATES[0].label);

  const allCategories = useMemo(() => [...COMMON_EXPENSES, ...customCategories], [customCategories]);

  const formatNumber = (val: string) => {
    let clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('');
    const [integer, decimal] = clean.split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return clean.includes('.') ? formattedInteger + '.' + (decimal || '') : formattedInteger;
  };

  const toggleMonth = (month: string) => {
    if (calcPeriod === 'annual') return;
    if (selectedMonths.includes(month)) {
      if (selectedMonths.length === 1) return;
      const newMonths = selectedMonths.filter(m => m !== month);
      setSelectedMonths(newMonths);
      if (activeTab === month) setActiveTab(newMonths[0]);
    } else {
      const newMonths = [...selectedMonths, month].sort((a, b) => MONTHS_LIST.indexOf(a) - MONTHS_LIST.indexOf(b));
      setSelectedMonths(newMonths);
      const sourceData = monthlyData[activeTab];
      setMonthlyData(prev => ({ ...prev, [month]: { 
        incomeRows: sourceData.incomeRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false })), 
        expenseRows: sourceData.expenseRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false })) 
      } }));
      setActiveTab(month);
    }
  };

  const syncToAllMonths = () => {
    const sourceData = monthlyData[activeTab];
    const newDataMap = { ...monthlyData };
    selectedMonths.forEach(m => {
        newDataMap[m] = { 
            incomeRows: sourceData.incomeRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false })), 
            expenseRows: sourceData.expenseRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false })) 
        };
    });
    setMonthlyData(newDataMap);
  };

  const selectAllMonths = () => {
    if (calcPeriod === 'annual') return;
    if (selectedMonths.length === 12) {
      setSelectedMonths([currentMonthName]);
      setActiveTab(currentMonthName);
    } else {
      const sourceData = monthlyData[activeTab];
      const newDataMap = { ...monthlyData };
      MONTHS_LIST.forEach(m => {
        if (!newDataMap[m]) {
          newDataMap[m] = { 
            incomeRows: sourceData.incomeRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false })), 
            expenseRows: sourceData.expenseRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false })) 
          };
        }
      });
      setSelectedMonths([...MONTHS_LIST]);
      setMonthlyData(newDataMap);
    }
  };

  const updateRow = (type: 'income' | 'expense', id: string, field: keyof RowItem, value: any) => {
    const listKey = type === 'income' ? 'incomeRows' : 'expenseRows';
    
    if (calcPeriod === 'annual') {
        const list = annualData[listKey];
        const newRows = list.map(row => {
          if (row.id !== id) return row;
          if (field === 'amount') return { ...row, amount: formatNumber(value) };
          if (field === 'text' && type === 'expense') {
            const match = allCategories.find(c => c.label.toLowerCase() === value.toLowerCase());
            return { ...row, text: value, isTaxDeductible: match ? match.isTaxDeductible : row.isTaxDeductible };
          }
          return { ...row, [field]: value };
        });
        setAnnualData(prev => ({ ...prev, [listKey]: newRows }));
    } else {
        const list = monthlyData[activeTab][listKey];
        const newRows = list.map(row => {
          if (row.id !== id) return row;
          if (field === 'amount') return { ...row, amount: formatNumber(value) };
          if (field === 'text' && type === 'expense') {
            const match = allCategories.find(c => c.label.toLowerCase() === value.toLowerCase());
            return { ...row, text: value, isTaxDeductible: match ? match.isTaxDeductible : row.isTaxDeductible };
          }
          return { ...row, [field]: value };
        });
        setMonthlyData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [listKey]: newRows } }));
    }
  };

  const deleteRow = (type: 'income' | 'expense', id: string) => {
    const listKey = type === 'income' ? 'incomeRows' : 'expenseRows';
    if (calcPeriod === 'annual') {
        setAnnualData(prev => ({ ...prev, [listKey]: prev[listKey].filter(r => r.id !== id) }));
    } else {
        setMonthlyData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [listKey]: prev[activeTab][listKey].filter(r => r.id !== id) } }));
    }
  };

  const addRow = (type: 'income' | 'expense') => {
    const listKey = type === 'income' ? 'incomeRows' : 'expenseRows';
    const newRow = { id: Math.random().toString(), text: '', amount: '', isExpanded: true };
    
    if (calcPeriod === 'annual') {
        setAnnualData(prev => ({ ...prev, [listKey]: [...prev[listKey], newRow] }));
    } else {
        setMonthlyData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [listKey]: [...prev[activeTab][listKey], newRow] } }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload: MonthlyInput[] = [];

    if (calcPeriod === 'annual') {
        const sources: IncomeSource[] = [];
        const expenses: Expense[] = [];
        annualData.incomeRows.forEach(row => {
          const val = parseFloat(row.amount.replace(/,/g, '')) || 0;
          if (val > 0) sources.push({ id: row.id, description: row.text || 'Income', amount: val, bank: row.bank, date: row.date, receiptRef: row.receiptRef });
        });
        annualData.expenseRows.forEach(row => {
          const val = parseFloat(row.amount.replace(/,/g, '')) || 0;
          if (val > 0) expenses.push({ id: row.id, category: row.text || 'Expense', amount: val, isTaxDeductible: !!row.isTaxDeductible, bank: row.bank, date: row.date, receiptRef: row.receiptRef });
        });
        if (sources.length === 0) { setError(`Enter your total annual earnings.`); return; }
        payload.push({ month: 'Full Year', incomeSources: sources, expenses, isAnnual: true });
    } else {
        for (const month of selectedMonths) {
          const data = monthlyData[month];
          const sources: IncomeSource[] = [];
          const expenses: Expense[] = [];
          data.incomeRows.forEach(row => {
            const val = parseFloat(row.amount.replace(/,/g, '')) || 0;
            if (val > 0) sources.push({ id: row.id, description: row.text || 'Income', amount: val, bank: row.bank, date: row.date, receiptRef: row.receiptRef });
          });
          data.expenseRows.forEach(row => {
            const val = parseFloat(row.amount.replace(/,/g, '')) || 0;
            if (val > 0) expenses.push({ id: row.id, category: row.text || 'Expense', amount: val, isTaxDeductible: !!row.isTaxDeductible, bank: row.bank, date: row.date, receiptRef: row.receiptRef });
          });
          if (sources.length === 0) { setError(`Enter earnings for ${month}.`); return; }
          payload.push({ month, incomeSources: sources, expenses });
        }
    }

    let finalRate: number | undefined = (calcMode === 'Flat') ? parseFloat(taxRate) : (calcMode === 'Special' ? SPECIALIZED_TAX_RATES.find(s => s.label === selectedSpecialTax)?.rate : undefined);
    onCalculate(payload, finalRate);
  };

  const currentRows = calcPeriod === 'annual' ? annualData : monthlyData[activeTab];

  const renderRow = (row: RowItem, type: 'income' | 'expense', index: number) => {
    const isIncome = type === 'income';
    const hasDetails = row.date || row.bank || row.receiptRef;
    return (
      <div key={row.id} className="group animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
        <div className="flex gap-2">
          <div className="flex-1 bg-black/10 dark:bg-white/5 rounded-2xl border border-white/5 transition-all p-1.5 flex flex-col shadow-inner">
            <div className="flex items-center">
              <div className="flex-[2] border-r border-white/5 pr-2">
                <input type="text" value={row.text} onChange={(e) => updateRow(type, row.id, 'text', e.target.value)} placeholder={isIncome ? 'Money source?' : 'Expense?'} className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none font-semibold" />
              </div>
              <div className="flex-[3] pl-2 relative flex items-center">
                <span className="absolute left-3 text-gold-400 font-bold text-base">{currencySymbol}</span>
                <input type="text" inputMode="decimal" value={row.amount} onChange={(e) => updateRow(type, row.id, 'amount', e.target.value)} placeholder="0.00" className="w-full bg-transparent pl-8 pr-3 py-2.5 text-right text-gray-900 dark:text-white focus:outline-none font-display font-bold text-lg" />
              </div>
              <button type="button" onClick={() => updateRow(type, row.id, 'isExpanded', !row.isExpanded)} className={`p-2.5 ml-1 rounded-xl transition-all ${row.isExpanded ? 'bg-white/10 text-white' : hasDetails ? 'text-gold-400 bg-gold-400/10' : 'text-gray-500'}`}>
                {row.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            {row.isExpanded && (
              <div className="border-t border-white/5 mt-2 pt-4 px-2 pb-2 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-scale-in">
                <input type="date" value={row.date || ''} onChange={(e) => updateRow(type, row.id, 'date', e.target.value)} className="bg-black/20 rounded-xl py-2 px-3 text-xs text-gray-300 focus:outline-none" />
                <input type="text" placeholder="Bank" value={row.bank || ''} onChange={(e) => updateRow(type, row.id, 'bank', e.target.value)} className="bg-black/20 rounded-xl py-2 px-3 text-xs text-gray-300 focus:outline-none" />
                <input type="text" placeholder="TXN-ID" value={row.receiptRef || ''} onChange={(e) => updateRow(type, row.id, 'receiptRef', e.target.value)} className="bg-black/20 rounded-xl py-2 px-3 text-xs text-gray-300 focus:outline-none" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-10">
            {(isIncome ? currentRows.incomeRows.length > 1 : true) && (
              <button type="button" onClick={() => deleteRow(type, row.id)} className="p-2.5 text-gray-500 hover:text-red-500 rounded-xl transition-all"> <Trash2 size={18} /> </button>
            )}
          </div>
        </div>
        {!isIncome && (
          <div className="flex items-center gap-2 pl-2 mt-1.5">
            <button type="button" onClick={() => updateRow(type, row.id, 'isTaxDeductible', !row.isTaxDeductible)} className={`text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all font-bold ${row.isTaxDeductible ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-transparent border-white/5 text-gray-500 hover:text-white'}`}> <ShieldCheck size={12} /> {row.isTaxDeductible ? 'Lowers Your Tax' : 'Lowers Your Tax?'} </button>
            <Tooltip text="Some payments like Pension help lower your tax." />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-10 gap-4">
          <div className="flex bg-black/20 dark:bg-black/40 rounded-3xl p-1.5 border border-white/5 shadow-2xl">
              <button 
                type="button" 
                onClick={() => setCalcPeriod('annual')}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.25rem] text-xs font-bold uppercase tracking-widest transition-all ${calcPeriod === 'annual' ? 'bg-gold-400 text-black shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}
              >
                  <Briefcase size={16} /> Annual Planning
              </button>
              <button 
                type="button" 
                onClick={() => setCalcPeriod('monthly')}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.25rem] text-xs font-bold uppercase tracking-widest transition-all ${calcPeriod === 'monthly' ? 'bg-gold-400 text-black shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}
              >
                  <Clock size={16} /> Monthly Tracking
              </button>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] animate-pulse">
            {calcPeriod === 'annual' ? 'Calculate total tax for the full year' : 'Calculate tax for specific months'}
          </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {calcPeriod === 'monthly' && (
            <div id="tour-months" className="space-y-4 animate-scale-in">
              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-500"> <Calendar size={14} className="text-gold-400" /> Select Months </label>
                <div className="flex items-center gap-4">
                    <button 
                        type="button" 
                        onClick={syncToAllMonths}
                        className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-white flex items-center gap-1.5"
                        title="Copy current month data to all selected months"
                    >
                        <Copy size={12} /> Sync Values
                    </button>
                    <button type="button" onClick={selectAllMonths} className="text-[10px] font-bold text-gold-500 uppercase tracking-widest hover:text-white"> {selectedMonths.length === 12 ? 'Reset Selection' : 'Pick Full Year'} </button>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {MONTHS_LIST.map(month => (
                  <button key={month} type="button" onClick={() => toggleMonth(month)} className={`h-12 rounded-2xl text-[11px] font-bold transition-all border flex items-center justify-center ${selectedMonths.includes(month) ? 'bg-gold-400 text-black border-gold-400 shadow-xl scale-105' : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'}`}> {month} </button>
                ))}
              </div>
            </div>
        )}

        {calcPeriod === 'annual' && (
            <div className="px-2 animate-scale-in bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold-400/10 rounded-xl text-gold-400">
                        <Layers size={20} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">Annual Projection Mode</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Perfect for long-term financial planning. Enter your estimated yearly earnings and expected expenses below.</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div id="tour-income" className="space-y-4">
            <div className="flex items-center justify-between px-2"> 
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    {calcPeriod === 'annual' ? 'Annual Earnings' : `Money In (${activeTab})`}
                </label> 
                <button type="button" onClick={() => addRow('income')} className="p-2 bg-gold-400/10 text-gold-400 rounded-xl hover:bg-gold-400 hover:text-black transition-all"> <Plus size={16} /> </button> 
            </div>
            <div className="space-y-4">{currentRows.incomeRows.map((r, i) => renderRow(r, 'income', i))}</div>
          </div>
          <div id="tour-expenses" className="space-y-4">
            <div className="flex items-center justify-between px-2"> 
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    {calcPeriod === 'annual' ? 'Annual Reliefs & Spend' : `Money Out (${activeTab})`}
                </label> 
                <button type="button" onClick={() => addRow('expense')} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"> <Plus size={16} /> </button> 
            </div>
            <div className="space-y-4">{currentRows.expenseRows.map((r, i) => renderRow(r, 'expense', i))}</div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex bg-black/20 rounded-2xl p-1.5 gap-1.5 w-fit border border-white/5">
              <button type="button" onClick={() => setCalcMode('Statutory')} className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${calcMode === 'Statutory' ? 'bg-white text-royal-900 shadow-xl' : 'text-gray-500'}`}>Standard (LIRS/FIRS)</button>
              <button type="button" onClick={() => setCalcMode('Flat')} className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${calcMode === 'Flat' ? 'bg-white text-royal-900 shadow-xl' : 'text-gray-500'}`}>Flat Rate</button>
              <button type="button" onClick={() => setCalcMode('Special')} className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${calcMode === 'Special' ? 'bg-gold-400 text-black shadow-xl' : 'text-gray-500'}`}>Specialized</button>
            </div>
            <div className="flex-1 max-w-sm">
              {calcMode === 'Flat' && <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0.0%" className="w-full py-5 bg-black/20 border border-white/5 rounded-[2rem] text-white font-display text-2xl font-bold text-center outline-none focus:border-gold-400 transition-all" />}
              {calcMode === 'Special' && <select value={selectedSpecialTax} onChange={(e) => setSelectedSpecialTax(e.target.value)} className="w-full py-5 bg-black/20 border border-white/5 rounded-[2rem] text-white font-bold px-6 outline-none appearance-none cursor-pointer hover:bg-black/30 transition-all"> {SPECIALIZED_TAX_RATES.map(s => <option key={s.label} value={s.label}>{s.label} ({s.rate}%)</option>)} </select>}
            </div>
          </div>
        </div>

        {error && <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-sm font-bold text-red-400 flex items-center gap-3"> <AlertCircle size={20} /> {error} </div>}
        
        <button type="submit" id="tour-calculate" className="w-full relative group rounded-[2.5rem] p-[1px] shadow-2xl overflow-hidden active:scale-95 transition-all">
          <span className="absolute inset-0 bg-gradient-to-r from-gold-400 via-yellow-500 to-gold-600 opacity-90 group-hover:opacity-100 transition-opacity"></span>
          <div className="relative bg-[#0A1A44] rounded-[2.5rem] px-10 py-6 flex items-center justify-center gap-4 group-hover:bg-opacity-80"> 
            <span className="text-white font-bold text-xl tracking-widest uppercase font-display">
                {calcPeriod === 'annual' ? 'Run Annual Audit' : 'Run Monthly Audit'}
            </span> 
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /> 
          </div>
        </button>
      </form>
    </div>
  );
};

export default Calculator;
