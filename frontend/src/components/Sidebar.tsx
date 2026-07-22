import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Award, PlusCircle, CheckCircle, Calendar, Palmtree, LogOut, Target, BookOpen, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { VacationModal } from './VacationModal';
import type { User } from '../types';

export function Sidebar({ user, onLogout, onNavigate }: { user: User, onLogout?: () => void, onNavigate?: () => void }) {
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const location = useLocation();

  const handleCreateVacation = async (data: any) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/vacations`, { credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({ ...data, userId: user.id })
      });
      setIsVacationModalOpen(false);
      window.location.reload(); // Quick refresh to apply vacation globally
    } catch (error) {
      console.error('Error creating vacation:', error);
    }
  };

  return (
    <div className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-blue-400 mb-8 flex items-center gap-2">
        <CheckCircle className="w-8 h-8" />
        HabitSync
      </h1>

      <div className="space-y-3 mb-8">
        <button className="w-full flex items-center justify-center gap-2 bg-[#232323] border border-[#333] text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
          <PlusCircle className="w-5 h-5 text-green-500" />
          New Habit
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem to="/" icon={<Calendar className="text-green-500" />} label="Spreadsheet" currentPath={location.pathname} onClick={onNavigate} />
        <NavItem to="/dashboard" icon={<BookOpen className="text-green-500" />} label="Ideas & Journal" currentPath={location.pathname} onClick={onNavigate} />
        <NavItem to="/analytics" icon={<BarChart2 className="text-green-500" />} label="Analytics" currentPath={location.pathname} onClick={onNavigate} />
        <NavItem to="/goals" icon={<Target className="text-blue-500" />} label="Goals & Systems" currentPath={location.pathname} onClick={onNavigate} />
        <NavItem to="/work" icon={<Briefcase className="text-indigo-500" />} label="Work Planner" currentPath={location.pathname} onClick={onNavigate} />
        <NavItem to="/reflections" icon={<BookOpen className="text-blue-500" />} label="Daily Reflection" currentPath={location.pathname} onClick={onNavigate} />
        <NavItem to="/rewards" icon={<Award className="text-green-500" />} label="Rewards" currentPath={location.pathname} onClick={onNavigate} />
      </nav>

      <div className="mt-auto">
        <div className="bg-[#232323] border border-[#333] p-4 rounded-xl mb-4">
          <p className="text-sm font-semibold text-gray-300">Level {user.level}</p>
          <div className="w-full bg-[#111] h-2 rounded-full mt-2 overflow-hidden border border-[#333]">
            <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${(user.points % 100)}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{user.points} points</p>
        </div>

        <button
          onClick={() => setIsVacationModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 hover:from-blue-800/60 hover:to-indigo-800/60 border border-blue-500/30 text-blue-300 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] mb-4"
        >
          <Palmtree className="w-5 h-5 text-blue-400" />
          Vacation Mode
        </button>

        {onLogout && (
          <button
            onClick={() => { onLogout(); onNavigate?.(); }}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white py-2 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        )}
      </div>

      <VacationModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        onSubmit={handleCreateVacation}
      />
    </div>
  );
}

function NavItem({ to, icon, label, currentPath, onClick }: { to: string; icon: React.ReactNode; label: string; currentPath: string; onClick?: () => void }) {
  const isActive = currentPath === to;
  return (
    <Link to={to} onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:bg-[#232323] hover:text-white'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
