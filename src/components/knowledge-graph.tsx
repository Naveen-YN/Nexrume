import React, { useState } from 'react';
import { useAppStore } from '../context/store';
import { Network, Search, RefreshCw, Cpu, Layers } from 'lucide-react';

export const KnowledgeGraph: React.FC = () => {
  const { applications, recruiters, userProfile } = useAppStore();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'skill' | 'company' | 'recruiter'>('all');

  // Define nodes
  const nodes = [
    // Center Node
    { id: 'user', label: userProfile.name, type: 'user', x: 200, y: 180, val: 'Primary SDE Candidate' },
    
    // Skills Nodes
    { id: 'skill-next', label: 'Next.js', type: 'skill', x: 80, y: 80, val: 'Used in Google, Meta applications' },
    { id: 'skill-ts', label: 'TypeScript', type: 'skill', x: 90, y: 280, val: 'Core programming language' },
    { id: 'skill-k8s', label: 'Kubernetes', type: 'skill', x: 310, y: 80, val: 'Requested at Google and Stripe' },
    { id: 'skill-llm', label: 'LLM Fine-tuning', type: 'skill', x: 330, y: 280, val: 'Active match for Meta AI Developer' },

    // Companies / Applications Nodes
    { id: 'comp-google', label: 'Google', type: 'company', x: 200, y: 50, val: 'Senior Software Engineer, Stage: Interview' },
    { id: 'comp-meta', label: 'Meta', type: 'company', x: 320, y: 180, val: 'AI Developer, Stage: Offer' },
    { id: 'comp-stripe', label: 'Stripe', type: 'company', x: 80, y: 180, val: 'Staff Backend, Stage: OA' },

    // Recruiters Nodes
    { id: 'rec-sarah', label: 'Sarah Jenkins', type: 'recruiter', x: 220, y: 310, val: 'Google recruiter, Score: 85' },
    { id: 'rec-marcus', label: 'Marcus Vance', type: 'recruiter', x: 380, y: 130, val: 'Meta recruiter, Score: 95' },
  ];

  // Define links
  const links = [
    { source: 'user', target: 'comp-google' },
    { source: 'user', target: 'comp-meta' },
    { source: 'user', target: 'comp-stripe' },
    { source: 'comp-google', target: 'rec-sarah' },
    { source: 'comp-meta', target: 'rec-marcus' },
    { source: 'comp-google', target: 'skill-next' },
    { source: 'comp-google', target: 'skill-k8s' },
    { source: 'comp-meta', target: 'skill-llm' },
    { source: 'comp-meta', target: 'skill-next' },
    { source: 'comp-stripe', target: 'skill-ts' },
    { source: 'comp-stripe', target: 'skill-k8s' },
    { source: 'rec-sarah', target: 'user' },
    { source: 'rec-marcus', target: 'user' },
  ];

  const filteredNodes = nodes.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'skill') return n.type === 'skill' || n.type === 'user';
    if (filterType === 'company') return n.type === 'company' || n.type === 'user';
    if (filterType === 'recruiter') return n.type === 'recruiter' || n.type === 'user';
    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = links.filter(l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target));

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'user': return 'fill-indigo-500 stroke-indigo-400';
      case 'skill': return 'fill-purple-600 stroke-purple-400';
      case 'company': return 'fill-emerald-600 stroke-emerald-400';
      case 'recruiter': return 'fill-amber-600 stroke-amber-400';
      default: return 'fill-zinc-700 stroke-zinc-500';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[520px] justify-between relative overflow-hidden">
      {/* Graph Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 border-b border-zinc-800 pb-4 mb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Personal Knowledge Graph</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Interactive map linking skills, companies, and contacts.</p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              filterType === 'all' 
                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-400' 
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Show All
          </button>
          <button 
            onClick={() => setFilterType('skill')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              filterType === 'skill' 
                ? 'bg-purple-950/60 border-purple-500 text-purple-400' 
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Skills
          </button>
          <button 
            onClick={() => setFilterType('company')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              filterType === 'company' 
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400' 
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Companies
          </button>
          <button 
            onClick={() => setFilterType('recruiter')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              filterType === 'recruiter' 
                ? 'bg-amber-950/60 border-amber-500 text-amber-400' 
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Recruiters
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="flex-1 w-full bg-zinc-950/60 rounded-xl relative border border-zinc-850">
        <svg viewBox="0 0 460 360" className="w-full h-full select-none cursor-grab">
          {/* Draw Connection Lines */}
          <g>
            {filteredLinks.map((link, idx) => {
              const srcNode = filteredNodes.find(n => n.id === link.source);
              const tgtNode = filteredNodes.find(n => n.id === link.target);
              if (!srcNode || !tgtNode) return null;
              return (
                <line
                  key={idx}
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  className="stroke-zinc-800 stroke-[1.5] animate-dash"
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>

          {/* Draw Nodes */}
          <g>
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <g 
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={node.type === 'user' ? 14 : 10}
                    className={`${getNodeColor(node.type)} stroke-2 transition duration-200 group-hover:scale-125 ${
                      isSelected ? 'ring-4 ring-indigo-500/20 stroke-white' : ''
                    }`}
                  />
                  <text
                    y={node.type === 'user' ? 24 : 20}
                    textAnchor="middle"
                    className="fill-zinc-400 group-hover:fill-white text-[9px] font-medium font-sans select-none tracking-wide"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Details Card */}
        {selectedNode ? (
          <div className="absolute bottom-4 left-4 right-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-xl flex items-start gap-3 animate-slide-up">
            <div className="p-2 bg-indigo-950/50 border border-indigo-900/30 rounded-lg text-indigo-400 mt-0.5 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white uppercase tracking-wider">{selectedNode.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                  {selectedNode.type}
                </span>
              </div>
              <p className="text-zinc-400 mt-1 leading-normal">
                {selectedNode.val}
              </p>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-zinc-600 hover:text-zinc-400 font-bold"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 right-4 text-center text-[10px] text-zinc-600">
            Click on any network node (User, Skill, Company, Recruiter) to inspect relationship bindings.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 border-t border-zinc-850 pt-2">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-zinc-500" />
          <span>Dynamic Auto-mapping Engine Active</span>
        </span>
        <button 
          onClick={() => setSelectedNode(null)}
          className="text-indigo-400 hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Recalculate Centrality</span>
        </button>
      </div>
    </div>
  );
};
