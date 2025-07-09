import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onAddSet: () => void
}

export function EmptyState({ onAddSet }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <svg
        className="mx-auto h-12 w-12 text-muted-foreground mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 className="text-lg font-medium mb-2">No sets logged today</h3>
      <p className="text-muted-foreground mb-4">
        Start your workout by adding your first set
      </p>
      <Button onClick={onAddSet} variant="outline">
        Add Your First Set
      </Button>
    </div>
  )
}