import React, { useState } from 'react';
import { ResumeVersion } from '../../db/mockData';
import { Sparkles, ArrowRight, CheckCircle2, Clipboard } from 'lucide-react';

interface EditorAiProps {
  activeResume: ResumeVersion;
  onUpdateResume: (updates: Partial<ResumeVersion>) => void;
}

export const EditorAi: React.FC<EditorAiProps> = ({
  activeResume,
  onUpdateResume
}) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const skillsArr = activeResume.skills ? activeResume.skills.split(',').slice(0, 4).map(s => s.trim()) : ['React', 'Next.js', 'TypeScript'];
      const summary = `Results-oriented Software Engineer with experience building scalable systems using ${skillsArr.join(', ')}. Proven track record of optimizing API performance, designing distributed services, and collaborating in agile developer teams to deploy high-throughput applications.`;
      setOutputText(summary);
      setIsGenerating(false);
    }, 700);
  };

  const handleEnhanceBullet = () => {
    if (!inputText.trim()) {
      alert("Please paste a work experience description to enhance first.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const bullets = [
        `Architected and optimized the primary database query engine, reducing latencies by 34% and increasing concurrent connection capacity.`,
        `Led a team of engineers to implement Next.js state routing protocols, improving Core Web Vitals and user engagement metrics by 25%.`,
        `Designed and scaled distributed microservices using AWS container systems, boosting overall deployment reliability to 99.9%.`
      ];
      // pick a random one
      const idx = Math.floor(Math.random() * bullets.length);
      setOutputText(bullets[idx]);
      setIsGenerating(false);
    }, 800);
  };

  const handleSuggestKeywords = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const keywords = `Recommended SDE Tokens: "concurrency paradigms", "caching layers (Redis)", "distributed systems engineering", "load balancing protocols", "relational schemas", "CI/CD container pipelines (Docker)".`;
      setOutputText(keywords);
      setIsGenerating(false);
    }, 600);
  };

  const applyToResume = (field: 'summary' | 'skills') => {
    if (!outputText) return;
    onUpdateResume({ [field]: outputText });
    alert(`Successfully applied output to your resume ${field}!`);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>AI SDE Copilot Assistant</span>
        </span>

        <p className="text-[9.5px] text-zinc-500 leading-normal">
          Provide context or a rough draft below, then choose an agent completion to generate high-impact, metrics-driven bullet points.
        </p>

        <textarea
          placeholder="Paste a rough experience sentence (e.g. 'I wrote code for backend APIs') or summary draft here..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 outline-none focus:border-indigo-500 transition text-[11px] leading-relaxed"
        />

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] font-bold text-zinc-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            Draft Profile Summary
          </button>
          
          <button
            onClick={handleEnhanceBullet}
            disabled={isGenerating}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] font-bold text-zinc-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            Enhance Experience Bullet
          </button>

          <button
            onClick={handleSuggestKeywords}
            disabled={isGenerating}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] font-bold text-zinc-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            Suggest ATS Keywords
          </button>
        </div>
      </div>

      {outputText && (
        <div className="bg-zinc-955 border border-indigo-950/40 p-4 rounded-xl space-y-3 animate-fade-in">
          <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">AI Suggestion Result</span>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-zinc-300 font-mono text-[10.5px] leading-relaxed whitespace-pre-line">
            {outputText}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(outputText);
                alert("Copied suggestion output!");
              }}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] text-zinc-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <Clipboard className="w-3 h-3" />
              <span>Copy Suggestion</span>
            </button>
            
            <button
              onClick={() => applyToResume('summary')}
              className="bg-indigo-950/40 border border-indigo-900/30 hover:bg-indigo-900/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply to Summary</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
