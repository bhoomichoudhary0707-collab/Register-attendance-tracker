import { Timetable, LogEntry, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { getLocalDateString } from '../utils';

export const DEFAULT_SUBJECTS: string[] = [
  'Advanced Mathematics',
  'Computer Networks',
  'Database Management',
  'Software Engineering',
  'Microprocessors & IoT'
];

export const DEFAULT_TIMETABLE: Timetable = {
  Monday: [
    { id: 'mon-1', subject: 'Advanced Mathematics', time: '09:00 - 10:00' },
    { id: 'mon-2', subject: 'Database Management', time: '10:15 - 11:15' },
    { id: 'mon-3', subject: 'Software Engineering', time: '11:30 - 12:30' },
  ],
  Tuesday: [
    { id: 'tue-1', subject: 'Computer Networks', time: '09:00 - 10:00' },
    { id: 'tue-2', subject: 'Microprocessors & IoT', time: '10:15 - 11:15' },
    { id: 'tue-3', subject: 'Advanced Mathematics', time: '11:30 - 12:30' },
  ],
  Wednesday: [
    { id: 'wed-1', subject: 'Database Management', time: '09:00 - 10:00' },
    { id: 'wed-2', subject: 'Software Engineering', time: '10:15 - 11:15' },
    { id: 'wed-3', subject: 'Computer Networks', time: '11:30 - 12:30' },
  ],
  Thursday: [
    { id: 'thu-1', subject: 'Microprocessors & IoT', time: '09:00 - 10:00' },
    { id: 'thu-2', subject: 'Advanced Mathematics', time: '10:15 - 11:15' },
    { id: 'thu-3', subject: 'Database Management', time: '11:30 - 12:30' },
  ],
  Friday: [
    { id: 'fri-1', subject: 'Software Engineering', time: '09:00 - 10:00' },
    { id: 'fri-2', subject: 'Computer Networks', time: '10:15 - 11:15' },
    { id: 'fri-3', subject: 'Microprocessors & IoT', time: '11:30 - 12:30' },
  ],
  Saturday: [
    { id: 'sat-1', subject: 'Advanced Mathematics', time: '09:00 - 10:00' },
    { id: 'sat-2', subject: 'Database Management', time: '10:15 - 11:15' },
  ],
};

export function generateSampleLogs(timetable: Timetable, subjects: string[]): LogEntry[] {
  const logs: LogEntry[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Reference to current local noon
  
  // Generate logs for the past 14 days (excluding Sundays and today)
  for (let i = 14; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const dayOfWeekIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (dayOfWeekIndex === 0) continue; // Skip Sundays
    
    const dayNames: DayOfWeek[] = [
      'Sunday' as any,
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    
    const dayName = dayNames[dayOfWeekIndex];
    const periods = timetable[dayName] || [];
    const dateStr = getLocalDateString(date);
    
    periods.forEach((period, pIndex) => {
      // Deterministic pseudo-random seed based on index and period to give realistic percentages
      const seed = (i * 7 + pIndex * 13) % 100;
      
      let status: 'Present' | 'Absent' | 'Cancelled' | 'Substitute' = 'Present';
      let substituteSubject: string | undefined = undefined;
      let substituteStatus: 'Present' | 'Absent' | undefined = undefined;
      
      if (seed < 75) {
        status = 'Present';
      } else if (seed < 88) {
        status = 'Absent';
      } else if (seed < 94) {
        status = 'Cancelled';
      } else {
        status = 'Substitute';
        // Pick a different subject as substitute
        const index = (pIndex + 1) % subjects.length;
        substituteSubject = subjects[index];
        substituteStatus = seed % 2 === 0 ? 'Present' : 'Absent';
      }
      
      logs.push({
        id: `sample-${dateStr}-${period.id}`,
        date: dateStr,
        subject: period.subject,
        status,
        substituteSubject,
        substituteStatus,
        periodId: period.id,
        periodTime: period.time,
        isManual: false,
      });
    });
  }
  
  return logs;
}
