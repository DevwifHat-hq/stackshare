'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type Metric = {
  id: string
  label: string
  color: string
}

const METRICS: Metric[] = [
  { id: 'mood', label: 'Mood', color: '#2563eb' },
  { id: 'energy', label: 'Energy', color: '#16a34a' },
  { id: 'focus', label: 'Focus', color: '#9333ea' },
  { id: 'stress', label: 'Stress', color: '#dc2626' },
  { id: 'sleep_quality', label: 'Sleep', color: '#2dd4bf' },
]

interface TrendsChartProps {
  data: any[]
}

export default function TrendsChart({ data }: TrendsChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState(
    new Set(['mood', 'energy'])
  )

  const toggleMetric = (metricId: string) => {
    const newSelected = new Set(selectedMetrics)
    if (newSelected.has(metricId)) {
      newSelected.delete(metricId)
    } else {
      newSelected.add(metricId)
    }
    setSelectedMetrics(newSelected)
  }

  // Format data for the chart
  const chartData = data.map((log) => ({
    date: new Date(log.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    ...METRICS.reduce((acc, metric) => ({
      ...acc,
      [metric.id]: log[metric.id],
    }), {}),
  })).reverse()

  return (
    <div className="space-y-4">
      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map((metric) => (
          <button
            key={metric.id}
            onClick={() => toggleMetric(metric.id)}
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors
              ${
                selectedMetrics.has(metric.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            style={{
              backgroundColor: selectedMetrics.has(metric.id)
                ? metric.color
                : undefined,
            }}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            {METRICS.map((metric) => (
              selectedMetrics.has(metric.id) && (
                <Line
                  key={metric.id}
                  type="monotone"
                  dataKey={metric.id}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 