import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  X, 
  MinusCircle, 
  RefreshCcw, 
  Plus, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { LogEntry, Timetable, DayOfWeek, AttendanceStatus } from '../types';
import { getDayOfWeekFromDate, formatNiceDate, getLocalDateString } from '../utils';

interface TodayTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  timetable: Timetable;
  logs: LogEntry[];
  subjects: string[];
  onSaveLog: (log: LogEntry) => void;
  onDeleteLog: (id: string) => void;
}

export default function TodayTab({
  selectedDate,
  setSelectedDate,
  timetable,
  logs,
  subjects,
  onSaveLog,
  onDeleteLog,
}: TodayTabProps) {
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualSubject, setManualSubject] = useState(subjects[0] || '');
  const [manualStatus, setManualStatus] = useState<'Present' | 'Absent'>('Present');
  const [manualTime, setManualTime] = useState('');

  // Track which scheduled period is currently expanding its "Substitute" config
  const [substitutePeriodId, setSubstitutePeriodId] = useState<string | null>(null);
  const [substituteSubject, setSubstituteSubject] = useState<string>('');
  const [substituteStatus, setSubstituteStatus] = useState<'Present' | 'Absent'>('Present');

  const dayOfWeek = getDayOfWeekFromDate(selectedDate);
  const isSunday = dayOfWeek === 'Sunday' as any;

  // Find scheduled periods for this day
  const scheduledPeriods = isSunday ? [] : (timetable[dayOfWeek] || []);

  // Find logs for this specific date
  const dateLogs = logs.filter((log) => log.date === selectedDate);

  // Helper to find log for a specific scheduled period
  const getPeriodLog = (periodId: string) => {
    return dateLogs.find((log) => log.periodId === periodId);
  };

  const handleQuickMark = (
    subject: string, 
    status: AttendanceStatus, 
    periodId?: string, 
    periodTime?: string
  ) => {
    if (status === 'Substitute') {
      // Open the substitute selector
      setSubstitutePeriodId(periodId || null);
      // Default substitute subject to first subject that isn't the current one
      const fallbackSub = subjects.find(s => s !== subject) || subjects[0] || '';
      setSubstituteSubject(fallbackSub);
      setSubstituteStatus('Present');
      return;
    }

    const existing = periodId ? getPeriodLog(periodId) : null;
    const newLog: LogEntry = {
      id: existing?.id || `log-${selectedDate}-${periodId || Date.now()}`,
      date: selectedDate,
      subject,
      status,
      periodId,
      periodTime,
      isManual: false,
    };
    onSaveLog(newLog);
    // Close substitute selector if we quick-marked something else
    if (periodId === substitutePeriodId) {
      setSubstitutePeriodId(null);
    }
  };

  const handleSaveSubstitute = (originalSubject: string, periodId: string, periodTime?: string) => {
    if (!substituteSubject) return;
    
    const existing = getPeriodLog(periodId);
    const newLog: LogEntry = {
      id: existing?.id || `log-${selectedDate}-${periodId}`,
      date: selectedDate,
      subject: originalSubject,
      status: 'Substitute',
      substituteSubject,
      substituteStatus,
      periodId,
      periodTime,
      isManual: false,
    };
    onSaveLog(newLog);
    setSubstitutePeriodId(null);
  };

  const handleAddManualClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSubject) return;

    const newLog: LogEntry = {
      id: `manual-${selectedDate}-${Date.now()}`,
      date: selectedDate,
      subject: manualSubject,
      status: manualStatus,
      periodTime: manualTime || undefined,
      isManual: true,
    };

    onSaveLog(newLog);
    setShowAddManual(false);
    setManualTime('');
  };

  const adjustDate = (days: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, (month || 1) - 1, day || 1);
    d.setDate(d.getDate() + days);
    setSelectedDate(getLocalDateString(d));
    setSubstitutePeriodId(null);
  };

  const isCurrentToday = selectedDate === getLocalDateString();

  // Separate manual classes logged on this date
  const manualLogs = dateLogs.filter((log) => log.isManual);

  return (
    <div className="space-y-6">
      {/* Date Navigation App Bar */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xs">
        <button 
          onClick={() => adjustDate(-1)}
          className="p-2.5 rounded-2xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-semibold font-display">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <span>{formatNiceDate(selectedDate)}</span>
            {isCurrentToday && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                Today
              </span>
            )}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 tracking-wide uppercase">
            {isSunday ? 'Sunday' : dayOfWeek}
          </div>
        </div>

        <button 
          onClick={() => adjustDate(1)}
          className="p-2.5 rounded-2xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Retroactive Date Picker Trigger */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>Jump to date:</span>
          </label>
          {!isCurrentToday && (
            <button
              type="button"
              onClick={() => {
                setSelectedDate(getLocalDateString());
                setSubstitutePeriodId(null);
              }}
              className="text-xs font-semibold px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors"
            >
              Back to Today
            </button>
          )}
        </div>
        <input 
          id="retro-date-input"
          type="date" 
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) {
              setSelectedDate(e.target.value);
              setSubstitutePeriodId(null);
            }
          }}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Scheduled Classes section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-3 font-display">
          Scheduled Timetable
        </h3>

        {isSunday ? (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2.5" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Sunday — Holiday</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 max-w-xs mx-auto">
              There are no classes scheduled for Sundays. You can log manual makeup classes if needed!
            </p>
          </div>
        ) : scheduledPeriods.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No classes scheduled</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Set up your weekly timetable for <span className="font-semibold">{dayOfWeek}</span> in the Timetable tab.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledPeriods.map((period) => {
              const log = getPeriodLog(period.id);
              const isSubstituting = substitutePeriodId === period.id;

              return (
                <div 
                  key={period.id}
                  id={`period-card-${period.id}`}
                  className={`border rounded-2xl p-4 transition-all ${
                    log?.status === 'Present'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30'
                      : log?.status === 'Absent'
                      ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/60 dark:border-rose-900/30'
                      : log?.status === 'Cancelled'
                      ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80'
                      : log?.status === 'Substitute'
                      ? 'bg-sky-50/40 dark:bg-sky-950/10 border-sky-200/60 dark:border-sky-900/30'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-mono">
                          Period
                        </span>
                        {period.time && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {period.time}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                        {period.subject}
                      </h4>
                      {log?.status === 'Substitute' && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-sky-100/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-lg border border-sky-200/40 dark:border-sky-800/30">
                          <RefreshCcw className="w-3 h-3" />
                          <span>
                            Substituted by: <span className="underline">{log.substituteSubject}</span> ({log.substituteStatus})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Logger Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Present */}
                      <button
                        id={`btn-present-${period.id}`}
                        onClick={() => handleQuickMark(period.subject, 'Present', period.id, period.time)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                          log?.status === 'Present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      {/* Absent */}
                      <button
                        id={`btn-absent-${period.id}`}
                        onClick={() => handleQuickMark(period.subject, 'Absent', period.id, period.time)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                          log?.status === 'Absent'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      {/* Cancelled */}
                      <button
                        id={`btn-cancelled-${period.id}`}
                        onClick={() => handleQuickMark(period.subject, 'Cancelled', period.id, period.time)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                          log?.status === 'Cancelled'
                            ? 'bg-slate-500 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>Cancelled</span>
                      </button>

                      {/* Substitute */}
                      <button
                        id={`btn-substitute-${period.id}`}
                        onClick={() => handleQuickMark(period.subject, 'Substitute', period.id, period.time)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                          log?.status === 'Substitute' && !isSubstituting
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/20 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>Substitute</span>
                      </button>
                    </div>
                  </div>

                  {/* Substitute Drawer Config */}
                  <AnimatePresence>
                    {isSubstituting && (
                      <motion.div
                        id={`substitute-drawer-${period.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-3 overflow-hidden"
                      >
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          Substitute Config — What was taught instead?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                              Substitute Subject
                            </label>
                            <select
                              value={substituteSubject}
                              onChange={(e) => setSubstituteSubject(e.target.value)}
                              className="w-full text-xs font-medium px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                              {subjects.filter(s => s !== period.subject).map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                              ))}
                              {/* Include originally scheduled subject in case of error, but filtered above */}
                              <option value={period.subject}>{period.subject} (Same)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                              Your Attendance Status
                            </label>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSubstituteStatus('Present')}
                                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  substituteStatus === 'Present'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => setSubstituteStatus('Absent')}
                                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  substituteStatus === 'Absent'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setSubstitutePeriodId(null)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveSubstitute(period.subject, period.id, period.time)}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
                          >
                            Save Substitute
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual / Extra Makeup classes section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-display">
            Extra & Makeup Classes
          </h3>
          <button
            onClick={() => setShowAddManual(!showAddManual)}
            className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Makeup Class</span>
          </button>
        </div>

        {/* Expandable Manual Form */}
        <AnimatePresence>
          {showAddManual && (
            <motion.form
              onSubmit={handleAddManualClass}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4 space-y-4 overflow-hidden"
            >
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Log Extra / Makeup Class
              </h4>

              {subjects.length === 0 ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Please add at least one subject in the 'Timetable' tab first.
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Subject
                    </label>
                    <select
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Optional Time (e.g. 14:00)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 02:00 PM"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Status
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setManualStatus('Present')}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            manualStatus === 'Present'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualStatus('Absent')}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            manualStatus === 'Absent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                    <button
                      type="button"
                      onClick={() => setShowAddManual(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Log Makeup Class
                    </button>
                  </div>
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {manualLogs.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic px-1">
            No extra/makeup classes logged for this date.
          </p>
        ) : (
          <div className="space-y-2">
            {manualLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between p-3 border rounded-xl bg-white dark:bg-slate-950 transition-all ${
                  log.status === 'Present'
                    ? 'border-emerald-100 dark:border-emerald-950 bg-emerald-50/10 dark:bg-emerald-950/5'
                    : 'border-rose-100 dark:border-rose-950 bg-rose-50/10 dark:bg-rose-950/5'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md">
                      Makeup
                    </span>
                    {log.periodTime && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {log.periodTime}
                      </span>
                    )}
                  </div>
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {log.subject}
                  </h5>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold ${
                    log.status === 'Present'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                  }`}>
                    {log.status === 'Present' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>{log.status}</span>
                  </span>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    title="Delete makeup log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
