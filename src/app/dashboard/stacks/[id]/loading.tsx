export default function StackDetailLoading() {
  return (
    <div className="py-10 animate-pulse">
      <div className="mb-8">
        {/* Stack Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-4 w-full max-w-2xl">
            <div className="h-8 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-muted rounded"></div>
            <div className="h-6 w-16 bg-muted rounded"></div>
          </div>
        </div>

        {/* Author Info */}
        <div className="mt-6 flex items-center gap-x-3 border-t pt-6">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-8">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="h-10 w-24 bg-muted rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-1/3 bg-muted rounded"></div>
                <div className="h-6 w-20 bg-muted rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-2/3 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 