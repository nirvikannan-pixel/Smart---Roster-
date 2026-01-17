
import { DAYS_OF_WEEK } from './constants';

export const formatDateShort = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  return `${d}.${m}.${y}`;
};

export const formatDateLong = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

export const getDayName = (date: Date): string => {
  return DAYS_OF_WEEK[date.getDay()];
};

export const generateDateRange = (start: string, end: string): Date[] => {
  const dates: Date[] = [];
  if (!start || !end) return [];

  // Parse YYYY-MM-DD manually to treat as local date, avoiding timezone shifts
  const [sYear, sMonth, sDay] = start.split('-').map(Number);
  const [eYear, eMonth, eDay] = end.split('-').map(Number);
  
  const current = new Date(sYear, sMonth - 1, sDay);
  const stop = new Date(eYear, eMonth - 1, eDay);
  
  if (isNaN(current.getTime()) || isNaN(stop.getTime())) return [];
  if (current > stop) return [];

  const tempDate = new Date(current);
  // Limit range to 60 days for performance and stability
  let count = 0;
  while (tempDate <= stop && count < 60) {
    dates.push(new Date(tempDate));
    tempDate.setDate(tempDate.getDate() + 1);
    count++;
  }
  return dates;
};

export const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
};
