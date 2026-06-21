import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';

// Enforce max duration for serverless execution on Vercel
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let browser = null;
  try {
    const { activeResume, userProfile } = await request.json();
    
    if (!activeResume || !userProfile) {
      return NextResponse.json(
        { error: 'Missing activeResume or userProfile payload' },
        { status: 400 }
      );
    }

    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    console.log(`[API PDF] Launching Puppeteer core to print PDF. Base URL: ${baseUrl}`);

    // Check if running on Vercel or production serverless env
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || !!process.env.VERCEL;

    if (isProd) {
      console.log(`[API PDF] Production mode detected. Launching @sparticuz/chromium.`);
      
      // sparticuz/chromium configuration
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
        defaultViewport: {
          width: 1200,
          height: 1600,
          deviceScaleFactor: 2
        },
        executablePath: await chromium.executablePath(),
        headless: true
      });
    } else {
      console.log(`[API PDF] Development mode detected. Searching for local Chrome.`);
      
      // Locate local Chrome installation on Windows
      const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
      ];

      let localPath = '';
      for (const p of paths) {
        if (fs.existsSync(p)) {
          localPath = p;
          break;
        }
      }

      if (!localPath) {
        throw new Error("Local Chrome executable not found. Please install Google Chrome or update the path list.");
      }

      console.log(`[API PDF] Launching local Chrome: ${localPath}`);
      browser = await puppeteer.launch({
        executablePath: localPath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: {
          width: 1200,
          height: 1600,
          deviceScaleFactor: 2
        }
      });
    }

    const page = await browser.newPage();

    // Navigate to the print page
    await page.goto(`${baseUrl}/resume/print`, {
      waitUntil: 'networkidle0',
      timeout: 25000 // 25s timeout limit for page load
    });

    // Wait for React to mount and define the render hook
    await page.waitForFunction(() => (window as any).isPrintReady === true, {
      timeout: 5000
    });

    // Push the resume data state and render the component
    await page.evaluate((resume, profile) => {
      if ((window as any).renderResume) {
        (window as any).renderResume(resume, profile);
      }
    }, activeResume, userProfile);

    // Wait for the resume canvas to be rendered in the DOM
    await page.waitForSelector('#resume-print-canvas', {
      timeout: 10000
    });

    // Enforce CSS print media rules
    await page.emulateMediaType('print');

    // Generate filename: FirstName_LastName_Resume.pdf
    const firstName = (userProfile.name || 'Resume').split(' ')[0] || 'Resume';
    const lastName = (userProfile.name || '').split(' ').slice(1).join('_') || '';
    const safeLastName = lastName ? `_${lastName}` : '';
    const downloadName = `${firstName}${safeLastName}_Resume.pdf`;

    // Force document title to match the filename/resume name so the PDF properties metadata gets updated
    await page.evaluate((title) => {
      document.title = title;
    }, downloadName);

    // Print A4 or Letter formats with zero page margins (margin handled by resume padding itself)
    const pdfBuffer = await page.pdf({
      format: activeResume.pageFormat === 'Letter' ? 'letter' : 'a4',
      printBackground: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      },
      preferCSSPageSize: true
    });

    await browser.close();
    browser = null;

    console.log(`[API PDF] Successfully generated PDF: ${downloadName}. Buffer size: ${pdfBuffer.length} bytes.`);

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadName}"`
      }
    });

  } catch (err) {
    console.error("[API PDF] Puppeteer generation failed:", err);
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        // Ignore
      }
    }
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: (err as Error).message },
      { status: 500 }
    );
  }
}
