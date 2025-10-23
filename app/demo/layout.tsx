import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import { Header } from '@/components/layout/header'

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  // Redirect to demo login if not authenticated
  if (!user) {
    redirect('/demo-login')
  }

  // Redirect non-demo users to regular assignments
  if (!user.isDemo) {
    redirect('/assignments')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />
      <main className="w-full py-8 px-6">{children}</main>
    </div>
  )
}
