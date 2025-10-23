'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut } from 'lucide-react'
import { UserRole } from '@prisma/client'

interface HeaderProps {
  user: {
    name: string
    email: string
    role: UserRole
  }
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.BPI_TEAM]: 'BPI Team',
  [UserRole.TEAM_LEAD]: 'Team Lead',
  [UserRole.EXECUTIVE]: 'Executive',
  [UserRole.PROCESS_OWNER]: 'Process Owner',
}

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3071'

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    // Redirect to marketing site after logout
    window.location.href = MARKETING_URL
  }

  return (
    <header className="border-b-2 border-black bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-3xl text-red-700 font-[family-name:var(--font-orbitron)]">Lean Projax</span>
          <nav className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/assignments')}
              className="hover:bg-gray-100"
            >
              Assignments
            </Button>
            {(user.role === UserRole.EXECUTIVE || user.role === UserRole.TEAM_LEAD) && (
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="hover:bg-gray-100"
              >
                Dashboard
              </Button>
            )}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-black hover:bg-gray-100">
              <User className="mr-2 h-4 w-4" />
              {user.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-black">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-700 mt-1">{roleLabels[user.role]}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-300" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}