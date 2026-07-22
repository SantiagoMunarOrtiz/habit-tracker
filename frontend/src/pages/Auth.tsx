import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Auth({ onLogin }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string, password?: string, passwordConfirm?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newFieldErrors: any = {};
    if (!isLogin) {
      if (password.length < 8) {
        newFieldErrors.password = 'Password must be at least 8 characters long';
      }
      if (password !== passwordConfirm) {
        newFieldErrors.passwordConfirm = 'Passwords do not match';
      }
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, { credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      onLogin(data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
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
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#222] border border-[#333] text-white p-3 rounded-lg focus:border-blue-500 focus:outline-none" disabled={isLoading} />
            </div>
          )}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full bg-[#222] border ${fieldErrors.email ? 'border-red-500' : 'border-[#333]'} text-white p-3 rounded-lg focus:border-blue-500 focus:outline-none`} disabled={isLoading} />
            {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <div className="relative">
              <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={`w-full bg-[#222] border ${fieldErrors.password ? 'border-red-500' : 'border-[#333]'} text-white p-3 rounded-lg focus:border-blue-500 focus:outline-none pr-10`} disabled={isLoading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          {!isLogin && (
            <div>
              <label className="block text-gray-400 text-sm mb-1">Confirm Password</label>
              <input required type={showPassword ? 'text' : 'password'} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className={`w-full bg-[#222] border ${fieldErrors.passwordConfirm ? 'border-red-500' : 'border-[#333]'} text-white p-3 rounded-lg focus:border-blue-500 focus:outline-none`} disabled={isLoading} />
              {fieldErrors.passwordConfirm && <p className="text-red-400 text-xs mt-1">{fieldErrors.passwordConfirm}</p>}
            </div>
          )}
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setFieldErrors({}); }} className="text-gray-500 hover:text-white text-sm" disabled={isLoading}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}