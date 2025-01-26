'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { setupDatabase } from '../setup-db'

export default function SetupDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await setupDatabase()
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Setup Database</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Database setup completed successfully</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSetup} 
        disabled={loading}
      >
        {loading ? 'Setting up...' : 'Setup Database'}
      </Button>
    </div>
  )
} 