'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { VolumeTrendChart } from './volume-trend-chart'
import { StatsCards } from './stats-cards'

interface DashboardStats {
  todaysVolume: number
  todaysSets: number
  todaysExercises: number
  thisWeekWorkouts: number
  weeklyAverage: number
  totalExercises: number
  volumeTrend: Array<{ date: string; volume: number }>
}

export function DashboardContent({ userId }: { userId: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Dashboard stats error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      
      <VolumeTrendChart userId={userId} />
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest workout sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>
    </div>
  )
}

function RecentActivity() {
  const [recentSets, setRecentSets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/sets/recent')
      const data = await response.json()
      setRecentSets(data)
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-64" />
  }

  if (recentSets.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-64 overflow-y-auto">
      {recentSets.map((set) => (
        <div key={set.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div>
            <p className="font-medium">{set.exercise.name}</p>
            <p className="text-sm text-muted-foreground">
              {set.weight} lbs × {set.reps} reps
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(set.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}