import { Check, Trash2, Palmtree, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Habit, Vacation } from '../types';
import { useState, useEffect } from 'react';

interface HabitGridProps {
  habits: Habit[];
  vacations: Vacation[];
  daysArray: { dateStr: string; dayOfWeek: string; dateObj: Date }[];
  todayStr: string;
  monthName: string;
  onCheckIn: (habitId: string, dateStr: string, currentStatus: string) => void;
  onArchive: (habitId: string) => void;
}

export function HabitGrid({ habits, vacations, daysArray, todayStr, monthName, onCheckIn, onArchive }: HabitGridProps) {
  const [mobileSelectedDate, setMobileSelectedDate] = useState<string>(todayStr);

  useEffect(() => {
    // If today is in the current month, select it. Else select day 1.
    if (daysArray.some(d => d.dateStr === todayStr)) {
      setMobileSelectedDate(todayStr);
    } else if (daysArray.length > 0) {
      setMobileSelectedDate(daysArray[0].dateStr);
    }
  }, [daysArray, todayStr]);

  const mobileDayIndex = daysArray.findIndex(d => d.dateStr === mobileSelectedDate);
  const mobileDay = daysArray[mobileDayIndex] || daysArray[0];

  const handlePrevDay = () => {
    if (mobileDayIndex > 0) {
      setMobileSelectedDate(daysArray[mobileDayIndex - 1].dateStr);
    }
  };

  const handleNextDay = () => {
    if (mobileDayIndex < daysArray.length - 1) {
      setMobileSelectedDate(daysArray[mobileDayIndex + 1].dateStr);
    }
  };
  const dailyHabits = habits.filter(h => h.scheduleType === 'daily' || h.scheduleType === 'fixedDays');
  const paddedDaily = [...dailyHabits];
  while (paddedDaily.length < 12) { paddedDaily.push(null as unknown as Habit); }

  const dailyTotals = daysArray.map(({ dateStr, dateObj }) => {
    let completedCount = 0;
    let totalMandatory = 0;
    const dayOfWeek = dateObj.getDay(); // 0 (Sun) to 6 (Sat)
    
    dailyHabits.forEach(h => {
      // Check start/end dates
      if (h.startDate) {
        const hStart = new Date(h.startDate).getTime();
        const dayEnd = dateObj.getTime() + 24 * 60 * 60 * 1000 - 1;
        if (hStart > dayEnd) return;
      }
      if (h.endDate) {
        const hEnd = new Date(h.endDate).getTime();
        if (dateObj.getTime() > hEnd) return;
      }

      // Check vacation
      const isVacationDay = vacations.some(v => {
        const d = new Date(dateStr).getTime();
        return d >= new Date(v.startDate).getTime() && d <= new Date(v.endDate).getTime();
      });
      if (isVacationDay) return; // Vacations don't count towards expected

      // Check rest day
      let isRestDay = false;
      if (h.restDays) {
        try {
          const rest = JSON.parse(h.restDays);
          const d = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon
          if (rest.includes(d)) isRestDay = true;
        } catch { /* ignore */ }
      }
      if (isRestDay) return;

      let isMandatory = false;
      if (h.scheduleType === 'daily') isMandatory = true;
      else if (h.scheduleType === 'fixedDays' && h.selectedDays) {
        try {
          const days = JSON.parse(h.selectedDays);
          // UI fixedDays uses 0=Mon...6=Sun. JS getDay is 0=Sun. 
          const d = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
          isMandatory = days.includes(d);
        } catch { /* ignore */ }
      }
      
      const isCompleted = h.logs?.some(l => l.date === dateStr && l.status === 'completed');
      const isSkipped = h.logs?.some(l => l.date === dateStr && l.status === 'skipped');
      
      if (isMandatory) {
         totalMandatory++;
         if (isCompleted) completedCount++;
      } else {
         if (isCompleted) {
            totalMandatory++;
            completedCount++;
         } else if (isSkipped) {
            totalMandatory++; // User explicitly skipped an optional habit, so it counts as a failure!
         }
      }
    });
    
    return { completedCount, totalMandatory };
  });

  return (
    <div className="w-full border border-[#333] bg-[#1a1a1a] shadow-xl mx-auto p-2 md:p-4 flex flex-col gap-4 md:gap-6 rounded-xl">
      <div className="bg-[#2a2a2a] border border-[#444] rounded py-3 text-center tracking-[0.3em] font-bold text-gray-300 text-xl relative">
        <div className="md:hidden absolute left-2 top-1/2 -translate-y-1/2">
          <button onClick={handlePrevDay} disabled={mobileDayIndex === 0} className="p-1 text-gray-400 disabled:opacity-30">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <span className="hidden md:inline">{monthName}</span>
        <span className="md:hidden">{mobileDay?.dateStr === todayStr ? 'TODAY' : mobileDay?.dateStr}</span>
        <div className="md:hidden absolute right-2 top-1/2 -translate-y-1/2">
          <button onClick={handleNextDay} disabled={mobileDayIndex === daysArray.length - 1} className="p-1 text-gray-400 disabled:opacity-30">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex gap-4">
        <div className="flex-1 flex border border-[#333] rounded overflow-hidden">
          <div className="w-24 shrink-0 md:w-64 flex flex-col border-r border-[#333]">
            <div className="bg-[#222] border-b border-[#333] h-16 flex items-center justify-center font-bold tracking-widest text-[8px] md:text-sm text-gray-400 text-center px-1">
              <span className="hidden md:inline">DAILY HABITS</span>
              <span className="md:hidden">HABITS</span>
            </div>
            {paddedDaily.map((h, i) => (
              <div key={i} className="h-10 border-b border-[#333] border-dotted flex items-center px-1.5 md:px-3 text-[10px] md:text-xs justify-between text-gray-300 bg-[#1a1a1a] group overflow-hidden">
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium block">{h ? h.title : ''}</span>
                  {h && (
                    <div className="flex flex-col gap-0.5 mt-0.5 hidden md:flex">
                      <span className="text-[9px] text-gray-500">Total: {h.logs?.filter(l => l.status === 'completed').length || 0}</span>
                      {h.bankedDays > 0 && <span className="text-[9px] text-blue-400">Banked: {h.bankedDays}</span>}
                    </div>
                  )}
                </div>
                {h && (
                   <button onClick={() => onArchive(h.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity hidden md:block shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                )}
              </div>
            ))}
            <div className="bg-[#222] border-b border-[#333] h-8 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-gray-400 text-center px-1">
              <span className="hidden md:inline">EXPECTED / COMPLETED</span>
              <span className="md:hidden">EXP/COM</span>
            </div>
            <div className="bg-[#2a2a2a] h-8 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-gray-400 text-center px-1">
              <span className="hidden md:inline">PERCENT COMPLETE</span>
              <span className="md:hidden">% COMP</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-x-auto">
            <div className="h-16 flex border-b border-[#333] bg-[#1a1a1a]">
              {daysArray.map((day, i) => {
                const isToday = day.dateStr === todayStr;
                const isVacationDay = vacations.some(v => {
                  const d = new Date(day.dateStr).getTime();
                  return d >= new Date(v.startDate).getTime() && d <= new Date(v.endDate).getTime();
                });
                return (
                  <div key={i} className={`flex-1 min-w-[28px] border-r border-[#333] flex flex-col items-center justify-center text-[10px] 
                    ${isToday ? 'bg-green-800 text-green-100 font-bold' : isVacationDay ? 'bg-[#1e2330] text-blue-300' : 'text-gray-500 bg-[#1e1e1e]'}`}>
                    <div className={`border-b border-[#333] w-full text-center py-1 ${isToday ? 'bg-green-700' : isVacationDay ? 'bg-[#252c3f]' : 'bg-[#222]'}`}>{day.dayOfWeek}</div>
                    <div className="w-full text-center py-1">{i + 1}</div>
                  </div>
                );
              })}
            </div>
            {paddedDaily.map((h, i) => {
              let currentCompletedCount = 0;
              return (
                <div key={i} className="h-10 flex border-b border-[#333] border-dotted bg-[#1a1a1a]">
                  {daysArray.map((day, j) => {
                    const log = h ? h.logs?.find(l => l.date === day.dateStr) : undefined;
                    const isCompleted = log?.status === 'completed';
                    const isSkipped = log?.status === 'skipped';
                    
                    let isMandatory = false;
                    const dayOfWeek = day.dateObj.getDay();
                    if (h && h.scheduleType === 'daily') isMandatory = true;
                    if (h && h.scheduleType === 'fixedDays' && h.selectedDays) {
                      try {
                        const days = JSON.parse(h.selectedDays);
                        const d = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon
                        isMandatory = days.includes(d);
                      } catch { /* ignore */ }
                    }
                    if (h && h.startDate) {
                       const hStart = new Date(h.startDate).getTime();
                       const dayEnd = day.dateObj.getTime() + 24 * 60 * 60 * 1000 - 1; // 23:59:59 of that day
                       if (hStart > dayEnd) isMandatory = false;
                    }
                    if (h && h.endDate) {
                       const hEnd = new Date(h.endDate).getTime();
                       if (day.dateObj.getTime() > hEnd) isMandatory = false;
                    }
                    if (h && h.restDays) {
                       try {
                         const rest = JSON.parse(h.restDays);
                         const d = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon
                         if (rest.includes(d)) isMandatory = false;
                       } catch { /* ignore */ }
                    }

                    let isPink = false;
                    let isGolden = false;
                    let isBankedUsage = false;

                    if (isCompleted) {
                      currentCompletedCount++;
                      if (currentCompletedCount === 7) isPink = true;
                      if (currentCompletedCount === 30) isGolden = true;
                      if (log?.note === '[Banked Day Used]') isBankedUsage = true;
                    }

                    const isVacationDay = vacations.some(v => {
                      const d = new Date(day.dateStr).getTime();
                      return d >= new Date(v.startDate).getTime() && d <= new Date(v.endDate).getTime();
                    });

                    // Current status to pass to CheckIn handler
                    const currentStatus = isCompleted ? 'completed' : isSkipped ? 'skipped' : 'none';

                    return (
                      <div key={j} className={`flex-1 min-w-[28px] border-r border-[#333] border-dotted flex items-center justify-center 
                        ${isVacationDay ? 'bg-[#1a202c]' : !isMandatory && h && !isCompleted ? 'bg-[#151515] opacity-80' : ''}
                      `}>
                        {h && (
                           <button 
                             onClick={() => onCheckIn(h.id, day.dateStr, currentStatus)}
                             disabled={isVacationDay}
                             className={`w-5 h-5 border rounded flex items-center justify-center transition-colors 
                               ${isVacationDay ? 'border-[#333] bg-[#222] cursor-not-allowed' :
                                 isPink ? 'border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 
                                 isGolden ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] bg-yellow-500/10' : 
                                 isCompleted && !isBankedUsage ? 'border-[#444] bg-[#222]' : 
                                 isSkipped ? 'border-red-900 bg-red-900/30' :
                                 isMandatory ? 'border-blue-700 bg-blue-900/50 hover:bg-blue-800/80' : 'border-[#333] hover:border-gray-500 bg-[#1a2333]'}`}
                           >
                             {isVacationDay && <Palmtree className="w-3 h-3 text-blue-500" />}
                             {isCompleted && !isBankedUsage && !isVacationDay && (
                               <Check className={`w-3.5 h-3.5 stroke-[3] 
                                 ${isPink ? 'text-pink-500' : 
                                   isGolden ? 'text-yellow-500' : 'text-green-500'}`} />
                             )}
                             {isCompleted && isBankedUsage && !isVacationDay && (
                               <span className="text-blue-500 font-bold leading-none">-</span>
                             )}
                             {isSkipped && !isVacationDay && (
                               <X className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
                             )}
                             {!isMandatory && !isCompleted && !isSkipped && !isVacationDay && (
                               <span className="text-[8px] text-blue-500/50 font-bold">O</span>
                             )}
                           </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div className="h-8 flex border-b border-[#333] bg-[#222]">
              {dailyTotals.map((t, i) => (
                <div key={i} className="flex-1 min-w-[28px] border-r border-[#333] flex items-center justify-center text-[10px] text-gray-400 font-medium">
                  {t.completedCount}/{t.totalMandatory || '-'}
                </div>
              ))}
            </div>
            <div className="h-8 flex bg-[#1a1a1a]">
              {dailyTotals.map((t, i) => {
                let p = '-';
                if (t.totalMandatory > 0) {
                   p = `${Math.min(100, Math.round((t.completedCount / t.totalMandatory) * 100))}%`;
                }
                return (
                  <div key={i} className={`flex-1 min-w-[28px] border-r border-[#333] flex items-center justify-center text-[9px] ${p === '100%' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}>
                    {p}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col gap-3">
        {mobileDay && paddedDaily.filter(h => h !== null).map((h, i) => {
          const log = h.logs?.find(l => l.date === mobileDay.dateStr);
          const isCompleted = log?.status === 'completed';
          const isSkipped = log?.status === 'skipped';
          
          let isMandatory = false;
          const dayOfWeek = mobileDay.dateObj.getDay();
          if (h.scheduleType === 'daily') isMandatory = true;
          if (h.scheduleType === 'fixedDays' && h.selectedDays) {
            try {
              const days = JSON.parse(h.selectedDays);
              const d = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon
              isMandatory = days.includes(d);
            } catch { /* ignore */ }
          }
          if (h.startDate) {
             const hStart = new Date(h.startDate).getTime();
             const dayEnd = mobileDay.dateObj.getTime() + 24 * 60 * 60 * 1000 - 1;
             if (hStart > dayEnd) isMandatory = false;
          }
          if (h.endDate) {
             const hEnd = new Date(h.endDate).getTime();
             if (mobileDay.dateObj.getTime() > hEnd) isMandatory = false;
          }
          if (h.restDays) {
             try {
               const rest = JSON.parse(h.restDays);
               const d = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
               if (rest.includes(d)) isMandatory = false;
             } catch { /* ignore */ }
          }

          let isBankedUsage = false;
          if (isCompleted && log?.note === '[Banked Day Used]') isBankedUsage = true;

          const isVacationDay = vacations.some(v => {
            const d = new Date(mobileDay.dateStr).getTime();
            return d >= new Date(v.startDate).getTime() && d <= new Date(v.endDate).getTime();
          });

          const currentStatus = isCompleted ? 'completed' : isSkipped ? 'skipped' : 'none';

          return (
            <div key={i} className="flex justify-between items-center bg-[#222] border border-[#333] rounded-xl p-4 shadow">
              <div className="flex flex-col">
                <span className="font-bold text-gray-200">{h.title}</span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                   Total: {h.logs?.filter(l => l.status === 'completed').length || 0}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {!isMandatory && !isCompleted && !isVacationDay && (
                     <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">Optional</span>
                  )}
                  {isVacationDay && (
                     <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded flex items-center gap-1"><Palmtree className="w-3 h-3"/> Vacation</span>
                  )}
                  {isBankedUsage && (
                     <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">Banked Used</span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => onCheckIn(h.id, mobileDay.dateStr, currentStatus)}
                disabled={isVacationDay}
                className={`w-10 h-10 border-2 rounded-full flex items-center justify-center transition-colors 
                  ${isVacationDay ? 'border-[#333] bg-[#222] cursor-not-allowed' :
                    isCompleted && !isBankedUsage ? 'border-green-500 bg-green-500 text-black' : 
                    isSkipped ? 'border-red-500 bg-red-500/20 text-red-500' :
                    isMandatory ? 'border-gray-500 bg-[#1a1a1a] hover:border-green-500' : 'border-gray-700 bg-[#1a1a1a] border-dashed hover:border-green-500'}`}
              >
                {isCompleted && !isBankedUsage && !isVacationDay && <Check className="w-6 h-6 stroke-[3]" />}
                {isCompleted && isBankedUsage && !isVacationDay && <span className="text-blue-500 font-bold leading-none">-</span>}
                {isSkipped && !isVacationDay && <X className="w-5 h-5 stroke-[3]" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
