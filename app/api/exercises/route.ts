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

    const exercises = await prisma.exercise.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      ...(includeStats && {
        include: {
          _count: {
            select: { sets: true }
          }
        }
      })
    })

    // If no exercises exist, create some default ones
    if (exercises.length === 0) {
      const defaultExercises = [
        { name: 'Bench Press', category: Category.CHEST },
        { name: 'Squat', category: Category.LEGS },
        { name: 'Deadlift', category: Category.BACK },
        { name: 'Overhead Press', category: Category.SHOULDERS },
        { name: 'Barbell Row', category: Category.BACK },
        { name: 'Pull-ups', category: Category.BACK },
        { name: 'Dumbbell Curl', category: Category.ARMS },
        { name: 'Tricep Extension', category: Category.ARMS },
      ]

      const createdExercises = await Promise.all(
        defaultExercises.map(ex => 
          prisma.exercise.create({
            data: {
              ...ex,
              userId: user.id
            }
          })
        )
      )

      return NextResponse.json(createdExercises)
    }

    return NextResponse.json(exercises)
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