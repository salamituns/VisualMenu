'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { executeAnalyticsMigration } from '../execute-sql'

export default function ExecuteMigrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleExecuteMigration = async () => {
    setIsLoading(true)
    try {
      const result = await executeAnalyticsMigration()
      setResult(result)
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'An unknown error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Execute Analytics Migration</h1>
      
      <div className="space-y-4">
        <Button 
          onClick={handleExecuteMigration} 
          disabled={isLoading}
        >
          {isLoading ? 'Executing Migration...' : 'Execute Migration'}
        </Button>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            <div className="flex items-center gap-2">
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
            </div>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
} 