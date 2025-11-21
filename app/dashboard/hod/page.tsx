'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/axiosClient'; // Your axios instance
import { motion, AnimatePresence } from 'framer-motion';
// Import the component and interface from the other file
import { ApprovalOutpassCard, Outpass } from './../../components/ApprovalOutpassCard'; 

// --- Icons (Only those needed for this component) ---
const LogOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const InboxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

// --- Type for JWT payload ---
interface JwtPayload {
  id: string;
  role: string;
  // ... any other fields in your token
}

// --- Helper Components ---
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
    <InboxIcon className="mb-3" />
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm">All caught up!</p>
  </div>
);

// --- Main Component ---
export default function HodDashboard() {
  const router = useRouter();
  const [hodId, setHodId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending'); // pending | history

  // Use TypeScript generics for state
  const [pendingOutpasses, setPendingOutpasses] = useState<Outpass[]>([]);
  const [historyOutpasses, setHistoryOutpasses] = useState<Outpass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Strongly type the 'isSubmitting' record
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  // --- API Response Types ---
  // (Optional but good practice for defining API contracts)
  interface ApiSuccessResponse {
    success: true;
    outpasses: Outpass[];
  }
  interface ApiErrorResponse {
    success: false;
    error: string;
  }
  type ApiResponse = ApiSuccessResponse | ApiErrorResponse;


  // Fetch HOD ID and all data on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      setHodId(decoded.id);
      fetchAllData(decoded.id);
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Fetch both pending and history
  async function fetchAllData(id: string) {
    setLoading(true);
    setError('');
    try {
      // Use the new HOD routes and type the expected response
      const pendingRes = await api.get<ApiSuccessResponse>(`/hod/pending/${id}`);
      const historyRes = await api.get<ApiSuccessResponse>(`/hod/history/${id}`);

      if (pendingRes.data.success) {
        setPendingOutpasses(pendingRes.data.outpasses);
      }
      if (historyRes.data.success) {
        setHistoryOutpasses(historyRes.data.outpasses);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch outpass data. Please refresh.');
    }
    setLoading(false);
  }

  const handleAction = async (
    action: 'approve' | 'reject',
    outpassId: string
  ) => {
    if (!hodId) return;

    setIsSubmitting((prev) => ({ ...prev, [outpassId]: true }));

    try {
      // Use the new HOD routes
      await api.put(`/hod/${action}/${outpassId}`);
      // Success! Refetch both lists to update UI
      fetchAllData(hodId);
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} request. Please try again.`);
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [outpassId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* --- Dashboard Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800">
          HOD Dashboard
        </h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <LogOutIcon className="text-gray-500" />
          Logout
        </button>
      </div>

      {/* ---- PAGE TABS ---- */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={`w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Approval History
        </button>
      </div>

      {error && (
        <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ===== TAB 1: PENDING REQUESTS ===== */}
        {activeTab === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <ClockIcon className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : pendingOutpasses.length === 0 ? (
              <EmptyState message="No pending outpasses." />
            ) : (
              pendingOutpasses.map((item) => (
                <ApprovalOutpassCard
                  key={item._id}
                  item={item}
                  isSubmitting={isSubmitting[item._id] || false}
                  onApprove={() => handleAction('approve', item._id)}
                  onReject={() => handleAction('reject', item._id)}
                  isHistory={false}
                />
              ))
            )}
          </motion.div>
        )}

        {/* ===== TAB 2: HISTORY ===== */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <ClockIcon className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : historyOutpasses.length === 0 ? (
              <EmptyState message="No approval history found." />
            ) : (
              historyOutpasses.map((item) => (
                <ApprovalOutpassCard
                  key={item._id}
                  item={item}
                  isSubmitting={false}
                  isHistory={true}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}