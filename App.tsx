
import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import Results from './components/Results';
import MadLoader from './components/MadLoader';
import ParallaxBackground from './components/ParallaxBackground';
import AuthPage from './components/AuthPage';
import ProfileModal from './components/ProfileModal';
import Tour, { TourStep } from './components/Tour';
import ConsultantAd from './components/ConsultantAd';
import TaxInfo from './components/TaxInfo';
import RemindersPage from './components/RemindersPage';
import HistoryList from './components/HistoryList';
import TaxTipCarousel from './components/TaxTipCarousel';
import { TaxResult, User, MonthlyInput, TaxReminder, SavedCalculation } from './types';
import { calculateTax, CURRENCIES } from './utils/taxLogic';
import { AuthService, StatsService, ReminderService, HistoryService } from './services/api';
import { Moon, Sun, Calculator as CalcIcon, LogOut, LogIn, HelpCircle, ChevronDown, BookOpen, Bell, LayoutDashboard, Clock, Lightbulb, Sparkles, History } from 'lucide-react';

const TOUR_STEPS: TourStep[] = [
    { targetId: 'body', title: 'Welcome to NairaTax Pro', content: 'This tool helps you easily find out how much tax you need to pay in Nigeria based on the 2025 rules.' },
    { targetId: 'live-counter', title: 'People Online', content: 'See how many others are using this tool right now.' },
    { targetId: 'nav-reminders', title: 'Due Dates', content: 'Check your saved alerts for when tax payments are due.' },
    { targetId: 'tour-months', title: 'Pick Months', content: 'Choose which months you want to calculate for.' },
    { targetId: 'tour-income', title: 'Your Income', content: 'Add your salary and any other money you earned.' },
    { targetId: 'tour-expenses', title: 'Tax Cuts', content: 'Add things like Pension or NHF to lower the tax you pay.' },
    { targetId: 'tour-calculate', title: 'Get Your Results', content: 'Click this to see exactly how much tax you owe and what you keep.' }
];

type AppView = 'calculator' | 'reminders';
type MobileSubView = 'form' | 'hub' | 'history';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('calculator');
    const [mobileSubView, setMobileSubView] = useState<MobileSubView>('form');
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<TaxResult | null>(null);
    const [darkMode, setDarkMode] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [reminders, setReminders] = useState<TaxReminder[]>([]);
    const [history, setHistory] = useState<SavedCalculation[]>([]);
    const [counter, setCounter] = useState(0);
    const [currency, setCurrency] = useState('NGN');

    useEffect(() => {
        const init = async () => {
            const currentUser = await AuthService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                setDarkMode(currentUser.preferences.darkMode);
                setCurrency(currentUser.preferences.currency || 'NGN');
                refreshReminders(currentUser._id);
            }
            setHistory(HistoryService.getHistory());
            setCounter(StatsService.getCount());
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const refreshReminders = async (uid: string) => {
        const data = await ReminderService.getReminders(uid);
        setReminders(data);
    };

    const handleLogin = (u: User) => {
        setUser(u);
        setIsGuest(false);
        setDarkMode(u.preferences.darkMode);
        setCurrency(u.preferences.currency || 'NGN');
        refreshReminders(u._id);
        StatsService.increment();
        setCounter(StatsService.getCount());
    };

    const handleGuest = () => {
        setIsGuest(true);
    };

    const handleLogout = async () => {
        await AuthService.logout();
        setUser(null);
        setIsGuest(false);
        setView('calculator');
    };

    const handleCalculate = (monthlyInputs: MonthlyInput[], customTaxRate?: number) => {
        setCalculating(true);
        setTimeout(() => {
            const res = calculateTax(monthlyInputs, customTaxRate);
            setResult(res);
            setCalculating(false);
            
            const newCalc: SavedCalculation = {
                id: Math.random().toString(36).substring(2, 9),
                timestamp: new Date().toISOString(),
                result: res
            };
            setHistory(HistoryService.saveCalculation(newCalc));
        }, 4500);
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (user) {
            AuthService.updatePreferences(user._id, { darkMode: newMode });
        }
    };

    if (loading) return <MadLoader duration={3000} />;

    if (!user && !isGuest) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <ParallaxBackground />
                <AuthPage onLogin={handleLogin} onGuest={handleGuest} />
            </div>
        );
    }

    const currencySymbol = CURRENCIES[currency]?.symbol || '₦';

    return (
        <div className="min-h-screen transition-colors duration-500 font-sans text-gray-900 dark:text-white pb-24 md:pb-20">
            <ParallaxBackground />
            
            <header className="sticky top-0 z-30 bg-liquid-glass no-print border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('calculator')}>
                        <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center shadow-lg shadow-gold-400/30 transition-transform animate-liquid">
                            <CalcIcon size={24} className="text-black" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold tracking-tight text-royal-900 dark:text-white">NairaTax <span className="text-gold-500">Pro</span></h1>
                            <div id="live-counter" className="flex items-center gap-1.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{counter.toLocaleString()} People Online</span>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-2 p-1.5 bg-black/10 dark:bg-white/5 rounded-2xl">
                        <button onClick={() => setView('calculator')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${view === 'calculator' ? 'bg-white dark:bg-white/10 text-royal-900 dark:text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
                            <LayoutDashboard size={16} className="inline mr-2" /> Home
                        </button>
                        <button id="nav-reminders" onClick={() => setView('reminders')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${view === 'reminders' ? 'bg-white dark:bg-white/10 text-royal-900 dark:text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
                            <Clock size={16} className="inline mr-2" /> Due Dates
                        </button>
                    </nav>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1">
                            <button onClick={() => setShowTour(true)} className="p-2.5 rounded-xl hover:bg-white/10 text-gray-500 transition-all"> <HelpCircle size={18} /> </button>
                            <button onClick={toggleDarkMode} className="p-2.5 rounded-xl hover:bg-white/10 text-gray-500 transition-all"> {darkMode ? <Sun size={18} /> : <Moon size={18} />} </button>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/5 relative">
                            <button id="reminder-bell" onClick={() => setView('reminders')} className={`p-2.5 rounded-xl hover:bg-white/10 transition-all relative ${view === 'reminders' ? 'text-gold-500' : 'text-gray-500'}`}>
                                <Bell size={20} />
                                {reminders.some(r => !r.isCompleted) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-royal-900 dark:border-white"></span>}
                            </button>

                            {user ? (
                                <>
                                    <button onClick={() => setShowProfile(true)} className="hidden sm:flex items-center gap-2 p-1 pl-1 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-royal-900 dark:bg-gold-400 flex items-center justify-center text-white dark:text-black font-bold text-xs"> {user.name.charAt(0).toUpperCase()} </div>
                                        <span className="hidden lg:inline text-xs font-bold tracking-tight">{user.name.split(' ')[0]}</span>
                                        <ChevronDown size={14} className="text-gray-400" />
                                    </button>
                                    <button onClick={handleLogout} className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"> <LogOut size={18} /> </button>
                                </>
                            ) : (
                                <button onClick={() => setIsGuest(false)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400 text-black font-bold text-xs shadow-lg"> <LogIn size={16} /> Log In </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {view === 'calculator' ? (
                <main className="max-w-7xl mx-auto px-4 py-12 lg:py-16 flex flex-col items-center">
                    <div className="text-center mb-16 space-y-6 max-w-3xl animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-500 text-[10px] font-bold uppercase tracking-widest mb-4"> <Sparkles size={12} /> 2025 Rules Applied </div>
                        <h2 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]"> The <span className="text-gold-500">Simple Way</span> to <br className="hidden sm:block" /> Track Your Taxes. </h2>
                        <p className="hidden sm:block text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto font-medium opacity-80"> The easiest tool to find out your take-home pay and manage your Nigerian tax payments with ease. </p>
                    </div>

                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        <div className={`lg:col-span-7 xl:col-span-8 order-2 lg:order-1 ${mobileSubView === 'form' ? 'block' : 'hidden md:block'}`}>
                            <div className="bg-liquid-glass rounded-[2.5rem] p-6 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                                <Calculator onCalculate={handleCalculate} currencySymbol={currencySymbol} onOpenReminders={() => setView('reminders')} />
                            </div>
                            <TaxTipCarousel />
                            <div className="hidden md:block mt-16 pt-16 border-t border-white/5"> <TaxInfo /> </div>
                        </div>

                        <aside className={`lg:col-span-5 xl:col-span-4 space-y-8 order-1 lg:order-2 ${mobileSubView === 'hub' || mobileSubView === 'history' ? 'block' : 'hidden md:block'}`}>
                            <div className="bg-liquid-glass-strong rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-fade-in-up">
                                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-4">
                                    <button onClick={() => setMobileSubView('hub')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${mobileSubView === 'hub' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500'}`}> Info </button>
                                    <button onClick={() => setMobileSubView('history')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${mobileSubView === 'history' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500'}`}> History ({history.length}) </button>
                                </div>
                                {mobileSubView === 'hub' ? (
                                    <div className="space-y-5 animate-scale-in">
                                        <div className="flex items-center gap-3 mb-4"> <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shadow-inner"> <BookOpen size={20} /> </div> <h3 className="font-bold font-display text-xl">Tax Facts</h3> </div>
                                        <div className="p-6 rounded-[2rem] bg-black/10 dark:bg-white/5 border border-white/5 group transition-all hover:border-gold-400/30"> <h4 className="text-sm font-bold flex items-center gap-2 mb-2"> <div className="w-2.5 h-2.5 rounded-full bg-gold-400"></div> Tax Free Salary </h4> <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Earn less than ₦800,000 a year? You don't have to pay any tax at all.</p> </div>
                                        <div className="p-6 rounded-[2rem] bg-black/10 dark:bg-white/5 border border-white/5 group transition-all hover:border-blue-400/30"> <h4 className="text-sm font-bold flex items-center gap-2 mb-2"> <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Save on Tax </h4> <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Paying for Insurance or NHF? These help lower the tax you pay.</p> </div>
                                    </div>
                                ) : (
                                    <div className="animate-scale-in"> <HistoryList history={history} onSelect={(calc) => setResult(calc.result)} onDelete={(id) => setHistory(HistoryService.deleteCalculation(id))} onClear={() => setHistory(HistoryService.clearHistory())} currency={currency} /> </div>
                                )}
                            </div>
                            <div className="bg-liquid-glass rounded-[2.5rem] p-2 border border-white/5 shadow-2xl overflow-hidden"> <ConsultantAd /> </div>
                        </aside>
                    </div>
                </main>
            ) : (
                <div className="animate-fade-in-up">
                    <RemindersPage userId={user?._id || 'guest'} currencySymbol={currencySymbol} onBack={() => setView('calculator')} />
                </div>
            )}

            <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-sm">
                <div className="bg-white/10 dark:bg-royal-900/80 backdrop-blur-3xl rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl border border-white/10">
                    <button onClick={() => { setView('calculator'); setMobileSubView('form'); }} className={`flex flex-col items-center gap-1.5 p-3 flex-1 rounded-3xl transition-all ${view === 'calculator' && mobileSubView === 'form' ? 'bg-gold-400 text-black shadow-lg scale-110' : 'text-white/40'}`}> <LayoutDashboard size={20} /> <span className="text-[9px] font-bold uppercase tracking-widest">Form</span> </button>
                    <button onClick={() => { setView('calculator'); setMobileSubView('history'); }} className={`flex flex-col items-center gap-1.5 p-3 flex-1 rounded-3xl transition-all ${view === 'calculator' && (mobileSubView === 'history' || mobileSubView === 'hub') ? 'bg-gold-400 text-black shadow-lg scale-110' : 'text-white/40'}`}> <History size={20} /> <span className="text-[9px] font-bold uppercase tracking-widest">History</span> </button>
                    <button onClick={() => setView('reminders')} className={`flex flex-col items-center gap-1.5 p-3 flex-1 rounded-3xl transition-all ${view === 'reminders' ? 'bg-gold-400 text-black shadow-lg scale-110' : 'text-white/40'}`}> <Clock size={20} /> <span className="text-[9px] font-bold uppercase tracking-widest">Alerts</span> </button>
                </div>
            </div>

            {calculating && <MadLoader duration={4500} />}
            {result && <Results result={result} onClose={() => setResult(null)} monthlyIncome={result.grossIncome} currency={currency} userId={user?._id || 'guest'} />}
            {user && <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} user={user} onUpdate={setUser} />}
            <Tour isOpen={showTour} steps={TOUR_STEPS} onClose={() => setShowTour(false)} onComplete={() => setShowTour(false)} />
        </div>
    );
};

export default App;
