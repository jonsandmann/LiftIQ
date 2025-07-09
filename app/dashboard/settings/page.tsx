import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SettingsContent } from '@/components/settings/settings-content'

export default async function SettingsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>
      
      <SettingsContent />
    </div>
  )
}