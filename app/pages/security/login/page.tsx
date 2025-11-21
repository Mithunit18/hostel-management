"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
// import api from "../../../utils/axiosClient"; // Removed - no longer needed for client-side login

// 🔒 CRITICAL: Hardcoded Credentials for Gate Access
const SECURITY_EMAIL = "gate@college.edu";
const SECURITY_PASSWORD = "gatepass123"; // CHANGE THIS IN PRODUCTION

export default function SecurityLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Client-Side Credential Validation
    if (form.email !== SECURITY_EMAIL || form.password !== SECURITY_PASSWORD) {
      setError("Invalid security credentials. Access denied.");
      setLoading(false);
      return;
    }

    // 2. Successful Login: Manually set a dummy token
    // We set a token and role so the scanner page can verify basic access
    localStorage.setItem('token', 'dummy-security-token-2024');
    localStorage.setItem('role', 'security');
    
    // 3. Navigate to Scanner
    router.push('/pages/security/scanner');

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0A0F1F] via-[#0E1A35] to-[#1A73E8]  text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-red-500 mb-6">GATE KEEPER</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Security Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-red-500 outline-none"
              placeholder="gate@college.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-red-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors"
          >
            {loading ? "Checking..." : "Access Scanner"}
          </button>
        </form>
      </div>
    </div>
  );
}