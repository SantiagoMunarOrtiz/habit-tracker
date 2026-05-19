import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Auth({ onLogin }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server returned an invalid response. Database might not be connected.');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onLogin(data.token, data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server returned an invalid response. Database might not be connected.');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Guest login failed');
      }
      onLogin(data.token, data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#222] border border-[#333] text-white p-3 rounded-lg focus:border-blue-500 focus:outline-none" />
            </div>
          )}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#222] border border-[#333] text-white p-3 rounded-lg focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#222] border border-[#333] text-white p-3 rounded-lg focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a1a] text-gray-500">Or</span>
            </div>
          </div>
          <button
            onClick={handleGuestLogin}
            type="button"
            className="w-full mt-4 bg-[#333] hover:bg-[#444] text-white font-bold py-3 rounded-lg transition-colors border border-[#444]"
          >
            Log in as Guest
          </button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-gray-500 hover:text-white text-sm">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}