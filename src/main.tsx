import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

console.log('!!! MAIN.TSX EXECUTING !!!')
console.log('Window location:', window.location.href)

// Import the generated route tree
import { routeTree } from './routeTree.gen'

console.log('!!! Route tree imported !!!')

// Create a new router instance
const router = createRouter({ routeTree })

console.log('!!! Router created !!!')

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

console.log('!!! About to render !!!')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

console.log('!!! Render called !!!')
