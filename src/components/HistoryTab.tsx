import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Search, 
  Calendar, 
  BookOpen, 
  Clock, 
  Check, 
  X, 
  MinusCircle, 
  RefreshCcw, 
  Filter, 
  Plus, 
  CalendarPlus,
  Edit3
} from 'lucide-react';
import { LogEntry, AttendanceStatus } from '../types';
import { formatNiceDate, getLocalDateString } from '../utils';

interface HistoryTabProps {
  logs: LogEntry[];
  onSaveLog: (log: LogEntry) => void;
  onDeleteLog: (id: string) => void;
  subjects: string[];
}

export default function HistoryTab({
  logs,
  onSaveLog,
  onDeleteLog,
  subjects,
}: HistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  
  // Retroactive Form state
  const [showRetroForm, setShowRetroForm] = useState(false);
  const [retroDate, setRetroDate] = useState(() => getLocalDateString());
  const [retroSubject, setRetroSubject] = useState(subjects[0] || '');
  const [retroStatus, setRetroStatus] = useState<AttendanceStatus>('Present');
  const [retroTime, setRetroTime] = useState('');
  // For substitute sub-config inside retroactive form
  const [retroSubstSubject, setRetroSubstSubject] = useState('');
  const [retroSubstStatus, setRetroSubstStatus] = useState<'Present' | 'Absent'>('Present');

  // Interactive editing inside history list
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('Present');
  const [editSubSubject, setEditSubSubject] = useState('');
  const [editSubStatus, setEditSubStatus] = useState<'Present' | 'Absent'>('Present');

  // Filter logs
  const filteredLogs = [...logs]
    .filter((log) => {
      const matchSearch = log.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (log.substituteSubject?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchSubject = filterSubject === 'All' || log.subject === filterSubject || log.substituteSubject === filterSubject;
      return matchSearch && matchSubject;
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

  // Group logs by Date
  const groupedLogs: { [date: string]: LogEntry[] } = {};
  filteredLogs.forEach((log) => {
    if (!groupedLogs[log.date]) {
      groupedLogs[log.date] = [];
    }
    groupedLogs[log.date].push(log);
  });

  const handleAddRetroactiveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retroDate) {
      alert('Please select a date.');
      return;
    }
    if (!retroSubject) {
      alert('Please select a subject.');
      return;
    }

    const isSubstitute = retroStatus === 'Substitute';
    const newLog: LogEntry = {
      id: `manual-${retroDate}-${Date.now()}`,
      date: retroDate,
      subject: retroSubject,
      status: retroStatus,
      periodTime: retroTime || undefined,
      substituteSubject: isSubstitute ? retroSubstSubject : undefined,
      substituteStatus: isSubstitute ? retroSubstStatus : undefined,
      isManual: true, // Treated as a manual makeup/retro addition
    };

    onSaveLog(newLog);
    setShowRetroForm(false);
    setRetroTime('');
  };

  const handleStartEdit = (log: LogEntry) => {
    setEditingLogId(log.id);
    setEditStatus(log.status);
    setEditSubSubject(log.substituteSubject || subjects.find(s => s !== log.subject) || subjects[0] || '');
    setEditSubStatus(log.substituteStatus || 'Present');
  };

  const handleSaveEdit = (log: LogEntry) => {
    const updatedLog: LogEntry = {
      ...log,
      status: editStatus,
      substituteSubject: editStatus === 'Substitute' ? editSubSubject : undefined,
      substituteStatus: editStatus === 'Substitute' ? editSubStatus : undefined,
    };
    onSaveLog(updatedLog);
    setEditingLogId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="history-search"
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              id="history-filter-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full sm:w-44 text-xs font-semibold pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 appearance-none focus:outline-none"
            >
              <option value="All">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Retroactive logger trigger */}
        <button
          onClick={() => {
            if (subjects.length === 0) {
              alert('Add a subject under the Timetable tab first!');
              return;
            }
            setRetroSubject(subjects[0]);
            setRetroSubstSubject(subjects[1] || subjects[0]);
            setShowRetroForm(!showRetroForm);
          }}
          className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Add Custom/Retroactive Attendance Entry</span>
        </button>
      </div>

      {/* Retroactive Logger Drawer */}
      <AnimatePresence>
        {showRetroForm && (
          <motion.form
            onSubmit={handleAddRetroactiveLog}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 overflow-hidden"
          >
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display">
              Add Past / Extra Attendance Entry
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  value={retroDate}
                  onChange={(e) => setRetroDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Subject Name
                </label>
                <select
                  value={retroSubject}
                  onChange={(e) => {
                    setRetroSubject(e.target.value);
                    setRetroSubstSubject(subjects.find(s => s !== e.target.value) || subjects[0] || '');
                  }}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Optional Time */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Optional Time (e.g. 10:00 AM)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:15 - 11:15 AM"
                  value={retroTime}
                  onChange={(e) => setRetroTime(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Attendance Status */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Attendance Status
                </label>
                <select
                  value={retroStatus}
                  onChange={(e) => setRetroStatus(e.target.value as AttendanceStatus)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Substitute">Substitute</option>
                </select>
              </div>
            </div>

            {/* Substitute configuration inside retro form */}
            {retroStatus === 'Substitute' && (
              <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Substitute Specifications
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Subject Taught Instead
                    </label>
                    <select
                      value={retroSubstSubject}
                      onChange={(e) => setRetroSubstSubject(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {subjects.filter(s => s !== retroSubject).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Substitute Attendance
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRetroSubstStatus('Present')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          retroSubstStatus === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setRetroSubstStatus('Absent')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          retroSubstStatus === 'Absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRetroForm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Save Record
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* History Log List */}
      <div className="space-y-6">
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
              No attendance logs found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm || filterSubject !== 'All' 
                ? 'Try adjusting your search query or subject filters.' 
                : 'Mark your schedule from the Today tab or use retroactive addition.'}
            </p>
          </div>
        ) : (
          Object.keys(groupedLogs).map((date) => (
            <div key={date} className="space-y-2">
              {/* Date Header */}
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-display flex items-center gap-1 px-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500/80" />
                <span>{formatNiceDate(date)}</span>
              </h4>

              {/* Date's classes list */}
              <div className="space-y-2">
                {groupedLogs[date].map((log) => {
                  const isEditing = editingLogId === log.id;

                  return (
                    <div
                      key={log.id}
                      id={`history-row-${log.id}`}
                      className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-all gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {log.isManual && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md">
                                Makeup
                              </span>
                            )}
                            {log.periodTime && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {log.periodTime}
                              </span>
                            )}
                          </div>
                          
                          <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                            {log.subject}
                          </h5>

                          {log.status === 'Substitute' && !isEditing && (
                            <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 px-2 py-0.5 rounded-lg inline-block">
                              Substituted by <span className="underline">{log.substituteSubject}</span> ({log.substituteStatus})
                            </p>
                          )}
                        </div>

                        {/* Status tag and actions */}
                        <div className="flex items-center gap-2.5 self-end sm:self-center">
                          {/* Log status badge */}
                          {!isEditing && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                              log.status === 'Present'
                                ? 'bg-emerald-100/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/20'
                                : log.status === 'Absent'
                                ? 'bg-rose-100/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/20'
                                : log.status === 'Cancelled'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/20'
                                : 'bg-sky-100/80 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-200/20'
                            }`}>
                              {log.status === 'Present' && <Check className="w-3.5 h-3.5" />}
                              {log.status === 'Absent' && <X className="w-3.5 h-3.5" />}
                              {log.status === 'Cancelled' && <MinusCircle className="w-3.5 h-3.5" />}
                              {log.status === 'Substitute' && <RefreshCcw className="w-3.5 h-3.5" />}
                              <span>{log.status}</span>
                            </span>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            {!isEditing ? (
                              <>
                                <button
                                  onClick={() => handleStartEdit(log)}
                                  className="p-1.5 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                                  title="Edit Entry Status"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteLog(log.id)}
                                  className="p-1.5 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleSaveEdit(log)}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingLogId(null)}
                                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg text-xs font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Editing panel (Inline drawer) */}
                      {isEditing && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                              Modify Attendance Status
                            </label>
                            <div className="grid grid-cols-4 gap-1">
                              {['Present', 'Absent', 'Cancelled', 'Substitute'].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setEditStatus(s as AttendanceStatus)}
                                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                    editStatus === s
                                      ? s === 'Present' ? 'bg-emerald-600 text-white'
                                        : s === 'Absent' ? 'bg-rose-600 text-white'
                                        : s === 'Cancelled' ? 'bg-slate-500 text-white'
                                        : 'bg-sky-600 text-white'
                                      : 'bg-white dark:bg-slate-950 text-slate-600 border border-slate-200 dark:border-slate-850'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>

                          {editStatus === 'Substitute' && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                                  Subject Instead
                                </label>
                                <select
                                  value={editSubSubject}
                                  onChange={(e) => setEditSubSubject(e.target.value)}
                                  className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850"
                                >
                                  {subjects.filter(s => s !== log.subject).map((sub) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                                  Your Attendance
                                </label>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditSubStatus('Present')}
                                    className={`flex-1 py-1 rounded-lg text-xs font-bold ${
                                      editSubStatus === 'Present' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-950 text-slate-600 border'
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditSubStatus('Absent')}
                                    className={`flex-1 py-1 rounded-lg text-xs font-bold ${
                                      editSubStatus === 'Absent' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-950 text-slate-600 border'
                                    }`}
                                  >
                                    Absent
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
