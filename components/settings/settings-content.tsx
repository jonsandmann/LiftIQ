'use client'

import { useTheme } from 'next-themes'
import { useSettings } from '@/lib/settings-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const { weightUnit, setWeightUnit } = useSettings()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Liftiq looks on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="w-full"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="w-full"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="w-full"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>Choose your preferred measurement units</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Weight Unit</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={weightUnit === 'lbs' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setWeightUnit('lbs')}
                className="w-full"
              >
                Pounds (lbs)
              </Button>
              <Button
                variant={weightUnit === 'kg' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setWeightUnit('kg')}
                className="w-full"
              >
                Kilograms (kg)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your workout data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your workout data as CSV</p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Clear All Data</p>
              <p className="text-sm text-muted-foreground">Permanently delete all your workouts</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}