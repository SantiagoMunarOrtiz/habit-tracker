import { useState, useEffect } from 'react';
import { Check, PlusCircle, Trash2 } from 'lucide-react';
import { HabitFormModal } from './HabitFormModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Habit {
  id: string;
  title: string;
  category: { name: string; color: string };
  planType: string;
  scheduleType: string;
  selectedDays: string;
  bankedDays: number;
  logs: { date: string; status: string; note?: string }[];
}

interface User {
  id: string;
  email: string;
  name: string;
  level: number;
  points: number;
  categories: { id: string; name: string }[];
}

export function SpreadsheetView({ user }: { user: User }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date();
  
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/habits/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHabits(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchHabits(); }, [user.id]);

  const handleCheckIn = async (habitId: string, dateStr: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'completed' ? 'skipped' : 'completed';
      await fetch(`${API_URL}/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ date: dateStr, status: newStatus })
      });
      fetchHabits();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCreateHabit = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          userId: user.id
        })
      });
      fetchHabits();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const handleArchive = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit? Its historical data will be archived for your charts.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/habits/${habitId}/archive`, { 
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchHabits();
    } catch (error) {
      console.error('Error archiving habit:', error);
    }
  };

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  
  const getDayInfo = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    return { dateStr, dayOfWeek, dateObj: d };
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => getDayInfo(i + 1));

  const weeks: { weekNum: number; days: typeof daysArray }[] = [];
  let currentWeekNum = 1;
  let currentWeekDays: typeof daysArray = [];

  for (const day of daysArray) {
    currentWeekDays.push(day);
    if (day.dayOfWeek === 'Sun' || day.dateStr === daysArray[daysArray.length - 1].dateStr) {
      weeks.push({ weekNum: currentWeekNum, days: currentWeekDays });
      currentWeekNum++;
      currentWeekDays = [];
    }
  }

  const dailyHabits = habits.filter(h => h.scheduleType === 'daily' || h.scheduleType === 'fixedDays');
  const paddedDaily = [...dailyHabits];
  while (paddedDaily.length < 12) { paddedDaily.push(null as any); }

  const getWeeklyScore = (h: Habit, weekDays: typeof daysArray) => {
    let mandatoryTarget = 0;
    let totalCompleted = 0;

    for (const d of weekDays) {
      const isCompleted = h.logs?.some(l => l.date === d.dateStr && l.status === 'completed');
      if (isCompleted) totalCompleted++;

      let isMandatory = true;
      if (h.scheduleType === 'fixedDays' && h.selectedDays) {
        try {
          const days = JSON.parse(h.selectedDays);
          const dayIdx = d.dateObj.getDay() === 0 ? 6 : d.dateObj.getDay() - 1;
          isMandatory = days.includes(dayIdx);
        } catch {}
      }
      if (isMandatory) mandatoryTarget++;
    }

    if (mandatoryTarget === 0) return { score: totalCompleted, target: 7 }; // Fallback

    const effective = Math.min(totalCompleted, mandatoryTarget);
    return { score: effective, target: mandatoryTarget };
  };

  const calculateStreak = (habit: Habit) => {
    let current = 0;
    let max = 0;
    for (const { dateStr } of daysArray) {
      if (new Date(dateStr) > today) break;
      const isCompleted = habit.logs?.some(l => l.date === dateStr && l.status === 'completed');
      if (isCompleted) {
        current++;
        if (current > max) max = current;
      } else {
        current = 0;
      }
    }
    return max;
  };

  const dailyTotals = daysArray.map(({ dateStr, dateObj }) => {
    let completedCount = 0;
    let totalMandatory = 0;
    
    dailyHabits.forEach(h => {
      let isMandatory = true;
      if (h.scheduleType === 'fixedDays' && h.selectedDays) {
        try {
          const days = JSON.parse(h.selectedDays);
          const d = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1; // 0=Mon
          isMandatory = days.includes(d);
        } catch {}
      }
      
      const isCompleted = h.logs?.some(l => l.date === dateStr && l.status === 'completed');
      
      if (isMandatory) totalMandatory++;
      if (isCompleted) completedCount++;
    });
    
    return { completedCount, totalMandatory };
  });
  
  const dailyPercents = dailyTotals.map(({ completedCount, totalMandatory }) => {
    if (totalMandatory > 0) return Math.min(100, Math.round((completedCount / totalMandatory) * 100));
    if (completedCount > 0) return 100;
    return 0;
  });

  return (
    <div className="bg-[#121212] text-gray-200 p-8 min-h-screen font-sans overflow-x-auto">
      
      <div className="max-w-[1200px] mx-auto mb-6 flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-white mb-2">Habit Grid</h2>
            <p className="text-gray-500">Track your consistency across the entire month.</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#232323] border border-[#333] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
           <PlusCircle className="w-5 h-5 text-green-500" />
           Add Task
         </button>
      </div>

      <div className="min-w-[1200px] border border-[#333] bg-[#1a1a1a] shadow-xl mx-auto p-4 flex flex-col gap-6 rounded-xl">
        
        {/* Header */}
        <div className="bg-[#2a2a2a] border border-[#444] rounded py-3 text-center tracking-[0.3em] font-bold text-gray-300 text-xl">
          {monthNames[currentMonth]}
        </div>

        {/* DAILY HABITS SECTION */}
        <div className="flex gap-4">
          <div className="flex-1 flex border border-[#333] rounded overflow-hidden">
            {/* Row Headers */}
            <div className="w-64 flex flex-col border-r border-[#333]">
              <div className="bg-[#222] border-b border-[#333] h-16 flex items-center justify-center font-bold tracking-widest text-sm text-gray-400">
                DAILY HABITS
              </div>
              {paddedDaily.map((h, i) => (
                <div key={i} className="h-10 border-b border-[#333] border-dotted flex items-center px-3 text-xs justify-between text-gray-300 bg-[#1a1a1a] group">
                  <div className="flex flex-col">
                    <span className="truncate font-medium">{h ? h.title : ''}</span>
                  </div>
                  {h && (
                     <button onClick={() => handleArchive(h.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  )}
                </div>
              ))}
              <div className="bg-[#222] border-b border-[#333] h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">
                COMPLETE FOR THE DAY
              </div>
              <div className="bg-[#2a2a2a] h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">
                PERCENT COMPLETE
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-x-auto flex flex-col">
              {/* Days Header */}
              <div className="h-16 flex border-b border-[#333] bg-[#1a1a1a]">
                {daysArray.map((day, i) => {
                  const isToday = day.dateStr === today.toISOString().split('T')[0];
                  return (
                    <div key={i} className={`flex-1 min-w-[28px] border-r border-[#333] flex flex-col items-center justify-center text-[10px] ${isToday ? 'bg-green-800 text-green-100 font-bold' : 'text-gray-500 bg-[#1e1e1e]'}`}>
                      <div className={`border-b border-[#333] w-full text-center py-1 ${isToday ? 'bg-green-700' : 'bg-[#222]'}`}>{day.dayOfWeek}</div>
                      <div className="w-full text-center py-1">{i + 1}</div>
                    </div>
                  );
                })}
              </div>
              {/* Habit Rows */}
              {paddedDaily.map((h, i) => {
                let currentCompletedCount = 0;
                return (
                  <div key={i} className="h-10 flex border-b border-[#333] border-dotted bg-[#1a1a1a]">
                    {daysArray.map((day, j) => {
                      const isCompleted = h ? h.logs?.some(l => l.date === day.dateStr && l.status === 'completed') : false;
                      
                      let isMandatory = true;
                      if (h && h.scheduleType === 'fixedDays' && h.selectedDays) {
                        try {
                          const days = JSON.parse(h.selectedDays);
                          const d = day.dateObj.getDay() === 0 ? 6 : day.dateObj.getDay() - 1; // 0=Mon, 6=Sun
                          isMandatory = days.includes(d);
                        } catch {}
                      }

                      let isPink = false;
                      let isGolden = false;

                      if (isCompleted) {
                        currentCompletedCount++;
                        if (currentCompletedCount === 7) isPink = true;
                        if (currentCompletedCount === 30) isGolden = true;
                      }

                      return (
                        <div key={j} className={`flex-1 min-w-[28px] border-r border-[#333] border-dotted flex items-center justify-center 
                          ${!isMandatory && h && !isCompleted ? 'bg-[#151515] opacity-50 text-gray-600' : ''}
                        `}>
                          {h && (
                             <button 
                               onClick={() => handleCheckIn(h.id, day.dateStr, isCompleted ? 'completed' : 'none')}
                               className={`w-5 h-5 border rounded flex items-center justify-center transition-colors 
                                 ${isPink ? 'border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 
                                   isGolden ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] bg-yellow-500/10' : 
                                   isCompleted ? 'border-[#444] bg-[#222]' : 
                                   isMandatory ? 'border-blue-700 bg-blue-900/50 hover:bg-blue-800/80' : 'border-[#444] hover:border-gray-500 bg-[#222]'}`}
                             >
                               {isCompleted ? (
                                 <Check className={`w-3.5 h-3.5 stroke-[3] 
                                   ${isPink ? 'text-pink-500' : 
                                     isGolden ? 'text-yellow-500' : 'text-green-500'}`} />
                               ) : (
                                 !isMandatory && <span className="text-[10px] text-gray-500 font-bold">O</span>
                               )}
                             </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* Totals */}
              <div className="h-8 flex border-b border-[#333] bg-[#222]">
                {dailyTotals.map((t, i) => (
                  <div key={i} className="flex-1 min-w-[28px] border-r border-[#333] flex items-center justify-center text-xs text-gray-400 font-medium">
                    {t.completedCount || ''}
                  </div>
                ))}
              </div>
              <div className="h-8 flex bg-[#1a1a1a]">
                {dailyPercents.map((p, i) => (
                  <div key={i} className="flex-1 min-w-[28px] border-r border-[#333] flex items-center justify-center text-[9px] text-gray-500">
                    {p}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTIONS */}
        <div className="flex gap-4">
          
          {/* WEEKLY HABITS */}
          <div className="flex-[2] flex border border-[#333] rounded overflow-hidden">
            <div className="w-64 flex flex-col border-r border-[#333]">
              <div className="bg-[#222] border-b border-[#333] h-16 flex items-center justify-center font-bold tracking-widest text-sm text-gray-400">
                WEEKLY HABITS
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 border-b border-[#333] border-dotted flex items-center px-3 text-xs justify-end text-gray-300 bg-[#1a1a1a]">
                  {/* Empty for visual for now, or you can implement weekly later */}
                </div>
              ))}
              <div className="bg-[#222] border-b border-[#333] h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">
                COMPLETE FOR THE WEEK
              </div>
              <div className="bg-[#2a2a2a] h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">
                PERCENT COMPLETE
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="h-16 flex border-b border-[#333]">
                {[1, 2, 3, 4, 5].map(wk => (
                  <div key={wk} className="flex-1 border-r border-[#333] flex flex-col items-center justify-center text-xs text-gray-500 bg-[#1e1e1e]">
                    <div className="border-b border-[#333] w-full text-center py-1 bg-[#222]">WK</div>
                    <div className="w-full text-center py-1">{wk}</div>
                  </div>
                ))}
              </div>
              {[...Array(6)].map((_, r) => (
                <div key={r} className="h-10 flex border-b border-[#333] border-dotted bg-[#1a1a1a]">
                   {[1, 2, 3, 4, 5].map(c => (
                     <div key={c} className="flex-1 border-r border-[#333] border-dotted flex items-center justify-center">
                        <div className="w-5 h-5 border border-[#444] rounded flex items-center justify-center bg-[#222]"></div>
                     </div>
                   ))}
                </div>
              ))}
              <div className="h-8 flex border-b border-[#333] bg-[#222]">
                 {[1, 2, 3, 4, 5].map(c => <div key={c} className="flex-1 border-r border-[#333] flex items-center justify-center text-xs text-gray-400"></div>)}
              </div>
              <div className="h-8 flex bg-[#1a1a1a]">
                 {[1, 2, 3, 4, 5].map(c => <div key={c} className="flex-1 border-r border-[#333] flex items-center justify-center text-[9px] text-gray-500"></div>)}
              </div>
            </div>
          </div>

          {/* DAYS COMPLETE & BEST STREAK */}
          <div className="flex-1 flex border border-[#333] bg-[#1a1a1a] rounded overflow-hidden">
            <div className="flex-1 flex flex-col border-r border-[#333] text-center">
              <div className="bg-[#222] border-b border-[#333] h-16 flex items-center justify-center text-[10px] font-bold px-2 leading-tight text-gray-400">DAYS<br/>COMPLETE</div>
              {paddedDaily.map((h, i) => {
                 let totalEffective = 0;
                 if (h) {
                   totalEffective = weeks.reduce((sum, w) => sum + getWeeklyScore(h, w.days).score, 0);
                 }
                 return (
                   <div key={i} className="h-10 border-b border-[#333] border-dotted flex items-center justify-center text-xs text-gray-300">
                     {h ? totalEffective : ''}
                   </div>
                 );
              })}
              <div className="bg-[#222] border-b border-[#333] h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">BEST</div>
              <div className="h-8 flex items-center justify-center text-xs"></div>
            </div>
            <div className="flex-1 flex flex-col text-center">
              <div className="bg-[#222] border-b border-[#333] h-16 flex items-center justify-center text-[10px] font-bold px-2 leading-tight text-gray-400">BEST<br/>STREAK</div>
              {paddedDaily.map((h, i) => (
                <div key={i} className="h-10 border-b border-[#333] border-dotted flex items-center justify-center text-xs text-gray-300">
                  {h ? calculateStreak(h) : ''}
                </div>
              ))}
              <div className="bg-[#222] border-b border-[#333] h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">BEST</div>
              <div className="h-8 flex items-center justify-center text-xs"></div>
            </div>
          </div>

          {/* MONTHLY HABITS */}
          <div className="flex-[1.5] flex border border-[#333] rounded overflow-hidden">
             <div className="flex-1 flex flex-col border-r border-[#333]">
               <div className="bg-[#222] border-b border-[#333] h-16 flex items-center justify-center font-bold tracking-widest text-sm text-gray-400">
                 MONTHLY HABITS
               </div>
               {[...Array(9)].map((_, i) => (
                 <div key={i} className="h-10 border-b border-[#333] border-dotted flex items-center px-3 text-xs justify-end text-gray-300 bg-[#1a1a1a]">
                 </div>
               ))}
               <div className="bg-[#222] border-b border-[#333] h-8 flex items-center justify-center text-[9px] font-bold text-gray-400 px-2 leading-tight">
                 COMPLETE FOR THE MONTH
               </div>
               <div className="bg-[#2a2a2a] h-8 flex items-center justify-center text-[9px] font-bold text-gray-400">
                 PERCENT COMPLETE
               </div>
             </div>
             <div className="w-20 flex flex-col">
               <div className="bg-[#1e1e1e] border-b border-[#333] h-16 flex items-center justify-center text-xs text-gray-500 font-medium">
                 {monthNames[currentMonth].substring(0,3)}
               </div>
               {[...Array(9)].map((_, r) => (
                 <div key={r} className="h-10 flex border-b border-[#333] border-dotted bg-[#1a1a1a] items-center justify-center">
                    <div className="w-5 h-5 border border-[#444] rounded flex items-center justify-center bg-[#222]"></div>
                 </div>
               ))}
               <div className="h-8 flex border-b border-[#333] bg-[#222] items-center justify-center text-xs text-gray-400"></div>
               <div className="h-8 flex bg-[#1a1a1a] items-center justify-center text-[9px] text-gray-500"></div>
             </div>
          </div>

        </div>

      </div>
      
      <HabitFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateHabit}
        categories={user.categories}
      />
    </div>
  );
}
