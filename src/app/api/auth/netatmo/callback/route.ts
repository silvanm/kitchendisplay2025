import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { saveTokens } from '@/lib/netatmoToken';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('netatmo_oauth_state')?.value;

  if (!state || state !== storedState) {
    return NextResponse.json({ error: 'Invalid state parameter. CSRF attack suspected.' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found.' }, { status: 400 });
  }

  const { NETATMO_CLIENT_ID, NETATMO_CLIENT_SECRET } = process.env;
  if (!NETATMO_CLIENT_ID || !NETATMO_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Netatmo client credentials not configured' }, { status: 500 });
  }

  const { protocol, host } = new URL(request.url);
  const redirectUri = `${protocol}//${host}/api/auth/netatmo/callback`;

  try {
    const response = await fetch('https://api.netatmo.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: NETATMO_CLIENT_ID,
        client_secret: NETATMO_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
        scope: 'read_station',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to exchange code for token:', errorText);
      return NextResponse.json({ error: 'Failed to get access token from Netatmo', details: errorText }, { status: 500 });
    }

    const tokens = await response.json();
    await saveTokens(tokens);

    // Redirect user to the homepage after successful authentication
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    // Clean up the state cookie upon successful redirect
    redirectResponse.cookies.delete('netatmo_oauth_state');
    
    return redirectResponse;

  } catch (error) {
    console.error('Error in Netatmo callback:', error);
    return NextResponse.json({ error: 'Internal server error during token exchange' }, { status: 500 });
  }
} 