import React, { useState, useEffect, useMemo } from 'react';
import { FinancialInput, IncomeSource, Expense, CustomCategory, MonthlyInput } from '../types';
import { COMMON_EXPENSES, NIGERIAN_BANKS } from '../utils/taxLogic';
import { ArrowRight, Settings2, Plus, Trash2, ShieldCheck, AlertCircle, Calendar, Check, Copy, User, ChevronDown, ChevronUp, Landmark, FileText, HelpCircle, X, Upload, File, EyeOff, Eye } from 'lucide-react';
import { Percent } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (data: MonthlyInput[], customTaxRate?: number) => void;
  customCategories?: CustomCategory[];
  currencySymbol: string;
}

interface RowItem {
  id: string;
  text: string;
  amount: string;
  isTaxDeductible?: boolean;
  bank?: string;
  date?: string;
  receiptRef?: string;
  receiptType?: 'text' | 'file';
  receiptFileName?: string;
  isExpanded?: boolean;
}

interface MonthData {
    incomeRows: RowItem[];
    expenseRows: RowItem[];
}

const MONTHS_LIST = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DEFAULT_INCOME = [{ id: '1', text: 'Base Salary', amount: '', isExpanded: false, receiptType: 'text' as const }];

const Tooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1.5 z-50">
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

const Calculator: React.FC<CalculatorProps> = ({ onCalculate, customCategories = [], currencySymbol }) => {
  // State: Map of Month Name -> Data
  const currentMonthName = useMemo(() => MONTHS_LIST[new Date().getMonth()], []);
  
  const [dataMap, setDataMap] = useState<Record<string, MonthData>>({
      [currentMonthName]: { incomeRows: [...DEFAULT_INCOME], expenseRows: [] }
  });

  const [selectedMonths, setSelectedMonths] = useState<string[]>([currentMonthName]);
  const [activeTab, setActiveTab] = useState<string>(currentMonthName);
  
  // Section Collapsibility
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
      income: false,
      expense: false
  });

  const [error, setError] = useState<string>('');
  const [isFlatRate, setIsFlatRate] = useState(false); 
  const [taxRate, setTaxRate] = useState<string>('7.5');

  // Helpers
  const allCategories = useMemo(() => [...COMMON_EXPENSES, ...customCategories], [customCategories]);

  const formatNumber = (val: string) => {
    let clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join(''); 
    const [integer, decimal] = clean.split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return clean.includes('.') ? formattedInteger + '.' + (decimal || '') : formattedInteger;
  };

  // --- Month Management ---

  const toggleMonth = (month: string) => {
      if (selectedMonths.includes(month)) {
          // REMOVE
          if (selectedMonths.length === 1) return; // Prevent empty
          
          const newMonths = selectedMonths.filter(m => m !== month);
          setSelectedMonths(newMonths);
          
          if (activeTab === month) {
              setActiveTab(newMonths[0]);
          }
          
          const newDataMap = { ...dataMap };
          delete newDataMap[month];
          setDataMap(newDataMap);

      } else {
          // ADD
          const newMonths = [...selectedMonths, month].sort((a, b) => 
            MONTHS_LIST.indexOf(a) - MONTHS_LIST.indexOf(b)
          );
          setSelectedMonths(newMonths);
          
          const sourceData = dataMap[activeTab];
          
          const newIncomeRows = sourceData.incomeRows.map(r => ({ ...r, id: Date.now().toString() + Math.random(), isExpanded: false }));
          const newExpenseRows = sourceData.expenseRows.map(r => ({ ...r, id: Date.now().toString() + Math.random(), isExpanded: false }));
          
          setDataMap(prev => ({
              ...prev,
              [month]: {
                  incomeRows: newIncomeRows,
                  expenseRows: newExpenseRows
              }
          }));

          setActiveTab(month);
      }
  };

  const selectAllMonths = () => {
      if (selectedMonths.length === 12) {
          // Reset
          setSelectedMonths([currentMonthName]);
          setActiveTab(currentMonthName);
          setDataMap({
              [currentMonthName]: dataMap[currentMonthName] || { incomeRows: [...DEFAULT_INCOME], expenseRows: [] }
          });
      } else {
          // Add All
          const sourceData = dataMap[activeTab];
          const newDataMap = { ...dataMap };
          
          MONTHS_LIST.forEach(m => {
              if (!newDataMap[m]) {
                 newDataMap[m] = {
                     incomeRows: sourceData.incomeRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false })),
                     expenseRows: sourceData.expenseRows.map(r => ({ ...r, id: Math.random().toString(), isExpanded: false }))
                 };
              }
          });
          
          setSelectedMonths([...MONTHS_LIST]);
          setDataMap(newDataMap);
      }
  };

  // --- Row Manipulation ---

  const getActiveData = () => dataMap[activeTab];

  const updateActiveData = (updates: Partial<MonthData>) => {
      setDataMap(prev => ({
          ...prev,
          [activeTab]: { ...prev[activeTab], ...updates }
      }));
  };

  const updateRow = (
    type: 'income' | 'expense', 
    id: string, 
    field: keyof RowItem, 
    value: any
  ) => {
      const current = getActiveData();
      const listKey = type === 'income' ? 'incomeRows' : 'expenseRows';
      const list = current[listKey];

      const newRows = list.map(row => {
          if (row.id !== id) return row;
          
          if (field === 'amount') return { ...row, amount: formatNumber(value) };
          if (field === 'text' && type === 'expense') {
            const match = allCategories.find(c => c.label.toLowerCase() === value.toLowerCase());
            return { 
              ...row, 
              text: value, 
              isTaxDeductible: match ? match.isTaxDeductible : row.isTaxDeductible 
            };
          }
          return { ...row, [field]: value };
      });

      updateActiveData({ [listKey]: newRows });
  };

  const toggleRowExpansion = (type: 'income' | 'expense', id: string) => {
      const current = getActiveData();
      const listKey = type === 'income' ? 'incomeRows' : 'expenseRows';
      const list = current[listKey];
      
      const newRows = list.map(row => 
         row.id === id ? { ...row, isExpanded: !row.isExpanded } : row
      );
      updateActiveData({ [listKey]: newRows });
  };

  const handleFileUpload = (type: 'income' | 'expense', id: string, file: File | null) => {
     if (file) {
         updateRow(type, id, 'receiptFileName', file.name);
         // In a real app, you would upload here. We just simulate by storing name.
         updateRow(type, id, 'receiptRef', `FILE: ${file.name}`);
     } else {
         updateRow(type, id, 'receiptFileName', '');
         updateRow(type, id, 'receiptRef', '');
     }
  };

  // --- Add/Remove ---

  const addIncomeRow = () => {
      const current = getActiveData();
      updateActiveData({
          incomeRows: [...current.incomeRows, { id: Date.now().toString(), text: '', amount: '', isExpanded: true, receiptType: 'text' }]
      });
      setSectionsCollapsed(prev => ({ ...prev, income: false }));
  };

  const removeIncomeRow = (id: string) => {
      const current = getActiveData();
      if (current.incomeRows.length === 1) return;
      updateActiveData({
          incomeRows: current.incomeRows.filter(r => r.id !== id)
      });
  };

  const addExpenseRow = () => {
      const current = getActiveData();
      updateActiveData({
          expenseRows: [...current.expenseRows, { id: Date.now().toString(), text: '', amount: '', isTaxDeductible: false, isExpanded: true, receiptType: 'text' }]
      });
      setSectionsCollapsed(prev => ({ ...prev, expense: false }));
  };

  const removeExpenseRow = (id: string) => {
      const current = getActiveData();
      updateActiveData({
          expenseRows: current.expenseRows.filter(r => r.id !== id)
      });
  };


  // --- Submit ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedMonths.length === 0) {
        setError('Please select at least one month.');
        return;
    }

    const payload: MonthlyInput[] = [];
    let hasGlobalError = false;

    for (const month of selectedMonths) {
        const data = dataMap[month];
        const sources: IncomeSource[] = [];
        const expenses: Expense[] = [];
        let totalIncome = 0;

        for (const row of data.incomeRows) {
            const val = parseFloat(row.amount.replace(/,/g, '')) || 0;
            if (val > 0) {
                sources.push({ 
                    id: row.id, 
                    description: row.text || 'Income', 
                    amount: val,
                    bank: row.bank,
                    date: row.date,
                    receiptRef: row.receiptRef
                });
                totalIncome += val;
            }
        }

        for (const row of data.expenseRows) {
            const val = parseFloat(row.amount.replace(/,/g, '')) || 0;
            if (val > 0) {
                expenses.push({ 
                    id: row.id, 
                    category: row.text || 'Expense', 
                    amount: val, 
                    isTaxDeductible: !!row.isTaxDeductible,
                    bank: row.bank,
                    date: row.date,
                    receiptRef: row.receiptRef
                });
            }
        }

        if (sources.length === 0 || totalIncome <= 0) {
            setError(`Please enter valid income for ${month}.`);
            setActiveTab(month); 
            hasGlobalError = true;
            break;
        }

        payload.push({
            month,
            incomeSources: sources,
            expenses
        });
    }

    if (hasGlobalError) return;

    const rateVal = isFlatRate ? parseFloat(taxRate) : undefined;
    onCalculate(payload, rateVal);
  };

  const activeRows = getActiveData();

  // --- Render Single Row ---
  const renderRow = (row: RowItem, type: 'income' | 'expense', index: number) => {
      const isIncome = type === 'income';
      const placeholder = isIncome ? 'e.g. Salary' : 'Category';
      const hasDetails = row.date || row.bank || row.receiptRef;
      
      return (
        <div key={row.id} className="group animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex gap-1.5">
                <div className="flex-1 bg-white dark:bg-black/20 rounded-xl border-2 border-transparent focus-within:border-gold-400/30 transition-all p-1 flex flex-col shadow-sm">
                    {/* Top Row: Main Inputs */}
                    <div className="flex items-center">
                        <div className="flex-[2] border-r border-gray-100 dark:border-white/10 pr-2">
                            {isIncome ? (
                                <input
                                    type="text"
                                    value={row.text}
                                    onChange={(e) => updateRow(type, row.id, 'text', e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none font-medium"
                                />
                            ) : (
                                <>
                                    <input
                                        list={`expenses-${row.id}`}
                                        value={row.text}
                                        onChange={(e) => updateRow(type, row.id, 'text', e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none font-medium"
                                    />
                                    <datalist id={`expenses-${row.id}`}>
                                        {allCategories.map(ex => <option key={ex.label} value={ex.label} />)}
                                    </datalist>
                                </>
                            )}
                        </div>
                        <div className="flex-[3] pl-2 relative flex items-center">
                            <span className="absolute left-3 text-gray-400 font-bold pointer-events-none select-none">{currencySymbol}</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={row.amount}
                                onChange={(e) => updateRow(type, row.id, 'amount', e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent pl-7 pr-3 py-2.5 text-right text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-display font-semibold"
                            />
                        </div>
                        {/* Expand Toggle */}
                        <button 
                            type="button"
                            onClick={() => toggleRowExpansion(type, row.id)}
                            className={`p-2 mx-1 rounded-lg transition-colors flex items-center justify-center ${
                                row.isExpanded 
                                ? 'bg-gray-100 dark:bg-white/10 text-royal-900 dark:text-white' 
                                : hasDetails 
                                    ? 'text-gold-500 bg-gold-50 dark:bg-gold-900/10' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                            title="Add Details (Date, Bank, Receipt)"
                        >
                            {row.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>

                    {/* Expanded Details Section */}
                    {row.isExpanded && (
                        <div className="border-t border-gray-100 dark:border-white/5 mt-1 pt-3 px-1 pb-2 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up">
                             {/* Date */}
                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400 pl-2">Date</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-400 pointer-events-none"><Calendar size={12}/></span>
                                    <input 
                                        type="date" 
                                        value={row.date || ''}
                                        onChange={(e) => updateRow(type, row.id, 'date', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg py-1.5 pl-7 pr-2 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold-400"
                                    />
                                </div>
                             </div>
                             
                             {/* Bank Select/Type */}
                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400 pl-2">Bank</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-400 pointer-events-none"><Landmark size={12}/></span>
                                    <input 
                                        list="bank-list"
                                        placeholder="Select Bank"
                                        value={row.bank || ''}
                                        onChange={(e) => updateRow(type, row.id, 'bank', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg py-1.5 pl-7 pr-2 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold-400 placeholder-gray-400"
                                    />
                                </div>
                             </div>

                             {/* Receipt Ref (Text OR Upload) */}
                             <div className="space-y-1">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Receipt</label>
                                    <div className="flex gap-1">
                                        <button 
                                            type="button"
                                            onClick={() => updateRow(type, row.id, 'receiptType', 'text')}
                                            className={`p-0.5 rounded ${!row.receiptType || row.receiptType === 'text' ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="Text Input"
                                        >
                                            <FileText size={10} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => updateRow(type, row.id, 'receiptType', 'file')}
                                            className={`p-0.5 rounded ${row.receiptType === 'file' ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="Upload File"
                                        >
                                            <Upload size={10} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    {row.receiptType === 'file' ? (
                                        <div className="relative w-full">
                                            <input 
                                                type="file" 
                                                id={`file-${row.id}`}
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(type, row.id, e.target.files?.[0] || null)}
                                            />
                                            <label 
                                                htmlFor={`file-${row.id}`} 
                                                className="w-full cursor-pointer bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg py-1.5 px-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 hover:border-gold-400 transition-colors truncate"
                                            >
                                                <File size={12} className="flex-shrink-0" />
                                                <span className="truncate">{row.receiptFileName || 'Upload Receipt...'}</span>
                                            </label>
                                            {row.receiptFileName && (
                                                <button 
                                                    onClick={() => handleFileUpload(type, row.id, null)}
                                                    className="absolute right-1 top-1.5 text-gray-400 hover:text-red-500"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <span className="absolute left-2 top-2 text-gray-400 pointer-events-none"><FileText size={12}/></span>
                                            <input 
                                                type="text" 
                                                placeholder="Ref ID / Note"
                                                value={row.receiptRef?.replace('FILE: ', '') || ''}
                                                onChange={(e) => updateRow(type, row.id, 'receiptRef', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg py-1.5 pl-7 pr-2 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold-400 placeholder-gray-400"
                                            />
                                        </>
                                    )}
                                </div>
                             </div>
                        </div>
                    )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-col w-8 flex-shrink-0">
                    {(type === 'income' ? activeRows.incomeRows.length > 1 : true) && (
                         <button
                         type="button"
                         onClick={() => type === 'income' ? removeIncomeRow(row.id) : removeExpenseRow(row.id)}
                         className="w-full h-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all flex items-center justify-center"
                         title="Remove Row"
                       >
                         <Trash2 size={16} />
                       </button>
                    )}
                </div>
            </div>
            
            {/* Tax Deductible Toggle for Expenses */}
            {!isIncome && (
                 <div className="flex items-center gap-2 pl-1 mt-1">
                    <button
                      type="button"
                      onClick={() => updateRow(type, row.id, 'isTaxDeductible', !row.isTaxDeductible)}
                      className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded-md border transition-all ${row.isTaxDeductible ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                    >
                      <ShieldCheck size={12} />
                      {row.isTaxDeductible ? 'Tax Exempt' : 'Mark as Tax Exempt'}
                    </button>
                    <Tooltip text="Items like NHF, NHIS, and Life Assurance are tax-deductible. Mark them to reduce your taxable income." />
                 </div>
            )}
        </div>
      );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Global Datalist for Banks */}
      <datalist id="bank-list">
          {NIGERIAN_BANKS.map(bank => <option key={bank} value={bank} />)}
      </datalist>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Month Selection Grid */}
        <div id="tour-months" className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <Calendar size={14} /> Select Months ({selectedMonths.length})
                </label>
                <button 
                    type="button" 
                    onClick={selectAllMonths}
                    className="text-[10px] font-bold text-gold-500 hover:text-gold-400 uppercase tracking-wide"
                >
                    {selectedMonths.length === 12 ? 'Reset' : 'Select All'}
                </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {MONTHS_LIST.map((month) => {
                    const isSelected = selectedMonths.includes(month);
                    return (
                        <button
                            key={month}
                            type="button"
                            onClick={() => toggleMonth(month)}
                            className={`
                                relative h-10 rounded-xl text-xs font-bold transition-all duration-200 border
                                flex items-center justify-center
                                ${isSelected 
                                    ? 'bg-royal-900 dark:bg-white text-white dark:text-royal-900 border-royal-900 dark:border-white shadow-md transform scale-105' 
                                    : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gold-400 dark:hover:border-gold-400 hover:text-gold-500'
                                }
                            `}
                        >
                            {month}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full flex items-center justify-center">
                                    <Check size={8} className="text-black" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Tab Strip */}
        {selectedMonths.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {selectedMonths.map(month => (
                    <button
                        key={`tab-${month}`}
                        type="button"
                        onClick={() => setActiveTab(month)}
                        className={`
                            px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                            ${activeTab === month
                                ? 'bg-gold-400 text-royal-900 border-gold-400 shadow-sm'
                                : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                            }
                        `}
                    >
                        {month} Data
                    </button>
                ))}
            </div>
        )}

        {/* --- Income Section --- */}
        <div id="tour-income" className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-white/40 dark:border-white/5 transition-all">
          <div 
             className="flex items-center justify-between px-1 mb-3 cursor-pointer"
             onClick={() => setSectionsCollapsed(prev => ({...prev, income: !prev.income}))}
          >
             <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    Earnings for <span className="text-royal-900 dark:text-white underline decoration-gold-400 decoration-2">{activeTab}</span>
                    {sectionsCollapsed.income ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
                </label>
             </div>
             {!sectionsCollapsed.income && (
                 <button
                 type="button"
                 onClick={(e) => { e.stopPropagation(); addIncomeRow(); }}
                 className="text-xs flex items-center gap-1 font-medium text-gold-500 hover:text-gold-400 transition-colors"
               >
                 <Plus size={14} /> Add Row
               </button>
             )}
          </div>

          {!sectionsCollapsed.income && (
              <div className="space-y-3 animate-fade-in-up">
                {activeRows.incomeRows.map((row, index) => renderRow(row, 'income', index))}
              </div>
          )}
          {sectionsCollapsed.income && (
               <div className="text-xs text-gray-400 px-1 italic">
                   {activeRows.incomeRows.length} income source(s) hidden. Click header to expand.
               </div>
          )}
        </div>

        {/* --- Expenses Section --- */}
        <div id="tour-expenses" className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-white/40 dark:border-white/5 transition-all">
          <div 
            className="flex items-center justify-between px-1 mb-3 cursor-pointer"
            onClick={() => setSectionsCollapsed(prev => ({...prev, expense: !prev.expense}))}
          >
             <div className="flex items-center gap-2">
               <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  Expenses for <span className="text-royal-900 dark:text-white underline decoration-gold-400 decoration-2">{activeTab}</span>
                  {sectionsCollapsed.expense ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
               </label>
             </div>
             {!sectionsCollapsed.expense && (
                 <button
                 type="button"
                 onClick={(e) => { e.stopPropagation(); addExpenseRow(); }}
                 className="text-xs flex items-center gap-1 font-medium text-gold-500 hover:text-gold-400 transition-colors"
               >
                 <Plus size={14} /> Add Row
               </button>
             )}
          </div>
          
          {!sectionsCollapsed.expense && (
              <div className="space-y-3 animate-fade-in-up">
                 {activeRows.expenseRows.length === 0 && (
                   <div className="p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-center">
                     <p className="text-xs text-gray-400">No expenses added for {activeTab}.</p>
                   </div>
                 )}
                 {activeRows.expenseRows.map((row, index) => renderRow(row, 'expense', index))}
              </div>
          )}
          {sectionsCollapsed.expense && (
               <div className="text-xs text-gray-400 px-1 italic">
                   {activeRows.expenseRows.length} expense item(s) hidden. Click header to expand.
               </div>
          )}
        </div>

        {/* --- Advanced Settings --- */}
        <div id="tour-settings" className="pt-2 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-3 mt-4">
             <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <Settings2 size={14} />
                    Tax Calculation Mode
                </label>
                <Tooltip text="Switch between the standard Statutory deduction method (PITA) or a simple Flat Rate percentage." />
             </div>
             
             <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-0.5 border border-gray-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsFlatRate(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!isFlatRate ? 'bg-white dark:bg-royal-700 text-royal-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Statutory
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlatRate(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${isFlatRate ? 'bg-white dark:bg-gold-400 text-royal-900 dark:text-black shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Flat Rate
                </button>
             </div>
          </div>

          {isFlatRate && (
            <div className="group relative animate-scale-in">
              <div className="relative transform transition-all duration-300 group-focus-within:-translate-y-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Percent className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="7.5"
                  step="0.1"
                  className="block w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-gold-400/50 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gold-400/10 transition-all font-display text-lg shadow-inner"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm font-bold tracking-widest">%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-sm font-medium animate-pulse border border-red-200 dark:border-red-800/50">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          id="tour-calculate"
          type="submit"
          className="relative w-full group overflow-hidden rounded-2xl p-[1px] shadow-xl shadow-gold-400/10 hover:shadow-gold-400/20 transition-all duration-300 transform hover:-translate-y-1"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gold-400 via-yellow-500 to-gold-600 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-fast"></span>
          <div className="relative bg-royal-900 dark:bg-[#0A1A44] rounded-2xl px-6 py-4 flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-90">
             <span className="text-white font-bold text-lg tracking-wide uppercase font-display">Calculate</span>
             <div className="bg-white/10 p-1 rounded-full group-hover:bg-gold-400 group-hover:text-black transition-colors">
               <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
             </div>
          </div>
        </button>
      </form>
    </div>
  );
};

export default Calculator;