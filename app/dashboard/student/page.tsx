'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';

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
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InboxIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

// --- Type Definitions ---
interface Outpass {
  _id: string;
  reason: string;
  status:
  | 'pending'
  | 'advisor-approved'
  | 'hod-approved'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';
  outDate: string;
  outTime: string;
  inDate: string;
  inTime: string;
  approvalStatus: {
    advisor: 'pending' | 'approved' | 'rejected';
    hod: 'pending' | 'approved' | 'rejected';
    warden: 'pending' | 'approved' | 'rejected';
  };
}

// --- Reusable Components ---

const ReadOnlyInput = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      readOnly
      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 shadow-sm cursor-not-allowed"
    />
  </div>
);

const FormInput = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
}: any) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Notification = ({ message, type }: { message: string; type: 'error' | 'success' }) => {
  const styles = {
    error: 'bg-red-50 border-red-300 text-red-700',
    success: 'bg-green-50 border-green-300 text-green-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`px-4 py-3 rounded-lg text-sm border ${styles[type]}`}
    >
      {message}
    </motion.div>
  );
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-gray-500"
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

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <InboxIcon className="w-12 h-12 mb-3" />
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm">Check back later or apply for a new one!</p>
  </div>
);

// --- Main Dashboard Component ---

export default function StudentDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('apply'); // apply | requests | history
  const [form, setForm] = useState({
    name: '',
    department: '',
    year: '',
    semester: '',
    room: '',
    wardenId: '',
    outDate: '',
    outTime: '',
    inDate: '',
    inTime: '',
    reason: '',
  });

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false); // For form submission
  const [isFetching, setIsFetching] = useState(true); // For loading outpasses
  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [wardens, setWardens] = useState<any[]>([]);

  console.log(wardens);

  const fetchOutpasses = async (studentId: string) => {
    setIsFetching(true);
    try {
      const res = await api.get(`/outpass/student/${studentId}`);
      if (res.data.success) {
        // Sort by newest first
        const sortedOutpasses = res.data.outpasses.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOutpasses(sortedOutpasses);
      }
    } catch (err) {
      setError('Failed to fetch outpass data.');
    }
    setIsFetching(false);
  };

  // Auto-fill and initial fetch
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setForm((prev) => ({
        ...prev,
        name: decoded.name || '',
        department: decoded.department || '',
        year: decoded.year || '',
        semester: decoded.semester ?? '',
        room: decoded.room ?? '',
        hostelName: decoded.hostelName ?? '',
        wardenName: decoded.wardenName ?? '',
      }));
      fetchOutpasses(decoded.id);
    } catch (e) {
      router.push('/login'); // Invalid token
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const fetchWardens = async () => {
    try {
      const res = await api.get('/warden/get-wardens');
      setWardens(res.data);

    } catch (error) {

    }
  }
  useEffect(() => {
    fetchWardens();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !form.outDate || !form.outTime || !form.inDate || !form.inTime ||
      !form.reason || !form.semester || !form.room ||  !form.wardenId
    ) {
      setError('Please fill in all required fields to apply.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const decoded = JSON.parse(atob(token!.split('.')[1]));
    setLoading(true);

    try {
      const res = await api.post('/outpass/apply', {
        studentId: decoded.id,
        ...form,
      });

      setLoading(false);

      if (!res.data.success) {
        setError(res.data.error || 'Failed to submit request.');
        return;
      }

      setSuccess('Outpass applied successfully! Your request is pending approval.');
      fetchOutpasses(decoded.id); // Refresh the list

      // Clear form values
      setForm((prev) => ({
        ...prev,
        outDate: '',
        outTime: '',
        inDate: '',
        inTime: '',
        reason: '',
        wardenId: '',
        hostelName: '',
      }));

      // Switch to 'My Requests' tab to show the new pending request
      setActiveTab('requests');

    } catch {
      setError('An unknown server error occurred.');
      setLoading(false);
    }
  };

  const handleCancelRequest = async (outpassId: string) => {
    if (!window.confirm('Are you sure you want to cancel this outpass request?')) {
      return;
    }

    try {
      const res = await api.put(`/outpass/cancel/${outpassId}`);
      if (res.data.success) {
        setSuccess('Request cancelled successfully.');
        // Update the specific outpass in the list
        setOutpasses(prev =>
          prev.map(op =>
            op._id === outpassId ? { ...op, status: 'cancelled' } : op
          )
        );
      } else {
        setError(res.data.error || 'Failed to cancel request.');
      }
    } catch {
      setError('A server error occurred.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  // --- Render Logic ---

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="ml-2 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Filtered lists for tabs
  const activeRequests = outpasses.filter(
    (i) =>
      i.status === 'pending' ||
      i.status === 'advisor-approved' ||
      i.status === 'hod-approved' ||
      i.status === 'approved'
  );
  const requestHistory = outpasses.filter(
    (i) => i.status === 'rejected' || i.status === 'completed' || i.status === 'cancelled'
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">

      {/* --- Dashboard Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800">
          Welcome {form.name}
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
          onClick={() => setActiveTab('apply')}
          className={`w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'apply'
            ? 'bg-white text-blue-600 shadow'
            : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          Apply for Outpass
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'requests'
            ? 'bg-white text-blue-600 shadow'
            : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          My Requests
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'history'
            ? 'bg-white text-blue-600 shadow'
            : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ===== TAB 1: APPLY OUTPASS ===== */}
        {activeTab === 'apply' && (
          <motion.div
            key="apply"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 shadow-xl rounded-xl border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* personal details */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ReadOnlyInput label="Full Name" value={form.name} />
                  <ReadOnlyInput label="Department" value={form.department} />
                  <ReadOnlyInput label="Year" value={form.year} />
                </div>
              </section>

              {/* hostel details */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Hostel Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Semester"
                    name="semester"
                    type="text"
                    value={form.semester}
                    onChange={handleChange}
                    placeholder="e.g., 6th"
                  />
                  <FormInput
                    label="Room Number"
                    name="room"
                    type="text"
                    value={form.room}
                    onChange={handleChange}
                    placeholder="e.g., B-301"
                  />
                  <div className="form-control-wrapper">
                    <label htmlFor="wardenId" className="block text-sm font-medium text-gray-700">
                      Warden Name
                    </label>
                    <select
                      id="wardenId"
                      name="wardenId"
                      value={form.wardenId}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="" disabled>
                        Select a warden
                      </option>
                      {wardens && wardens.map((warden) => (
                        <option key={warden._id} value={warden._id}> 
                          {warden.name} ({warden.hostelName})
                        </option>
                      ))}
                    </select>  
                  </div>
                </div>
              </section>

              {/* outpass details */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Outpass Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Out Date"
                    name="outDate"
                    type="date"
                    value={form.outDate}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="Out Time"
                    name="outTime"
                    type="time"
                    value={form.outTime}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="In Date"
                    name="inDate"
                    type="date"
                    value={form.inDate}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="In Time"
                    name="inTime"
                    type="time"
                    value={form.inTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Explain why you need an outpass (e.g., Going home, local outing, event, etc.)"
                    className="w-full border border-gray-300 rounded-lg p-3 h-28 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </section>

              <AnimatePresence>
                {error && <Notification message={error} type="error" />}
                {success && <Notification message={success} type="success" />}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Outpass Request'
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ===== TAB 2: MY REQUESTS ===== */}
        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isFetching ? (
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : activeRequests.length === 0 ? (
              <EmptyState message="No active requests found." />
            ) : (
              activeRequests.map((item) => (
                <OutpassCard key={item._id} item={item} onCancel={handleCancelRequest} />
              ))
            )}
          </motion.div>
        )}

        {/* ===== TAB 3: HISTORY ===== */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isFetching ? (
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : requestHistory.length === 0 ? (
              <EmptyState message="No history available." />
            ) : (
              requestHistory.map((item) => (
                <OutpassCard key={item._id} item={item} onCancel={handleCancelRequest} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Status Card Component ---
const OutpassCard = ({
  item,
  onCancel,
}: {
  item: Outpass;
  onCancel: (id: string) => void;
}) => {

  // Map DB status → UI display
  const statusMap: any = {
    pending: {
      text: "Awaiting Advisor Approval",
      bg: "bg-yellow-100",
      textC: "text-yellow-700",
      icon: <ClockIcon className="text-yellow-600" />,
    },
    "advisor-approved": {
      text: "Awaiting HOD Approval",
      bg: "bg-blue-100",
      textC: "text-blue-700",
      icon: <ClockIcon className="text-blue-600" />,
    },
    "hod-approved": {
      text: "Awaiting Warden Approval",
      bg: "bg-indigo-100",
      textC: "text-indigo-700",
      icon: <ClockIcon className="text-indigo-600" />,
    },
    approved: {
      text: "Approved (Warden Final Approval)",
      bg: "bg-green-100",
      textC: "text-green-700",
      icon: <CheckIcon className="text-green-600" />,
    },
    rejected: {
      text: "Rejected",
      bg: "bg-red-100",
      textC: "text-red-700",
      icon: <XIcon className="text-red-600" />,
    },
    cancelled: {
      text: "Cancelled",
      bg: "bg-gray-100",
      textC: "text-gray-600",
      icon: <XIcon className="text-gray-500" />,
    },
  };

  const current = statusMap[item.status] || statusMap.pending;

  // Helper to show approval chain
  const approvalStep = (label: string, stage: any) => {
    switch (stage) {
      case "approved":
        return (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckIcon className="text-green-500" /> {label}
          </span>
        );

      case "rejected":
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

  return (
    <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">

      {/* TOP: Reason + Status */}
      <div className="flex justify-between items-start mb-3">
        <p className="text-lg font-semibold text-gray-800">{item.reason}</p>

        <span
          className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${current.bg} ${current.textC}`}
        >
          {current.icon}
          {current.text}
        </span>
      </div>

      {/* MIDDLE: Dates */}
      <div className="flex flex-col sm:flex-row sm:gap-6 text-gray-600 text-sm mb-4">
        <p>
          <span className="font-medium text-gray-800">Out:</span>{" "}
          {item.outDate} at {item.outTime}
        </p>
        <p>
          <span className="font-medium text-gray-800">In:</span>{" "}
          {item.inDate} at {item.inTime}
        </p>
      </div>

      {/* APPROVAL CHAIN */}
      <div className="flex justify-between items-end border-t border-gray-100 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm font-medium text-gray-800">Approval:</span>
          <div className="flex gap-3">
            {approvalStep("Advisor", item.approvalStatus?.advisor)}
            {approvalStep("HOD", item.approvalStatus?.hod)}
            {approvalStep("Warden", item.approvalStatus?.warden)}
          </div>
        </div>

        {/* CANCEL OPTION */}
        {item.status === "pending" && (
          <button
            onClick={() => onCancel(item._id)}
            className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
};
