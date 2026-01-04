# OIDC Test Application

A React application for quickly testing OpenID Connect (OIDC) authentication flows. Built with React, Vite, TanStack Router, and shadcn/ui with Tailwind CSS v4.

## Features

- 🔐 Complete OIDC authentication flow with PKCE
- 🎨 Modern UI with shadcn/ui components
- 🚀 Fast development with Vite
- 🛣️ Type-safe routing with TanStack Router
- 💅 Styled with Tailwind CSS v4
- 📱 Responsive design

## Prerequisites

- Node.js (v18 or higher recommended)
- An OIDC provider (e.g., Supabase, Auth0, Keycloak, etc.)

## Setup

1. **Clone the repository** (if not already done)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your OIDC provider details:
   ```
   VITE_OIDC_DISCOVERY_URL=https://your-issuer.example.com/.well-known/openid-configuration
   VITE_OIDC_CLIENT_ID=your-client-id
   VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
   ```

   Example with Supabase:
   ```
   VITE_OIDC_DISCOVERY_URL=https://jdnlvjebzatlybaysdcp.supabase.co/auth/v1/.well-known/openid-configuration
   VITE_OIDC_CLIENT_ID=your-supabase-client-id
   VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
   ```

4. **Configure your OIDC provider**
   
   Configure your OIDC provider to allow **public clients** (no client secret) and enable PKCE. Add `http://localhost:5173/callback` as an allowed redirect URI in your OIDC provider's settings.

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. Navigate to `http://localhost:5173`
2. Click "Sign in with OIDC"
3. You'll be redirected to your OIDC provider's login page
4. After successful authentication, you'll be redirected back to the app
5. The user information from the userinfo endpoint will be displayed

## Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui components
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── oidc.ts         # OIDC client implementation
│   └── utils.ts        # Utility functions
├── routes/             # TanStack Router routes
│   ├── __root.tsx      # Root route
│   ├── index.tsx       # Login page
│   ├── callback.tsx    # OAuth callback handler
│   └── userinfo.tsx    # User info display
├── index.css           # Global styles with Tailwind
└── main.tsx           # Application entry point
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe routing
- **shadcn/ui** - UI components
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Lucide React** - Icons

## OIDC Flow

The application implements the OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange):

1. **Authorization Request**: User clicks login, app generates a code verifier and challenge, then redirects to the authorization endpoint with PKCE parameters
2. **Authorization Response**: User authenticates with the provider and is redirected back with an authorization code
3. **Token Exchange**: App exchanges the authorization code + code verifier for access and ID tokens (no client secret needed)
4. **UserInfo Request**: App uses the access token to fetch user information from the userinfo endpoint

**PKCE (RFC 7636)** eliminates the need for client secrets in public clients like Single Page Applications, making it secure to use without a backend proxy.

## Security Considerations

This implementation uses industry-standard PKCE for public clients, which is the recommended OAuth 2.0 flow for SPAs.

**Current security features:**
- ✅ PKCE (Proof Key for Code Exchange) - no client secret needed
- ✅ State parameter for CSRF protection
- ✅ Code verifier/challenge with SHA-256

**For production use, additionally consider:**

1. **Token Storage**: Tokens are stored in `sessionStorage` which is vulnerable to XSS attacks. For production:
   - Use secure, httpOnly cookies
   - Implement proper token storage mechanisms
   - Consider using a token service/backend

2. **HTTPS Required**: Always use HTTPS in production to protect tokens and sensitive data in transit

This application follows OAuth 2.0 security best practices for public clients and is suitable for production use with proper token storage implementation.

## License

MIT
