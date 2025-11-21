'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
// [All your icon components remain exactly the same]
// ... (LogOutIcon, ClockIcon, CheckIcon, XIcon, InboxIcon, LoadingSpinner)
// --- Icons ---
const LogOutIcon = (props: any) => (
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
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ClockIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InboxIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
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
);


// --- Type Definitions ---
interface Outpass {
  _id: string;
  reason: string;
  outDate: string;
  outTime: string;
  inDate: string;
  inTime: string;
  status: string;
  studentId: {
    name: string;
    department: string;
    year: string;
  };
  approvalStatus: {
    advisor: 'pending' | 'approved' | 'rejected';
    hod: 'pending' | 'approved' | 'rejected';
    warden: 'pending' | 'approved' | 'rejected';
  };
}

// --- Helper Components ---
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
    <InboxIcon className="mb-3" />
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm">All caught up!</p>
  </div>
);

const ApprovalStep = ({ label, stage }: { label: string; stage: string }) => {
  // This component doesn't need to change, it correctly displays
  // the status of all roles, which is what the warden needs to see.
  switch (stage) {
    case 'approved':
      return (
        <span className="flex items-center gap-1 text-green-600 text-sm">
          <CheckIcon className="text-green-500" /> {label}
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center gap-1 text-red-600 text-sm">
          <XIcon className="text-red-500" /> {label}
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-gray-500 text-sm">
          <ClockIcon className="text-gray-400" /> {label}
        </span>
      );
  }
};

// --- Main Component ---
export default function WardenDashboard() {
  const router = useRouter();
  const [wardenId, setWardenId] = useState<string | null>(null); // CHANGED
  const [activeTab, setActiveTab] = useState('pending'); // pending | history

  const [pendingOutpasses, setPendingOutpasses] = useState<Outpass[]>([]);
  const [historyOutpasses, setHistoryOutpasses] = useState<Outpass[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tracks loading state per-card
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  // Fetch warden ID and all data on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setWardenId(decoded.id); // CHANGED
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
      // Assumes you have two separate endpoints for the warden
      const pendingRes = await api.get(`/warden/pending/${id}`); // CHANGED
      const historyRes = await api.get(`/warden/history/${id}`); // CHANGED

      if (pendingRes.data.success) {
        setPendingOutpasses(pendingRes.data.outpasses);
      }
      if (historyRes.data.success) {
        setHistoryOutpasses(historyRes.data.outpasses);
      }
    } catch {
      setError('Failed to fetch outpass data. Please refresh.');
    }
    setLoading(false);
  }

  const handleAction = async (
    action: 'approve' | 'reject',
    outpassId: string
  ) => {
    if (!wardenId) return; // CHANGED

    setIsSubmitting((prev) => ({ ...prev, [outpassId]: true }));

    try {
      await api.put(`/warden/${action}/${outpassId}`); // CHANGED
      // Success! Refetch both lists to update UI
      fetchAllData(wardenId); // CHANGED
    } catch {
      setError(`Failed to ${action} request. Please try again.`);
    } finally {
      // Stop loading for this card, even if fetchAllData is running
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
          Warden Dashboard {/* CHANGED */}
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
                <WardenOutpassCard // CHANGED
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
                <WardenOutpassCard // CHANGED
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

// --- Card Component ---
const WardenOutpassCard = ({ // CHANGED
  item,
  isSubmitting,
  onApprove,
  onReject,
  isHistory,
}: {
  item: Outpass;
  isSubmitting: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isHistory: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      {/* Top: Student + Dates */}
      <div className="flex flex-col md:flex-row justify-between md:items-start">
        <div>
          <p className="text-xl font-bold text-gray-900">
            {item.studentId?.name}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {item.studentId?.department} • {item.studentId?.year}
          </p>
        </div>
        <div className="flex flex-col md:text-right text-sm text-gray-600 mb-3 md:mb-0">
          <p>
            <span className="font-medium text-gray-800">Out:</span>{' '}
            {item.outDate} at {item.outTime}
          </p>
          <p>
            <span className="font-medium text-gray-800">In:</span>{' '}
            {item.inDate} at {item.inTime}
          </p>
        </div>
      </div>

      {/* Reason */}
      <p className="text-gray-800 my-2 py-3 px-4 bg-gray-50 rounded-md border border-gray-200">
        {item.reason}
      </p>

      {/* Footer: Approval + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-t border-gray-100 pt-4 mt-4">
        {/* Approval Flow */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">
            Approval Status:
          </span>
          <div className="flex gap-3">
            {/* This section remains the same, as it shows the whole flow */}
            <ApprovalStep
              label="Advisor"
              stage={item.approvalStatus?.advisor}
            />
            <ApprovalStep label="HOD" stage={item.approvalStatus?.hod} />
            <ApprovalStep
              label="Warden"
              stage={item.approvalStatus?.warden}
            />
          </div>
        </div>

        {/* Action Buttons (Only for Pending tab) */}
        {!isHistory && (
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => onReject!(item._id)}
              disabled={isSubmitting}
              className="flex justify-center items-center w-28 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 disabled:bg-gray-400"
            >
              {isSubmitting ? <LoadingSpinner /> : 'Reject'}
            </button>
            <button
              onClick={() => onApprove!(item._id)}
              disabled={isSubmitting}
              className="flex justify-center items-center w-28 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSubmitting ? <LoadingSpinner /> : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};