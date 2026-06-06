import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../context/store';
import { X, Sparkles, Send, Play, ShieldAlert, Cpu, Trash2, HelpCircle } from 'lucide-react';

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ isOpen, onClose }) => {
  const { 
    agentLogs, 
    runAgentAction, 
    clearAgentLogs, 
    userProfile, 
    applications,
    resumes,
    okrs
  } = useAppStore();

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { 
      sender: 'ai', 
      text: `Hello Alex! I am your AI Career Copilot. I have mapped your complete profile (Stanford CS, 4y Exp, AWS/Kubernetes), active applications (Google, Meta, Stripe), and goal streaks.\n\nAsk me anything! For example:\n1. "Suggest a 3-month study plan for Google L5 coding round"\n2. "Analyze Meta offer vs Google salary projections"\n3. "Optimize my resume version for Stripe Backend SDE role"`,
      time: new Date().toLocaleTimeString() 
    }
  ]);

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'logs' | 'advisor'>('chat');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs, messages]);

  if (!isOpen) return null;

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    const time = new Date().toLocaleTimeString();
    
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time }]);
    setChatInput('');

    // Simulate Agent action trigger logs
    runAgentAction("Autonomous Query Chat", { query: userMsg });

    // AI Context-Aware Response Synthesis
    setTimeout(() => {
      let aiText = '';
      const queryLower = userMsg.toLowerCase();

      if (queryLower.includes('study') || queryLower.includes('learn') || queryLower.includes('dsa')) {
        aiText = `Based on your profile, your active graph streaks are at 12 days, but you have unchecked consistency nodes in "Distributed Caching" and "Model fine-tuning". Here is your 3-Month Plan:\n\n* **Month 1**: Deep dive in cache eviction engines (LRU/LFU custom implementations). Solve 15 hard Graph/DP problems.\n* **Month 2**: Solve Google practice coding round topics: Segment trees, trie structures, and interval queries.\n* **Month 3**: 10 Mock interview case simulations on behavioral STAR templates.`;
      } else if (queryLower.includes('meta') || queryLower.includes('offer') || queryLower.includes('salary') || queryLower.includes('negotiate')) {
        aiText = `Analyzing Meta Offer ($225,000 base + $150,000 RSU over 4 yrs) vs market benchmarks:\n\n1. Your offer score is **92/100** (Top 8% percentile for 4-year SDE candidates in San Francisco).\n2. **Negotiation Leverage**: Leverage your ongoing Google interview. Google L5 base salaries run up to $210,000. Ask Meta for an extra $15k sign-on bonus and a bump in RSUs to $175k.\n3. **Risk Audit**: Meta has a 2-week notice period requirement. Double check if Google final loop coincides.`;
      } else if (queryLower.includes('resume') || queryLower.includes('ats') || queryLower.includes('stripe')) {
        aiText = `Analyzing Resume V2 (SDE Full Stack) against Stripe Staff Backend role:\n\n* **Match Score**: 89/100.\n* **ATS Keyword Gaps**: Missing keyword tokens: "Ruby/Go API design", "Distributed transactions concurrency".\n* **Action Plan**: Replace 'Developed Go microservices' with 'Designed distributed concurrent microservices in Go utilizing consistency indices, boosting API throughput by 18%'.`;
      } else {
        aiText = `I have updated my memory models. Your primary focus is securing a Senior role by June 30th (OKR-1: 75% complete). I recommend running the "Auto-Job Discovery" engine to evaluate active senior matching positions.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiText, time: new Date().toLocaleTimeString() }]);
    }, 800);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-zinc-950 border-l border-zinc-800 text-white flex flex-col shadow-2xl z-50 animate-slide-in">
      {/* Copilot Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <h2 className="font-bold text-sm tracking-wide">Nexrume Agent Console</h2>
            <span className="text-[10px] text-indigo-500 font-semibold tracking-wider uppercase">Autonomous Operating Layer</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-900 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Copilot Mode Tabs */}
      <div className="flex bg-zinc-900 border-b border-zinc-800 px-2 py-1 text-xs">
        <button 
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 text-center py-1.5 rounded font-medium transition ${
            activeSubTab === 'chat' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Advisor Copilot
        </button>
        <button 
          onClick={() => setActiveSubTab('logs')}
          className={`flex-1 text-center py-1.5 rounded font-medium transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'logs' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Agent Logs</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('advisor')}
          className={`flex-1 text-center py-1.5 rounded font-medium transition ${
            activeSubTab === 'advisor' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Strategy Roadmaps
        </button>
      </div>

      {/* Main Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSubTab === 'chat' && (
          <div className="flex flex-col h-full">
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                  }`}>
                    {m.text.split('\n').map((line, lidx) => (
                      <p key={lidx} className={line ? "mb-1.5" : "mb-0"}>{line}</p>
                    ))}
                  </div>
                  <span className="text-[9px] text-zinc-600 mt-1 px-1">{m.time}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Chat Inputs */}
            <div className="relative mt-auto border border-zinc-800 rounded-xl bg-zinc-900 p-1 flex items-center">
              <input 
                type="text" 
                placeholder="Ask your career advisor..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
              />
              <button 
                onClick={handleSendChat}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'logs' && (
          <div className="flex flex-col h-full">
            {/* Agent Control Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-300">Continuous Agent Loop</span>
                <span className="text-[10px] text-emerald-500 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded font-bold">
                  AUTONOMOUS STATE
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Trigger autonomous scripts to compile statistics, scan connected emails, or execute target analyses.
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button 
                  onClick={() => runAgentAction("Recommend Jobs")}
                  className="bg-indigo-950/60 border border-indigo-900/40 hover:bg-indigo-900/50 text-[10px] text-indigo-400 font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Discover Jobs</span>
                </button>
                <button 
                  onClick={() => runAgentAction("ATS Analyzer")}
                  className="bg-purple-950/60 border border-purple-900/40 hover:bg-purple-900/50 text-[10px] text-purple-400 font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Cpu className="w-3 h-3" />
                  <span>ATS Analyzer</span>
                </button>
              </div>

              <div className="flex justify-between mt-2 pt-2 border-t border-zinc-800">
                <button 
                  onClick={clearAgentLogs}
                  className="text-zinc-600 hover:text-zinc-400 text-[10px] flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Logs</span>
                </button>
                <div className="text-[10px] text-zinc-500">
                  Total Active Tasks: 3
                </div>
              </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 overflow-y-auto space-y-3 font-mono text-[10px] leading-relaxed select-text">
              {agentLogs.length === 0 ? (
                <div className="text-zinc-600 italic text-center py-10">No agent actions logged.</div>
              ) : (
                agentLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-zinc-600">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-500' :
                      log.type === 'warning' ? 'text-amber-500' : 'text-sky-400'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {activeSubTab === 'advisor' && (
          <div className="space-y-4 text-xs">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>AI Strategy Advisor</span>
              </h3>
              <p className="text-zinc-400 text-[11px] mb-3 leading-normal">
                Autonomous roadmap generated for your active profile track (**Software Engineering**):
              </p>
              
              <div className="space-y-3 text-[11px]">
                <div className="border-l-2 border-indigo-500 pl-3">
                  <span className="font-bold text-zinc-200">Recommended Next Learning</span>
                  <p className="text-zinc-500 mt-0.5">Solve consistent caching checklists to unlock high-tier systems assessments.</p>
                </div>
                <div className="border-l-2 border-purple-500 pl-3">
                  <span className="font-bold text-zinc-200">Application Strategy</span>
                  <p className="text-zinc-500 mt-0.5">Your ATS score for Meta is high (94). Target Netflix backend roles using SDE Resume version.</p>
                </div>
                <div className="border-l-2 border-emerald-500 pl-3">
                  <span className="font-bold text-zinc-200">Negotiation Threshold</span>
                  <p className="text-zinc-500 mt-0.5">Current market range for 4y exp is $215k-$235k. The Meta offer sits optimally at $225k.</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="font-bold text-white mb-2">Workspace Intelligence Scores</h3>
              <div className="space-y-2 text-[11px]">
                <div>
                  <div className="flex justify-between mb-1 text-zinc-400">
                    <span>Profile Branding Score</span>
                    <span className="font-semibold text-zinc-200">82%</span>
                  </div>
                  <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-zinc-400">
                    <span>ATS Optimality Rating</span>
                    <span className="font-semibold text-zinc-200">89%</span>
                  </div>
                  <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-zinc-400">
                    <span>Interview Preparedness</span>
                    <span className="font-semibold text-zinc-200">65%</span>
                  </div>
                  <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-900/30 rounded-xl p-3.5 text-center">
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Memory System Active</span>
              <p className="text-[11px] text-zinc-300 mt-1 leading-normal">
                Nexrume keeps history registers of past rejections (e.g. Netflix, May 12) to refine matching parameters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
