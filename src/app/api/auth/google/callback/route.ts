import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '../../../../../lib/google';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/?error=no_code`);
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile using authenticated Google APIs client
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    // Create session object
    const session = {
      user: {
        name: profile.name || 'Google User',
        email: profile.email || '',
        picture: profile.picture || ''
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    };

    // Sign session token using jwt
    const token = jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });

    const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005');
    const response = NextResponse.redirect(redirectUrl.toString());
    
    // Configure secure session cookie
    response.cookies.set('nexrume-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error exchanging OAuth code:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/?error=oauth_callback_failed`);
  }
}
