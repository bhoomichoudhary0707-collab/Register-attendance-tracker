import { LogEntry, SubjectStats, Timetable, DayOfWeek } from './types';

export function calculateSubjectStats(
  subject: string,
  logs: LogEntry[],
  threshold: number
): SubjectStats {
  let attended = 0;
  let held = 0;

  logs.forEach((log) => {
    if (log.status === 'Present') {
      if (log.subject === subject) {
        held += 1;
        attended += 1;
      }
    } else if (log.status === 'Absent') {
      if (log.subject === subject) {
        held += 1;
      }
    } else if (log.status === 'Substitute') {
      // Original subject is not held.
      // Check if substitute subject matches our target subject.
      if (log.substituteSubject === subject) {
        held += 1;
        if (log.substituteStatus === 'Present') {
          attended += 1;
        }
      }
    } else if (log.status === 'Cancelled') {
      // Cancelled class doesn't count for held or attended.
    }
  });

  const percentage = held === 0 ? 100 : (attended / held) * 100;
  const t = threshold / 100;

  let requiredToReach = 0;
  let canSkip = 0;

  if (percentage < threshold) {
    if (t < 1) {
      requiredToReach = Math.ceil((t * held - attended) / (1 - t));
    } else {
      // If threshold is 100%, and they have missed a class, they can never reach 100%
      requiredToReach = -1; // Represents "Impossible"
    }
  } else {
    if (t > 0) {
      canSkip = Math.floor((attended - t * held) / t);
    } else {
      canSkip = 999; // Effectively infinity
    }
  }

  let statusText = '';
  if (held === 0) {
    statusText = 'No classes held yet';
  } else if (percentage >= threshold) {
    statusText = `Safe • ${canSkip} class${canSkip === 1 ? '' : 'es'} can be skipped`;
  } else {
    statusText = requiredToReach === -1 
      ? `Below threshold • Cannot reach 100% anymore` 
      : `Below threshold • Attend ${requiredToReach} more in a row`;
  }

  return {
    subject,
    attended,
    held,
    percentage,
    statusText,
    requiredToReach,
    canSkip,
  };
}

export function getDayOfWeekFromDate(dateStr: string): DayOfWeek {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  const days: DayOfWeek[] = [
    'Sunday' as any,
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  
  return days[dayIndex];
}

// Format date to local YYYY-MM-DD using user's local timezone
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatNiceDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
