import { google } from 'googleapis';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/api/auth/google/callback`;

export function getOAuthClient(tokens?: { access_token?: string; refresh_token?: string; expiry_date?: number }) {
  if (!clientId || !clientSecret) {
    console.warn("Google OAuth credentials missing! Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are defined in your .env file.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId || 'mock-client-id',
    clientSecret || 'mock-client-secret',
    redirectUri
  );

  if (tokens) {
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });
  }

  return oauth2Client;
}
