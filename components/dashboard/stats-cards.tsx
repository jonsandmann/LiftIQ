import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardsProps {
  stats: {
    todaysVolume: number
    todaysSets: number
    todaysExercises: number
    thisWeekWorkouts: number
    weeklyAverage: number
    totalExercises: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Today's Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todaysVolume.toLocaleString()} lbs</div>
          <p className="text-xs text-muted-foreground">{stats.todaysSets} sets completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisWeekWorkouts} workouts</div>
          <p className="text-xs text-muted-foreground">
            {stats.thisWeekWorkouts === 0 ? 'Get started!' : 'Keep it up!'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.weeklyAverage).toLocaleString()} lbs</div>
          <p className="text-xs text-muted-foreground">Last 4 weeks</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalExercises}</div>
          <p className="text-xs text-muted-foreground">In your library</p>
        </CardContent>
      </Card>
    </div>
  )
}