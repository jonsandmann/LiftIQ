'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AddExerciseSheet } from './add-exercise-sheet'
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
        <Button 
          onClick={() => setShowAddExercise(true)}
          variant="outline"
          size="sm"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </Button>
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
        <div className="space-y-1">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium">{exercise.name}</h3>
                {exercise.notes && (
                  <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    const newName = prompt('Edit exercise name:', exercise.name)
                    if (newName && newName !== exercise.name) {
                      handleUpdateExercise(exercise.id, { name: newName })
                    }
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDeleteExercise(exercise.id)}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Exercise Sheet */}
      <AddExerciseSheet
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        onExerciseAdded={handleExerciseAdded}
      />
    </div>
  )
}