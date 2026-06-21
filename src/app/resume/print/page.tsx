"use client";

import React, { useEffect, useState } from 'react';
import { Preview } from '../../../components/resume-studio/preview';
import { ResumeVersion, UserProfile } from '../../../db/mockData';

export default function ResumePrintPage() {
  const [activeResume, setActiveResume] = useState<ResumeVersion | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Expose the render function on the window object
    (window as any).renderResume = (resume: ResumeVersion, profile: UserProfile) => {
      setActiveResume(resume);
      setUserProfile(profile);
      document.title = resume.name || 'Resume';
    };

    // Notify Puppeteer that the window hooks are ready
    (window as any).isPrintReady = true;
  }, []);

  if (!activeResume || !userProfile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-sm text-zinc-400 font-mono animate-pulse">
          Waiting for resume payload...
        </p>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex items-start justify-center">
      {/* Styles to enforce correct dimensions and print layouts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: auto;
          margin: 0mm !important;
        }
        @media print {
          html, body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
          }
          main {
            display: block !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: none !important;
          }
          #resume-print-view {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #resume-print-canvas {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
        }
        
        /* Disable transition animations to speed up capture */
        * {
          transition: none !important;
          animation: none !important;
        }
        
        /* Orphan/widow page break protection */
        .section-card-print {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      ` }} />

      <div id="resume-print-view">
        <Preview 
          activeResume={activeResume} 
          userProfile={userProfile} 
          zoom={1} 
        />
      </div>
    </main>
  );
}
