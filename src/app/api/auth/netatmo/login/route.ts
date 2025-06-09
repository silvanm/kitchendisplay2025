import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { NETATMO_CLIENT_ID } = process.env;
  
  if (!NETATMO_CLIENT_ID) {
    return NextResponse.json({ error: 'Netatmo Client ID not configured' }, { status: 500 });
  }

  const { protocol, host } = new URL(request.url);
  const redirectUri = `${protocol}//${host}/api/auth/netatmo/callback`;
  
  const state = Math.random().toString(36).substring(7);

  const params = new URLSearchParams({
    client_id: NETATMO_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read_station',
    state: state,
    response_type: 'code',
  });

  const authorizationUrl = `https://api.netatmo.com/oauth2/authorize?${params.toString()}`;

  const response = NextResponse.redirect(authorizationUrl);
  
  // Set the CSRF token in a cookie
  response.cookies.set('netatmo_oauth_state', state, { httpOnly: true, maxAge: 600 });

  return response;
} 