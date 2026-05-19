export const AnalyticsView = ({ data }: any) => {
  return (
    <div className="analytics-container p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Habit Analytics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-box p-4 bg-green-50 text-green-800 rounded">
          <p className="text-sm">Mandatory Done</p>
          <p className="text-2xl font-bold">{data?.progress?.completedMandatory?.length || 0}</p>
        </div>
        <div className="stat-box p-4 bg-purple-50 text-purple-800 rounded">
          <p className="text-sm">Mandatory Replaced</p>
          <p className="text-2xl font-bold">{data?.progress?.replacedMandatory?.length || 0}</p>
        </div>
        <div className="stat-box p-4 bg-red-50 text-red-800 rounded">
          <p className="text-sm">Mandatory Missed</p>
          <p className="text-2xl font-bold">{data?.progress?.missedMandatory?.length || 0}</p>
        </div>
        <div className="stat-box p-4 bg-blue-50 text-blue-800 rounded">
          <p className="text-sm">Current Streak</p>
          <p className="text-2xl font-bold">{data?.streaks?.current || 0} days</p>
        </div>
      </div>

      <div className="achievements-section mt-8 border-t pt-4">
        <h3 className="text-lg font-bold mb-4">Science-based Milestones</h3>
        <ul className="space-y-2">
          {/* Real data would map over the habit's unlocked achievements here */}
          <li className="flex items-center gap-2 text-pink-500">
            <span className="text-xl">🏆</span> Pink Day (10)
          </li>
          <li className="flex items-center gap-2 text-yellow-600">
            <span className="text-xl">🔒</span> Classic Milestone (21)
          </li>
          <li className="flex items-center gap-2 text-gray-400">
            <span className="text-xl">🔒</span> Science Milestone (66)
          </li>
          <li className="flex items-center gap-2 text-gray-400">
            <span className="text-xl">🔒</span> Discipline Badge (90)
          </li>
          <li className="flex items-center gap-2 text-gray-400">
            <span className="text-xl">🔒</span> Identity Badge (180)
          </li>
          <li className="flex items-center gap-2 text-gray-400">
            <span className="text-xl">🔒</span> Year Badge (365)
          </li>
        </ul>
      </div>
    </div>
  );
};
