'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age_group: '11-14' as '11-14' | '15-18',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens and underscores';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        age_group: formData.age_group,
      });

      // Redirect to onboarding after successful registration
      // New users always have onboardingComplete: false by default
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrors({
        submit: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-6">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-cyan-400 text-xs font-mono tracking-wider">
              REGISTRATION PROTOCOL v2.847.x
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white font-orbitron mb-2 tracking-wider">
            CREATE ACCOUNT
          </h1>
          <p className="text-slate-400 font-rajdhani">
            Initialize neural link protocol
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-cyan-400 mb-2 font-orbitron">
                USERNAME
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                placeholder="SPECTRE_01"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-400 font-rajdhani">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-2 font-orbitron">
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                placeholder="agent@coderunner.io"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400 font-rajdhani">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyan-400 mb-2 font-orbitron">
                PASSWORD
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 font-rajdhani">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-400 mb-2 font-orbitron">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400 font-rajdhani">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Age Group Field */}
            <div>
              <label htmlFor="age_group" className="block text-sm font-medium text-cyan-400 mb-2 font-orbitron">
                AGE GROUP
              </label>
              <select
                id="age_group"
                name="age_group"
                value={formData.age_group}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                disabled={isLoading}
              >
                <option value="11-14">11-14 (CADET)</option>
                <option value="15-18">15-18 (OPERATOR)</option>
              </select>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400 font-rajdhani">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-orbitron tracking-wider"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  INITIALIZING...
                </span>
              ) : (
                'INITIATE PROTOCOL'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-slate-400 text-sm font-rajdhani">
              Already have clearance?{' '}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 transition font-orbitron"
              >
                ACCESS SYSTEM
              </Link>
            </p>
          </div>
        </div>

        {/* System Time */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-slate-800/50 bg-slate-900/30">
            <span className="text-xs text-slate-500 font-mono mr-2">SYSTEM TIME:</span>
            <span className="text-xs text-cyan-400 font-mono font-bold">{currentTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
