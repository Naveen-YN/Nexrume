import React, { useState, useRef } from 'react';
import { ResumeVersion } from '../../db/mockData';
import { 
  Download, FileSpreadsheet, Share2, Clipboard, 
  Check, QrCode, FileText, Code, Palette, PenTool, Sparkles 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PremiumToolsProps {
  activeResume: ResumeVersion;
  onUpdateResume: (updates: Partial<ResumeVersion>) => void;
  shareUrl: string;
}

export const PremiumTools: React.FC<PremiumToolsProps> = ({ 
  activeResume, 
  onUpdateResume,
  shareUrl
}) => {
  const [activeTool, setActiveTool] = useState<'downloads' | 'letter' | 'portfolio' | 'signature' | 'qr'>('downloads');
  const [copied, setCopied] = useState(false);

  // Cover Letter Builder States
  const [clCompany, setClCompany] = useState('');
  const [clRole, setClRole] = useState('');
  const [clRecipient, setClRecipient] = useState('Hiring Team');
  const [clGenerated, setClGenerated] = useState('');

  // Signature Drawing Pad States
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Copy share URL
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. PDF Export (Client-side via html2canvas & jsPDF)
  const triggerPDFDownload = async () => {
    const element = document.getElementById('resume-print-canvas');
    if (!element) return;

    // Save the current zoom level of the canvas
    const oldZoom = element.style.zoom;
    
    // Reset zoom temporarily to 1 for a high-definition, unscaled capture
    element.style.zoom = '1';

    try {
      // Allow a brief delay for the browser to repaint the layout at 100% scale
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        scale: 2.0, // High quality scale
        useCORS: true,
        allowTaint: false, // Prevents security errors on export
        backgroundColor: '#ffffff',
        logging: true
      });

      // Restore the original zoom style immediately
      element.style.zoom = oldZoom;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const isLetter = activeResume.pageFormat === 'Letter';
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: isLetter ? 'letter' : 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if it exceeds one page size (with 1.5mm tolerance threshold to avoid empty trailing page)
      while (heightLeft > 1.5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const downloadName = (activeResume.name || 'Resume').trim();
      pdf.save(`${downloadName}.pdf`);
    } catch (e) {
      console.error("PDF download failed:", e);
      // Restore zoom style on error
      element.style.zoom = oldZoom;
      alert("Failed to render PDF. Please try again. Error: " + (e as Error).message);
    }
  };

  // 2. DOCX Export (轻量级 HTML-to-Word Blob Export)
  const triggerDOCXDownload = () => {
    const canvas = document.getElementById('resume-print-canvas');
    if (!canvas) return;

    const htmlContent = canvas.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>Resume</title><meta charset="utf-8"><style>body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; }</style></head>
    <body>`;
    const footer = `</body></html>`;
    const fullDoc = header + htmlContent + footer;

    const blob = new Blob(['\ufeff' + fullDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const downloadName = (activeResume.name || 'Resume').trim();
    a.download = `${downloadName}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 3. TXT Export (ATS clean text compiler)
  const triggerTXTDownload = () => {
    const sections = [
      `=== ${activeResume.personalName || 'Resume'} ===`,
      `${activeResume.personalTitle || ''}`,
      `Email: ${activeResume.personalEmail || ''} | Phone: ${activeResume.personalPhone || ''} | Location: ${activeResume.personalLocation || ''}`,
      `LinkedIn: ${activeResume.personalLinkedin || ''} | GitHub: ${activeResume.personalGithub || ''}`,
      `\n=== PROFESSIONAL SUMMARY ===\n${activeResume.summary || ''}`,
      `\n=== TECHNICAL SKILLS ===\n${activeResume.skills || ''}`,
      `\n=== WORK EXPERIENCE ===\n${activeResume.experience || ''}`,
      `\n=== KEY PROJECTS ===\n${activeResume.projects || ''}`,
      `\n=== EDUCATION ===\n${activeResume.education || ''}`,
      `\n=== CERTIFICATIONS ===\n${activeResume.certifications || ''}`,
      `\n=== ACHIEVEMENTS ===\n${activeResume.achievements || ''}`
    ];

    const blob = new Blob([sections.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const downloadName = (activeResume.name || 'Resume').trim();
    a.download = `${downloadName}_ATS.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 4. JSON Export
  const triggerJSONExport = () => {
    const jsonStr = JSON.stringify(activeResume, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const downloadName = (activeResume.name || 'Resume').trim();
    a.download = `${downloadName}.json`;
    a.click();
  };

  // 5. JSON Import
  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.id) {
          onUpdateResume(parsed);
          alert("Resume schema imported successfully!");
        }
      } catch (err) {
        alert("Invalid resume JSON schema format.");
      }
    };
    reader.readAsText(file);
  };

  // Cover letter generator
  const buildCoverLetter = () => {
    if (!clCompany || !clRole) {
      alert("Please enter the target company and role.");
      return;
    }
    const letter = `Dear Hiring Manager at ${clCompany},

I am writing to express my strong interest in the ${clRole} opening at your company. With my background as a ${activeResume.personalTitle || 'Developer'} and technical experience across key frameworks, I am confident in my ability to add immediate value to your engineering organization.

During my career, I have developed solutions leveraging key technologies including ${activeResume.skills?.split(',').slice(0, 5).join(', ') || 'modern SDE frameworks'}. I am eager to apply my system-building capabilities to the unique engineering challenges at ${clCompany}.

Thank you for your time and consideration.

Sincerely,
${activeResume.personalName || 'Candidate'}`;
    setClGenerated(letter);
  };

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onUpdateResume({ signatureImage: '' });
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    onUpdateResume({ signatureImage: imgData });
    alert("Signature saved and embedded in resume footer!");
  };

  // HTML Portfolio Generator
  const generatePortfolioCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeResume.personalName || 'Portfolio'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen">
  <div class="max-w-4xl mx-auto py-12 px-6 space-y-12">
    <header class="text-center space-y-3 pb-8 border-b border-slate-900">
      <h1 class="text-4xl font-extrabold tracking-tight">${activeResume.personalName || 'Developer'}</h1>
      <p class="text-indigo-400 font-semibold uppercase tracking-wider">${activeResume.personalTitle || 'Full Stack Engineer'}</p>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-400 font-mono">
        <span>Email: ${activeResume.personalEmail || ''}</span>
        <span>Phone: ${activeResume.personalPhone || ''}</span>
      </div>
    </header>
    <main class="space-y-10">
      <section class="space-y-3">
        <h2 class="text-xl font-bold border-l-4 border-indigo-500 pl-3">Summary</h2>
        <p class="text-slate-350 leading-relaxed">${activeResume.summary || ''}</p>
      </section>
      <section class="space-y-3">
        <h2 class="text-xl font-bold border-l-4 border-indigo-500 pl-3">Skills</h2>
        <div class="flex flex-wrap gap-2">
          ${(activeResume.skills || '').split(',').map(s => `<span class="bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 px-3 py-1 rounded-xl text-xs font-semibold">${s.trim()}</span>`).join('\n')}
        </div>
      </section>
    </main>
  </div>
</body>
</html>`;
  };

  const copyPortfolioCode = () => {
    navigator.clipboard.writeText(generatePortfolioCode());
    alert("Portfolio single-page code copied to clipboard!");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
      {/* Tab Selectors */}
      <div className="flex border-b border-zinc-850 bg-zinc-950/40">
        {[
          { id: 'downloads', label: 'Download & Sync', icon: Download },
          { id: 'letter', label: 'AI Cover Letter', icon: FileText },
          { id: 'portfolio', label: 'Portfolio site', icon: Code },
          { id: 'signature', label: 'E-Signature', icon: PenTool },
          { id: 'qr', label: 'Resume QR', icon: QrCode }
        ].map(tool => {
          const ToolIcon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-[10px] font-bold uppercase transition border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-indigo-500 text-white bg-zinc-900/80' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <ToolIcon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className="p-4 min-h-[180px]">
        {/* DOWNLOAD & SCHEMAS TAB */}
        {activeTool === 'downloads' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={triggerPDFDownload}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={triggerDOCXDownload}
                className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-xs font-bold text-zinc-300 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-450" />
                <span>Download DOCX</span>
              </button>

              <button
                onClick={triggerTXTDownload}
                className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-xs font-bold text-zinc-300 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Download TXT (ATS)</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-zinc-850">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={copyShareLink}
                  className="w-full sm:w-auto bg-indigo-950/40 border border-indigo-900/30 hover:bg-indigo-900/20 text-indigo-400 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link' : 'Share Resume Link'}</span>
                </button>
                <button
                  onClick={triggerJSONExport}
                  className="w-full sm:w-auto text-[10px] text-zinc-450 hover:text-zinc-300 transition underline decoration-dotted font-bold"
                >
                  Export JSON Schema
                </button>
              </div>

              <label className="text-[10px] text-zinc-450 font-bold border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-2 flex items-center gap-1.5 cursor-pointer justify-center">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import JSON Schema</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleJSONImport} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        )}

        {/* COVER LETTER TAB */}
        {activeTool === 'letter' && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Company (e.g. Google)"
                value={clCompany}
                onChange={e => setClCompany(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-xs text-zinc-200 outline-none w-full"
              />
              <input
                type="text"
                placeholder="Role (e.g. Frontend Engineer)"
                value={clRole}
                onChange={e => setClRole(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-xs text-zinc-200 outline-none w-full"
              />
              <button
                onClick={buildCoverLetter}
                className="bg-indigo-650 hover:bg-indigo-550 text-xs font-bold text-white px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Letter</span>
              </button>
            </div>
            {clGenerated && (
              <textarea
                value={clGenerated}
                onChange={e => setClGenerated(e.target.value)}
                rows={5}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-[11px] text-zinc-300 font-mono outline-none focus:border-indigo-500"
              />
            )}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTool === 'portfolio' && (
          <div className="space-y-3 animate-fade-in text-center py-2">
            <Code className="w-10 h-10 text-indigo-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Interactive SDE Portfolio Page</h4>
            <p className="text-[10px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              Compile your entire resume structure into a clean, modern HTML/CSS portfolio file ready to host on GitHub Pages or Vercel.
            </p>
            <button
              onClick={copyPortfolioCode}
              className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-xs font-bold text-zinc-300 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition mx-auto cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Copy HTML Portfolio Code</span>
            </button>
          </div>
        )}

        {/* E-SIGNATURE TAB */}
        {activeTool === 'signature' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-white rounded-xl border border-zinc-300 overflow-hidden shrink-0 mx-auto sm:mx-0">
                <canvas
                  ref={signatureCanvasRef}
                  width={240}
                  height={80}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="bg-white cursor-crosshair block"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <span className="text-[10px] text-zinc-400 block font-semibold leading-relaxed">
                  Draw your signature on the pad and click save to embed a signature image at the bottom of your resume documents.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={saveSignature}
                    className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Save Signature
                  </button>
                  <button
                    onClick={clearSignature}
                    className="bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-[10px] font-bold text-zinc-450 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            {activeResume.signatureImage && (
              <div className="flex items-center gap-2 mt-2 bg-zinc-950 border border-zinc-850 rounded-xl p-2 max-w-sm">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Active Signature:</span>
                <img src={activeResume.signatureImage} alt="Signature" className="h-6 object-contain bg-white rounded px-1.5" />
              </div>
            )}
          </div>
        )}

        {/* QR CODE TAB */}
        {activeTool === 'qr' && (
          <div className="space-y-3 animate-fade-in text-center py-2">
            <div className="bg-white p-2.5 rounded-xl inline-block border border-zinc-200">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareUrl)}`} 
                alt="QR Code" 
                className="w-24 h-24 block" 
              />
            </div>
            <h4 className="text-xs font-bold text-white">Scan to view Online Resume</h4>
            <p className="text-[10px] text-zinc-450 max-w-xs mx-auto">
              Scan this QR code with any mobile device to view your active online resume version immediately.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
