
import React from 'react';
import { SavedCalculation } from '../types';
import { formatCurrency } from '../utils/taxLogic';
import { History, Calendar, ExternalLink, Trash2, ArrowUpRight } from 'lucide-react';

interface HistoryListProps {
  history: SavedCalculation[];
  onSelect: (calc: SavedCalculation) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  currency: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onDelete, onClear, currency }) => {
  if (history.length === 0) {
    return (
      <div className="p-8 rounded-[2rem] bg-black/10 dark:bg-white/5 border border-white/5 text-center space-y-3">
        <History size={32} className="mx-auto text-gray-500 opacity-50" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">No recent calculations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <History size={12} className="text-gold-400" />
          Recent Sessions
        </h4>
        <button onClick={onClear} className="text-[9px] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest transition-colors">
          Purge
        </button>
      </div>
      
      <div className="space-y-3">
        {history.map((calc, index) => (
          <div 
            key={calc.id} 
            className="group relative bg-black/10 dark:bg-white/5 border border-white/5 rounded-[2rem] p-5 hover:border-gold-400/30 transition-all animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  <Calendar size={10} className="text-blue-400" />
                  {new Date(calc.timestamp).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {calc.result.period} Analysis
                </h5>
                <div className="text-xs font-display font-bold text-gold-500">
                  {formatCurrency(calc.result.finalBalance, currency)} Net
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => onSelect(calc)}
                  className="p-2.5 rounded-xl bg-gold-400 text-black shadow-lg shadow-gold-400/10 hover:scale-110 active:scale-95 transition-all"
                  title="View Details"
                >
                  <ArrowUpRight size={14} />
                </button>
                <button 
                  onClick={() => onDelete(calc.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
