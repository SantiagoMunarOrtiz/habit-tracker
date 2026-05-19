export function VacationModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-md rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Set Vacation Mode</h2>
        <button onClick={onClose} className="text-gray-400">Close</button>
      </div>
    </div>
  );
}