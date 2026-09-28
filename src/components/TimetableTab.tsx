import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  BookOpen, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  BookOpenCheck,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { Timetable, DayOfWeek, Period, DAYS_OF_WEEK } from '../types';

interface TimetableTabProps {
  timetable: Timetable;
  setTimetable: (t: Timetable) => void;
  subjects: string[];
  setSubjects: (s: string[]) => void;
  logs: any[];
}

export default function TimetableTab({
  timetable,
  setTimetable,
  subjects,
  setSubjects,
  logs,
}: TimetableTabProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  
  // Subject Manager States
  const [newSubject, setNewSubject] = useState('');
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editSubjectValue, setEditSubjectValue] = useState('');
  
  // Timetable Period Form States
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [periodTime, setPeriodTime] = useState('');
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  // Add a new global subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = newSubject.trim();
    if (!cleanSub) return;
    if (subjects.includes(cleanSub)) {
      alert('Subject already exists!');
      return;
    }
    setSubjects([...subjects, cleanSub]);
    setNewSubject('');
    if (!selectedSubject) setSelectedSubject(cleanSub);
  };

  // Delete a global subject
  const handleDeleteSubject = (subToDelete: string) => {
    const hasLogs = logs.some((l) => l.subject === subToDelete || l.substituteSubject === subToDelete);
    const hasTimetable = Object.values(timetable).some((periods) => 
      periods.some((p) => p.subject === subToDelete)
    );

    if (hasLogs || hasTimetable) {
      if (!confirm(`Warning: "${subToDelete}" is being used in your timetable or past attendance logs. Deleting it will cause inconsistencies. Are you sure you want to delete?`)) {
        return;
      }
    }

    setSubjects(subjects.filter((s) => s !== subToDelete));
    // Clean up timetable periods of this subject
    const updatedTimetable = { ...timetable };
    DAYS_OF_WEEK.forEach((day) => {
      updatedTimetable[day] = updatedTimetable[day].filter((p) => p.subject !== subToDelete);
    });
    setTimetable(updatedTimetable);
  };

  // Start editing a global subject
  const startEditSubject = (sub: string) => {
    setEditingSubject(sub);
    setEditSubjectValue(sub);
  };

  // Save edited subject name
  const saveEditSubject = (oldName: string) => {
    const cleanNewName = editSubjectValue.trim();
    if (!cleanNewName || oldName === cleanNewName) {
      setEditingSubject(null);
      return;
    }

    if (subjects.includes(cleanNewName)) {
      alert('A subject with this name already exists.');
      return;
    }

    // Update subjects list
    setSubjects(subjects.map((s) => (s === oldName ? cleanNewName : s)));

    // Update all occurrences in timetable
    const updatedTimetable = { ...timetable };
    DAYS_OF_WEEK.forEach((day) => {
      updatedTimetable[day] = updatedTimetable[day].map((p) => 
        p.subject === oldName ? { ...p, subject: cleanNewName } : p
      );
    });
    setTimetable(updatedTimetable);

    setEditingSubject(null);
  };

  // Add / Edit period on the active day's schedule
  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSub = selectedSubject || subjects[0];
    if (!activeSub) {
      alert('Please add a subject first.');
      return;
    }

    const currentDayPeriods = timetable[activeDay] || [];

    if (editingPeriodId) {
      // Edit mode
      const updatedPeriods = currentDayPeriods.map((p) => 
        p.id === editingPeriodId 
          ? { ...p, subject: activeSub, time: periodTime.trim() || undefined }
          : p
      );
      setTimetable({
        ...timetable,
        [activeDay]: updatedPeriods
      });
      setEditingPeriodId(null);
    } else {
      // Add mode
      const newPeriod: Period = {
        id: `period-${Date.now()}`,
        subject: activeSub,
        time: periodTime.trim() || undefined,
      };
      setTimetable({
        ...timetable,
        [activeDay]: [...currentDayPeriods, newPeriod]
      });
    }

    // Reset Form
    setShowAddPeriod(false);
    setPeriodTime('');
    setEditingPeriodId(null);
  };

  // Edit period trigger
  const triggerEditPeriod = (period: Period) => {
    setSelectedSubject(period.subject);
    setPeriodTime(period.time || '');
    setEditingPeriodId(period.id);
    setShowAddPeriod(true);
  };

  // Delete a period from the active day's schedule
  const handleDeletePeriod = (id: string) => {
    const currentDayPeriods = timetable[activeDay] || [];
    setTimetable({
      ...timetable,
      [activeDay]: currentDayPeriods.filter((p) => p.id !== id)
    });
  };

  const currentDayPeriods = timetable[activeDay] || [];

  return (
    <div className="space-y-6">
      {/* 1. Subject Manager */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
              Subject Manager
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add and manage your college courses
            </p>
          </div>
        </div>

        {/* Add Subject Form */}
        <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
          <input
            id="new-subject-input"
            type="text"
            placeholder="e.g. Physics II, Discrete Math"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Add
          </button>
        </form>

        {/* Subjects List */}
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
          {subjects.map((sub) => {
            const isEditing = editingSubject === sub;
            return (
              <div
                key={sub}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editSubjectValue}
                      onChange={(e) => setEditSubjectValue(e.target.value)}
                      className="px-1 py-0.5 rounded border border-indigo-400 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditSubject(sub)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingSubject(null)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{sub}</span>
                    <button
                      onClick={() => startEditSubject(sub)}
                      className="p-1 hover:text-indigo-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md"
                      title="Edit Subject Name"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub)}
                      className="p-1 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
          {subjects.length === 0 && (
            <p className="text-xs text-slate-400 italic">No subjects added yet. Add some courses above!</p>
          )}
        </div>
      </div>

      {/* 2. Timetable Setup */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>Weekly Timetable</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set your scheduled classes for each day of the week
            </p>
          </div>

          <button
            onClick={() => {
              if (subjects.length === 0) {
                alert('Add a subject under the "Subject Manager" first!');
                return;
              }
              setEditingPeriodId(null);
              setPeriodTime('');
              setSelectedSubject(subjects[0]);
              setShowAddPeriod(!showAddPeriod);
            }}
            className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </div>

        {/* Mon-Sat Day Pills navigation */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => {
                setActiveDay(day);
                setEditingPeriodId(null);
                setShowAddPeriod(false);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeDay === day
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>

        {/* Expandable Add Period Form */}
        <AnimatePresence>
          {showAddPeriod && (
            <motion.form
              onSubmit={handleSavePeriod}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 overflow-hidden"
            >
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {editingPeriodId ? 'Edit Class Period' : `Add Class Period to ${activeDay}`}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Select Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Optional Time (e.g. 09:00 - 10:00)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 - 10:00 AM"
                    value={periodTime}
                    onChange={(e) => setPeriodTime(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPeriod(false);
                    setEditingPeriodId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
                >
                  {editingPeriodId ? 'Save Changes' : 'Add Period'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Periods List for selected Day */}
        <div className="space-y-3">
          {currentDayPeriods.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-6 text-center">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Holiday! No classes scheduled on {activeDay}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tap 'Add Class' above to define a period for this day.
              </p>
            </div>
          ) : (
            currentDayPeriods.map((period, index) => (
              <div
                key={period.id}
                id={`period-setup-${period.id}`}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:shadow-xs transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md font-mono">
                      Period #{index + 1}
                    </span>
                    {period.time && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {period.time}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {period.subject}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => triggerEditPeriod(period)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all cursor-pointer"
                    title="Edit Period"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePeriod(period.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                    title="Delete Period"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
