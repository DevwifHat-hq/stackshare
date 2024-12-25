'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MetricsData {
  date: string
  energy: number
  mood: number
  focus: number
  sleep: number
}

export function MetricsCharts({ data }: { data: MetricsData[] }) {
  return (
    <div className="grid gap-6">
      {/* Energy & Mood Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Energy & Mood Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#8884d8" name="Energy" />
                <Line type="monotone" dataKey="mood" stroke="#82ca9d" name="Mood" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Focus & Sleep Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Focus & Sleep Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="focus" stroke="#ffc658" name="Focus" />
                <Line type="monotone" dataKey="sleep" stroke="#ff7300" name="Sleep (hours)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Averages */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="energy" fill="#8884d8" name="Energy" />
                <Bar dataKey="mood" fill="#82ca9d" name="Mood" />
                <Bar dataKey="focus" fill="#ffc658" name="Focus" />
                <Bar dataKey="sleep" fill="#ff7300" name="Sleep (hours)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 