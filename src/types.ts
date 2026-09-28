export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface Period {
  id: string;
  subject: string;
  time?: string;
}

export type Timetable = Record<DayOfWeek, Period[]>;

export type AttendanceStatus = 'Present' | 'Absent' | 'Cancelled' | 'Substitute';

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string; // Scheduled subject
  status: AttendanceStatus;
  substituteSubject?: string; // If status === 'Substitute'
  substituteStatus?: 'Present' | 'Absent'; // Attendance for substitute subject
  periodId?: string; // Links to a specific period in the timetable
  periodTime?: string; // Optional time at logging time
  isManual?: boolean; // True if makeup/extra class outside timetable
}

export interface SubjectStats {
  subject: string;
  attended: number;
  held: number;
  percentage: number;
  statusText: string;
  // Threshold logic
  requiredToReach: number; // consecutive presents needed to reach threshold (if below)
  canSkip: number; // consecutive absents allowed while staying >= threshold (if above)
}

export interface AppSettings {
  threshold: number; // e.g. 75
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const INITIAL_TIMETABLE: Timetable = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
};
