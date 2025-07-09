'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ExerciseCardProps {
  exercise: {
    id: string
    name: string
    category: string
    notes: string | null
    _count?: {
      sets: number
    }
  }
  onDelete: () => void
  onUpdate: (updates: { name?: string; notes?: string }) => void
}

export function ExerciseCard({ exercise, onDelete, onUpdate }: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(exercise.name)
  const [editedNotes, setEditedNotes] = useState(exercise.notes || '')

  const handleSave = () => {
    if (editedName !== exercise.name || editedNotes !== (exercise.notes || '')) {
      onUpdate({
        name: editedName,
        notes: editedNotes || null
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedName(exercise.name)
    setEditedNotes(exercise.notes || '')
    setIsEditing(false)
  }

  const categoryColors: Record<string, string> = {
    CHEST: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    BACK: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    LEGS: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    SHOULDERS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    ARMS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    CORE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    CARDIO: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
    OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="mb-2 font-semibold"
                autoFocus
              />
            ) : (
              <h3 className="font-semibold text-lg">{exercise.name}</h3>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[exercise.category]}`}>
                {exercise.category}
              </span>
              {exercise._count && (
                <span className="text-xs text-muted-foreground">
                  {exercise._count.sets} sets logged
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Add notes..."
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            {exercise.notes && (
              <p className="text-sm text-muted-foreground mb-3">{exercise.notes}</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={onDelete}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}