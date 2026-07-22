import { useState, useEffect } from 'react';
import { Award, Brain, CheckCircle, Shield, Trophy, UserCheck, Zap, Gift, Footprints, Flame, CalendarCheck, Check, ChevronDown, ChevronRight } from 'lucide-react';
import type { User, Achievement } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface HabitGroup {
  habitId: string;
  habitTitle: string;
  milestones: Achievement[];
}

export function Achievements({ user }: { user: User }) {
  const [habitGroups, setHabitGroups] = useState<HabitGroup[]>([]);
  const [expandedHabits, setExpandedHabits] = useState<Record<string, boolean>>({});

  const fetchChecklist = () => {
    fetch(`${API_URL}/achievements/checklist`, { credentials: 'include',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setHabitGroups(data);
        // Expand the first habit by default if any exist
        if (data.length > 0) {
          setExpandedHabits({ [data[0].habitId]: true });
        }
      })
      .catch(err => console.error('Error fetching achievements:', err));
  };

  useEffect(() => {
    fetchChecklist();
  }, [user.id]);

  const handleClaim = async (habitId: string, achievementId: string) => {
    try {
      const res = await fetch(`${API_URL}/achievements/${habitId}/${achievementId}/claim`, { credentials: 'include',
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchChecklist();
      }
    } catch (err) {
      console.error('Error claiming achievement:', err);
    }
  };

  const toggleExpand = (habitId: string) => {
    setExpandedHabits(prev => ({ ...prev, [habitId]: !prev[habitId] }));
  };

  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'Footprints': return <Footprints className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Gift': return <Gift className="w-5 h-5" />;
      case 'CalendarCheck': return <CalendarCheck className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  if (habitGroups.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-500 w-8 h-8" />
            Journey to Automaticity
          </h2>
          <p className="text-gray-400 mt-2 max-w-2xl text-lg">
            Create some active habits to start tracking your journey towards automaticity and earning badges!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="text-yellow-500 w-8 h-8" />
          Journey to Automaticity
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl text-lg">
          Habit formation is a journey. Research shows that it takes an average of 66 days for a new behavior to become automatic—not 21 days. This checklist celebrates your progress along the way.
        </p>
      </div>

      <div className="space-y-6">
        {habitGroups.map((group) => {
          const isExpanded = expandedHabits[group.habitId];
          const completedCount = group.milestones.filter(m => m.status === 'Completed' || m.status === 'Claimed').length;
          
          return (
            <div key={group.habitId} className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
              <button 
                onClick={() => toggleExpand(group.habitId)}
                className="w-full flex items-center justify-between p-6 bg-[#222] hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle className="text-green-500" /> 
                    {group.habitTitle}
                  </h3>
                </div>
                <span className="text-sm font-bold text-gray-500 bg-[#111] px-3 py-1 rounded-full border border-[#333]">
                  {completedCount} / {group.milestones.length} Badges
                </span>
              </button>

              {isExpanded && (
                <div className="p-6 space-y-4 border-t border-[#333]">
                  {group.milestones.map((ach) => {
                    const isCompleted = ach.status === 'Completed' || ach.status === 'Claimed';
                    const isClaimed = ach.status === 'Claimed';
                    const isLocked = ach.status === 'Locked';
                    const progressPercent = Math.min(100, Math.round(((ach.currentProgress || 0) / (ach.requiredProgress || 1)) * 100));

                    return (
                      <div 
                        key={ach.id} 
                        className={`flex items-start gap-5 p-5 rounded-xl border transition-all ${
                          isClaimed ? 'bg-[#151515] border-[#333] opacity-60 grayscale' : 
                          isCompleted ? 'bg-[#1a1a1a] border-green-900/50 shadow-[0_4px_20px_rgba(34,197,94,0.05)]' : 
                          'bg-[#1a1a1a] border-[#333]'
                        }`}
                      >
                        <div className="mt-1">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                            ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-[#222] border-[#444]'}
                          `}>
                            {isCompleted && <Check className="w-4 h-4 text-[#1a1a1a] stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span style={{ color: isLocked ? '#666' : ach.badgeColor }} className="bg-[#222] p-1.5 rounded-lg border border-[#333]">
                                  {renderIcon(ach.icon || 'Trophy')}
                                </span>
                                <h4 className={`font-bold text-xl ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                                  {ach.name}
                                </h4>
                              </div>
                              <p className="text-gray-400 text-sm mt-2">{ach.message || ach.description}</p>
                            </div>
                            
                            {ach.status === 'Completed' && (
                              <button 
                                onClick={() => handleClaim(group.habitId, ach.achievementId || ach.id)}
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] whitespace-nowrap"
                              >
                                Claim Reward
                              </button>
                            )}
                            {isClaimed && (
                              <span className="px-3 py-1 bg-[#222] border border-[#333] text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                Claimed
                              </span>
                            )}
                            {isLocked && (
                              <span className="px-3 py-1 bg-[#222] border border-[#333] text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                Locked
                              </span>
                            )}
                            {ach.status === 'InProgress' && (
                              <span className="px-3 py-1 bg-blue-900/30 border border-blue-900/50 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                                In Progress
                              </span>
                            )}
                          </div>

                          {!isClaimed && (
                            <div className="mt-5">
                              <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 tracking-wider uppercase">
                                <span>Progress</span>
                                <span>{ach.currentProgress} / {ach.requiredProgress}</span>
                              </div>
                              <div className="w-full bg-[#111] h-2.5 rounded-full overflow-hidden border border-[#333]">
                                <div 
                                  className="h-full rounded-full transition-all duration-1000 ease-out"
                                  style={{ 
                                    width: `${progressPercent}%`, 
                                    backgroundColor: ach.badgeColor,
                                    opacity: isLocked ? 0.3 : 1
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {isClaimed && ach.completedAt && (
                            <p className="text-xs text-gray-500 mt-3 font-medium">
                              Completed on {new Date(ach.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
