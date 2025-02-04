'use client'

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function TestToast() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Test Toast",
          description: "This is a test toast notification",
        })
      }}
    >
      Show Toast
    </Button>
  )
} 