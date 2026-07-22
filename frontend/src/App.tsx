import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Rewards } from './pages/Rewards';
import { Goals } from './pages/Goals';
import { Reflections } from './pages/Reflections';
import { WorkPlanner } from './pages/WorkPlanner';
import { Spreadsheet } from './pages/Spreadsheet';
import { Auth } from './pages/Auth';
import type { User } from './types';
import { Menu, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to authenticate:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout failed:', e);
    }
    setUser(null);
  };

  if (isLoading) return <div className="flex h-screen bg-[#121212] items-center justify-center text-gray-300">Loading...</div>;

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#121212] text-gray-200 font-sans overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4 z-40">
          <h1 className="font-bold text-xl text-blue-400">HabitSync</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-300 hover:text-white">
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-50 flex`}>
          <Sidebar user={user} onLogout={handleLogout} onNavigate={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-20 pb-8 px-4 md:pt-8 md:px-8 bg-[#121212] h-full w-full">
          <Routes>
            <Route path="/" element={<Spreadsheet user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/analytics" element={<Analytics user={user} />} />
            <Route path="/goals" element={<Goals user={user} />} />
            <Route path="/reflections" element={<Reflections user={user} />} />
            <Route path="/work" element={<WorkPlanner user={user} />} />
            <Route path="/rewards" element={<Rewards user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
