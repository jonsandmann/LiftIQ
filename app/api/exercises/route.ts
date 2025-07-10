import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Category } from '@prisma/client'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    // Get system user for default exercises
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@liftiq.app' }
    })

    // Get both user exercises and system exercises
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(systemUser ? [{ userId: systemUser.id }] : [])
        ]
      },
      orderBy: [
        { userId: 'desc' }, // User exercises first
        { category: 'asc' },
        { name: 'asc' }
      ],
      ...(includeStats && {
        include: {
          _count: {
            select: { sets: true }
          }
        }
      })
    })

    // Add a field to indicate if it's a user exercise
    const exercisesWithSource = exercises.map(exercise => ({
      ...exercise,
      isUserExercise: exercise.userId === user.id
    }))

    return NextResponse.json(exercisesWithSource)
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

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
    const { name, category, notes } = body

    if (!name || !category) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        category,
        notes,
        userId: user.id
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error('Failed to create exercise:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}