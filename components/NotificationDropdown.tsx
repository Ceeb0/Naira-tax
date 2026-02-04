
import React from 'react';
import { Bell, Clock, CheckCircle, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { TaxReminder } from '../types';
import { formatCurrency } from '../utils/taxLogic';

interface NotificationDropdownProps {
  reminders: TaxReminder[];
  onClose: () => void;
  onViewAll: () => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, current: boolean) => void;
  currencySymbol: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  reminders,
  onClose,
  onViewAll,
  onDelete,
  onToggleComplete,
  currencySymbol
}) => {
  const upcoming = reminders.filter(r => !r.isCompleted).slice(0, 5);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#0B1533] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-scale-in origin-top-right">
        <div className="p-5 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gold-400" />
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Quick Alerts</h4>
          </div>
          <span className="text-[10px] bg-gold-400/20 text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded-full font-bold">
            {upcoming.length} Pending
          </span>
        </div>

        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {upcoming.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Clock className="text-gray-300 dark:text-gray-600" size={24} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {upcoming.map((r) => (
                <div key={r.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onToggleComplete(r.id, r.isCompleted)}
                      className="mt-1 w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-green-500 transition-colors"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">{r.taxType}</h5>
                        <button 
                          onClick={() => onDelete(r.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={10} className="text-gray-400" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          Due: {new Date(r.dueDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {r.amount && (
                        <div className="mt-1 text-[11px] font-bold text-royal-900 dark:text-gold-400">
                          {currencySymbol}{r.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            onViewAll();
            onClose();
          }}
          className="w-full p-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-black/20 hover:text-gold-500 dark:hover:text-gold-400 border-t border-gray-50 dark:border-white/5 transition-colors flex items-center justify-center gap-2"
        >
          Manage All Reminders <ExternalLink size={14} />
        </button>
      </div>
    </>
  );
};

export default NotificationDropdown;
