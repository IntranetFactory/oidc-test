import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getOIDCClient } from '@/lib/oidc'

export const Route = createFileRoute('/callback')({
  component: Callback,
})

function Callback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const state = params.get('state')
        const errorParam = params.get('error')

        if (errorParam) {
          throw new Error(`Authentication error: ${errorParam} - ${params.get('error_description') || ''}`)
        }

        if (!code || !state) {
          throw new Error('Missing code or state parameter')
        }

        const client = getOIDCClient()
        await client.handleCallback(code, state)

        // Navigate to userinfo page
        navigate({ to: '/userinfo' })
      } catch (err) {
        console.error('Callback error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-full px-4 py-2 text-sm font-medium text-gray-50 bg-gray-900 rounded-md hover:bg-gray-900/90"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-500">Processing authentication...</p>
      </div>
    </div>
  )
}
