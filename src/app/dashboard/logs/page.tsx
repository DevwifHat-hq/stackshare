import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start, end }
}

export default async function LogsPage() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      redirect('/')
    }

    // Get last 30 days of logs
    const { start, end } = getDateRange(30)
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0])
      .order('date', { ascending: false })

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Daily Logs</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Track your daily metrics and progress
            </p>
          </div>
          <a
            href="/dashboard/logs/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            New Log Entry
          </a>
        </div>

        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow">
          <div className="p-6">
            <div className="flow-root">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs?.length ? (
                  logs.map((log) => (
                    <div key={log.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Mood: {log.mood}/10 • Energy: {log.energy}/10
                          </p>
                        </div>
                        <a
                          href={`/dashboard/logs/${log.date}`}
                          className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-sm text-gray-500 dark:text-gray-400">No logs recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Logs page error:', error)
    redirect('/')
  }
} 