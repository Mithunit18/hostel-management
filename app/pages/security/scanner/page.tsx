"use client";

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import api from "../../../utils/axiosClient"


// Define a type for the scan result object for clarity
interface ScanResult {
  status: 'success' | 'error';
  message: string;
  type?: 'EXIT' | 'ENTRY';
  student?: string; // Student name if successful
  warning?: string; // Late warning message
}

export default function Scanner() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // State to hold the Html5QrcodeScanner instance for proper cleanup
  const [qrCodeScanner, setQrCodeScanner] = useState<Html5QrcodeScanner | null>(null);


  useEffect(() => {
    // 1. Authorization Check (Client-side token presence)
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'security') {
      router.push('/security/login');
      return;
    }

    // 2. Initialize Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    // Set scanner instance for potential later use, though cleanup is handled below
    setQrCodeScanner(scanner); 

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      // Stop scanning momentarily to process the request
      // We clear the scanner instance but rely on `resetScanner` to re-render it via page reload
      scanner.clear().catch(err => console.error("Error stopping scanner", err));
      setIsScanning(false);
      handleVerify(decodedText);
    }

    function onScanFailure(_error: any) {
      // Ignore scanning errors (camera still searching for QR)
    }

    // 3. Cleanup on unmount
    return () => {
      // Attempt to stop the scanner when the component is unmounted
      scanner.clear().catch(error => console.error("Failed to clear scanner on unmount", error));
    };
  }, [router]); // Only re-run when router changes

  const handleVerify = async (qrToken: string) => {
    try {
      // 4. Send Scanned Token to your Backend's Gate Verification Endpoint
      const res = await api.post(`/gate/verify`, 
        { qrToken },
        // IMPORTANT: Include the dummy token for any backend middleware checks
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } 
      );
      
      setScanResult({ status: 'success', ...res.data });
    
    } catch (err: any) {
      // 5. Handle Backend Errors (Invalid QR, Already Used, etc.)
      setScanResult({ 
        status: 'error', 
        message: err.response?.data?.message || "Verification Failed due to connection or server error.",
        type: undefined,
        student: undefined,
        warning: undefined,
      });
    }
  };

  const resetScanner = () => {
    // Reloading is the most reliable way to re-initialize html5-qrcode's video stream
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0F1F] via-[#0E1A35] to-[#1A73E8]
 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-100 mb-6 border-b-4 border-red-500 pb-2">
        GATE PASS VERIFICATION
      </h1>

      {/* CAMERA AREA */}
      {isScanning && (
        <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-2xl transition-all">
          <div id="reader" className="w-full aspect-square overflow-hidden rounded-lg border-4 border-red-400"></div>
          <p className="text-center text-gray-600 mt-4 text-md font-medium">Position the QR Code within the box.</p>
        </div>
      )}

      {/* RESULT MODAL / CARD */}
      {!isScanning && scanResult && (
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden mt-8 scale-105">
          
          {/* HEADER COLOR BASED ON RESULT */}
          <div className={`p-8 text-center text-white 
            ${scanResult.status === 'error' ? 'bg-red-700' : 
              scanResult.type === 'EXIT' ? 'bg-blue-600' : 
              scanResult.warning ? 'bg-yellow-600' : 'bg-green-600'}`}>
            
            <h2 className="text-4xl font-black uppercase">
              {scanResult.status === 'error' ? 'DENIED' : scanResult.type}
            </h2>
            {/* Show the warning in the header if it's a late entry */}
            {scanResult.warning && scanResult.type === 'ENTRY' && <p className="text-lg mt-1 font-semibold">LATE RETURN ALERT</p>}
          </div>

          <div className="p-6 text-center space-y-4">
            
            {/* MESSAGE */}
            <p className="text-2xl font-bold text-gray-800">
              {scanResult.message}
            </p>

            {/* STUDENT DETAILS (If success) */}
            {scanResult.student && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Student Name</p>
                <p className="text-xl font-extrabold text-gray-900">{scanResult.student}</p>
              </div>
            )}


            <button 
              onClick={resetScanner}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 rounded-xl transition-all shadow-md mt-6"
            >
              Scan Next Student
            </button>
          </div>
        </div>
      )}
    </div>
  );
}