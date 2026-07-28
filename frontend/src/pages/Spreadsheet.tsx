import { useState, useEffect } from 'react';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { HabitFormModal } from '../components/HabitFormModal';
import { HabitGrid } from '../components/HabitGrid';
import type { User, Habit, Vacation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Spreadsheet({ user }: { user: User }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const todayDate = new Date();
  const todayStr = new Date(todayDate.getTime() - (todayDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const targetDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + monthOffset, 1);
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const fetchHabits = async () => {
    try {
      const res = await fetch(`${API_URL}/habits/user/${user.id}`, {
        credentials: 'include',
        credentials: 'include'
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

  const fetchVacations = async () => {
    try {
      const res = await fetch(`${API_URL}/vacations/user/${user.id}`, {
        credentials: 'include',
        credentials: 'include'
      });
      const data = await res.json();
      setVacations(data);
    } catch (error) {
      console.error('Error fetching vacations:', error);
    }
  };

  useEffect(() => {
    fetchHabits();
    fetchVacations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleCheckIn = async (habitId: string, dateStr: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'skipped' : 'completed';
      const response = await fetch(`${API_URL}/habits/${habitId}/checkin`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        body: JSON.stringify({ date: dateStr, status: newStatus })
      });
      const data = await response.json();

      if (data.milestone === 'golden') {
        alert('🌟 GOLDEN DAY! All mandatory habits completed!');
      }

      fetchHabits();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCreateHabit = async (data: any) => {
    try {
      await fetch(`${API_URL}/habits`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

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
      await fetch(`${API_URL}/habits/${habitId}/archive`, {
        credentials: 'include',
        method: 'PATCH',
        credentials: 'include'
      });
      fetchHabits();
    } catch (error) {
      console.error('Error archiving habit:', error);
    }
  };

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const getDayInfo = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    return { dateStr, dayOfWeek, dateObj: d };
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => getDayInfo(i + 1));

  return (
    <div className="bg-[#121212] text-gray-200 min-h-screen font-sans">

      <div className="max-w-[1200px] mx-auto mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Habit Grid</h2>
          <p className="text-gray-500">Track your consistency across the entire month.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-1">
            <button onClick={() => setMonthOffset(prev => prev - 1)} className="p-1 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors" title="Previous Month">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setMonthOffset(0)} className="px-2 text-sm font-bold text-gray-300 hover:text-white transition-colors" title="Current Month">
              {monthNames[currentMonth].substring(0, 3)} {currentYear !== todayDate.getFullYear() ? currentYear : ''}
            </button>
            <button onClick={() => setMonthOffset(prev => prev + 1)} className="p-1 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors" title="Next Month">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#232323] border border-[#333] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
            <PlusCircle className="w-5 h-5 text-green-500" />
            Add Task
          </button>
        </div>
      </div>

      <HabitGrid
        habits={habits}
        vacations={vacations}
        daysArray={daysArray}
        todayStr={todayStr}
        monthName={`${monthNames[currentMonth]} ${currentYear !== todayDate.getFullYear() ? currentYear : ''}`.trim()}
        onCheckIn={handleCheckIn}
        onArchive={handleArchive}
      />

      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateHabit}
        categories={user.categories}
      />
    </div>
  );
}
