'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../utils/axiosClient';

// Import Framer Motion for animations
import { motion, AnimatePresence } from 'framer-motion';

// --- Icon Components (Reused from Register Page) ---
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// --- Form Input Wrapper Component ---
const FormInput = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon,
}: any) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
      {icon}
    </div>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-3 pl-11 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// --- Main Login Page Component ---
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      if (!email || !password) {
        setLoading(false);
        setError('Please fill in all fields.');
        return;
      }
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const data = response.data;
      setLoading(false);

      if (!data.success) {
        setError(data.message || 'Invalid email or password. Please try again.');
        return;
      }

      // Save token & role
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      // Navigate to role dashboard
      router.push(`/dashboard/${data.role}`);
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      setError(error.response?.data?.message || 'A server error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 md:py-24 px-4 bg-linear-to-br from-[#0A0F1F] via-[#0E1A35] to-[#1A73E8]
">
      <div className="w-full max-w-md bg-white p-8 md:p-10 shadow-xl border border-gray-200 rounded-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Login to access your dashboard.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* --- Email Field --- */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <FormInput
              id="email"
              name="email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              icon={<MailIcon />}
            />
          </div>

          {/* --- Password Field --- */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <FormInput
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              icon={<LockIcon />}
            />
          </div>

          {/* --- Notification Area --- */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- Submit Button --- */}
          {/* --- Submit Button (Normal User) --- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* --- Security Login Button --- */}

        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}