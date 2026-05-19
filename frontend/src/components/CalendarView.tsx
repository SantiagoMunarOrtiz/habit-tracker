import { useState } from 'react';

export const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handlePrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const handleNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div className="calendar-container p-4 border rounded">
      <div className="flex justify-between mb-4">
        <button onClick={handlePrev} className="px-2 py-1 bg-gray-200 rounded">&lt; Prev</button>
        <h3 className="text-lg font-bold">{`${currentMonth + 1} / ${currentYear}`}</h3>
        <button onClick={handleNext} className="px-2 py-1 bg-gray-200 rounded">Next &gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Placeholder for days rendering */}
        <div className="p-2 bg-green-200">Mandatory Done</div>
        <div className="p-2 bg-blue-200">Optional Done</div>
        <div className="p-2 bg-red-200">Missed</div>
        <div className="p-2 bg-yellow-200">Vacation</div>
        <div className="p-2 bg-purple-200">Replaced</div>
      </div>
    </div>
  );
};
