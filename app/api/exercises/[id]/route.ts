import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { name, notes } = body

    // Verify the exercise belongs to the user
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!exercise) {
      return new NextResponse('Exercise not found', { status: 404 })
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(notes !== undefined && { notes }),
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update exercise:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params
    const { id } = params

    // Verify the exercise belongs to the user
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!exercise) {
      return new NextResponse('Exercise not found', { status: 404 })
    }

    // Delete the exercise (sets will be cascade deleted due to schema)
    await prisma.exercise.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete exercise:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}