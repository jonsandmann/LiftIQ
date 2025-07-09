import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Verify the set belongs to the user
    const set = await prisma.workoutSet.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!set) {
      return new NextResponse('Set not found', { status: 404 })
    }

    await prisma.workoutSet.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete set:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}