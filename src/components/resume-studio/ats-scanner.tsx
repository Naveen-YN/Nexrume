import React, { useMemo } from 'react';
import { ResumeVersion } from '../../db/mockData';
import { CheckCircle2, AlertTriangle, AlertCircle, Award } from 'lucide-react';

interface AtsScannerProps {
  activeResume: ResumeVersion;
  onUpdateScore: (score: number) => void;
}

export const AtsScanner: React.FC<AtsScannerProps> = ({ activeResume, onUpdateScore }) => {
  const diagnostics = useMemo(() => {
    const issues: { type: 'success' | 'warning' | 'error'; title: string; desc: string }[] = [];
    let score = 100;

    // 1. Contact Info Checks
    const hasEmail = !!activeResume.personalEmail;
    const hasPhone = !!activeResume.personalPhone;
    const hasLocation = !!activeResume.personalLocation;
    const hasLinkedin = !!activeResume.personalLinkedin;
    const hasGithub = !!activeResume.personalGithub;

    let contactScore = 0;
    if (hasEmail) contactScore += 20;
    if (hasPhone) contactScore += 20;
    if (hasLocation) contactScore += 20;
    if (hasLinkedin) contactScore += 20;
    if (hasGithub) contactScore += 20;

    if (contactScore < 100) {
      score -= (100 - contactScore) * 0.25;
      issues.push({
        type: 'warning',
        title: 'Missing Contact Handles',
        desc: `Include your ${[!hasEmail && 'Email', !hasPhone && 'Phone', !hasLinkedin && 'LinkedIn', !hasGithub && 'GitHub'].filter(Boolean).join(', ')} to improve SDE indexability.`
      });
    } else {
      issues.push({
        type: 'success',
        title: 'Complete Contact Profile',
        desc: 'All essential contact details and developer handles are present.'
      });
    }

    // 2. Formatting Check
    const font = activeResume.customFont || activeResume.fontFamily || 'sans';
    const isATSFont = ['Inter', 'Roboto', 'Arial', 'Georgia', 'sans', 'serif'].includes(font);
    if (!isATSFont) {
      score -= 10;
      issues.push({
        type: 'warning',
        title: 'Non-Standard Font Family',
        desc: `Font "${font}" might not render cleanly on legacy ATS parsers. Consider Inter or Arial.`
      });
    }

    const marginH = activeResume.marginHorizontal ?? 12;
    if (marginH < 8) {
      score -= 5;
      issues.push({
        type: 'warning',
        title: 'Narrow Layout Margins',
        desc: 'Horizontal margins are below 8mm, which may cause page truncation on PDF export.'
      });
    }

    // 3. Keyword Analysis
    const textToScan = `${activeResume.summary} ${activeResume.skills} ${activeResume.experience} ${activeResume.projects}`.toLowerCase();
    
    // SDE ATS Keywords list
    const essentialKeywords = [
      'distributed systems', 'kubernetes', 'docker', 'ci/cd', 'cloud', 'aws', 'gcp', 
      'microservices', 'typescript', 'python', 'react', 'next.js', 'rest api', 'sql', 'nosql',
      'system design', 'agile', 'database', 'scalability', 'git', 'testing'
    ];

    const missingKeywords = essentialKeywords.filter(kw => !textToScan.includes(kw));
    const keywordMatchCount = essentialKeywords.length - missingKeywords.length;
    const keywordMatchPct = (keywordMatchCount / essentialKeywords.length) * 100;

    if (keywordMatchPct < 40) {
      score -= 20;
      issues.push({
        type: 'error',
        title: 'Low SDE Keyword Density',
        desc: `Add target terms to summary or skills: ${missingKeywords.slice(0, 4).map(k => `"${k}"`).join(', ')}.`
      });
    } else if (keywordMatchPct < 70) {
      score -= 10;
      issues.push({
        type: 'warning',
        title: 'Moderate Keyword Alignment',
        desc: `Consider adding: ${missingKeywords.slice(0, 3).map(k => `"${k}"`).join(', ')}.`
      });
    } else {
      issues.push({
        type: 'success',
        title: 'Strong Keyword Alignment',
        desc: 'Excellent usage of core engineering terminology.'
      });
    }

    // 4. Metrics & Achievements Checks
    const hasMetrics = /\b\d+(?:%|x|k|M|s|ms|% improvement)\b/i.test(textToScan);
    if (!hasMetrics) {
      score -= 15;
      issues.push({
        type: 'error',
        title: 'Lacks Measurable Metrics',
        desc: 'Quantify your SDE impact (e.g. "improved query speed by 40%", "reduced bundle size by 20%").'
      });
    } else {
      issues.push({
        type: 'success',
        title: 'Action-Metric Focus',
        desc: 'Metrics-driven work experience statements detected.'
      });
    }

    // Make sure score is bound between 0 and 100
    const finalScore = Math.max(10, Math.min(100, Math.round(score)));

    return {
      score: finalScore,
      issues,
      contactScore,
      formattingScore: isATSFont && marginH >= 8 ? 100 : 70,
      keywordsScore: Math.round(keywordMatchPct),
      readabilityScore: hasMetrics ? 95 : 60
    };
  }, [activeResume]);

  // Sync score back to parent context
  React.useEffect(() => {
    onUpdateScore(diagnostics.score);
  }, [diagnostics.score, onUpdateScore]);

  return (
    <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 space-y-4">
      {/* Header and score radial */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>ATS Real-Time Scorecard</span>
          </h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Calculated using industry-standard screening rules.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-lg font-black text-white">{diagnostics.score}%</span>
            <span className="text-[9px] text-zinc-500 block">Overall SDE Match</span>
          </div>
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-zinc-800 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Formatting', val: diagnostics.formattingScore },
          { label: 'Keywords', val: diagnostics.keywordsScore },
          { label: 'Readability', val: diagnostics.readabilityScore },
          { label: 'Contact Details', val: diagnostics.contactScore }
        ].map((cat, idx) => (
          <div key={idx} className="bg-zinc-900/50 border border-zinc-850 p-2.5 rounded-xl text-center">
            <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider">{cat.label}</span>
            <span className={`text-sm font-extrabold mt-1 block ${cat.val >= 85 ? 'text-emerald-400' : cat.val >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {cat.val}%
            </span>
          </div>
        ))}
      </div>

      {/* Actionable Feedback List */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Optimization Checklist:</span>
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
          {diagnostics.issues.map((issue, idx) => {
            const Icon = issue.type === 'success' ? CheckCircle2 : issue.type === 'warning' ? AlertTriangle : AlertCircle;
            const colorClass = issue.type === 'success' ? 'text-emerald-450 border-emerald-950/20 bg-emerald-950/10' : issue.type === 'warning' ? 'text-amber-400 border-amber-950/20 bg-amber-950/10' : 'text-rose-400 border-rose-955/20 bg-rose-955/10';
            return (
              <div key={idx} className={`flex gap-2.5 p-2.5 rounded-xl border ${colorClass} text-xs leading-normal`}>
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white">{issue.title}</span>
                  <span className="text-zinc-400 text-[10px] mt-0.5 block">{issue.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
