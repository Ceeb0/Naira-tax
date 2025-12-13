import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/api';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Phone, UserPlus, AlertTriangle } from 'lucide-react';

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

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clear errors/states on view change
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
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- Validation ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (phoneNumber.length < 10 || !/^\d+$/.test(phoneNumber.replace(/[-+ ]/g, ''))) {
      setError("Please enter a valid phone number.");
      return;
    }
    // ------------------

    setLoading(true);

    try {
      // Register via Service
      await AuthService.register({
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password
      });
      
      setSuccessMsg('Account created successfully! Redirecting...');
      
      // Auto login after registration
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
      setError(err.message || 'Registration failed. Try again.');
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock functionality
    setTimeout(() => {
      setSuccessMsg(`If an account exists for ${email}, a reset link has been sent.`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      
      {/* Guest Warning Modal Overlay */}
      {showGuestWarning && (
          <div className="absolute inset-0 z-50 rounded-3xl overflow-hidden bg-white dark:bg-[#0B1533] flex flex-col items-center justify-center text-center p-6 animate-scale-in">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                  <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Continue as Guest?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Your calculations and history will <strong className="text-red-500">not be saved</strong> to the cloud. You may lose your data if you clear your browser cache.
              </p>
              <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setShowGuestWarning(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
                  >
                      Cancel
                  </button>
                  <button 
                    onClick={onGuest}
                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/30 text-sm"
                  >
                      Continue Anyway
                  </button>
              </div>
          </div>
      )}

      <div className={`relative bg-white/50 dark:bg-[#0B1533]/60 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${showGuestWarning ? 'blur-sm scale-[0.98]' : ''}`}>
        
        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
            {view === 'LOGIN' && 'Welcome Back'}
            {view === 'REGISTER' && 'Create Account'}
            {view === 'FORGOT_PASSWORD' && 'Reset Password'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {view === 'LOGIN' && 'Access your premium tax dashboard'}
            {view === 'REGISTER' && 'Start managing your finances today'}
            {view === 'FORGOT_PASSWORD' && 'We will help you recover your account'}
          </p>
        </div>

        {/* Forms */}
        <div className="relative z-10 min-h-[300px]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-300 animate-fade-in-up">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl flex items-center gap-2 text-sm text-green-600 dark:text-green-300 animate-fade-in-up">
              <CheckCircle size={16} />
              {successMsg}
            </div>
          )}

          <form onSubmit={view === 'LOGIN' ? handleLogin : view === 'REGISTER' ? handleRegister : handleForgot} className="space-y-4 animate-fade-in-up">
            
            {view === 'REGISTER' && (
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 focus:border-gold-400 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all font-sans"
                />
              </div>
            )}

            <div className="group relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 focus:border-gold-400 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all font-sans"
              />
            </div>

            {view === 'REGISTER' && (
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 focus:border-gold-400 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all font-sans"
                />
              </div>
            )}

            {view !== 'FORGOT_PASSWORD' && (
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 focus:border-gold-400 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {view === 'LOGIN' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView('FORGOT_PASSWORD')}
                  className="text-xs font-medium text-gray-500 hover:text-gold-500 dark:text-gray-400 dark:hover:text-gold-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-xl p-[1px] shadow-lg shadow-gold-400/10 hover:shadow-gold-400/20 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gold-400 via-yellow-500 to-gold-600 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative bg-royal-900 dark:bg-[#0A1A44] rounded-xl px-6 py-3.5 flex items-center justify-center gap-2 transition-all group-hover:bg-opacity-90">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-white font-bold text-sm tracking-wide uppercase font-display">
                      {view === 'LOGIN' && 'Sign In'}
                      {view === 'REGISTER' && 'Create Account'}
                      {view === 'FORGOT_PASSWORD' && 'Send Reset Link'}
                    </span>
                    <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Guest Access Option */}
          {view === 'LOGIN' && (
             <div className="mt-4 animate-fade-in-up delay-75">
                <button 
                    type="button"
                    onClick={() => setShowGuestWarning(true)}
                    className="w-full py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                    <UserPlus size={16} /> Continue as Guest
                </button>
             </div>
          )}

          {/* Footer Switching */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 text-center animate-fade-in-up delay-100">
            {view === 'LOGIN' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button onClick={() => setView('REGISTER')} className="font-semibold text-gold-500 hover:text-gold-400 transition-colors">
                  Sign up
                </button>
              </p>
            )}
            {view === 'REGISTER' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button onClick={() => setView('LOGIN')} className="font-semibold text-gold-500 hover:text-gold-400 transition-colors">
                  Sign in
                </button>
              </p>
            )}
            {view === 'FORGOT_PASSWORD' && (
              <button onClick={() => setView('LOGIN')} className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;