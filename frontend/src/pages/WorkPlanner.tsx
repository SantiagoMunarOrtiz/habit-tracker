import { useState, useEffect } from 'react';
import type { User, WorkTask } from '../types';
import { Briefcase, Calendar, CheckSquare, PlusCircle, Play, CheckCircle, Clock, Square, XCircle, Pause, Trash2, ArrowRight, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function WorkPlanner({ user }: { user: User }) {
    const [tasks, setTasks] = useState<WorkTask[]>([]);
    const [activeTab, setActiveTab] = useState<'today' | 'tasks' | 'calendar' | 'focus' | 'history'>('today');
    const [calendarOffsetWeeks, setCalendarOffsetWeeks] = useState(0);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState<Partial<WorkTask>>({
        title: '',
        area: 'Work',
        priority: 'medium',
        status: 'pending',
        deadline: ''
    });

    // Focus Mode State
    const [focusTask, setFocusTask] = useState<WorkTask | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [timerPhase, setTimerPhase] = useState<'work' | 'rest'>('work');
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [targetPomodoros, setTargetPomodoros] = useState(1);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_URL}/work-planner/user/${user.id}/tasks`, {
                credentials: 'include'
            });
            if (res.ok) {
                setTasks(await res.json());
            }
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };

    useEffect(() => {
        if (user?.id) void fetchTasks();
    }, [user?.id]);

    // Timer Effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isTimerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(s => s - 1);
            }, 1000);
        } else if (isTimerRunning && timerSeconds === 0) {
            // Phase complete
            if (timerPhase === 'work') {
                setCompletedPomodoros(p => p + 1);
                setTimerPhase('rest');
                setTimerSeconds(5 * 60); // 5 min rest
            } else {
                setTimerPhase('work');
                setTimerSeconds(25 * 60); // 25 min work
                setIsTimerRunning(false); // Pause after rest
            }
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timerSeconds, timerPhase]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/work-planner/tasks`, { credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({
                    userId: user.id,
                    ...newTask,
                    area: newTask.area || 'Work',
                    priority: newTask.priority || 'medium',
                    status: newTask.status || 'pending',
                    estimatedTime: newTask.actualTime !== undefined ? newTask.actualTime : 1 // Reuse actualTime temporarily for estimated pomodoros in form
                })
            });
            setIsModalOpen(false);
            setNewTask({ title: '', area: 'Work', priority: 'medium', status: 'pending', deadline: '' });
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await fetch(`${API_URL}/work-planner/tasks/${id}`, { credentials: 'include',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({ status })
            });
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await fetch(`${API_URL}/work-planner/tasks/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEndFocusSession = async () => {
        if (!focusTask) return;
        setIsTimerRunning(false);
        
        // Calculate total worked minutes (completed pomodoros * 25)
        // + any partial minutes if currently in work phase
        let totalMinutes = completedPomodoros * 25;
        if (timerPhase === 'work') {
            totalMinutes += Math.floor((25 * 60 - timerSeconds) / 60);
        }
        
        if (totalMinutes === 0) {
            setFocusTask(null);
            return;
        }

        try {
            await fetch(`${API_URL}/work-planner/focus`, { credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({
                    taskId: focusTask.id,
                    duration: totalMinutes,
                    outcome: `Completed ${completedPomodoros} Pomodoro(s)`
                })
            });
            setTimerSeconds(25 * 60);
            setTimerPhase('work');
            setCompletedPomodoros(0);
            setFocusTask(null);
            fetchTasks();
            alert(`Logged ${totalMinutes} minutes of focus!`);
        } catch (error) {
            console.error('Error logging focus session', error);
        }
    };

    const startFocus = (t: WorkTask) => {
        setFocusTask(t);
        // Reset timer state
        setTimerSeconds(25 * 60);
        setTimerPhase('work');
        setCompletedPomodoros(0);
        setTargetPomodoros(t.actualTime || 1); // We stored estimated pomodoros in actualTime on creation
        setIsTimerRunning(false);
        setActiveTab('focus');
    };

    // --- SUBCOMPONENTS ---

    const renderToday = () => {
        const essentialTasks = tasks.filter(t => t.priority === 'essential' && t.status !== 'completed');
        const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'inbox');

        return (
            <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Daily Planning</h3>
                        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 text-sm">
                            <PlusCircle className="w-4 h-4" /> New Task
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full"></div>
                        <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5" /> Essential Task
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Select ONE task that must get done today.</p>
                        
                        {essentialTasks.map(t => (
                            <div key={t.id} className="bg-[#222] border border-orange-500/50 p-4 rounded-lg flex justify-between items-center mb-2 shadow-lg shadow-orange-900/10">
                                <div>
                                    <span className="font-bold text-gray-200 block">{t.title}</span>
                                    {t.deadline && <span className="text-xs text-orange-500/80 block mt-1">Due: {t.deadline}</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startFocus(t)} className="p-2 bg-indigo-600/20 text-indigo-400 rounded-md hover:bg-indigo-600/40" title="Focus Mode"><Play className="w-4 h-4" /></button>
                                    <button onClick={() => handleUpdateStatus(t.id, 'completed')} className="p-2 bg-green-600/20 text-green-400 rounded-md hover:bg-green-600/40" title="Complete"><CheckCircle className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteTask(t.id)} className="p-2 bg-red-600/10 text-red-500 rounded-md hover:bg-red-600/30" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        {essentialTasks.length === 0 && (
                            <div className="text-center py-4 text-gray-600 italic text-sm">No essential task selected for today. Set a task priority to "Essential".</div>
                        )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Pending / Inbox</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {pendingTasks.map(t => (
                                <div key={t.id} className="bg-[#222] p-3 rounded-lg flex justify-between items-center text-sm border border-[#2a2a2a]">
                                    <div>
                                        <span className="text-gray-300 font-medium">{t.title}</span>
                                        {t.deadline && <span className="text-xs text-gray-500 block">Due: {t.deadline}</span>}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => startFocus(t)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded" title="Focus Mode"><Play className="w-4 h-4" /></button>
                                        <button onClick={() => handleUpdateStatus(t.id, 'completed')} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded" title="Complete"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteTask(t.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            {pendingTasks.length === 0 && (
                                <div className="text-center py-4 text-gray-600 italic text-sm">Inbox is empty.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderKanban = () => {
        const statuses = ['pending', 'in_progress', 'completed', 'failed'];
        const cols = statuses.map(status => ({
            status,
            items: tasks.filter(t => t.status === status || (status === 'pending' && t.status === 'inbox'))
        }));

        const statusColors: Record<string, string> = {
            'pending': 'text-gray-400 border-gray-600',
            'in_progress': 'text-blue-400 border-blue-600',
            'completed': 'text-green-400 border-green-600',
            'failed': 'text-red-400 border-red-600'
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                {cols.map(col => (
                    <div key={col.status} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
                        <h3 className={`font-bold uppercase tracking-wider text-xs mb-4 pb-2 border-b ${statusColors[col.status]}`}>
                            {col.status.replace('_', ' ')} ({col.items.length})
                        </h3>
                        <div className="space-y-3">
                            {col.items.map(t => (
                                <div key={t.id} className="bg-[#222] border border-[#2a2a2a] p-3 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-medium text-sm ${t.status === 'completed' || t.status === 'failed' ? 'line-through text-gray-500' : 'text-gray-200'}`}>{t.title}</h4>
                                        <button onClick={() => handleDeleteTask(t.id)} className="text-gray-600 hover:text-red-500 shrink-0 ml-2" title="Delete Task"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.priority === 'essential' ? 'bg-orange-500/20 text-orange-400' : 'bg-[#333] text-gray-400'}`}>{t.priority}</span>
                                        <div className="flex gap-1">
                                            {(t.status === 'pending' || t.status === 'inbox') && <button onClick={() => handleUpdateStatus(t.id, 'in_progress')} className="text-gray-500 hover:text-blue-500 p-1" title="Start Task"><ArrowRight className="w-4 h-4" /></button>}
                                            {t.status !== 'completed' && t.status !== 'failed' && <button onClick={() => startFocus(t)} className="text-indigo-400 hover:text-indigo-300 p-1" title="Focus Mode"><Play className="w-4 h-4" /></button>}
                                            {t.status !== 'completed' && <button onClick={() => handleUpdateStatus(t.id, 'completed')} className="text-gray-500 hover:text-green-500 p-1" title="Complete"><CheckCircle className="w-4 h-4" /></button>}
                                            {t.status !== 'failed' && <button onClick={() => handleUpdateStatus(t.id, 'failed')} className="text-gray-500 hover:text-red-500 p-1" title="Fail"><XCircle className="w-4 h-4" /></button>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderCalendar = () => {
        // Super basic calendar view for deadlines
        const today = new Date();
        const baseDate = addDays(today, calendarOffsetWeeks * 7);
        const start = startOfWeek(baseDate, { weekStartsOn: 1 });
        const days = Array.from({ length: 14 }).map((_, i) => {
            const d = addDays(start, i);
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayTasks = tasks.filter(t => t.deadline === dateStr);
            return { date: d, dateStr, tasks: dayTasks };
        });

        return (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500"/> Deadlines Schedule</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCalendarOffsetWeeks(w => w - 1)} className="p-2 bg-[#222] text-gray-400 hover:text-white rounded-lg border border-[#333] hover:border-indigo-500 transition-colors" title="Previous Week">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCalendarOffsetWeeks(0)} className="px-3 py-1.5 bg-[#222] text-sm font-medium text-gray-400 hover:text-white rounded-lg border border-[#333] hover:border-indigo-500 transition-colors">
                            Today
                        </button>
                        <button onClick={() => setCalendarOffsetWeeks(w => w + 1)} className="p-2 bg-[#222] text-gray-400 hover:text-white rounded-lg border border-[#333] hover:border-indigo-500 transition-colors" title="Next Week">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">{day}</div>
                    ))}
                    {days.map((day, i) => (
                        <div key={i} className={`min-h-[100px] border rounded-lg p-2 ${day.dateStr === format(today, 'yyyy-MM-dd') ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#2a2a2a] bg-[#1c1c1c]'}`}>
                            <div className={`text-xs font-bold mb-2 ${day.dateStr === format(today, 'yyyy-MM-dd') ? 'text-indigo-400' : 'text-gray-500'}`}>{format(day.date, 'd MMM')}</div>
                            <div className="space-y-1">
                                {day.tasks.map(t => {
                                    let statusStyle = 'bg-[#2a2a2a] text-gray-300 border-[#333]';
                                    if (t.status === 'completed') statusStyle = 'bg-green-500/20 text-green-400 border-green-500/30 line-through';
                                    else if (t.status === 'in_progress') statusStyle = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                                    else if (t.status === 'failed') statusStyle = 'bg-red-500/20 text-red-400 border-red-500/30 line-through';
                                    else if (t.priority === 'essential') statusStyle = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
                                    
                                    return (
                                        <div key={t.id} className={`text-[10px] px-1.5 py-1 rounded truncate border ${statusStyle}`} title={t.title}>
                                            {t.title}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderFocus = () => {
        if (!focusTask) {
            return (
                <div className="text-center py-20 text-gray-500 border border-[#333] border-dashed rounded-xl bg-[#1a1a1a]">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <h3 className="text-xl text-white font-bold mb-2">No Active Focus Task</h3>
                    <p>Go to the Tasks or Today tab and click the Play icon to start a focus session.</p>
                </div>
            );
        }

        const formatTime = (totalSeconds: number) => {
            const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };

        const progressPct = Math.min((completedPomodoros / targetPomodoros) * 100, 100);

        return (
            <div className={`bg-[#1a1a1a] border shadow-lg shadow-indigo-900/10 rounded-2xl p-10 max-w-2xl mx-auto text-center transition-colors ${timerPhase === 'work' ? 'border-indigo-500/50' : 'border-green-500/50'}`}>
                <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-8 border ${timerPhase === 'work' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {timerPhase === 'work' ? 'Deep Work Phase' : 'Rest Phase'}
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2">{focusTask.title}</h2>
                <div className="flex justify-center items-center gap-2 text-gray-400 mb-8">
                    <span>Target: {targetPomodoros} Pomodoros</span>
                    <span>•</span>
                    <span className="text-white font-bold">Completed: {completedPomodoros}</span>
                </div>

                {/* Progress Bar for Pomodoros */}
                <div className="w-full bg-[#222] h-2 rounded-full mb-8 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                </div>

                <div className={`text-8xl font-mono mb-10 tabular-nums ${timerPhase === 'work' ? 'text-white' : 'text-green-400'}`}>
                    {formatTime(timerSeconds)}
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-colors ${isTimerRunning ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30'}`}
                    >
                        {isTimerRunning ? <><Pause className="w-6 h-6" /> Pause</> : <><Play className="w-6 h-6" /> Start</>}
                    </button>
                    <button
                        onClick={handleEndFocusSession}
                        className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-[#222] text-gray-300 border border-[#444] hover:bg-[#333] transition-colors"
                    >
                        <Square className="w-6 h-6" /> Stop & Log
                    </button>
                </div>
            </div>
        );
    };

    const renderHistory = () => {
        const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed');
        
        // Group by updatedAt date (YYYY-MM-DD)
        const grouped = completedTasks.reduce((acc, task) => {
            const dateObj = task.updatedAt ? new Date(task.updatedAt) : new Date();
            const dateStr = format(dateObj, 'yyyy-MM-dd');
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(task);
            return acc;
        }, {} as Record<string, WorkTask[]>);

        // Sort dates descending
        const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

        return (
            <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><History className="w-5 h-5 text-indigo-500" /> Task History</h3>
                    <p className="text-gray-500 text-sm mb-6">Review your completed and failed tasks over time.</p>
                    
                    {sortedDates.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No completed tasks yet. Keep working!</div>
                    ) : (
                        <div className="space-y-8">
                            {sortedDates.map(date => (
                                <div key={date} className="border-l-2 border-[#333] pl-4 ml-2">
                                    <h4 className="font-bold text-indigo-400 mb-4">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {grouped[date].map(t => (
                                            <div key={t.id} className="bg-[#222] border border-[#2a2a2a] p-4 rounded-lg flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`font-medium ${t.status === 'completed' ? 'text-green-400' : 'text-red-400'} line-through`}>{t.title}</span>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${t.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.status}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4 pt-4 border-t border-[#333]">
                                                    <span className="text-xs px-2 py-1 rounded-md bg-[#111] text-gray-400 font-medium">{t.area}</span>
                                                    <span className="text-xs px-2 py-1 rounded-md bg-[#111] text-gray-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> {t.actualTime || 0} p.</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#121212] text-gray-200 min-h-screen font-sans overflow-y-auto">
            <div className="max-w-[1200px] mx-auto mb-8 border-b border-[#333] pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-indigo-500" /> Work & Entrepreneurship
                    </h2>
                    <p className="text-gray-500">Plan your deep work, track professional projects, and manage deadlines.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" /> New Task
                </button>
            </div>
            
            <div className="max-w-[1200px] mx-auto mb-6">
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('today')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'today' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-[#222]'}`}><CheckSquare className="w-4 h-4"/> Today</button>
                    <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-[#222]'}`}><Briefcase className="w-4 h-4"/> Board</button>
                    <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'calendar' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-[#222]'}`}><Calendar className="w-4 h-4"/> Calendar</button>
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-[#222]'}`}><History className="w-4 h-4"/> History</button>
                    <button onClick={() => setActiveTab('focus')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'focus' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-[#222]'}`}>
                        <Clock className="w-4 h-4"/> Focus Mode {isTimerRunning && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse ml-1"></span>}
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto pb-20">
                {activeTab === 'today' && renderToday()}
                {activeTab === 'tasks' && renderKanban()}
                {activeTab === 'calendar' && renderCalendar()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'focus' && renderFocus()}
            </div>

            {/* TASK CREATION MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Create Work Task</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><XCircle className="w-6 h-6"/></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Title</label>
                                <input required type="text" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="What needs to be done?" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Deadline</label>
                                    <input type="date" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 text-sm" value={newTask.deadline || ''} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Priority</label>
                                    <select className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="essential">Essential (Today)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Status</label>
                                    <select className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}>
                                        <option value="inbox">Inbox</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Area</label>
                                    <select className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500" value={newTask.area} onChange={e => setNewTask({...newTask, area: e.target.value})}>
                                        <option value="Work">Work</option>
                                        <option value="Entrepreneurship">Entrepreneurship</option>
                                        <option value="Learning">Learning</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Estimated Pomodoros (25m each)</label>
                                <div className="flex items-center gap-4">
                                    <input type="number" min="0" max="20" className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500" value={newTask.actualTime !== undefined ? newTask.actualTime : 1} onChange={e => setNewTask({...newTask, actualTime: parseInt(e.target.value)})} />
                                    <span className="text-xs text-gray-500 whitespace-nowrap">(0 = not necessary)</span>
                                </div>
                            </div>
                            <div className="pt-6 mt-2 border-t border-[#333]">
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
