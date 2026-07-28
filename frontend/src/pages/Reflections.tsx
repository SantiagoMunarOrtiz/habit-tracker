import { useState, useEffect } from 'react';
import type { User, DailyReflection, Goal, Habit } from '../types';
import { format, subDays } from 'date-fns';
import { BookOpen, Calendar, LineChart, Save, Star, AlertTriangle, Target } from 'lucide-react';
import { LifeReviewDashboard } from '../components/LifeReview/LifeReviewDashboard';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Reflections({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState<'today' | 'history' | 'summary' | 'life-review'>('today');
    const [todayReflection, setTodayReflection] = useState<Partial<DailyReflection>>({});
    const [history, setHistory] = useState<DailyReflection[]>([]);
    
    const [goals, setGoals] = useState<Goal[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    
    const todayDate = format(new Date(), 'yyyy-MM-dd');

    const fetchTodayReflection = async () => {
        try {
            const res = await fetch(`${API_URL}/reflections/user/${user.id}/date/${todayDate}`, { credentials: 'include',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setTodayReflection(data);
            } else {
                setTodayReflection({ date: todayDate, userId: user.id } as Partial<DailyReflection>);
            }
        } catch (error) {
            console.error('Error fetching today reflection:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const lastWeek = format(subDays(new Date(), 7), 'yyyy-MM-dd');
            const res = await fetch(`${API_URL}/reflections/user/${user.id}?startDate=${lastWeek}&endDate=${todayDate}`, { credentials: 'include',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Error fetching reflection history:', error);
        }
    };

    const fetchGoalsAndHabits = async () => {
        try {
            const [goalsRes, habitsRes] = await Promise.all([
                fetch(`${API_URL}/goals/user/${user.id}`, { credentials: 'include' }),
                fetch(`${API_URL}/habits/user/${user.id}`, { credentials: 'include' })
            ]);
            
            if (goalsRes.ok) setGoals(await goalsRes.json());
            if (habitsRes.ok) setHabits(await habitsRes.json());
        } catch (error) {
            console.error('Error fetching goals/habits:', error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            void fetchTodayReflection();
            void fetchHistory();
            void fetchGoalsAndHabits();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleSaveToday = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await fetch(`${API_URL}/reflections`, { credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({ ...todayReflection, userId: user.id, date: todayDate })
            });
            await fetchHistory();
            alert('Reflection saved!');
        } catch (error) {
            console.error('Error saving reflection:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const RatingStars = ({ value, onChange, label }: { value?: number, onChange: (v: number) => void, label: string }) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`p-1 transition-colors ${value && value >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400/50'}`}
                    >
                        <Star className="w-6 h-6 fill-current" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderToday = () => (
        <form onSubmit={handleSaveToday} className="bg-[#151515] border border-[#2a2a2a] rounded-xl shadow-lg p-5 md:p-6 space-y-6 max-w-4xl mx-auto flex flex-col">
            <div className="flex justify-between items-center border-b border-[#2a2a2a] pb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Daily Reflection</h3>
                    <p className="text-gray-500 text-sm">{todayDate}</p>
                </div>
                <div className="flex gap-4 bg-[#1a1a1a] p-2 rounded-lg border border-[#333]">
                    <RatingStars label="Focus" value={todayReflection.focusRating} onChange={v => setTodayReflection({...todayReflection, focusRating: v})} />
                    <RatingStars label="Energy" value={todayReflection.energyRating} onChange={v => setTodayReflection({...todayReflection, energyRating: v})} />
                    <RatingStars label="Satisfaction" value={todayReflection.satisfactionRating} onChange={v => setTodayReflection({...todayReflection, satisfactionRating: v})} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-green-500 mb-1">1. Progress Made</label>
                        <textarea
                            className="w-full bg-[#1c1c1c] border border-[#333] hover:border-green-500/50 rounded-lg p-2.5 text-gray-200 outline-none focus:border-green-500 min-h-[65px] resize-none text-sm"
                            value={todayReflection.q1Progress || ''}
                            onChange={e => setTodayReflection({...todayReflection, q1Progress: e.target.value})}
                            placeholder="What meaningful progress did I make today?"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-blue-500 mb-1">2. Key Learnings</label>
                        <textarea
                            className="w-full bg-[#1c1c1c] border border-[#333] hover:border-blue-500/50 rounded-lg p-2.5 text-gray-200 outline-none focus:border-blue-500 min-h-[65px] resize-none text-sm"
                            value={todayReflection.q2Learned || ''}
                            onChange={e => setTodayReflection({...todayReflection, q2Learned: e.target.value})}
                            placeholder="What did I learn?"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-red-500 mb-1">3. Blockers</label>
                        <textarea
                            className="w-full bg-[#1c1c1c] border border-[#333] hover:border-red-500/50 rounded-lg p-2.5 text-gray-200 outline-none focus:border-red-500 min-h-[65px] resize-none text-sm"
                            value={todayReflection.q3Blocked || ''}
                            onChange={e => setTodayReflection({...todayReflection, q3Blocked: e.target.value})}
                            placeholder="What blocked or distracted me?"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">4. Next Actions</label>
                        <textarea
                            className="w-full bg-[#1c1c1c] border border-[#333] hover:border-purple-500/50 rounded-lg p-2.5 text-gray-200 outline-none focus:border-purple-500 min-h-[65px] resize-none text-sm"
                            value={todayReflection.q4NextAction || ''}
                            onChange={e => setTodayReflection({...todayReflection, q4NextAction: e.target.value})}
                            placeholder="What is my next concrete action?"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full">
                <label className="block text-xs font-bold uppercase tracking-wide text-yellow-500 mb-1">5. Contingency Plan</label>
                <textarea
                    className="w-full bg-[#1c1c1c] border border-[#333] hover:border-yellow-500/50 rounded-lg p-2.5 text-gray-200 outline-none focus:border-yellow-500 min-h-[60px] resize-none text-sm"
                    value={todayReflection.q5ObstaclePlan || ''}
                    onChange={e => setTodayReflection({...todayReflection, q5ObstaclePlan: e.target.value})}
                    placeholder="If this obstacle happens tomorrow, what will I do?"
                />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-[#2a2a2a] gap-4">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Goal:</label>
                        <select
                            className="bg-[#1c1c1c] border border-[#333] rounded px-2 py-1.5 text-sm text-gray-300 outline-none focus:border-blue-500 max-w-[150px]"
                            value={todayReflection.goalId || ''}
                            onChange={e => setTodayReflection({...todayReflection, goalId: e.target.value || undefined})}
                        >
                            <option value="">-- None --</option>
                            {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Habit:</label>
                        <select
                            className="bg-[#1c1c1c] border border-[#333] rounded px-2 py-1.5 text-sm text-gray-300 outline-none focus:border-blue-500 max-w-[150px]"
                            value={todayReflection.habitId || ''}
                            onChange={e => setTodayReflection({...todayReflection, habitId: e.target.value || undefined})}
                        >
                            <option value="">-- None --</option>
                            {habits.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );

    const renderHistory = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
            {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No reflections found for the past 7 days.</div>
            ) : (
                history.map(ref => (
                    <div key={ref.id} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold text-gray-200">{ref.date}</h4>
                            <div className="flex gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> F: {ref.focusRating || '-'}</span>
                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> E: {ref.energyRating || '-'}</span>
                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> S: {ref.satisfactionRating || '-'}</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                            {ref.q1Progress && <div><strong className="text-gray-500 block">Progress:</strong> {ref.q1Progress}</div>}
                            {ref.q2Learned && <div><strong className="text-gray-500 block">Learned:</strong> {ref.q2Learned}</div>}
                            {ref.q3Blocked && <div><strong className="text-gray-500 block">Blockers:</strong> {ref.q3Blocked}</div>}
                            {ref.q4NextAction && <div><strong className="text-gray-500 block">Next Action:</strong> {ref.q4NextAction}</div>}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderSummary = () => {
        if (history.length === 0) return <div className="text-center py-12 text-gray-500">No data for weekly summary.</div>;
        
        const avgFocus = (history.reduce((acc, curr) => acc + (curr.focusRating || 0), 0) / history.length).toFixed(1);
        const avgEnergy = (history.reduce((acc, curr) => acc + (curr.energyRating || 0), 0) / history.length).toFixed(1);
        
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 text-center">
                        <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Avg Focus (7 Days)</h4>
                        <div className="text-4xl font-black text-yellow-500 flex items-center justify-center gap-2">
                            {avgFocus} <Star className="w-8 h-8 fill-current" />
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 text-center">
                        <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Avg Energy (7 Days)</h4>
                        <div className="text-4xl font-black text-blue-500 flex items-center justify-center gap-2">
                            {avgEnergy} <Star className="w-8 h-8 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                        <h4 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-green-500" /> Key Lessons
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            {history.filter(h => h.q2Learned).map(h => (
                                <li key={h.id} className="border-b border-[#333] pb-2 last:border-0">• {h.q2Learned}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                        <h4 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" /> Repeated Blockers
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            {history.filter(h => h.q3Blocked).map(h => (
                                <li key={h.id} className="border-b border-[#333] pb-2 last:border-0">• {h.q3Blocked}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#121212] text-gray-200 min-h-screen font-sans overflow-y-auto">
            <div className="max-w-[1200px] mx-auto mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-500" /> Daily Reflection & Growth
                </h2>
                <p className="text-gray-500 mb-6">Review your day, rate your energy, and plan for tomorrow.</p>

                <div className="flex gap-2 border-b border-[#333] pb-4">
                    <button 
                        onClick={() => setActiveTab('today')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'today' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-[#222]'}`}
                    >
                        <Save className="w-4 h-4" /> Today
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-[#222]'}`}
                    >
                        <Calendar className="w-4 h-4" /> History
                    </button>
                    <button 
                        onClick={() => setActiveTab('summary')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'summary' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-[#222]'}`}
                    >
                        <LineChart className="w-4 h-4" /> Weekly Summary
                    </button>
                    <button 
                        onClick={() => setActiveTab('life-review')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'life-review' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-[#222]'}`}
                    >
                        <Target className="w-4 h-4" /> Life Review
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto pb-20">
                {activeTab === 'today' && renderToday()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'summary' && renderSummary()}
                {activeTab === 'life-review' && <LifeReviewDashboard user={user} />}
            </div>
        </div>
    );
}
