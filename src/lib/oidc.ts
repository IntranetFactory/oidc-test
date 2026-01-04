export interface OIDCConfig {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  issuer: string
  jwks_uri: string
  response_types_supported: string[]
  subject_types_supported: string[]
  id_token_signing_alg_values_supported: string[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
}

export interface UserInfo {
  sub: string
  [key: string]: unknown
}

/**
 * OIDC Client with PKCE for public clients (SPAs)
 * 
 * This implementation uses PKCE (Proof Key for Code Exchange) which is the
 * recommended secure authentication flow for Single Page Applications.
 * PKCE eliminates the need for client secrets in public clients.
 * 
 * SECURITY NOTE: For production use, consider:
 * - Using secure, httpOnly cookies instead of sessionStorage
 * - Implementing proper CSRF protection
 */
export class OIDCClient {
  private config: OIDCConfig | null = null
  private discoveryUrl: string
  private clientId: string
  private redirectUri: string

  constructor(discoveryUrl: string, clientId: string, redirectUri: string) {
    this.discoveryUrl = discoveryUrl
    this.clientId = clientId
    this.redirectUri = redirectUri
  }

  async loadConfig(): Promise<OIDCConfig> {
    if (this.config) return this.config

    const response = await fetch(this.discoveryUrl)
    if (!response.ok) {
      throw new Error(`Failed to load OIDC configuration: ${response.statusText}`)
    }
    this.config = await response.json()
    return this.config as OIDCConfig
  }

  async getAuthorizationUrl(): Promise<string> {
    const config = await this.loadConfig()
    const state = this.generateState()
    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)

    // Store state and code verifier
    sessionStorage.setItem('oidc_state', state)
    sessionStorage.setItem('oidc_code_verifier', codeVerifier)

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return `${config.authorization_endpoint}?${params.toString()}`
  }

  async handleCallback(code: string, state: string): Promise<TokenResponse> {
    const storedState = sessionStorage.getItem('oidc_state')
    const codeVerifier = sessionStorage.getItem('oidc_code_verifier')

    if (state !== storedState) {
      throw new Error('Invalid state parameter')
    }

    if (!codeVerifier) {
      throw new Error('Code verifier not found')
    }

    const config = await this.loadConfig()

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeVerifier,
    })

    const response = await fetch(config.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`)
    }

    const tokenResponse: TokenResponse = await response.json()

    // Store tokens
    sessionStorage.setItem('access_token', tokenResponse.access_token)
    if (tokenResponse.id_token) {
      sessionStorage.setItem('id_token', tokenResponse.id_token)
    }

    // Clean up temporary storage
    sessionStorage.removeItem('oidc_state')
    sessionStorage.removeItem('oidc_code_verifier')

    return tokenResponse
  }

  async getUserInfo(): Promise<UserInfo> {
    const accessToken = sessionStorage.getItem('access_token')
    if (!accessToken) {
      throw new Error('No access token available')
    }

    const config = await this.loadConfig()

    const response = await fetch(config.userinfo_endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    return await response.json()
  }

  logout() {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('id_token')
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('access_token')
  }

  private generateState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return this.base64UrlEncode(array)
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return this.base64UrlEncode(new Uint8Array(hash))
  }

  private base64UrlEncode(array: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...array))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }
}

// Singleton instance
let oidcClient: OIDCClient | null = null

export function getOIDCClient(): OIDCClient {
  if (!oidcClient) {
    const discoveryUrl = import.meta.env.VITE_OIDC_DISCOVERY_URL
    const clientId = import.meta.env.VITE_OIDC_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI

    if (!discoveryUrl || !clientId || !redirectUri) {
      throw new Error('OIDC configuration is incomplete. Please check your .env file.')
    }

    oidcClient = new OIDCClient(discoveryUrl, clientId, redirectUri)
  }
  return oidcClient
}
