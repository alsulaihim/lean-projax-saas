import { Metadata } from 'next'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Sign In to Your Account',
  description:
    'Access your Lean Projax account to manage Six Sigma projects, create professional reports, and collaborate with your team. Start creating better processes today.',
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
