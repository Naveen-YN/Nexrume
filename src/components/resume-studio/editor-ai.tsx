import React, { useState } from 'react';
import { ResumeVersion } from '../../db/mockData';
import { Sparkles, ArrowRight, CheckCircle2, Clipboard, RefreshCw, Layers } from 'lucide-react';

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
  const [selectedTone, setSelectedTone] = useState<'formal' | 'shorter' | 'stronger' | 'ats'>('ats');

  // Generator Options
  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const skillsArr = activeResume.skills ? activeResume.skills.split(',').slice(0, 4).map(s => s.trim()) : ['React', 'Next.js', 'TypeScript', 'AWS'];
      const summary = `Results-oriented Software Engineer with experience designing and optimizing high-throughput system architectures using ${skillsArr.join(', ')}. Proven track record of scaling RESTful APIs, implementing distributed microservices, and collaborating in agile teams to improve core product performance.`;
      setOutputText(summary);
      setIsGenerating(false);
    }, 700);
  };

  const handleGenerateExperience = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const bullets = `• Developed and scaled core REST APIs, improving request latency by 28% and handling up to 10K concurrent operations.
• Re-architected data ingestion pipelines using Redis and RabbitMQ to optimize messaging throughput.
• Spearheaded full-stack Next.js deployment protocols, improving Lighthouse score by 15 points.`;
      setOutputText(bullets);
      setIsGenerating(false);
    }, 800);
  };

  const handleGenerateProject = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const project = `Built a distributed telemetry pipeline using Next.js, Node.js, and Docker to track real-time application metrics. Optimized database lookups with indexing, reducing average dashboard loading latencies by 35% and improving uptime.`;
      setOutputText(project);
      setIsGenerating(false);
    }, 750);
  };

  const handleGenerateSkills = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const skills = `React, Next.js, TypeScript, Node.js, Express, Python, Django, PostgreSQL, MongoDB, Redis, Docker, AWS (S3, EC2, Lambda), CI/CD, Git`;
      setOutputText(skills);
      setIsGenerating(false);
    }, 600);
  };

  // Tone Rewrite
  const handleRewrite = () => {
    if (!inputText.trim()) {
      alert("Please paste some text in the scratchpad box first to rewrite.");
      return;
    }
    setIsGenerating(true);

    setTimeout(() => {
      let result = '';
      if (selectedTone === 'formal') {
        result = `I am writing to substantiate my technical capabilities in designing, optimizing, and deploying high-performance distributed software architectures. My core competencies encompass developing modular systems, improving backend query efficiencies, and maintaining modern code standards.`;
      } else if (selectedTone === 'shorter') {
        result = `Software Engineer experienced in scaling REST APIs, building Next.js applications, and optimizing databases. Improved throughput by 30%.`;
      } else if (selectedTone === 'stronger') {
        result = `Spearheaded architecture of backend services, boosting overall query speeds by 42%. Engineered caching layers to support 5M daily queries. Led cross-functional developer sprints.`;
      } else {
        // ATS Optimized
        result = `Designed and deployed scalable Next.js applications with optimized database schemas. Utilized CI/CD pipelines, Docker containerization, and AWS hosting protocols to improve overall deployment reliability.`;
      }
      setOutputText(result);
      setIsGenerating(false);
    }, 850);
  };

  const applyToResume = (field: 'summary' | 'skills' | 'experience' | 'projects') => {
    if (!outputText) return;
    onUpdateResume({ [field]: outputText });
    alert(`Successfully applied output to your resume ${field}!`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Scratchpad Card */}
      <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4">
        <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI Content Copilot & Rewrite Scratchpad</span>
        </span>

        <p className="text-[9.5px] text-zinc-550 leading-normal">
          Draft a section, paste legacy bullet points, or generate new resume content instantly using our SDE-focused AI Copilot.
        </p>

        <textarea
          placeholder="Paste text here to rewrite, or type custom context guidelines..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={4}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px] leading-relaxed font-mono"
        />

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-900">
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] font-black uppercase text-zinc-350 px-3 py-2 rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            Draft Summary
          </button>
          
          <button
            onClick={handleGenerateExperience}
            disabled={isGenerating}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] font-black uppercase text-zinc-350 px-3 py-2 rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            Draft Work Bullets
          </button>

          <button
            onClick={handleGenerateProject}
            disabled={isGenerating}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] font-black uppercase text-zinc-350 px-3 py-2 rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            Draft Project Desc
          </button>

          <button
            onClick={handleGenerateSkills}
            disabled={isGenerating}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] font-black uppercase text-zinc-350 px-3 py-2 rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            Suggest Skills
          </button>
        </div>
      </div>

      {/* Rewrite Tone Selector Card */}
      <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-3.5">
        <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Tone Rewrite</span>
        </span>

        <div className="flex bg-zinc-950 p-0.5 rounded border border-zinc-800 text-[10px] font-black uppercase tracking-wider w-fit">
          {[
            { id: 'ats', label: 'ATS Optimized' },
            { id: 'stronger', label: 'Stronger / Metrics' },
            { id: 'formal', label: 'Formal Tone' },
            { id: 'shorter', label: 'Shorter / Concise' }
          ].map(tone => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id as any)}
              className={`px-3 py-1.5 rounded cursor-pointer transition ${
                selectedTone === tone.id ? 'bg-indigo-650 text-white font-bold' : 'text-zinc-550 hover:text-zinc-350'
              }`}
            >
              {tone.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleRewrite}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-wider text-white px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
        >
          {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>Apply Tone Rewrite</span>
        </button>
      </div>

      {/* Suggestions Output Panel */}
      {outputText && (
        <div className="bg-zinc-955 border border-indigo-950/45 p-4 rounded-xl space-y-3.5 animate-fade-in">
          <span className="text-[10px] font-black text-indigo-400 block uppercase tracking-wider">AI Copilot Generated Text</span>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 text-zinc-300 font-mono text-[11px] leading-relaxed whitespace-pre-line select-text">
            {outputText}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(outputText);
                alert("Copied suggestion to clipboard!");
              }}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] text-zinc-400 px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer font-semibold"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            
            <button
              onClick={() => applyToResume('summary')}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] text-zinc-400 px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer font-semibold"
            >
              <span>Apply to Summary</span>
            </button>

            <button
              onClick={() => applyToResume('skills')}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-[10px] text-zinc-400 px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer font-semibold"
            >
              <span>Apply to Skills</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
