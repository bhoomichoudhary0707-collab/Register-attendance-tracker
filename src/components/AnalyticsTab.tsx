import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Percent, 
  Settings2, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpRight 
} from 'lucide-react';
import { LogEntry, AppSettings } from '../types';
import { calculateSubjectStats } from '../utils';

interface AnalyticsTabProps {
  logs: LogEntry[];
  subjects: string[];
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
}

export default function AnalyticsTab({
  logs,
  subjects,
  settings,
  onChangeSettings,
}: AnalyticsTabProps) {
  // Calculate stats for all subjects
  const subjectStatsList = subjects.map((sub) => 
    calculateSubjectStats(sub, logs, settings.threshold)
  );

  // Calculate overall stats
  let totalAttended = 0;
  let totalHeld = 0;

  subjectStatsList.forEach((stat) => {
    totalAttended += stat.attended;
    totalHeld += stat.held;
  });

  const overallPercentage = totalHeld === 0 ? 100 : (totalAttended / totalHeld) * 100;
  const isOverallSafe = overallPercentage >= settings.threshold;

  // Count how many are safe vs at risk
  const safeCount = subjectStatsList.filter((s) => s.percentage >= settings.threshold).length;
  const atRiskCount = subjects.length - safeCount;

  // Prepare data for the Bar Chart
  const chartData = subjectStatsList.map((s) => ({
    name: s.subject.length > 15 ? s.subject.substring(0, 12) + '...' : s.subject,
    fullName: s.subject,
    Percentage: parseFloat(s.percentage.toFixed(1)),
    Held: s.held,
    Attended: s.attended,
  }));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChangeSettings({ threshold: val });
    }
  };

  const adjustThreshold = (amt: number) => {
    const nextVal = Math.min(100, Math.max(50, settings.threshold + amt));
    onChangeSettings({ threshold: nextVal });
  };

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-slate-100 p-3 rounded-xl border border-slate-700 shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-200">{data.fullName}</p>
          <p className="font-medium">Attendance: <span className="text-emerald-400 font-bold">{data.Percentage}%</span></p>
          <p className="text-slate-400">Classes Attended: {data.Attended} / {data.Held}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Target Configurator Setting */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-slate-900 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-950/50 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
                Minimum Threshold Target
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust your college's minimum attendance requirement
              </p>
            </div>
          </div>
          
          {/* Threshold Badge & Controls */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
            <button
              onClick={() => adjustThreshold(-5)}
              className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 px-1.5 py-0.5 rounded-md font-bold cursor-pointer"
            >
              -
            </button>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {settings.threshold}%
            </span>
            <button
              onClick={() => adjustThreshold(5)}
              className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 px-1.5 py-0.5 rounded-md font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <input
            id="threshold-slider"
            type="range"
            min="50"
            max="100"
            step="1"
            value={settings.threshold}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase font-mono">
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Overall Percentage */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            isOverallSafe 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
          }`}>
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Overall Attendance</p>
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {overallPercentage.toFixed(1)}%
            </h4>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isOverallSafe 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
            }`}>
              {isOverallSafe ? 'Above Target' : 'Below Target'}
            </span>
          </div>
        </div>

        {/* Classes Attended vs Held */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Attended / Total</p>
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {totalAttended} / {totalHeld}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Held classes (cancelled excluded)
            </p>
          </div>
        </div>

        {/* Safe vs At Risk */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            {atRiskCount > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Subject Safety Status</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display">
              {safeCount} Safe / {atRiskCount} At Risk
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Target requirement: {settings.threshold}%
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chart Section */}
      {subjects.length > 0 && totalHeld > 0 && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1 mb-4 font-display flex items-center gap-1.5">
            <span>Subject-wise Breakdown against Target ({settings.threshold}%)</span>
          </h4>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={500}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94a3b8" 
                  fontSize={10}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)', radius: 8 }} />
                <ReferenceLine 
                  y={settings.threshold} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ 
                    value: `Target: ${settings.threshold}%`, 
                    position: 'top', 
                    fill: '#ef4444', 
                    fontSize: 9, 
                    fontWeight: 700 
                  }} 
                />
                <Bar 
                  dataKey="Percentage" 
                  radius={[6, 6, 0, 0]}
                  fill="url(#colorBar)"
                >
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Individual Subjects Status Details List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-3 font-display">
          Track Per Subject
        </h3>

        {subjects.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No subjects configured</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Add your college courses under the Timetable setup tab.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subjectStatsList.map((stat) => {
              const isSafe = stat.percentage >= settings.threshold;
              
              return (
                <div
                  key={stat.subject}
                  id={`subject-track-${stat.subject.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {stat.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Attended: <span className="font-semibold text-slate-700 dark:text-slate-300">{stat.attended}</span> / Held: <span className="font-semibold text-slate-700 dark:text-slate-300">{stat.held}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-black font-mono leading-none ${
                        isSafe 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {stat.percentage.toFixed(1)}%
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        Attendance
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafe 
                          ? 'bg-emerald-500' 
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, stat.percentage)}%` }}
                    />
                  </div>

                  {/* Threshold Status Banner */}
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isSafe
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50/50 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400'
                  }`}>
                    {isSafe ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>
                          Safe • You can skip <span className="font-bold underline">{stat.canSkip}</span> consecutive class{stat.canSkip === 1 ? '' : 'es'}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>
                          {stat.requiredToReach === -1 ? (
                            <span>Goal Unreachable • You cannot reach 100% attendance anymore.</span>
                          ) : (
                            <span>
                              At Risk • Attend <span className="font-bold underline">{stat.requiredToReach}</span> consecutive classes to cross {settings.threshold}%
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
