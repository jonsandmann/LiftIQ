import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { WorkoutView } from '@/components/workout/workout-view'
import { prisma } from '@/lib/prisma'

export default async function WorkoutPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Get or create user in database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    // This should be handled by webhook, but as fallback
    redirect('/dashboard')
  }

  return (
    <div className="container py-8 max-w-4xl">
      <WorkoutView userId={user.id} />
    </div>
  )
}