import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Get exercises with their most recent set
    const recentSets = await prisma.workoutSet.findMany({
      where: { userId: user.id },
      select: {
        exerciseId: true,
        createdAt: true,
        exercise: {
          select: {
            id: true,
            name: true,
            category: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['exerciseId'],
      take: 10,
    })

    const recentExercises = recentSets.map(set => ({
      ...set.exercise,
      lastUsed: set.createdAt
    }))

    return NextResponse.json(recentExercises)
  } catch (error) {
    console.error('Failed to fetch recent exercises:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}