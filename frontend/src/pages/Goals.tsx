import { useState, useEffect } from 'react';
import type { User, Goal, SystemRule, Habit } from '../types';
import { PlusCircle, Trash2, CheckCircle, Circle, Target, AlertTriangle, Archive, Play, Pause, ListTodo } from 'lucide-react';
import { HabitFormModal } from '../components/HabitFormModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Goals({ user }: { user: User }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Create Goal form state
    const [newTitle, setNewTitle] = useState('');
    const [newTerm, setNewTerm] = useState<'short' | 'medium' | 'long'>('short');
    const [newTargetDate, setNewTargetDate] = useState('');
    const [newRules, setNewRules] = useState<string[]>(['']);

    // View state
    const [showArchived, setShowArchived] = useState(false);

    // Add Habit modal state
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

    const fetchGoals = async () => {
        try {
            const res = await fetch(`${API_URL}/goals/user/${user.id}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setGoals(data);
            } else {
                console.error('Failed to fetch goals:', data);
                setGoals([]);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            void fetchGoals();
        }
    }, [user?.id]);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const rulesFiltered = newRules.filter(r => r.trim() !== '').map(r => ({ text: r }));

            await fetch(`${API_URL}/goals`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    title: newTitle,
                    term: newTerm,
                    targetDate: newTargetDate || null,
                    userId: user.id,
                    rules: rulesFiltered
                })
            });

            setIsModalOpen(false);
            setNewTitle('');
            setNewTerm('short');
            setNewTargetDate('');
            setNewRules(['']);
            fetchGoals();
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    };

    const handleCreateHabitForGoal = async (habitData: Record<string, unknown>) => {
        try {
            await fetch(`${API_URL}/habits`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    ...habitData,
                    userId: user.id,
                    goalId: activeGoalId
                })
            });
            setIsHabitModalOpen(false);
            setActiveGoalId(null);
            fetchGoals();
        } catch (error) {
            console.error('Error creating habit for goal:', error);
        }
    };

    const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
        try {
            await fetch(`${API_URL}/goals/${id}`, {
                credentials: 'include',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify(updates)
            });
            fetchGoals();
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        try {
            await fetch(`${API_URL}/goals/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchGoals();
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const handleToggleRule = async (rule: SystemRule) => {
        try {
            await fetch(`${API_URL}/goals/rules/${rule.id}`, {
                credentials: 'include',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ completed: !rule.completed })
            });
            fetchGoals();
        } catch (error) {
            console.error('Error toggling rule:', error);
        }
    };

    const handleUpdateRuleStatus = async (rule: SystemRule, status: string) => {
        try {
            await fetch(`${API_URL}/goals/rules/${rule.id}`, {
                credentials: 'include',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ status })
            });
            fetchGoals();
        } catch (error) {
            console.error('Error updating rule status:', error);
        }
    };

    const calculateGoalProgress = (goal: Goal) => {
        const rules = goal.rules || [];
        const habits = goal.habits || [];

        const totalItems = rules.length + habits.length;
        if (totalItems === 0) return 0;

        let completedScore = rules.filter(r => r.completed).length;

        habits.forEach(h => {
            const completedCount = h.logs?.filter(l => l.status === 'completed').length || 0;
            if (h.goalTargetCount) {
                completedScore += Math.min(completedCount / h.goalTargetCount, 1);
            } else {
                if (completedCount > 0) completedScore += 1;
            }
        });

        return Math.round((completedScore / totalItems) * 100);
    };

    const isHabitMissedRepeatedly = (habit: Habit) => {
        if (!habit.logs || habit.logs.length === 0) return false;
        // Simple logic: if the last 3 logs contain at least 2 skips
        const recentLogs = [...habit.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
        const skips = recentLogs.filter(l => l.status === 'skipped' || l.status === 'failed').length;
        return skips >= 2;
    };

    const renderGoalCard = (goal: Goal) => {
        const progress = calculateGoalProgress(goal);
        const hasNoSystem = (goal.rules?.length === 0) && (goal.habits?.length === 0);
        const isArchived = goal.status === 'archived';
        const isPaused = goal.status === 'paused';

        if (isArchived && !showArchived) return null;

        return (
            <div key={goal.id} className={`bg-[#1a1a1a] border ${hasNoSystem ? 'border-orange-500/50' : 'border-[#333]'} rounded-xl p-5 relative group flex flex-col gap-4 ${isPaused ? 'opacity-60' : ''} ${isArchived ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={() => handleUpdateGoal(goal.id, { status: goal.status === 'completed' ? 'active' : 'completed' })} className="text-gray-400 hover:text-green-500 transition-colors shrink-0">
                                {goal.status === 'completed' ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6" />}
                            </button>
                            <h3 className={`text-xl font-bold ${goal.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'} break-words leading-tight`}>
                                {goal.title}
                            </h3>
                        </div>
                        {goal.targetDate && (
                            <p className="text-xs text-gray-500 ml-9">Deadline: {new Date(goal.targetDate).toLocaleDateString()}</p>
                        )}
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleUpdateGoal(goal.id, { status: isPaused ? 'active' : 'paused' })} className="text-gray-500 hover:text-blue-500 p-1" title={isPaused ? "Resume" : "Pause"}>
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleUpdateGoal(goal.id, { status: isArchived ? 'active' : 'archived' })} className={`text-gray-500 ${isArchived ? 'hover:text-green-500' : 'hover:text-yellow-500'} p-1`} title={isArchived ? "Unarchive" : "Archive"}>
                            <Archive className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-500 hover:text-red-500 p-1" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#222] rounded-full h-1.5 mt-1">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>

                {hasNoSystem && (
                    <div className="bg-orange-900/20 border border-orange-500/30 text-orange-400 text-xs p-2 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>This goal lacks an effective system. Add a recurring action or mandatory rule.</span>
                    </div>
                )}

                {goal.habits?.some(isHabitMissedRepeatedly) && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-xs p-2 rounded-lg flex items-start gap-2 mt-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Warning: Mandatory recurring actions are being repeatedly missed.</span>
                    </div>
                )}

                <div className="space-y-3 pt-2">
                    {/* Recurring Actions (Habits) */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Recurring Systems</h4>
                            <button
                                onClick={() => { setActiveGoalId(goal.id); setIsHabitModalOpen(true); }}
                                className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                            >
                                <PlusCircle className="w-3 h-3" /> Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {goal.habits?.map(habit => {
                                const isMissed = isHabitMissedRepeatedly(habit);
                                const completedCount = habit.logs?.filter(l => l.status === 'completed').length || 0;
                                return (
                                    <div key={habit.id} className={`flex justify-between items-center ${isMissed ? 'bg-red-900/10 border border-red-500/20' : 'bg-[#222]'} p-2 rounded-lg text-sm`}>
                                        <div className={`flex items-center gap-2 ${isMissed ? 'text-red-300' : 'text-gray-300'}`}>
                                            <ListTodo className={`w-4 h-4 ${isMissed ? 'text-red-400' : 'text-gray-500'}`} />
                                            {habit.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-orange-500 font-bold flex items-center gap-1">
                                                🔥 {completedCount} {habit.goalTargetCount ? `/ ${habit.goalTargetCount}` : ''}
                                            </span>
                                            <span className="text-gray-600">|</span>
                                            <span className="text-gray-500">{habit.scheduleType}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!goal.habits || goal.habits.length === 0) && <span className="text-gray-600 text-xs italic block">No recurring habits.</span>}
                        </div>
                    </div>

                    {/* One-off Rules */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Mandatory Rules</h4>
                        <div className="space-y-2">
                            {goal.rules?.filter(r => showArchived || r.status !== 'archived').map(rule => (
                                <div key={rule.id} className={`flex items-start gap-3 text-sm group/rule ${rule.status === 'archived' ? 'opacity-40' : ''}`}>
                                    <button onClick={() => handleToggleRule(rule)} className="text-gray-500 hover:text-blue-500 transition-colors mt-0.5 shrink-0">
                                        {rule.completed ? <CheckCircle className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4" />}
                                    </button>
                                    <span className={`flex-1 ${rule.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                        {rule.text}
                                    </span>
                                    <button
                                        onClick={() => handleUpdateRuleStatus(rule, rule.status === 'archived' ? 'active' : 'archived')}
                                        className="opacity-0 group-hover/rule:opacity-100 text-gray-600 hover:text-yellow-500"
                                        title={rule.status === 'archived' ? 'Unarchive' : 'Archive'}
                                    >
                                        <Archive className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {(!goal.rules || goal.rules.filter(r => showArchived || r.status !== 'archived').length === 0) && <span className="text-gray-600 text-xs italic block">No one-off rules.</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#121212] text-gray-200 min-h-screen font-sans overflow-y-auto">
            <div className="max-w-[1200px] mx-auto mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Target className="w-8 h-8 text-blue-500" /> Goals & Systems
                    </h2>
                    <p className="text-gray-500">Define your targets and the mandatory systems to achieve them.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`text-sm font-medium transition-colors ${showArchived ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {showArchived ? 'Hide Archived' : 'Show Archived'}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-[#232323] border border-[#333] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors"
                    >
                        <PlusCircle className="w-5 h-5 text-blue-500" />
                        New Goal
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
                {/* Short Term */}
                <div>
                    <h3 className="text-lg font-bold text-gray-400 mb-4 border-b border-[#333] pb-2 flex justify-between">
                        Short-Term <span className="text-sm font-normal text-gray-600">{"< 3 mos"}</span>
                    </h3>
                    <div className="flex flex-col gap-4">
                        {goals.filter(g => g.term === 'short').map(renderGoalCard)}
                        {goals.filter(g => g.term === 'short' && (showArchived || g.status !== 'archived')).length === 0 && <p className="text-sm text-gray-600 text-center py-4">No short-term goals.</p>}
                    </div>
                </div>

                {/* Medium Term */}
                <div>
                    <h3 className="text-lg font-bold text-gray-400 mb-4 border-b border-[#333] pb-2 flex justify-between">
                        Medium-Term <span className="text-sm font-normal text-gray-600">{"3-12 mos"}</span>
                    </h3>
                    <div className="flex flex-col gap-4">
                        {goals.filter(g => g.term === 'medium').map(renderGoalCard)}
                        {goals.filter(g => g.term === 'medium' && (showArchived || g.status !== 'archived')).length === 0 && <p className="text-sm text-gray-600 text-center py-4">No medium-term goals.</p>}
                    </div>
                </div>

                {/* Long Term */}
                <div>
                    <h3 className="text-lg font-bold text-gray-400 mb-4 border-b border-[#333] pb-2 flex justify-between">
                        Long-Term <span className="text-sm font-normal text-gray-600">{"> 1 year"}</span>
                    </h3>
                    <div className="flex flex-col gap-4">
                        {goals.filter(g => g.term === 'long').map(renderGoalCard)}
                        {goals.filter(g => g.term === 'long' && (showArchived || g.status !== 'archived')).length === 0 && <p className="text-sm text-gray-600 text-center py-4">No long-term goals.</p>}
                    </div>
                </div>
            </div>

            {/* Create Goal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-6">Create New Goal</h3>
                        <form onSubmit={handleCreateGoal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Goal Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                                    placeholder="e.g. Run a Marathon"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Term</label>
                                    <select
                                        value={newTerm}
                                        onChange={e => setNewTerm(e.target.value as 'short' | 'medium' | 'long')}
                                        className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                                    >
                                        <option value="short">Short-Term</option>
                                        <option value="medium">Medium-Term</option>
                                        <option value="long">Long-Term</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Deadline (Optional)</label>
                                    <input
                                        type="date"
                                        value={newTargetDate}
                                        onChange={e => setNewTargetDate(e.target.value)}
                                        className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Initial Mandatory Rules</label>
                                <p className="text-xs text-gray-500 mb-2">You can add recurring habits as systems after creation.</p>
                                <div className="space-y-2">
                                    {newRules.map((rule, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={rule}
                                                onChange={e => {
                                                    const rules = [...newRules];
                                                    rules[i] = e.target.value;
                                                    setNewRules(rules);
                                                }}
                                                className="flex-1 bg-[#222] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
                                                placeholder={`Rule ${i + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNewRules(newRules.filter((_, idx) => idx !== i))}
                                                className="px-2 text-gray-500 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setNewRules([...newRules, ''])}
                                        className="text-xs text-blue-500 hover:text-blue-400 mt-2 font-medium"
                                    >
                                        + Add another rule
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 mt-6 border-t border-[#333]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-[#222] text-gray-300 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Habit for Goal Modal */}
            <HabitFormModal
                isOpen={isHabitModalOpen}
                onClose={() => { setIsHabitModalOpen(false); setActiveGoalId(null); }}
                onSubmit={handleCreateHabitForGoal}
                categories={user.categories || []}
                goals={goals}
                initialGoalId={activeGoalId || ''}
            />
        </div>
    );
}
