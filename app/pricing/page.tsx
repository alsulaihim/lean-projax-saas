import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PricingPage() {
  const session = await getServerSession(authOptions)

  // If user is logged in, redirect to their dashboard
  if (session) {
    redirect('/assignments')
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals learning Six Sigma',
      features: [
        '1 active assignment',
        'All Six Sigma tools',
        'VOC & CTQ Analysis',
        'SIPOC & Value Stream Mapping',
        'Fishbone Diagrams',
        'FMEA with RPN calculation',
        'Basic AI assistance',
        'Community support',
      ],
      cta: 'Get Started Free',
      ctaLink: '/signup',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For professionals managing multiple projects',
      features: [
        'Unlimited assignments',
        'All Six Sigma tools',
        'Advanced AI analysis',
        'PDF report export',
        'Team collaboration (up to 5)',
        'Priority support',
        'Data export & backup',
        'Custom branding',
      ],
      cta: 'Start 14-Day Trial',
      ctaLink: '/signup?plan=pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large teams and organizations',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'SSO & SAML',
        'Custom integrations',
        'Dedicated account manager',
        'On-premise deployment option',
        'SLA guarantee',
        'Custom training',
      ],
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@leanprojax.com',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-3xl text-red-700 font-bold">Lean Projax</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-black transition">
                Features
              </Link>
              <Link href="/pricing" className="text-black font-medium">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Choose the plan that fits your needs. Always know what you'll pay.
          </p>
          <p className="text-lg text-gray-500">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-xl border-2 ${
                  plan.popular ? 'border-black shadow-xl scale-105' : 'border-gray-200'
                } p-8 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-black">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-500 ml-2 text-lg">/ {plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center ${
                    plan.popular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-white text-black border-2 border-black hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately and we'll prorate any charges.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">
                What happens after my trial ends?
              </h3>
              <p className="text-gray-600">
                After your 14-day trial, you'll be automatically moved to the Free plan. You can
                upgrade to Pro at any time to unlock additional features.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">
                Do you offer discounts for students or nonprofits?
              </h3>
              <p className="text-gray-600">
                Yes! We offer special pricing for students, educators, and nonprofit organizations.
                Contact us at support@leanprojax.com for more information.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.
                Enterprise customers can also pay via invoice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of Six Sigma professionals who trust Lean Projax
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo-login"
              className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-white hover:bg-white hover:text-black transition"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
