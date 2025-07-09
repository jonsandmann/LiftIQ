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

    // Get today's start and end times
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const sets = await prisma.workoutSet.findMany({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: [
        { exercise: { name: 'asc' } },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(sets)
  } catch (error) {
    console.error('Failed to fetch sets:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}