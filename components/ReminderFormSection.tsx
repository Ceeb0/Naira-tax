
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, ShieldCheck, Zap, Loader2, Check, Sparkles, Info } from 'lucide-react';
import { ReminderService } from '../services/api';

interface ReminderFormSectionProps {
  userId: string;
  currencySymbol: string;
  onReminderAdded: () => void;
  sectionRef: React.RefObject<HTMLDivElement>;
  suggestedAmount?: number;
}

const ReminderFormSection: React.FC<ReminderFormSectionProps> = ({ 
  userId, 
  currencySymbol, 
  onReminderAdded, 
  sectionRef,
  suggestedAmount 
}) => {
  const [taxType, setTaxType] = useState('PAYE Tax');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const taxTypes = [
    'PAYE Tax', 'VAT (Sales Tax)', 'WHT (Rent)', 'Contract Payment', 'CIT (Company)', 'Stamp Duty'
  ];

  useEffect(() => {
    if (suggestedAmount && suggestedAmount > 0) {
      setAmount(formatAmount(suggestedAmount.toString()));
    }
  }, [suggestedAmount]);

  const handleSmartSchedule = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Default Nigerian PAYE deadline is the 10th
    let deadlineDay = 10;
    if (taxType.includes('VAT')) deadlineDay = 21;
    
    nextMonth.setDate(deadlineDay);
    setDate(nextMonth.toISOString().split('T')[0]);
    setTime('09:00');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    setLoading(true);
    try {
      const dueDateTime = new Date(`${date}T${time}`).toISOString();
      
      await ReminderService.addReminder({
        userId,
        taxType,
        dueDate: dueDateTime,
        amount: amount ? parseFloat(amount.replace(/,/g, '')) : undefined,
        isCompleted: false,
        notes: `Smart scheduled payment for ${taxType}.`
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setDate('');
        setTime('09:00');
      }, 3000);
      onReminderAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${integer}.${parts[1].slice(0, 2)}` : integer;
  };

  return (
    <div 
      ref={sectionRef} 
      className="w-full max-w-lg mt-8 scroll-mt-24 animate-fade-in-up"
    >
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-yellow-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
        
        <div className="relative bg-white dark:bg-[#0B1533] rounded-[2.5rem] border border-gray-100 dark:border-white/10 p-8 shadow-2xl overflow-hidden">
          {/* Decorative Sparkles */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles size={100} className="text-gold-400" />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold-400/10 rounded-2xl">
                <Bell className="text-gold-400 animate-float" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Smart Tax Alert</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Proactive compliance management.</p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={handleSmartSchedule}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold-400/10 text-gold-500 hover:bg-gold-400 hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest border border-gold-400/20"
            >
              <Sparkles size={12} className="group-hover:animate-spin" /> 
              Auto-Set Date
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Tax Category</label>
              <select 
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-4 text-sm text-gray-900 dark:text-white outline-none focus:border-gold-400 transition-all cursor-pointer font-medium"
              >
                {taxTypes.map(t => <option key={t} value={t} className="dark:bg-royal-900">{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Projected Amount</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">{currencySymbol}</span>
                 <input 
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(formatAmount(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl pl-10 pr-4 py-4 text-lg text-gray-900 dark:text-white outline-none focus:border-gold-400 transition-all font-display font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Deadline Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date"
                    value={date}
                    required
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-900 dark:text-white outline-none focus:border-gold-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Alert Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="time"
                    value={time}
                    required
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-900 dark:text-white outline-none focus:border-gold-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || success}
              className={`w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${
                success 
                ? 'bg-green-500 text-white shadow-green-500/20' 
                : 'bg-royal-900 dark:bg-white text-white dark:text-royal-900 shadow-royal-900/20 dark:shadow-white/10 hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : success ? (
                <>
                  <Check size={20} /> Success
                </>
              ) : (
                <>
                  <Zap size={20} className="text-gold-400" />
                  Activate Smart Alert
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-3 p-4 bg-amber-50 dark:bg-white/5 rounded-2xl border border-dashed border-amber-200 dark:border-white/10">
            <Info className="text-amber-500 shrink-0" size={18} />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed uppercase font-bold tracking-wider">
              Smart Alerts automatically detect standard FIRS/LIRS deadlines based on your selected tax category.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderFormSection;
