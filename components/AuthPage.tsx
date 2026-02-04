
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/api';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Phone, UserPlus, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onGuest: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onGuest }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setLoading(false);
    setPassword('');
    setConfirmPassword('');
    setShowGuestWarning(false);
    if (view === 'LOGIN') {
      setPhoneNumber('');
      setName('');
    }
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await AuthService.login(email.toLowerCase(), password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Check your email and password.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await AuthService.register({ name, email: email.toLowerCase(), phoneNumber, password });
      setSuccessMsg('Account created! Logging you in...');
      setTimeout(async () => {
         try {
           const user = await AuthService.login(email.toLowerCase(), password);
           onLogin(user);
         } catch {
           setView('LOGIN');
           setLoading(false);
         }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Could not create account. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {showGuestWarning && (
          <div className="absolute inset-0 z-50 rounded-[2.5rem] overflow-hidden bg-white/10 dark:bg-royal-900/60 backdrop-blur-3xl border border-white/20 flex flex-col items-center justify-center text-center p-8 animate-scale-in">
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-500 animate-pulse shadow-2xl">
                  <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">Continue as Guest?</h3>
              <p className="text-sm text-gray-300 mb-8 leading-relaxed font-medium">
                  Your calculation history will be <strong className="text-red-400">lost</strong> if you close this page. Create an account to save your data safely.
              </p>
              <div className="flex flex-col gap-3 w-full">
                  <button onClick={onGuest} className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-xl shadow-red-500/20 text-xs uppercase tracking-widest">
                      I'm okay with that
                  </button>
                  <button onClick={() => setShowGuestWarning(false)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-gray-400 text-xs uppercase tracking-widest">
                      I want to save my data
                  </button>
              </div>
          </div>
      )}

      <div className={`relative bg-liquid-glass-strong p-10 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden transition-all duration-700 ${showGuestWarning ? 'blur-md scale-[0.95] opacity-50' : ''}`}>
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex p-3 bg-gold-400/10 rounded-2xl text-gold-400 mb-4 animate-liquid border border-gold-400/20">
             <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            {view === 'LOGIN' && 'Log In'}
            {view === 'REGISTER' && 'Create Account'}
            {view === 'FORGOT_PASSWORD' && 'Reset Password'}
          </h2>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-[0.3em] mt-3 opacity-60">
            Secure Wealth Manager
          </p>
        </div>

        <div className="relative z-10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-xs font-bold text-red-400 animate-scale-in">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-xs font-bold text-green-400 animate-scale-in">
              <CheckCircle size={18} />
              {successMsg}
            </div>
          )}

          <form onSubmit={view === 'LOGIN' ? handleLogin : view === 'REGISTER' ? handleRegister : (e) => e.preventDefault()} className="space-y-5 animate-fade-in-up">
            {view === 'REGISTER' && (
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input type="text" placeholder="YOUR FULL NAME" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full pl-14 pr-4 py-4 bg-black/20 border border-white/5 focus:border-gold-400/40 rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all font-display font-bold text-sm tracking-widest" />
              </div>
            )}
            <div className="group relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
              </div>
              <input type="email" placeholder="EMAIL ADDRESS" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-14 pr-4 py-4 bg-black/20 border border-white/5 focus:border-gold-400/40 rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all font-display font-bold text-sm tracking-widest" />
            </div>
            {view !== 'FORGOT_PASSWORD' && (
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input type={showPassword ? "text" : "password"} placeholder="PASSWORD" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-14 pr-14 py-4 bg-black/20 border border-white/5 focus:border-gold-400/40 rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all font-display font-bold text-sm tracking-widest" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            {view === 'LOGIN' && (
              <div className="flex justify-end pr-2">
                <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] font-bold text-gray-500 hover:text-gold-400 uppercase tracking-widest transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}
            <button type="submit" disabled={loading} className="relative w-full group overflow-hidden rounded-2xl p-[1px] shadow-2xl transition-all active:scale-95 disabled:opacity-50">
              <span className="absolute inset-0 bg-gradient-to-r from-gold-400 to-yellow-600 opacity-90 group-hover:opacity-100 transition-opacity"></span>
              <div className="relative bg-royal-900 dark:bg-royal-900 rounded-2xl px-8 py-4.5 flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-80">
                {loading ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  <>
                    <span className="text-white font-bold text-xs tracking-[0.3em] uppercase font-display">
                      {view === 'LOGIN' && 'Log In'}
                      {view === 'REGISTER' && 'Sign Up'}
                      {view === 'FORGOT_PASSWORD' && 'Recover'}
                    </span>
                    <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {view === 'LOGIN' && (
             <div className="mt-4 animate-fade-in-up delay-75">
                <button type="button" onClick={() => setShowGuestWarning(true)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <UserPlus size={18} /> Use as Guest
                </button>
             </div>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            {view === 'LOGIN' ? (
              <p className="text-xs text-gray-500 font-medium">
                Don't have an account?{' '}
                <button onClick={() => setView('REGISTER')} className="font-bold text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-widest ml-1">
                  Join Now
                </button>
              </p>
            ) : (
              <button onClick={() => setView('LOGIN')} className="flex items-center justify-center gap-2 w-full text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest">
                <ArrowLeft size={16} /> Back to Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
