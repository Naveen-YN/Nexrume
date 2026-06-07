import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('nexrume-session');

  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: 'No active session found.' }, { status: 401 });
  }

  try {
    // Verify the token first to ensure it's authentic and unexpired
    jwt.verify(sessionCookie.value, JWT_SECRET);
    
    // Return the JWT string as the pairing token
    return NextResponse.json({ success: true, token: sessionCookie.value });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid or expired session.' }, { status: 401 });
  }
}
