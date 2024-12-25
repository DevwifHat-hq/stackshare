import { LoadingCard } from "@/components/loading-animation"

export default function StacksLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2"></div>
          <div className="h-5 w-96 bg-muted rounded"></div>
        </div>
        <div className="h-10 w-32 bg-muted rounded"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  )
} 