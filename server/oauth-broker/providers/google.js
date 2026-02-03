const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

function normalize(value) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getGoogleConfig() {
  const clientId = normalize(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = normalize(process.env.GOOGLE_CLIENT_SECRET);
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is required.');
  }
  return { clientId, clientSecret };
}

export function resolveGoogleScopes(scopes) {
  if (scopes && scopes.length > 0) {
    return scopes;
  }
  return DEFAULT_SCOPES;
}

export function buildGoogleAuthUrl(params) {
  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', params.clientId);
  authUrl.searchParams.set('redirect_uri', params.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', params.scopes.join(' '));
  authUrl.searchParams.set('state', params.state);
  authUrl.searchParams.set('code_challenge', params.codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
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

export async function exchangeGoogleCode(params) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: params.clientId,
      ...(params.clientSecret ? { client_secret: params.clientSecret } : {}),
      code: params.code,
      grant_type: 'authorization_code',
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    }),
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    const detail = data?.error_description || data?.error || response.statusText;
    throw new Error(`Google token exchange failed (${response.status}): ${detail}`);
  }
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  const expiresIn = Number(data.expires_in ?? 3600);

  return {
    accessToken: data.access_token ?? '',
    refreshToken: data.refresh_token ?? '',
    expiresAt: Date.now() + expiresIn * 1000,
    tokenType: data.token_type ?? 'Bearer',
  };
}

export async function refreshGoogleToken(params) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: params.clientId,
      ...(params.clientSecret ? { client_secret: params.clientSecret } : {}),
      refresh_token: params.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    const detail = data?.error_description || data?.error || response.statusText;
    throw new Error(`Google token refresh failed (${response.status}): ${detail}`);
  }
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  const expiresIn = Number(data.expires_in ?? 3600);

  return {
    accessToken: data.access_token ?? '',
    refreshToken: data.refresh_token ?? params.refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
    tokenType: data.token_type ?? 'Bearer',
  };
}
