import { NextResponse } from 'next/server';
import { getOAuthClient } from '../../../../../lib/google';

export async function GET() {
  const oauth2Client = getOAuthClient();
  
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
  ];

  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/?error=oauth_init_failed`);
  }
}
