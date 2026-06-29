import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../context/store';
import { EditorContent } from './editor-content';
import { EditorCustomize } from './editor-customize';
import { EditorAi } from './editor-ai';
import { Preview } from './preview';
import { PremiumTools } from './premium-tools';
import { 
  FileText, Sparkles, Compass, Plus, Undo2, Redo2, 
  ZoomIn, ZoomOut, Maximize2, Minimize2, Smartphone, 
  Monitor, RefreshCw, Trash2, Info, Copy, Columns, X, CheckSquare,
  Download, Grid, MoreVertical, Languages, ArrowRight, Pencil, ChevronDown, Check
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
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor'>('dashboard');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [resumeSubTab, setResumeSubTab] = useState<'content' | 'customize' | 'ai-tools'>('content');
  
  // Preview Controls
  const [zoom, setZoom] = useState(0.85);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
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

  // PDF Export States
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const downloadSpecificPdf = async (resumeToDownload: any) => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activeResume: resumeToDownload,
          userProfile
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server-side PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const firstName = (userProfile?.name || 'Resume').split(' ')[0] || 'Resume';
      const lastName = (userProfile?.name || '').split(' ').slice(1).join('_') || '';
      const safeLastName = lastName ? `_${lastName}` : '';
      const downloadName = `${firstName}${safeLastName}_Resume.pdf`;

      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF download failed:", e);
      alert("Failed to render PDF: " + (e as Error).message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    await downloadSpecificPdf(activeResume);
  };

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

  // Duplicate specific resume
  const duplicateSpecificResume = (resumeToDuplicate: any) => {
    const prevLength = resumes.length;
    addResumeVersion(`${resumeToDuplicate.name} Copy`, resumeToDuplicate.template);
    showToast("Duplicating version...");

    setTimeout(() => {
      const currentStore = useAppStore.getState();
      const latestResume = currentStore.resumes[currentStore.resumes.length - 1];
      if (latestResume && currentStore.resumes.length > prevLength) {
        const { id, version, name, ...restOfFields } = resumeToDuplicate;
        updateResume(latestResume.id, restOfFields);
        showToast("Resume version duplicated successfully!");
      }
    }, 150);
  };

  // Duplicate active resume
  const handleDuplicateResume = () => {
    duplicateSpecificResume(activeResume);
  };

  // Create new resume version from dashboard
  const handleCreateNewResume = () => {
    const name = prompt("Enter version name:", `Resume V${resumes.length + 1}`);
    if (!name) return;
    const prevLength = resumes.length;
    addResumeVersion(name, "ats-classic");
    showToast("Creating new resume...");
    setTimeout(() => {
      const currentStore = useAppStore.getState();
      const latestResume = currentStore.resumes[currentStore.resumes.length - 1];
      if (latestResume && currentStore.resumes.length > prevLength) {
        setSelectedResumeId(latestResume.id);
        setViewMode('editor');
        showToast("New resume created!");
      }
    }, 150);
  };

  // Force dashboard mode if no resumes exist
  useEffect(() => {
    if (resumes.length === 0 && viewMode !== 'dashboard') {
      setViewMode('dashboard');
    }
  }, [resumes.length, viewMode]);

  if (!activeResume && resumes.length > 0) return null;

  const shareUrl = typeof window !== 'undefined' && activeResume
    ? `${window.location.origin}/resume/share/${activeResume.id}` 
    : '';

  return (
    <div className="space-y-4 relative z-10 select-none light-studio bg-[#f4f3ef] min-h-[calc(100vh-140px)] rounded-2xl p-6">
      
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[200] bg-indigo-650 text-white font-extrabold text-xs px-4.5 py-3.5 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2 border border-indigo-500">
          <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DASHBOARD VIEW */}
      {viewMode === 'dashboard' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-black text-[#1a1c3d] tracking-tight">My Resumes</h2>
            <p className="text-xs text-zinc-500 font-bold mt-1">
              Your first resume is free forever. Need more than one resume?{' '}
              <span className="underline hover:text-indigo-650 cursor-pointer">Upgrade your plan</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* New Resume Card */}
            <div 
              onClick={handleCreateNewResume}
              className="bg-white border-2 border-dashed border-zinc-200 hover:border-indigo-500 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer transition duration-300 group hover:shadow-md select-none"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-150 group-hover:border-indigo-500/20 group-hover:bg-indigo-50 transition mb-3">
                <Plus className="w-6 h-6 text-zinc-400 group-hover:text-indigo-650 transition" />
              </div>
              <span className="text-zinc-500 group-hover:text-indigo-650 font-black text-xs uppercase tracking-wider">New resume</span>
            </div>

            {/* Resume Cards */}
            {resumes.map(r => {
              const isDropdownOpen = activeDropdownId === r.id;
              return (
                <div 
                  key={r.id}
                  className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col relative group h-80"
                >
                  {/* Top preview section with scaled Preview inside */}
                  <div className="h-64 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center relative overflow-hidden select-none">
                    <div className="absolute w-[800px] h-[1050px] scale-[0.22] origin-top bg-white shadow-md pointer-events-none" style={{ top: '12px' }}>
                      <Preview activeResume={r} userProfile={userProfile} zoom={1} />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#f4f3ef]/90 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button 
                        onClick={() => { 
                          setSelectedResumeId(r.id); 
                          setHistory([]); 
                          setViewMode('editor'); 
                        }} 
                        className="bg-[#1a1c3d] hover:bg-[#282a57] text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition active:scale-[0.98]"
                      >
                        <span>View Resume</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => duplicateSpecificResume(r)} 
                        className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-wider py-2.5 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer transition active:scale-[0.98]"
                      >
                        <Copy className="w-3.5 h-3.5 text-zinc-550" />
                        <span>Duplicate</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom metadata */}
                  <div className="p-3.5 flex items-center justify-between bg-white relative flex-1 min-w-0">
                    <div className="flex-1 min-w-0 pr-6 text-left">
                      <h4 className="font-bold text-zinc-800 text-xs truncate" title={r.name}>{r.name}</h4>
                      <span className="text-[9px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-wider truncate">
                        edited recently • {r.template.replace('ats-', '')}
                      </span>
                    </div>

                    {/* Ellipsis menu */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(isDropdownOpen ? null : r.id);
                        }}
                        className="p-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 text-zinc-500 hover:text-zinc-750 rounded-lg cursor-pointer transition"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {isDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-30 cursor-default" onClick={(e) => { e.stopPropagation(); setActiveDropdownId(null); }} />
                          <div className="absolute right-0 bottom-8 bg-white border border-zinc-200 rounded-xl shadow-xl z-40 p-1.5 w-40 text-[11px] font-bold text-zinc-650 space-y-0.5 text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                const newName = prompt("Rename version:", r.name);
                                if (newName) updateResume(r.id, { name: newName });
                              }}
                              className="w-full px-2.5 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 cursor-pointer transition"
                            >
                              <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Edit title</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                duplicateSpecificResume(r);
                              }}
                              className="w-full px-2.5 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 cursor-pointer transition"
                            >
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                alert("AI translation initiated (Beta)...");
                              }}
                              className="w-full px-2.5 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 cursor-pointer transition"
                            >
                              <Languages className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="flex items-center gap-1">
                                <span>AI translate</span>
                                <span className="text-[7.5px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1 py-0.2 rounded shrink-0">Beta</span>
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                downloadSpecificPdf(r);
                              }}
                              className="w-full px-2.5 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 cursor-pointer transition"
                            >
                              <Download className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Download</span>
                            </button>
                            <div className="h-px bg-zinc-100 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                if (confirm(`Delete "${r.name}" version? This cannot be undone.`)) {
                                  deleteResume(r.id);
                                  if (selectedResumeId === r.id) {
                                    const remaining = resumes.filter(x => x.id !== r.id);
                                    if (remaining.length > 0) setSelectedResumeId(remaining[0].id);
                                  }
                                  showToast("Version deleted");
                                }
                              }}
                              className="w-full px-2.5 py-2 hover:bg-rose-50 text-rose-600 rounded-lg flex items-center gap-2 cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* EDITOR WORKSPACE VIEW */
        <div className="space-y-4 animate-fade-in">
          {/* Editor Header Bar (White styling) */}
          <div className="flex flex-wrap items-center bg-white border border-zinc-200 px-4 py-3.5 rounded-2xl shadow-sm text-zinc-800 gap-3">
            {/* Far Left: Overview */}
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700 text-xs font-black uppercase tracking-wider transition cursor-pointer select-none"
            >
              <Grid className="w-3.5 h-3.5 text-zinc-550" />
              <span>Overview</span>
            </button>

            <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

            {/* Middle: Content, Customize, AI Tools tabs */}
            <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-200 shadow-inner w-fit">
              {[
                { id: 'content', label: 'Content', icon: FileText },
                { id: 'customize', label: 'Customize', icon: Sparkles },
                { id: 'ai-tools', label: 'AI Tools', icon: Compass }
              ].map(sub => {
                const SubIcon = sub.icon;
                const isSubActive = resumeSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setResumeSubTab(sub.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase transition whitespace-nowrap cursor-pointer ${
                      isSubActive ? 'bg-[#1a1c3d] text-white shadow' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <SubIcon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-zinc-200 hidden md:block" />

            {/* Right Side: Version selector, download, ellipsis */}
            <div className="ml-auto flex items-center gap-3">
              {/* Version dropdown */}
              <select
                value={selectedResumeId}
                onChange={e => { setSelectedResumeId(e.target.value); setHistory([]); }}
                className="bg-zinc-50 border border-zinc-200 text-[11px] font-black text-zinc-750 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-indigo-500"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.version})
                  </option>
                ))}
              </select>

              {/* Download PDF button */}
              <button
                onClick={() => downloadSpecificPdf(activeResume)}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1.5 py-2 px-4.5 rounded-xl bg-[#1a1c3d] hover:bg-[#282a57] disabled:bg-zinc-250 text-white text-[11px] font-black uppercase tracking-wider transition cursor-pointer disabled:cursor-not-allowed select-none shadow-sm active:scale-[0.98]"
              >
                {isDownloadingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>

              {/* Ellipsis button */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdownId(activeDropdownId === 'editor-menu' ? null : 'editor-menu')}
                  className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-750 rounded-xl cursor-pointer transition flex items-center justify-center"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeDropdownId === 'editor-menu' && (
                  <>
                    <div className="fixed inset-0 z-30 cursor-default" onClick={() => setActiveDropdownId(null)} />
                    <div className="absolute right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl z-40 p-1.5 w-44 text-[11px] font-bold text-zinc-650 space-y-0.5 text-left">
                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
                          const newName = prompt("Rename version:", activeResume.name);
                          if (newName) updateResume(activeResume.id, { name: newName });
                        }}
                        className="w-full px-2.5 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 cursor-pointer transition"
                      >
                        <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Rename version</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
                          handleDuplicateResume();
                        }}
                        className="w-full px-2.5 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 cursor-pointer transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Duplicate version</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
                          setIsComparing(true);
                        }}
                        className="w-full px-2.5 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 cursor-pointer transition"
                      >
                        <Columns className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Compare versions</span>
                      </button>
                      <div className="h-px bg-zinc-100 my-1" />
                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
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
                        className="w-full px-2.5 py-2 hover:bg-rose-50 text-rose-600 rounded-lg flex items-center gap-2 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete version</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editor & Preview workspace grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            
            {/* LEFT WORKSPACE (col-span-5): Form editor and controls */}
            <div className="xl:col-span-5 bg-white border border-zinc-200 rounded-2xl p-5 space-y-5 overflow-y-auto xl:h-[calc(100vh-185px)] scrollbar-thin shadow-sm text-zinc-800 editor-container-card">
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

            {/* RIGHT WORKSPACE (col-span-7): Document Sheet Live Preview */}
            <div className="xl:col-span-7 space-y-4 overflow-y-auto xl:h-[calc(100vh-185px)] pr-1 scrollbar-thin">
              {/* Floating Controls Toolbar */}
              <div className="flex items-center justify-between bg-white border border-zinc-200 px-4 py-3 rounded-2xl text-xs text-zinc-800 shadow-sm">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-1.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-500 disabled:opacity-30 rounded-lg cursor-pointer transition"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-1.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-500 disabled:opacity-30 rounded-lg cursor-pointer transition"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="w-px h-6 bg-zinc-200 mx-1.5" />
                  
                  {/* Zoom Dropdown Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 font-black text-[9px] uppercase tracking-wider">Zoom:</span>
                    <select
                      value={zoom}
                      onChange={e => setZoom(parseFloat(e.target.value))}
                      className="bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-500 rounded p-1 outline-none font-bold cursor-pointer"
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
                  <button
                    onClick={() => setIsMobileView(!isMobileView)}
                    className={`p-1.5 border rounded-lg cursor-pointer transition ${
                      isMobileView ? 'bg-[#1a1c3d] border-[#1a1c3d] text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                    }`}
                    title={isMobileView ? 'Web View' : 'Mobile View'}
                  >
                    {isMobileView ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Document Preview Canvas Wrapper */}
              <div className={`${isMobileView ? 'max-w-[320px] mx-auto border-8 border-zinc-250 rounded-[32px] overflow-hidden shadow-2xl' : ''}`}>
                <div className="relative group bg-white p-2.5 rounded-2xl border border-zinc-200 shadow-inner overflow-x-auto min-h-[500px]">
                  {activeResume && (
                    <Preview 
                      activeResume={activeResume} 
                      userProfile={userProfile} 
                      zoom={isMobileView ? 0.45 : zoom} 
                    />
                  )}
                </div>
              </div>

              {/* Premium tools panel */}
              {activeResume && (
                <PremiumTools 
                  activeResume={activeResume} 
                  userProfile={userProfile}
                  onUpdateResume={(updates) => updateResume(activeResume.id, updates)} 
                  shareUrl={shareUrl}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPARE VERSIONS MODAL */}
      {isComparing && activeResume && (
        <div className="fixed inset-0 z-[100] bg-[#f4f3ef] p-6 flex flex-col space-y-4 animate-fade-in text-zinc-800">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
            <div>
              <h3 className="text-sm font-black uppercase text-[#1a1c3d] tracking-widest">Compare Resume Versions</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Visually verify and compare formatting changes side-by-side.</p>
            </div>
            <button 
              onClick={() => setIsComparing(false)} 
              className="bg-[#1a1c3d] hover:bg-[#282a57] text-xs font-black uppercase tracking-wider text-white px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
            {/* Left Version */}
            <div className="flex flex-col space-y-2.5 h-full overflow-y-auto bg-white border border-zinc-200 p-4 rounded-xl scrollbar-thin">
              <span className="text-xs font-black uppercase tracking-wider text-[#1a1c3d]">Current: {activeResume.name} ({activeResume.version})</span>
              <div className="relative overflow-x-auto p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex-1">
                <Preview activeResume={activeResume} userProfile={userProfile} zoom={0.65} />
              </div>
            </div>
            {/* Right Version Selector */}
            <div className="flex flex-col space-y-2.5 h-full overflow-y-auto bg-white border border-zinc-200 p-4 rounded-xl scrollbar-thin">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#1a1c3d]">Compare With:</span>
                <select 
                  value={compareTargetId} 
                  onChange={e => setCompareTargetId(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 text-xs p-1.5 rounded-lg text-zinc-700 outline-none font-bold cursor-pointer"
                >
                  <option value="">Select Version</option>
                  {resumes.filter(r => r.id !== activeResume.id).map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.version})</option>
                  ))}
                </select>
              </div>
              {compareTargetResume ? (
                <div className="relative overflow-x-auto p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex-1">
                  <Preview activeResume={compareTargetResume} userProfile={userProfile} zoom={0.65} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
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
