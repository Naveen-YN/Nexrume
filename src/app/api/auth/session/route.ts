import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('nexrume-session');

  if (!sessionCookie) {
    return NextResponse.json({ isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(sessionCookie.value, JWT_SECRET) as any;
    
    return NextResponse.json({
      isLoggedIn: true,
      user: {
        name: decoded.user.name,
        email: decoded.user.email,
        picture: decoded.user.picture
      },
      googleConnected: !!decoded.tokens?.access_token
    });
  } catch (error) {
    // If JWT is expired or invalid, return unauthenticated status
    return NextResponse.json({ isLoggedIn: false });
  }
}
