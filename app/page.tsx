import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="font-bold text-xl">Liftiq</div>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
      
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Track Your Workouts
            <br />
            Build Your Strength
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Simple, powerful workout tracking designed for the modern lifter. 
            Log sets, track progress, and achieve your fitness goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="font-semibold">
                Start Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 Liftiq. Built with Next.js and Vercel.
        </div>
      </footer>
    </main>
  )
}