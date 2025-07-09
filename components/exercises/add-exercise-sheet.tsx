'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Category } from '@prisma/client'

const categories = [
  { value: Category.CHEST, label: 'Chest' },
  { value: Category.BACK, label: 'Back' },
  { value: Category.LEGS, label: 'Legs' },
  { value: Category.SHOULDERS, label: 'Shoulders' },
  { value: Category.ARMS, label: 'Arms' },
  { value: Category.CORE, label: 'Core' },
  { value: Category.CARDIO, label: 'Cardio' },
  { value: Category.OTHER, label: 'Other' },
]

interface AddExerciseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExerciseAdded: (exercise?: { id: string; name: string; category: string }) => void
}

export function AddExerciseSheet({ open, onOpenChange, onExerciseAdded }: AddExerciseSheetProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>(Category.CHEST)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      resetForm()
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleSubmit = async () => {
    if (!name) return

    setLoading(true)
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          notes: notes || null,
        }),
      })

      if (response.ok) {
        const exercise = await response.json()
        onExerciseAdded(exercise)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to add exercise:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setCategory(Category.CHEST)
    setNotes('')
  }

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

        <div className="px-4 pb-8">
          <h2 className="text-lg font-semibold mb-4">Add New Exercise</h2>

          {/* Exercise Name */}
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Exercise Name
            </label>
            <Input
              placeholder="e.g., Bench Press"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  type="button"
                  size="sm"
                  variant={category === cat.value ? "default" : "outline"}
                  onClick={() => setCategory(cat.value)}
                  className="h-10"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Notes (optional)
            </label>
            <Input
              placeholder="Any tips or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !name}
              className="flex-1 h-12 text-base font-semibold"
            >
              {loading ? 'Adding...' : 'Add Exercise'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12"
            >
              Cancel
            </Button>
          </div>
        </div>
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
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Add New Exercise</h2>
              
              {/* Exercise Name */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  Exercise Name
                </label>
                <Input
                  placeholder="e.g., Bench Press"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      type="button"
                      size="sm"
                      variant={category === cat.value ? "default" : "outline"}
                      onClick={() => setCategory(cat.value)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Notes (optional)
                </label>
                <Input
                  placeholder="Any tips or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !name}
                >
                  {loading ? 'Adding...' : 'Add Exercise'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}