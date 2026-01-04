import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getOIDCClient } from '@/lib/oidc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const client = getOIDCClient()
  const isAuthenticated = client.isAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/userinfo' })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async () => {
    try {
      setError(null)
      const client = getOIDCClient()
      const authUrl = await client.getAuthorizationUrl()
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>OIDC Test Application</CardTitle>
          <CardDescription>
            Test OpenID Connect authentication flow
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
              Click the button below to initiate the OIDC authentication flow.
              You will be redirected to the identity provider to log in.
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
