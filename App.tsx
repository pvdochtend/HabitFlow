
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Trash2,
  X,
  ChevronRight,
  Zap,
  LayoutGrid,
  TrendingUp,
  MessageSquare,
  Settings,
  Moon,
  Sun,
  Palette,
  User,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Habit, Frequency } from './types';
import { getHabitSuggestions, getWeeklyInsight } from './services/geminiService';

type ActiveTab = 'today' | 'trends' | 'coach' | 'settings';
type AppTheme = 'blue' | 'pink';

const App: React.FC = () => {
  // --- Data State ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habitflow_habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  // --- UI/Theme State ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [coachingMessage, setCoachingMessage] = useState<string>('Welcome back! Ready to crush your goals today?');
  
  const [theme, setTheme] = useState<AppTheme>(() => 
    (localStorage.getItem('habitflow_theme') as AppTheme) || 'blue'
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => 
    localStorage.getItem('habitflow_darkmode') === 'true'
  );

  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    description: '',
    category: 'General',
    frequency: 'daily',
    color: '#6366f1'
  });

  // --- Theme Helper ---
  const themeColors = {
    primary: theme === 'blue' ? 'indigo' : 'rose',
    primaryHex: theme === 'blue' ? '#6366f1' : '#f43f5e',
    secondary: theme === 'blue' ? 'violet' : 'pink',
    light: theme === 'blue' ? 'bg-indigo-50' : 'bg-rose-50',
    text: theme === 'blue' ? 'text-indigo-600' : 'text-rose-600',
    border: theme === 'blue' ? 'border-indigo-100' : 'border-rose-100',
    shadow: theme === 'blue' ? 'shadow-indigo-100' : 'shadow-rose-100',
    gradient: theme === 'blue' ? 'from-indigo-600 to-violet-700' : 'from-rose-500 to-pink-600'
  };

  // --- Persistence & Effects ---
  useEffect(() => {
    localStorage.setItem('habitflow_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habitflow_theme', theme);
    localStorage.setItem('habitflow_darkmode', String(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.replace('bg-slate-50', 'bg-slate-950');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.replace('bg-slate-950', 'bg-slate-50');
    }
  }, [theme, isDarkMode]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (habits.length > 0) {
        try {
          const insight = await getWeeklyInsight(habits);
          if (insight) setCoachingMessage(insight);
        } catch (e) {
          console.error("Failed to fetch insight", e);
        }
      }
    };
    fetchInsight();
  }, [habits.length]);

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
    if (confirm('Delete this habit?')) {
      setHabits(prev => prev.filter(h => h.id !== id));
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
    setAiSuggestions([]);
    setNewHabit({ name: '', description: '', category: 'General', frequency: 'daily', color: themeColors.primaryHex });
    setActiveTab('today');
  };

  const handleAiArchitect = async () => {
    if (!aiGoal.trim()) return;
    setIsAiLoading(true);
    try {
      const suggestions = await getHabitSuggestions(aiGoal);
      setAiSuggestions(suggestions);
    } catch (e) {
      alert("AI Architect had a glitch.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearData = () => {
    if (confirm("Reset everything? This cannot be undone.")) {
      setHabits([]);
      localStorage.removeItem('habitflow_habits');
    }
  };

  // --- Computations ---
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      completions: habits.reduce((acc, h) => acc + (h.completedDates.includes(date) ? 1 : 0), 0)
    }));
  }, [habits]);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCount = habits.filter(h => !h.completedDates.includes(todayStr)).length;

  return (
    <div className={`min-h-[100dvh] transition-colors duration-300 flex flex-col md:flex-row overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-72 border-r flex-col p-8 sticky top-0 h-screen transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className={`p-2 rounded-xl text-white shadow-lg ${theme === 'blue' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'} ${isDarkMode ? 'shadow-none' : ''}`}>
            <Zap size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">HabitFlow</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: 'today', icon: LayoutGrid, label: 'Today' },
            { id: 'trends', icon: TrendingUp, label: 'Analytics' },
            { id: 'coach', icon: Sparkles, label: 'AI Coach' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? `${themeColors.light} ${themeColors.text} font-bold ${isDarkMode ? 'bg-slate-800 text-white' : ''}` 
                  : `text-slate-500 hover:bg-slate-50 ${isDarkMode ? 'hover:bg-slate-800' : ''}`
              }`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </nav>

        <div className={`mt-auto p-5 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : `bg-gradient-to-br from-${themeColors.primary}-50 to-white ${themeColors.border}`}`}>
          <div className={`flex items-center gap-2 font-bold mb-3 ${themeColors.text} ${isDarkMode ? 'text-white' : ''}`}>
            <Sparkles size={18} />
            AI Insight
          </div>
          <p className={`text-sm leading-relaxed italic ${isDarkMode ? 'text-slate-400' : `${themeColors.text}/80`}`}>
            "{coachingMessage}"
          </p>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-5 md:p-10 max-w-4xl mx-auto w-full overflow-x-hidden pb-32 md:pb-10">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${theme === 'blue' ? 'bg-indigo-600' : 'bg-rose-500'}`}>
              <Zap size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tight">HabitFlow</h1>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm ${isDarkMode ? 'border-slate-800' : 'border-white'}`}
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
          </button>
        </header>

        {/* --- Tab Content: TODAY --- */}
        {activeTab === 'today' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section className="mb-8">
              <h2 className={`text-3xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {pendingCount === 0 ? "You're all set! 🎉" : "Good Day!"}
              </h2>
              <p className="text-slate-500 font-medium">
                {pendingCount === 0 
                  ? "Every habit for today is complete." 
                  : `You have ${pendingCount} habits remaining.`}
              </p>
            </section>

            {/* Containing the stats scroll to prevent page jitter */}
            <div className="relative -mx-5 px-5 mb-8 overflow-hidden">
              <section className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <div className={`flex-shrink-0 p-5 rounded-[2rem] shadow-xl w-40 flex flex-col justify-between text-white ${theme === 'blue' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'} ${isDarkMode ? 'shadow-none' : ''}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Top Streak</p>
                  <h3 className="text-3xl font-black">{habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak)) : 0}</h3>
                  <p className="text-[10px] font-medium opacity-80">Days and counting</p>
                </div>
                <div className={`flex-shrink-0 p-5 rounded-[2rem] shadow-sm w-40 flex flex-col justify-between border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Habits</p>
                  <h3 className="text-3xl font-black">{habits.length}</h3>
                  <p className="text-[10px] font-medium text-slate-400">Active tracking</p>
                </div>
                <div className={`flex-shrink-0 p-5 rounded-[2rem] border w-40 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Categories</p>
                  <h3 className="text-3xl font-black">{new Set(habits.map(h => h.category)).size}</h3>
                  <p className="text-[10px] font-medium opacity-80">Diverse routine</p>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Your Routine</h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`hidden md:flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg ${theme === 'blue' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'} ${isDarkMode ? 'shadow-none' : ''}`}
                >
                  <Plus size={18} /> Add Habit
                </button>
              </div>
              
              {habits.length === 0 ? (
                <div className={`py-16 text-center rounded-[2.5rem] border-2 border-dashed px-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Target className={themeColors.text} size={40} />
                  </div>
                  <h4 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ready to start?</h4>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                    Build discipline one small win at a time. Let's create your first habit.
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className={`text-white px-8 py-4 rounded-2xl font-black shadow-xl ${theme === 'blue' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'} ${isDarkMode ? 'shadow-none' : ''}`}
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {habits.map(habit => (
                    <div 
                      key={habit.id}
                      className={`group p-4 rounded-[1.5rem] border transition-all active:scale-[0.98] flex items-center justify-between ${
                        habit.completedDates.includes(todayStr) 
                          ? (isDarkMode ? 'border-emerald-900/50 bg-emerald-900/20' : 'border-emerald-100 bg-emerald-50/20') 
                          : (isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white')
                      }`}
                    >
                      <div className="flex items-center gap-4 max-w-[80%]">
                        <button 
                          onClick={() => handleToggleHabit(habit.id)}
                          className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${
                            habit.completedDates.includes(todayStr) 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                              : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-300 active:bg-slate-200')
                          }`}
                        >
                          <CheckCircle2 size={30} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-black truncate transition-all text-sm md:text-base ${habit.completedDates.includes(todayStr) ? 'text-slate-500 line-through' : (isDarkMode ? 'text-slate-100' : 'text-slate-900')}`}>
                            {habit.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-indigo-400' : themeColors.text}`}>
                              {habit.category}
                            </span>
                            <span className="text-slate-500 text-xs">•</span>
                            <span className="text-xs font-bold text-slate-500">
                              {habit.streak}d streak
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteHabit(habit.id)} className="text-slate-500 hover:text-red-500 p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab Content: TRENDS --- */}
        {activeTab === 'trends' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Analytics</h2>
            <div className={`p-6 rounded-[2.5rem] border shadow-sm mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <TrendingUp size={20} className={themeColors.text} />
                Completion Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColors.primaryHex} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={themeColors.primaryHex} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                        fontWeight: 'bold',
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        color: isDarkMode ? '#f1f5f9' : '#0f172a'
                      }} 
                    />
                    <Area type="monotone" dataKey="completions" stroke={themeColors.primaryHex} fillOpacity={1} fill="url(#colorComp)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-indigo-50 border-indigo-100'}`}>
                <p className={`text-xs font-black uppercase mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Consistency</p>
                <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>84%</h4>
              </div>
              <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className={`text-xs font-black uppercase mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Total Wins</p>
                <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
                  {habits.reduce((acc, h) => acc + h.completedDates.length, 0)}
                </h4>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab Content: COACH --- */}
        {activeTab === 'coach' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Coach</h2>
            
            <div className={`p-8 rounded-[2.5rem] text-white shadow-xl mb-8 bg-gradient-to-br ${themeColors.gradient} ${isDarkMode ? 'shadow-none' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">AI Habit Architect</h3>
                  <p className="opacity-80 text-xs">Transform your goals into routine</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="I want to be more mindful..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 outline-none focus:ring-4 ring-white/20"
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                />
                <button 
                  onClick={handleAiArchitect}
                  disabled={isAiLoading}
                  className="bg-white text-slate-900 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-50 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isAiLoading ? <Zap size={18} className="animate-pulse" /> : <ChevronRight size={18} />}
                  {isAiLoading ? 'Designing...' : 'Architect My Routine'}
                </button>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="mt-8 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Suggested Action Plan</p>
                  {aiSuggestions.map((s, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/20 transition-all"
                      onClick={() => handleAddHabit(s)}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs font-bold opacity-60 uppercase mb-0.5">{s.category}</p>
                        <h4 className="font-black text-sm truncate">{s.name}</h4>
                      </div>
                      <Plus size={20} className="opacity-60 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${isDarkMode ? 'bg-slate-800' : themeColors.light}`} />
              <h3 className={`font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                <MessageSquare size={20} className={themeColors.text} />
                Latest Insight
              </h3>
              <p className={`leading-relaxed font-medium italic relative z-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                "{coachingMessage}"
              </p>
            </div>
          </div>
        )}

        {/* --- Tab Content: SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Profile Settings</h2>

            {/* Profile Card */}
            <div className={`p-8 rounded-[2.5rem] border shadow-sm mb-6 flex flex-col items-center text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`w-24 h-24 rounded-[2rem] border-4 p-1 mb-4 ${theme === 'blue' ? 'border-indigo-100' : 'border-rose-100'} ${isDarkMode ? 'border-slate-800' : ''}`}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-[1.75rem] w-full h-full bg-slate-50 object-cover" alt="Profile" />
              </div>
              <h3 className={`text-xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Felix Habitflow</h3>
              <p className="text-slate-500 text-sm mb-6">User since Oct 2024</p>
              <button className={`w-full py-3 rounded-2xl font-bold border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600'}`}>
                Edit Profile
              </button>
            </div>

            {/* Appearance Section */}
            <div className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest text-slate-400 px-2`}>Appearance</h4>
              
              {/* Dark Mode Toggle */}
              <div className={`p-6 rounded-[2rem] border flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </div>
                  <div>
                    <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dark Mode</p>
                    <p className="text-xs text-slate-500">{isDarkMode ? 'Easier on the eyes' : 'Classic bright look'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Theme Picker */}
              <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-slate-600'}`}>
                    <Palette size={20} />
                  </div>
                  <div>
                    <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>App Theme</p>
                    <p className="text-xs text-slate-500">Choose your accent color</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setTheme('blue')}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === 'blue' ? 'border-indigo-600 bg-indigo-50/10' : 'border-transparent bg-slate-50/50 dark:bg-slate-800/50'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 shadow-lg shadow-indigo-100" />
                    <span className={`text-[10px] font-black uppercase ${theme === 'blue' ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600') : 'text-slate-400'}`}>Sky Blue</span>
                  </button>
                  <button 
                    onClick={() => setTheme('pink')}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === 'pink' ? 'border-rose-500 bg-rose-50/10' : 'border-transparent bg-slate-50/50 dark:bg-slate-800/50'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-500 shadow-lg shadow-rose-100" />
                    <span className={`text-[10px] font-black uppercase ${theme === 'pink' ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') : 'text-slate-400'}`}>Soft Pink</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest text-red-400 px-2`}>Danger Zone</h4>
              <button 
                onClick={clearData}
                className={`w-full p-6 rounded-[2rem] border border-red-100 flex items-center justify-between text-red-500 hover:bg-red-50 transition-all ${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 text-left">
                  <Trash2 size={20} />
                  <span className="font-black text-sm">Clear All Data</span>
                </div>
                <ChevronRight size={18} />
              </button>
              <button className={`w-full p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between text-slate-400 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <LogOut size={20} />
                  <span className="font-black text-sm">Logout</span>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- Mobile Bottom Navigation (Safe Area Aware) --- */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t px-4 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex items-center justify-between z-40 transition-colors ${isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
        <button 
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'today' ? (isDarkMode ? 'text-white' : themeColors.text) : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'today' ? (isDarkMode ? 'bg-slate-800' : themeColors.light) : ''}`}>
            <LayoutGrid size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Today</span>
        </button>
        
        <div className="flex-1 flex justify-center -mt-14 relative z-50">
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`w-16 h-16 text-white rounded-[2rem] flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 ${isDarkMode ? 'border-slate-950 shadow-none' : 'border-slate-50'} ${theme === 'blue' ? 'bg-indigo-600 shadow-indigo-300' : 'bg-rose-500 shadow-rose-300'}`}
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab('trends')}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'trends' ? (isDarkMode ? 'text-white' : themeColors.text) : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'trends' ? (isDarkMode ? 'bg-slate-800' : themeColors.light) : ''}`}>
            <TrendingUp size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Trends</span>
        </button>
        <button 
          onClick={() => setActiveTab('coach')}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'coach' ? (isDarkMode ? 'text-white' : themeColors.text) : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'coach' ? (isDarkMode ? 'bg-slate-800' : themeColors.light) : ''}`}>
            <Sparkles size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Coach</span>
        </button>
      </nav>

      {/* --- Habit Creator Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className={`rounded-t-[3rem] md:rounded-[3rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>New Habit</h3>
                <p className="text-slate-500 text-sm">Define your next victory</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 transition-all ${isDarkMode ? 'bg-slate-800 hover:text-white' : 'bg-slate-100 hover:text-slate-800'}`}>
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-2">What is the habit?</label>
                  <input 
                    type="text" 
                    className={`w-full rounded-[1.25rem] px-6 py-4 outline-none focus:ring-4 font-bold ${isDarkMode ? 'bg-slate-800 text-white border-transparent ring-indigo-900/30' : 'bg-slate-50 border border-slate-200 ring-indigo-50 text-slate-900'}`}
                    placeholder="E.g., 20m Morning Yoga"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Category</label>
                    <div className="relative">
                      <select 
                        className={`w-full appearance-none rounded-[1.25rem] px-6 py-4 outline-none focus:ring-4 font-bold ${isDarkMode ? 'bg-slate-800 text-white border-transparent' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                        value={newHabit.category}
                        onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                      >
                        <option>Health</option>
                        <option>Productivity</option>
                        <option>Fitness</option>
                        <option>Mindset</option>
                        <option>General</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Frequency</label>
                    <div className={`flex gap-2 p-1 rounded-[1.25rem] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      {['daily', 'weekly'].map(f => (
                        <button 
                          key={f}
                          type="button"
                          onClick={() => setNewHabit({...newHabit, frequency: f as Frequency})}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm capitalize transition-all ${newHabit.frequency === f ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-500'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Description</label>
                  <textarea 
                    className={`w-full rounded-[1.25rem] px-6 py-4 outline-none focus:ring-4 font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300 border-transparent ring-indigo-900/30' : 'bg-slate-50 border border-slate-200 text-slate-600 ring-indigo-50'}`}
                    placeholder="Why are you doing this?"
                    rows={3}
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className={`p-8 border-t flex gap-4 pb-[calc(2rem+env(safe-area-inset-bottom))] ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-[1.25rem] font-black text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
              <button 
                onClick={() => handleAddHabit(newHabit)}
                className={`flex-[2] py-4 text-white rounded-[1.25rem] font-black shadow-xl transition-all active:scale-95 ${theme === 'blue' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'} ${isDarkMode ? 'shadow-none' : ''}`}
              >
                Create Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
