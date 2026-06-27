import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { setToken, setUser } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalized = phone.startsWith('+250') ? phone : `+250${phone.replace(/^0/, '')}`;
      const res = await api.post<{
        success: boolean;
        data?: { accessToken: string; user: { id: string; phoneNumber: string; fullName: string | null; email: string | null; role: string } };
        error?: { code: string; message: string };
      }>('/auth/login', { phoneNumber: normalized, password });

      if (!res.data.success || !res.data.data) {
        setError(res.data.error?.message ?? 'Login failed');
        return;
      }

      const { accessToken, user } = res.data.data;

      if (user.role !== 'ADMIN') {
        setError('Not an admin account. Access denied.');
        return;
      }

      setToken(accessToken);
      setUser(user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] w-full max-w-sm p-8">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <img src="/logo.png" alt="Rahaa Eats" className="w-14 h-14 object-contain" />
          <div className="text-center">
            <span className="text-2xl font-bold text-primary">Rahaa Eats</span>
            <p className="text-[#757575] text-sm mt-0.5">Admin Dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Phone number</label>
            <div className="flex border border-[#E0E0E0] rounded-xl overflow-hidden focus-within:border-primary transition-colors">
              <span className="px-3 py-3 bg-gray-50 text-[#757575] text-sm font-medium border-r border-[#E0E0E0] select-none">
                +250
              </span>
              <input
                type="tel"
                placeholder="7XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-3 py-3 text-sm outline-none text-[#1A1A1A] placeholder-[#BDBDBD]"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Password</label>
            <div className="flex border border-[#E0E0E0] rounded-xl overflow-hidden focus-within:border-primary transition-colors">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-3 py-3 text-sm outline-none text-[#1A1A1A] placeholder-[#BDBDBD]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-[#757575] hover:text-[#1A1A1A] transition-colors"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#E53935] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !phone || !password}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
