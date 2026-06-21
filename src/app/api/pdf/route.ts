import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
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

    console.log(`[API PDF] Launching Puppeteer browser to print to PDF. Base URL: ${baseUrl}`);

    // Launch headless Chromium
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport dimensions to match typical A4 desktop size
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2.0 // Expose high DPI asset rendering
    });

    // Navigate to the clean print page
    await page.goto(`${baseUrl}/resume/print`, {
      waitUntil: 'networkidle0',
      timeout: 15000
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

    // Generate filename: FirstName_LastName_Resume.pdf
    const firstName = (userProfile.name || 'Resume').split(' ')[0] || 'Resume';
    const lastName = (userProfile.name || '').split(' ').slice(1).join('_') || '';
    const safeLastName = lastName ? `_${lastName}` : '';
    const downloadName = `${firstName}${safeLastName}_Resume.pdf`;

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
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: (err as Error).message },
      { status: 500 }
    );
  }
}
