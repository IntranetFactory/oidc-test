import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getOIDCClient } from '@/lib/oidc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, LogOut } from 'lucide-react'

export const Route = createFileRoute('/hello')({
  component: HelloPage,
})

function HelloPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const client = getOIDCClient()
    setIsAuthenticated(client.isAuthenticated())
    setLoading(false)
  }, [])

  const handleLogin = async () => {
    try {
      setError(null)
      const client = getOIDCClient()
      const authUrl = await client.getAuthorizationUrl('/hello')
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login')
    }
  }

  const handleLogout = () => {
    const client = getOIDCClient()
    client.logout()
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                This page requires authentication. Click the button below to sign in.
              </p>
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in with OIDC
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hello Page</CardTitle>
          <CardDescription>
            You are authenticated and viewing the hello page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 text-center font-medium">
              🎉 Hello! You're authenticated!
            </p>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
