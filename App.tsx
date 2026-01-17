
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Employee, DailySchedule, ShiftType } from './types';
import { DEFAULT_ORG, DEFAULT_ADDR, DEFAULT_SUB, DUTY_TIMES } from './constants';
import { autoGenerateRoster } from './services/rosterService';
import { formatDateLong } from './utils';

const initialEmployees: Employee[] = [
  { id: '1', sl: 1, name: 'Anwar', mobile: '01712244701', jobId: '300084', initials: 'A', dueDO: 3, presentDO: 2, givenDO: 3 },
  { id: '2', sl: 2, name: 'Forhad', mobile: '01773 150696', jobId: '300089', initials: 'F', dueDO: 5, presentDO: 2, givenDO: 5 },
  { id: '3', sl: 3, name: 'Mostain', mobile: '01778 900 843', jobId: '310006', initials: 'MS', dueDO: 9, presentDO: 2, givenDO: 5 },
  { id: '4', sl: 4, name: 'Razzak', mobile: '01923 281 711', jobId: '300034', initials: 'RZ', dueDO: 6, presentDO: 2, givenDO: 3 },
  { id: '5', sl: 5, name: 'Azad', mobile: '01718 076 472', jobId: '310024', initials: 'AZ', dueDO: 12, presentDO: 2, givenDO: 4 },
  { id: '6', sl: 6, name: 'Rokon', mobile: '01812 371 113', jobId: '300075', initials: 'RK', dueDO: 17, presentDO: 2, givenDO: 4 },
  { id: '7', sl: 7, name: 'Rahman', mobile: '01744914791', jobId: '300093', initials: 'RM', dueDO: 18, presentDO: 2, givenDO: 4 },
  { id: '8', sl: 8, name: 'Mohasin', mobile: '01914 873 051', jobId: '620000', initials: 'MH', dueDO: 9, presentDO: 2, givenDO: 3 },
  { id: '9', sl: 9, name: 'Manik', mobile: '01744 903 051', jobId: '310023', initials: 'MK', dueDO: 18, presentDO: 2, givenDO: 5 },
  { id: '10', sl: 10, name: 'Amran', mobile: '01746 635 715', jobId: '310025', initials: 'AM', dueDO: 15, presentDO: 2, givenDO: 5 },
  { id: '11', sl: 11, name: 'Pohallad', mobile: '01962 564 726', jobId: '310016', initials: 'P', dueDO: 12, presentDO: 2, givenDO: 6 },
  { id: '12', sl: 12, name: 'Pranta', mobile: '01648- 566622', jobId: '800057', initials: 'PR', dueDO: 0, presentDO: 2, givenDO: 2 },
  { id: '13', sl: 13, name: 'Mehedi', mobile: '01684-895802', jobId: '800068', initials: 'MD', dueDO: 0, presentDO: 2, givenDO: 2 },
  { id: '14', sl: 14, name: 'Salauddin', mobile: '01817 522 345', jobId: '300080', initials: 'SA', dueDO: 8, presentDO: 2, givenDO: 4 },
  { id: '15', sl: 15, name: 'Sanower', mobile: '01707 331 573', jobId: '600067', initials: 'SN', dueDO: 19, presentDO: 2, givenDO: 5 },
  { id: '16', sl: 16, name: 'Rafiq', mobile: '01853 403 579', jobId: '600120', initials: 'RA', dueDO: 7, presentDO: 2, givenDO: 4 },
  { id: '17', sl: 17, name: 'Dobir', mobile: '01916 349724', jobId: '610066', initials: 'D', dueDO: 4, presentDO: 4, givenDO: 5 },
  { id: '18', sl: 18, name: 'Abu Taher', mobile: '01720 344726', jobId: '600012', initials: 'ATB', dueDO: 0, presentDO: 2, givenDO: 2 },
  { id: '19', sl: 19, name: 'Jamal', mobile: '01921 177 877', jobId: '610004', initials: 'J', dueDO: 13, presentDO: 4, givenDO: 6 },
  { id: '20', sl: 20, name: 'Mohsina', mobile: '01610- 502261', jobId: '800122', initials: 'M', dueDO: 0, presentDO: 2, givenDO: 2 },
];

const STORAGE_KEY = 'duty_roster_data_v2';
const SAVED_ROSTERS_KEY = 'duty_roster_history_v2';

interface SavedRoster {
  id: string;
  name: string;
  timestamp: number;
  data: {
    employees: Employee[];
    startDate: string;
    endDate: string;
    schedule: DailySchedule[];
    orgName: string;
    orgAddr: string;
    subject: string;
  };
}

const App: React.FC = () => {
  // --- Initialization ---
  const loadSavedData = (key: string) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(`Failed to load data for ${key}`, e);
    }
    return null;
  };

  const initialData = loadSavedData(STORAGE_KEY);
  const initialHistory = loadSavedData(SAVED_ROSTERS_KEY) || [];

  const [employees, setEmployees] = useState<Employee[]>(initialData?.employees || initialEmployees);
  const [startDate, setStartDate] = useState(initialData?.startDate || "2026-01-17");
  const [endDate, setEndDate] = useState(initialData?.endDate || "2026-01-31");
  const [schedule, setSchedule] = useState<DailySchedule[]>(initialData?.schedule || []);
  const [orgName, setOrgName] = useState(initialData?.orgName || DEFAULT_ORG);
  const [orgAddr, setOrgAddr] = useState(initialData?.orgAddr || DEFAULT_ADDR);
  const [subject, setSubject] = useState(initialData?.subject || DEFAULT_SUB);
  
  // UI State
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>(initialHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showStaffList, setShowStaffList] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'staff'>('history');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence ---
  useEffect(() => {
    const dataToSave = { employees, startDate, endDate, schedule, orgName, orgAddr, subject };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [employees, startDate, endDate, schedule, orgName, orgAddr, subject]);

  useEffect(() => {
    localStorage.setItem(SAVED_ROSTERS_KEY, JSON.stringify(savedRosters));
  }, [savedRosters]);

  // --- Core Handlers ---
  const handleGenerate = () => {
    const newSchedule = autoGenerateRoster(startDate, endDate, employees);
    setSchedule(newSchedule);
  };

  const handleSaveRoster = () => {
    const rosterName = window.prompt("Enter a name for this roster archive:", `Roster ${startDate} to ${endDate}`);
    if (!rosterName) return;

    const newSaved: SavedRoster = {
      id: Date.now().toString(),
      name: rosterName,
      timestamp: Date.now(),
      data: { employees, startDate, endDate, schedule, orgName, orgAddr, subject }
    };
    setSavedRosters(prev => [newSaved, ...prev]);
    alert("Roster archived successfully!");
  };

  const loadSavedVersion = (roster: SavedRoster) => {
    if (window.confirm(`Load "${roster.name}"? Current unsaved work will be replaced.`)) {
      const { data } = roster;
      setEmployees(data.employees);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setSchedule(data.schedule);
      setOrgName(data.orgName);
      setOrgAddr(data.orgAddr);
      setSubject(data.subject);
      setShowHistory(false);
    }
  };

  const deleteSavedVersion = (id: string) => {
    if (window.confirm("Delete this saved roster archive?")) {
      setSavedRosters(prev => prev.filter(r => r.id !== id));
    }
  };

  // --- Staff Management Fixes ---
  const handleAddEmployee = () => {
    const newId = Date.now().toString();
    const newSl = employees.length + 1;
    const newEmp: Employee = {
      id: newId,
      sl: newSl,
      name: 'New Staff',
      mobile: '01xxx xxxxxx',
      jobId: '000000',
      initials: 'NS',
      dueDO: 0,
      presentDO: 0,
      givenDO: 0
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const deleteStaff = (id: string) => {
    const confirmMessage = "Permanently remove this staff member?\nSerial numbers (SL) will be automatically re-indexed.";
    if (window.confirm(confirmMessage)) {
      setEmployees(prev => {
        const updated = prev.filter(emp => emp.id !== id);
        return updated.map((emp, index) => ({
          ...emp,
          sl: index + 1
        }));
      });
    }
  };

  const handleClearAllStaff = () => {
    if (window.confirm("Are you sure you want to delete ALL staff? This list will be emptied.")) {
      setEmployees([]);
    }
  };

  // --- Derived State ---
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return savedRosters;
    const lower = searchTerm.toLowerCase();
    return savedRosters.filter(r => 
      r.name.toLowerCase().includes(lower) || 
      r.data.subject.toLowerCase().includes(lower) ||
      r.data.startDate.includes(lower)
    );
  }, [savedRosters, searchTerm]);

  const filteredStaff = useMemo(() => {
    if (!staffSearchTerm) return employees;
    const lower = staffSearchTerm.toLowerCase();
    return employees.filter(e => 
      e.name.toLowerCase().includes(lower) || 
      e.initials.toLowerCase().includes(lower) ||
      e.jobId.includes(lower) ||
      e.mobile.includes(lower)
    );
  }, [employees, staffSearchTerm]);

  const employeeStats = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      remaining: (Number(emp.dueDO) + Number(emp.presentDO)) - Number(emp.givenDO)
    }));
  }, [employees]);

  const firstHalf = employeeStats.slice(0, Math.ceil(employeeStats.length / 2));
  const secondHalf = employeeStats.slice(Math.ceil(employeeStats.length / 2));

  // --- Update Field Helpers ---
  const updateEmployeeField = (id: string, field: keyof Employee, value: string | number) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const updateScheduleShift = (idx: number, shift: ShiftType, value: string) => {
    setSchedule(prev => {
      const next = [...prev];
      next[idx].shifts[shift] = value.split(/[.,\s]+/).filter(Boolean);
      return next;
    });
  };

  const updateScheduleOffDays = (idx: number, value: string) => {
    setSchedule(prev => {
      const next = [...prev];
      next[idx].offDays = value.split(/[.,\s]+/).filter(Boolean);
      return next;
    });
  };

  const updateScheduleRemarks = (idx: number, value: string) => {
    setSchedule(prev => {
      const next = [...prev];
      next[idx].remarks = value;
      return next;
    });
  };

  const handleExport = () => {
    const data = { employees, startDate, endDate, schedule, orgName, orgAddr, subject, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DutyRoster_${startDate}_to_${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.employees) setEmployees(data.employees);
        if (data.startDate) setStartDate(data.startDate);
        if (data.endDate) setEndDate(data.endDate);
        if (data.schedule) setSchedule(data.schedule);
        if (data.orgName) setOrgName(data.orgName);
        if (data.orgAddr) setOrgAddr(data.orgAddr);
        if (data.subject) setSubject(data.subject);
        alert("Data imported successfully!");
      } catch (err) {
        alert("Invalid file format. Please upload a valid Roster JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("Reset everything to hospital defaults? Current data will be replaced.")) {
      setEmployees(initialEmployees);
      setOrgName(DEFAULT_ORG);
      setOrgAddr(DEFAULT_ADDR);
      setSubject(DEFAULT_SUB);
      setStartDate("2026-01-17");
      setEndDate("2026-01-31");
      localStorage.removeItem(STORAGE_KEY);
      handleGenerate();
    }
  };

  useEffect(() => {
    if (schedule.length === 0) handleGenerate();
  }, []);

  // --- Components ---
  const EditableInput = ({ value, onChange, className = "" }: { value: string | number, onChange: (v: string) => void, className?: string }) => (
    <input
      type="text"
      className={`w-full bg-transparent border-none text-center text-black focus:ring-1 focus:ring-green-400 p-0.5 m-0 outline-none transition-all hover:bg-green-50/50 ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8 print:p-0 flex flex-col lg:flex-row gap-6">
      
      {/* Sidebar (No-Print) */}
      <div className={`no-print fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 shadow-2xl transform transition-transform duration-300 ${showHistory ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex-shrink-0 lg:z-0 lg:rounded-lg overflow-hidden flex flex-col`}>
        <div className="flex border-b border-slate-700 bg-slate-800">
          <button type="button" onClick={() => setActiveTab('history')} className={`flex-1 p-4 text-sm font-bold transition-colors ${activeTab === 'history' ? 'text-green-500 bg-slate-900 border-b-2 border-green-500' : 'text-slate-400 hover:text-white'}`}>History</button>
          <button type="button" onClick={() => setActiveTab('staff')} className={`flex-1 p-4 text-sm font-bold transition-colors ${activeTab === 'staff' ? 'text-green-500 bg-slate-900 border-b-2 border-green-500' : 'text-slate-400 hover:text-white'}`}>Staff Mgmt</button>
          <button type="button" onClick={() => setShowHistory(false)} className="lg:hidden p-4 text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 bg-slate-800/50">
          <div className="relative">
            <input 
              type="text"
              placeholder={activeTab === 'history' ? "Search archives..." : "Search staff..."}
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              value={activeTab === 'history' ? searchTerm : staffSearchTerm}
              onChange={(e) => activeTab === 'history' ? setSearchTerm(e.target.value) : setStaffSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === 'history' ? (
            filteredHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm italic">No archives found.</div>
            ) : (
              filteredHistory.map(roster => (
                <div key={roster.id} className="group bg-slate-800 p-4 rounded-md border border-slate-700 hover:border-green-600 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-slate-100 font-bold text-sm truncate">{roster.name}</h3>
                    <button type="button" onClick={() => deleteSavedVersion(roster.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all cursor-pointer"><TrashIcon /></button>
                  </div>
                  <p className="text-slate-400 text-[10px] mb-3">{new Date(roster.timestamp).toLocaleString()}</p>
                  <button type="button" onClick={() => loadSavedVersion(roster)} className="w-full bg-slate-700 hover:bg-green-700 text-white text-xs font-bold py-1.5 rounded transition-colors cursor-pointer">Load Archive</button>
                </div>
              ))
            )
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={handleAddEmployee} className="flex-1 bg-green-700 hover:bg-green-600 text-white text-[10px] font-bold py-2 rounded shadow-md cursor-pointer">+ Add New</button>
                <button type="button" onClick={handleClearAllStaff} className="flex-1 bg-red-900 hover:bg-red-800 text-white text-[10px] font-bold py-2 rounded shadow-md cursor-pointer">Clear All</button>
              </div>
              {filteredStaff.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm italic">No staff found.</div>
              ) : (
                filteredStaff.map(emp => (
                  <div key={emp.id} className="group bg-slate-800 p-3 rounded-md border border-slate-700 hover:border-indigo-600 transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{emp.name}</p>
                        <p className="text-slate-400 text-[10px]">{emp.initials} • ID: {emp.jobId}</p>
                      </div>
                      <button type="button" onClick={() => deleteStaff(emp.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all cursor-pointer" title="Delete Staff">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Admin Section (No-Print) */}
        <div className="no-print bg-slate-900 text-white p-4 sm:p-6 border-b border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => {setShowHistory(true); setActiveTab('staff');}} className="lg:hidden bg-slate-800 p-2 rounded text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Roster Preparation Panel</h1>
                <p className="text-slate-400 text-xs sm:text-sm">Manage staff and data archives.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => {setShowHistory(true); setActiveTab('history');}} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm font-bold shadow-lg flex items-center gap-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                History
              </button>
              <button type="button" onClick={handleSaveRoster} className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded text-sm font-bold shadow-lg flex items-center gap-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Archive
              </button>
              <button type="button" onClick={handleGenerate} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-bold shadow-lg cursor-pointer">Regenerate</button>
              <button type="button" onClick={() => window.print()} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm font-bold shadow-lg cursor-pointer">Print / PDF</button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Personnel Quick Actions</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={handleAddEmployee} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded text-xs font-bold cursor-pointer">+ Add Staff</button>
                <button type="button" onClick={handleClearAllStaff} className="bg-red-800 hover:bg-red-700 text-white p-2 rounded text-xs font-bold cursor-pointer">Clear All</button>
                <button type="button" onClick={() => setShowStaffList(!showStaffList)} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded text-xs font-bold col-span-2 cursor-pointer">{showStaffList ? 'Hide Summary' : 'Show Summary'}</button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Period Settings</label>
              <div className="flex gap-2">
                <div className="flex-1"><span className="text-[10px] text-slate-400">Start</span><input type="date" className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm text-white outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="flex-1"><span className="text-[10px] text-slate-400">End</span><input type="date" className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm text-white outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</label>
              <textarea className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm text-white resize-none outline-none" rows={2} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">System Mgmt</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={handleExport} className="bg-emerald-700 hover:bg-emerald-600 text-white p-2 rounded text-xs font-bold cursor-pointer">Export</button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-indigo-700 hover:bg-indigo-600 text-white p-2 rounded text-xs font-bold cursor-pointer">Import</button>
                <button type="button" onClick={handleReset} className="bg-rose-900 hover:bg-rose-800 text-white p-2 rounded text-xs font-bold col-span-2 cursor-pointer">Factory Reset</button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
              </div>
            </div>
          </div>
        </div>

        {/* Printable View */}
        <div className="print-container p-4 sm:p-6 md:p-10 bg-white text-black">
          <div className="text-center mb-6 px-2">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black">{orgName}</h1>
            <p className="text-xs sm:text-sm font-semibold text-black">{orgAddr}</p>
            <div className="mt-2 inline-block border-b-2 border-black pb-1">
               <input className="bg-transparent border-none text-center text-sm sm:text-base md:text-lg font-bold outline-none min-w-[280px] sm:min-w-[500px] text-black" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <p className="text-xs sm:text-sm font-bold mt-2 text-black">Wef: {formatDateLong(startDate)} to {formatDateLong(endDate)}</p>
          </div>

          {showStaffList && employees.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-6 border border-black overflow-hidden print:block">
              {/* Summary Table 1 */}
              <div className="overflow-x-auto border-b md:border-b-0 md:border-r border-black">
                <table className="employee-summary-table w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-black">
                      <th className="w-8">SL</th>
                      <th className="min-w-[200px]">Name & Mobile No.</th>
                      <th className="w-16">Job ID</th>
                      <th className="w-10">Due</th>
                      <th className="w-10">Pres</th>
                      <th className="w-10">Giv</th>
                      <th className="w-10">Rem</th>
                      <th className="w-10 no-print">Act</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firstHalf.map((emp) => (
                      <tr key={emp.id} className="hover:bg-green-50/30 transition-colors group">
                        <td className="p-0"><EditableInput value={emp.sl} onChange={(v) => updateEmployeeField(emp.id, 'sl', parseInt(v) || 0)} className="font-bold" /></td>
                        <td className="text-left px-1">
                          <input className="bg-transparent border-none text-left text-[11px] outline-none w-full p-0.5 text-black" value={`${emp.initials} = ${emp.name}-${emp.mobile}`} onChange={(e) => {
                            const val = e.target.value;
                            const eqIdx = val.indexOf('=');
                            const dshIdx = val.lastIndexOf('-');
                            if (eqIdx !== -1 && dshIdx !== -1) {
                              updateEmployeeField(emp.id, 'initials', val.substring(0, eqIdx).trim());
                              updateEmployeeField(emp.id, 'name', val.substring(eqIdx + 1, dshIdx).trim());
                              updateEmployeeField(emp.id, 'mobile', val.substring(dshIdx + 1).trim());
                            }
                          }} />
                        </td>
                        <td className="p-0"><EditableInput value={emp.jobId} onChange={(v) => updateEmployeeField(emp.id, 'jobId', v)} /></td>
                        <td className="p-0"><EditableInput value={emp.dueDO} onChange={(v) => updateEmployeeField(emp.id, 'dueDO', parseInt(v) || 0)} /></td>
                        <td className="p-0"><EditableInput value={emp.presentDO} onChange={(v) => updateEmployeeField(emp.id, 'presentDO', parseInt(v) || 0)} /></td>
                        <td className="p-0"><EditableInput value={emp.givenDO} onChange={(v) => updateEmployeeField(emp.id, 'givenDO', parseInt(v) || 0)} /></td>
                        <td className="text-center font-bold text-[11px] text-black">{emp.remaining.toString().padStart(2, '0')}</td>
                        <td className="p-0 no-print">
                          <button type="button" onClick={() => deleteStaff(emp.id)} className="flex items-center justify-center w-full h-full text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors py-1.5 cursor-pointer" title="Remove Staff"><TrashIcon /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Summary Table 2 */}
              <div className="overflow-x-auto">
                <table className="employee-summary-table w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-black">
                      <th className="w-8">SL</th>
                      <th className="min-w-[200px]">Name & Mobile No.</th>
                      <th className="w-16">Job ID</th>
                      <th className="w-10">Due</th>
                      <th className="w-10">Pres</th>
                      <th className="w-10">Giv</th>
                      <th className="w-10">Rem</th>
                      <th className="w-10 no-print">Act</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secondHalf.map((emp) => (
                      <tr key={emp.id} className="hover:bg-green-50/30 transition-colors group">
                        <td className="p-0"><EditableInput value={emp.sl} onChange={(v) => updateEmployeeField(emp.id, 'sl', parseInt(v) || 0)} className="font-bold" /></td>
                        <td className="text-left px-1">
                          <input className="bg-transparent border-none text-left text-[11px] outline-none w-full p-0.5 text-black" value={`${emp.initials} = ${emp.name}-${emp.mobile}`} onChange={(e) => {
                            const val = e.target.value;
                            const eqIdx = val.indexOf('=');
                            const dshIdx = val.lastIndexOf('-');
                            if (eqIdx !== -1 && dshIdx !== -1) {
                              updateEmployeeField(emp.id, 'initials', val.substring(0, eqIdx).trim());
                              updateEmployeeField(emp.id, 'name', val.substring(eqIdx + 1, dshIdx).trim());
                              updateEmployeeField(emp.id, 'mobile', val.substring(dshIdx + 1).trim());
                            }
                          }} />
                        </td>
                        <td className="p-0"><EditableInput value={emp.jobId} onChange={(v) => updateEmployeeField(emp.id, 'jobId', v)} /></td>
                        <td className="p-0"><EditableInput value={emp.dueDO} onChange={(v) => updateEmployeeField(emp.id, 'dueDO', parseInt(v) || 0)} /></td>
                        <td className="p-0"><EditableInput value={emp.presentDO} onChange={(v) => updateEmployeeField(emp.id, 'presentDO', parseInt(v) || 0)} /></td>
                        <td className="p-0"><EditableInput value={emp.givenDO} onChange={(v) => updateEmployeeField(emp.id, 'givenDO', parseInt(v) || 0)} /></td>
                        <td className="text-center font-bold text-[11px] text-black">{emp.remaining.toString().padStart(2, '0')}</td>
                        <td className="p-0 no-print">
                          <button type="button" onClick={() => deleteStaff(emp.id)} className="flex items-center justify-center w-full h-full text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors py-1.5 cursor-pointer" title="Remove Staff"><TrashIcon /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roster Table */}
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 pb-2">
            <table className="roster-table min-w-[1000px] w-full border-collapse text-black">
              <thead>
                <tr className="bg-gray-100">
                  <th rowSpan={2} className="w-20">Date</th><th rowSpan={2} className="w-14">Day</th><th colSpan={4}>Morning</th><th>Noon</th><th colSpan={2}>Evening</th><th>Night</th><th rowSpan={2} className="w-40">Off Day / Leave</th><th rowSpan={2} className="w-20">Remarks</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="w-24">RC</th><th className="w-14">NP Inv.</th><th className="w-14">Remin.</th><th className="w-24">154 No.</th><th className="w-16">RC</th><th className="w-24">RC</th><th className="w-24">154 No.</th><th className="w-24">RC</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((day, idx) => (
                  <tr key={idx} className={day.isHoliday ? "bg-amber-50/30" : "hover:bg-green-50/20"}>
                    <td className="font-bold text-[11px] whitespace-nowrap bg-green-50/30 p-1">{day.date}</td>
                    <td className={`font-bold text-[11px] p-1 ${day.day === 'FRI' ? 'text-red-600 bg-red-50/20' : ''}`}>{day.day}</td>
                    <td className="p-0"><EditableInput value={day.shifts.Morning_RC.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Morning_RC', v)} /></td>
                    <td className="p-0"><EditableInput value={day.shifts.Morning_NP.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Morning_NP', v)} /></td>
                    <td className="p-0"><EditableInput value={day.shifts.Morning_Rem.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Morning_Rem', v)} /></td>
                    <td className="p-0"><EditableInput value={day.shifts.Morning_154.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Morning_154', v)} /></td>
                    <td className="p-0"><EditableInput value={day.shifts.Noon_RC.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Noon_RC', v)} /></td>
                    <td className="p-0"><EditableInput value={day.shifts.Evening_RC.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Evening_RC', v)} /></td>
                    <td className="p-0"><EditableInput value={day.shifts.Evening_154.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Evening_154', v)} /></td>
                    <td className="p-0"><EditableInput value={day.shifts.Night_RC.join('. ')} onChange={(v) => updateScheduleShift(idx, 'Night_RC', v)} /></td>
                    <td className="p-0"><EditableInput value={day.offDays.join('. ')} onChange={(v) => updateScheduleOffDays(idx, v)} className="text-left px-1 text-[11px] font-semibold text-red-700" /></td>
                    <td className="p-0"><EditableInput value={day.remarks} onChange={(v) => updateScheduleRemarks(idx, v)} className="text-[10px]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center text-xs sm:text-sm font-bold border-t border-black/10 pt-4 text-black">
            <span className="bg-yellow-100 px-2 py-1 rounded">Note: Above roster may be changed any time as per decision of the Authority.</span>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-end gap-6 sm:gap-0">
            <div className="border border-black p-3 bg-gray-50/50 rounded-sm shadow-sm">
              <h3 className="font-bold underline text-center text-xs mb-2">Duty Schedule Reference</h3>
              <ul className="text-[10px] space-y-1">
                {DUTY_TIMES.map((dt, i) => (
                  <li key={i} className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span><span className="font-bold">{dt.shift}:</span> {dt.time}</li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] font-bold uppercase border-t border-black/10 pt-2">Prepared by: ENNUR</p>
            </div>
            <div className="text-center w-full sm:w-48">
              <div className="border-t border-black/30 pt-1 font-bold text-sm tracking-widest uppercase">Authorized Signature</div>
              <p className="text-[10px] text-gray-400 mt-1 no-print">Seal & Date Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
