'use client';

import { motion } from 'framer-motion';
import React from 'react';

// --- Type Definition ---
// This interface defines the shape of your Outpass data
export interface Outpass {
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

// --- Icons (Same as before) ---
// (I'll add just a few for brevity, you'd have all of them)
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
    fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
    </path>
  </svg>
);


// --- Helper Component Props & Type ---
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalStepProps {
  label: string;
  stage: ApprovalStatus;
}

// --- Step Component ---
const ApprovalStep: React.FC<ApprovalStepProps> = ({ label, stage }) => {
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

// --- Card Component Props ---
interface ApprovalOutpassCardProps {
  item: Outpass;
  isSubmitting: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isHistory: boolean;
}

// --- Card Component ---
export const ApprovalOutpassCard: React.FC<ApprovalOutpassCardProps> = ({
  item,
  isSubmitting,
  onApprove,
  onReject,
  isHistory,
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
            {item.studentId.name}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {item.studentId.department} • {item.studentId.year}
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