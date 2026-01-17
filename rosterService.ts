
import { Employee, DailySchedule, ShiftType } from '../types';
import { generateDateRange, formatDateShort, getDayName } from '../utils';

export const autoGenerateRoster = (
  startDate: string,
  endDate: string,
  employees: Employee[]
): DailySchedule[] => {
  const dates = generateDateRange(startDate, endDate);
  const schedule: DailySchedule[] = [];
  
  // Track shift counts to ensure fairness
  const shiftCounts = new Map<string, number>();
  employees.forEach(emp => shiftCounts.set(emp.id, 0));

  dates.forEach((date) => {
    const dateStr = formatDateShort(date);
    const dayName = getDayName(date);
    
    // 1. Determine off-duty staff for this day
    // In a real app, this would be based on "givenDO" or patterns.
    // For simulation, let's pick 4-5 people who are "Off" today
    const numOff = Math.floor(employees.length * 0.2);
    const shuffledForOff = [...employees].sort(() => Math.random() - 0.5);
    const offStaff = shuffledForOff.slice(0, numOff).map(e => e.initials);
    const availableStaff = shuffledForOff.slice(numOff);

    // Helper to get next available staff member based on least shifts worked
    const getBestStaff = (count: number): string[] => {
      const selected = availableStaff
        .sort((a, b) => (shiftCounts.get(a.id) || 0) - (shiftCounts.get(b.id) || 0))
        .slice(0, count);
      
      selected.forEach(s => shiftCounts.set(s.id, (shiftCounts.get(s.id) || 0) + 1));
      return selected.map(s => s.initials);
    };

    const dailyShifts: DailySchedule['shifts'] = {
      'Morning_RC': getBestStaff(3),
      'Morning_NP': ['-'], // Static or placeholder based on image
      'Morning_Rem': getBestStaff(1),
      'Morning_154': getBestStaff(2),
      'Noon_RC': getBestStaff(1),
      'Evening_RC': getBestStaff(3),
      'Evening_154': getBestStaff(2),
      'Night_RC': getBestStaff(2),
    };

    schedule.push({
      date: dateStr,
      day: dayName,
      shifts: dailyShifts,
      offDays: offStaff,
      remarks: dayName === 'FRI' ? 'W. H' : '',
      isHoliday: dayName === 'FRI' || dayName === 'SUN'
    });
  });

  return schedule;
};
