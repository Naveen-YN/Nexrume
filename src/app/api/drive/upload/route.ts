import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getOAuthClient } from '../../../../lib/google';
import { google } from 'googleapis';
import { Readable } from 'stream';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('nexrume-session');
    
    // Fallback if not logged in or no Google token
    let isLoggedInGoogle = false;
    let tokens: any = null;
    
    if (sessionCookie) {
      try {
        const session = jwt.verify(sessionCookie.value, JWT_SECRET) as any;
        tokens = session.tokens;
        if (tokens && tokens.access_token) {
          isLoggedInGoogle = true;
        }
      } catch (err) {}
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'bad_request', message: 'No file uploaded.' }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If connected to Google, upload to Google Drive
    if (isLoggedInGoogle && tokens) {
      const oauth2Client = getOAuthClient(tokens);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const fileMetadata = {
        name: fileName,
        mimeType: fileType || 'application/pdf',
      };
      
      const media = {
        mimeType: fileType || 'application/pdf',
        body: Readable.from(buffer),
      };

      const driveResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, name',
      });

      return NextResponse.json({
        success: true,
        fileId: driveResponse.data.id,
        fileLink: driveResponse.data.webViewLink,
        fileName: driveResponse.data.name || fileName,
        message: 'Successfully uploaded file to Google Drive.'
      });
    } else {
      // Fallback: Simulate Drive upload
      const mockFileId = `drive-mock-${Date.now()}`;
      const mockFileLink = `https://drive.google.com/file/d/${mockFileId}/view?usp=drivesdk`;
      
      return NextResponse.json({
        success: true,
        fileId: mockFileId,
        fileLink: mockFileLink,
        fileName: fileName,
        message: 'Google Account not connected. Simulated upload to Google Drive.'
      });
    }
  } catch (error: any) {
    console.error("Drive upload error:", error);
    return NextResponse.json({
      error: 'upload_failed',
      message: error.message || 'Failed to upload to Google Drive.'
    }, { status: 500 });
  }
}
