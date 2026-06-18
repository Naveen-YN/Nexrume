import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../context/store';
import { EditorContent } from './editor-content';
import { EditorCustomize } from './editor-customize';
import { EditorAi } from './editor-ai';
import { AtsScanner } from './ats-scanner';
import { Preview } from './preview';
import { PremiumTools } from './premium-tools';
import { 
  FileText, Sparkles, Compass, Plus, Undo2, Redo2, 
  ZoomIn, ZoomOut, Maximize2, Minimize2, Smartphone, 
  Monitor, RefreshCw, Trash2, Award, Info
} from 'lucide-react';

export const ResumeStudio: React.FC = () => {
  const { 
    resumes, 
    userProfile, 
    addResumeVersion, 
    updateResume, 
    deleteResume 
  } = useAppStore();

  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumeSubTab, setResumeSubTab] = useState<'content' | 'customize' | 'ai-tools'>('content');
  
  // Preview Controls
  const [zoom, setZoom] = useState(0.85);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showAtsDrawer, setShowAtsDrawer] = useState(false);
  
  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'draft'>('saved');

  // Undo/Redo Stack
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const activeResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];

  // Initialize selected resume ID
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Push to history when activeResume changes
  useEffect(() => {
    if (activeResume) {
      // If stack is empty, initialize it
      if (history.length === 0) {
        const initialState = JSON.parse(JSON.stringify(activeResume));
        setHistory([initialState]);
        setHistoryIndex(0);
      } else {
        // Only push if different from current history index state
        const currentStateStr = JSON.stringify(activeResume);
        const historyStateStr = JSON.stringify(history[historyIndex]);
        
        if (currentStateStr !== historyStateStr) {
          // If we had undone actions, truncate history forward
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(JSON.parse(currentStateStr));
          
          // Limit stack to 20 states
          if (newHistory.length > 20) newHistory.shift();
          
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
          
          // Flash saving state
          setSaveStatus('saving');
          const t = setTimeout(() => setSaveStatus('saved'), 600);
          return () => clearTimeout(t);
        }
      }
    }
  }, [activeResume]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const prevResume = history[prevIdx];
      updateResume(activeResume.id, prevResume);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextResume = history[nextIdx];
      updateResume(activeResume.id, nextResume);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <FileText className="w-12 h-12 text-zinc-650 mx-auto mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-white">No resume versions found</h3>
        <p className="text-xs text-zinc-500 mt-1 mb-4">Create a resume version to start customizing.</p>
        <button
          onClick={() => addResumeVersion("Resume V1", "classic")}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white px-4 py-2 rounded-xl transition"
        >
          Create V1 Resume
        </button>
      </div>
    );
  }

  if (!activeResume) return null;

  // Build the public share link URL
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/resume/share/${activeResume.id}` 
    : '';

  return (
    <div className="space-y-4 relative z-10">
      {/* Top version selectors bar */}
      <div className="flex flex-wrap gap-2 items-center bg-zinc-900 border border-zinc-850 p-2 rounded-xl">
        {resumes.map(r => (
          <button
            key={r.id}
            onClick={() => {
              setSelectedResumeId(r.id);
              setHistory([]); // Reset history stack for new version
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedResumeId === r.id ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {r.name} ({r.version})
          </button>
        ))}
        
        <button
          onClick={() => {
            const name = prompt("Enter version name:", `Resume V${resumes.length + 1} - Custom`);
            if (name) {
              addResumeVersion(name, "classic");
            }
          }}
          className="ml-auto flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Version</span>
        </button>
      </div>

      {/* Editor & Preview workspace grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* LEFT WORKSPACE (col-span-7): Form editor and controls */}
        <div className="xl:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-850 shadow-inner">
              {[
                { id: 'content', label: 'Content', icon: FileText },
                { id: 'customize', label: 'Customize', icon: Sparkles },
                { id: 'ai-tools', label: 'AI Helper', icon: Compass }
              ].map(sub => {
                const SubIcon = sub.icon;
                const isSubActive = resumeSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setResumeSubTab(sub.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isSubActive ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <SubIcon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Version rename / delete controls */}
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider block mb-0.5">Rename Version</span>
                <input
                  type="text"
                  value={activeResume.name}
                  onChange={(e) => updateResume(activeResume.id, { name: e.target.value })}
                  className="bg-transparent text-xs font-black text-white outline-none border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 py-0.5 transition w-full sm:w-36"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${activeResume.name}" version? This cannot be undone.`)) {
                    const remaining = resumes.filter(r => r.id !== activeResume.id);
                    deleteResume(activeResume.id);
                    if (remaining.length > 0) {
                      setSelectedResumeId(remaining[0].id);
                    } else {
                      setSelectedResumeId('');
                    }
                  }
                }}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-400 font-bold hover:bg-rose-955/20 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                title="Delete this resume version"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Sub-tab Rendering */}
          {resumeSubTab === 'content' && (
            <EditorContent 
              activeResume={activeResume} 
              userProfile={userProfile} 
              onUpdateResume={(updates) => updateResume(activeResume.id, updates)} 
            />
          )}

          {resumeSubTab === 'customize' && (
            <EditorCustomize 
              activeResume={activeResume} 
              onUpdateResume={(updates) => updateResume(activeResume.id, updates)} 
            />
          )}

          {resumeSubTab === 'ai-tools' && (
            <EditorAi 
              activeResume={activeResume} 
              onUpdateResume={(updates) => updateResume(activeResume.id, updates)} 
            />
          )}
        </div>

        {/* RIGHT WORKSPACE (col-span-5): Document Sheet Live Preview */}
        <div className="xl:col-span-5 space-y-4">
          {/* Floating Controls Toolbar */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl text-xs">
            <div className="flex gap-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 disabled:opacity-30 rounded-lg cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 disabled:opacity-30 rounded-lg cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-6 bg-zinc-850 mx-1" />
              <button
                onClick={() => setZoom(prev => Math.min(1.5, prev + 0.05))}
                className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 rounded-lg cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.05))}
                className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 rounded-lg cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                <RefreshCw className={`w-3 h-3 ${saveStatus === 'saving' ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{saveStatus === 'saving' ? 'Saving...' : 'Auto-Saved'}</span>
              </span>
              
              <button
                onClick={() => setIsMobileView(!isMobileView)}
                className={`p-1.5 border rounded-lg cursor-pointer transition ${
                  isMobileView ? 'bg-indigo-650 border-indigo-600 text-white' : 'bg-zinc-955 border-zinc-850 text-zinc-450 hover:text-zinc-250'
                }`}
                title={isMobileView ? 'Web View' : 'Mobile View'}
              >
                {isMobileView ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setShowAtsDrawer(!showAtsDrawer)}
                className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                  activeResume.atsScore >= 80 
                    ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-450' 
                    : 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>ATS: {activeResume.atsScore}%</span>
              </button>
            </div>
          </div>

          {/* ATS Drawer */}
          {showAtsDrawer && (
            <div className="animate-fade-in">
              <AtsScanner 
                activeResume={activeResume} 
                onUpdateScore={(score) => {
                  // Only update if changed
                  if (activeResume.atsScore !== score) {
                    updateResume(activeResume.id, { atsScore: score });
                  }
                }} 
              />
            </div>
          )}

          {/* Document Preview Canvas Wrapper */}
          <div className={`${isMobileView ? 'max-w-[320px] mx-auto border-8 border-zinc-850 rounded-[32px] overflow-hidden shadow-2xl' : ''}`}>
            <div className="relative group bg-zinc-950 p-2.5 rounded-2xl border border-zinc-850 shadow-inner overflow-x-auto">
              <Preview 
                activeResume={activeResume} 
                userProfile={userProfile} 
                zoom={isMobileView ? 0.45 : zoom} 
              />
            </div>
          </div>

          {/* Premium tools panel */}
          <PremiumTools 
            activeResume={activeResume} 
            onUpdateResume={(updates) => updateResume(activeResume.id, updates)} 
            shareUrl={shareUrl}
          />
        </div>
      </div>
    </div>
  );
};
