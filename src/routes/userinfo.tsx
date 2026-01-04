import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getOIDCClient, type UserInfo } from '@/lib/oidc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/userinfo')({
  component: UserInfoPage,
})

function UserInfoPage() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const client = getOIDCClient()
      
      if (!client.isAuthenticated()) {
        navigate({ to: '/' })
        return
      }

      const info = await client.getUserInfo()
      setUserInfo(info)
    } catch (err) {
      console.error('Failed to load user info:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserInfo()
  }, [])

  const handleLogout = () => {
    const client = getOIDCClient()
    client.logout()
    navigate({ to: '/' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading user information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Data retrieved from the userinfo endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          {userInfo && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(userInfo, null, 2)}
                </pre>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={loadUserInfo}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
