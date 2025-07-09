'use client'

import { Button } from '@/components/ui/button'

interface SetCardProps {
  set: {
    id: string
    exercise: {
      name: string
      category: string
    }
    reps: number
    weight: number
    createdAt: string
  }
  onDelete: () => void
}

export function SetCard({ set, onDelete }: SetCardProps) {
  const volume = set.weight * set.reps
  const time = new Date(set.createdAt).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  })

  return (
    <div className="glass-card rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-semibold">{set.weight} lbs</span>
          <span className="text-muted-foreground">×</span>
          <span className="text-lg font-semibold">{set.reps} reps</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">{volume} lbs</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{time}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  )
}