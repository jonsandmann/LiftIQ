import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-xl">
              Liftiq
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link href="/dashboard/workout">
                <Button variant="ghost" size="sm">Today's Workout</Button>
              </Link>
              <Link href="/dashboard/exercises">
                <Button variant="ghost" size="sm">Exercises</Button>
              </Link>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm">History</Button>
              </Link>
            </div>
          </nav>
          <UserButton afterSwitchSessionUrl="/dashboard" />
        </div>
      </header>
      <main className="flex-1 bg-muted/10">
        {children}
      </main>
    </div>
  )
}