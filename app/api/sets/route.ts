import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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

    const body = await request.json()
    const { exerciseId, weight, reps } = body

    if (!exerciseId || weight === undefined || reps === undefined) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const set = await prisma.workoutSet.create({
      data: {
        userId: user.id,
        exerciseId,
        weight,
        reps,
      },
      include: {
        exercise: true
      }
    })

    return NextResponse.json(set)
  } catch (error) {
    console.error('Failed to create set:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}