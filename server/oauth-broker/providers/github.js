const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const DEFAULT_SCOPES = ['repo', 'read:user', 'read:org'];

function normalize(value) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getGitHubConfig() {
  const clientId = normalize(process.env.GITHUB_CLIENT_ID);
  const clientSecret = normalize(process.env.GITHUB_CLIENT_SECRET);
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is required.');
  }
  return { clientId, clientSecret };
}

export function resolveGitHubScopes(scopes) {
  if (scopes && scopes.length > 0) {
    return scopes;
  }
  return DEFAULT_SCOPES;
}

export function buildGitHubAuthUrl(params) {
  const authUrl = new URL(GITHUB_AUTH_URL);
  authUrl.searchParams.set('client_id', params.clientId);
  authUrl.searchParams.set('redirect_uri', params.redirectUri);
  authUrl.searchParams.set('scope', params.scopes.join(' '));
  authUrl.searchParams.set('state', params.state);
  authUrl.searchParams.set('code_challenge', params.codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  return authUrl.toString();
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function exchangeGitHubCode(params) {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: params.clientId,
      ...(params.clientSecret ? { client_secret: params.clientSecret } : {}),
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    }),
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    const detail = data?.error_description || data?.error || response.statusText;
    throw new Error(`GitHub token exchange failed (${response.status}): ${detail}`);
  }
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return {
    accessToken: data.access_token ?? '',
    refreshToken: data.refresh_token ?? '',
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    tokenType: data.token_type ?? 'bearer',
  };
}
