import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings } from 'lucide-react'
import { useAuth } from '@/lib/context/auth-context'

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher'
]

export function PreferencesDialog() {
  const { user, preferences, updatePreferences, signIn, signUp } = useAuth()
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleDietaryToggle = (option: string) => {
    if (!preferences) {
      updatePreferences({ dietary: [option] })
      return
    }

    const current = new Set(preferences.dietary || [])
    if (current.has(option)) {
      current.delete(option)
    } else {
      current.add(option)
    }

    updatePreferences({ dietary: Array.from(current) })
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      setIsSignInOpen(false)
      setIsOpen(false)
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
        </DialogHeader>
        {!user ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-500">
              Sign in to save your preferences and favorites
            </p>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-between">
                <Button type="submit">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Already have an account?' : 'Need an account?'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-medium">Dietary Preferences</h4>
              <div className="grid grid-cols-2 gap-4">
                {DIETARY_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Switch
                      id={option}
                      checked={preferences?.dietary?.includes(option) || false}
                      onCheckedChange={() => handleDietaryToggle(option)}
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Display Settings</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={preferences?.dark_mode || false}
                  onCheckedChange={(checked) => updatePreferences({ dark_mode: checked })}
                />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Language</h4>
              <select
                value={preferences?.language || 'en'}
                onChange={(e) => updatePreferences({ language: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 