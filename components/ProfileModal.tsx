import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/api';
import { X, User as UserIcon, Phone, Save, Loader2, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setPhoneNumber(user.phoneNumber || '');
      setSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await AuthService.updateProfile(user._id, {
        name,
        phoneNumber
      });
      onUpdate(updatedUser);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0B1533] rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-scale-in">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Edit Profile
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gold-400 to-yellow-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#0B1533] flex items-center justify-center">
                         <span className="text-3xl font-bold text-gray-900 dark:text-white font-display">
                            {name.charAt(0).toUpperCase()}
                         </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 ml-1">Full Name</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="block w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 ml-1">Phone Number</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                        </div>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+234..."
                            className="block w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || success}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                            success 
                            ? 'bg-green-500 text-white shadow-green-500/20' 
                            : 'bg-royal-900 dark:bg-white text-white dark:text-royal-900 shadow-royal-900/10 dark:shadow-white/10 hover:translate-y-[-2px]'
                        }`}
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : success ? (
                            <>
                                <Check size={18} /> Saved
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;