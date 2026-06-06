import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ success: true });
  
  // Clear cookie by setting maxAge to 0
  response.cookies.set('nexrume-session', '', {
    path: '/',
    maxAge: 0
  });

  return response;
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('nexrume-session', '', {
    path: '/',
    maxAge: 0
  });

  return response;
}
