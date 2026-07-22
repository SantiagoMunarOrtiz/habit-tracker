import React, { useState } from 'react';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  categories: { id: string; name: string }[];
}

export function HabitFormModal({ isOpen, onClose, onSubmit, categories }: HabitFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    planType: 'Personal',
    difficulty: 'Medium',
    categoryId: categories?.[0]?.id || '',
    scheduleType: 'fixedDays',
    selectedDays: [0, 1, 2, 3, 4, 5, 6], // default to all days (M-S)
    targetDaysPerWeek: 3,
    ifThenPlan: '',
    miniReward: ''
  });

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => {
      const days = prev.selectedDays.includes(dayIndex)
        ? prev.selectedDays.filter(d => d !== dayIndex)
        : [...prev.selectedDays, dayIndex];
      return { ...prev, selectedDays: days };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">New Habit</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Habit Title</label>
            <input required type="text" className="w-full bg-[#232323] border border-[#444] text-white rounded-lg p-3 focus:outline-none focus:border-green-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Morning Workout" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Plan Type</label>
              <select className="w-full bg-[#232323] border border-[#444] text-white rounded-lg p-3" value={formData.planType} onChange={e => setFormData({...formData, planType: e.target.value})}>
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Difficulty</label>
              <select className="w-full bg-[#232323] border border-[#444] text-white rounded-lg p-3" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="bg-[#232323] border border-[#333] p-4 rounded-xl">
            <label className="block text-sm font-medium mb-3 text-gray-300">Mandatory Days</label>
            <div className="flex justify-between gap-1 overflow-x-auto pb-2">
              {daysOfWeek.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full font-bold transition-colors flex items-center justify-center text-sm md:text-base ${formData.selectedDays.includes(idx) ? 'bg-green-500 text-black' : 'bg-[#111] text-gray-500 border border-[#333] hover:border-green-500/50'}`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">Unselected days act as Planned Rest days and won't penalize your streak.</p>
          </div>

          <div className="bg-[#1a1a2e] p-5 rounded-xl border border-[#2a2a4e]">
            <h3 className="font-semibold text-blue-300 mb-3">Science-Based Motivation</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-blue-200/70 mb-2">If-Then Plan</label>
              <input type="text" className="w-full bg-[#111] border border-[#2a2a4e] text-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500" value={formData.ifThenPlan} onChange={e => setFormData({...formData, ifThenPlan: e.target.value})} placeholder="If I miss my morning workout, I will do 15 mins of yoga at night." />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200/70 mb-2">Mini Reward</label>
              <input type="text" className="w-full bg-[#111] border border-[#2a2a4e] text-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500" value={formData.miniReward} onChange={e => setFormData({...formData, miniReward: e.target.value})} placeholder="e.g., Watch one episode guilt-free" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-400 hover:text-white rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-green-500 text-black rounded-lg hover:bg-green-400 font-bold">Save Habit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
