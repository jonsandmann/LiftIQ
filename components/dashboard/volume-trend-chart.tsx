'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/settings-context'

type Period = '1W' | '4W' | '1Y' | 'MTD' | 'QTD' | 'YTD' | 'ALL'

interface VolumeData {
  date: string
  volume: number
  previousVolume?: number
}

interface VolumeStats {
  currentTotal: number
  previousTotal: number
  percentageChange: number
  data: VolumeData[]
}

export function VolumeTrendChart({ userId }: { userId: string }) {
  const { weightUnit } = useSettings()
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('4W')
  const [loading, setLoading] = useState(true)
  const [volumeStats, setVolumeStats] = useState<VolumeStats | null>(null)

  const periods: Period[] = ['1W', '4W', '1Y', 'MTD', 'QTD', 'YTD', 'ALL']

  useEffect(() => {
    fetchVolumeData()
  }, [selectedPeriod])

  const fetchVolumeData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/volume-trend?period=${selectedPeriod}`)
      const data = await response.json()
      setVolumeStats(data)
    } catch (error) {
      console.error('Failed to fetch volume data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toFixed(0)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    
    // Different formatting based on period
    if (selectedPeriod === '1W' || selectedPeriod === 'MTD') {
      // Show day for daily views
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (selectedPeriod === '4W') {
      // Show abbreviated date for 4 week view
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
    } else {
      // Show month for monthly views
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Volume Trend</CardTitle>
          
          {/* Period Selector */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                  selectedPeriod === period
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : volumeStats ? (
          <div>
            {/* Volume Stats */}
            <div className="mb-6">
              <div className="flex items-baseline gap-4">
                <div>
                  <p className="text-3xl font-bold">
                    {formatVolume(volumeStats.currentTotal)} {weightUnit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current period
                  </p>
                </div>
                
                {selectedPeriod !== 'ALL' && (
                  <>
                    <div className={cn(
                      "text-sm font-medium",
                      volumeStats.percentageChange > 0 ? "text-green-600" : volumeStats.percentageChange < 0 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {volumeStats.percentageChange > 0 && "+"}
                      {volumeStats.percentageChange.toFixed(1)}%
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {formatVolume(volumeStats.previousTotal)} {weightUnit} previous period
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeStats.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => `${formatVolume(value)}`}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number) => [`${formatVolume(value)} ${weightUnit}`, 'Volume']}
                  labelFormatter={(label) => formatDate(label)}
                />
                
                {/* Current period line */}
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                
                {/* Previous period line (if comparison is shown) */}
                {selectedPeriod !== 'ALL' && (
                  <Line
                    type="monotone"
                    dataKey="previousVolume"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    opacity={0.5}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}