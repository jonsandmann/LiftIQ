import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HistoryPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Workout History</h1>
        <p className="text-muted-foreground">View your past workouts</p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground">Workout history coming soon...</p>
      </div>
    </div>
  )
}