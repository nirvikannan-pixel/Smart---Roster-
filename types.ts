
export interface Employee {
  id: string;
  sl: number;
  name: string;
  mobile: string;
  jobId: string;
  initials: string;
  dueDO: number;
  presentDO: number;
  givenDO: number;
}

export type ShiftType = 'Morning_RC' | 'Morning_NP' | 'Morning_Rem' | 'Morning_154' | 'Noon_RC' | 'Evening_RC' | 'Evening_154' | 'Night_RC';

export interface DailySchedule {
  date: string;
  day: string;
  shifts: {
    [key in ShiftType]: string[];
  };
  offDays: string[];
  remarks: string;
  isHoliday?: boolean;
}

export interface RosterData {
  organizationName: string;
  address: string;
  subject: string;
  startDate: string;
  endDate: string;
  employees: Employee[];
  schedule: DailySchedule[];
}
