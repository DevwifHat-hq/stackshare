export function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-primary/30 animate-spin"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-6 w-32 bg-muted rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-6 w-3/4 bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-2/3 bg-muted rounded"></div>
      </div>
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
} 