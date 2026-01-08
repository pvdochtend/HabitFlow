
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Target, 
  Trash2,
  X,
  ChevronRight,
  Zap,
  LayoutGrid,
  TrendingUp,
  Settings,
  Moon,
  Sun,
  Palette,
  LogOut,
  Globe
} from 'lucide-react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { Habit, Frequency } from './types';

type ActiveTab = 'today' | 'trends' | 'settings';
type AppTheme = 'blue' | 'pink';
type Language = 'en' | 'nl';

const TRANSLATIONS = {
  nl: {
    appName: 'HabitFlow',
    tabs: { today: 'Routine', trends: 'Analyse', settings: 'Instellingen', stats: 'Stats', menu: 'Menu' },
    today: { title: 'Perfecte Dag! ✨', subtitle: 'Kleine overwinningen eerst.', target: 'Je hebt elke gewoonte voor vandaag voltooid.', targetRemain: 'doelen over voor vandaag.', routine: 'Dagelijkse Routine', create: 'Nieuwe Toevoegen', freshStart: 'Schone start?', freshText: 'Bouw discipline op, één kleine overwinning tegelijk. Je reis begint met één gewoonte.', setGoal: 'Stel eerste doel in', streak: 'Huidige Reeks', habits: 'Gewoontes', consistency: 'Consistentie' },
    trends: { title: 'Statistieken', perf: 'Prestatiegeschiedenis', score: 'Consistentie Score', total: 'Totaal Check-ins', lifetime: 'Levenslange voortgang' },
    settings: { title: 'Profiel', edit: 'Persoonlijke Identiteit Bewerken', user: 'Vanguard Early Adopter', appearance: 'Systeemvoorkeuren', night: 'Nachtmodus', active: 'Actief', disabled: 'Uitgeschakeld', theme: 'App Thema', personality: 'Selecteer Visuele Engine', language: 'Taal / Language', selectLang: 'Kies applicatie taal', factory: 'Fabrieksinstellingen', factoryDesc: 'Reset alles naar de basis', signout: 'Sessie Afmelden', blue: 'Oceaan', pink: 'Roos' },
    modal: { title: 'Nieuwe Overwinning', subtitle: 'Wat is de volgende standaard?', nameLabel: 'Hoofddoel', namePlaceholder: 'Bv. 5 AM Diep Werk', category: 'Domein', cadence: 'Ritme', daily: 'dagelijks', weekly: 'wekelijks', notes: 'Gedragsnotities', notesPlaceholder: 'Definieer de triggers en kleine winsten...', back: 'Terug naar Routine', launch: 'Lanceer Overwinning' },
    categories: { Health: 'Gezondheid', Focus: 'Focus', Fitness: 'Fitness', Mindset: 'Mindset', Creative: 'Creatief', General: 'Algemeen' }
  },
  en: {
    appName: 'HabitFlow',
    tabs: { today: 'Routine', trends: 'Analytics', settings: 'Settings', stats: 'Stats', menu: 'Menu' },
    today: { title: 'Perfect Day! ✨', subtitle: 'Small Wins First.', target: "You've crushed every habit today.", targetRemain: 'goals remain today.', routine: 'Daily Routine', create: 'Create New', freshStart: 'Fresh Start?', freshText: 'Build discipline one small victory at a time. Your journey starts with a single habit.', setGoal: 'Set My First Goal', streak: 'Current Streak', habits: 'Habits', consistency: 'Consistency' },
    trends: { title: 'Analytics', perf: 'Performance History', score: 'Consistency Score', total: 'Total Check-ins', lifetime: 'Lifetime Progress Unlocked' },
    settings: { title: 'Profile', edit: 'Edit Personal Identity', user: 'Vanguard Early Adopter', appearance: 'System Preferences', night: 'Night Mode', active: 'Active', disabled: 'Disabled', theme: 'App Theme', personality: 'Select Visual Engine', language: 'Language / Taal', selectLang: 'Select application language', factory: 'Factory Reset', factoryDesc: 'Reset everything to default', signout: 'Sign Out Session', blue: 'Ocean', pink: 'Rose' },
    modal: { title: 'New Victory', subtitle: 'Define your daily standard', nameLabel: 'Headline Goal', namePlaceholder: 'E.g. 5 AM Deep Work', category: 'Domain', cadence: 'Cadence', daily: 'daily', weekly: 'weekly', notes: 'Behavioral Notes', notesPlaceholder: 'Define the triggers and small wins associated with this habit...', back: 'Back to Routine', launch: 'Launch Victory' },
    categories: { Health: 'Health', Focus: 'Focus', Fitness: 'Fitness', Mindset: 'Mindset', Creative: 'Creative', General: 'General' }
  }
};

const App: React.FC = () => {
  // --- Data State ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habitflow_habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  // --- UI/Theme/Language State ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [language, setLanguage] = useState<Language>(() => 
    (localStorage.getItem('habitflow_language') as Language) || 'nl'
  );
  const [theme, setTheme] = useState<AppTheme>(() => 
    (localStorage.getItem('habitflow_theme') as AppTheme) || 'blue'
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => 
    localStorage.getItem('habitflow_darkmode') === 'true'
  );

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // --- Theme Helper ---
  const themeColors = useMemo(() => ({
    primary: theme === 'blue' ? 'indigo' : 'rose',
    primaryHex: theme === 'blue' ? '#4f46e5' : '#e11d48',
    secondary: theme === 'blue' ? 'violet' : 'pink',
    light: theme === 'blue' ? 'bg-indigo-50' : 'bg-rose-50',
    text: theme === 'blue' ? 'text-indigo-600' : 'text-rose-600',
    border: theme === 'blue' ? 'border-indigo-100' : 'border-rose-100',
    shadow: theme === 'blue' ? 'shadow-indigo-400/30' : 'shadow-rose-400/30',
    gradient: theme === 'blue' 
      ? 'from-indigo-600 via-violet-600 to-fuchsia-600' 
      : 'from-rose-500 via-pink-500 to-orange-500',
    mesh: theme === 'blue' 
      ? ['bg-indigo-500', 'bg-violet-400'] 
      : ['bg-rose-500', 'bg-amber-300']
  }), [theme]);

  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    description: '',
    category: 'General',
    frequency: 'daily',
    color: themeColors.primaryHex
  });

  useEffect(() => {
    setNewHabit(prev => ({ ...prev, color: themeColors.primaryHex }));
  }, [themeColors.primaryHex]);

  // --- Persistence & Effects ---
  useEffect(() => {
    localStorage.setItem('habitflow_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habitflow_theme', theme);
    localStorage.setItem('habitflow_darkmode', String(isDarkMode));
    localStorage.setItem('habitflow_language', language);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isDarkMode, language]);

  // --- Handlers ---
  const handleToggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(today);
        let newDates = [...habit.completedDates];
        if (isCompleted) {
          newDates = newDates.filter(d => d !== today);
        } else {
          newDates.push(today);
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const hasYesterday = newDates.includes(yesterdayStr);
        const hasToday = newDates.includes(today);
        
        return { 
          ...habit, 
          completedDates: newDates,
          streak: (hasToday && hasYesterday) ? habit.streak + (isCompleted ? -1 : 1) : (hasToday ? 1 : 0)
        };
      }
      return habit;
    }));
  };

  const handleDeleteHabit = (id: string) => {
    if (window.confirm(language === 'nl' ? 'Gewoonte verwijderen?' : 'Delete habit?')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const clearData = () => {
    const confirmMsg = language === 'nl' 
      ? 'Fabrieksreset verwijdert al je gewoontes en instellingen. Doorgaan?' 
      : 'Factory reset will delete all your habits and settings. Proceed?';
    if (window.confirm(confirmMsg)) {
      localStorage.removeItem('habitflow_habits');
      localStorage.removeItem('habitflow_theme');
      localStorage.removeItem('habitflow_darkmode');
      localStorage.removeItem('habitflow_language');
      window.location.reload();
    }
  };

  const handleAddHabit = (h: Partial<Habit>) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: h.name || 'Untitled',
      description: h.description || '',
      category: h.category || 'General',
      frequency: h.frequency as Frequency || 'daily',
      createdAt: Date.now(),
      completedDates: [],
      streak: 0,
      color: h.color || themeColors.primaryHex
    };
    setHabits(prev => [...prev, habit]);
    setIsModalOpen(false);
    setNewHabit({ name: '', description: '', category: 'General', frequency: 'daily', color: themeColors.primaryHex });
    setActiveTab('today');
  };

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'short' }),
      completions: habits.reduce((acc, h) => acc + (h.completedDates.includes(date) ? 1 : 0), 0)
    }));
  }, [habits, language]);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCount = habits.filter(h => !h.completedDates.includes(todayStr)).length;

  return (
    <div className={`min-h-[100dvh] transition-colors duration-700 flex flex-col md:flex-row overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Mesh */}
      <div className="mesh-gradient">
        <div className={`absolute top-0 left-0 w-[600px] h-[600px] rounded-full mix-blend-multiply opacity-40 animate-pulse-slow ${themeColors.mesh[0]}`} />
        <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full mix-blend-multiply opacity-40 animate-float ${themeColors.mesh[1]}`} />
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-72 border-r flex-col p-8 sticky top-0 h-screen transition-all duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-2xl' : 'bg-white/80 border-slate-200 backdrop-blur-2xl'}`}>
        <div className="flex items-center gap-3 mb-12">
          <div className={`p-2.5 rounded-2xl text-white shadow-2xl animate-float bg-gradient-to-br ${themeColors.gradient}`}>
            <Zap size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">{t.appName}</h1>
        </div>
        
        <nav className="flex-1 space-y-3">
          {[
            { id: 'today', icon: LayoutGrid, label: t.tabs.today },
            { id: 'trends', icon: TrendingUp, label: t.tabs.trends },
            { id: 'settings', icon: Settings, label: t.tabs.settings }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? `bg-gradient-to-br ${themeColors.gradient} text-white shadow-lg ${themeColors.shadow}` 
                  : `text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:shadow-sm`
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-5 md:p-12 max-w-5xl mx-auto w-full overflow-x-hidden pb-44 md:pb-12">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br ${themeColors.gradient}`}>
              <Zap size={22} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">{t.appName}</h1>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-11 h-11 rounded-2xl overflow-hidden border-2 shadow-md transition-transform active:scale-90 ${isDarkMode ? 'border-slate-800' : 'border-white'}`}
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
          </button>
        </header>

        {/* --- Tab Content: TODAY --- */}
        {activeTab === 'today' && (
          <div className="animate-in-smart">
            <section className="mb-10 px-1">
              <h2 className="text-4xl font-black mb-2 tracking-tight">
                {pendingCount === 0 ? t.today.title : t.today.subtitle}
              </h2>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                <Target size={18} className={themeColors.text} />
                <span>{pendingCount === 0 ? t.today.target : `${pendingCount} ${t.today.targetRemain}`}</span>
              </div>
            </section>

            <div className="relative -mx-5 px-5 mb-10 overflow-hidden">
              <section className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                <div className={`flex-shrink-0 p-6 rounded-[2.5rem] shadow-2xl w-44 flex flex-col justify-between text-white transition-transform hover:scale-105 bg-gradient-to-br ${themeColors.gradient} ${themeColors.shadow}`}>
                  <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md mb-4">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest opacity-80 mb-1">{t.today.streak}</p>
                    <h3 className="text-4xl font-black">{habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak)) : 0}</h3>
                  </div>
                </div>
                
                <div className={`flex-shrink-0 p-6 rounded-[2.5rem] border w-44 flex flex-col justify-between transition-all hover:shadow-xl hover:scale-105 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm shadow-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-slate-50 text-indigo-600'}`}>
                    <LayoutGrid size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.today.habits}</p>
                    <h3 className="text-4xl font-black">{habits.length}</h3>
                  </div>
                </div>

                <div className={`flex-shrink-0 p-6 rounded-[2.5rem] border w-44 flex flex-col justify-between transition-all hover:shadow-xl hover:scale-105 ${isDarkMode ? 'bg-emerald-900/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-50'}`}>
                   <div className="bg-emerald-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Target size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">{t.today.consistency}</p>
                    <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">84%</h3>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black tracking-tight">{t.today.routine}</h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`hidden md:flex items-center gap-2 text-white px-6 py-3 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${themeColors.gradient} ${themeColors.shadow}`}
                >
                  <Plus size={20} strokeWidth={3} /> {t.today.create}
                </button>
              </div>
              
              {habits.length === 0 ? (
                <div className={`py-20 text-center rounded-[3rem] border-2 border-dashed px-8 animate-in-smart ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200 backdrop-blur-md'}`}>
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Target className={themeColors.text} size={48} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-2xl font-black mb-3">{t.today.freshStart}</h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-sm mx-auto font-bold leading-relaxed">
                    {t.today.freshText}
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className={`text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl transition-all hover:scale-110 active:scale-90 bg-gradient-to-r ${themeColors.gradient} ${themeColors.shadow}`}
                  >
                    {t.today.setGoal}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {habits.map((habit, idx) => {
                    const isDone = habit.completedDates.includes(todayStr);
                    const catName = (t.categories as any)[habit.category] || habit.category;
                    return (
                      <div 
                        key={habit.id}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                        className={`group p-5 rounded-[2.5rem] border-2 transition-all duration-500 animate-in-smart ${
                          isDone 
                            ? (isDarkMode ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-emerald-500/30 bg-emerald-50/70 shadow-inner shadow-emerald-50') 
                            : (isDarkMode ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xl hover:-translate-y-1')
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5 flex-1 min-w-0">
                            <button 
                              onClick={() => handleToggleHabit(habit.id)}
                              className={`w-16 h-16 rounded-[1.75rem] flex-shrink-0 flex items-center justify-center transition-all duration-500 shadow-xl active:scale-75 ${
                                isDone 
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/40 rotate-[360deg]' 
                                  : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-500')
                              }`}
                            >
                              <CheckCircle2 size={32} strokeWidth={isDone ? 3 : 2} />
                            </button>
                            <div className="flex-1 min-w-0 pr-2">
                              <h4 className={`font-black truncate text-lg transition-all duration-500 ${isDone ? 'text-slate-500 line-through opacity-70' : 'text-slate-900 dark:text-white'}`}>
                                {habit.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {catName}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">
                                  {habit.streak} {language === 'nl' ? 'dagen reeks' : 'day streak'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteHabit(habit.id)} className="text-slate-400 hover:text-red-500 p-2.5 transition-colors">
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab Content: TRENDS --- */}
        {activeTab === 'trends' && (
          <div className="animate-in-smart">
            <h2 className="text-4xl font-black mb-8 tracking-tight">{t.trends.title}</h2>
            <div className={`p-8 rounded-[3.5rem] border shadow-2xl mb-8 relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-100 shadow-xl shadow-slate-100'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xl flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${themeColors.gradient}`}>
                    <TrendingUp size={20} />
                  </div>
                  {t.trends.perf}
                </h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColors.primaryHex} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={themeColors.primaryHex} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '24px', 
                        border: 'none', 
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.3)', 
                        fontWeight: '800',
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        color: isDarkMode ? '#fff' : '#000'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completions" 
                      stroke={themeColors.primaryHex} 
                      fillOpacity={1} 
                      fill="url(#colorComp)" 
                      strokeWidth={6} 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-8 rounded-[3rem] border group transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-indigo-900/20 border-indigo-900/40' : 'bg-indigo-50 border-indigo-100 shadow-md shadow-indigo-100/50'}`}>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">{t.trends.score}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-5xl font-black text-indigo-700 dark:text-indigo-300 tracking-tighter">84<span className="text-2xl font-black">%</span></h4>
                </div>
                <div className="mt-5 h-2.5 w-full bg-indigo-200/50 dark:bg-indigo-950/50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[84%] animate-pulse" />
                </div>
              </div>
              <div className={`p-8 rounded-[3rem] border group transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-emerald-900/20 border-emerald-900/40' : 'bg-emerald-50 border-emerald-100 shadow-md shadow-emerald-100/50'}`}>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t.trends.total}</p>
                <h4 className="text-5xl font-black text-emerald-700 dark:text-emerald-300 tracking-tighter">
                  {habits.reduce((acc, h) => acc + h.completedDates.length, 0)}
                </h4>
                <p className="text-emerald-700/70 dark:text-emerald-300/60 font-black text-sm mt-2 tracking-tight">{t.trends.lifetime}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab Content: SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="animate-in-smart">
            <h2 className="text-4xl font-black mb-8 tracking-tight">{t.settings.title}</h2>

            {/* Profile Card */}
            <div className={`p-12 rounded-[4rem] border shadow-2xl mb-10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
               <div className={`absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r ${themeColors.gradient}`} />
              <div className={`w-36 h-36 rounded-[3.5rem] border-8 p-1.5 mb-8 shadow-2xl transition-all hover:rotate-6 ${theme === 'blue' ? 'border-indigo-100 shadow-indigo-100' : 'border-rose-100 shadow-rose-100'} ${isDarkMode ? 'border-slate-800 shadow-none' : ''}`}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-[2.75rem] w-full h-full bg-slate-100 object-cover" alt="Profile" />
              </div>
              <h3 className="text-3xl font-black mb-1.5 tracking-tight">Felix {t.appName}</h3>
              <p className="text-slate-500 font-black mb-10 tracking-wide uppercase text-xs">{t.settings.user}</p>
              <button className={`w-full py-5 rounded-[2.25rem] font-black border-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'}`}>
                {t.settings.edit}
              </button>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-6">{t.settings.appearance}</h4>
              
              {/* Language Switcher */}
              <div className={`p-8 rounded-[3.5rem] border transition-all duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100 shadow-lg shadow-slate-100/50'}`}>
                <div className="flex items-center gap-5 mb-8">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
                    <Globe size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-black text-xl leading-none mb-1.5">{t.settings.language}</p>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-widest">{t.settings.selectLang}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setLanguage('nl')}
                    className={`flex-1 py-4 rounded-[1.75rem] font-black transition-all ${language === 'nl' ? `bg-gradient-to-br ${themeColors.gradient} text-white shadow-xl` : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                  >
                    Nederlands
                  </button>
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-4 rounded-[1.75rem] font-black transition-all ${language === 'en' ? `bg-gradient-to-br ${themeColors.gradient} text-white shadow-xl` : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className={`p-8 rounded-[3.5rem] border flex items-center justify-between transition-all duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100 shadow-lg shadow-slate-100/50'}`}>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
                    {isDarkMode ? <Sun size={28} strokeWidth={2.5} /> : <Moon size={28} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <p className="font-black text-xl leading-none mb-1.5">{t.settings.night}</p>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-widest">{isDarkMode ? t.settings.active : t.settings.disabled}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-18 h-10 rounded-full p-1.5 transition-all duration-700 flex items-center ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-7 h-7 bg-white rounded-full shadow-2xl transition-all transform duration-500 ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className={`p-8 rounded-[3.5rem] border transition-all duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100 shadow-lg shadow-slate-100/50'}`}>
                <div className="flex items-center gap-5 mb-10">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-slate-600'}`}>
                    <Palette size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-black text-xl leading-none mb-1.5">{t.settings.theme}</p>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-widest">{t.settings.personality}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <button 
                    onClick={() => setTheme('blue')}
                    className={`flex-1 flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-4 transition-all duration-500 ${theme === 'blue' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-2xl' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-600 shadow-2xl shadow-indigo-500/50 border-4 border-white dark:border-slate-700" />
                    <span className={`text-xs font-black uppercase tracking-widest ${theme === 'blue' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>{t.settings.blue}</span>
                  </button>
                  <button 
                    onClick={() => setTheme('pink')}
                    className={`flex-1 flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-4 transition-all duration-500 ${theme === 'pink' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20 shadow-2xl' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500 shadow-2xl shadow-rose-500/50 border-4 border-white dark:border-slate-700" />
                    <span className={`text-xs font-black uppercase tracking-widest ${theme === 'pink' ? 'text-rose-700 dark:text-rose-300' : 'text-slate-500'}`}>{t.settings.pink}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-16 space-y-4">
              <button 
                onClick={clearData}
                className={`w-full p-8 rounded-[3rem] border border-red-100 flex items-center justify-between text-red-600 hover:bg-red-50 transition-all active:scale-95 ${isDarkMode ? 'bg-red-900/15 border-red-900/30 hover:bg-red-900/25' : 'bg-white shadow-lg shadow-red-50'}`}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center shadow-inner">
                    <Trash2 size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-black text-xl tracking-tight block text-left">{t.settings.factory}</span>
                    <span className="text-[10px] uppercase font-black opacity-50 block text-left tracking-widest">{t.settings.factoryDesc}</span>
                  </div>
                </div>
                <ChevronRight size={24} className="opacity-30" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- Mobile Bottom Navigation (Solid Glass Dock) --- */}
      <div className="md:hidden fixed bottom-6 left-5 right-5 z-[100] animate-in-smart" style={{ animationDelay: '0.4s' }}>
        <nav className={`glass rounded-[3rem] border-2 shadow-2xl px-2.5 py-2.5 flex items-center justify-around transition-all duration-500 ${isDarkMode ? 'border-slate-800 shadow-black' : 'border-white/50 shadow-slate-200'}`}>
          {[
            { id: 'today', icon: LayoutGrid, label: t.tabs.today },
            { id: 'trends', icon: TrendingUp, label: t.tabs.stats },
            { id: 'settings', icon: Settings, label: t.tabs.menu }
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-[2.25rem] transition-all duration-500 relative flex-1 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isActive && (
                  <div className={`absolute inset-0 rounded-[2.25rem] bg-gradient-to-br ${themeColors.gradient} shadow-xl ${themeColors.shadow} z-0 animate-in-smart`} />
                )}
                <item.icon size={24} strokeWidth={isActive ? 3 : 2} className={`relative z-10 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className={`relative z-10 text-[9px] font-black uppercase tracking-[0.15em] ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              </button>
            );
          })}
          
          <div className="w-1.5 h-1.5" /> 
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`w-16 h-16 text-white rounded-[2.25rem] flex items-center justify-center shadow-2xl active:scale-75 transition-all duration-500 border-4 animate-float bg-gradient-to-br ${themeColors.gradient} ${themeColors.shadow} ${isDarkMode ? 'border-slate-900' : 'border-white'}`}
          >
            <Plus size={34} strokeWidth={4} />
          </button>
        </nav>
      </div>

      {/* --- Habit Creator Modal (High Contrast & Depth) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-2xl z-[200] flex items-end md:items-center justify-center p-0 md:p-6 transition-all duration-700 overflow-hidden">
          <div className={`rounded-t-[4.5rem] md:rounded-[4.5rem] w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh] animate-in-smart relative shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`absolute top-0 left-0 w-full h-3.5 bg-gradient-to-r ${themeColors.gradient} shadow-lg`} />
            
            <div className={`p-10 md:p-12 border-b-2 flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{t.modal.title}</h3>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[11px] mt-1">{t.modal.subtitle}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className={`w-14 h-14 rounded-3xl flex items-center justify-center text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-90 ${isDarkMode ? 'bg-slate-800 hover:bg-red-950/40' : 'bg-slate-50 shadow-inner'}`}>
                <X size={30} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 md:p-12 custom-scrollbar space-y-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-6">{t.modal.nameLabel}</label>
                  <input 
                    type="text" 
                    className={`w-full rounded-[2.5rem] px-10 py-7 outline-none focus:ring-12 font-black text-2xl transition-all shadow-inner ${isDarkMode ? 'bg-slate-800 text-white border-transparent ring-indigo-900/20' : 'bg-slate-50 border-2 border-slate-100 ring-indigo-50 text-slate-900 focus:bg-white focus:border-indigo-100'}`}
                    placeholder={t.modal.namePlaceholder}
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-6">{t.modal.category}</label>
                    <div className="relative">
                      <select 
                        className={`w-full appearance-none rounded-[2.5rem] px-10 py-7 outline-none focus:ring-12 font-black text-lg transition-all shadow-inner cursor-pointer ${isDarkMode ? 'bg-slate-800 text-white border-transparent ring-indigo-900/20' : 'bg-slate-50 border-2 border-slate-100 ring-indigo-50 text-slate-900'}`}
                        value={newHabit.category}
                        onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                      >
                        <option value="Health">{t.categories.Health}</option>
                        <option value="Focus">{t.categories.Focus}</option>
                        <option value="Fitness">{t.categories.Fitness}</option>
                        <option value="Mindset">{t.categories.Mindset}</option>
                        <option value="Creative">{t.categories.Creative}</option>
                        <option value="General">{t.categories.General}</option>
                      </select>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <ChevronRight size={20} strokeWidth={4} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-6">{t.modal.cadence}</label>
                    <div className={`flex gap-4 p-2 rounded-[2.5rem] shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      {['daily', 'weekly'].map(f => (
                        <button 
                          key={f}
                          type="button"
                          onClick={() => setNewHabit({...newHabit, frequency: f as Frequency})}
                          className={`flex-1 py-5 rounded-[2rem] font-black text-sm capitalize transition-all duration-500 ${newHabit.frequency === f ? `bg-gradient-to-br ${themeColors.gradient} text-white shadow-xl ${themeColors.shadow}` : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                          {f === 'daily' ? t.modal.daily : t.modal.weekly}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-6">{t.modal.notes}</label>
                  <textarea 
                    className={`w-full rounded-[3.5rem] px-10 py-8 outline-none focus:ring-12 font-bold text-lg transition-all shadow-inner ${isDarkMode ? 'bg-slate-800 text-slate-300 border-transparent ring-indigo-900/20' : 'bg-slate-50 border-2 border-slate-100 text-slate-700 ring-indigo-50 focus:bg-white focus:border-indigo-100'}`}
                    placeholder={t.modal.notesPlaceholder}
                    rows={4}
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className={`p-10 md:p-12 border-t-2 flex flex-col md:flex-row gap-5 pb-[calc(3rem+env(safe-area-inset-bottom))] ${isDarkMode ? 'bg-slate-950/80 border-slate-800 backdrop-blur-2xl' : 'bg-slate-50/80 border-slate-100 backdrop-blur-2xl'}`}>
              <button onClick={() => setIsModalOpen(false)} className="order-2 md:order-1 flex-1 py-6 rounded-[2.5rem] font-black text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all active:scale-95 text-lg">{t.modal.back}</button>
              <button 
                onClick={() => handleAddHabit(newHabit)}
                className={`order-1 md:order-2 flex-[2] py-6 text-white rounded-[2.5rem] font-black shadow-2xl transition-all hover:scale-105 active:scale-90 text-xl bg-gradient-to-r ${themeColors.gradient} ${themeColors.shadow}`}
              >
                {t.modal.launch}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
