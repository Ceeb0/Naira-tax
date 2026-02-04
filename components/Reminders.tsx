
import React, { useState, useEffect } from 'react';
import { TaxReminder } from '../types';
import { ReminderService } from '../services/api';
import { Bell, Calendar, Plus, Trash2, CheckCircle, X, Clock, AlertCircle, Info } from 'lucide-react';

interface RemindersProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

const Reminders: React.FC<RemindersProps> = ({ userId, isOpen, onClose, currencySymbol }) => {
  const [reminders, setReminders] = useState<TaxReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [taxType, setTaxType] = useState('PAYE Tax');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const taxTypes = [
    'PAYE Tax', 'VAT (Sales Tax)', 'WHT (Rent)', 'WHT (Contract)', 'CIT (Company)', 'Capital Gains Tax', 'Development Levy', 'Stamp Duty'
  ];

  useEffect(() => {
    if (isOpen) {
      loadReminders();
    }
  }, [isOpen, userId]);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) {
      setError('Please select a due date');
      return;
    }
    setError('');
    
    try {
      await ReminderService.addReminder({
        userId,
        taxType,
        dueDate,
        amount: amount ? parseFloat(amount.replace(/,/g, '')) : undefined,
        notes,
        isCompleted: false
      });
      setShowAdd(false);
      resetForm();
      loadReminders();
    } catch (e) {
      setError('Failed to save reminder');
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

  const getStatusColor = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return 'text-green-500';
    const now = new Date();
    const due = new Date(dueDate);
    const diff = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return 'text-red-500';
    if (diff < 7) return 'text-orange-500';
    return 'text-blue-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1533] rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <Bell className="text-gold-400" size={24} />
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Tax Reminders</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!showAdd ? (
            <div className="space-y-4">
              <button 
                onClick={() => setShowAdd(true)}
                className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:border-gold-400 hover:text-gold-500 transition-all"
              >
                <Plus size={20} /> Add New Reminder
              </button>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-gold-400/30 border-t-gold-400 rounded-full animate-spin"></div>
                </div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Clock className="mx-auto text-gray-300 dark:text-gray-600" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">No scheduled tax payments yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((r) => (
                    <div key={r.id} className={`p-4 rounded-2xl border ${r.isCompleted ? 'bg-gray-50 dark:bg-white/5 border-transparent opacity-60' : 'bg-white dark:bg-[#0E1B40] border-gray-100 dark:border-white/5'} flex items-center gap-4 group transition-all`}>
                      <button 
                        onClick={() => toggleComplete(r.id, r.isCompleted)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${r.isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gold-400'}`}
                      >
                        <CheckCircle size={20} fill={r.isCompleted ? "currentColor" : "none"} />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-sm ${r.isCompleted ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {r.taxType}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase ${getStatusColor(r.dueDate, r.isCompleted)}`}>
                            {r.isCompleted ? 'Paid' : new Date(r.dueDate) < new Date() ? 'Overdue' : 'Upcoming'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(r.dueDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {r.amount && <span>{currencySymbol}{r.amount.toLocaleString()}</span>}
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteReminder(r.id)}
                        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleAdd} className="space-y-5 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                 <button type="button" onClick={() => setShowAdd(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Back to list</button>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">Tax Type</label>
                <select 
                  value={taxType} 
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gold-400"
                >
                  {taxTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-400 ml-1">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gold-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-400 ml-1">Amount (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">Additional Notes</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment reference or instructions..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gold-400 resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}

              <button type="submit" className="w-full py-4 bg-gold-400 hover:bg-gold-500 text-black font-bold rounded-xl shadow-lg shadow-gold-400/20 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> Set Reminder
              </button>
            </form>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex gap-3">
             <Info className="text-blue-500 flex-shrink-0" size={18} />
             <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                Nigerian tax payments are typically due by the 10th of the following month for PAYE, and 21st for VAT. Staying compliant avoids hefty penalties.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
