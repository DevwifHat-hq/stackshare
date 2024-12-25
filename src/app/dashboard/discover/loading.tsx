import { LoadingCard } from "@/components/loading-animation"

export default function DiscoverLoading() {
  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0 space-y-3">
              <div className="h-10 w-64 bg-muted rounded"></div>
              <div className="h-6 w-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 animate-pulse">
        <div className="flex-1 h-10 bg-muted rounded"></div>
        <div className="w-32 h-10 bg-muted rounded"></div>
      </div>

      {/* Grid of Stack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  )
} 