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

    const recentSets = await prisma.workoutSet.findMany({
      where: { userId: user.id },
      include: {
        exercise: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json(recentSets)
  } catch (error) {
    console.error('Failed to fetch recent sets:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}