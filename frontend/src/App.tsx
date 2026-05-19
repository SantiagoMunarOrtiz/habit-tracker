import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Rewards } from './pages/Rewards';
import { Spreadsheet } from './pages/Spreadsheet';
import { Auth } from './pages/Auth';
import type { User } from './types';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to authenticate:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkToken();
  }, []);

  const handleLogin = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (isLoading) return <div className="flex h-screen bg-[#121212] items-center justify-center text-gray-300">Loading...</div>;

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#121212] text-gray-200 font-sans">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8 bg-[#121212]">
          <Routes>
            <Route path="/" element={<Spreadsheet user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/analytics" element={<Analytics user={user} />} />
            <Route path="/rewards" element={<Rewards user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
