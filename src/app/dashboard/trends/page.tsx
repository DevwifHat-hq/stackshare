import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MetricsCharts } from '@/components/metrics-charts'

export default async function TrendsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch the last 30 days of logs
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  // Process data for charts
  const dailyData = logs?.map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    energy: log.energy_level || 0,
    mood: log.mood_rating || 0,
    focus: log.focus_rating || 0,
    sleep: log.sleep_hours || 0
  })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">
          Your Trends
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Track your progress over time and identify patterns
        </p>
      </div>

      {/* Charts */}
      <MetricsCharts data={dailyData} />
    </div>
  )
} 