import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  GraduationCap, 
  Calendar, 
  FileSpreadsheet, 
  Settings, 
  ShieldAlert, 
  Award, 
  Network, 
  Map, 
  Cpu, 
  TrendingUp, 
  FolderLock,
  MessageSquare,
  Zap,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navGroups = [
    {
      title: "Core Workspace",
      items: [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
        { id: "tracker", label: "Job Tracker", icon: Briefcase },
        { id: "resumes", label: "Resume & ATS Studio", icon: FileText },
      ]
    },
    {
      title: "Systems & Security",
      items: [
        { id: "security", label: "Enterprise Security", icon: ShieldAlert },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 flex flex-col h-full shrink-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <img 
          src="/brand-logo.png" 
          alt="Nexrume Logo" 
          className="w-8 h-8 rounded-lg object-cover"
        />
        <div>
          <h1 className="font-bold text-white text-lg tracking-wide leading-none">NEXRUME</h1>
          <span className="text-[10px] text-zinc-500 tracking-widest font-semibold uppercase">Career OS</span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group text-left ${
                        isActive
                          ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10"
                          : "hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                      }`} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Autonomous Agent</span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        </div>
        <div className="text-[10px] text-zinc-600 flex justify-between">
          <span>Client SDK: v1.8.4</span>
          <span>Workspace: SWE</span>
        </div>
      </div>
    </aside>
  );
};
