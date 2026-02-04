
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Plus, Trash2, CheckCircle, Clock, Info, ChevronLeft, Search, CalendarDays, MoreVertical, X, Sparkles } from 'lucide-react';
import { TaxReminder } from '../types';
import { ReminderService } from '../services/api';
import ReminderFormSection from './ReminderFormSection';

interface RemindersPageProps {
  userId: string;
  onBack: () => void;
  currencySymbol: string;
}

const RemindersPage: React.FC<RemindersPageProps> = ({ userId, onBack, currencySymbol }) => {
  const [reminders, setReminders] = useState<TaxReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const smartSectionRef = useRef<HTMLDivElement>(null);

  const [taxType, setTaxType] = useState('PAYE Tax');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const taxTypes = [
    'PAYE Tax', 'VAT (Sales Tax)', 'WHT (Rent)', 'WHT (Contract)', 'CIT (Company)', 'Capital Gains Tax', 'Development Levy', 'Stamp Duty'
  ];

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await ReminderService.getReminders(userId);
      setReminders(data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredReminders = reminders.filter(r => {
    const matchesSearch = r.taxType.toLowerCase().includes(search.toLowerCase()) || 
                          (r.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && !r.isCompleted) || 
                         (filter === 'completed' && r.isCompleted);
    return matchesSearch && matchesFilter;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;
    
    try {
      await ReminderService.addReminder({
        userId,
        taxType,
        dueDate: new Date(dueDate).toISOString(),
        amount: amount ? parseFloat(amount.replace(/,/g, '')) : undefined,
        notes,
        isCompleted: false
      });
      setShowAdd(false);
      resetForm();
      loadReminders();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setTaxType('PAYE Tax');
    setDueDate('');
    setAmount('');
    setNotes('');
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    await ReminderService.toggleComplete(id, !currentStatus);
    loadReminders();
  };

  const deleteReminder = async (id: string) => {
    await ReminderService.deleteReminder(id);
    loadReminders();
  };

  const scrollToSmartAlert = () => {
    smartSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-gold-500 uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
          >
            <ChevronLeft size={16} /> Back to Home
          </button>
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Tax <span className="text-gold-500">Alerts</span>
            <div className="p-2 bg-gold-400/10 rounded-xl">
              <Bell className="text-gold-400" size={24} />
            </div>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Keep track of when you need to pay your taxes.</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-gray-100 dark:bg-white/5 rounded-2xl p-1 border border-gray-200 dark:border-white/10">
                {(['all', 'pending', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-royal-700 text-royal-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        {f === 'pending' ? 'To Pay' : f}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
              <button 
                  onClick={scrollToSmartAlert}
                  className="flex items-center gap-2 px-6 py-3 bg-gold-400 text-black rounded-2xl font-bold shadow-xl shadow-gold-400/20 hover:-translate-y-1 transition-all"
              >
                  <Sparkles size={18} /> Smart Alert
              </button>
              <button 
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-royal-900 dark:bg-white text-white dark:text-royal-900 rounded-2xl font-bold shadow-xl shadow-royal-900/20 dark:shadow-white/10 hover:-translate-y-1 transition-all border border-white/10"
              >
                  <Plus size={18} /> Custom
              </button>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-6">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Find an alert..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] pl-14 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 font-medium shadow-sm"
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-white/5 rounded-3xl animate-pulse"></div>
                    ))
                ) : filteredReminders.length === 0 ? (
                    <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 p-16 text-center space-y-4 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-full flex items-center justify-center mx-auto text-gray-300 dark:text-gray-700">
                            <CalendarDays size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No alerts found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">You haven't added any tax payment alerts yet.</p>
                        </div>
                        <button onClick={() => {setSearch(''); setFilter('all');}} className="text-gold-500 font-bold text-xs uppercase tracking-widest hover:underline">Show everything</button>
                    </div>
                ) : (
                    filteredReminders.map((r) => (
                        <div 
                            key={r.id} 
                            className={`group relative bg-white dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 shadow-sm hover:shadow-xl transition-all ${r.isCompleted ? 'opacity-60' : ''}`}
                        >
                            <button 
                                onClick={() => toggleComplete(r.id, r.isCompleted)}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${r.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-50 dark:bg-black/20 text-gray-400 hover:text-gold-500 hover:bg-gold-50'}`}
                            >
                                <CheckCircle size={28} />
                            </button>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h4 className={`text-xl font-bold font-display ${r.isCompleted ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                        {r.taxType}
                                    </h4>
                                    {!r.isCompleted && new Date(r.dueDate) < new Date() && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Overdue</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Clock size={14} className="text-gold-400" />
                                        Due: {new Date(r.dueDate).toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    {r.amount && (
                                        <span className="flex items-center gap-1.5 font-bold text-royal-900 dark:text-white">
                                            {currencySymbol}{r.amount.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {r.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-1">{r.notes}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => deleteReminder(r.id)}
                                    className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="lg:col-span-4 space-y-8 sticky top-24">
            <ReminderFormSection 
              userId={userId} 
              currencySymbol={currencySymbol} 
              onReminderAdded={loadReminders} 
              sectionRef={smartSectionRef} 
            />

            <div className="bg-royal-900 dark:bg-white rounded-[2.5rem] p-8 text-white dark:text-royal-900 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Bell size={200} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 relative z-10">Your Stats</h3>
                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center py-3 border-b border-white/10 dark:border-royal-900/10">
                        <span className="text-sm font-medium opacity-70">Paid</span>
                        <span className="font-bold">{reminders.filter(r => r.isCompleted).length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10 dark:border-royal-900/10">
                        <span className="text-sm font-medium opacity-70">To Pay</span>
                        <span className="font-bold">{reminders.filter(r => !r.isCompleted).length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-medium opacity-70">Total to Pay</span>
                        <span className="font-bold">{currencySymbol}{reminders.filter(r => !r.isCompleted).reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] p-8 border border-amber-100 dark:border-amber-500/20 space-y-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl w-fit text-amber-600">
                    <Info size={24} />
                </div>
                <h4 className="font-bold text-amber-900 dark:text-amber-100">Simple Tip</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                    Try to pay your tax by the <strong>7th of every month</strong> so you don't miss the 10th deadline.
                </p>
            </div>
        </div>
      </div>

      {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAdd(false)}></div>
              <div className="relative w-full max-w-md bg-white dark:bg-[#0B1533] rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">New Custom Alert</h3>
                    <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleAdd} className="p-8 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Type of Tax</label>
                        <select 
                            value={taxType}
                            onChange={(e) => setTaxType(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-4 text-sm font-medium"
                        >
                            {taxTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">When is it due?</label>
                        <input 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-4 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Amount to pay</label>
                        <input 
                            type="text"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-4 text-sm"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-5 bg-royal-900 text-white dark:bg-white dark:text-royal-900 font-bold rounded-2xl shadow-xl shadow-royal-900/20 transition-all uppercase tracking-widest text-xs"
                      >
                        Save Alert
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default RemindersPage;
