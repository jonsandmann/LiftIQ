import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { SettingsProvider } from '@/lib/settings-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Liftiq - Workout Tracker',
  description: 'Track your workouts and monitor your progress',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}