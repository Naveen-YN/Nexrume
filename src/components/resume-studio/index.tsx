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
  Monitor, RefreshCw, Trash2, Award, Info, Copy, Columns, X, CheckSquare
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

  // Compare Versions modal
  const [isComparing, setIsComparing] = useState(false);
  const [compareTargetId, setCompareTargetId] = useState<string>('');

  // Undo/Redo Stack
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Toast notifications
  const [toastMsg, setToastMsg] = useState('');

  const activeResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];
  const compareTargetResume = resumes.find(r => r.id === compareTargetId);

  // Initialize selected resume ID
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Push to history when activeResume changes
  useEffect(() => {
    if (activeResume) {
      if (history.length === 0) {
        const initialState = JSON.parse(JSON.stringify(activeResume));
        setHistory([initialState]);
        setHistoryIndex(0);
      } else {
        const currentStateStr = JSON.stringify(activeResume);
        const historyStateStr = JSON.stringify(history[historyIndex]);
        
        if (currentStateStr !== historyStateStr) {
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(JSON.parse(currentStateStr));
          
          if (newHistory.length > 30) newHistory.shift();
          
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
          
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
      showToast("Undo applied");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextResume = history[nextIdx];
      updateResume(activeResume.id, nextResume);
      showToast("Redo applied");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Duplicate active resume
  const handleDuplicateResume = () => {
    const prevLength = resumes.length;
    addResumeVersion(`${activeResume.name} Copy`, activeResume.template);
    showToast("Duplicating version...");

    setTimeout(() => {
      const currentStore = useAppStore.getState();
      const latestResume = currentStore.resumes[currentStore.resumes.length - 1];
      if (latestResume && currentStore.resumes.length > prevLength) {
        const { id, version, name, ...restOfFields } = activeResume;
        updateResume(latestResume.id, restOfFields);
        setSelectedResumeId(latestResume.id);
        showToast("Resume version duplicated successfully!");
      }
    }, 150);
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <FileText className="w-12 h-12 text-zinc-650 mx-auto mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-white">No resume versions found</h3>
        <p className="text-xs text-zinc-500 mt-1 mb-4">Create a resume version to start customizing.</p>
        <button
          onClick={() => addResumeVersion("Resume V1", "ats-classic")}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Create V1 Resume
        </button>
      </div>
    );
  }

  if (!activeResume) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/resume/share/${activeResume.id}` 
    : '';

  return (
    <div className="space-y-4 relative z-10 select-none">
      
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[200] bg-indigo-650 text-white font-extrabold text-xs px-4.5 py-3.5 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2 border border-indigo-500">
          <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top version selectors bar */}
      <div className="flex flex-wrap gap-2 items-center bg-zinc-900 border border-zinc-850 p-2 rounded-xl">
        <div className="flex flex-wrap gap-1.5 items-center">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedResumeId(r.id);
                setHistory([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedResumeId === r.id ? 'bg-indigo-650 text-white shadow' : 'text-zinc-500 hover:text-zinc-355'
              }`}
            >
              {r.name} ({r.version})
            </button>
          ))}
        </div>
        
        <div className="ml-auto flex items-center gap-2.5">
          <button
            onClick={handleDuplicateResume}
            className="flex items-center gap-1 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 transition cursor-pointer"
            title="Duplicate current version"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>
          
          <button
            onClick={() => setIsComparing(true)}
            className="flex items-center gap-1 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 transition cursor-pointer"
            title="Compare versions side-by-side"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          <button
            onClick={() => {
              const name = prompt("Enter version name:", `Resume V${resumes.length + 1} - Custom`);
              if (name) {
                addResumeVersion(name, "ats-classic");
                showToast("New version created!");
              }
            }}
            className="flex items-center gap-1 text-[11px] font-black uppercase text-indigo-400 hover:text-indigo-300 px-3 py-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Version</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview workspace grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* LEFT WORKSPACE (col-span-7): Form editor and controls */}
        <div className="xl:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div className="flex items-center gap-1 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-850 shadow-inner w-fit">
              {[
                { id: 'content', label: 'Content System', icon: FileText },
                { id: 'customize', label: 'Customization', icon: Sparkles },
                { id: 'ai-tools', label: 'AI Copilot', icon: Compass }
              ].map(sub => {
                const SubIcon = sub.icon;
                const isSubActive = resumeSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setResumeSubTab(sub.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition whitespace-nowrap cursor-pointer ${
                      isSubActive ? 'bg-indigo-650 text-white shadow' : 'text-zinc-500 hover:text-zinc-350'
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
                <span className="text-[9px] font-black text-zinc-550 uppercase tracking-wider block mb-0.5">Rename version</span>
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
                    showToast("Version deleted");
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
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 disabled:opacity-30 rounded-lg cursor-pointer transition"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 disabled:opacity-30 rounded-lg cursor-pointer transition"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              
              <div className="w-px h-6 bg-zinc-850 mx-1.5" />
              
              {/* Zoom Dropdown Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-550 font-black text-[9px] uppercase tracking-wider">Zoom:</span>
                <select
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded p-1 outline-none font-bold"
                >
                  <option value={0.5}>50%</option>
                  <option value={0.75}>75%</option>
                  <option value={0.85}>85%</option>
                  <option value={1.0}>100%</option>
                  <option value={1.25}>125%</option>
                  <option value={1.5}>150%</option>
                </select>
              </div>
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
                    ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-450' 
                    : 'bg-indigo-955/20 border-indigo-900/30 text-indigo-400'
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
                  if (activeResume.atsScore !== score) {
                    updateResume(activeResume.id, { atsScore: score });
                  }
                }} 
              />
            </div>
          )}

          {/* Document Preview Canvas Wrapper */}
          <div className={`${isMobileView ? 'max-w-[320px] mx-auto border-8 border-zinc-850 rounded-[32px] overflow-hidden shadow-2xl' : ''}`}>
            <div className="relative group bg-zinc-950 p-2.5 rounded-2xl border border-zinc-850 shadow-inner overflow-x-auto min-h-[500px]">
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

      {/* 4. COMPARE VERSIONS MODAL */}
      {isComparing && (
        <div className="fixed inset-0 z-[100] bg-black/90 p-6 flex flex-col space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-black uppercase text-white tracking-widest">Compare Resume Versions</h3>
              <p className="text-[10px] text-zinc-550 mt-0.5">Visually verify and compare formatting changes side-by-side.</p>
            </div>
            <button 
              onClick={() => setIsComparing(false)} 
              className="bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase tracking-wider text-white px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
            {/* Left Version */}
            <div className="flex flex-col space-y-2.5 h-full overflow-y-auto bg-zinc-900 border border-zinc-850 p-4 rounded-xl scrollbar-thin">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Current: {activeResume.name} ({activeResume.version})</span>
              <div className="relative overflow-x-auto p-2 bg-zinc-950 rounded-lg flex-1">
                <Preview activeResume={activeResume} userProfile={userProfile} zoom={0.65} />
              </div>
            </div>
            {/* Right Version Selector */}
            <div className="flex flex-col space-y-2.5 h-full overflow-y-auto bg-zinc-900 border border-zinc-850 p-4 rounded-xl scrollbar-thin">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Compare With:</span>
                <select 
                  value={compareTargetId} 
                  onChange={e => setCompareTargetId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs p-1.5 rounded-lg text-zinc-300 outline-none font-bold"
                >
                  <option value="">Select Version</option>
                  {resumes.filter(r => r.id !== activeResume.id).map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.version})</option>
                  ))}
                </select>
              </div>
              {compareTargetResume ? (
                <div className="relative overflow-x-auto p-2 bg-zinc-950 rounded-lg flex-1">
                  <Preview activeResume={compareTargetResume} userProfile={userProfile} zoom={0.65} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-550 italic text-xs border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
                  Select a target version to compare side-by-side.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ResumeStudio;
