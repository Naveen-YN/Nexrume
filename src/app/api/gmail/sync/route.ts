import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getOAuthClient } from '../../../../lib/google';
import { google } from 'googleapis';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('nexrume-session');

  let userEmail = 'alex.dev@gmail.com';
  let hasSession = false;
  let tokens = null;

  if (sessionCookie) {
    try {
      const session = jwt.verify(sessionCookie.value, JWT_SECRET) as any;
      userEmail = session?.user?.email || 'alex.dev@gmail.com';
      tokens = session?.tokens;
      hasSession = true;
    } catch (e) {
      console.warn("JWT verification failed, using simulated fallback.");
    }
  }

  if (!hasSession || !tokens || !tokens.access_token) {
    const userMailPrefix = userEmail.split('@')[0];
    const emailResults = [
      {
        id: 'sim-msg-google-1',
        account: 'gmail',
        sender: 'sarahjenkins@google.com',
        subject: 'Google Interview Schedule - Senior Software Engineer',
        date: new Date().toISOString().split('T')[0],
        body: `Hi ${userMailPrefix}, we would like to schedule your first 45-minute technical coding round. Please use this Calendar link to select a slot: google-meet.com/sarah-jenkins/slot12`,
        classification: 'Interview',
        isRead: true,
        isSynced: false
      },
      {
        id: 'sim-msg-stripe-2',
        account: 'outlook',
        sender: 'no-reply@stripe.com',
        subject: 'Stripe Assessment Invitation',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        body: `Dear Candidate, thank you for applying to Stripe. You are invited to complete the Staff Backend Assessment on HackerRank within 7 days.`,
        classification: 'OA',
        isRead: true,
        isSynced: false
      },
      {
        id: 'sim-msg-meta-3',
        account: 'gmail',
        sender: 'mvance@meta.com',
        subject: 'Meta AI Developer Role - Offer Package Details',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        body: `Hi ${userMailPrefix}, we are thrilled to extend an offer for the AI Developer position at Meta. Base Salary: $225,000.`,
        classification: 'Offer',
        isRead: false,
        isSynced: false
      },
      {
        id: 'sim-msg-netflix-4',
        account: 'gmail',
        sender: 'dave.miller@netflix.com',
        subject: 'Your application to Netflix',
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        body: `Hi ${userMailPrefix}, thank you for taking the time to complete our assessment. Unfortunately, we will not be moving forward with your candidacy at this time.`,
        classification: 'Rejection',
        isRead: true,
        isSynced: false
      },
      {
        id: 'sim-msg-instahyre-5',
        account: 'gmail',
        sender: 'recruit@instahyre.com',
        subject: 'New Job Match: Principal Frontend Engineer at Vercel',
        date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
        body: `Hey Alex, Vercel is looking for a Principal Engineer with expertise in Next.js app routes, server components, and Tailwind styling.`,
        classification: 'Recruiter Outreach',
        isRead: false,
        isSynced: false
      },
      {
        id: 'sim-msg-finalround-6',
        account: 'gmail',
        sender: 'mike@mail.finalroundai.com',
        subject: 'What 500,000+ Interview Sessions Reveal About 2026 Hiring',
        date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
        body: `Here are the latest insights and interview patterns compiled from 500k+ sessions.`,
        classification: 'Interview',
        isRead: false,
        isSynced: false
      },
      {
        id: 'sim-msg-finalround-7',
        account: 'gmail',
        sender: 'hi@finalroundai.com',
        subject: 'Start Your 30-Day Job Hunt - Upload your resume Now',
        date: new Date(Date.now() - 518400000).toISOString().split('T')[0],
        body: `Kickstart your job search. Upload your resume to begin automatic matching.`,
        classification: 'Recruiter Outreach',
        isRead: false,
        isSynced: false
      },
      {
        id: 'sim-msg-finalround-8',
        account: 'gmail',
        sender: 'hi@finalroundai.com',
        subject: 'It all starts with your resume',
        date: new Date(Date.now() - 604800000).toISOString().split('T')[0],
        body: `Let's optimize your resume layout. Clean design is key to getting interviews.`,
        classification: 'Interview',
        isRead: false,
        isSynced: false
      },
      {
        id: 'sim-msg-pokemongo-9',
        account: 'gmail',
        sender: 'pokemongo@email.nianticlabs.com',
        subject: 'A special offer to kickstart your Pokémon GO adventure!',
        date: new Date(Date.now() - 691200000).toISOString().split('T')[0],
        body: `Claim your items now and start your adventure today.`,
        classification: 'Offer',
        isRead: false,
        isSynced: false
      }
    ];

    return NextResponse.json({
      success: true,
      emails: emailResults,
      message: `No Google OAuth token. Synced ${emailResults.length} simulated career emails for local environment.`
    });
  }

  try {
    const oauth2Client = getOAuthClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 1. List recent messages matching career keywords
    const gmailResponse = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:(application OR interview OR offer OR rejection OR assessment OR hackerrank OR codility OR resume)',
      maxResults: 5
    });

    const messages = gmailResponse.data.messages || [];
    const emailResults: any[] = [];

    // 2. Fetch details for each message
    for (const msg of messages) {
      const msgDetails = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id || ''
      });

      const headers = msgDetails.data.payload?.headers || [];
      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
      const sender = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown Sender';
      const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';
      const snippet = msgDetails.data.snippet || '';

      // 3. Heuristic classification
      let classification = 'Recruiter Outreach';
      const textToAnalyze = `${subject} ${snippet}`.toLowerCase();

      if (textToAnalyze.includes('offer') || textToAnalyze.includes('compensation') || textToAnalyze.includes('salary package')) {
        classification = 'Offer';
      } else if (textToAnalyze.includes('interview') || textToAnalyze.includes('schedule') || textToAnalyze.includes('meet') || textToAnalyze.includes('zoom')) {
        classification = 'Interview';
      } else if (textToAnalyze.includes('assessment') || textToAnalyze.includes('hackerrank') || textToAnalyze.includes('test') || textToAnalyze.includes('codility')) {
        classification = 'OA';
      } else if (textToAnalyze.includes('rejection') || textToAnalyze.includes('unfortunately') || textToAnalyze.includes('not moving forward') || textToAnalyze.includes('thank you for applying but')) {
        classification = 'Rejection';
      } else if (textToAnalyze.includes('applied') || textToAnalyze.includes('application received') || textToAnalyze.includes('received your application')) {
        classification = 'Application';
      }

      let parsedDate = date;
      try {
        parsedDate = new Date(date).toISOString().split('T')[0];
      } catch (e) {}

      emailResults.push({
        id: msg.id,
        account: 'gmail',
        sender,
        subject,
        date: parsedDate,
        body: snippet,
        classification,
        isRead: false,
        isSynced: false
      });
    }

    return NextResponse.json({
      success: true,
      emails: emailResults,
      message: `Retrieved and classified ${emailResults.length} messages from Gmail.`
    });
  } catch (error: any) {
    console.error("Error fetching from Gmail API:", error);
    return NextResponse.json({
      error: 'api_failed',
      message: error.message || 'Failed to sync Gmail.',
    }, { status: 500 });
  }
}
