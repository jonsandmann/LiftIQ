'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string
  name: string
  category: string
}

interface RecentExercise extends Exercise {
  lastUsed: string
}

interface AddSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetAdded: () => void
  userId: string
}

const categories = [
  { value: 'ALL', label: 'All' },
  { value: 'CHEST', label: 'Chest' },
  { value: 'BACK', label: 'Back' },
  { value: 'LEGS', label: 'Legs' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'ARMS', label: 'Arms' },
  { value: 'CORE', label: 'Core' },
  { value: 'CARDIO', label: 'Cardio' },
]

export function AddSetModal({ open, onOpenChange, onSetAdded, userId }: AddSetModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [recentExercises, setRecentExercises] = useState<RecentExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [step, setStep] = useState<'exercise' | 'details'>('exercise')

  useEffect(() => {
    if (open) {
      fetchExercises()
      fetchRecentExercises()
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
      setRecentExercises(data)
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
        resetForm()
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
    setSelectedCategory('ALL')
    setStep('exercise')
  }

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || ex.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const selectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setStep('details')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[85vh] max-h-[600px] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {step === 'exercise' ? 'Select Exercise' : 'Add Set Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'exercise' ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search and Categories */}
            <div className="px-6 pt-4 pb-3 space-y-3">
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                      selectedCategory === cat.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/70"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Recent Exercises */}
              {recentExercises.length > 0 && !searchTerm && selectedCategory === 'ALL' && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Recent</p>
                  <div className="space-y-1">
                    {recentExercises.slice(0, 3).map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => selectExercise(exercise)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{exercise.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Exercises */}
              <div className="space-y-0.5">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => selectExercise(exercise)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm">{exercise.name}</div>
                  </button>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No exercises found
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Selected Exercise */}
            <div className="mb-6 p-3 rounded-lg bg-muted/50">
              <div className="font-medium text-sm">{selectedExercise?.name}</div>
            </div>

            {/* Weight and Reps */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="text-lg font-semibold text-center h-14"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  placeholder="0"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="text-lg font-semibold text-center h-14"
                />
              </div>
            </div>

            {/* Common weight buttons */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Quick weights:</p>
              <div className="flex gap-2 flex-wrap">
                {[45, 135, 185, 225, 315].map((w) => (
                  <Button
                    key={w}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setWeight(w.toString())}
                    className="h-8"
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('exercise')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !weight || !reps}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Set'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}