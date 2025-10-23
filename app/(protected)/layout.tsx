import { redirect } from 'next/navigation'
import { getFullUser } from '@/lib/auth-check'
import { Header } from '@/components/layout/header'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getFullUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />
      <main className="w-full py-8 px-6">{children}</main>
    </div>
  )
}