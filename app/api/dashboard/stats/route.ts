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

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's stats
    const todaysSets = await prisma.workoutSet.findMany({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        exercise: true
      }
    })

    const todaysVolume = todaysSets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
    const todaysExercises = new Set(todaysSets.map(s => s.exerciseId)).size

    // Get this week's stats
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
    
    const thisWeekSets = await prisma.workoutSet.findMany({
      where: {
        userId: user.id,
        date: {
          gte: weekStart,
          lt: tomorrow
        }
      }
    })

    // Group by day to count unique workout days
    const workoutDays = new Set(
      thisWeekSets.map(set => set.date.toISOString().split('T')[0])
    ).size

    // Get weekly average (last 4 weeks)
    const fourWeeksAgo = new Date(today)
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const lastFourWeeksSets = await prisma.workoutSet.findMany({
      where: {
        userId: user.id,
        date: {
          gte: fourWeeksAgo,
          lt: today
        }
      }
    })

    const totalVolume = lastFourWeeksSets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
    const weeklyAverage = totalVolume / 4

    // Get total exercises
    const totalExercises = await prisma.exercise.count({
      where: { userId: user.id }
    })

    // Get volume trend (last 30 days)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const volumeTrendSets = await prisma.workoutSet.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
          lt: tomorrow
        }
      },
      orderBy: { date: 'asc' }
    })

    // Group by date for volume trend
    const volumeByDate = volumeTrendSets.reduce((acc, set) => {
      const dateKey = set.date.toISOString().split('T')[0]
      if (!acc[dateKey]) acc[dateKey] = 0
      acc[dateKey] += set.weight * set.reps
      return acc
    }, {} as Record<string, number>)

    const volumeTrend = Object.entries(volumeByDate).map(([date, volume]) => ({
      date,
      volume
    }))

    return NextResponse.json({
      todaysVolume,
      todaysSets: todaysSets.length,
      todaysExercises,
      thisWeekWorkouts: workoutDays,
      weeklyAverage,
      totalExercises,
      volumeTrend
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}