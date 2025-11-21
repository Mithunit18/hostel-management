'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { option } from 'framer-motion/client';


// --- Icon Components ---
const UserIcon = () => (
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
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
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
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const RoleIcon = () => (
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
  >
    <path d="M18 8.88a4 4 0 1 1-7.76 0" />
    <path d="M14 14.3a4 4 0 0 0-4.54 0" />
    <path d="M6 18.5a4 4 0 0 0 4.54 0" />
    <path d="M14 3.7a4 4 0 0 0 4.54 0" />
    <path d="M6 3.7a4 4 0 0 1 4.54 0" />
    <path d="M18 14.3a4 4 0 0 1-4.54 0" />
  </svg>
);

const InfoIcon = () => (
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
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// --- Form Input Component ---
const FormInput = ({ icon, ...props }: any) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
      {icon}
    </span>
    <input
      {...props}
      className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// --- Form Select Component ---
const FormSelect = ({ icon, children, ...props }: any) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      {icon}
    </span>
    <select
      {...props}
      className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
    >
      {children}
    </select>
  </div>
);

const hostelName = [
  "Pothigai",
  "Thamirabarani",
  "Kaveri",
  "vaigai",
  "Bhavani",
  "palaru",
  "Amaravati",
]

// --- Page Component ---
export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    regNo: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    year: '',
    section: '',
    hostelName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setError(null);
    setSuccess(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // --- Validation ---
    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Name, Email, Password, and Role are required');
      return;
    }

    if (form.role === 'student') {
      if (!form.regNo || !form.department || !form.year || !form.section) {
        setError(
          'For Student role: Registration No, Department, Year, and Section are required'
        );
        return;
      }
    } else if (form.role === 'advisor') {
      if (!form.department || !form.section) {
        setError('For Class Advisor role: Department and Section are required');
        return;
      }
    } else if (form.role === 'hod') {
      if (!form.department) {
        setError('For HOD role: Department is required');
        return;
      }
    } else if (form.role == 'warden') {
      if (!form.hostelName) {
        setError('For Warden: Hostel Name is required');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', form);
      const data = res.data;

      if (!data.success) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess('Registered successfully! Please login.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Server error');
    }
  };

  // --- Animation ---
  const fieldAnimation = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] py-12 px-4 bg-linear-to-br from-[#0A0F1F] via-[#0E1A35] to-[#1A73E8]
">
      <div className="w-full max-w-lg bg-white p-8 md:p-10 shadow-xl border border-gray-200 rounded-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          Create an Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* --- Core Fields --- */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <FormInput
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              icon={<UserIcon />}
            />
          </div>

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
              value={form.email}
              onChange={handleChange}
              icon={<MailIcon />}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <FormInput
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              icon={<LockIcon />}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              I am a...
            </label>
            <FormSelect
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              icon={<RoleIcon />}
            >
              <option value="student">Student</option>
              <option value="advisor">Class Advisor</option>
              <option value="hod">HOD</option>
              <option value="warden">Warden</option>
            </FormSelect>
          </div>

          {/* --- Conditional Fields --- */}
          <AnimatePresence>
            {form.role === 'student' && (
              <motion.div
                key="student-fields"
                {...fieldAnimation}
                className="space-y-6"
              >
                {/* ... [Student fields are unchanged] ... */}
                <div>
                  <label
                    htmlFor="regNo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Registration Number
                  </label>
                  <FormInput
                    id="regNo"
                    name="regNo"
                    placeholder="Registration Number"
                    value={form.regNo}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  />
                </div>
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <FormInput
                    id="department"
                    name="department"
                    placeholder="Department (e.g., CSE)"
                    value={form.department}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  />
                </div>
                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Year
                  </label>
                  <FormSelect
                    id="year"
                    name="year"
                    placeholder="Year (e.g., 3rd Year)"
                    value={form.year}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </FormSelect>
                </div>
                <div>
                  <label
                    htmlFor="section"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Section
                  </label>
                  <FormSelect
                    id="section"
                    name="section"
                    placeholder="Section (e.g., A)"
                    value={form.section}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  >
                    <option value="A">A</option>  
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>  
                    <option value="G">G</option>
                    <option value="H">H</option>
                    <option value="I">I</option>
                    <option value="J">J</option>
                    <option value="K">K</option>  
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="N">N</option>
                    <option value="O">O</option>
                    <option value="P">P</option>  
                  </FormSelect>
                </div>
              </motion.div>
            )}

            {form.role === 'advisor' && (
              <motion.div
                key="advisor-fields"
                {...fieldAnimation}
                className="space-y-6"
              >
                {/* ... [Advisor fields are unchanged] ... */}
                <div>
                  <label
                    htmlFor="department_advisor"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <FormInput
                    id="department_advisor"
                    name="department"
                    placeholder="Department (e.g., CSE)"
                    value={form.department}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  />
                </div>
                <div>
                  <label
                    htmlFor="section_advisor"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Section
                  </label>
                  <FormInput
                    id="section_advisor"
                    name="section"
                    placeholder="Section (e.g., A)"
                    value={form.section}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  />
                </div>
              </motion.div>
            )}

            {form.role === 'hod' && (
              <motion.div
                key="hod-fields"
                {...fieldAnimation}
                className="space-y-6"
              >
                {/* ... [HOD field is unchanged] ... */}
                <div>
                  <label
                    htmlFor="department_hod"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <FormInput
                    id="department_hod"
                    name="department"
                    placeholder="Department (e.g., CSE)"
                    value={form.department}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  />
                </div>
              </motion.div>
            )}

            {/* --- MODIFIED 3 of 3: Add conditional block for Warden --- */}
            {form.role === 'warden' && (
              <motion.div
                key="warden-fields"
                {...fieldAnimation}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="hostelName_warden"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hostel Name
                  </label>
                  <FormSelect
                    id="hostelName_warden"
                    name="hostelName" // This matches the state key
                    placeholder="Your assigned hostel"
                    value={form.hostelName}
                    onChange={handleChange}
                    icon={<InfoIcon />}
                  > <option value="" disabled>Select your hostel...</option>{
                    hostelName.map((hostel) => (
                      <option key={hostel} value={hostel}>
                      {hostel}
                      </option>
                    ))
                  }
                  </FormSelect>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- Submit Button --- */}
          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}