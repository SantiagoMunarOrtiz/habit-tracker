import { useState, useEffect } from 'react';
import type { User, DailyReflection } from '../types';
import { format } from 'date-fns';
import { Book, Save, Smile, Frown, Meh } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const MoodSelector = ({ value, onChange }: { value?: number, onChange: (v: number) => void }) => {
  return (
    <div className="flex gap-4">
      <button type="button" onClick={() => onChange(1)} className={`p-3 rounded-xl border-2 transition-all ${value === 1 ? 'border-red-500 bg-red-500/20' : 'border-[#333] hover:border-red-500/50'}`}>
        <Frown className="w-8 h-8 text-red-500" />
      </button>
      <button type="button" onClick={() => onChange(3)} className={`p-3 rounded-xl border-2 transition-all ${value === 3 ? 'border-yellow-500 bg-yellow-500/20' : 'border-[#333] hover:border-yellow-500/50'}`}>
        <Meh className="w-8 h-8 text-yellow-500" />
      </button>
      <button type="button" onClick={() => onChange(5)} className={`p-3 rounded-xl border-2 transition-all ${value === 5 ? 'border-green-500 bg-green-500/20' : 'border-[#333] hover:border-green-500/50'}`}>
        <Smile className="w-8 h-8 text-green-500" />
      </button>
    </div>
  );
};

export function Dashboard({ user }: { user: User }) {
  const [reflection, setReflection] = useState<Partial<DailyReflection>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<DailyReflection[]>([]);
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  const fetchTodayReflection = async () => {
    try {
      const res = await fetch(`${API_URL}/reflections/user/${user.id}/date/${todayDate}`, { credentials: 'include',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setReflection(data);
      } else {
        setReflection({ date: todayDate, userId: user.id } as Partial<DailyReflection>);
      }
    } catch (error) {
      console.error('Error fetching today reflection:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/reflections/user/${user.id}`, { credentials: 'include',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      void fetchTodayReflection();
      void fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/reflections`, { credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({ ...reflection, userId: user.id, date: todayDate })
      });
      await fetchHistory();
      alert('Journal saved!');
    } catch (error) {
      console.error('Error saving journal:', error);
    } finally {
      setIsSaving(false);
    }
  };



  const renderMoodIcon = (val?: number) => {
    if (val === 1) return <Frown className="w-5 h-5 text-red-500 inline" />;
    if (val === 3) return <Meh className="w-5 h-5 text-yellow-500 inline" />;
    if (val === 5) return <Smile className="w-5 h-5 text-green-500 inline" />;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Book className="w-8 h-8 text-indigo-500" />
          Ideas & Journal
        </h2>
        <p className="text-gray-500 mt-2">Write down your ideas and record your mood each day.</p>
      </header>

      <form onSubmit={handleSave} className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-[#333] pb-4">
          <h3 className="text-xl font-bold text-white">Today: {format(new Date(), 'MMMM d, yyyy')}</h3>
          <MoodSelector value={reflection.satisfactionRating} onChange={v => setReflection({...reflection, satisfactionRating: v})} />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">My Ideas / Journal Entry</label>
          <textarea
            required
            className="w-full bg-[#222] border border-[#333] rounded-xl p-4 text-white outline-none focus:border-indigo-500 resize-none min-h-[200px]"
            value={reflection.note || ''}
            onChange={e => setReflection({...reflection, note: e.target.value})}
            placeholder="What's on your mind today?"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-xl font-bold text-white mb-6 mt-12 border-b border-[#333] pb-2">All-Time Journal History</h3>
        <p className="text-gray-500 mb-6 text-sm">Your entries are securely saved in the database forever. You can look back on years of ideas and moods.</p>
        <div className="space-y-10">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No journal entries found.</p>
          ) : (
            (() => {
              const groupedHistory = history.reduce((acc, entry) => {
                const d = new Date(entry.date);
                const monthYear = format(d, 'MMMM yyyy');
                if (!acc[monthYear]) acc[monthYear] = [];
                acc[monthYear].push(entry);
                return acc;
              }, {} as Record<string, DailyReflection[]>);

              const sortedMonths = Object.keys(groupedHistory).sort((a, b) => {
                return new Date(groupedHistory[b][0].date).getTime() - new Date(groupedHistory[a][0].date).getTime();
              });

              return sortedMonths.map(month => (
                <div key={month}>
                  <h4 className="text-lg font-bold text-gray-400 mb-4 uppercase tracking-wider">{month}</h4>
                  <div className="space-y-4">
                    {groupedHistory[month].sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
                      <div key={entry.id} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-indigo-400">{format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}</h4>
                          <div className="flex items-center gap-2 bg-[#222] px-3 py-1 rounded-lg border border-[#333]">
                            <span className="text-xs font-bold text-gray-400 uppercase">Mood:</span>
                            {renderMoodIcon(entry.satisfactionRating)}
                          </div>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{entry.note || <span className="text-gray-600 italic">No notes for this day.</span>}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      </div>
    </div>
  );
}
