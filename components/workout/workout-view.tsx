'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddSetDialog } from './add-set-dialog'
import { SetCard } from './set-card'
import { EmptyState } from './empty-state'

interface WorkoutSet {
  id: string
  exerciseId: string
  exercise: {
    id: string
    name: string
    category: string
  }
  reps: number
  weight: number
  createdAt: string
}

interface GroupedSets {
  [exerciseName: string]: WorkoutSet[]
}

export function WorkoutView({ userId }: { userId: string }) {
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSet, setShowAddSet] = useState(false)

  useEffect(() => {
    fetchTodaysSets()
  }, [])

  const fetchTodaysSets = async () => {
    try {
      const response = await fetch('/api/sets/today')
      const data = await response.json()
      setSets(data)
    } catch (error) {
      console.error('Failed to fetch sets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetAdded = () => {
    fetchTodaysSets()
    setShowAddSet(false)
  }

  const handleDeleteSet = async (setId: string) => {
    try {
      await fetch(`/api/sets/${setId}`, { method: 'DELETE' })
      fetchTodaysSets()
    } catch (error) {
      console.error('Failed to delete set:', error)
    }
  }

  const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
  const totalSets = sets.length
  const uniqueExercises = new Set(sets.map(s => s.exerciseId)).size

  const groupedSets = sets.reduce<GroupedSets>((acc, set) => {
    const exerciseName = set.exercise.name
    if (!acc[exerciseName]) {
      acc[exerciseName] = []
    }
    acc[exerciseName].push(set)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Today&apos;s Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{totalVolume.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">lbs volume</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSets}</p>
              <p className="text-sm text-muted-foreground">sets</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueExercises}</p>
              <p className="text-sm text-muted-foreground">exercises</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Set Button */}
      <Button 
        onClick={() => setShowAddSet(true)}
        className="w-full h-12 text-base font-medium"
      >
        Add Set
      </Button>

      {/* Sets List */}
      {sets.length === 0 ? (
        <EmptyState onAddSet={() => setShowAddSet(true)} />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSets).map(([exerciseName, exerciseSets]) => (
            <div key={exerciseName} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {exerciseName} ({exerciseSets.length} sets)
              </h3>
              <div className="space-y-2">
                {exerciseSets.map((set) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    onDelete={() => handleDeleteSet(set.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Set Dialog */}
      <AddSetDialog
        open={showAddSet}
        onOpenChange={setShowAddSet}
        onSetAdded={handleSetAdded}
        userId={userId}
      />
    </div>
  )
}