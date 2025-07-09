import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ExerciseList } from '@/components/exercises/exercise-list'
import { prisma } from '@/lib/prisma'

export default async function ExercisesPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    redirect('/dashboard')
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
        <p className="text-muted-foreground">Manage your exercise library</p>
      </div>
      
      <ExerciseList userId={user.id} />
    </div>
  )
}