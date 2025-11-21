import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import the Inter font
import Link from 'next/link';
import './globals.css';

// Initialize the Inter font
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  // Typo fixed in the title
  title: "Hostel Outpass Management System",
  description: "Role-based outpass approval portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply the Inter font and set up a flex column layout 
        to make the footer stick to the bottom.
      */}
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 flex flex-col min-h-screen`}
      >
        {/* ======== GLOBAL HEADER / NAVBAR ======== */}
        <header className="bg-white w-full shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            {/* Logo / Brand Name */}
            <Link
              href="/"
              className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
            >
              HostelOutpass
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/pages/security/login"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Security
              </Link>
              <Link
                href="/dashboard/student"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
              >
                Create Account
              </Link>
            </nav>

            {/* Mobile Menu Button (Hamburger Icon) */}
            <div className="md:hidden">
              <button className="text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main content area. 
          'flex-grow' makes it expand to fill all available space,
          pushing the footer to the bottom.
        */}
        <main className="grow ">{children}</main>

        {/* ======== GLOBAL FOOTER ======== */}
        {/* This is the same footer from our enhanced homepage */}
        <footer className="bg-slate-900 text-gray-300 pt-16 pb-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Column 1: Brand */}
              <div className="md:col-span-2">
                <h4 className="text-xl font-semibold text-white mb-3">
                  Hostel Outpass Automation
                </h4>
                <p className="text-gray-400 max-w-md">
                  A complete solution to digitalize and simplify hostel leave
                  management with secure approval workflows and real-time
                  tracking.
                </p>
              </div>
              {/* Column 2: Quick Links */}
              <div>
                <h5 className="font-semibold text-white mb-4">Quick Links</h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="hover:text-white transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-white transition">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="hover:text-white transition"
                    >
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-white transition"
                    >
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              {/* Column 3: Legal */}
              <div>
                <h5 className="font-semibold text-white mb-4">Legal</h5>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-white transition"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-white transition"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Copyright Bar */}
            <div className="mt-12 border-t border-gray-700 pt-6 text-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Hostel Outpass Automation • All
                Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}