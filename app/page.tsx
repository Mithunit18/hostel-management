"use client";
import { useRouter } from "next/navigation"
import Link from "next/link";
// We'll design this to easily accept icons, e.g., from 'lucide-react'
// import { ArrowRight, UserPlus, CheckCircle, Send, FileSignature } from "lucide-react";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <main className="overflow-hidden bg-linear-to-br from-[#0A0F1F] via-[#0E1A35] to-[#1A73E8]
">
        {/* ======== HERO SECTION ======== */}
        <section className="pt-24 pb-20 md:pt-40 md:pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

              {/* Col 1: Text Content */}
              <div className="space-y-8 text-center md:text-left">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  Hostel Outpass. <br />
                  Simplified.
                </h1>

                <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
                  A modern, secure, and transparent workflow for Students, Class
                  Advisors, HODs, and Wardens. Ditch the paperwork.
                </p>

                {/* CTA Buttons with Icon Placeholders */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5 mt-10">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition duration-300 w-full sm:w-auto"
                  >
                    <span>Login to Continue</span>
                    {/* <ArrowRight size={20} /> */}
                    <span aria-hidden="true">&rarr;</span>
                  </Link>

                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 px-8 py-3 border border-gray-300 text-gray-400 text-lg font-medium rounded-lg hover:bg-gray-800 hover:shadow-md transition duration-300 w-full sm:w-auto"
                  >
                    {/* <UserPlus size={20} /> */}
                    <span>Create an Account</span>
                  </Link>
                </div>
              </div>

              {/* Col 2: Visual Placeholder */}
              {/* Col 2: Visual - Mockup of the App */}
              <div className="hidden md:block">

                {/* Outermost container with shadow and rounded corners */}
                <div className="bg-white w-full h-auto rounded-2xl shadow-2xl border border-gray-200 p-4">

                  {/* Mockup Browser Header */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>

                  {/* Mockup App Layout */}
                  <div className="flex gap-3 h-88"> {/* 22rem is approx 352px */}

                    {/* Mockup Sidebar */}
                    <div className="w-1/4 bg-slate-800 rounded-lg p-3 space-y-3 opacity-90">
                      <div className="text-sm font-medium text-slate-400">Menu</div>
                      <div className="h-3 w-3/4 bg-slate-600 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-600 rounded opacity-50"></div>
                      <div className="h-3 w-5/6 bg-slate-600 rounded"></div>
                      <div className="h-3 w-3/4 bg-slate-600 rounded opacity-50"></div>
                    </div>

                    {/* Mockup Main Content */}
                    <div className="w-3/4 bg-gray-100 rounded-lg p-4 space-y-4">
                      {/* Mockup Title */}
                      <div className="h-6 w-1/2 bg-gray-300 rounded"></div>

                      {/* Mockup Widgets/Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-20 bg-white rounded-lg shadow border border-gray-200 p-3">
                          <div className="h-3 w-1/2 bg-blue-200 rounded"></div>
                          <div className="h-6 w-1/3 bg-gray-300 rounded mt-2"></div>
                        </div>
                        <div className="h-20 bg-white rounded-lg shadow border border-gray-200 p-3">
                          <div className="h-3 w-1/2 bg-green-200 rounded"></div>
                          <div className="h-6 w-1/3 bg-gray-300 rounded mt-2"></div>
                        </div>
                      </div>

                      {/* Mockup Table/List */}
                      <div className="h-32 bg-white rounded-lg shadow border border-gray-200 p-3 space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded opacity-70"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded opacity-70"></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* NEW CONTAINER FOR THE SECURITY BUTTON */}
            <div className="flex justify-center mt-4 md:mt-24">
              <button
                type="button"
                onClick={() => router.push('/pages/security/login')}
                className=" bg-blue-600  py-3 w-full md:w-auto px-16 rounded-lg font-semibold text-lg text-white 
        shadow-md hover:shadow-xl hover:opacity-95 
        transition-all duration-300"
              >
                Security Login
              </button>
            </div>
          </div>
        </section>

        {/* ======== "HOW IT WORKS" SECTION ======== */}
        <section className="bg-gray-200 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                A Simple, 3-Step Process
              </h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                We've automated the entire workflow to make it fast and foolproof.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Step 1 */}
              <div className="relative bg-gray-50 p-10 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
                <div className="text-7xl font-extrabold text-gray-200 absolute top-4 right-8 z-0">01</div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-3 relative z-10">
                  Submit Request
                </h3>
                <p className="text-gray-600 leading-relaxed relative z-10">
                  Students fill out a simple digital form from their phone or
                  laptop. No more paper, no more lines.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-gray-50 p-10 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
                <div className="text-7xl font-extrabold text-gray-200 absolute top-4 right-8 z-0">02</div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-3 relative z-10">
                  Multi-Level Approval
                </h3>
                <p className="text-gray-600 leading-relaxed relative z-10">
                  The request is automatically routed to the Class Advisor, HOD,
                  and Warden for approval—all in one place.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-gray-50 p-10 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
                <div className="text-7xl font-extrabold text-gray-200 absolute top-4 right-8 z-0">03</div>
                {/* <CheckCircle className="h-10 w-10 text-blue-600 mb-4" /> */}
                <h3 className="text-2xl font-semibold text-gray-800 mb-3 relative z-10">
                  Track & Go
                </h3>
                <p className="text-gray-600 leading-relaxed relative z-10">
                  Students get real-time status updates. Once approved, a
                  digital outpass is generated for security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======== FINAL CTA SECTION ======== */}
        <section className="bg-gray-50">
          <div className="max-w-4xl mx-auto py-20 px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Ready to streamline your hostel?
            </h2>
            <p className="text-lg text-gray-700 mt-4 mb-8">
              Join leading institutions in digitizing your outpass workflow.
              Create an account or log in to get started.
            </p>
            <Link
              href="/register"
              className="px-10 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* ======== FOOTER ======== */}
      {/* Your existing footer was great, so it's unchanged. */}

    </>
  );
}