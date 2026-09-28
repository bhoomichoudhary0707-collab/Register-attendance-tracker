import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarDays, 
  History, 
  CalendarRange, 
  Sparkles, 
  Sun, 
  Moon, 
  GraduationCap,
  Percent,
  HelpCircle,
  X
} from 'lucide-react';

import { Timetable, LogEntry, AppSettings, DAYS_OF_WEEK } from './types';
import { getLocalDateString } from './utils';
import { DEFAULT_SUBJECTS, DEFAULT_TIMETABLE, generateSampleLogs } from './data/initialData';

import TodayTab from './components/TodayTab';
import AnalyticsTab from './components/AnalyticsTab';
import PredictionsTab from './components/PredictionsTab';
import TimetableTab from './components/TimetableTab';
import HistoryTab from './components/HistoryTab';

type TabType = 'today' | 'analytics' | 'predictions' | 'timetable' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  // States
  const [subjects, setSubjects] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<Timetable>(() => {
    // Start with empty to load in useEffect
    return {} as Timetable;
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ threshold: 75 });

  // Automatically update the displayed date as days change (e.g. crossing midnight or waking device)
  useEffect(() => {
    let lastKnownToday = getLocalDateString();

    const checkDateRollover = () => {
      const currentToday = getLocalDateString();
      if (currentToday !== lastKnownToday) {
        // Day rolled over. If the user was viewing the previous "today", roll it forward automatically
        setSelectedDate((prevDate) => {
          if (prevDate === lastKnownToday) {
            return currentToday;
          }
          return prevDate;
        });
        lastKnownToday = currentToday;
      }
    };

    // Check periodically
    const timer = setInterval(checkDateRollover, 30000);

    // Also check on visibility change or window focus
    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        checkDateRollover();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  // Initial load and hydration
  useEffect(() => {
    // 1. Dark Mode Hydration
    const localDark = localStorage.getItem('register_dark_mode') === 'true';
    setDarkMode(localDark);
    if (localDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. State Hydration
    const storedSubjects = localStorage.getItem('register_subjects');
    const storedTimetable = localStorage.getItem('register_timetable');
    const storedLogs = localStorage.getItem('register_logs');
    const storedSettings = localStorage.getItem('register_settings');

    let loadedSubjects: string[] = [];
    let loadedTimetable: Timetable = {} as Timetable;

    if (storedSubjects) {
      loadedSubjects = JSON.parse(storedSubjects);
      setSubjects(loadedSubjects);
    } else {
      loadedSubjects = DEFAULT_SUBJECTS;
      setSubjects(DEFAULT_SUBJECTS);
      localStorage.setItem('register_subjects', JSON.stringify(DEFAULT_SUBJECTS));
      setShowWelcome(true); // Show help modal on first ever load
    }

    if (storedTimetable) {
      loadedTimetable = JSON.parse(storedTimetable);
      setTimetable(loadedTimetable);
    } else {
      loadedTimetable = DEFAULT_TIMETABLE;
      setTimetable(DEFAULT_TIMETABLE);
      localStorage.setItem('register_timetable', JSON.stringify(DEFAULT_TIMETABLE));
    }

    if (storedLogs) {
      const parsedLogs: LogEntry[] = JSON.parse(storedLogs);
      // If stored logs only contain old hard-coded July 2026 sample logs, refresh them relative to current local date
      const isOnlyOldSampleLogs = parsedLogs.length > 0 && 
        parsedLogs.every((l) => l.id.startsWith('sample-2026-07-'));

      if (isOnlyOldSampleLogs) {
        const sampleLogs = generateSampleLogs(loadedTimetable, loadedSubjects);
        setLogs(sampleLogs);
        localStorage.setItem('register_logs', JSON.stringify(sampleLogs));
      } else {
        setLogs(parsedLogs);
      }
    } else {
      // Pre-populate with sample logs relative to current date
      const sampleLogs = generateSampleLogs(loadedTimetable, loadedSubjects);
      setLogs(sampleLogs);
      localStorage.setItem('register_logs', JSON.stringify(sampleLogs));
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      const defaultSettings = { threshold: 75 };
      setSettings(defaultSettings);
      localStorage.setItem('register_settings', JSON.stringify(defaultSettings));
    }
  }, []);

  // Sync helpers
  const handleSetSubjects = (newSubs: string[]) => {
    setSubjects(newSubs);
    localStorage.setItem('register_subjects', JSON.stringify(newSubs));
  };

  const handleSetTimetable = (newTimetable: Timetable) => {
    setTimetable(newTimetable);
    localStorage.setItem('register_timetable', JSON.stringify(newTimetable));
  };

  const handleSaveLog = (newLog: LogEntry) => {
    const updated = logs.some((l) => l.id === newLog.id)
      ? logs.map((l) => (l.id === newLog.id ? newLog : l))
      : [...logs, newLog];
    setLogs(updated);
    localStorage.setItem('register_logs', JSON.stringify(updated));
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    localStorage.setItem('register_logs', JSON.stringify(updated));
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('register_settings', JSON.stringify(newSettings));
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('register_dark_mode', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Outer Container for Responsive Desktop Frames */}
      <div className="max-w-md md:max-w-lg mx-auto bg-slate-100 dark:bg-slate-950 min-h-screen flex flex-col relative md:shadow-2xl md:border-x md:border-slate-200/50 md:dark:border-slate-900">
        
        {/* App Bar / Header */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-900 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight font-display text-indigo-600 dark:text-indigo-400">
                Register
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase font-mono">
                College Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Helper Button */}
            <button
              onClick={() => setShowWelcome(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
              title="Help & Info"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* Dynamic Tab Panel Container */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-32">
          {timetable.Monday ? ( // wait until timetable is hydrated
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'today' && (
                  <TodayTab
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    timetable={timetable}
                    logs={logs}
                    subjects={subjects}
                    onSaveLog={handleSaveLog}
                    onDeleteLog={handleDeleteLog}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab
                    logs={logs}
                    subjects={subjects}
                    settings={settings}
                    onChangeSettings={handleSettingsChange}
                  />
                )}
                {activeTab === 'predictions' && (
                  <PredictionsTab
                    logs={logs}
                    subjects={subjects}
                    settings={settings}
                  />
                )}
                {activeTab === 'timetable' && (
                  <TimetableTab
                    timetable={timetable}
                    setTimetable={handleSetTimetable}
                    subjects={subjects}
                    setSubjects={handleSetSubjects}
                    logs={logs}
                  />
                )}
                {activeTab === 'history' && (
                  <HistoryTab
                    logs={logs}
                    onSaveLog={handleSaveLog}
                    onDeleteLog={handleDeleteLog}
                    subjects={subjects}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 md:absolute bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-900 py-2.5 px-4 z-40 shadow-xl max-w-md md:max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            {/* Today */}
            <button
              id="tab-today"
              onClick={() => {
                setActiveTab('today');
                setSelectedDate(getLocalDateString());
              }}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${
                activeTab === 'today'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <CalendarDays className="w-5.5 h-5.5" />
              <span className="text-[10px]">Today</span>
            </button>

            {/* Analytics */}
            <button
              id="tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${
                activeTab === 'analytics'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Percent className="w-5.5 h-5.5" />
              <span className="text-[10px]">Analytics</span>
            </button>

            {/* Predictions */}
            <button
              id="tab-predictions"
              onClick={() => setActiveTab('predictions')}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${
                activeTab === 'predictions'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Sparkles className="w-5.5 h-5.5" />
              <span className="text-[10px]">Predict</span>
            </button>

            {/* Timetable */}
            <button
              id="tab-timetable"
              onClick={() => setActiveTab('timetable')}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${
                activeTab === 'timetable'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <CalendarRange className="w-5.5 h-5.5" />
              <span className="text-[10px]">Timetable</span>
            </button>

            {/* History */}
            <button
              id="tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${
                activeTab === 'history'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <History className="w-5.5 h-5.5" />
              <span className="text-[10px]">History</span>
            </button>
          </div>
        </nav>

        {/* Welcome & Info Dialog */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-indigo-500" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 font-display">
                      Welcome to Register!
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowWelcome(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    <strong>Register</strong> is your offline college attendance tracker built to make staying above your target percentage trivial.
                  </p>
                  <p className="bg-indigo-50 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 font-medium text-indigo-800 dark:text-indigo-300">
                    💡 We have pre-populated a <strong>2-week sample history</strong> and standard college subjects so you can see live stats right away!
                  </p>
                  <ul className="space-y-1 list-disc pl-4 font-medium text-[11px]">
                    <li><strong>Today:</strong> Tap once to log daily schedule attendance.</li>
                    <li><strong>Analytics:</strong> View charts and configure target thresholds.</li>
                    <li><strong>Predict:</strong> Sandbox skipping scenarios before you skip.</li>
                    <li><strong>Timetable:</strong> Setup Mon-Sat weekly periods.</li>
                    <li><strong>History:</strong> Browse past class logs and edit records.</li>
                  </ul>
                  <p className="text-[10px] font-bold text-slate-400 uppercase font-mono text-center pt-1">
                    No Signups • 100% Offline LocalStorage
                  </p>
                </div>

                <button
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all"
                >
                  Get Started
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
