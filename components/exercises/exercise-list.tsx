'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AddExerciseDialog } from './add-exercise-dialog'
import { ExerciseCard } from './exercise-card'
import { CategoryFilter } from './category-filter'

interface Exercise {
  id: string
  name: string
  category: string
  notes: string | null
  _count?: {
    sets: number
  }
}

export function ExerciseList({ userId }: { userId: string }) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [showAddExercise, setShowAddExercise] = useState(false)

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [exercises, searchTerm, selectedCategory])

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises?includeStats=true')
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterExercises = () => {
    let filtered = exercises

    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(ex => ex.category === selectedCategory)
    }

    setFilteredExercises(filtered)
  }

  const handleExerciseAdded = () => {
    fetchExercises()
    setShowAddExercise(false)
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise? This will remove it from all workouts.')) {
      return
    }

    try {
      await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' })
      fetchExercises()
    } catch (error) {
      console.error('Failed to delete exercise:', error)
    }
  }

  const handleUpdateExercise = async (exerciseId: string, updates: Partial<Exercise>) => {
    try {
      await fetch(`/api/exercises/${exerciseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      fetchExercises()
    } catch (error) {
      console.error('Failed to update exercise:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <Button onClick={() => setShowAddExercise(true)}>
          Add Exercise
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{exercises.length}</p>
          <p className="text-sm text-muted-foreground">Total Exercises</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">
            {exercises.filter(ex => ex.category === 'CHEST').length}
          </p>
          <p className="text-sm text-muted-foreground">Chest</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">
            {exercises.filter(ex => ex.category === 'BACK').length}
          </p>
          <p className="text-sm text-muted-foreground">Back</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">
            {exercises.filter(ex => ex.category === 'LEGS').length}
          </p>
          <p className="text-sm text-muted-foreground">Legs</p>
        </Card>
      </div>

      {/* Exercise List */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== 'ALL' 
              ? 'No exercises found matching your filters'
              : 'No exercises yet. Add your first exercise to get started!'}
          </p>
          {exercises.length === 0 && (
            <Button onClick={() => setShowAddExercise(true)}>
              Add Your First Exercise
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onDelete={() => handleDeleteExercise(exercise.id)}
              onUpdate={(updates) => handleUpdateExercise(exercise.id, updates)}
            />
          ))}
        </div>
      )}

      {/* Add Exercise Dialog */}
      <AddExerciseDialog
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        onExerciseAdded={handleExerciseAdded}
      />
    </div>
  )
}