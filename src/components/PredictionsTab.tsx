import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  Minus, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  TrendingDown, 
  Info 
} from 'lucide-react';
import { LogEntry, AppSettings } from '../types';
import { calculateSubjectStats } from '../utils';

interface PredictionsTabProps {
  logs: LogEntry[];
  subjects: string[];
  settings: AppSettings;
}

export default function PredictionsTab({
  logs,
  subjects,
  settings,
}: PredictionsTabProps) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');
  const [classesToSkip, setClassesToSkip] = useState(0);
  const [classesToAttend, setClassesToAttend] = useState(0);

  // Reset counters when subject changes
  useEffect(() => {
    setClassesToSkip(0);
    setClassesToAttend(0);
  }, [selectedSubject]);

  // Set default subject if none selected and subjects exist
  useEffect(() => {
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const stats = selectedSubject 
    ? calculateSubjectStats(selectedSubject, logs, settings.threshold)
    : null;

  // Compute simulated prediction
  let simulatedPercentage = 100;
  let simulatedHeld = 0;
  let simulatedAttended = 0;
  let isSimulatedSafe = true;

  if (stats) {
    simulatedHeld = stats.held + classesToSkip + classesToAttend;
    simulatedAttended = stats.attended + classesToAttend;
    simulatedPercentage = simulatedHeld === 0 ? 100 : (simulatedAttended / simulatedHeld) * 100;
    isSimulatedSafe = simulatedPercentage >= settings.threshold;
  }

  const changeSkip = (amt: number) => {
    setClassesToSkip((prev) => Math.max(0, prev + amt));
  };

  const changeAttend = (amt: number) => {
    setClassesToAttend((prev) => Math.max(0, prev + amt));
  };

  return (
    <div className="space-y-6">
      {/* Selector Heading Card */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
              Prediction Sandbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate skipping or attending future classes to see how it affects your targets
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please add subjects in the Timetable tab first to start planning.
          </p>
        ) : (
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Select Subject to Predict
            </label>
            <select
              id="prediction-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Current Stats Ribbon */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl">
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400">Current</span>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {stats.percentage.toFixed(1)}%
              </p>
            </div>
            <div className="text-center border-x border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[9px] uppercase font-bold text-slate-400">Attended</span>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {stats.attended}
              </p>
            </div>
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400">Total Held</span>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {stats.held}
              </p>
            </div>
          </div>

          {/* Planning Sandbox Inputs */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Scenario Builder
            </h4>

            {/* Skipping scenario */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Classes to SKIP
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulate missed lectures (Absent, held increases)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => changeSkip(-1)}
                  className="p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {classesToSkip}
                </span>
                <button
                  onClick={() => changeSkip(1)}
                  className="p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Attending scenario */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Classes to ATTEND
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulate future attendance (Present, both held & attended increase)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => changeAttend(-1)}
                  className="p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {classesToAttend}
                </span>
                <button
                  onClick={() => changeAttend(1)}
                  className="p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Prediction Outcome Card */}
          <div className={`p-5 rounded-3xl border transition-all duration-300 ${
            isSimulatedSafe 
              ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/15 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-100' 
              : 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/15 dark:border-rose-900/40 text-rose-900 dark:text-rose-100'
          }`}>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {isSimulatedSafe ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </div>

              <div className="space-y-2 flex-1">
                <h4 className="text-base font-extrabold tracking-tight font-display">
                  {isSimulatedSafe ? 'SAFE SCENARIO' : 'RISKY SCENARIO'}
                </h4>

                <div className="flex flex-col sm:flex-row items-baseline gap-2">
                  <span className="text-3xl font-black font-mono">
                    {simulatedPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs font-semibold opacity-80">
                    attendance ({simulatedAttended} / {simulatedHeld} classes)
                  </span>
                </div>

                <p className="text-xs leading-relaxed opacity-90 font-medium">
                  {isSimulatedSafe ? (
                    `Your attendance remains at or above the required threshold of ${settings.threshold}%. Playing out this scenario keeps you on safe footing for your exams.`
                  ) : (
                    `WARNING: Your attendance drops to ${simulatedPercentage.toFixed(1)}%, falling below your target threshold of ${settings.threshold}%. This may prevent you from appearing for exams. We advise against this skipping schedule!`
                  )}
                </p>

                {/* Trend indicators */}
                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-[10px] font-bold font-mono uppercase opacity-75">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Attending: +{classesToAttend}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    <span>Skipping: +{classesToSkip}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Helper Card */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-300">How predictions are calculated:</span> Adding skips increases the denominator (Classes Held) only, pushing percentages down. Adding attends increases both numerator and denominator, pushing percentages up towards 100%.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
