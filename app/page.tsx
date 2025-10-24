import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, BarChart3, FileText, Users, Zap } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // If user is logged in, redirect to their dashboard
  if (session) {
    redirect('/assignments')
  }

  // Otherwise, show the marketing landing page
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-3xl text-red-700 font-[family-name:var(--font-orbitron)]">
                Lean Projax
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-black transition">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-black transition">
                Pricing
              </Link>
              <Link href="/login" className="text-black hover:text-gray-700 font-medium transition">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full mb-6 shadow-sm">
                <span className="text-black text-sm font-medium">
                  Reduce report creation time by 60-70%
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-6">
                Enjoy Building Your
                <br />
                Six Sigma Project Report
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The only platform built specifically for Business Process Improvement teams. Create
                professional Six Sigma reports in minutes, not days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link
                  href="/signup"
                  className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/demo-login"
                  className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold border-2 border-black hover:bg-gray-50 transition"
                >
                  Try Demo
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">14-day free trial. No credit card required.</p>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative lg:scale-110">
              <Image
                src="/images/hero-six-sigma.png"
                alt="Six Sigma team collaboration - Japanese ink style illustration"
                width={1000}
                height={750}
                className="w-full h-auto rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-black mb-3">
              Everything You Need for Six Sigma
            </h2>
            <p className="text-lg text-gray-600">
              All the tools to create professional assignment reports
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-black transition">
              <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">VOC & CTQ Analysis</h3>
              <p className="text-gray-600">
                Capture customer voice and translate into critical-to-quality requirements
                automatically.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-black transition">
              <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">SIPOC & VSM</h3>
              <p className="text-gray-600">
                Visualize process flows with interactive SIPOC diagrams and value stream mapping.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-black transition">
              <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">FMEA & RPN</h3>
              <p className="text-gray-600">
                Automated risk priority number calculation for failure mode analysis.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-black transition">
              <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Fishbone Diagrams</h3>
              <p className="text-gray-600">6M root cause analysis with interactive diagram builder.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-black transition">
              <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Team Collaboration</h3>
              <p className="text-gray-600">Work together with up to 50 team members on Pro plan.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-black transition">
              <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">PDF Export</h3>
              <p className="text-gray-600">
                Generate professional reports with one click. Pro feature.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
