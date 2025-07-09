'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/settings-context'
import { AddExerciseSheet } from '@/components/exercises/add-exercise-sheet'

interface Exercise {
  id: string
  name: string
  category: string
}

interface AddSetSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetAdded: () => void
  userId: string
}

export function AddSetSheet({ open, onOpenChange, onSetAdded, userId }: AddSetSheetProps) {
  const { weightUnit } = useSettings()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddExercise, setShowAddExercise] = useState(false)

  useEffect(() => {
    if (open) {
      fetchExercises()
      fetchRecentExercises()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      resetForm()
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises')
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    }
  }

  const fetchRecentExercises = async () => {
    try {
      const response = await fetch('/api/exercises/recent')
      const data = await response.json()
      setRecentExercises(data.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch recent exercises:', error)
    }
  }

  const handleSubmit = async () => {
    if (!selectedExercise || !weight || !reps) return

    setLoading(true)
    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedExercise.id,
          weight: parseFloat(weight),
          reps: parseInt(reps),
        }),
      })

      if (response.ok) {
        onSetAdded()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to add set:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedExercise(null)
    setWeight('')
    setReps('')
    setSearchTerm('')
  }

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const quickWeights = weightUnit === 'kg' 
    ? [20, 40, 60, 80, 100] 
    : [45, 95, 135, 185, 225]
  const quickReps = [5, 8, 10, 12, 15]

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sheet */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t z-50 transition-transform duration-300 md:hidden",
        open ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {!selectedExercise ? (
          // Exercise Selection
          <div className="h-[80vh] flex flex-col">
            <div className="px-4 pb-4">
              <h2 className="text-lg font-semibold mb-3">Select Exercise</h2>
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* Create New Exercise Button */}
              <Button 
                onClick={() => setShowAddExercise(true)}
                variant="outline"
                className="w-full mb-4"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Exercise
              </Button>

              {/* Recent Exercises */}
              {recentExercises.length > 0 && !searchTerm && (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Recent</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {recentExercises.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => setSelectedExercise(exercise)}
                        className="p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm truncate">{exercise.name}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* All Exercises */}
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                {searchTerm ? 'Search Results' : 'All Exercises'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm truncate">{exercise.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Weight and Reps Entry
          <div className="px-4 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">{selectedExercise.name}</h2>
                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Change exercise
                </button>
              </div>
            </div>

            {/* Weight Section */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Weight ({weightUnit})
              </label>
              <Input
                type="number"
                step="0.5"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-2xl font-bold text-center h-16 mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                {quickWeights.map((w) => (
                  <Button
                    key={w}
                    type="button"
                    size="sm"
                    variant={weight === w.toString() ? "default" : "outline"}
                    onClick={() => setWeight(w.toString())}
                    className="flex-1 h-10"
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reps Section */}
            <div className="mb-8">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Reps
              </label>
              <Input
                type="number"
                placeholder="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="text-2xl font-bold text-center h-16 mb-3"
              />
              <div className="flex gap-2">
                {quickReps.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    size="sm"
                    variant={reps === r.toString() ? "default" : "outline"}
                    onClick={() => setReps(r.toString())}
                    className="flex-1 h-10"
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !weight || !reps}
              className="w-full h-12 text-base font-semibold"
            >
              {loading ? 'Adding...' : `Add ${weight} ${weightUnit} × ${reps} reps`}
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Modal Fallback */}
      <div className={cn(
        "hidden md:block",
        open && "fixed inset-0 z-50 bg-black/80"
      )}>
        {open && (
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white dark:bg-gray-950 p-6 shadow-lg sm:rounded-lg">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Desktop content - similar to mobile but adapted for desktop */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Add Set</h2>
              {/* Use similar content structure as mobile */}
            </div>
          </div>
        )}
      </div>

      {/* Add Exercise Sheet */}
      <AddExerciseSheet
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        onExerciseAdded={(exercise) => {
          if (exercise) {
            setSelectedExercise(exercise)
            fetchExercises()
            fetchRecentExercises()
          }
          setShowAddExercise(false)
        }}
      />
    </>
  )
}