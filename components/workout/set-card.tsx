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
    <div className="glass-card rounded-lg p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{set.weight}</span>
          <span className="text-sm text-muted-foreground">lbs</span>
          <span className="text-muted-foreground mx-1">×</span>
          <span className="font-semibold">{set.reps}</span>
          <span className="text-sm text-muted-foreground">reps</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{volume} lbs</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  )
}