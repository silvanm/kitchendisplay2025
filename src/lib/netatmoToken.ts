import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const TOKEN_DOC_PATH = 'netatmo_tokens/main_account';

interface NetatmoTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Function to save tokens to Firestore
export async function saveTokens(tokens: { access_token: string, refresh_token: string, expires_in: number }) {
  const expires_at = Date.now() + tokens.expires_in * 1000;
  const tokenData: NetatmoTokens = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expires_at,
  };
  await setDoc(doc(db, TOKEN_DOC_PATH), tokenData);
}

// Function to get tokens from Firestore
async function getTokens(): Promise<NetatmoTokens | null> {
  const docSnap = await getDoc(doc(db, TOKEN_DOC_PATH));
  if (docSnap.exists()) {
    return docSnap.data() as NetatmoTokens;
  }
  return null;
}

// Function to refresh the access token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const { NETATMO_CLIENT_ID, NETATMO_CLIENT_SECRET } = process.env;

  if (!NETATMO_CLIENT_ID || !NETATMO_CLIENT_SECRET) {
    console.error('Netatmo client ID or secret not configured for token refresh.');
    return null;
  }
  
  const response = await fetch('https://api.netatmo.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: NETATMO_CLIENT_ID,
      client_secret: NETATMO_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    console.error('Failed to refresh Netatmo token:', await response.text());
    return null;
  }

  const newTokens = await response.json();
  await saveTokens(newTokens);

  return newTokens.access_token;
}

// High-level function to get a valid access token
export async function getAccessToken(): Promise<string | null> {
  const tokens = await getTokens();

  if (!tokens) {
    return null; // No tokens found, user needs to login
  }

  // Check if token is expired or close to expiring (e.g., within 5 minutes)
  if (Date.now() >= tokens.expires_at - 5 * 60 * 1000) {
    console.log('Netatmo token expired or expiring soon, refreshing...');
    return await refreshAccessToken(tokens.refresh_token);
  }

  return tokens.access_token;
} 