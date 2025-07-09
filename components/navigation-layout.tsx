'use client'

import { useAuth } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  
  // Don't show navigation on auth pages
  if (!isSignedIn || pathname.startsWith('/sign-')) {
    return <>{children}</>
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Navigation */}
      <header className="hidden md:block border-b bg-white dark:bg-gray-950">
        <div className="container flex h-16 items-center justify-between">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-xl">
              Liftiq
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link href="/workout">
                <Button variant="ghost" size="sm">Today's Workout</Button>
              </Link>
              <Link href="/exercises">
                <Button variant="ghost" size="sm">Exercises</Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="sm">History</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">Settings</Button>
              </Link>
            </div>
          </nav>
          <UserButton afterSwitchSessionUrl="/dashboard" />
        </div>
      </header>
      
      {/* Mobile Header */}
      <header className="md:hidden border-b bg-white dark:bg-gray-950">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="font-bold text-xl">
            Liftiq
          </Link>
          <UserButton afterSwitchSessionUrl="/dashboard" />
        </div>
      </header>
      
      <main className="flex-1 bg-muted/10 pb-16 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t">
        <div className="grid grid-cols-4 h-16">
          <Link 
            href="/dashboard" 
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
              pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
          <Link 
            href="/workout" 
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
              pathname === '/workout' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Workout</span>
          </Link>
          <Link 
            href="/exercises" 
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
              pathname === '/exercises' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Exercises</span>
          </Link>
          <Link 
            href="/settings" 
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
              pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}