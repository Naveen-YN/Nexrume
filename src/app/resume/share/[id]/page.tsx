"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Preview } from '../../../../components/resume-studio/preview';
import { ResumeVersion, UserProfile } from '../../../../db/mockData';
import { Printer, Share2, FileText, Check } from 'lucide-react';

export default function ResumeSharePage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [activeResume, setActiveResume] = useState<ResumeVersion | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const persistedState = localStorage.getItem('nexora-store');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        const state = parsed?.state;
        if (state) {
          const found = state.resumes?.find((r: any) => r.id === id);
          if (found) {
            setActiveResume(found);
            setUserProfile(state.userProfile);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load shared resume", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Loading Online Resume...</p>
      </div>
    );
  }

  if (!activeResume || !userProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-3">
        <FileText className="w-12 h-12 text-zinc-700 animate-bounce" />
        <h2 className="text-sm font-black uppercase tracking-wider">Shared Resume Not Found</h2>
        <p className="text-xs text-zinc-550">The link might be invalid or the version was deleted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4 text-zinc-200">
      {/* Top Floating Controls Bar */}
      <div className="max-w-[21cm] mx-auto mb-6 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xl print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-xs font-bold text-white">{activeResume.name}</h3>
            <span className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase">Shared Version Page</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="bg-indigo-650 hover:bg-indigo-550 text-xs font-bold text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Sheet canvas style isolation for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #resume-share-preview, #resume-share-preview * {
            visibility: visible !important;
          }
          #resume-share-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      ` }} />

      {/* Render Canvas */}
      <div id="resume-share-preview" className="bg-zinc-950 max-w-[21cm] mx-auto rounded-2xl overflow-hidden border border-zinc-850 shadow-2xl">
        <Preview 
          activeResume={activeResume} 
          userProfile={userProfile} 
          zoom={1} 
        />
      </div>
    </div>
  );
}
