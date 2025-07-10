import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const period = searchParams.get('period') || '4W'
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date
    let groupBy: 'day' | 'week' | 'month' = 'day'
    
    switch (period) {
      case '1W':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 7)
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 7)
        previousEndDate = new Date(startDate)
        groupBy = 'day'
        break
        
      case '4W':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 28)
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 28)
        previousEndDate = new Date(startDate)
        groupBy = 'day'
        break
        
      case '1Y':
        startDate = new Date(today)
        startDate.setFullYear(startDate.getFullYear() - 1)
        previousStartDate = new Date(startDate)
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1)
        previousEndDate = new Date(startDate)
        groupBy = 'month'
        break
        
      case 'MTD':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        previousStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        previousEndDate = new Date(today.getFullYear(), today.getMonth(), 0) // Last day of previous month
        groupBy = 'day'
        break
        
      case 'QTD':
        const currentQuarter = Math.floor(today.getMonth() / 3)
        startDate = new Date(today.getFullYear(), currentQuarter * 3, 1)
        previousStartDate = new Date(today.getFullYear(), (currentQuarter - 1) * 3, 1)
        previousEndDate = new Date(today.getFullYear(), currentQuarter * 3, 0)
        groupBy = 'week'
        break
        
      case 'YTD':
        startDate = new Date(today.getFullYear(), 0, 1)
        previousStartDate = new Date(today.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(today.getFullYear() - 1, 11, 31)
        groupBy = 'month'
        break
        
      case 'ALL':
        // Get the earliest workout date
        const firstWorkout = await prisma.workoutSet.findFirst({
          where: { userId: user.id },
          orderBy: { date: 'asc' }
        })
        startDate = firstWorkout ? new Date(firstWorkout.date) : new Date(today)
        previousStartDate = startDate // No comparison for ALL
        previousEndDate = startDate
        groupBy = 'month'
        break
        
      default:
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 28)
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 28)
        previousEndDate = new Date(startDate)
        groupBy = 'day'
    }
    
    // Get current period data
    const currentSets = await prisma.workoutSet.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
        }
      },
      orderBy: { date: 'asc' }
    })
    
    // Get previous period data (except for ALL)
    let previousSets: any[] = []
    if (period !== 'ALL') {
      previousSets = await prisma.workoutSet.findMany({
        where: {
          userId: user.id,
          date: {
            gte: previousStartDate,
            lt: previousEndDate
          }
        },
        orderBy: { date: 'asc' }
      })
    }
    
    // Group data by the appropriate time period
    const groupData = (sets: any[], groupBy: 'day' | 'week' | 'month') => {
      const grouped = new Map<string, number>()
      
      sets.forEach(set => {
        let key: string
        const date = new Date(set.date)
        
        if (groupBy === 'day') {
          key = date.toISOString().split('T')[0]
        } else if (groupBy === 'week') {
          // Get week start (Sunday)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
        } else {
          // Month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
        }
        
        const volume = set.weight * set.reps
        grouped.set(key, (grouped.get(key) || 0) + volume)
      })
      
      return grouped
    }
    
    const currentGrouped = groupData(currentSets, groupBy)
    const previousGrouped = groupData(previousSets, groupBy)
    
    // Create date range for chart
    const dateRange: Date[] = []
    const current = new Date(startDate)
    
    while (current <= today) {
      dateRange.push(new Date(current))
      
      if (groupBy === 'day') {
        current.setDate(current.getDate() + 1)
      } else if (groupBy === 'week') {
        current.setDate(current.getDate() + 7)
      } else {
        current.setMonth(current.getMonth() + 1)
      }
    }
    
    // Build chart data
    const chartData = dateRange.map(date => {
      let key: string
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]
      } else if (groupBy === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
      }
      
      const volume = currentGrouped.get(key) || 0
      
      // For previous period comparison, we need to calculate the corresponding date
      let previousVolume: number | undefined
      if (period !== 'ALL') {
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const previousDate = new Date(previousStartDate)
        previousDate.setDate(previousDate.getDate() + daysDiff)
        
        let previousKey: string
        if (groupBy === 'day') {
          previousKey = previousDate.toISOString().split('T')[0]
        } else if (groupBy === 'week') {
          const weekStart = new Date(previousDate)
          weekStart.setDate(previousDate.getDate() - previousDate.getDay())
          previousKey = weekStart.toISOString().split('T')[0]
        } else {
          previousKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}-01`
        }
        
        previousVolume = previousGrouped.get(previousKey) || 0
      }
      
      return {
        date: key,
        volume,
        previousVolume
      }
    })
    
    // Calculate totals
    const currentTotal = Array.from(currentGrouped.values()).reduce((sum, v) => sum + v, 0)
    const previousTotal = Array.from(previousGrouped.values()).reduce((sum, v) => sum + v, 0)
    const percentageChange = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : currentTotal > 0 ? 100 : 0
    
    return NextResponse.json({
      currentTotal,
      previousTotal,
      percentageChange,
      data: chartData
    })
  } catch (error) {
    console.error('Failed to fetch volume trend:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volume trend', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}