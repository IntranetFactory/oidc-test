import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { getOIDCClient } from '@/lib/oidc'

// This MUST execute immediately when the file loads
;(() => {
  console.log('!!! CALLBACK.TSX FILE EXECUTING !!!')
  console.log('Current URL:', window.location.href)
  console.log('Current pathname:', window.location.pathname)
  const params = new URLSearchParams(window.location.search)
  console.log('Has error param?', params.get('error'))
  console.log('Has code param?', params.get('code'))
  console.log('Has state param?', params.get('state'))
})()

export const Route = createFileRoute('/callback')({
  component: Callback,
})

console.log('!!! Route object created !!!')

function Callback() {
  console.log('=== Callback component rendering ===')
  console.log('Current URL:', window.location.href)
  
  const navigate = useNavigate()
  
  // Parse URL params immediately on mount (not in useEffect)
  const params = new URLSearchParams(window.location.search)
  const errorParam = params.get('error')
  const errorDescription = params.get('error_description')
  
  console.log('URL params:', {
    error: errorParam,
    error_description: errorDescription,
    code: params.get('code'),
    state: params.get('state')
  })
  
  // Set initial error state from URL params
  const initialError = errorParam 
    ? errorDescription 
      ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      : errorParam
    : null

  console.log('Initial error:', initialError)

  const [error, setError] = useState<string | null>(initialError)
  const [isProcessing, setIsProcessing] = useState(!initialError)
  const hasRun = useRef(false)

  console.log('Component state:', { error, isProcessing })

  useEffect(() => {
    console.log('=== useEffect running ===')
    console.log('Has already run?', hasRun.current)
    
    // Prevent double execution in React StrictMode (development only)
    if (hasRun.current) {
      console.log('useEffect already executed, skipping')
      return
    }
    hasRun.current = true
    
    console.log('Current error state:', error)
    
    // If we already have an error, don't process anything
    if (error) {
      console.error('OIDC callback error detected - STOPPING HERE:', error)
      return
    }

    console.log('No error detected, proceeding with auth flow')

    // Only proceed with auth flow if there's no error
    const handleCallback = async () => {
      try {
        console.log('Getting code and state from params...')
        const code = params.get('code')
        const state = params.get('state')

        if (!code || !state) {
          console.error('Missing code or state!', { code, state })
          throw new Error('Missing code or state parameter')
        }

        console.log('Calling OIDC client handleCallback...')
        const client = getOIDCClient()
        const { returnUrl } = await client.handleCallback(code, state)

        console.log('Auth successful, navigating to:', returnUrl)
        // Navigate to the intended page
        navigate({ to: returnUrl })
      } catch (err) {
        console.error('Callback error in handleCallback:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [navigate, error, params])

  // Show error UI
  if (error) {
    console.log('=== Rendering ERROR UI ===', error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg border border-red-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600">Authentication Failed</h2>
          </div>
          <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-100">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  // Show loading UI
  if (isProcessing) {
    console.log('=== Rendering LOADING UI ===')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Processing authentication...</p>
        </div>
      </div>
    )
  }

  console.log('=== Rendering NULL (should not happen) ===')
  return null
}
