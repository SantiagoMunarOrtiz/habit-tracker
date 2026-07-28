import { useState, useEffect } from 'react';
import { PlusCircle, Check, Trash2, Palmtree } from 'lucide-react';
import { HabitFormModal } from '../components/HabitFormModal';
import type { User, Habit, Vacation, Goal } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Dashboard({ user }: { user: User }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recommendation, setRecommendation] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Standardize "today" to local ISO string
  const todayDate = new Date();
  const today = new Date(todayDate.getTime() - (todayDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const isVacation = (dateStr: string) => {
    const d = new Date(dateStr).getTime();
    return vacations.some(v => {
      const start = new Date(v.startDate).getTime();
      const end = new Date(v.endDate).getTime();
      return d >= start && d <= end;
    });
  };

  const isTodayVacation = isVacation(today);

  const fetchHabits = async () => {
    try {
      const res = await fetch(`${API_URL}/habits/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setHabits(data);
      } else {
        console.error('Failed to fetch habits:', data);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchRecommendation = async () => {
    try {
      const res = await fetch(`${API_URL}/habits/user/${user.id}/recommendations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    }
  };

  const fetchVacations = async () => {
    try {
      const res = await fetch(`${API_URL}/vacations/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setVacations(data);
    } catch (error) {
      console.error('Error fetching vacations:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/goals/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  useEffect(() => {
    fetchHabits();
    fetchRecommendation();
    fetchVacations();
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleCheckIn = async (habitId: string, status: string, checkInDate: string = today) => {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ date: checkInDate, status })
      });
      const data = await response.json();

      if (data.milestone === 'golden') {
        alert('🌟 GOLDEN DAY! All mandatory habits completed!');
      }
      if (data.unlockedAchievement) {
        alert(`🏆 Achievement Unlocked: ${data.unlockedAchievement.name}!\n${data.unlockedAchievement.message}`);
      }

      fetchHabits();
      fetchRecommendation();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleArchive = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit? Its historical data will be archived for your charts.')) return;
    try {
      await fetch(`${API_URL}/habits/${habitId}/archive`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchHabits();
      fetchRecommendation();
    } catch (error) {
      console.error('Error archiving habit:', error);
    }
  };

  const handleCreateHabit = async (data: any) => {
    try {
      await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Today's Tasks</h2>
          <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#232323] border border-[#333] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
          <PlusCircle className="w-5 h-5 text-green-500" />
          Add Task
        </button>
      </header>

      {isTodayVacation && (
        <div className="bg-[#1e2330] border border-[#2a3a5c] text-blue-300 p-5 rounded-2xl mb-8 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#252c3f] rounded-full flex items-center justify-center text-2xl">🌴</div>
            <div>
              <h4 className="font-bold text-lg text-white">Vacation Mode Active</h4>
              <p className="text-sm text-blue-200/80">Take a break! Your streaks are protected and habits are paused for today.</p>
            </div>
          </div>
        </div>
      )}

      {recommendation && !isTodayVacation && (
        <div className="bg-[#1a1a2e] border border-[#2a2a4e] text-blue-300 p-4 rounded-xl mb-8 flex items-start gap-3">
          <span className="text-xl mt-0.5">💡</span>
          <div>
            <h4 className="font-bold text-sm text-blue-200">Smart Recommendation</h4>
            <p className="text-sm mt-0.5">{recommendation}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {habits.length === 0 && (
          <div className="text-center p-8 text-gray-500 bg-[#1a1a1a] rounded-xl border border-dashed border-[#333]">
            No habits yet. Click "Add Task" to start!
          </div>
        )}

        {['morning', 'afternoon', 'evening', 'any'].map(timeSlot => {
          const slotHabits = habits.filter(h => (h.timeOfDay || 'any') === timeSlot);
          if (slotHabits.length === 0) return null;

          const slotTitle = timeSlot === 'any' ? 'Anytime' : timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1);

          return (
            <div key={timeSlot} className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 border-b border-[#333] pb-2 uppercase tracking-wider flex items-center gap-2">
                {timeSlot === 'morning' ? '🌅' : timeSlot === 'afternoon' ? '☀️' : timeSlot === 'evening' ? '🌙' : '📌'} {slotTitle}
              </h3>

              {slotHabits.map((habit) => {
                const isCompletedToday = habit.logs?.some(log => log.date === today && log.status === 'completed');

                const currentDay = new Date();
                const dayOfWeek = currentDay.getDay() === 0 ? 6 : currentDay.getDay() - 1;
                const startOfWeek = new Date(currentDay);
                startOfWeek.setDate(currentDay.getDate() - dayOfWeek);

                const weekDays = Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date(startOfWeek);
                  date.setDate(startOfWeek.getDate() + i);
                  const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                  const isCompleted = habit.logs?.some(l => l.date === dateStr && l.status === 'completed');

                  const selectedDays = habit.selectedDays ? JSON.parse(habit.selectedDays) : [];
                  const isMandatory = habit.scheduleType === 'daily' || (habit.scheduleType === 'fixedDays' && selectedDays.includes(i));

                  return {
                    date: dateStr,
                    label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
                    isCompleted,
                    isMandatory,
                    isToday: dateStr === today
                  };
                });

                return (
                  <div key={habit.id} className={`bg-[#1a1a1a] p-5 rounded-2xl border ${isCompletedToday ? 'border-green-900/50 bg-[#131b14]' : 'border-[#333]'} hover:border-gray-600 transition-colors`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleCheckIn(habit.id, isCompletedToday ? 'skipped' : 'completed')}
                          disabled={isTodayVacation}
                          className={`w-7 h-7 mt-1 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0
                            ${isTodayVacation ? 'opacity-50 cursor-not-allowed bg-[#222] border-[#444]' :
                              isCompletedToday ? 'bg-green-500 border-green-500 text-black' : 'border-gray-500 hover:border-green-500'}`}
                        >
                          {isCompletedToday && !isTodayVacation && <Check className="w-5 h-5" />}
                          {isTodayVacation && <Palmtree className="w-4 h-4 text-blue-500" />}
                        </button>
                        <div>
                          {habit.triggerCue && !isCompletedToday && (
                            <div className="text-xs text-blue-400/80 mb-1 flex items-center gap-1 font-medium">
                              <span className="text-[10px]">📍</span> {habit.triggerCue}
                            </div>
                          )}
                          <h3 className={`font-bold text-lg ${isCompletedToday ? 'line-through text-gray-500' : 'text-gray-200'}`}>{habit.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs font-medium px-2 py-0.5 bg-[#2a2a2a] text-gray-400 rounded inline-block">
                              {habit.planType}
                            </span>
                            {habit.scheduleType === 'flexible' && (
                              <span className="text-xs font-medium px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded inline-block">
                                Target: {habit.targetDaysPerWeek}x / week
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-start mt-1">
                        <div className="flex items-center gap-2 text-orange-500/80 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                          <span className="font-bold text-sm">🔥 {habit.logs?.filter(l => l.status === 'completed').length || 0}</span>
                        </div>
                        <button
                          onClick={() => handleArchive(habit.id)}
                          className="text-gray-500 hover:text-red-500 p-1 rounded transition-colors"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#111] rounded-xl p-3 border border-[#222]">
                      {weekDays.map((day, idx) => {
                        const dayIsVacation = isVacation(day.date);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5">
                            <span className={`text-[10px] font-bold ${day.isToday ? 'text-white' : 'text-gray-500'}`}>{day.label}</span>
                            <button
                              onClick={() => handleCheckIn(habit.id, day.isCompleted ? 'skipped' : 'completed', day.date)}
                              disabled={day.date !== today || dayIsVacation}
                              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all
                                ${dayIsVacation ? 'border-[#333] bg-[#222] cursor-not-allowed' :
                                  day.isCompleted ? 'bg-green-500 border-green-500 text-black' :
                                    day.isMandatory ? 'border-gray-600 bg-[#1a1a1a]' : 'border-[#333] bg-[#1a2333]'}
                                ${day.isToday && !day.isCompleted && !dayIsVacation ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#111]' : ''}
                              `}
                              title={dayIsVacation ? 'Vacation' : day.isMandatory ? 'Mandatory' : 'Rest Day'}
                            >
                              {dayIsVacation && <Palmtree className="w-3.5 h-3.5 text-blue-500" />}
                              {day.isCompleted && !dayIsVacation && <Check className="w-3.5 h-3.5" />}
                              {!day.isMandatory && !day.isCompleted && !dayIsVacation && <span className="text-[9px] text-blue-500/70 font-bold">R</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {!isCompletedToday && habit.ifThenPlan && (
                      <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg text-sm text-blue-300/80 flex items-start gap-2">
                        <span>🛡️</span>
                        <div>
                          <span className="font-bold text-blue-300">Backup Plan:</span> {habit.ifThenPlan}
                        </div>
                      </div>
                    )}
                    {isCompletedToday && habit.miniReward && (
                      <div className="mt-4 p-3 bg-green-900/10 border border-green-900/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
                        <span>🎉</span>
                        <span className="font-bold">Reward yourself:</span> {habit.miniReward}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateHabit}
        categories={user.categories}
        goals={goals}
      />
    </div>
  );
}
