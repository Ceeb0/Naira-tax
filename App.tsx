import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import Results from './components/Results';
import MadLoader from './components/MadLoader';
import ParallaxBackground from './components/ParallaxBackground';
import AuthPage from './components/AuthPage';
import ProfileModal from './components/ProfileModal';
import Tour, { TourStep } from './components/Tour';
import ConsultantAd from './components/ConsultantAd';
import { FinancialInput, TaxResult, User, CustomCategory, MonthlyInput } from './types';
import { calculateTax, COMMON_EXPENSES, CURRENCIES } from './utils/taxLogic';
import { AuthService, StatsService } from './services/api';
import { Moon, Sun, Calculator as CalcIcon, LogOut, User as UserIcon, Edit2, LogIn, HelpCircle, Activity, ChevronDown } from 'lucide-react';

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'body',
        title: 'Welcome to NairaTax Pro',
        content: 'This advanced calculator helps you accurately compute your Nigerian PAYE tax liability, plan reliefs, and manage your monthly disposable income.'
    },
    {
        targetId: 'live-counter',
        title: 'Community Usage',
        content: 'See how many professionals are actively using the platform to optimize their taxes in real-time.'
    },
    {
        targetId: 'tour-months',
        title: 'Select Months',
        content: 'Start by selecting the months you want to calculate for. You can select multiple months to see a cumulative annual breakdown.'
    },
    {
        targetId: 'tour-income',
        title: 'Enter Earnings',
        content: 'Add your Gross Salary and other income sources here. Use the arrow on the right to add more details like Date or Bank.'
    },
    {
        targetId: 'tour-expenses',
        title: 'Add Expenses & Reliefs',
        content: 'Enter your monthly expenses. Important: Mark statutory payments like NHF, NHIS, and Life Assurance as "Tax Exempt" to reduce your tax liability.'
    },
    {
        targetId: 'tour-settings',
        title: 'Calculation Mode',
        content: 'Switch between the standard Statutory method (PITA) or a simple Flat Rate percentage if you just want a quick estimate.'
    },
    {
        targetId: 'tour-calculate',
        title: 'Calculate & Export',
        content: 'Hit the button to generate your professional analysis. You can then download the full Breakdown and Results as a PDF.'
    }
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [currentInput, setCurrentInput] = useState<number>(0);
  const [calcCount, setCalcCount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('NGN');
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Initialize App & Session
  useEffect(() => {
    const init = async () => {
      try {
        // Load Global Counter
        setCalcCount(StatsService.getCount());

        // Check for MongoDB session
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Sync Preferences (Dark Mode, Currency)
          if (currentUser.preferences?.darkMode !== undefined) {
            setDarkMode(currentUser.preferences.darkMode);
          }
          if (currentUser.preferences?.currency) {
            setCurrency(currentUser.preferences.currency);
          }
        }
      } catch (err) {
        console.error("Session restoration failed", err);
      } finally {
        setAuthLoading(false);
      }
    };

    init();
  }, []);

  // Check for First Time User Tour
  useEffect(() => {
      if (!authLoading && user && user._id !== 'guest') {
         // Could check DB preference here
         const hasSeenTour = localStorage.getItem('hasSeenTour_v1');
         if (!hasSeenTour) {
             setIsTourOpen(true);
         }
      } else if (!authLoading && user && user._id === 'guest') {
         const hasSeenTour = localStorage.getItem('hasSeenTour_guest_v1');
         if (!hasSeenTour) {
             setIsTourOpen(true);
         }
      }
  }, [authLoading, user]);

  // Handle Theme Changes & Persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Persist preference to DB if logged in and not guest
    if (user && user._id !== 'guest') {
      try {
        const updatedUser = await AuthService.updatePreferences(user._id, { darkMode: newMode });
        setUser(updatedUser);
      } catch (e) {
        console.error("Failed to save preference", e);
      }
    }
  };
  
  const handleCurrencyChange = async (newCurrency: string) => {
      setCurrency(newCurrency);
      if (user && user._id !== 'guest') {
        try {
            const updatedUser = await AuthService.updatePreferences(user._id, { currency: newCurrency as any });
            setUser(updatedUser);
        } catch (e) {
            console.error("Failed to save currency preference", e);
        }
      }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Apply user's preferred theme and currency on login
    if (loggedInUser.preferences?.darkMode !== undefined) {
      setDarkMode(loggedInUser.preferences.darkMode);
    }
    if (loggedInUser.preferences?.currency) {
      setCurrency(loggedInUser.preferences.currency);
    }
  };

  const handleGuestLogin = () => {
      const guestUser: User = {
          _id: 'guest',
          name: 'Guest User',
          email: 'guest@cacs.naira.tax',
          preferences: { darkMode: true, customCategories: [] },
          createdAt: new Date().toISOString()
      };
      setUser(guestUser);
      setDarkMode(true);
  };

  const handleLogout = async () => {
    // Only call API logout if not a guest
    if (user && user._id !== 'guest') {
        await AuthService.logout();
    }
    setUser(null);
    setResult(null);
  };

  const handleCalculate = async (monthlyData: MonthlyInput[], customTaxRate?: number) => {
    setLoading(true);
    
    // Update global stats
    const newCount = StatsService.increment();
    setCalcCount(newCount);

    // Calculate total monthly income average for Tier determination
    const totalIncome = monthlyData.reduce((sum, m) => {
        return sum + m.incomeSources.reduce((s, i) => s + i.amount, 0);
    }, 0);
    const avgMonthly = totalIncome / (monthlyData.length || 1);
    setCurrentInput(avgMonthly);
    
    // Persist data if logged in (and not guest)
    if (user && user._id !== 'guest') {
      try {
        // 1. Check for new custom categories to inject
        const currentCustoms = user.preferences.customCategories || [];
        const newCustoms: CustomCategory[] = [];

        // Flatten expenses from all months to check for new categories
        const allExpenses = monthlyData.flatMap(m => m.expenses);

        allExpenses.forEach(exp => {
           // Skip if empty or matches standard list
           if (!exp.category.trim()) return;
           
           const isCommon = COMMON_EXPENSES.some(c => c.label.toLowerCase() === exp.category.toLowerCase());
           const isExistingCustom = currentCustoms.some(c => c.label.toLowerCase() === exp.category.toLowerCase());
           const isAlreadyQueued = newCustoms.some(c => c.label.toLowerCase() === exp.category.toLowerCase());

           if (!isCommon && !isExistingCustom && !isAlreadyQueued) {
               newCustoms.push({ label: exp.category, isTaxDeductible: exp.isTaxDeductible });
           }
        });

        // 2. Prepare updates
        const updates: any = { 
          lastFormattedAmount: avgMonthly.toString() 
        };

        if (newCustoms.length > 0) {
           updates.customCategories = [...currentCustoms, ...newCustoms];
        }

        // 3. Save
        const updatedUser = await AuthService.updatePreferences(user._id, updates);
        setUser(updatedUser);
      } catch (e) {
        console.error("Failed to save preferences", e);
      }
    }
    
    // Simulate "crunching" time for the mad loader effect
    setTimeout(() => {
      const res = calculateTax(monthlyData, customTaxRate);
      setResult(res);
      setLoading(false);
    }, 2000);
  };

  const finishTour = () => {
      setIsTourOpen(false);
      if (user && user._id === 'guest') {
          localStorage.setItem('hasSeenTour_guest_v1', 'true');
      } else {
          localStorage.setItem('hasSeenTour_v1', 'true');
      }
  };

  if (authLoading) {
    return <MadLoader />;
  }

  const isGuest = user?._id === 'guest';
  const currencySymbol = CURRENCIES[currency]?.symbol || '₦';

  return (
    <div className="min-h-screen bg-soft-50 dark:bg-[#050E24] transition-colors duration-500 font-sans selection:bg-gold-400 selection:text-black overflow-hidden relative">
      
      {/* Background Effect */}
      <ParallaxBackground />

      {/* Navbar */}
      <nav className="fixed w-full z-30 top-0 start-0 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#050E24]/80 backdrop-blur-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer" onClick={() => setResult(null)}>
            <div className="bg-gradient-to-tr from-gold-400 to-yellow-600 p-2 rounded-lg shadow-lg shadow-gold-400/20">
              <CalcIcon className="text-royal-900" size={24} />
            </div>
            <span className="self-center text-2xl font-display font-bold whitespace-nowrap dark:text-white tracking-tight hidden sm:block">
              CACS Naira<span className="text-gold-400">Tax</span> Pro
            </span>
            <span className="self-center text-xl font-display font-bold whitespace-nowrap dark:text-white tracking-tight sm:hidden">
              CN<span className="text-gold-400">Tax</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:order-2">
            
            {/* Currency Selector */}
            <div className="relative group mr-2">
               <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
                  {CURRENCIES[currency]?.symbol} {currency}
                  <ChevronDown size={14} className="opacity-50" />
               </button>
               {/* Dropdown */}
               <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#0B1533] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden hidden group-hover:block animate-fade-in-up origin-top-right">
                  {Object.keys(CURRENCIES).map((code) => (
                      <button 
                         key={code}
                         onClick={() => handleCurrencyChange(code)}
                         className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${currency === code ? 'text-gold-500 bg-gold-50/50 dark:bg-gold-500/10' : 'text-gray-600 dark:text-gray-400'}`}
                      >
                         <span>{CURRENCIES[code].symbol} {code}</span>
                         {currency === code && <div className="w-1.5 h-1.5 rounded-full bg-gold-400"></div>}
                      </button>
                  ))}
               </div>
            </div>

            {user && (
                 <button
                 onClick={() => setIsTourOpen(true)}
                 className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none transition-all hidden sm:block"
                 title="Take Tour"
               >
                 <HelpCircle size={20} />
               </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-white/10">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                        {isGuest ? 'Guest Mode' : 'Welcome'}
                    </span>
                    {isGuest ? (
                        <span className="text-sm font-bold text-gray-400 italic">Not Saved</span>
                    ) : (
                         <button 
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-1 group"
                         >
                            <span className="text-sm font-bold text-gray-900 dark:text-white leading-none group-hover:text-gold-400 transition-colors">
                                {user.name.split(' ')[0]}
                            </span>
                            <Edit2 size={10} className="text-gray-500 group-hover:text-gold-400" />
                        </button>
                    )}
                 </div>
                 
                 <button
                  onClick={handleLogout}
                  className={`p-2.5 rounded-full transition-all ${isGuest ? 'text-gold-500 hover:bg-gold-50 dark:hover:bg-gold-900/20' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                  title={isGuest ? "Sign In" : "Logout"}
                >
                  {isGuest ? <LogIn size={20} /> : <LogOut size={20} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[85vh]">
        
        {!user ? (
          <div className="w-full animate-fade-in-up">
             <div className="text-center mb-10 max-w-lg mx-auto">
               <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
                 Sign In to <span className="text-gold-400">Calculate</span>
               </h1>
               <p className="text-gray-500 dark:text-gray-400">
                 Join thousands of Nigerian professionals optimizing their income tax.
               </p>
             </div>
             <AuthPage onLogin={handleLogin} onGuest={handleGuestLogin} />
          </div>
        ) : (
          <>
            {/* Hero Text */}
            <div className="text-center mb-10 max-w-2xl animate-fade-in-up">
              {/* Global Counter Badge */}
              <div id="live-counter" className="inline-flex items-center gap-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full mb-6 backdrop-blur-md">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tracking-wide uppercase">
                    {calcCount.toLocaleString()} Reports Generated
                 </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-display font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
                Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-200">Income</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Accurate, instant PAYE tax calculations for Nigerian professionals. 
                Optimized for the modern economy.
              </p>
            </div>

            {/* Calculator Card */}
            <div className="w-full max-w-lg relative animate-fade-in-up delay-100 flex flex-col items-center">
                {/* Decorative background glow (Static close-up blobs for emphasis) */}
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                
                <div className="relative w-full bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-2xl">
                   <Calculator 
                      onCalculate={handleCalculate} 
                      customCategories={user.preferences.customCategories}
                      currencySymbol={currencySymbol}
                   />
                </div>

                {/* Consultant Advert */}
                <ConsultantAd />
            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-500 dark:text-gray-600 text-sm relative z-10">
        <p>© {new Date().getFullYear()} CACSNairaTax Pro. Built for Nigeria 🇳🇬</p>
      </footer>

      {/* Overlays */}
      {loading && <MadLoader />}
      {result && !loading && (
        <Results 
          result={result} 
          monthlyIncome={currentInput}
          onClose={() => setResult(null)} 
          currency={currency}
        />
      )}

      {user && !isGuest && (
          <ProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            user={user}
            onUpdate={(updatedUser) => setUser(updatedUser)}
          />
      )}
      
      {/* Tour Overlay */}
      {user && (
          <Tour 
            steps={TOUR_STEPS}
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
            onComplete={finishTour}
          />
      )}
      
    </div>
  );
};

export default App;