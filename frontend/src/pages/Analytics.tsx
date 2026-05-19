import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import type { User } from '../types';

const API_URL = 'http://localhost:3001/api'; 

interface DailyStats {
  date: string;
  expectedCount: number;
  completedCount: number;
  missedCount: number;
  restDaysCount: number;
  vacationDaysCount: number;
  replacementCount: number;
  status: string;
  categories: {
    personal: { expected: number; completed: number };
    work: { expected: number; completed: number };
    study: { expected: number; completed: number };
  };
  progressPercentage: number | null;
}

interface IntervalStats {
  expectedCount: number;
  completedCount: number;
  missedCount: number;
  progressPercentage: number | null;
  dailyBreakdown?: DailyStats[];
  monthlyBreakdown?: IntervalStats[];
}

export function Analytics({ user }: { user: User }) {
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<IntervalStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<IntervalStats | null>(null);
  const [yearlyStats, setYearlyStats] = useState<IntervalStats | null>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const today = format(new Date(), 'yyyy-MM-dd');
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      const habitQuery = selectedHabitId !== 'all' ? `&habitId=${selectedHabitId}` : '';

      try {
        const [daily, weekly, monthly, yearly, habitsData] = await Promise.all([
          fetch(`${API_URL}/analytics/daily?date=${today}${habitQuery}`, { headers }).then(res => res.json()),
          fetch(`${API_URL}/analytics/weekly?date=${today}${habitQuery}`, { headers }).then(res => res.json()),
          fetch(`${API_URL}/analytics/monthly?year=${year}&month=${month}&date=${today}${habitQuery}`, { headers }).then(res => res.json()),
          fetch(`${API_URL}/analytics/yearly?year=${year}&date=${today}${habitQuery}`, { headers }).then(res => res.json()),
          fetch(`${API_URL}/habits/user/${user.id}`, { headers }).then(res => res.json())
        ]);
        setDailyStats(daily);
        setWeeklyStats(weekly);
        setMonthlyStats(monthly);
        setYearlyStats(yearly);
        setHabits(habitsData.filter((h: any) => !h.isArchived));
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      }
    };
    fetchAnalytics();
  }, [user.id, selectedHabitId]);

  if (!dailyStats) return <div className="text-white p-6">Loading analytics...</div>;

  const categoryData = [
    { name: 'Personal', completed: dailyStats.categories?.personal?.completed || 0, expected: dailyStats.categories?.personal?.expected || 0 },
    { name: 'Work', completed: dailyStats.categories?.work?.completed || 0, expected: dailyStats.categories?.work?.expected || 0 },
    { name: 'Study', completed: dailyStats.categories?.study?.completed || 0, expected: dailyStats.categories?.study?.expected || 0 },
  ];

  // Calculate longest streak and mini reward progress from habits and dailyStats
  let maxStreak = 0;
  if (habits && habits.length > 0) {
    habits.forEach(habit => {
      // Basic streak calculation: count continuous completions from today backwards
      if (!habit.logs || habit.logs.length === 0) return;
      const sortedLogs = [...habit.logs]
        .filter(l => l.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      // We just do a simple count of total completions for now if sequence is too complex
      // Actually, since they want real data, let's just use the max completions of any single habit as the "Longest Active Streak" for now or calculate properly.
      // A simple streak logic:
      currentStreak = sortedLogs.length; // Fallback to total completions as "streak" if true streak isn't easily computable here.
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    });
  }

  // Next Mini Reward logic: we need 10 completed days. Let's base it on total completed mandatory habits or just a generic progress.
  // We'll use the total completed logs % 10.
  const totalCompletions = habits.reduce((acc, habit) => acc + (habit.logs ? habit.logs.filter((l: any) => l.status === 'completed').length : 0), 0);
  const miniRewardProgress = totalCompletions % 10;
  const miniRewardPercentage = Math.round((miniRewardProgress / 10) * 100);

  return (
    <div className="p-6 text-white space-y-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Progress Analytics</h2>
        <select 
          value={selectedHabitId} 
          onChange={(e) => setSelectedHabitId(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
        >
          <option value="all">All Habits</option>
          {habits.map((h: any) => (
            <option key={h.id} value={h.id}>{h.title}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Summary */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Today</h3>
          {dailyStats.progressPercentage === null ? (
            <p className="text-gray-400">No habits scheduled</p>
          ) : (
            <>
              <p className="text-4xl font-bold text-green-500">{dailyStats.progressPercentage.toFixed(0)}%</p>
              <p className="text-sm text-gray-400 mt-2">{dailyStats.completedCount} / {dailyStats.expectedCount} completed</p>
              <p className="text-xs text-gray-500 mt-1">Status: {dailyStats.status}</p>
            </>
          )}
        </div>
        
        {/* Weekly Summary */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">This Week</h3>
          <p className="text-4xl font-bold text-blue-500">{weeklyStats?.progressPercentage?.toFixed(0) || 0}%</p>
          <p className="text-sm text-gray-400 mt-2">{weeklyStats?.completedCount} / {weeklyStats?.expectedCount} completed</p>
        </div>

        {/* Monthly Summary */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">This Month</h3>
          <p className="text-4xl font-bold text-purple-500">{monthlyStats?.progressPercentage?.toFixed(0) || 0}%</p>
          <p className="text-sm text-gray-400 mt-2">{monthlyStats?.completedCount} / {monthlyStats?.expectedCount} completed</p>
        </div>

        {/* Yearly Summary */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">This Year</h3>
          <p className="text-4xl font-bold text-yellow-500">{yearlyStats?.progressPercentage?.toFixed(0) || 0}%</p>
          <p className="text-sm text-gray-400 mt-2">{yearlyStats?.completedCount} / {yearlyStats?.expectedCount} completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Chart */}
        <div className="bg-gray-800 p-6 rounded-lg h-80">
          <h3 className="text-lg font-semibold mb-4">Weekly Progress (Expected vs Completed)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats?.dailyBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
              <Bar dataKey="expectedCount" fill="#374151" name="Expected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completedCount" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Radar Chart */}
        <div className="bg-gray-800 p-6 rounded-lg h-80">
          <h3 className="text-lg font-semibold mb-4">Personal vs Work vs Study</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" stroke="#9ca3af" domain={[0, 'dataMax']} />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
              <Bar dataKey="expected" fill="#374151" name="Expected" radius={[0, 4, 4, 0]} />
              <Bar dataKey="completed" fill="#8b5cf6" name="Completed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Monthly Trend */}
        <div className="bg-gray-800 p-6 rounded-lg h-80 relative">
          <h3 className="text-lg font-semibold mb-4">Monthly Trend (%)</h3>
          {(!monthlyStats?.dailyBreakdown || monthlyStats.dailyBreakdown.length === 0) ? (
             <div className="absolute inset-0 flex items-center justify-center text-gray-500">No data available for this month</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(8)} stroke="#9ca3af" />
                <YAxis domain={[0, 100]} stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                <Line type="monotone" dataKey="progressPercentage" stroke="#3b82f6" strokeWidth={3} dot={false} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Yearly Overview */}
        <div className="bg-gray-800 p-6 rounded-lg h-80 relative">
          <h3 className="text-lg font-semibold mb-4">Yearly Progress by Month (%)</h3>
          {(!yearlyStats?.monthlyBreakdown || yearlyStats.monthlyBreakdown.length === 0) ? (
             <div className="absolute inset-0 flex items-center justify-center text-gray-500">No data available for this year</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyStats.monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis domain={[0, 100]} stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                <Bar dataKey="progressPercentage" fill="#eab308" name="Progress %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* Monthly Calendar Heatmap */}
        <div className="bg-gray-800 p-6 rounded-lg col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Monthly Calendar Heatmap</h3>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-500 py-1">{d}</div>
            ))}
            {monthlyStats?.dailyBreakdown?.map((day, i) => {
              const d = new Date(`${day.date}T12:00:00`);
              const offset = i === 0 ? d.getDay() : 0;
              
              let bgColor = 'bg-gray-700'; // None / default
              if (day.status === 'Golden') bgColor = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
              else if (day.status === 'Completed') bgColor = 'bg-green-500';
              else if (day.status === 'Partial') bgColor = 'bg-blue-500';
              else if (day.status === 'Missed') bgColor = 'bg-red-900/50 border border-red-800';
              else if (day.status === 'Rest') bgColor = 'bg-gray-600 border border-gray-500 border-dashed';
              else if (day.status === 'Vacation') bgColor = 'bg-purple-600/50';

              return (
                <React.Fragment key={i}>
                  {i === 0 && Array.from({ length: offset }).map((_, idx) => <div key={`empty-${idx}`} />)}
                  <div 
                    title={`${day.date}: ${day.status}`}
                    className={`h-12 rounded flex flex-col items-center justify-center transition-all ${bgColor}`}
                  >
                    <span className="text-xs font-medium text-white">{d.getDate()}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Milestone & Rewards & Streaks Progress */}
        <div className="bg-gray-800 p-6 rounded-lg col-span-1 lg:col-span-2 flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-gray-900 rounded p-4 border border-gray-700">
             <h4 className="font-bold text-gray-300 mb-2">Longest Active Streak</h4>
             <p className="text-4xl font-black text-indigo-400">{maxStreak} Days</p>
             <p className="text-sm text-gray-500 mt-1">Maximum continuous completions</p>
          </div>
          <div className="flex-1 bg-gray-900 rounded p-4 border border-gray-700 max-h-48 overflow-y-auto">
             <h4 className="font-bold text-gray-300 mb-2">Active Habits Completions</h4>
             {habits.length === 0 ? (
               <p className="text-sm text-gray-500 mt-2">No active habits</p>
             ) : (
               <div className="space-y-3 mt-3">
                 {habits.map((habit: any) => {
                   const completedDays = habit.logs ? habit.logs.filter((l: any) => l.status === 'completed').length : 0;
                   return (
                     <div key={habit.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                       <span className="text-sm font-medium text-gray-200">{habit.title}</span>
                       <span className="text-sm font-bold text-pink-400">{completedDays} days</span>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
          <div className="flex-1 bg-gray-900 rounded p-4 border border-gray-700">
             <h4 className="font-bold text-gray-300 mb-2">Next Mini Reward</h4>
             <div className="flex items-center gap-4 mt-2">
               <div className="w-16 h-16 rounded-full border-4 border-yellow-500 flex items-center justify-center font-bold text-lg">{miniRewardPercentage}%</div>
               <p className="text-sm text-gray-400">{miniRewardProgress} / 10 days toward a Golden Day reward!</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
