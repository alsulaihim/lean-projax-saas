import Link from 'next/link'
import { Check } from 'lucide-react'

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3070'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-3xl text-red-700" style={{ fontFamily: 'var(--font-orbitron)' }}>
              Lean Projax
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-black transition">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-black transition">
                Pricing
              </Link>
              <Link
                href={`${PLATFORM_URL}/login`}
                className="text-black hover:text-gray-700 font-medium transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-5xl font-extrabold text-black mb-6">Simple, Transparent Pricing</h1>

          {/* Sumi-e Style Illustration - Between heading and description */}
          <div className="my-12 max-w-6xl mx-auto opacity-30">
            <svg viewBox="0 0 1500 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              {/* Define Phase - Person brainstorming */}
              <g transform="translate(50, 0)">
                <text x="80" y="30" fontSize="16" fill="#4F46E5" fontWeight="bold">DEFINE</text>
                {/* Person sitting, thinking */}
                <ellipse cx="100" cy="80" rx="20" ry="25" fill="#D4A574" opacity="0.6" />
                <path d="M 100 105 Q 85 140, 90 180" stroke="#4A4A4A" strokeWidth="3" fill="none" />
                <path d="M 100 105 Q 115 140, 110 180" stroke="#4A4A4A" strokeWidth="3" fill="none" />
                <path d="M 90 180 L 80 220" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 110 180 L 120 220" stroke="#4A4A4A" strokeWidth="3" />
                {/* Thought bubbles */}
                <circle cx="130" cy="60" r="8" fill="#93C5FD" opacity="0.5" />
                <circle cx="145" cy="50" r="12" fill="#93C5FD" opacity="0.5" />
                {/* Notes/clipboard */}
                <rect x="60" y="140" width="30" height="40" fill="#FEF3C7" opacity="0.6" stroke="#92400E" strokeWidth="1" />
              </g>

              {/* Measure Phase - Person with data/charts */}
              <g transform="translate(350, 0)">
                <text x="80" y="30" fontSize="16" fill="#059669" fontWeight="bold">MEASURE</text>
                {/* Person standing with clipboard */}
                <ellipse cx="100" cy="70" rx="18" ry="22" fill="#D4A574" opacity="0.6" />
                <path d="M 100 92 L 100 150" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 100 110 L 75 130" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 100 110 L 125 140" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 100 150 L 85 200" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 100 150 L 115 200" stroke="#4A4A4A" strokeWidth="3" />
                {/* Chart/graph */}
                <rect x="120" y="100" width="50" height="70" fill="#DBEAFE" opacity="0.6" stroke="#1E40AF" strokeWidth="1.5" />
                <path d="M 130 160 L 140 145 L 150 150 L 160 130" stroke="#1E40AF" strokeWidth="2" fill="none" />
              </g>

              {/* Analyze Phase - Two people discussing */}
              <g transform="translate(650, 0)">
                <text x="80" y="30" fontSize="16" fill="#DC2626" fontWeight="bold">ANALYZE</text>
                {/* Person 1 */}
                <ellipse cx="85" cy="75" rx="18" ry="22" fill="#D4A574" opacity="0.6" />
                <path d="M 85 97 L 85 145" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 85 110 L 105 125" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 85 145 L 75 190" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 85 145 L 95 190" stroke="#4A4A4A" strokeWidth="3" />
                {/* Person 2 */}
                <ellipse cx="130" cy="75" rx="18" ry="22" fill="#D4A574" opacity="0.6" />
                <path d="M 130 97 L 130 145" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 130 110 L 110 125" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 130 145 L 120 190" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 130 145 L 140 190" stroke="#4A4A4A" strokeWidth="3" />
                {/* Fishbone diagram between them */}
                <path d="M 90 160 L 125 160" stroke="#92400E" strokeWidth="2" />
                <path d="M 100 160 L 95 150" stroke="#92400E" strokeWidth="1" />
                <path d="M 110 160 L 105 150" stroke="#92400E" strokeWidth="1" />
              </g>

              {/* Improve Phase - Person implementing */}
              <g transform="translate(950, 0)">
                <text x="75" y="30" fontSize="16" fill="#7C3AED" fontWeight="bold">IMPROVE</text>
                {/* Person working/building */}
                <ellipse cx="95" cy="75" rx="18" ry="22" fill="#D4A574" opacity="0.6" />
                <path d="M 95 97 L 95 145" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 110 L 120 120" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 110 L 70 125" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 145 L 85 190" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 145 L 105 190" stroke="#4A4A4A" strokeWidth="3" />
                {/* Tool/wrench */}
                <rect x="115" y="115" width="25" height="8" fill="#A78BFA" opacity="0.6" rx="2" />
                {/* Improvement arrow */}
                <path d="M 60 170 L 60 140 L 55 145 M 60 140 L 65 145" stroke="#7C3AED" strokeWidth="2" fill="none" />
              </g>

              {/* Control Phase - Person monitoring */}
              <g transform="translate(1250, 0)">
                <text x="75" y="30" fontSize="16" fill="#EA580C" fontWeight="bold">CONTROL</text>
                {/* Person with monitoring dashboard */}
                <ellipse cx="95" cy="75" rx="18" ry="22" fill="#D4A574" opacity="0.6" />
                <path d="M 95 97 L 95 145" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 110 L 70 130" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 110 L 115 125" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 145 L 85 190" stroke="#4A4A4A" strokeWidth="3" />
                <path d="M 95 145 L 105 190" stroke="#4A4A4A" strokeWidth="3" />
                {/* Control panel/dashboard */}
                <rect x="45" y="120" width="35" height="50" fill="#FED7AA" opacity="0.6" stroke="#EA580C" strokeWidth="1.5" rx="3" />
                <line x1="50" y1="135" x2="75" y2="135" stroke="#EA580C" strokeWidth="2" />
                <line x1="50" y1="145" x2="75" y2="145" stroke="#EA580C" strokeWidth="2" />
                <circle cx="58" cy="158" r="3" fill="#EA580C" />
              </g>
            </svg>
          </div>

          <p className="text-xl text-gray-600 mb-6">
            Choose the plan that fits your team&apos;s needs
          </p>
          <Link
            href="#demo"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            Watch a demo
          </Link>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-black mb-2">Free</h3>
                <p className="text-gray-600 mb-4">Our most popular plan for small teams.</p>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold text-black">$0</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-indigo-600 font-semibold text-sm mb-3 uppercase tracking-wide">FEATURES</h4>
                <p className="text-gray-600 mb-4">Everything to get started....</p>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Up to 3 assignments</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">2 team members</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">All Six Sigma tools</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">FMEA with auto-RPN</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Basic reporting</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Email support</span>
                  </div>
                </div>
              </div>

              <Link
                href={`${PLATFORM_URL}/signup`}
                className="block w-full bg-white text-black text-center px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition"
              >
                Get started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm relative">
              <div className="absolute top-6 right-6">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  Popular
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-black mb-2">Pro</h3>
                <p className="text-gray-600 mb-4">Advanced features and reporting.</p>
                <div className="flex items-baseline mb-2">
                  <span className="text-5xl font-bold text-black">$99</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-500 text-sm">or $950/year (save $238)</p>
              </div>

              <div className="mb-6">
                <h4 className="text-indigo-600 font-semibold text-sm mb-3 uppercase tracking-wide">FEATURES</h4>
                <p className="text-gray-600 mb-4">Everything in our free plan plus....</p>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Unlimited assignments</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Up to 50 team members</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">AI-powered analysis</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Professional PDF export</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Priority email support</span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">+ many more...</span>
                  </div>
                </div>
              </div>

              <Link
                href={`${PLATFORM_URL}/signup`}
                className="block w-full bg-black text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">&copy; 2025 Lean Projax. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
