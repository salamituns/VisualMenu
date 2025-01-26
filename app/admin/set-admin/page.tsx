'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { setAdminAccess } from '../set-admin'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SetAdminPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [details, setDetails] = useState<any>(null)

  const handleSetAdmin = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)
    setDetails(null)

    try {
      const result = await setAdminAccess('salamituns@gmail.com')
      console.log('Set admin result:', result)
      setSuccess(true)
      setDetails(result.data)
    } catch (err: any) {
      console.error('Error setting admin access:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Set Admin Access</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            Successfully set admin access!
          </AlertDescription>
        </Alert>
      )}

      {details && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="font-semibold mb-2">Current User State:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}

      <Button 
        onClick={handleSetAdmin}
        disabled={loading}
      >
        {loading ? 'Setting admin access...' : 'Set Admin Access'}
      </Button>
    </div>
  )
} 
