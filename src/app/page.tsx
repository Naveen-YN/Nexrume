"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../context/store';
import { JobApplication, ResumeVersion } from '../db/mockData';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { KnowledgeGraph } from '../components/knowledge-graph';
import { 
  SiLeetcode, SiGithub, SiGooglesheets, SiHackerrank, SiCodeforces, SiCodechef 
} from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';

import { 
  Briefcase, Plus, Search, Calendar, Timeline, RefreshCw, Download, Copy,
  CheckCircle2, AlertCircle, FileText, ChevronRight, ChevronDown, ChevronUp, BarChart2, Star, Award, Layers,
  Compass, Mail, Cpu, Play, CheckSquare, BrainCircuit, Heart, MessageSquare, Shield, Settings, Network,
  Check, Lock, Edit2, Database, BookOpen, User, Flame, ArrowUpRight, LogOut, Key, Clock, 
  UserPlus, MailCheck, Trash2, HelpCircle, FileSpreadsheet, Activity, Sparkles, AlertTriangle, Upload,
  Code, CheckCircle, ExternalLink, Bookmark, Building, Coins, MapPin, Eye, EyeOff
} from 'lucide-react';

const Github: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="14" 
    height="14" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface ParsedExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
  hidden?: boolean;
}

function parseExperience(expStr: string): ParsedExperience[] {
  if (!expStr) return [];
  const lines = expStr.split('\n').filter(l => l.trim() !== '');
  return lines.map(line => {
    let isHidden = false;
    let text = line.trim();
    if (text.startsWith('[HIDDEN]')) {
      isHidden = true;
      text = text.substring(8).trim();
    }
    const match = text.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\):\s*(.+)$/);
    if (match) {
      return {
        role: match[1].trim(),
        company: match[2].trim(),
        duration: match[3].trim(),
        description: match[4].trim(),
        hidden: isHidden
      };
    }
    const matchNoDuration = text.match(/^(.+?)\s+at\s+(.+?):\s*(.+)$/);
    if (matchNoDuration) {
      return {
        role: matchNoDuration[1].trim(),
        company: matchNoDuration[2].trim(),
        duration: '',
        description: matchNoDuration[3].trim(),
        hidden: isHidden
      };
    }
    return {
      role: '',
      company: '',
      duration: '',
      description: text,
      hidden: isHidden
    };
  });
}

function formatExperience(items: ParsedExperience[]): string {
  return items.map(item => {
    const prefix = item.hidden ? '[HIDDEN] ' : '';
    if (!item.role && !item.company) return `${prefix}${item.description}`;
    const durationStr = item.duration ? ` (${item.duration})` : '';
    return `${prefix}${item.role} at ${item.company}${durationStr}: ${item.description}`;
  }).join('\n');
}

interface ParsedEducation {
  school: string;
  degree: string;
  duration: string;
  gpa: string;
  hidden?: boolean;
}

function parseEducation(eduStr: string): ParsedEducation[] {
  if (!eduStr) return [];
  const lines = eduStr.split('\n').filter(l => l.trim() !== '');
  return lines.map(line => {
    let isHidden = false;
    let text = line.trim();
    if (text.startsWith('[HIDDEN]')) {
      isHidden = true;
      text = text.substring(8).trim();
    }
    const parts = text.split(' - ');
    if (parts.length >= 2) {
      const school = parts[0].trim();
      const rest = parts.slice(1).join(' - ');
      
      let gpa = '';
      let degree = rest;
      const gpaMatch = rest.match(/\(GPA\s*:?\s*([^)]+)\)/i);
      if (gpaMatch) {
        gpa = gpaMatch[1].trim();
        degree = rest.replace(/\(GPA\s*:?\s*[^)]+\)/i, '').trim();
      }
      
      let duration = '';
      const durationMatch = degree.match(/\(([^)]+)\)/);
      if (durationMatch && !durationMatch[0].toLowerCase().includes('gpa')) {
        duration = durationMatch[1].trim();
        degree = degree.replace(/\([^)]+\)/, '').trim();
      }
      
      return {
        school,
        degree: degree.trim(),
        duration,
        gpa,
        hidden: isHidden
      };
    }
    return {
      school: text,
      degree: '',
      duration: '',
      gpa: '',
      hidden: isHidden
    };
  });
}

function formatEducation(items: ParsedEducation[]): string {
  return items.map(item => {
    if (!item.school) return '';
    const prefix = item.hidden ? '[HIDDEN] ' : '';
    let str = prefix + item.school;
    if (item.degree) str += ` - ${item.degree}`;
    if (item.duration) str += ` (${item.duration})`;
    if (item.gpa) str += ` (GPA ${item.gpa})`;
    return str;
  }).filter(Boolean).join('\n');
}

interface ParsedProject {
  title: string;
  description: string;
  hidden?: boolean;
}

function parseProjects(projStr: string): ParsedProject[] {
  if (!projStr) return [];
  const lines = projStr.split('\n').filter(l => l.trim() !== '');
  return lines.map(line => {
    let isHidden = false;
    let text = line.trim();
    if (text.startsWith('[HIDDEN]')) {
      isHidden = true;
      text = text.substring(8).trim();
    }
    const colonIndex = text.indexOf(':');
    if (colonIndex > 0) {
      return {
        title: text.substring(0, colonIndex).trim(),
        description: text.substring(colonIndex + 1).trim(),
        hidden: isHidden
      };
    }
    return {
      title: '',
      description: text,
      hidden: isHidden
    };
  });
}

function formatProjects(items: ParsedProject[]): string {
  return items.map(item => {
    const prefix = item.hidden ? '[HIDDEN] ' : '';
    if (!item.title) return `${prefix}${item.description}`;
    return `${prefix}${item.title}: ${item.description}`;
  }).join('\n');
}

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  id, 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children,
  badge
}) => {
  return (
    <div className="border border-zinc-800/60 rounded-xl bg-zinc-950/20 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/30 hover:bg-zinc-900/50 transition font-semibold text-white text-xs select-none"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{title}</span>
          {badge}
        </div>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-3.5 space-y-3.5 border-t border-zinc-800/60 bg-zinc-900/10">
          {children}
        </div>
      )}
    </div>
  );
};

interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
  required?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  allowCustom = false,
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (allowCustom) {
          onChange(search);
        } else {
          setSearch(value || "");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search, value, allowCustom, onChange]);

  const filteredOptions = options.filter(opt =>
    (opt || "").toLowerCase().includes((search || "").toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          required={required}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (allowCustom) {
              onChange(e.target.value);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full h-[38px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 pr-8 text-zinc-150 outline-none transition text-xs"
        />
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 cursor-pointer text-zinc-550 hover:text-zinc-350"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-40 w-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-h-[160px] overflow-y-auto scrollbar-thin">
          {filteredOptions.length === 0 ? (
            allowCustom && search.trim() !== "" ? (
              <div 
                onClick={() => {
                  onChange(search);
                  setIsOpen(false);
                }}
                className="px-3.5 py-2 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer transition italic"
              >
                Use custom: "{search}"
              </div>
            ) : (
              <div className="px-3.5 py-2 text-[11px] text-zinc-500 italic">No options found</div>
            )
          ) : (
            filteredOptions.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(opt);
                  setSearch(opt);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-[11px] text-zinc-300 hover:bg-zinc-850 hover:text-white border-b border-zinc-850/50 last:border-0 transition cursor-pointer select-none"
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface SmartEmailInputProps {
  value: string;
  onChange: (val: string) => void;
  applications: JobApplication[];
  placeholder?: string;
  className?: string;
}

const SmartEmailInput: React.FC<SmartEmailInputProps> = ({
  value,
  onChange,
  applications,
  placeholder = "e.g. alex@gmail.com",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { userProfile } = useAppStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emailSuggestions = React.useMemo(() => {
    const emailStats: Record<string, { count: number; lastUsed: number }> = {};
    
    // Automatically include user's own email if available
    if (userProfile?.email) {
      emailStats[userProfile.email] = { count: 1, lastUsed: Date.now() };
    }

    applications.forEach(app => {
      const email = app.appliedFromEmail;
      if (!email) return;
      
      // Filter out mock email if logged-in user is not the mock user
      if (userProfile?.email && userProfile.email !== 'alex.dev@gmail.com' && email === 'alex.dev@gmail.com') {
        return;
      }

      const appTime = app.appliedDate ? new Date(app.appliedDate).getTime() : 0;
      if (!emailStats[email]) {
        emailStats[email] = { count: 0, lastUsed: 0 };
      }
      emailStats[email].count += 1;
      if (appTime > emailStats[email].lastUsed) {
        emailStats[email].lastUsed = appTime;
      }
    });

    return Object.keys(emailStats).sort((a, b) => {
      const statA = emailStats[a];
      const statB = emailStats[b];
      if (statA.count !== statB.count) return statB.count - statA.count;
      return statB.lastUsed - statA.lastUsed;
    });
  }, [applications, userProfile]);

  const query = (value || "").trim().toLowerCase();
  const filtered = query
    ? emailSuggestions.filter(email => email.toLowerCase().includes(query))
    : emailSuggestions;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full h-[38px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 text-zinc-150 outline-none transition text-xs"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-40 w-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-h-[140px] overflow-y-auto scrollbar-thin">
          {filtered.slice(0, 5).map((email, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(email);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-[11px] text-zinc-300 hover:bg-zinc-850 hover:text-white border-b border-zinc-850/50 last:border-0 transition block cursor-pointer"
            >
              {email}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CompanyLogoWrapper = ({ company, size = 'small' }: { company: string; size?: 'small' | 'large' }) => {
  const [hasError, setHasError] = useState(false);

  const cleanName = company ? company.trim() : '?';
  const firstLetter = cleanName.charAt(0).toUpperCase();

  // Create a clean filename slug: e.g. "Google Inc." -> "google"
  const slug = cleanName.toLowerCase()
    .replace(/\b(inc|corp|co|ltd|llc|plc)\b\.?/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  const wrapperClass = size === 'large' ? 'w-8 h-8 rounded-lg text-xs' : 'w-5 h-5 rounded-md text-[9px]';
  const imgClass = size === 'large' ? 'w-6 h-6' : 'w-3.5 h-3.5';

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const bgStyle = {
    background: `hsla(${h}, 70%, 20%, 0.45)`,
    borderColor: `hsla(${h}, 80%, 40%, 0.3)`
  };
  const textStyle = {
    color: `hsla(${h}, 90%, 75%, 1)`
  };

  const isGeneric = ['?', 'saved', 'wishlist', 'applied', 'interview', 'offer', 'rejected', 'ghosted'].includes(slug);

  if (!hasError && !isGeneric && slug) {
    const localLogoUrl = `/company-logos/${slug}.png`;
    return (
      <div className={`${wrapperClass} overflow-hidden border border-zinc-800 bg-zinc-955 flex items-center justify-center shrink-0 shadow-inner`}>
        <img 
          src={localLogoUrl} 
          alt={cleanName} 
          onError={() => setHasError(true)} 
          className={`${imgClass} object-contain`}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${wrapperClass} border flex items-center justify-center font-black shrink-0 select-none font-mono shadow-sm`}
      style={bgStyle}
    >
      <span style={textStyle}>{firstLetter}</span>
    </div>
  );
};

const renderPlatformIcon = (platform: string, sizeClass = 'w-4 h-4') => {
  const p = platform.toLowerCase().trim();
  if (p === 'leetcode') {
    return <SiLeetcode className={`${sizeClass} text-amber-500`} />;
  }
  if (p === 'github') {
    return <SiGithub className={`${sizeClass} text-zinc-300`} />;
  }
  if (p === 'linkedin') {
    return <FaLinkedin className={`${sizeClass} text-blue-500`} />;
  }
  if (p === 'googlesheets' || p === 'google sheets' || p === 'google') {
    return <SiGooglesheets className={`${sizeClass} text-emerald-500`} />;
  }
  if (p === 'hackerrank') {
    return <SiHackerrank className={`${sizeClass} text-emerald-400`} />;
  }
  if (p === 'codeforces') {
    return <SiCodeforces className={`${sizeClass} text-red-500`} />;
  }
  if (p === 'codechef') {
    return <SiCodechef className={`${sizeClass} text-amber-600`} />;
  }
  return (
    <svg viewBox="0 0 24 24" className={`${sizeClass} stroke-current text-zinc-400 fill-none`} xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
};

const renderCompanyLogo = (companyName: string, size: 'small' | 'large' = 'small') => {
  return <CompanyLogoWrapper company={companyName} size={size} />;
};

export default function Home() {
  // Global Zustand Stores
  const {
    isLoggedIn,
    authView,
    googleSheetsConnected,
    googleSheetsId,
    googleSheetsTab,
    googleSheetsLogs,
    userProfile,
    activeWorkspaceId,
    applications,
    resumes,
    recruiters,
    emails,
    offers,
    automations,
    okrs,
    learnings,
    posts,
    journal,
    isConnectedGmail,
    isConnectedOutlook,
    searchQuery,
    agentLogs,

    // Auth Actions
    setAuthView,
    loginUser,
    signupUser,
    logoutUser,
    checkSession,
    resetPassword,

    // Normal actions
    updateProfile,
    setActiveWorkspace,
    setSearchQuery,
    addApplication,
    updateApplicationStatus,
    updateApplication,
    deleteApplication,
    updateResume,
    addResumeVersion,
    deleteResume,
    addRecruiter,
    updateRecruiter,
    deleteRecruiter,
    addRecruiterInteraction,
    connectEmail,
    disconnectEmail,
    syncEmailInbox,
    connectGoogleSheets,
    disconnectGoogleSheets,
    syncGoogleSheets,
    updateOfferStatus,
    addOffer,
    updateOffer,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    addLearningTopic,
    deleteLearningTopic,
    toggleKeyResult,
    addOkrGoal,
    updateOkrGoal,
    deleteOkrGoal,
    addJournalEntry,
    toggleAutomationActive,
    addAutomationRule,
    deleteAutomationRule,
    runAgentAction,
    addPost,
    upvotePost,
    notifications,
    markNotificationRead,
    addNotification,
    clearAgentLogs,
    connectLeetcode,
    disconnectLeetcode,
    syncLeetcode
  } = useAppStore();

  // Mounting check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    checkSession();
  }, [checkSession]);

  // Component UI tabs & panels
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [trackerStageFilter, setTrackerStageFilter] = useState<'All' | 'Wishlist' | 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted'>('All');
  const [sheetsLastSyncTime, setSheetsLastSyncTime] = useState<string>('2 min ago');
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Applications Database local filters
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbStatusFilter, setDbStatusFilter] = useState('All');
  const [dbResumeFilter, setDbResumeFilter] = useState('All');
  const [dbMethodFilter, setDbMethodFilter] = useState('All');
  const [dbEmailFilter, setDbEmailFilter] = useState('All');
  const [localExp, setLocalExp] = useState<ParsedExperience[]>([]);
  const [localEdu, setLocalEdu] = useState<ParsedEducation[]>([]);
  const [localProj, setLocalProj] = useState<ParsedProject[]>([]);
  const [activeEditorTab, setActiveEditorTab] = useState<'personal' | 'summary' | 'work' | 'education' | 'projects' | 'skills' | 'design'>('personal');
  const [showAtsDrawer, setShowAtsDrawer] = useState(false);
  const [expandedExpIdx, setExpandedExpIdx] = useState<number | null>(null);
  const [expandedEduIdx, setExpandedEduIdx] = useState<number | null>(null);
  const [expandedProjIdx, setExpandedProjIdx] = useState<number | null>(null);

  // FlowCV Resume Customizer states
  const [resumeSubTab, setResumeSubTab] = useState<'content' | 'customize' | 'ai-tools'>('content');
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [editingEntryType, setEditingEntryType] = useState<'experience' | 'education' | 'project' | null>(null);
  const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null);
  const [editingEntryData, setEditingEntryData] = useState<{
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    hidden: boolean;
  }>({ title: '', subtitle: '', startDate: '', endDate: '', location: '', description: '', hidden: false });

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [openResumeSections, setOpenResumeSections] = useState<{ [key: string]: boolean }>({
    personal: true,
    summary: false,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    certifications: false,
  });

  const toggleResumeSection = (section: string) => {
    setOpenResumeSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    if (!activeResume) return;
    const currentOrder = activeResume.sectionOrder ?? ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
    const newOrder = [...currentOrder];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx >= 0 && swapIdx < newOrder.length) {
      const temp = newOrder[idx];
      newOrder[idx] = newOrder[swapIdx];
      newOrder[swapIdx] = temp;
      updateResume(activeResume.id, { sectionOrder: newOrder });
    }
  };

  const handleAdjustSpacing = (field: 'fontSizePt' | 'lineHeight' | 'marginHorizontal' | 'marginVertical' | 'entrySpacing', direction: 'dec' | 'inc') => {
    if (!activeResume) return;
    const currentValue = activeResume[field] ?? {
      fontSizePt: 10.5,
      lineHeight: 1.25,
      marginHorizontal: 12,
      marginVertical: 12,
      entrySpacing: 12
    }[field];
    
    const step = {
      fontSizePt: 0.5,
      lineHeight: 0.05,
      marginHorizontal: 2,
      marginVertical: 2,
      entrySpacing: 2
    }[field];

    const limits = {
      fontSizePt: { min: 8, max: 18 },
      lineHeight: { min: 0.9, max: 2.2 },
      marginHorizontal: { min: 4, max: 32 },
      marginVertical: { min: 4, max: 32 },
      entrySpacing: { min: 0, max: 32 }
    }[field];

    const newValue = direction === 'inc' 
      ? Math.min(limits.max, currentValue + step) 
      : Math.max(limits.min, currentValue - step);
    
    const formattedValue = parseFloat(newValue.toFixed(2));
    updateResume(activeResume.id, { [field]: formattedValue });
  };

  // Sync selectedResumeId with the first resume in resumes list
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const activeResume = resumes.find(r => r.id === selectedResumeId) || resumes[0] || null;

  useEffect(() => {
    if (activeResume) {
      setLocalExp(parseExperience(activeResume.experience));
      setLocalEdu(parseEducation(activeResume.education));
      setLocalProj(parseProjects(activeResume.projects));
    } else {
      setLocalExp([]);
      setLocalEdu([]);
      setLocalProj([]);
    }
  }, [selectedResumeId]);

  // Load dynamic Google Font on preview canvas
  useEffect(() => {
    if (!activeResume || !activeResume.customFont) return;
    const fontId = 'dynamic-google-font';
    let link = document.getElementById(fontId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const formattedFontName = activeResume.customFont.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFontName}:wght@300;400;500;600;700;800&display=swap`;
  }, [activeResume?.customFont]);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authTrack, setAuthTrack] = useState('swe');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Google Sheets Inputs
  const [sheetInputId, setSheetInputId] = useState('');
  const [sheetInputTab, setSheetInputTab] = useState('Sheet1');
  const [isSheetsSyncing, setIsSheetsSyncing] = useState(false);

  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [previewResumeName, setPreviewResumeName] = useState<string>('');
  const [isResumeDragging, setIsResumeDragging] = useState(false);

  // Edit Modal Local States
  const [editCompany, setEditCompany] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [editWorkMode, setEditWorkMode] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Remote');
  const [editAppDate, setEditAppDate] = useState('');
  const [editEmailUsed, setEditEmailUsed] = useState('');
  const [editAppMethod, setEditAppMethod] = useState('');
  const [editCustomMethod, setEditCustomMethod] = useState('');
  const [editAppType, setEditAppType] = useState<'Full Time' | 'Internship' | 'Contract' | 'Part Time' | 'Freelance' | 'Apprenticeship'>('Full Time');
  const [editReferralUsed, setEditReferralUsed] = useState(false);
  const [editReferrerName, setEditReferrerName] = useState('');
  const [editReferrerLinkedin, setEditReferrerLinkedin] = useState('');
  const [editReferralNotes, setEditReferralNotes] = useState('');
  const [editStatus, setEditStatus] = useState<JobApplication['status']>('Applied');
  const [editShortlisted, setEditShortlisted] = useState(false);
  const [editResumeVersion, setEditResumeVersion] = useState('');
  const [editResumeFile, setEditResumeFile] = useState('');
  const [editResumeTags, setEditResumeTags] = useState<string[]>([]);
  const [editRounds, setEditRounds] = useState<any[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [editRecruiterName, setEditRecruiterName] = useState('');
  const [editRecruiterContact, setEditRecruiterContact] = useState('');
  const [editRecruiterFollowUp, setEditRecruiterFollowUp] = useState('');
  const [editFollowUpNotes, setEditFollowUpNotes] = useState('');
  const [editAttachments, setEditAttachments] = useState<any[]>([]);
  const [editNewTagInput, setEditNewTagInput] = useState('');

  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string>('');
  const [resumeUploadStatus, setResumeUploadStatus] = useState<string>('idle'); // 'idle' | 'uploading' | 'success' | 'failed'

  // Settings Redesign Local States
  const [settingsSection, setSettingsSection] = useState<'profile' | 'preferences' | 'integrations' | 'security'>('profile');
  const [isSettingsEditMode, setIsSettingsEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>({});
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCertInput, setNewCertInput] = useState('');
  const [showSheetsAdvanced, setShowSheetsAdvanced] = useState(false);
  const [leetcodeUsernameInput, setLeetcodeUsernameInput] = useState('');
  const [pairingToken, setPairingToken] = useState('');
  const [inputPairingToken, setInputPairingToken] = useState('');

  // Initialize tempProfile when entering Settings or switching edit mode
  useEffect(() => {
    if (activeTab === 'settings' && !isSettingsEditMode) {
      setTempProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        profilePhoto: userProfile.profilePhoto || '',
        experience: userProfile.experience || '',
        skills: userProfile.skills || [],
        education: userProfile.education || '',
        certifications: userProfile.certifications || [],
        github: userProfile.github || '',
        leetcode: userProfile.leetcode || '',
        linkedin: userProfile.linkedin || '',
        portfolio: userProfile.portfolio || '',
        theme: userProfile.theme || 'dark',
        timeZone: userProfile.timeZone || 'America/Los_Angeles',
        defaultWorkMode: userProfile.defaultWorkMode || 'Remote',
        defaultResumeVersion: userProfile.defaultResumeVersion || '',
        defaultEmailAccount: userProfile.defaultEmailAccount || '',
        defaultApplicationMethod: userProfile.defaultApplicationMethod || 'Company Careers Page',
        defaultLocationPreference: userProfile.defaultLocationPreference || 'Remote',
        language: userProfile.language || 'English',
        notificationInApp: userProfile.notifications?.inApp !== false,
        notificationEmail: userProfile.notifications?.email !== false,
        notificationPush: userProfile.notifications?.push !== false
      });
    }
  }, [activeTab, isSettingsEditMode, userProfile]);

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTempProfile((prev: any) => ({ ...prev, profilePhoto: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit Modal Accordion active sections
  const [openEditSections, setOpenEditSections] = useState<Record<string, boolean>>({
    'job-details': true,
    'tracking': false,
    'status': false,
    'resume': false,
    'interview': false,
    'notes': false,
    'attachments': false
  });

  const toggleEditSection = (section: string) => {
    setOpenEditSections(prev => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach(k => {
        next[k] = k === section ? !prev[k] : false;
      });
      return next;
    });
  };

  // Job Tracker Filter & Collapse States
  const [trackerWorkModeFilter, setTrackerWorkModeFilter] = useState<string>('All');
  const [trackerPriorityFilter, setTrackerPriorityFilter] = useState<string>('All');
  const [trackerReferralFilter, setTrackerReferralFilter] = useState<string>('All');
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({
    Wishlist: false,
    Applied: false,
    OA: false,
    Interview: false,
    Offer: false,
    Rejected: true,
    Ghosted: true
  });

  // Redesigned New Application Form states
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formLoc, setFormLoc] = useState('');
  const [formWorkMode, setFormWorkMode] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Remote');
  
  const [formAppDate, setFormAppDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [formEmailUsed, setFormEmailUsed] = useState('');
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [formAppMethod, setFormAppMethod] = useState('Company Careers Page');
  const [formCustomMethod, setFormCustomMethod] = useState('');
  const [formAppType, setFormAppType] = useState<'Full Time' | 'Internship' | 'Contract' | 'Part Time' | 'Freelance' | 'Apprenticeship'>('Full Time');
  const [formReferralUsed, setFormReferralUsed] = useState(false);
  const [formReferrerName, setFormReferrerName] = useState('');
  const [formReferrerLinkedin, setFormReferrerLinkedin] = useState('');
  const [formReferralNotes, setFormReferralNotes] = useState('');
  
  const [formStatus, setFormStatus] = useState<JobApplication['status']>('Applied');
  const [formShortlisted, setFormShortlisted] = useState(false);
  
  const [formResumeVersion, setFormResumeVersion] = useState('');
  const [formResumeFile, setFormResumeFile] = useState<string>('');
  const [formResumeMetadata, setFormResumeMetadata] = useState<{ name: string; uploadDate: string; lastUpdated: string } | null>(null);
  const [formResumeTags, setFormResumeTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const [formRounds, setFormRounds] = useState<any[]>([]);
  const [roundOpenState, setRoundOpenState] = useState<Record<string, boolean>>({});
  
  const [formNotes, setFormNotes] = useState('');
  const [formRecruiterName, setFormRecruiterName] = useState('');
  const [formRecruiterContact, setFormRecruiterContact] = useState('');
  const [formRecruiterFollowUp, setFormRecruiterFollowUp] = useState('');
  const [formFollowUpNotes, setFormFollowUpNotes] = useState('');
  
  const [formAttachments, setFormAttachments] = useState<{ name: string; url: string; uploadDate: string; size?: string }[]>([]);

  // Synchronize browser timezone with userProfile timezone
  useEffect(() => {
    if (userProfile) {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userProfile.timeZone !== browserTimeZone) {
        updateProfile({ timeZone: browserTimeZone });
      }
    }
  }, [userProfile, updateProfile]);

  const [lastEmailInitialized, setLastEmailInitialized] = useState<string | null>(null);

  // Load defaults from userProfile when page mounts or profile changes (for empty fields)
  useEffect(() => {
    if (userProfile) {
      const currentEmail = userProfile.email || '';
      const emailChanged = lastEmailInitialized !== currentEmail;

      const defaultEmail = (userProfile.email && userProfile.email !== 'alex.dev@gmail.com' && userProfile.defaultEmailAccount === 'alex.dev@gmail.com')
        ? userProfile.email
        : (userProfile.defaultEmailAccount || '');

      if (emailChanged) {
        setFormCompany('');
        setFormRole('');
        setFormUrl('');
        setFormLoc(userProfile.defaultLocationPreference || '');
        setFormWorkMode(userProfile.defaultWorkMode || 'Remote');
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        setFormAppDate(new Date(now.getTime() - offset).toISOString().slice(0, 16));
        setFormEmailUsed(defaultEmail);
        setFormAppMethod(userProfile.defaultApplicationMethod || 'Company Careers Page');
        setFormCustomMethod('');
        setFormAppType('Full Time');
        setFormReferralUsed(false);
        setFormReferrerName('');
        setFormReferrerLinkedin('');
        setFormReferralNotes('');
        setFormStatus('Applied');
        setFormShortlisted(false);
        setFormResumeVersion(userProfile.defaultResumeVersion || '');
        setFormResumeFile('');
        setFormResumeMetadata(null);
        setFormResumeTags([]);
        setFormRounds([]);
        setLastEmailInitialized(currentEmail);
      } else {
        setFormLoc(prev => prev || userProfile.defaultLocationPreference || '');
        setFormWorkMode(prev => prev === 'Remote' && userProfile.defaultWorkMode ? userProfile.defaultWorkMode : prev);
        setFormEmailUsed(prev => prev || defaultEmail);
        setFormAppMethod(prev => prev === 'Company Careers Page' && userProfile.defaultApplicationMethod ? userProfile.defaultApplicationMethod : prev);
        setFormResumeVersion(prev => prev || userProfile.defaultResumeVersion || '');
      }
    }
  }, [userProfile, lastEmailInitialized]);

  // Sub-tabs and drag reordering states for redesigned ATS-style form
  const [formSubTab, setFormSubTab] = useState<'details' | 'notes' | 'attachments'>('details');
  const [editFormSubTab, setEditFormSubTab] = useState<'details' | 'notes' | 'attachments'>('details');
  const [draggedRoundIndex, setDraggedRoundIndex] = useState<number | null>(null);
  const [draggedEditRoundIndex, setDraggedEditRoundIndex] = useState<number | null>(null);

  // Accordion active sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'job-details': true,
    'tracking': false,
    'status': false,
    'resume': false,
    'interview': false,
    'notes': false,
    'attachments': false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach(k => {
        next[k] = k === section ? !prev[k] : false;
      });
      return next;
    });
  };

  const handleOpenEditJobModal = (app: any) => {
    setEditingJob(app);
    setEditCompany(app.company || '');
    setEditRole(app.role || '');
    setEditUrl(app.jobUrl || '');
    setEditLoc(app.location || '');
    setEditWorkMode(app.workMode || 'Remote');
    setEditAppDate(app.appliedDate || '');
    setEditEmailUsed(app.appliedFromEmail || '');
    setEditAppMethod(app.source || 'Company Careers Page');
    setEditCustomMethod(app.customMethod || '');
    setEditAppType(app.applicationType || 'Full Time');
    setEditReferralUsed(app.referralUsed || false);
    setEditReferrerName(app.referrerName || '');
    setEditReferrerLinkedin(app.referrerLinkedin || '');
    setEditReferralNotes(app.referralNotes || '');
    setEditStatus(app.status || 'Applied');
    setEditShortlisted(app.shortlisted || false);
    setEditResumeVersion(app.resumeUsed || '');
    setEditResumeFile(app.resumeFile || '');
    setEditResumeTags(app.resumeTags || []);
    setEditRounds(app.interviewRounds || []);
    setEditNotes(app.notes || '');
    setEditRecruiterName(app.recruiterName || app.recruiterAssigned || '');
    setEditRecruiterContact(app.recruiterContact || '');
    setEditRecruiterFollowUp(app.recruiterFollowUp || '');
    setEditFollowUpNotes(app.followUpNotes || '');
    setEditAttachments(app.attachments || []);
    setUploadedResumeUrl(app.resumeFile || '');
    setResumeUploadStatus(app.resumeFile ? 'success' : 'idle');
    setOpenEditSections({
      'job-details': true,
      'tracking': false,
      'status': false,
      'resume': false,
      'interview': false,
      'notes': false,
      'attachments': false
    });
    setShowEditJobModal(true);
  };

  const applySmartTemplate = (templateName: 'swe' | 'product' | 'startup' | 'custom') => {
    let rounds: any[] = [];
    const timestamp = Date.now();
    if (templateName === 'swe') {
      rounds = [
        { id: `round-1-${timestamp}`, type: 'Coding Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' },
        { id: `round-2-${timestamp}`, type: 'Technical Assessment', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' },
        { id: `round-3-${timestamp}`, type: 'HR Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' }
      ];
    } else if (templateName === 'product') {
      rounds = [
        { id: `round-1-${timestamp}`, type: 'Technical Assessment', status: 'Pending', name: 'Online Assessment', date: '', time: '', meetingLink: '', notes: '' },
        { id: `round-2-${timestamp}`, type: 'Coding Round', status: 'Pending', name: 'Technical Round 1', date: '', time: '', meetingLink: '', notes: '' },
        { id: `round-3-${timestamp}`, type: 'Coding Round', status: 'Pending', name: 'Technical Round 2', date: '', time: '', meetingLink: '', notes: '' },
        { id: `round-4-${timestamp}`, type: 'Managerial Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' },
        { id: `round-5-${timestamp}`, type: 'HR Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' }
      ];
    } else if (templateName === 'startup') {
      rounds = [
        { id: `round-1-${timestamp}`, type: 'Coding Round', status: 'Pending', name: 'Technical Round', date: '', time: '', meetingLink: '', notes: '' },
        { id: `round-2-${timestamp}`, type: 'Final Interview', status: 'Pending', name: 'Founder Round', date: '', time: '', meetingLink: '', notes: '' }
      ];
    }
    setFormRounds(rounds);
    const newOpenState: Record<string, boolean> = {};
    rounds.forEach(r => {
      newOpenState[r.id] = false;
    });
    setRoundOpenState(newOpenState);
  };

  const addInterviewRound = () => {
    const rId = `round-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newRound = {
      id: rId,
      type: 'Technical Assessment',
      status: 'Pending',
      date: '',
      time: '',
      meetingLink: '',
      notes: ''
    };
    setFormRounds([...formRounds, newRound]);
    setRoundOpenState(prev => ({ ...prev, [rId]: true }));
  };

  const updateRoundField = (roundId: string, field: string, value: any) => {
    setFormRounds(formRounds.map(r => r.id === roundId ? { ...r, [field]: value } : r));
  };

  const deleteRound = (roundId: string) => {
    setFormRounds(formRounds.filter(r => r.id !== roundId));
  };

  const moveRound = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= formRounds.length) return;
    const updated = [...formRounds];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setFormRounds(updated);
  };

  const handleRoundDrop = (targetIdx: number) => {
    if (draggedRoundIndex === null || draggedRoundIndex === targetIdx) return;
    const reordered = [...formRounds];
    const [draggedItem] = reordered.splice(draggedRoundIndex, 1);
    reordered.splice(targetIdx, 0, draggedItem);
    setFormRounds(reordered);
    setDraggedRoundIndex(null);
  };

  const handleEditRoundDrop = (targetIdx: number) => {
    if (draggedEditRoundIndex === null || draggedEditRoundIndex === targetIdx) return;
    const reordered = [...editRounds];
    const [draggedItem] = reordered.splice(draggedEditRoundIndex, 1);
    reordered.splice(targetIdx, 0, draggedItem);
    setEditRounds(reordered);
    setDraggedEditRoundIndex(null);
  };

  const addResumeTag = () => {
    const tag = newTagInput.trim();
    if (tag && !formResumeTags.includes(tag)) {
      setFormResumeTags([...formResumeTags, tag]);
    }
    setNewTagInput('');
  };

  const removeResumeTag = (tagToRemove: string) => {
    setFormResumeTags(formResumeTags.filter(t => t !== tagToRemove));
  };

  const handleResumeUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormResumeMetadata({
          name: file.name,
          uploadDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          lastUpdated: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        });
        setFormResumeFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFallbackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.fileLink) {
        if (previewResume && previewResume.id) {
          updateApplication(previewResume.id, {
            resumeFile: data.fileLink,
            resumeUsed: 'Uploaded: ' + file.name
          });
          
          setPreviewResume((prev: any) => ({
            ...prev,
            name: file.name,
            fileUrl: data.fileLink
          }));
          setPreviewResumeName('Uploaded: ' + file.name);
        }
        addNotification(
          'Resume Uploaded',
          data.fileLink.includes('drive-mock')
            ? `Successfully loaded "${file.name}" locally.`
            : `Successfully saved "${file.name}" to Google Drive.`,
          'success'
        );
        return;
      }
      throw new Error(data.message || 'Drive API returned error.');
    } catch (err) {
      console.error("Fallback upload error, falling back to base64:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        if (base64Data && previewResume && previewResume.id) {
          updateApplication(previewResume.id, {
            resumeFile: base64Data,
            resumeUsed: 'Uploaded: ' + file.name
          });
          
          setPreviewResume((prev: any) => ({
            ...prev,
            name: file.name,
            fileUrl: base64Data
          }));
          setPreviewResumeName('Uploaded: ' + file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFallbackDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsResumeDragging(true);
  };

  const handleFallbackDragLeave = () => {
    setIsResumeDragging(false);
  };

  const handleFallbackDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsResumeDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.fileLink) {
        if (previewResume && previewResume.id) {
          updateApplication(previewResume.id, {
            resumeFile: data.fileLink,
            resumeUsed: 'Uploaded: ' + file.name
          });
          
          setPreviewResume((prev: any) => ({
            ...prev,
            name: file.name,
            fileUrl: data.fileLink
          }));
          setPreviewResumeName('Uploaded: ' + file.name);
        }
        addNotification(
          'Resume Uploaded',
          data.fileLink.includes('drive-mock')
            ? `Successfully loaded "${file.name}" locally.`
            : `Successfully saved "${file.name}" to Google Drive.`,
          'success'
        );
        return;
      }
      throw new Error(data.message || 'Drive API returned error.');
    } catch (err) {
      console.error("Fallback drop upload error, falling back to base64:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        if (base64Data && previewResume && previewResume.id) {
          updateApplication(previewResume.id, {
            resumeFile: base64Data,
            resumeUsed: 'Uploaded: ' + file.name
          });
          
          setPreviewResume((prev: any) => ({
            ...prev,
            name: file.name,
            fileUrl: base64Data
          }));
          setPreviewResumeName('Uploaded: ' + file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        url: '#',
        uploadDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown'
      }));
      setFormAttachments([...formAttachments, ...newAttachments]);
    }
  };

  // Job Overview and Resume Metrics calculations
  const workspaceApps = applications.filter(a => a.workspaceId === activeWorkspaceId);
  const totalApplicationsCount = workspaceApps.length;

  const activeApplications = workspaceApps.filter(a => {
    if (a.status === 'Rejected' || a.status === 'Ghosted' || a.status === 'Wishlist' || a.status === 'Saved') return false;
    if (['OA', 'Interview', 'Offer'].includes(a.status)) return true;
    if (a.status === 'Applied') {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 90);
      const appDate = new Date(a.appliedDate);
      return appDate >= dateLimit;
    }
    return false;
  });

  const shortlistedApplications = workspaceApps.filter(a => ['OA', 'Interview', 'Offer'].includes(a.status));
  const examApplications = workspaceApps.filter(a => a.status === 'OA');
  const interviewApplications = workspaceApps.filter(a => a.status === 'Interview');
  const rejectedApplications = workspaceApps.filter(a => a.status === 'Rejected');
  const wishlistApplications = workspaceApps.filter(a => a.status === 'Wishlist' || a.status === 'Saved');

  const inactiveApplications = workspaceApps.filter(a => {
    if (a.status === 'Rejected' || a.status === 'Ghosted') return true;
    if (a.status === 'Applied') {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 90);
      const appDate = new Date(a.appliedDate);
      return appDate < dateLimit;
    }
    return false;
  });

  const resumeApplications = workspaceApps.filter(a => a.resumeUsed);
  const distinctResumesUsedCount = new Set(resumeApplications.map(a => a.resumeUsed)).size;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Welcome back';
  };

  const handleDriveResumeUpload = async (file: File) => {
    setResumeUploadStatus('uploading');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Url = reader.result as string;
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const res = await fetch('/api/drive/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.success) {
            const isMockLink = data.fileLink && data.fileLink.includes('drive-mock');
            const finalLink = data.fileLink || base64Url;
            
            setUploadedResumeUrl(finalLink);
            setEditResumeFile(finalLink);
            setEditResumeVersion(`Uploaded: ${file.name}`);
            
            setResumeUploadStatus('success');
            addNotification(
              'Resume Uploaded',
              isMockLink 
                ? `Successfully loaded "${file.name}" locally.` 
                : `Successfully saved "${file.name}" to Google Drive.`,
              'success'
            );
          } else {
            throw new Error(data.message || 'Drive API returned error.');
          }
        } catch (uploadErr: any) {
          console.error(uploadErr);
          // Fallback to local Base64 on error as well
          setUploadedResumeUrl(base64Url);
          setEditResumeFile(base64Url);
          setEditResumeVersion(`Uploaded: ${file.name}`);
          setResumeUploadStatus('success');
          addNotification(
            'Resume Loaded Locally',
            `Successfully loaded "${file.name}" locally (Drive sync failed).`,
            'info'
          );
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setResumeUploadStatus('failed');
      alert(`Resume upload failed: ${err.message || err}`);
    }
  };

  const [showAddRecruiterModal, setShowAddRecruiterModal] = useState(false);
  const [showEditRecruiterModal, setShowEditRecruiterModal] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<any>(null);

  const [showAddOkrModal, setShowAddOkrModal] = useState(false);
  const [showAddLearningModal, setShowAddLearningModal] = useState(false);
  const [showAddAutomationModal, setShowAddAutomationModal] = useState(false);

  // Learning Checklist Inputs
  const [newChecklistText, setNewChecklistText] = useState<{ [topicId: string]: string }>({});

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Booting Nexrume Career OS...</span>
        </div>
      </div>
    );
  }

  // --- AUTH PORTAL REDIRECT ---
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 font-sans p-4 relative overflow-hidden select-none">
        {/* Glowing Background Radial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Glassmorphism Auth Card */}
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl flex flex-col justify-between relative z-10">
          
          {/* Brand Logo header */}
          <div className="text-center mb-6">
            <img 
              src="/brand-logo.png" 
              alt="Nexrume Logo" 
              className="w-14 h-14 rounded-2xl object-cover mx-auto"
            />
            <h1 className="font-extrabold text-white text-xl tracking-wide mt-3 leading-none">NEXRUME</h1>
            <span className="text-[10px] text-zinc-500 tracking-widest font-semibold uppercase block mt-1">Autonomous Career Platform</span>
          </div>

          {/* Tab Views */}
          {authView === 'login' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white text-center">Login to your Operating System</h2>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Email Account</label>
                  <input 
                    type="email" 
                    placeholder="alex.dev@gmail.com" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-zinc-400">Password</label>
                    <button 
                      onClick={() => setAuthView('forgot')}
                      className="text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  const success = loginUser(authEmail || 'alex.dev@gmail.com', authPassword || '1234');
                  if (!success) alert("Please enter a valid email and password.");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/10 mt-2"
              >
                Sign In
              </button>

              <div className="text-center text-[11px] text-zinc-500 mt-2">
                Don't have an account?{" "}
                <button onClick={() => setAuthView('signup')} className="text-indigo-400 hover:underline font-semibold">
                  Register here
                </button>
              </div>

              {/* OAuth Providers */}
              <div className="pt-4 border-t border-zinc-850 space-y-2">
                <span className="text-[10px] text-zinc-500 text-center block font-bold uppercase tracking-wider">Or OAuth Secure Login</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => window.location.href = '/api/auth/google/login'}
                    className="bg-zinc-950 border border-zinc-850 py-2 rounded-lg text-[10px] text-zinc-300 font-bold hover:bg-zinc-900 transition flex items-center justify-center gap-1"
                  >
                    <span>Google</span>
                  </button>
                  <button 
                    onClick={() => alert("Please use the Google login option to authenticate with real Google OAuth.")}
                    className="bg-zinc-950 border border-zinc-850 py-2 rounded-lg text-[10px] text-zinc-300 font-bold hover:bg-zinc-900 transition flex items-center justify-center gap-1"
                  >
                    <span>GitHub</span>
                  </button>
                  <button 
                    onClick={() => alert("Please use the Google login option to authenticate with real Google OAuth.")}
                    className="bg-zinc-950 border border-zinc-855 py-2 rounded-lg text-[10px] text-zinc-300 font-bold hover:bg-zinc-900 transition flex items-center justify-center gap-1"
                  >
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {authView === 'signup' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white text-center">Create your Career Workspace</h2>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Alex Dev" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded text-zinc-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Email Account</label>
                  <input 
                    type="email" 
                    placeholder="alex@domain.com" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded text-zinc-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Preferred Career Track</label>
                  <select 
                    value={authTrack} 
                    onChange={(e) => setAuthTrack(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded text-zinc-350 outline-none"
                  >
                    <option value="swe">Software Engineering</option>
                    <option value="aiml">AI / Machine Learning</option>
                    <option value="pm">Product Management</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!authName || !authEmail) {
                    alert("Please fill out all fields.");
                    return;
                  }
                  signupUser(authName, authEmail, authTrack);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2.5 rounded-lg mt-2"
              >
                Register & Initialize
              </button>

              <div className="text-center text-[11px] text-zinc-500">
                Already registered?{" "}
                <button onClick={() => setAuthView('login')} className="text-indigo-400 hover:underline font-semibold">
                  Log in
                </button>
              </div>
            </div>
          )}

          {authView === 'forgot' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white text-center">Reset Platform Password</h2>
              
              {!resetSent ? (
                <div className="space-y-3 text-xs">
                  <p className="text-zinc-500 leading-relaxed text-center">
                    Enter your email. The AI Security system will trigger a verification code logs alert.
                  </p>
                  <div>
                    <label className="text-zinc-400 block mb-1">Email Account</label>
                    <input 
                      type="email" 
                      placeholder="alex.dev@gmail.com" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (!authEmail) {
                        alert("Please enter your email.");
                        return;
                      }
                      resetPassword(authEmail);
                      setResetSent(true);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2.5 rounded-lg mt-2"
                  >
                    Send Verification Code
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs text-center">
                  <MailCheck className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
                  <p className="text-zinc-300 font-bold">Code Sent Successfully!</p>
                  <p className="text-zinc-500 leading-relaxed">
                    A code has been simulated in the **AI Agent Logs**. You can check the logs inside the workspace to find verification items.
                  </p>
                  <button 
                    onClick={() => {
                      setResetSent(false);
                      setAuthView('login');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-850 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-350 mt-2"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- FILTER CORE DATASETS ---
  const filteredApps = applications.filter(app => {
    const matchesSearch = searchQuery.trim() === '' || 
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jd.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWorkspace = app.workspaceId === activeWorkspaceId;
    return matchesSearch && matchesWorkspace;
  });

  return (
    <div className="flex h-screen w-screen bg-zinc-950 font-sans overflow-hidden text-zinc-300">
      
      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Header toolbar */}
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Workspace views routing */}
        <main className={`flex-1 bg-zinc-950 relative ${activeTab === 'tracker' ? 'h-auto overflow-y-auto p-4 space-y-6 lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:flex lg:flex-col lg:p-6' : 'overflow-y-auto p-6 space-y-6 scrollbar-thin'}`}>
          
          {/* BACKGROUND GRIDS FOR PREMIUM GLOW LOOK */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (() => {
            const totalAppsCount = workspaceApps.length;
            const isLeetcodeContestShown = !!(userProfile.leetcodeRating && userProfile.leetcodeRating > 0 && userProfile.leetcodeContestsAttended && userProfile.leetcodeContestsAttended > 0);
            const isAcceptanceRateShown = !!(userProfile.leetcodeAcceptanceRate !== undefined && userProfile.leetcodeAcceptanceRate !== null && userProfile.leetcodeAcceptanceRate > 0);
            const leetcodeDisplayRank = userProfile.leetcodeRank
              ? (isLeetcodeContestShown && userProfile.leetcodeRank >= 1000000
                  ? `${(userProfile.leetcodeRank / 1000000).toFixed(1)}M`
                  : `#${userProfile.leetcodeRank.toLocaleString()}`)
              : '—';

            const uniqueResumes = ['All', ...Array.from(new Set(workspaceApps.map(a => a.resumeUsed).filter(Boolean)))];
            const uniqueMethods = ['All', ...Array.from(new Set(workspaceApps.map(a => a.source).filter(Boolean)))];
            const uniqueEmails = ['All', ...Array.from(new Set(workspaceApps.map(a => a.appliedFromEmail).filter(Boolean)))];
            const uniqueStatuses = ['All', 'Wishlist', 'Saved', 'Applied', 'OA', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Ghosted', 'Withdrawn'];

            const filteredDbApps = workspaceApps.filter(app => {
              const matchesSearch = dbSearchQuery.trim() === '' || 
                app.company.toLowerCase().includes(dbSearchQuery.toLowerCase()) || 
                app.role.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
                (app.notes && app.notes.toLowerCase().includes(dbSearchQuery.toLowerCase()));

              const matchesStatus = dbStatusFilter === 'All' || app.status === dbStatusFilter;
              const matchesResume = dbResumeFilter === 'All' || app.resumeUsed === dbResumeFilter;
              const matchesMethod = dbMethodFilter === 'All' || app.source === dbMethodFilter;
              const matchesEmail = dbEmailFilter === 'All' || app.appliedFromEmail === dbEmailFilter;

              return matchesSearch && matchesStatus && matchesResume && matchesMethod && matchesEmail;
            });
            const appliedAppsCount = workspaceApps.filter(a => a.status === 'Applied').length;
            const savedAppsCount = workspaceApps.filter(a => a.status === 'Saved').length;
            const wishlistAppsCount = workspaceApps.filter(a => a.status === 'Wishlist').length;
            const interviewingAppsCount = workspaceApps.filter(a => a.status === 'Interview' || a.status === 'OA' || a.status === 'Assessment').length;
            const offersAppsCount = workspaceApps.filter(a => a.status === 'Offer').length;
            const rejectedAppsCount = workspaceApps.filter(a => a.status === 'Rejected').length;

            const appsThisWeek = workspaceApps.filter(a => {
              if (!a.appliedDate) return false;
              const d = new Date(a.appliedDate);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - d.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 7;
            }).length;

            const appsThisMonth = workspaceApps.filter(a => {
              if (!a.appliedDate) return false;
              const d = new Date(a.appliedDate);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - d.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 30;
            }).length;

            const roleCounts = workspaceApps.reduce((acc, a) => {
              if (a.role) {
                acc[a.role] = (acc[a.role] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>);
            const mostTargetedRoleArr = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
            const mostTargetedRole = mostTargetedRoleArr[0] ? `${mostTargetedRoleArr[0][0]} (${mostTargetedRoleArr[0][1]}x)` : 'No data yet';

            const locationCounts = workspaceApps.reduce((acc, a) => {
              if (a.location) {
                acc[a.location] = (acc[a.location] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>);
            const mostTargetedLocArr = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);
            const mostTargetedLocation = mostTargetedLocArr[0] ? `${mostTargetedLocArr[0][0]} (${mostTargetedLocArr[0][1]}x)` : 'No data yet';

            const remoteCount = workspaceApps.filter(a => a.workMode === 'Remote').length;
            const onsiteCount = workspaceApps.filter(a => a.workMode === 'Onsite').length;
            const hybridCount = workspaceApps.filter(a => a.workMode === 'Hybrid').length;

            const highestPriorityCount = workspaceApps.filter(a => a.priority === 'High' || a.priority === 'Critical').length;
            const logsToDisplay = agentLogs || [];

            const interviewsCount = workspaceApps.reduce((acc, app) => {
              const rounds = app.interviewRounds || [];
              const scheduled = rounds.filter(r => r.status === 'Scheduled').length;
              return acc + scheduled;
            }, 0);

            const upcomingInterviews = workspaceApps.reduce((acc, app) => {
              const rounds = app.interviewRounds || [];
              rounds.forEach(r => {
                if (r.status === 'Scheduled' || r.status === 'Pending') {
                  acc.push({
                    appId: app.id,
                    company: app.company,
                    role: app.role,
                    roundId: r.id,
                    type: r.type,
                    name: r.name,
                    status: r.status,
                    date: r.date,
                    time: r.time,
                    meetingLink: r.meetingLink,
                    notes: r.notes
                  });
                }
              });
              return acc;
            }, [] as any[]);

            upcomingInterviews.sort((a, b) => {
              if (a.status === 'Scheduled' && b.status !== 'Scheduled') return -1;
              if (a.status !== 'Scheduled' && b.status === 'Scheduled') return 1;
              const dateA = a.date ? new Date(a.date).getTime() : Infinity;
              const dateB = b.date ? new Date(b.date).getTime() : Infinity;
              return dateA - dateB;
            });

            const sortedRecentApps = [...workspaceApps].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()).slice(0, 5);

            const companyCounts = workspaceApps.reduce((acc, app) => {
              acc[app.company] = (acc[app.company] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const topAppliedCompany = Object.entries(companyCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'No data yet';

            const resumeCounts = workspaceApps.reduce((acc, app) => {
              if (app.resumeUsed) {
                acc[app.resumeUsed] = (acc[app.resumeUsed] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>);
            const mostUsedResume = Object.entries(resumeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'No data yet';

            const interviewStageApps = workspaceApps.filter(app => 
              ['Interview', 'OA', 'Assessment', 'Offer', 'Rejected'].includes(app.status) || 
              (app.interviewRounds && app.interviewRounds.length > 0)
            ).length;
            const interviewRate = workspaceApps.length > 0 ? Math.round((interviewStageApps / workspaceApps.length) * 100) : 0;

            const offerStageApps = workspaceApps.filter(app => app.status === 'Offer').length;
            const offerRate = interviewStageApps > 0 ? Math.round((offerStageApps / interviewStageApps) * 100) : 0;

            return (
              <div className="flex flex-col gap-8 animate-fade-in relative z-10">
                <div className="bg-gradient-to-b from-zinc-900/85 via-zinc-900/40 to-zinc-950/20 border border-zinc-800/80 py-4 md:py-5 px-6 rounded-3xl relative overflow-hidden backdrop-blur-md flex flex-col items-center text-center gap-3 shadow-2xl">
                  {/* Purple radial glow in center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-2 max-w-2xl flex flex-col items-center w-full">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent select-none">
                      {getGreeting()}, {userProfile.name}
                    </h2>
                    
                    {/* Counters Grid */}
                    <div className="flex flex-wrap items-center justify-center gap-2 select-none pt-0.5">
                      <div className="bg-zinc-950/40 border border-zinc-850/60 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm hover:border-zinc-800 transition">
                        <span className="text-[8.5px] text-zinc-505 font-bold uppercase tracking-wider">Applications</span>
                        <span className="font-extrabold text-indigo-400 font-mono text-xs">{totalAppsCount}</span>
                      </div>
                      <div className="bg-zinc-955/40 border border-zinc-850/60 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm hover:border-zinc-800 transition">
                        <span className="text-[8.5px] text-zinc-505 font-bold uppercase tracking-wider">Interviews</span>
                        <span className="font-extrabold text-amber-400 font-mono text-xs">{interviewsCount}</span>
                      </div>
                      <div className="bg-zinc-955/40 border border-zinc-850/60 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm hover:border-zinc-800 transition">
                        <span className="text-[8.5px] text-zinc-505 font-bold uppercase tracking-wider">Offers</span>
                        <span className="font-extrabold text-emerald-400 font-mono text-xs">{offersAppsCount}</span>
                      </div>
                    </div>

                    {/* Streak & LeetCode & Goals single horizontal row */}
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl pt-2.5 border-t border-zinc-800/40 mt-1 select-none">
                      {/* Streak display */}
                      <div className="bg-zinc-955/15 border border-zinc-900/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <span className="text-sm">🔥</span>
                        <div className="flex flex-col text-left leading-none">
                          <span className="text-[7.5px] text-zinc-505 font-extrabold uppercase tracking-wider">Search Streak</span>
                          <span className="text-zinc-200 font-mono font-bold text-xs mt-0.5">{userProfile.jobSearchStreakCurrent || 0}d / {userProfile.jobSearchStreakBest || 0}d max</span>
                        </div>
                      </div>

                      {/* LeetCode status */}
                      <div className="bg-zinc-955/15 border border-zinc-900/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        {renderPlatformIcon('leetcode', 'w-4 h-4')}
                        <div className="flex flex-col text-left leading-none">
                          <span className="text-[7.5px] text-zinc-505 font-extrabold uppercase tracking-wider">LeetCode</span>
                          <span className="text-zinc-200 font-mono font-bold text-xs mt-0.5">{userProfile.leetcodeSolved || 0} Solved</span>
                        </div>
                      </div>

                      {/* Weekly goal */}
                      <div className="bg-zinc-955/15 border border-zinc-900/60 px-3 py-1.5 rounded-xl flex flex-col justify-center gap-1 text-left min-w-[110px]">
                        <div className="flex justify-between text-[7.5px] font-bold text-zinc-505 leading-none">
                          <span>WEEKLY GOAL</span>
                          <span className="font-mono text-zinc-350">{appsThisWeek} / 10</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850/10">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, (appsThisWeek / 10) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Monthly goal */}
                      <div className="bg-zinc-955/15 border border-zinc-900/60 px-3 py-1.5 rounded-xl flex flex-col justify-center gap-1 text-left min-w-[110px]">
                        <div className="flex justify-between text-[7.5px] font-bold text-zinc-505 leading-none">
                          <span>MONTHLY GOAL</span>
                          <span className="font-mono text-zinc-350">{appsThisMonth} / 30</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850/10">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, (appsThisMonth / 30) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-full max-w-[150px] pt-0.5">
                    <button 
                      onClick={() => setActiveTab('tracker')}
                      className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-1.5 px-3 rounded-xl text-[10px] transition duration-200 hover:scale-[1.02] flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/10 cursor-pointer border border-indigo-550/25"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Application</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">
                    Dashboard Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div 
                      onClick={() => {
                        setTrackerStageFilter('All');
                        setActiveTab('tracker');
                      }}
                      className="bg-zinc-900/40 border border-zinc-800/30 hover:border-indigo-500/50 hover:shadow-[0_0_12px_rgba(99,102,241,0.15)] p-4 rounded-xl flex flex-col justify-between shadow-md transition duration-200 hover:scale-[1.02] hover:bg-zinc-900/60 cursor-pointer backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Total Jobs</span>
                        <Layers className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-2xl font-bold font-mono text-zinc-100">{totalAppsCount}</span>
                        <span className="text-[9px] text-zinc-500 font-bold px-1.5 py-0.5 rounded bg-zinc-950/40">Total</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        setTrackerStageFilter('Applied');
                        setActiveTab('tracker');
                      }}
                      className="bg-zinc-900/40 border border-zinc-800/30 hover:border-blue-500/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] p-4 rounded-xl flex flex-col justify-between shadow-md transition duration-200 hover:scale-[1.02] hover:bg-zinc-900/60 cursor-pointer backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Applied</span>
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-2xl font-bold font-mono text-blue-400">{appliedAppsCount}</span>
                        <span className="text-[9px] text-blue-500/80 font-bold px-1.5 py-0.5 rounded bg-blue-950/20">
                          {totalAppsCount > 0 ? Math.round((appliedAppsCount / totalAppsCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        setTrackerStageFilter('Wishlist');
                        setActiveTab('tracker');
                      }}
                      className="bg-zinc-900/40 border border-zinc-800/30 hover:border-zinc-400/50 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] p-4 rounded-xl flex flex-col justify-between shadow-md transition duration-200 hover:scale-[1.02] hover:bg-zinc-900/60 cursor-pointer backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Saved</span>
                        <Bookmark className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-2xl font-bold font-mono text-zinc-300">{savedAppsCount}</span>
                        <span className="text-[9px] text-zinc-500 font-bold px-1.5 py-0.5 rounded bg-zinc-950/40">
                          {totalAppsCount > 0 ? Math.round((savedAppsCount / totalAppsCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        setTrackerStageFilter('Interview');
                        setActiveTab('tracker');
                      }}
                      className="bg-zinc-900/40 border border-zinc-800/30 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] p-4 rounded-xl flex flex-col justify-between shadow-md transition duration-200 hover:scale-[1.02] hover:bg-zinc-900/60 cursor-pointer backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Interviewing</span>
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-2xl font-bold font-mono text-amber-400">{interviewingAppsCount}</span>
                        <span className="text-[9px] text-amber-500/80 font-bold px-1.5 py-0.5 rounded bg-amber-950/20">
                          {totalAppsCount > 0 ? Math.round((interviewingAppsCount / totalAppsCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        setTrackerStageFilter('Offer');
                        setActiveTab('tracker');
                      }}
                      className="bg-zinc-900/40 border border-zinc-800/30 hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] p-4 rounded-xl flex flex-col justify-between shadow-md transition duration-200 hover:scale-[1.02] hover:bg-zinc-900/60 cursor-pointer backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Offers</span>
                        <Award className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-2xl font-bold font-mono text-emerald-400">{offersAppsCount}</span>
                        <span className="text-[9px] text-emerald-500/80 font-bold px-1.5 py-0.5 rounded bg-emerald-950/20">
                          {totalAppsCount > 0 ? Math.round((offersAppsCount / totalAppsCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        setTrackerStageFilter('Rejected');
                        setActiveTab('tracker');
                      }}
                      className="bg-zinc-900/40 border border-zinc-800/30 hover:border-rose-500/50 hover:shadow-[0_0_12px_rgba(244,63,94,0.15)] p-4 rounded-xl flex flex-col justify-between shadow-md transition duration-200 hover:scale-[1.02] hover:bg-zinc-900/60 cursor-pointer backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Rejected</span>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-2xl font-bold font-mono text-rose-500">{rejectedAppsCount}</span>
                        <span className="text-[9px] text-rose-500/80 font-bold px-1.5 py-0.5 rounded bg-rose-950/20">
                          {totalAppsCount > 0 ? Math.round((rejectedAppsCount / totalAppsCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applications Database (Full Width, Direct Child of tab container to prevent column layout height issues) */}
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col">
                  {/* Card Header with consolidated actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-zinc-800 pb-3 gap-3">
                    <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-400" />
                        <span>Applications Database</span>
                        <span className="text-[10px] font-bold text-zinc-400 font-mono px-2 py-0.5 bg-zinc-950 border border-zinc-850 rounded-full">
                          {totalAppsCount} Records
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 border-t border-zinc-800/40 pt-2 w-full sm:w-auto sm:border-t-0 sm:pt-0 sm:border-l sm:pl-3">
                        <span className={`flex items-center gap-1.5 text-[9.5px] font-bold px-2 py-0.5 rounded border select-none ${
                          googleSheetsConnected 
                            ? 'bg-emerald-955/30 border-emerald-900/40 text-emerald-400' 
                            : 'bg-zinc-955/20 border-zinc-850 text-zinc-550'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${googleSheetsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-650'}`}></span>
                          {googleSheetsConnected ? 'Sheets Connected' : 'Sheets Disconnected'}
                        </span>
                        {googleSheetsConnected && (
                          <span className="text-[9.5px] text-zinc-500 font-mono">
                            Last Sync: {sheetsLastSyncTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {googleSheetsConnected && googleSheetsId && (
                        <>
                          <a 
                            href={`https://docs.google.com/spreadsheets/d/${googleSheetsId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 font-bold py-1.5 px-3 border border-zinc-800 rounded-xl text-[10px] transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3 text-zinc-450" />
                            <span>Open Google Sheets</span>
                          </a>
                          <button
                            onClick={async () => {
                              setIsSheetsSyncing(true);
                              try {
                                await syncGoogleSheets();
                                setSheetsLastSyncTime('Just now');
                              } catch (e) {}
                              setIsSheetsSyncing(false);
                            }}
                            disabled={isSheetsSyncing}
                            className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 font-bold py-1.5 px-3 border border-zinc-800 rounded-xl text-[10px] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isSheetsSyncing ? 'animate-spin' : ''}`} />
                            <span>Refresh Sync</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedResumeId(resumes[0]?.id || '');
                          setActiveTab('settings');
                        }}
                        className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-1.5 px-3 rounded-xl text-[10px] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Sync Settings</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Filter Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-3.5 bg-zinc-955/35 border border-zinc-850 rounded-xl">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-3.5 h-3.5 text-zinc-500" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Search company or role..." 
                        value={dbSearchQuery}
                        onChange={e => setDbSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 h-[32px] bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-zinc-350 placeholder-zinc-650 outline-none transition"
                      />
                    </div>
                    <div>
                      <select 
                        value={dbStatusFilter}
                        onChange={e => setDbStatusFilter(e.target.value)}
                        className="w-full h-[32px] bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-zinc-350 px-2.5 outline-none cursor-pointer transition"
                      >
                        {uniqueStatuses.map(st => (
                          <option key={st} value={st}>{st === 'All' ? 'Status: All' : st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select 
                        value={dbResumeFilter}
                        onChange={e => setDbResumeFilter(e.target.value)}
                        className="w-full h-[32px] bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-zinc-350 px-2.5 outline-none cursor-pointer transition"
                      >
                        {uniqueResumes.map(res => (
                          <option key={res} value={res}>{res === 'All' ? 'Resume: All' : res.replace('Uploaded: ', '')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select 
                        value={dbMethodFilter}
                        onChange={e => setDbMethodFilter(e.target.value)}
                        className="w-full h-[32px] bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-zinc-350 px-2.5 outline-none cursor-pointer transition"
                      >
                        {uniqueMethods.map(m => (
                          <option key={m} value={m}>{m === 'All' ? 'Method: All' : m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select 
                        value={dbEmailFilter}
                        onChange={e => setDbEmailFilter(e.target.value)}
                        className="w-full h-[32px] bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-zinc-350 px-2.5 outline-none cursor-pointer transition"
                      >
                        {uniqueEmails.map(em => (
                          <option key={em} value={em}>{em === 'All' ? 'Email: All' : em}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select disabled className="w-full h-[32px] bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-500 px-2.5 outline-none cursor-not-allowed opacity-60">
                        <option>Date: All Time</option>
                      </select>
                    </div>
                  </div>

                  {/* Table area */}
                  <div className="overflow-x-auto w-full scrollbar-thin rounded-xl border border-zinc-850 bg-zinc-955/40">
                    <div className="max-h-[400px] overflow-y-auto relative scrollbar-thin">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-zinc-950 z-20 border-b border-zinc-850 shadow-md">
                          <tr>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center w-12">Logo</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider">Company</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider">Role</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Status</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Method</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Email</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Resume Version</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Interview Stage</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Applied Date</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Last Updated</th>
                            <th className="p-3 font-extrabold uppercase text-[9.5px] text-zinc-400 tracking-wider text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50">
                          {filteredDbApps.map((app) => {
                            const statusColors: Record<string, string> = {
                              Applied: 'bg-blue-955/35 text-blue-400 border-blue-900/25',
                              Saved: 'bg-zinc-850/80 text-zinc-350 border-zinc-800/40',
                              Wishlist: 'bg-purple-955/35 text-purple-400 border-purple-900/25',
                              Interview: 'bg-amber-955/35 text-amber-400 border-amber-900/25',
                              OA: 'bg-purple-955/35 text-purple-400 border-purple-900/25',
                              Assessment: 'bg-purple-955/35 text-purple-400 border-purple-900/25',
                              Offer: 'bg-emerald-955/35 text-emerald-400 border-emerald-900/25',
                              Rejected: 'bg-rose-955/35 text-rose-400 border-rose-900/25',
                            };
                            const statusClass = statusColors[app.status] || 'bg-zinc-850 text-zinc-350 border-zinc-800';

                            const activeRound = app.interviewRounds?.find(r => r.status === 'Scheduled' || r.status === 'Pending');

                            return (
                              <tr 
                                key={app.id} 
                                onClick={() => handleOpenEditJobModal(app)}
                                className={`hover:bg-zinc-900/40 transition cursor-pointer group border-zinc-900 ${
                                  app.shortlisted 
                                    ? 'bg-amber-955/15 border-l-2 border-l-amber-500/50' 
                                    : ''
                                }`}
                              >
                                <td className="p-3 text-center whitespace-nowrap w-12">
                                  <div className="flex justify-center">
                                    {renderCompanyLogo(app.company, 'large')}
                                  </div>
                                </td>
                                <td className="p-3 font-bold text-zinc-150 group-hover:text-white transition whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    {app.shortlisted && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                                    <span>{app.company}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-zinc-350 font-medium whitespace-nowrap">{app.role}</td>
                                <td className="p-3 text-center whitespace-nowrap">
                                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusClass}`}>
                                    {app.status}
                                  </span>
                                </td>
                                <td className="p-3 text-center text-zinc-400 whitespace-nowrap">{app.source || '—'}</td>
                                <td className="p-3 text-center text-zinc-400 whitespace-nowrap font-mono">{app.appliedFromEmail || '—'}</td>
                                <td className="p-3 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                  {app.resumeFile || app.resumeUsed ? (
                                    <button
                                      onClick={() => {
                                        if (app.resumeFile) {
                                          setPreviewResume({
                                            id: app.id,
                                            name: app.resumeUsed?.replace('Uploaded: ', '') || app.resumeFile.split('/').pop()?.split('\\').pop() || 'Resume Document',
                                            fileUrl: app.resumeFile,
                                            uploadDate: app.appliedDate || new Date().toLocaleDateString(),
                                            isMockFile: true
                                          });
                                          setPreviewResumeName(app.resumeUsed || 'Uploaded Resume');
                                        } else {
                                          const linkedRes = resumes.find(r => r.name === app.resumeUsed);
                                          if (linkedRes) {
                                            setPreviewResume(linkedRes);
                                            setPreviewResumeName(linkedRes.name);
                                          } else {
                                            setPreviewResume({
                                              id: app.id,
                                              name: app.resumeUsed || 'Resume Document',
                                              fileUrl: '',
                                              uploadDate: app.appliedDate || new Date().toLocaleDateString(),
                                              isMockFile: true
                                            });
                                            setPreviewResumeName(app.resumeUsed || 'Uploaded Resume');
                                          }
                                        }
                                      }}
                                      className="text-zinc-350 hover:text-indigo-400 transition font-bold flex items-center gap-1 mx-auto text-[11px]"
                                      title="Preview Resume"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                      <span className="truncate max-w-[100px]">{app.resumeUsed ? app.resumeUsed.replace('Uploaded: ', '') : 'View Resume'}</span>
                                    </button>
                                  ) : (
                                    <span className="text-zinc-655 italic">—</span>
                                  )}
                                </td>
                                <td className="p-3 text-center whitespace-nowrap">
                                  {app.interviewRounds && app.interviewRounds.length > 0 ? (
                                    <span className="text-[11px] font-medium text-indigo-400">
                                      {activeRound 
                                        ? `${activeRound.name || activeRound.type} (${activeRound.status})` 
                                        : `Completed (${app.interviewRounds.length} rounds)`}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-655 italic text-[11px]">No rounds</span>
                                  )}
                                </td>
                                <td className="p-3 text-center text-zinc-455 font-mono whitespace-nowrap">{app.appliedDate || '—'}</td>
                                <td className="p-3 text-center text-zinc-455 font-mono whitespace-nowrap">
                                  {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : app.appliedDate || '—'}
                                </td>
                                <td className="p-3 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center justify-center gap-2.5">
                                    {app.jobUrl && (
                                      <a 
                                        href={app.jobUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-zinc-555 hover:text-indigo-400 transition"
                                        title="Open Job Link"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    <button
                                      onClick={() => handleOpenEditJobModal(app)}
                                      className="text-zinc-555 hover:text-indigo-400 transition"
                                      title="Edit Application"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete your application for ${app.role} at ${app.company}?`)) {
                                          deleteApplication(app.id);
                                        }
                                      }}
                                      className="text-zinc-555 hover:text-rose-500 transition"
                                      title="Delete Application"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {workspaceApps.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="py-12 text-center text-zinc-500">
                                <p className="text-xs font-bold text-zinc-350">No applications available.</p>
                                <p className="text-[11px] text-zinc-550 mt-1 max-w-sm mx-auto">
                                  Applications added from Job Tracker automatically appear here.
                                </p>
                              </td>
                            </tr>
                          ) : filteredDbApps.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="py-12 text-center text-zinc-500">
                                <p className="text-xs font-bold text-zinc-350">No matching applications found.</p>
                                <p className="text-[11px] text-zinc-555 mt-1 max-w-sm mx-auto">
                                  No applications match your active search filters. Try clearing some selections.
                                </p>
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Main Workspace Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                  {/* Left Side: Dynamic Pipeline Trackers (col-span-8) */}
                  <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Career Progress Widget */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col relative overflow-hidden backdrop-blur-md">
                      <div className="border-b border-zinc-800 pb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span>Career Progress Pipeline</span>
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Active pipeline tracking progress stages</p>
                      </div>
                      
                      <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 py-4 select-none w-full">
                        {[
                          { stage: 'Wishlist', label: 'Saved', count: savedAppsCount + wishlistAppsCount, activeColor: 'text-indigo-400 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.25)] bg-indigo-950/20', dimColor: 'text-zinc-550 border-zinc-850 bg-zinc-950/20' },
                          { stage: 'Applied', label: 'Applied', count: appliedAppsCount, activeColor: 'text-blue-400 border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.25)] bg-blue-955/20', dimColor: 'text-zinc-550 border-zinc-850 bg-zinc-950/20' },
                          { stage: 'OA', label: 'Assessment', count: workspaceApps.filter(a => a.status === 'OA' || a.status === 'Assessment').length, activeColor: 'text-purple-400 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.25)] bg-purple-955/20', dimColor: 'text-zinc-550 border-zinc-850 bg-zinc-950/20' },
                          { stage: 'Interview', label: 'Interview', count: workspaceApps.filter(a => a.status === 'Interview').length, activeColor: 'text-amber-400 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] bg-amber-955/20', dimColor: 'text-zinc-550 border-zinc-850 bg-zinc-950/20' },
                          { stage: 'Offer', label: 'Offer', count: offersAppsCount, activeColor: 'text-emerald-400 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] bg-emerald-955/20', dimColor: 'text-zinc-550 border-zinc-850 bg-zinc-950/20' }
                        ].map((node, idx, arr) => {
                          const isActive = node.count > 0;
                          const isNextActive = idx < arr.length - 1 && arr[idx + 1].count > 0;
                          
                          return (
                            <React.Fragment key={node.stage}>
                              {/* Node */}
                              <div 
                                onClick={() => {
                                  setTrackerStageFilter(node.stage as any);
                                  setActiveTab('tracker');
                                }}
                                className="relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 group w-full md:w-auto"
                              >
                                <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-mono font-black text-base transition-all duration-350 shadow-lg ${isActive ? node.activeColor : node.dimColor} relative`}>
                                  {node.count}
                                  {isActive && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider mt-2.5 transition duration-200 ${isActive ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-550 group-hover:text-zinc-400'}`}>
                                  {node.label}
                                </span>
                              </div>

                              {/* Connector Arrow (Desktop: horizontal line with arrow head, Mobile: vertical arrow) */}
                              {idx < arr.length - 1 && (
                                <div className="flex-1 flex items-center justify-center min-w-[20px] md:min-w-[40px] z-0 w-full md:w-auto">
                                  {/* Horizontal arrow for desktop */}
                                  <div className="hidden md:flex items-center w-full relative">
                                    <div className={`h-0.5 w-full rounded-full transition-all duration-500 ${isActive && isNextActive ? 'bg-gradient-to-r from-indigo-500/80 to-blue-500/80 shadow-[0_0_8px_rgba(99,102,241,0.4)] animate-pulse' : 'bg-zinc-800'}`}></div>
                                    <span className={`absolute right-0 -translate-y-1/2 top-1/2 text-[10px] font-bold transition-all duration-300 ${isActive && isNextActive ? 'text-indigo-400 font-bold scale-110 drop-shadow-[0_0_4px_rgba(99,102,241,0.5)]' : 'text-zinc-800'}`}>→</span>
                                  </div>
                                  {/* Vertical arrow for mobile */}
                                  <div className="flex md:hidden flex-col items-center gap-1.5 py-1">
                                    <span className={`text-xs transition-all duration-300 ${isActive && isNextActive ? 'text-indigo-400 animate-bounce' : 'text-zinc-850'}`}>↓</span>
                                  </div>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent Applications Widget */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2 flex justify-between items-center">
                        <span>Recent Applications</span>
                        <span className="text-[9px] text-zinc-500 lowercase">Click card to view details</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {sortedRecentApps.map((app) => {
                          const statusColors: Record<string, string> = {
                            Applied: 'bg-blue-955/35 text-blue-400 border-blue-900/25',
                            Saved: 'bg-zinc-850/80 text-zinc-350 border-zinc-800/40',
                            Wishlist: 'bg-purple-955/35 text-purple-400 border-purple-900/25',
                            Interview: 'bg-amber-955/35 text-amber-400 border-amber-900/25',
                            OA: 'bg-purple-955/35 text-purple-400 border-purple-900/25',
                            Assessment: 'bg-purple-955/35 text-purple-400 border-purple-900/25',
                            Offer: 'bg-emerald-955/35 text-emerald-400 border-emerald-900/25',
                            Rejected: 'bg-rose-955/35 text-rose-400 border-rose-900/25',
                          };
                          const statusClass = statusColors[app.status] || 'bg-zinc-850 text-zinc-350 border-zinc-800';

                          return (
                            <div 
                              key={app.id}
                              onClick={() => handleOpenEditJobModal(app)}
                              className={`bg-zinc-900/30 p-3.5 rounded-xl flex flex-col justify-between shadow-sm hover:scale-[1.02] hover:bg-zinc-900/55 transition cursor-pointer backdrop-blur-md relative overflow-hidden group border ${
                                app.shortlisted 
                                  ? 'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.12)]' 
                                  : 'border-zinc-800/30 hover:border-indigo-500/45'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {renderCompanyLogo(app.company)}
                                <div className="min-w-0 flex-1 leading-none">
                                  <span className="text-[9.5px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono truncate">
                                    {app.shortlisted && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />}
                                    <span className="truncate">{app.company}</span>
                                  </span>
                                  <span className="text-xs font-bold text-zinc-205 block truncate group-hover:text-white transition mt-0.5">
                                    {app.role}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 mt-3.5 pt-2 border-t border-zinc-900/50">
                                <span className="text-[9px] text-zinc-505 font-mono">
                                  {app.appliedDate || '—'}
                                </span>
                                <span className={`text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full border text-center truncate ${statusClass}`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {workspaceApps.length === 0 && (
                          <div className="text-center py-10 px-6 col-span-full border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shadow-inner">
                              <Briefcase className="w-5 h-5 text-zinc-555" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-zinc-200">No applications yet.</h4>
                              <p className="text-zinc-555 text-xs max-w-xs mx-auto">
                                Start tracking your job search by adding your first application.
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('tracker')}
                              className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-1.5 px-3.5 rounded-xl text-[11px] transition duration-200 hover:scale-[1.02] shadow-md shadow-indigo-650/10 cursor-pointer"
                            >
                              Add First Application
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upcoming Interviews Widget */}
                    {upcomingInterviews.length === 0 ? (
                      <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-3.5 flex justify-between items-center shadow-md select-none border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs font-bold text-zinc-400">Upcoming Interviews (0)</span>
                        </div>
                        <span className="text-[10px] text-zinc-555 italic font-medium">No interviews scheduled</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2 flex justify-between items-center">
                          <span>Upcoming Interviews</span>
                          <span className="text-[10px] font-bold text-zinc-400 font-mono px-2 py-0.5 bg-zinc-950 border border-zinc-850 rounded-full">
                            {upcomingInterviews.length} Scheduled
                          </span>
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-3.5">
                          {upcomingInterviews.slice(0, 3).map((round) => {
                            const isScheduled = round.status === 'Scheduled';
                            const badgeColor = isScheduled 
                              ? 'bg-emerald-955/35 text-emerald-400 border-emerald-900/25' 
                              : 'bg-amber-955/35 text-amber-400 border-amber-900/25';
                            
                            const matchedApp = workspaceApps.find(a => a.id === round.appId);
                            
                            return (
                              <div 
                                key={round.roundId}
                                className="bg-zinc-900 border border-zinc-850/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-700 transition"
                              >
                                <div className="flex items-center gap-3">
                                  {renderCompanyLogo(round.company)}
                                  <div className="min-w-0 leading-none">
                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono truncate">
                                      {round.company}
                                    </span>
                                    <h4 className="text-xs font-bold text-zinc-200 truncate mt-1">
                                      {round.name || round.type}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap select-none">
                                      <span className="text-[10px] text-zinc-450 font-semibold truncate max-w-[120px]">{round.role}</span>
                                      <span className="text-zinc-655">•</span>
                                      <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-550" />
                                        {round.date || 'No Date'}
                                      </span>
                                      {round.time && (
                                        <>
                                          <span className="text-zinc-655">•</span>
                                          <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                                            <Clock className="w-3.5 h-3.5 text-zinc-555" />
                                            {round.time}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {round.notes && (
                                      <p className="text-[11px] text-zinc-500 italic max-w-lg truncate pt-0.5" title={round.notes}>
                                        "{round.notes}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                  <span className={`text-[8.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border text-center ${badgeColor}`}>
                                    {round.status}
                                  </span>
                                  {round.meetingLink ? (
                                    <a 
                                      href={round.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-indigo-605 hover:bg-indigo-550 text-white font-bold py-1.5 px-3 rounded-xl text-[10px] transition duration-200 hover:scale-[1.02] flex items-center gap-1 shadow-md shadow-indigo-650/15 cursor-pointer"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Join Interview</span>
                                    </a>
                                  ) : (
                                    <button 
                                      onClick={() => matchedApp && handleOpenEditJobModal(matchedApp)}
                                      className="bg-zinc-850 hover:bg-zinc-750 text-zinc-350 hover:text-white font-bold py-1.5 px-3 border border-zinc-800 rounded-xl text-[10px] transition duration-200 cursor-pointer"
                                    >
                                      View Info
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Master Recent Activity Timeline */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col relative overflow-hidden backdrop-blur-md">
                      <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            <span>Recent Activity Timeline</span>
                          </h3>
                          <p className="text-[10px] text-zinc-505 mt-0.5">Real-time audit log of job tracking status and system updates</p>
                        </div>
                        {agentLogs && agentLogs.length > 0 && (
                          <button
                            onClick={() => clearAgentLogs()}
                            className="text-[9.5px] text-zinc-505 hover:text-rose-400 font-bold transition font-mono border border-zinc-800 hover:border-rose-900/40 bg-zinc-950/20 px-2.5 py-1 rounded-lg"
                          >
                            Clear History
                          </button>
                        )}
                      </div>
                      
                      <div className="relative pl-4 border-l border-zinc-800 space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin select-none py-1">
                        {(() => {
                          const parseDateSafe = (dStr: string | undefined) => {
                            if (!dStr) return 0;
                            const t = Date.parse(dStr);
                            return isNaN(t) ? 0 : t;
                          };

                          const activityEvents = (() => {
                            const formatActivityTime = (val: any) => {
                              if (!val) return 'Recently';
                              let dateObj: Date;
                              if (val instanceof Date) {
                                dateObj = val;
                              } else if (typeof val === 'number') {
                                dateObj = new Date(val);
                              } else {
                                const parsed = Date.parse(val);
                                if (isNaN(parsed)) {
                                  const num = Number(val);
                                  if (!isNaN(num) && val.trim() !== '') {
                                    dateObj = new Date(num);
                                  } else {
                                    return 'Recently';
                                  }
                                } else {
                                  dateObj = new Date(parsed);
                                }
                              }
                              
                              if (isNaN(dateObj.getTime())) {
                                return 'Recently';
                              }
                              
                              const now = new Date();
                              const diffMs = now.getTime() - dateObj.getTime();
                              
                              if (diffMs < 0) {
                                return 'Recently';
                              }
                              
                              const diffMins = Math.floor(diffMs / 60000);
                              const diffHrs = Math.floor(diffMs / 3600000);
                              
                              if (diffMins < 1) {
                                return 'Just now';
                              }
                              if (diffMins < 60) {
                                return `${diffMins} min ago`;
                              }
                              if (diffHrs < 24) {
                                if (dateObj.getDate() === now.getDate() && dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear()) {
                                  return `Today ${dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                                }
                                return `${diffHrs} hrs ago`;
                              }
                              
                              const yesterday = new Date();
                              yesterday.setDate(now.getDate() - 1);
                              if (dateObj.getDate() === yesterday.getDate() && dateObj.getMonth() === yesterday.getMonth() && dateObj.getFullYear() === yesterday.getFullYear()) {
                                  return `Yesterday ${dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                              }
                              
                              const options: Intl.DateTimeFormatOptions = { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              };
                              return dateObj.toLocaleDateString('en-US', options);
                            };

                            const events: { id: string; title: string; time: string; timestamp: number; icon: React.ReactNode; itemBg: string }[] = [];
                            
                            workspaceApps.forEach((app) => {
                              const appTime = parseDateSafe(app.appliedDate) || parseDateSafe(app.createdAt) || Date.now();
                              
                              events.push({
                                id: `ev-app-create-${app.id}`,
                                title: `Applied to ${app.company} as ${app.role}`,
                                time: formatActivityTime(appTime),
                                timestamp: appTime,
                                icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />,
                                itemBg: 'bg-blue-955/10 border-blue-950/30'
                              });

                              if (app.resumeUsed) {
                                events.push({
                                  id: `ev-app-res-${app.id}`,
                                  title: `Linked resume "${app.resumeUsed.replace('Uploaded: ', '')}" to ${app.company}`,
                                  time: formatActivityTime(appTime - 1000),
                                  timestamp: appTime - 1000,
                                  icon: <FileText className="w-3.5 h-3.5 text-indigo-400" />,
                                  itemBg: 'bg-zinc-950/25 border-zinc-850/50'
                                });
                              }

                              if (app.interviewRounds && app.interviewRounds.length > 0) {
                                app.interviewRounds.forEach((round, rIdx) => {
                                  const roundTime = parseDateSafe(round.date) || appTime;
                                  events.push({
                                    id: `ev-app-int-${app.id}-${rIdx}`,
                                    title: `Scheduled ${round.name || round.type} at ${app.company}`,
                                    time: formatActivityTime(roundTime),
                                    timestamp: roundTime,
                                    icon: <Calendar className="w-3.5 h-3.5 text-amber-400" />,
                                    itemBg: 'bg-amber-955/10 border-amber-950/30'
                                  });
                                });
                              }

                              if (app.timeline && app.timeline.length > 0) {
                                app.timeline.forEach((t, tIdx) => {
                                  const tTime = parseDateSafe(t.timestamp) || appTime;
                                  let icon = <Activity className="w-3.5 h-3.5 text-zinc-400" />;
                                  let itemBg = 'bg-zinc-955/10 border-zinc-850/50';
                                  
                                  if (t.stage === 'Interview') {
                                    icon = <Calendar className="w-3.5 h-3.5 text-amber-400" />;
                                    itemBg = 'bg-amber-955/10 border-amber-950/30';
                                  } else if (t.stage === 'Offer') {
                                    icon = <Award className="w-3.5 h-3.5 text-emerald-400" />;
                                    itemBg = 'bg-emerald-955/10 border-emerald-950/30';
                                  } else if (t.stage === 'Rejected') {
                                    icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
                                    itemBg = 'bg-rose-955/10 border-rose-950/30';
                                  } else if (t.stage === 'OA' || t.stage === 'Assessment') {
                                    icon = <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
                                    itemBg = 'bg-purple-955/10 border-purple-950/30';
                                  }

                                  events.push({
                                    id: `ev-app-stage-${app.id}-${tIdx}`,
                                    title: `Moved ${app.company} to ${t.stage}`,
                                    time: formatActivityTime(tTime),
                                    timestamp: tTime,
                                    icon,
                                    itemBg
                                  });
                                });
                              }
                            });

                            agentLogs.forEach((log, logIdx) => {
                              const logTime = parseDateSafe(log.timestamp) || Date.now();
                              let icon = <Activity className="w-3.5 h-3.5 text-indigo-400" />;
                              let itemBg = 'bg-zinc-955/10 border-zinc-850/50';
                              
                              const msgLower = log.message.toLowerCase();
                              if (msgLower.includes('offer')) {
                                icon = <Award className="w-3.5 h-3.5 text-emerald-400" />;
                                itemBg = 'bg-emerald-955/10 border-emerald-950/30';
                              } else if (msgLower.includes('interview') || msgLower.includes('scheduled')) {
                                icon = <Calendar className="w-3.5 h-3.5 text-amber-400" />;
                                itemBg = 'bg-amber-955/10 border-amber-950/30';
                              } else if (msgLower.includes('apply') || msgLower.includes('applied')) {
                                icon = <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
                                itemBg = 'bg-blue-955/10 border-blue-950/30';
                              } else if (msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('reject')) {
                                icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
                                itemBg = 'bg-rose-955/10 border-rose-950/30';
                              } else if (msgLower.includes('sync') || msgLower.includes('sheet') || msgLower.includes('leetcode')) {
                                icon = <RefreshCw className="w-3.5 h-3.5 text-sky-400" />;
                                itemBg = 'bg-sky-955/10 border-sky-950/30';
                              }

                              events.push({
                                id: `ev-log-${logIdx}`,
                                title: log.message,
                                time: formatActivityTime(logTime),
                                timestamp: logTime,
                                icon,
                                itemBg
                              });
                            });

                            const uniqueMap = new Map<string, typeof events[0]>();
                            events.forEach(e => {
                              const key = `${e.title}-${e.timestamp}`;
                              if (!uniqueMap.has(key)) {
                                uniqueMap.set(key, e);
                              }
                            });

                            return Array.from(uniqueMap.values()).sort((a, b) => b.timestamp - a.timestamp);
                          })();

                          if (activityEvents.length === 0) {
                            return (
                              <div className="text-zinc-500 text-center py-10 text-xs italic border border-dashed border-zinc-855 rounded-xl bg-zinc-955/20">
                                No recent activity recorded.
                              </div>
                            );
                          }

                          return (
                            <>
                              <div className="space-y-4">
                                {(showAllActivity ? activityEvents : activityEvents.slice(0, 10)).map((ev) => (
                                  <div key={ev.id} className="relative flex gap-4 text-xs items-start animate-fade-in group">
                                    <div className="absolute -left-[22.5px] top-1.5 w-3 h-3 rounded-full bg-zinc-955 border-2 border-zinc-800 flex items-center justify-center group-hover:border-indigo-500 transition duration-200">
                                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-indigo-400 transition duration-200"></div>
                                    </div>
                                    
                                    <div className={`flex-1 border p-3 rounded-xl flex items-center justify-between gap-4 transition duration-200 hover:border-zinc-750 ${ev.itemBg}`}>
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 shrink-0">
                                          {ev.icon}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-zinc-205 leading-snug font-medium break-words text-[11.5px]">{ev.title}</p>
                                          <span className="text-[9px] text-zinc-650 font-mono mt-0.5 block">{ev.time}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {activityEvents.length > 10 && (
                                <div className="pt-2 border-t border-zinc-850/60 flex justify-center">
                                  <button
                                    onClick={() => setShowAllActivity(!showAllActivity)}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition flex items-center gap-1 hover:underline cursor-pointer"
                                  >
                                    <span>{showAllActivity ? 'Show Less' : 'View All Activity'}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllActivity ? 'rotate-180' : ''}`} />
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                  </div>

                  {/* Right Side: Command Center Widgets Panel (col-span-4) */}
                  <div className="lg:col-span-4 flex flex-col gap-8">
                    
                    {/* Widget 1: LeetCode Progress */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-500/5 rounded-full blur-[40px] pointer-events-none -translate-y-8 translate-x-8"></div>
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                            {renderPlatformIcon('leetcode', 'w-4 h-4')}
                            <span>LeetCode Progress</span>
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Coding practice tracking</p>
                        </div>
                        {userProfile.leetcodeConnected && (
                          <button
                            onClick={() => syncLeetcode()}
                            className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                            title="Sync LeetCode"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-hover-spin" />
                          </button>
                        )}
                      </div>

                      {userProfile.leetcodeConnected ? (
                        <div className="space-y-4 relative z-10 text-xs">
                          {/* Connected Account */}
                          <div className="flex items-center justify-between text-[11px] bg-zinc-955/40 border border-zinc-850 p-2.5 rounded-xl">
                            <span className="text-zinc-500 font-medium">Connected Account</span>
                            <a 
                              href={userProfile.leetcodeProfileUrl || `https://leetcode.com/${userProfile.leetcode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-amber-400 hover:underline truncate max-w-[140px] flex items-center gap-1"
                            >
                              <span>{userProfile.leetcode}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          <div className="border-t border-zinc-850/40 my-1"></div>

                          {/* Acceptance Rate | Total Solved | Global Rank Grid */}
                          <div className={`grid grid-cols-1 ${
                            (2 + (isLeetcodeContestShown ? 1 : 0) + (isAcceptanceRateShown ? 1 : 0)) === 4 
                              ? 'sm:grid-cols-2 md:grid-cols-4' 
                              : ((2 + (isLeetcodeContestShown ? 1 : 0) + (isAcceptanceRateShown ? 1 : 0)) === 3 
                                  ? 'sm:grid-cols-3' 
                                  : 'sm:grid-cols-2')
                          } gap-4 items-stretch`}>
                            {/* Acceptance Rate */}
                            {isAcceptanceRateShown ? (
                              <div className="bg-zinc-955/20 border border-zinc-850/60 px-4 py-3 rounded-xl flex flex-row justify-between items-center sm:flex-col sm:justify-center sm:items-start h-[56px] sm:h-[72px]">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Acceptance Rate</span>
                                <span className="font-black text-zinc-200 text-sm sm:mt-2 font-mono leading-none">
                                  {userProfile.leetcodeAcceptanceRate !== undefined && userProfile.leetcodeAcceptanceRate !== null ? `${Number(userProfile.leetcodeAcceptanceRate).toFixed(2)}%` : 'N/A'}
                                </span>
                              </div>
                            ) : null}

                            {/* Total Solved */}
                            <div className="bg-zinc-955/20 border border-zinc-850/60 px-4 py-3 rounded-xl flex flex-row justify-between items-center sm:flex-col sm:justify-center sm:items-start h-[56px] sm:h-[72px]">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Total Solved</span>
                              <span className="font-black text-zinc-200 text-sm sm:mt-2 font-mono leading-none">
                                {userProfile.leetcodeSolved || 0}
                              </span>
                            </div>

                            {/* Global Rank */}
                            <div 
                              className="bg-zinc-955/20 border border-zinc-850/60 px-4 py-3 rounded-xl flex flex-row justify-between items-center sm:flex-col sm:justify-center sm:items-start h-[56px] sm:h-[72px] relative group cursor-help"
                              title={userProfile.leetcodeRank ? `Full Rank: #${userProfile.leetcodeRank.toLocaleString()}` : ''}
                            >
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Global Rank</span>
                              <span className="font-black text-zinc-200 text-sm sm:mt-2 font-mono leading-none whitespace-nowrap overflow-visible">
                                {leetcodeDisplayRank}
                              </span>
                            </div>

                            {/* Contest Rating */}
                            {isLeetcodeContestShown ? (
                              <div className="bg-zinc-955/20 border border-zinc-850/60 px-4 py-3 rounded-xl flex flex-row justify-between items-center sm:flex-col sm:justify-center sm:items-start h-[56px] sm:h-[72px]">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Contest Rating</span>
                                <span className="font-black text-zinc-200 text-sm sm:mt-2 font-mono leading-none">
                                  {userProfile.leetcodeRating}
                                </span>
                              </div>
                            ) : null}
                          </div>

                          <div className="border-t border-zinc-850/40 my-1"></div>

                          {/* Last Submission Section */}
                          <div className="flex flex-col text-left space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10.5px] text-zinc-500 font-bold uppercase tracking-wider">Last Submission</span>
                              {userProfile.leetcodeSubmissions !== undefined && userProfile.leetcodeSubmissions > 0 && (
                                <span className="text-[9.5px] text-zinc-550 font-bold">
                                  Total Submissions: {userProfile.leetcodeSubmissions} submissions
                                </span>
                              )}
                            </div>
                            
                            {userProfile.leetcodeLastSubmission ? (
                              <div className="bg-zinc-955/25 border border-zinc-850/40 p-3.5 rounded-xl flex flex-col gap-1.5 leading-snug">
                                <div className="flex items-center gap-1.5 text-[11.5px] font-extrabold text-zinc-200">
                                  <span className="text-emerald-400 font-black">✓</span>
                                  <span>{userProfile.leetcodeLastSubmission.title}</span>
                                </div>
                                <div className="text-[9.5px] text-zinc-555 font-bold mt-1">
                                  <span className={
                                    userProfile.leetcodeLastSubmission.difficulty === 'Hard' ? 'text-red-400 font-bold' :
                                    userProfile.leetcodeLastSubmission.difficulty === 'Medium' ? 'text-amber-400 font-bold' :
                                    'text-emerald-400 font-bold'
                                  }>
                                    {userProfile.leetcodeLastSubmission.difficulty}
                                  </span>
                                  <span className="mx-1.5 text-zinc-650">•</span>
                                  <span className="text-zinc-400 font-medium">
                                    {(() => {
                                      const ts = userProfile.leetcodeLastSubmission.timestamp;
                                      if (!ts) return 'Recently';
                                      let dateObj;
                                      if (typeof ts === 'number') {
                                        dateObj = new Date(ts);
                                      } else if (typeof ts === 'string') {
                                        if (/^\d+$/.test(ts)) {
                                          dateObj = new Date(parseInt(ts));
                                        } else {
                                          dateObj = new Date(ts);
                                        }
                                      } else {
                                        dateObj = new Date(ts);
                                      }
                                      if (isNaN(dateObj.getTime())) return 'Recently';
                                      const now = new Date();
                                      const diffMs = now.getTime() - dateObj.getTime();
                                      if (diffMs < 0) return 'Recently';
                                      
                                      const diffMins = Math.floor(diffMs / 60000);
                                      const diffHrs = Math.floor(diffMs / 3600000);
                                      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
                                      
                                      if (diffMins < 1) return 'Just now';
                                      if (diffMins < 60) return `${diffMins} min ago`;
                                      if (diffHrs < 24) return `${diffHrs} hours ago`;
                                      if (diffDays === 1) return 'Yesterday';
                                      if (diffDays < 30) return `${diffDays} days ago`;
                                      
                                      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    })()}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-500 italic pl-1">No submissions yet.</span>
                            )}
                          </div>

                          <div className="border-t border-zinc-850/40 my-1"></div>

                          {/* Difficulty bars */}
                          <div className="space-y-3">
                            <div className="space-y-1 text-left">
                              <div className="flex justify-between text-[9.5px]">
                                <span className="text-emerald-400 font-medium">Easy</span>
                                <span className="text-zinc-400 font-mono">{userProfile.leetcodeEasy || 0}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850/30">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, ((userProfile.leetcodeEasy || 0) / Math.max(1, userProfile.leetcodeSolved || 1)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-1 text-left">
                              <div className="flex justify-between text-[9.5px]">
                                <span className="text-amber-400 font-medium">Medium</span>
                                <span className="text-zinc-400 font-mono">{userProfile.leetcodeMedium || 0}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850/30">
                                <div 
                                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, ((userProfile.leetcodeMedium || 0) / Math.max(1, userProfile.leetcodeSolved || 1)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-1 text-left">
                              <div className="flex justify-between text-[9.5px]">
                                <span className="text-red-400 font-medium">Hard</span>
                                <span className="text-zinc-400 font-mono">{userProfile.leetcodeHard || 0}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850/30">
                                <div 
                                  className="h-full bg-red-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, ((userProfile.leetcodeHard || 0) / Math.max(1, userProfile.leetcodeSolved || 1)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[8.5px] text-zinc-500 border-t border-zinc-850/60 pt-2.5 font-medium">
                            <span>Last Synced: {userProfile.leetcodeLastSync ? new Date(userProfile.leetcodeLastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}</span>
                            <button
                              onClick={() => disconnectLeetcode()}
                              className="text-zinc-500 hover:text-red-400 transition cursor-pointer font-bold"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 px-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-955/20 space-y-4">
                          <span className="text-3xl block filter saturate-50 select-none">💻</span>
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-zinc-300">Sync coding metrics</h4>
                            <p className="text-zinc-555 text-[10px] max-w-[200px] mx-auto leading-relaxed">
                              Connect your LeetCode account to track problem solving accomplishments automatically.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSettingsSection('integrations');
                              setActiveTab('settings');
                            }}
                            className="bg-amber-605 hover:bg-amber-500 text-white font-bold py-1.5 px-3.5 rounded-xl text-[10px] transition cursor-pointer"
                          >
                            Connect LeetCode
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Widget 2: Linked Resumes */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col relative overflow-hidden backdrop-blur-md">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span>Linked Resumes</span>
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Resume version yields</p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 font-mono px-2 py-0.5 bg-indigo-955/40 border border-indigo-900/30 rounded-full">
                          {resumes.length} In Use
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {(() => {
                          const templateItems = resumes.map((res) => {
                            const linkedApps = workspaceApps.filter(app => app.resumeUsed === res.name);
                            const interviewsGenerated = linkedApps.filter(app => 
                              (app.interviewRounds && app.interviewRounds.length > 0) || 
                              ['Interview', 'OA', 'Assessment'].includes(app.status)
                            ).length;
                            const offersReceived = linkedApps.filter(app => app.status === 'Offer').length;
                            const sortedApps = [...linkedApps].sort((a,b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
                            const lastUsedDate = sortedApps[0]?.appliedDate || '—';

                            return {
                              id: res.id,
                              name: res.name,
                              isTemplate: true,
                              subtitle: `Template: ${res.template?.toUpperCase() || 'STANDARD'}`,
                              linkedApps,
                              fileUrl: '',
                              usedCount: linkedApps.length,
                              interviewsGenerated,
                              offersReceived,
                              lastUsedDate
                            };
                          });

                          const appsWithFile = workspaceApps.filter(app => app.resumeFile);
                          const uploadedItems = appsWithFile.map((app) => {
                            const displayName = app.resumeUsed?.replace('Uploaded: ', '') || 'Resume Document';
                            const linkedApps = [app];
                            const interviewsGenerated = linkedApps.filter(a => 
                              (a.interviewRounds && a.interviewRounds.length > 0) || 
                              ['Interview', 'OA', 'Assessment'].includes(a.status)
                            ).length;
                            const offersReceived = linkedApps.filter(a => a.status === 'Offer').length;
                            return {
                              id: app.id,
                              name: displayName,
                              isTemplate: false,
                              subtitle: `Direct File Attachment`,
                              linkedApps,
                              fileUrl: app.resumeFile || '',
                              usedCount: 1,
                              interviewsGenerated,
                              offersReceived,
                              lastUsedDate: app.appliedDate || '—'
                            };
                          });

                          const allResumesToShow = [...templateItems, ...uploadedItems];

                          if (allResumesToShow.length === 0) {
                            return (
                              <div className="text-zinc-650 text-center py-6 col-span-full border border-dashed border-zinc-800 rounded-xl bg-zinc-955/20 text-xs">
                                <FileText className="w-5 h-5 text-zinc-700 mx-auto mb-1.5" />
                                <span>No resumes connected. Access Resume Studio to build ones.</span>
                              </div>
                            );
                          }

                          return allResumesToShow.map((res, resIdx) => (
                            <div 
                              key={`${res.id}-${resIdx}`} 
                              className="bg-zinc-955/40 border border-zinc-850 p-3.5 rounded-xl flex flex-col justify-between hover:border-zinc-700/80 hover:bg-zinc-955/60 transition group space-y-3"
                            >
                              <div className="flex items-start justify-between gap-1 leading-none">
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <span className="font-bold text-zinc-200 truncate text-xs">{res.name}</span>
                                  <span className="text-[9.5px] text-zinc-505 font-mono truncate">{res.subtitle}</span>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  {res.isTemplate ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedResumeId(res.id);
                                          setActiveTab('resumes');
                                        }}
                                        className="text-[9px] text-zinc-400 hover:text-indigo-400 font-bold flex items-center gap-0.5 transition cursor-pointer"
                                        title="Edit Template in Studio"
                                      >
                                        <span>Edit</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedResumeId(res.id);
                                          setActiveTab('resumes');
                                        }}
                                        className="text-[9px] text-zinc-400 hover:text-indigo-400 font-bold flex items-center gap-0.5 transition cursor-pointer"
                                        title="Preview Resume Template"
                                      >
                                        <span>Preview</span>
                                        <Eye className="w-2.5 h-2.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {res.fileUrl && (
                                        <a 
                                          href={res.fileUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-[9px] text-zinc-400 hover:text-indigo-400 font-bold flex items-center gap-0.5 transition"
                                          title="Open Original File"
                                        >
                                          <span>Open</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                      <button
                                        onClick={() => {
                                          setPreviewResume({
                                            id: res.linkedApps[0]?.id,
                                            name: res.name,
                                            fileUrl: res.fileUrl || '',
                                            uploadDate: res.linkedApps[0]?.appliedDate || new Date().toLocaleDateString(),
                                            isMockFile: true
                                          });
                                          setPreviewResumeName(res.name);
                                        }}
                                        className="text-[9px] text-zinc-400 hover:text-indigo-400 font-bold flex items-center gap-0.5 transition cursor-pointer"
                                        title="Preview Resume File"
                                      >
                                        <span>Preview</span>
                                        <FileText className="w-2.5 h-2.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-900/45 text-[9.5px] text-center">
                                <div className="bg-zinc-955/40 border border-zinc-850 px-1 py-1.5 rounded-lg flex flex-col items-center">
                                  <span className="text-[8px] text-zinc-505 uppercase font-bold tracking-wider">Used In</span>
                                  <span className="font-bold text-zinc-350 font-mono mt-0.5 truncate">{res.usedCount} Job{res.usedCount === 1 ? '' : 's'}</span>
                                </div>
                                <div className="bg-zinc-955/40 border border-zinc-850 px-1 py-1.5 rounded-lg flex flex-col items-center">
                                  <span className="text-[8px] text-zinc-505 uppercase font-bold tracking-wider">Interviews</span>
                                  <span className="font-bold text-amber-500 font-mono mt-0.5 truncate">{res.interviewsGenerated}</span>
                                </div>
                                <div className="bg-zinc-955/40 border border-zinc-855 px-1 py-1.5 rounded-lg flex flex-col items-center">
                                  <span className="text-[8px] text-zinc-505 uppercase font-bold tracking-wider">Offers</span>
                                  <span className="font-bold text-emerald-500 font-mono mt-0.5 truncate">{res.offersReceived}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[8.5px] text-zinc-505 border-t border-zinc-900/20 pt-2 select-none">
                                <span>Last Used: <span className="font-mono text-zinc-400">{res.lastUsedDate}</span></span>
                                <span className="text-zinc-550 font-semibold">Yield: {res.usedCount > 0 ? Math.round(((res.interviewsGenerated + res.offersReceived) / res.usedCount) * 100) : 0}%</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Widget 3: Quick Insights */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col relative overflow-hidden backdrop-blur-md">
                      <div className="border-b border-zinc-800 pb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                          <BarChart2 className="w-4 h-4 text-indigo-400" />
                          <span>Quick Insights</span>
                        </h3>
                        <p className="text-[10px] text-zinc-505 mt-0.5">Workspace analytics summary</p>
                      </div>

                      {workspaceApps.length === 0 ? (
                        <div className="text-center py-8 px-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-955/20">
                          <BarChart2 className="w-5 h-5 text-zinc-700 mx-auto mb-1.5 animate-pulse" />
                          <h4 className="text-[11px] font-bold text-zinc-350">No analytics available yet.</h4>
                          <p className="text-zinc-555 text-[10px] max-w-[200px] mx-auto mt-1 leading-relaxed">
                            Applications, interviews and conversion metrics will appear once activity is recorded.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 text-xs">
                          <div className="bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] text-zinc-505 font-bold uppercase tracking-wider">Top Company</span>
                              <span className="text-[11px] text-zinc-300 font-semibold truncate max-w-[170px]">{topAppliedCompany}</span>
                            </div>
                            <span className="text-lg">🏢</span>
                          </div>

                          <div className="bg-zinc-955/40 border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[9px] text-zinc-505 font-bold uppercase tracking-wider">Top Role</span>
                              <span className="text-[11px] text-zinc-300 font-semibold truncate" title={mostTargetedRole}>{mostTargetedRole}</span>
                            </div>
                            <span className="text-lg">💼</span>
                          </div>

                          <div className="bg-zinc-955/40 border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[9px] text-zinc-505 font-bold uppercase tracking-wider">Top Location</span>
                              <span className="text-[11px] text-zinc-300 font-semibold truncate" title={mostTargetedLocation}>{mostTargetedLocation}</span>
                            </div>
                            <span className="text-lg">📍</span>
                          </div>

                          <div className="bg-zinc-955/40 border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[9px] text-zinc-505 font-bold uppercase tracking-wider">Most Used Resume</span>
                              <span className="text-[11px] text-zinc-300 font-semibold truncate" title={mostUsedResume}>{mostUsedResume.replace('Resume ', '')}</span>
                            </div>
                            <span className="text-lg">📄</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-zinc-955/20 border border-zinc-850/60 p-2 rounded-xl flex flex-col items-center">
                              <span className="text-[8.5px] text-zinc-505 uppercase font-bold tracking-wider">Apps This Week</span>
                              <span className="font-bold text-zinc-200 mt-0.5">{userProfile.applicationsThisWeek || 0}</span>
                            </div>
                            <div className="bg-zinc-955/20 border border-zinc-850/60 p-2 rounded-xl flex flex-col items-center">
                              <span className="text-[8.5px] text-zinc-505 uppercase font-bold tracking-wider">Apps This Month</span>
                              <span className="font-bold text-zinc-200 mt-0.5">{userProfile.applicationsThisMonth || 0}</span>
                            </div>
                          </div>

                          <div className="border-t border-zinc-850/80 pt-3">
                            <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Conversion Yields</span>
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                              <div className="bg-zinc-955/20 border border-zinc-850 p-2 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-[8.5px] text-zinc-505 font-bold uppercase tracking-wider">Interview Yield</span>
                                <span className="text-xs font-mono font-bold text-amber-500 mt-0.5">{interviewRate}%</span>
                              </div>
                              <div className="bg-zinc-955/20 border border-zinc-850 p-2 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-[8.5px] text-zinc-505 font-bold uppercase tracking-wider">Offer Yield</span>
                                <span className="text-xs font-mono font-bold text-emerald-500 mt-0.5">{offerRate}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            );
          })()}
          {/* TAB 2: JOB TRACKER PIPELINE VIEW (FULL CRUD, CALENDAR, TIMELINE, REC CARD) */}
          {activeTab === 'tracker' && (
            <div className="flex flex-col h-auto space-y-4 lg:h-full lg:overflow-hidden lg:space-y-3 animate-fade-in">
              {/* STICKY LAYER 2: Page heading & Subtitle */}
              <div className="text-center space-y-0.5 py-1 shrink-0 border-b border-zinc-900 pb-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">Job Application Tracker</h1>
                <p className="text-[11px] text-zinc-400 leading-tight">Track every application, interview, and offer in one place.</p>
                {googleSheetsConnected && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold mt-1">
                    <FileSpreadsheet className="w-3 h-3 animate-pulse" />
                    <span>Sheets Linked</span>
                  </div>
                )}
              </div>
               <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch pt-0">
                {/* Left Side: New Application Form */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl flex flex-col h-auto overflow-visible lg:h-full lg:overflow-hidden shadow-xl shadow-black/40">
                  {/* Form Header (Static) */}
                  <div className="py-2.5 px-4 border-b border-zinc-800 shrink-0 flex justify-between items-center">
                    <span className="font-bold text-white text-sm">New Application</span>
                    <span className="text-[10px] text-zinc-500 font-medium">ATS-Style Manager</span>
                  </div>

                  {/* Form Body (Scrollable compactly inside desktop pane, no browser scrollbars) */}
                  <div className="px-4 py-3.5 lg:flex-1 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden text-xs select-none pr-2">
                    {(() => {
                      const isInterviewVisible = formShortlisted || ['Shortlisted', 'Assessment', 'Interview', 'Offer'].includes(formStatus);

                      return (
                        <div className={`grid grid-cols-1 ${isInterviewVisible ? 'xl:grid-cols-2 gap-5 xl:h-full xl:min-h-0 xl:overflow-hidden' : 'lg:flex-1 lg:overflow-y-auto lg:scrollbar-thin lg:pr-2'}`}>
                          {/* Column 1: Core Form Fields & Tabs */}
                          <div className={`space-y-3.5 ${isInterviewVisible ? 'xl:h-full xl:overflow-y-auto xl:scrollbar-thin xl:pr-2 xl:pb-1' : ''}`}>
                            {/* Core Details (Always Visible) */}
                            <div className="grid grid-cols-2 gap-3.5 bg-zinc-950/20 border border-zinc-850 p-3 rounded-xl">
                              <div>
                                <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                  Company Name *
                                </label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Google" 
                                  value={formCompany}
                                  onChange={e => setFormCompany(e.target.value)}
                                  className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                  Role / Position *
                                </label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Frontend Lead" 
                                  value={formRole}
                                  onChange={e => setFormRole(e.target.value)}
                                  className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                  Location
                                </label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. San Francisco, CA" 
                                  value={formLoc}
                                  onChange={e => setFormLoc(e.target.value)}
                                  className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                  Work Mode
                                </label>
                                <SearchableDropdown
                                  options={['Remote', 'Hybrid', 'Onsite']}
                                  value={formWorkMode}
                                  onChange={val => setFormWorkMode(val as any)}
                                  placeholder="Select mode"
                                />
                              </div>
                            </div>

                            {/* Sub-Tabs Navigation */}
                            <div className="flex bg-zinc-950 border border-zinc-850 rounded-xl p-0.5 select-none text-[10px] items-center">
                              <button 
                                type="button"
                                onClick={() => setFormSubTab('details')}
                                className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition h-7 flex items-center justify-center ${formSubTab === 'details' ? 'bg-zinc-850 text-white border border-zinc-800/40 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Details & Tracking
                              </button>
                              <button 
                                type="button"
                                onClick={() => setFormSubTab('notes')}
                                className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition h-7 flex items-center justify-center ${formSubTab === 'notes' ? 'bg-zinc-850 text-white border border-zinc-800/40 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Notes & CRM
                              </button>
                              <button 
                                type="button"
                                onClick={() => setFormSubTab('attachments')}
                                className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition h-7 flex items-center justify-center ${formSubTab === 'attachments' ? 'bg-zinc-850 text-white border border-zinc-800/40 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Attachments ({formAttachments.length})
                              </button>
                            </div>

                            {/* Tab 1: Details & Tracking */}
                            {formSubTab === 'details' && (
                              <div className="space-y-3.5 mt-1 animate-fade-in">
                                <div className="grid grid-cols-2 gap-3.5">
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Job URL
                                    </label>
                                    <input 
                                      type="url" 
                                      placeholder="https://..." 
                                      value={formUrl}
                                      onChange={e => setFormUrl(e.target.value)}
                                      className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Email Account Used
                                    </label>
                                    <SmartEmailInput
                                      value={formEmailUsed}
                                      onChange={val => setFormEmailUsed(val)}
                                      applications={applications}
                                      placeholder="e.g. alex@gmail.com"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Application Method
                                    </label>
                                    <SearchableDropdown
                                      options={[
                                        "Company Careers Page", "LinkedIn", "Naukri", "Indeed", "Foundit",
                                        "Wellfound", "Internshala", "Referral", "Recruiter Outreach",
                                        "Direct Email", "Campus Placement", "Career Fair", "Other"
                                      ]}
                                      value={formAppMethod}
                                      onChange={val => setFormAppMethod(val)}
                                      allowCustom={true}
                                      placeholder="Select Method..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Application Type
                                    </label>
                                    <div className="relative">
                                      <select 
                                        value={formAppType} 
                                        onChange={e => setFormAppType(e.target.value as any)} 
                                        className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-3 pr-7 text-zinc-150 outline-none transition appearance-none cursor-pointer text-xs"
                                      >
                                        <option value="Full Time">Full Time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Apprenticeship">Apprenticeship</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-550">
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Resume Version
                                    </label>
                                    <SearchableDropdown
                                      options={resumes.map(r => r.name)}
                                      value={formResumeVersion}
                                      onChange={val => setFormResumeVersion(val)}
                                      allowCustom={true}
                                      placeholder="Select Resume..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Application Date
                                    </label>
                                    <input 
                                      type="datetime-local" 
                                      value={formAppDate}
                                      onChange={e => setFormAppDate(e.target.value)}
                                      className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                                    />
                                  </div>
                                </div>

                                {formAppMethod === 'Other' && (
                                  <div className="animate-fade-in">
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Custom Method
                                    </label>
                                    <input 
                                      type="text" 
                                      placeholder="Specify custom method..." 
                                      value={formCustomMethod}
                                      onChange={e => setFormCustomMethod(e.target.value)}
                                      className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-100 outline-none transition text-xs" 
                                    />
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-3.5 items-center">
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Current Status
                                    </label>
                                    <div className="relative">
                                      <select 
                                        value={formStatus} 
                                        onChange={e => {
                                          const nextStatus = e.target.value as any;
                                          setFormStatus(nextStatus);
                                          if (['Shortlisted', 'Assessment', 'Interview', 'Offer'].includes(nextStatus)) {
                                            setFormShortlisted(true);
                                          }
                                        }} 
                                        className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-3 pr-7 text-zinc-150 outline-none transition appearance-none cursor-pointer text-xs"
                                      >
                                        <option value="Saved">Saved</option>
                                        <option value="Applied">Applied</option>
                                        <option value="Shortlisted">Shortlisted</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Withdrawn">Withdrawn</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-550">
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Shortlisted?
                                    </label>
                                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 select-none text-[10px] h-[36px] items-center">
                                      <button 
                                        type="button" 
                                        onClick={() => setFormShortlisted(true)}
                                        className={`flex-1 py-1 px-3 rounded-lg font-bold transition h-full flex items-center justify-center ${formShortlisted ? 'bg-emerald-650 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                      >
                                        Yes
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => setFormShortlisted(false)}
                                        className={`flex-1 py-1 px-3 rounded-lg font-bold transition h-full flex items-center justify-center ${!formShortlisted ? 'bg-zinc-850 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className={`grid ${isInterviewVisible ? 'grid-cols-1 gap-2.5' : 'grid-cols-2 gap-3.5'} pt-1.5 border-t border-zinc-900/60`}>
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                      Upload Resume (PDF/DOCX)
                                    </label>
                                    <input 
                                      type="file" 
                                      accept=".pdf,.doc,.docx"
                                      onChange={handleResumeUploadSimulate}
                                      className="w-full h-[36px] bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl text-[9.5px] text-zinc-400 file:mr-2 file:py-0.5 file:px-1.5 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-zinc-850 file:text-zinc-350 outline-none cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 font-bold block mb-1.5 text-[10px]">
                                      Resume Tags (Press Enter)
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                      <input 
                                        type="text" 
                                        placeholder="e.g. Python, Backend" 
                                        value={newTagInput}
                                        onChange={e => setNewTagInput(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addResumeTag();
                                          }
                                        }}
                                        className="flex-1 h-[30px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-2 text-zinc-155 outline-none text-[10.5px]" 
                                      />
                                      <button 
                                        type="button" 
                                        onClick={addResumeTag}
                                        className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[9.5px] font-bold text-zinc-350 h-[30px] px-2.5 rounded-lg transition"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {formResumeMetadata && (
                                  <div className="bg-zinc-950/60 border border-zinc-850 p-2 rounded-xl text-[9.5px] space-y-1 font-mono text-zinc-450 animate-fade-in">
                                    <div className="flex justify-between"><span className="text-zinc-550">Name:</span> <span className="font-bold text-zinc-350 truncate max-w-[190px]">{formResumeMetadata.name}</span></div>
                                    <div className="flex justify-between"><span className="text-zinc-550">Uploaded:</span> <span className="text-zinc-350">{formResumeMetadata.uploadDate}</span></div>
                                    <div className="flex justify-between"><span className="text-zinc-550">Last Updated:</span> <span className="text-zinc-350">{formResumeMetadata.lastUpdated}</span></div>
                                  </div>
                                )}

                                {formResumeTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {formResumeTags.map((tag, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                        <span>{tag}</span>
                                        <button type="button" onClick={() => removeResumeTag(tag)} className="text-[10px] text-indigo-500 hover:text-indigo-300 font-bold">&times;</button>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="pt-2 border-t border-zinc-900/60">
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-400 font-bold text-[10px]">Was a Referral Used?</span>
                                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 select-none text-[10px] h-[30px] items-center">
                                      <button 
                                        type="button" 
                                        onClick={() => setFormReferralUsed(true)}
                                        className={`px-3 py-1 rounded-lg font-bold transition h-full flex items-center justify-center ${formReferralUsed ? 'bg-indigo-650 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                      >
                                        Yes
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => setFormReferralUsed(false)}
                                        className={`px-3 py-1 rounded-lg font-bold transition h-full flex items-center justify-center ${!formReferralUsed ? 'bg-zinc-850 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {formReferralUsed && (
                                  <div className="grid grid-cols-2 gap-3 border-t border-zinc-900 pt-2 animate-fade-in">
                                    <div>
                                      <label className="text-zinc-400 font-bold block mb-1 text-[10px]">Referrer Name</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. John Doe" 
                                        value={formReferrerName}
                                        onChange={e => setFormReferrerName(e.target.value)}
                                        className="w-full h-[36px] bg-zinc-955 border border-zinc-800 rounded-xl px-3 text-zinc-100 outline-none text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-zinc-400 font-bold block mb-1 text-[10px]">LinkedIn Profile</label>
                                      <input 
                                        type="text" 
                                        placeholder="linkedin.com/in/..." 
                                        value={formReferrerLinkedin}
                                        onChange={e => setFormReferrerLinkedin(e.target.value)}
                                        className="w-full h-[36px] bg-zinc-955 border border-zinc-800 rounded-xl px-3 text-zinc-100 outline-none text-xs"
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-zinc-400 font-bold block mb-1 text-[10px]">Referral Notes</label>
                                      <textarea 
                                        placeholder="Any context or notes from referrer..." 
                                        value={formReferralNotes}
                                        onChange={e => setFormReferralNotes(e.target.value)}
                                        rows={1.5}
                                        className="w-full bg-zinc-955 border border-zinc-800 rounded-xl p-2 text-zinc-100 outline-none text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tab 2: Notes & CRM */}
                            {formSubTab === 'notes' && (
                              <div className="space-y-3.5 mt-1 animate-fade-in">
                                <div>
                                  <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                    Application Notes
                                  </label>
                                  <textarea 
                                    placeholder="e.g. Job description, key skills needed, reminders..." 
                                    value={formNotes}
                                    onChange={e => setFormNotes(e.target.value)}
                                    rows={3.5}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-150 outline-none transition text-xs" 
                                  />
                                </div>

                                <div className="border-t border-zinc-900/60 pt-2.5 space-y-2.5">
                                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Recruiter CRM</span>
                                  <div className="grid grid-cols-2 gap-3.5">
                                    <div>
                                      <label className="text-zinc-550 block mb-1 text-[9.5px]">Recruiter Name</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. Sarah Jenkins" 
                                        value={formRecruiterName}
                                        onChange={e => setFormRecruiterName(e.target.value)}
                                        className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-155 outline-none transition text-xs" 
                                      />
                                    </div>
                                    <div>
                                      <label className="text-zinc-555 block mb-1 text-[9.5px]">Contact Details (Email/Phone)</label>
                                      <input 
                                        type="text" 
                                        placeholder="sjenkins@google.com" 
                                        value={formRecruiterContact}
                                        onChange={e => setFormRecruiterContact(e.target.value)}
                                        className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-155 outline-none transition text-xs" 
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-zinc-555 block mb-1 text-[9.5px]">Follow-Up Reminders / Status Info</label>
                                    <input 
                                      type="text" 
                                      placeholder="e.g. Follow up on Monday regarding tech assessment" 
                                      value={formRecruiterFollowUp}
                                      onChange={e => setFormRecruiterFollowUp(e.target.value)}
                                      className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-155 outline-none transition text-xs" 
                                    />
                                  </div>
                                </div>

                                <div className="border-t border-zinc-900/60 pt-2.5">
                                  <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                    Follow-Up Notes
                                  </label>
                                  <textarea 
                                    placeholder="e.g. Sent follow up email on May 28, waiting for scheduling confirmation..." 
                                    value={formFollowUpNotes}
                                    onChange={e => setFormFollowUpNotes(e.target.value)}
                                    rows={2.5}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-150 outline-none transition text-xs" 
                                  />
                                </div>
                              </div>
                            )}

                            {/* Tab 3: Attachments */}
                            {formSubTab === 'attachments' && (
                              <div className="space-y-3 mt-1 animate-fade-in">
                                <div>
                                  <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                                    Upload Documents (JD, Offer Letter, Assessment)
                                  </label>
                                  <input 
                                    type="file" 
                                    multiple
                                    onChange={handleAttachmentUploadSimulate}
                                    className="w-full h-[36px] bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl text-[9.5px] text-zinc-400 file:mr-2 file:py-0.5 file:px-1.5 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-zinc-850 file:text-zinc-350 outline-none cursor-pointer"
                                  />
                                </div>

                                {formAttachments.length > 0 ? (
                                  <div className="space-y-1.5 border-t border-zinc-900/60 pt-2.5 max-h-[150px] overflow-y-auto scrollbar-thin">
                                    {formAttachments.map((file, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-[9.5px] font-mono text-zinc-300">
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-zinc-200 truncate max-w-[200px]" title={file.name}>{file.name}</span>
                                          <span className="text-zinc-500 text-[8.5px]">{file.size} • {file.uploadDate}</span>
                                        </div>
                                        <button 
                                          type="button" 
                                          onClick={() => setFormAttachments(formAttachments.filter((_, i) => i !== idx))} 
                                          className="text-rose-500 hover:text-rose-400 px-1.5 font-bold text-[12px]"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-zinc-550 border border-dashed border-zinc-850 rounded-xl leading-normal text-[10px] italic">
                                    No attachments uploaded yet. Support multiple files.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Column 2: Interview Pipeline (Conditional) */}
                          {isInterviewVisible && (
                            <div className="border-t xl:border-t-0 xl:border-l border-zinc-800/80 pt-4 xl:pt-0 xl:pl-5 space-y-3.5 flex flex-col xl:h-full xl:overflow-hidden min-h-0">
                              {/* Interview Header */}
                              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Interview Process</span>
                                <button 
                                  type="button" 
                                  onClick={addInterviewRound}
                                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-[10px] cursor-pointer"
                                >
                                  + Add Round
                                </button>
                              </div>

                              {/* Smart Templates Selector */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-2.5">
                                <span className="text-[10px] text-zinc-555 font-bold uppercase tracking-wider">Templates:</span>
                                <div className="flex gap-1.5 text-[9px]">
                                  <button 
                                    type="button" 
                                    onClick={() => applySmartTemplate('swe')}
                                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                                  >
                                    SWE
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => applySmartTemplate('product')}
                                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                                  >
                                    Product
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => applySmartTemplate('startup')}
                                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                                  >
                                    Startup
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => setFormRounds([])}
                                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 mt-1">
                                <span>Total Interview Rounds: {formRounds.length}</span>
                              </div>

                              {formRounds.length === 0 ? (
                                <div className="text-center py-8 text-zinc-550 border border-dashed border-zinc-850 rounded-xl leading-normal text-[10px] italic">
                                  No interview rounds configured yet. Select a template or click "+ Add Round" to build your process.
                                </div>
                              ) : (
                                <div className="space-y-2.5 max-h-[340px] xl:max-h-none xl:flex-1 xl:overflow-y-auto xl:min-h-0 pr-1 pb-1 scrollbar-thin">
                                  {formRounds.map((round, idx) => {
                                    const isCollapsed = !roundOpenState[round.id];
                                    
                                    let statusBadgeColor = 'bg-zinc-800 text-zinc-450 border-zinc-700';
                                    let statusSymbol = '○';
                                    if (round.status === 'Scheduled') {
                                      statusBadgeColor = 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';
                                      statusSymbol = '📅';
                                    } else if (round.status === 'Passed') {
                                      statusBadgeColor = 'bg-emerald-955/40 text-emerald-400 border-emerald-900/30';
                                      statusSymbol = '✓';
                                    } else if (round.status === 'Failed') {
                                      statusBadgeColor = 'bg-rose-955/40 text-rose-455 border-rose-900/30';
                                      statusSymbol = '✗';
                                    } else if (round.status === 'Skipped') {
                                      statusBadgeColor = 'bg-zinc-900 text-zinc-500 border-zinc-850';
                                      statusSymbol = '—';
                                    }

                                    return (
                                      <div 
                                        key={round.id} 
                                        draggable
                                        onDragStart={(e) => {
                                          setDraggedRoundIndex(idx);
                                          e.dataTransfer.effectAllowed = "move";
                                        }}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                        }}
                                        onDrop={(e) => {
                                          handleRoundDrop(idx);
                                        }}
                                        onDragEnd={() => {
                                          setDraggedRoundIndex(null);
                                        }}
                                        className={`border border-zinc-850 bg-zinc-950 rounded-xl overflow-hidden shadow-sm transition text-xs ${draggedRoundIndex === idx ? 'opacity-40 border-indigo-500 border-dashed' : 'hover:border-zinc-700'}`}
                                      >
                                        {/* Round Card Header */}
                                        <div 
                                          onClick={() => setRoundOpenState(prev => ({ ...prev, [round.id]: !prev[round.id] }))}
                                          className="flex justify-between items-center bg-zinc-900/40 hover:bg-zinc-900 transition px-3 py-2 cursor-pointer select-none"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-zinc-650 font-bold cursor-grab active:cursor-grabbing hover:text-zinc-300 select-none">☰</span>
                                            <span className="font-extrabold text-zinc-300 flex items-center gap-1.5">
                                              <span className="text-zinc-500 font-bold">{statusSymbol}</span>
                                              {idx + 1}. {round.name || round.type}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            {/* Status selector select */}
                                            <select 
                                              value={round.status} 
                                              onChange={e => updateRoundField(round.id, 'status', e.target.value)} 
                                              className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-lg cursor-pointer outline-none bg-zinc-950 ${statusBadgeColor}`}
                                            >
                                              <option value="Pending">Pending</option>
                                              <option value="Scheduled">Scheduled</option>
                                              <option value="Passed">Passed</option>
                                              <option value="Failed">Failed</option>
                                              <option value="Skipped">Skipped</option>
                                            </select>

                                            <div className="flex items-center border border-zinc-850 rounded bg-zinc-950 p-0.5 text-[8px] font-bold">
                                              <button type="button" disabled={idx === 0} onClick={() => moveRound(idx, 'up')} className="px-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-500 transition">▲</button>
                                              <button type="button" disabled={idx === formRounds.length - 1} onClick={() => moveRound(idx, 'down')} className="px-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-500 transition">▼</button>
                                            </div>

                                            <button 
                                              type="button" 
                                              onClick={() => deleteRound(round.id)} 
                                              className="text-rose-500 hover:text-rose-455 p-0.5 transition"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Collapsible Detail fields */}
                                        {!isCollapsed && (
                                          <div className="p-3 border-t border-zinc-850/60 bg-zinc-950/30 space-y-2.5">
                                            <div className="grid grid-cols-2 gap-2.5">
                                              <div>
                                                <label className="text-zinc-500 block mb-1 text-[9px]">Round Type</label>
                                                <select 
                                                  value={round.type} 
                                                  onChange={e => updateRoundField(round.id, 'type', e.target.value)} 
                                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300"
                                                >
                                                  <option value="Technical Assessment">Technical Assessment</option>
                                                  <option value="Communication Assessment">Communication Assessment</option>
                                                  <option value="Coding Round">Coding Round</option>
                                                  <option value="Behavioral Round">Behavioral Round</option>
                                                  <option value="HR Round">HR Round</option>
                                                  <option value="Managerial Round">Managerial Round</option>
                                                  <option value="Final Interview">Final Interview</option>
                                                  <option value="Custom Round">Custom Round</option>
                                                </select>
                                              </div>
                                              <div>
                                                <label className="text-zinc-500 block mb-1 text-[9px]">Custom Name (Optional)</label>
                                                <input 
                                                  type="text" 
                                                  placeholder="e.g. Founder Round" 
                                                  value={round.name || ''} 
                                                  onChange={e => updateRoundField(round.id, 'name', e.target.value)} 
                                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300" 
                                                />
                                              </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                              <div>
                                                <label className="text-zinc-500 block mb-1 text-[9px]">Interview Date</label>
                                                <input 
                                                  type="date" 
                                                  value={round.date || ''} 
                                                  onChange={e => updateRoundField(round.id, 'date', e.target.value)} 
                                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300" 
                                                />
                                              </div>
                                              <div>
                                                <label className="text-zinc-500 block mb-1 text-[9px]">Interview Time</label>
                                                <input 
                                                  type="time" 
                                                  value={round.time || ''} 
                                                  onChange={e => updateRoundField(round.id, 'time', e.target.value)} 
                                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300" 
                                                />
                                              </div>
                                            </div>

                                            <div>
                                              <label className="text-zinc-500 block mb-1 text-[9px]">Meeting Link (Meet, Zoom, Teams)</label>
                                              <input 
                                                type="url" 
                                                placeholder="https://..." 
                                                value={round.meetingLink || ''} 
                                                onChange={e => updateRoundField(round.id, 'meetingLink', e.target.value)} 
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300 font-mono" 
                                              />
                                            </div>

                                            <div>
                                              <label className="text-zinc-500 block mb-1 text-[9px]">Round Notes</label>
                                              <textarea 
                                                placeholder="Questions asked, preparation points, feedback..." 
                                                value={round.notes || ''} 
                                                onChange={e => updateRoundField(round.id, 'notes', e.target.value)} 
                                                rows={2}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 outline-none text-[11px] text-zinc-350" 
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Form Footer with Sticky CTA Button */}
                  <div className="py-3 px-4 border-t border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm shrink-0">
                    <button 
                      onClick={() => {
                        if (!formCompany || !formRole) {
                          alert("Please fill out Company Name and Role / Position.");
                          return;
                        }

                        addApplication({
                          company: formCompany,
                          role: formRole,
                          jobUrl: formUrl,
                          jd: formNotes || "Manual insert details.",
                          location: formLoc,
                          experienceRequired: "3+ years",
                          workMode: formWorkMode,
                          status: formStatus,
                          appliedDate: formAppDate.split('T')[0] || new Date().toISOString().split('T')[0],
                          appliedFromEmail: formEmailUsed,
                          resumeUsed: formResumeVersion || (formResumeMetadata ? `Uploaded: ${formResumeMetadata.name}` : ''),
                          coverLetterUsed: "",
                          referralUsed: formReferralUsed,
                          referrerName: formReferralUsed ? formReferrerName : "",
                          referrerLinkedin: formReferralUsed ? formReferrerLinkedin : "",
                          referralNotes: formReferralUsed ? formReferralNotes : "",
                          recruiterAssigned: formRecruiterName,
                          recruiterName: formRecruiterName,
                          recruiterContact: formRecruiterContact,
                          recruiterFollowUp: formRecruiterFollowUp,
                          followUpNotes: formFollowUpNotes,
                          notes: formNotes,
                          priority: 'Medium', // calculated automatically in store anyway
                          source: formAppMethod === 'Other' ? formCustomMethod : formAppMethod,
                          customMethod: formAppMethod === 'Other' ? formCustomMethod : '',
                          applicationType: formAppType,
                          shortlisted: formShortlisted,
                          interviewRounds: formRounds,
                          attachments: formAttachments,
                          resumeTags: formResumeTags,
                          resumeFile: formResumeFile || '',
                          workspaceId: activeWorkspaceId
                        });

                        // Reset form
                        setFormCompany('');
                        setFormRole('');
                        setFormUrl('');
                        setFormLoc(userProfile.defaultLocationPreference || '');
                        setFormWorkMode(userProfile.defaultWorkMode || 'Remote');
                        const now = new Date();
                        const offset = now.getTimezoneOffset() * 60000;
                        setFormAppDate(new Date(now.getTime() - offset).toISOString().slice(0, 16));
                        const defaultEmail = (userProfile.email && userProfile.email !== 'alex.dev@gmail.com' && userProfile.defaultEmailAccount === 'alex.dev@gmail.com')
                          ? userProfile.email
                          : (userProfile.defaultEmailAccount || '');
                        setFormEmailUsed(defaultEmail);
                        setFormAppMethod(userProfile.defaultApplicationMethod || 'Company Careers Page');
                        setFormCustomMethod('');
                        setFormAppType('Full Time');
                        setFormReferralUsed(false);
                        setFormReferrerName('');
                        setFormReferrerLinkedin('');
                        setFormReferralNotes('');
                        setFormStatus('Applied');
                        setFormShortlisted(false);
                        setFormResumeVersion(userProfile.defaultResumeVersion || '');
                        setFormResumeFile('');
                        setFormResumeMetadata(null);
                        setFormResumeTags([]);
                        setFormRounds([]);
                        setFormNotes('');
                        setFormRecruiterName('');
                        setFormRecruiterContact('');
                        setFormRecruiterFollowUp('');
                        setFormFollowUpNotes('');
                        setFormAttachments([]);
                         setOpenSections({
                          'job-details': true,
                          'tracking': false,
                          'status': false,
                          'resume': false,
                          'interview': false,
                          'notes': false,
                          'attachments': false
                        });
                      }}
                      className="w-full h-11 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-650/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      Add Application
                    </button>
                  </div>
                </div> {/* Closes Left Side container */}

                {/* Right Side: Job Tracker Board */}
                <div className="h-auto overflow-visible space-y-4 pr-0 pb-0 lg:h-full lg:overflow-hidden lg:pr-1 lg:space-y-4 lg:pb-0 lg:min-h-0 flex flex-col">
                  {/* Pipeline Stage Filter Pills */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0 border-b border-zinc-900 pb-2 px-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Application Pipeline</span>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[9px] text-zinc-550 font-bold uppercase mr-1">Filter Column:</span>
                      {(['All', 'Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setTrackerStageFilter(st)}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-black transition cursor-pointer select-none ${
                            trackerStageFilter === st 
                              ? 'bg-indigo-650 text-white shadow-sm' 
                              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                          }`}
                        >
                          {st === 'All' ? 'Show All' : st === 'Wishlist' ? 'Saved' : st === 'OA' ? 'Assessments' : st === 'Interview' ? 'Interviews' : st === 'Offer' ? 'Offers' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-4 flex-1 scrollbar-thin">
                  {(['Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted'] as const)
                    .filter(stage => trackerStageFilter === 'All' || stage === trackerStageFilter)
                    .map((stage) => {
                    const stageApps = filteredApps.filter(a => stage === 'Wishlist' ? (a.status === 'Wishlist' || a.status === 'Saved') : a.status === stage);
                    
                    const isCollapsed = collapsedStages[stage];
                    
                    // Display name mapping
                    const STAGE_DISPLAY_NAMES: Record<string, string> = {
                      Wishlist: 'Saved / Need Apply',
                      Applied: 'Applied',
                      OA: 'Assessments',
                      Interview: 'Interviews',
                      Offer: 'Offers',
                      Rejected: 'Rejected',
                      Ghosted: 'Ghosted'
                    };

                    // Style specific headers
                    let borderLeftColor = 'border-l-zinc-700';
                    let stageBadgeColor = 'bg-zinc-800 text-zinc-400';
                    let textAccent = 'text-zinc-300';
                    let dotColor = 'bg-zinc-500';
                    if (stage === 'Applied') { borderLeftColor = 'border-l-blue-500'; textAccent = 'text-blue-400'; stageBadgeColor = 'bg-blue-950/40 text-blue-400'; dotColor = 'bg-blue-500'; }
                    else if (stage === 'OA') { borderLeftColor = 'border-l-purple-500'; textAccent = 'text-purple-400'; stageBadgeColor = 'bg-purple-950/40 text-purple-400'; dotColor = 'bg-purple-500'; }
                    else if (stage === 'Interview') { borderLeftColor = 'border-l-amber-500'; textAccent = 'text-amber-400'; stageBadgeColor = 'bg-amber-950/40 text-amber-400'; dotColor = 'bg-amber-500'; }
                    else if (stage === 'Offer') { borderLeftColor = 'border-l-emerald-500'; textAccent = 'text-emerald-400'; stageBadgeColor = 'bg-emerald-950/40 text-emerald-400'; dotColor = 'bg-emerald-500'; }
                    else if (stage === 'Rejected') { borderLeftColor = 'border-l-rose-500'; textAccent = 'text-rose-400'; stageBadgeColor = 'bg-rose-950/40 text-rose-400'; dotColor = 'bg-rose-500'; }
                    else if (stage === 'Ghosted') { borderLeftColor = 'border-l-zinc-500'; textAccent = 'text-zinc-555'; stageBadgeColor = 'bg-zinc-800 text-zinc-500'; dotColor = 'bg-zinc-500'; }
                    else if (stage === 'Wishlist') { borderLeftColor = 'border-l-sky-500'; textAccent = 'text-sky-400'; stageBadgeColor = 'bg-sky-950/40 text-sky-400'; dotColor = 'bg-sky-500'; }

                    return (
                      <div 
                        key={stage} 
                        className={`bg-zinc-900/10 border border-zinc-850/60 rounded-xl p-3.5 flex flex-col gap-2 shadow-sm border-l-4 ${borderLeftColor}`}
                      >
                        <div 
                          className="flex justify-between items-center cursor-pointer select-none pb-1"
                          onClick={() => setCollapsedStages(prev => ({ ...prev, [stage]: !prev[stage] }))}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className={`w-3.5 h-3.5 text-zinc-550 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} />
                            <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`}></div>
                            <span className={`text-xs font-extrabold uppercase tracking-wider ${textAccent}`}>{STAGE_DISPLAY_NAMES[stage]}</span>
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${stageBadgeColor} border border-zinc-800`}>
                              {stageApps.length}
                            </span>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="w-full pt-1.5 border-t border-zinc-900/40">
                            {stageApps.length === 0 ? (
                              <div className="text-[10px] text-zinc-550 italic py-3 pl-1">
                                No applications in this stage yet
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                {stageApps.map((app) => {
                                  const STAGES_LIST = ['Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted'] as const;
                                  const appStatus = app.status === 'Saved' ? 'Wishlist' : app.status;
                                  const stageIndex = STAGES_LIST.indexOf(appStatus as any);
                                  const prevStage = stageIndex > 0 ? STAGES_LIST[stageIndex - 1] : null;
                                  const nextStage = stageIndex < STAGES_LIST.length - 1 ? STAGES_LIST[stageIndex + 1] : null;

                                  return (
                                    <div 
                                      key={app.id} 
                                      className={`bg-zinc-955/45 backdrop-blur-md p-3.5 rounded-2xl flex flex-col gap-2.5 transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-md hover:shadow-black/20 border ${
                                        app.shortlisted 
                                          ? 'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)] bg-zinc-900/40' 
                                          : 'border-zinc-855 hover:border-zinc-700/80 hover:bg-zinc-900/40'
                                      }`}
                                    >
                                      {/* Subtle left indicator for priority */}
                                      <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                                        app.priority === 'Critical' ? 'bg-rose-500' :
                                        app.priority === 'High' ? 'bg-amber-500' :
                                        app.priority === 'Medium' ? 'bg-blue-500' : 'bg-zinc-700'
                                      }`}></div>

                                      <div className="space-y-1 pl-1">
                                        <div className="flex justify-between items-start gap-1">
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            {renderCompanyLogo(app.company)}
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                              {app.shortlisted && (
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                                              )}
                                              <span className="font-extrabold text-[13px] text-white block truncate" title={app.company}>
                                                {app.company}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            {/* Always visible Quick status arrows */}
                                            <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 px-1 py-0.5 shadow-sm rounded">
                                              {prevStage && (
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateApplicationStatus(app.id, prevStage);
                                                  }}
                                                  className="text-[8px] text-zinc-400 hover:text-indigo-400 font-bold transition px-0.5 cursor-pointer"
                                                  title={`Move to ${prevStage}`}
                                                >
                                                  ◀
                                                </button>
                                              )}
                                              {nextStage && (
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateApplicationStatus(app.id, nextStage);
                                                  }}
                                                  className="text-[8px] text-zinc-400 hover:text-indigo-400 font-bold transition px-0.5 cursor-pointer"
                                                  title={`Move to ${nextStage}`}
                                                >
                                                  ▶
                                                </button>
                                              )}
                                            </div>

                                            {app.jobUrl && (
                                              <a 
                                                href={app.jobUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-zinc-500 hover:text-indigo-400 transition"
                                                title="View Job Post"
                                              >
                                                <ExternalLink className="w-3 h-3" />
                                              </a>
                                            )}
                                            <span className={`text-[7.5px] font-black px-1 py-0.5 rounded-full uppercase leading-none shrink-0 ${
                                              app.priority === 'Critical' 
                                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                                : app.priority === 'High' 
                                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                                  : app.priority === 'Medium'
                                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    : 'bg-zinc-805 text-zinc-400 border border-zinc-700'
                                            }`}>
                                              {app.priority || 'Low'}
                                            </span>
                                          </div>
                                        </div>

                                        <span className="text-[11.5px] text-zinc-300 font-semibold block truncate leading-snug" title={app.role}>
                                          {app.role}
                                        </span>
                                      </div>

                                      {/* Tags section */}
                                      <div className="flex flex-wrap gap-1.5 mt-1 pl-1">
                                        <span className="text-[9px] bg-zinc-900/60 text-zinc-350 px-2 py-0.5 rounded font-semibold border border-zinc-850/40">
                                          {app.workMode}
                                        </span>
                                        {app.location && (
                                          <span className="text-[9px] bg-zinc-900/60 text-zinc-350 px-2 py-0.5 rounded font-semibold border border-zinc-850/40 truncate max-w-[130px]" title={app.location}>
                                            📍 {app.location.split(',')[0]}
                                          </span>
                                        )}
                                        {app.applicationType && (
                                          <span className="text-[9px] bg-zinc-900/60 text-zinc-350 px-2 py-0.5 rounded font-semibold border border-zinc-850/40">
                                            {app.applicationType}
                                          </span>
                                        )}
                                        {app.referralUsed ? (
                                          <span className="text-[9px] bg-emerald-955/30 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-emerald-900/30" title={app.referrerName ? `Referred by ${app.referrerName}` : 'Employee Referral'}>
                                            👥 Referred
                                          </span>
                                        ) : (
                                          app.source && (
                                            <span className="text-[9px] bg-zinc-900/60 text-zinc-450 px-2 py-0.5 rounded font-semibold border border-zinc-850/40 truncate max-w-[120px]" title={app.source}>
                                              {app.source}
                                            </span>
                                          )
                                        )}
                                      </div>

                                      {/* Pipeline Tracker */}
                                      {app.interviewRounds && app.interviewRounds.length > 0 && (
                                        <div className="pl-1 border-t border-zinc-900/60 pt-2 space-y-1.5">
                                          <div className="flex justify-between items-center text-[9px] text-zinc-500">
                                            <span className="font-bold uppercase tracking-wider text-indigo-400">Interviews</span>
                                            <span className="font-mono font-bold text-[9px] bg-indigo-950/40 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/30">
                                              Rd {app.currentRound || 1}/{app.totalRounds || app.interviewRounds.length}
                                            </span>
                                          </div>
                                          
                                          {/* Progress dots for rounds */}
                                          <div className="flex gap-1.5 items-center py-0.5">
                                            {app.interviewRounds.map((round, rIdx) => (
                                              <div 
                                                key={round.id || rIdx} 
                                                className={`w-2 h-2 rounded-full transition ${
                                                  round.status === 'Passed' ? 'bg-emerald-500' :
                                                  round.status === 'Failed' ? 'bg-rose-500' :
                                                  round.status === 'Scheduled' ? 'bg-indigo-455' :
                                                  round.status === 'Skipped' ? 'bg-zinc-650' : 'bg-zinc-800'
                                                }`}
                                                title={`${round.name || round.type} - ${round.status}`}
                                              />
                                            ))}
                                            {/* Next round label */}
                                            {(() => {
                                              const nextRound = app.interviewRounds.find(r => r.status === 'Scheduled' || r.status === 'Pending');
                                              if (nextRound) {
                                                return (
                                                  <span className="text-[8.5px] text-zinc-455 truncate max-w-[130px] ml-1">
                                                    Next: {nextRound.name || nextRound.type}
                                                  </span>
                                                );
                                              }
                                              return null;
                                            })()}
                                          </div>
                                        </div>
                                      )}

                                      {/* Recruiter & Attachments Row */}
                                      {((app.recruiterName || app.recruiterAssigned) || (app.attachments && app.attachments.length > 0)) && (
                                        <div className="pl-1 flex justify-between items-center text-[8.5px] text-zinc-500">
                                          {(app.recruiterName || app.recruiterAssigned) ? (
                                            <span className="truncate max-w-[160px]" title={app.recruiterName || app.recruiterAssigned}>
                                              👤 Recruiter: <span className="text-zinc-355 font-medium">{app.recruiterName || app.recruiterAssigned}</span>
                                            </span>
                                          ) : <span></span>}
                                          {app.attachments && app.attachments.length > 0 && (
                                            <span className="shrink-0 text-zinc-400 font-medium">📎 {app.attachments.length} file{app.attachments.length > 1 ? 's' : ''}</span>
                                          )}
                                        </div>
                                      )}

                                      {/* Applied Date & Actions - Stretched Resume button and readable */}
                                      <div className="flex justify-between items-center text-[9px] text-zinc-500 mt-1 border-t border-zinc-900/60 pt-2 pl-1 shrink-0 gap-2">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                          <span className="font-mono text-[9px] text-zinc-500 shrink-0">
                                            {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'No Date'}
                                          </span>
                                          {(app.resumeUsed || app.resumeFile) && (
                                            <button 
                                              onClick={() => {
                                                if (app.resumeFile) {
                                                  setPreviewResume({
                                                    id: app.id,
                                                    name: app.resumeUsed?.replace('Uploaded: ', '') || app.resumeFile.split('/').pop()?.split('\\').pop() || 'Resume Document',
                                                    fileUrl: app.resumeFile,
                                                    uploadDate: app.appliedDate || new Date().toLocaleDateString(),
                                                    isMockFile: true
                                                  });
                                                  setPreviewResumeName(app.resumeUsed || 'Uploaded Resume');
                                                } else {
                                                  const linkedRes = resumes.find(r => r.name === app.resumeUsed);
                                                  if (linkedRes) {
                                                    setPreviewResume(linkedRes);
                                                    setPreviewResumeName(linkedRes.name);
                                                  } else {
                                                    setPreviewResume({
                                                      id: app.id,
                                                      name: app.resumeUsed || 'Resume Document',
                                                      fileUrl: '',
                                                      uploadDate: app.appliedDate || new Date().toLocaleDateString(),
                                                      isMockFile: true
                                                    });
                                                    setPreviewResumeName(app.resumeUsed || 'Uploaded Resume');
                                                  }
                                                }
                                              }}
                                              className="text-[9px] bg-indigo-950/20 text-indigo-400 border border-indigo-900/35 hover:bg-indigo-900/30 hover:border-indigo-800 transition-all font-bold rounded px-2 py-0.5 flex items-center gap-1.5 cursor-pointer select-none max-w-none truncate flex-1 justify-start min-w-[80px]"
                                              title="Click to Preview Resume"
                                            >
                                              <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                                              <span className="truncate">{app.resumeUsed ? app.resumeUsed.replace('Uploaded: ', '') : 'View Resume'}</span>
                                            </button>
                                          )}
                                        </div>
                                        
                                        <div className="flex gap-2 items-center shrink-0">
                                          <Edit2 
                                            onClick={() => handleOpenEditJobModal(app)}
                                            className="w-3.5 h-3.5 text-zinc-550 hover:text-zinc-200 cursor-pointer transition"
                                          />
                                          <Trash2 
                                            onClick={() => {
                                              if (confirm(`Delete application for ${app.company}?`)) {
                                                deleteApplication(app.id);
                                              }
                                            }}
                                            className="w-3.5 h-3.5 text-rose-500/70 hover:text-rose-400 cursor-pointer transition"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: RESUME BUILDER & ATS OPTIMIZER (ALL EDITABLE) */}
          {activeTab === 'resumes' && (
            <div className="space-y-6 animate-fade-in relative z-10">
              {/* Custom CSS Style tag to isolate resume block for printing */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #resume-print-canvas, #resume-print-canvas * {
                    visibility: visible !important;
                  }
                  #resume-print-canvas {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 21cm !important;
                    height: 29.7cm !important;
                    margin: 0 !important;
                    padding: 1.5cm !important;
                    box-shadow: none !important;
                    background: white !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              ` }} />

              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-400" />
                    <span>Resume & ATS Studio</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Modify fields, configure custom templates, and analyze ATS score real-time.</p>
                </div>
              </div>

              {/* Resume Version selector tabs */}
              <div className="flex flex-wrap gap-2 items-center bg-zinc-900 border border-zinc-850 p-2 rounded-xl">
                {resumes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResumeId(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedResumeId === r.id ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {r.name} ({r.version})
                  </button>
                ))}
                <button
                  onClick={() => {
                    const name = prompt("Enter template version name:", `Resume V${resumes.length + 1} - Custom`);
                    if (name) {
                      addResumeVersion(name, "classic");
                    }
                  }}
                  className="ml-auto flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Version</span>
                </button>
              </div>

              {!activeResume ? (
                <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white">No resume versions found</h3>
                  <p className="text-xs text-zinc-550 mt-1">Create a resume version to start customizing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT PANEL: FlowCV Editor (xl:col-span-7) */}
                  <div className="xl:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    
                    {/* Header Controls for Tab Routing & Resume Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
                      <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-850 shadow-inner">
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

                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block mb-0.5">Resume Version</span>
                          <input
                            type="text"
                            value={activeResume.name}
                            onChange={(e) => updateResume(activeResume.id, { name: e.target.value })}
                            className="bg-transparent text-xs font-extrabold text-white outline-none border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 py-0.5 transition w-full sm:w-44"
                          />
                        </div>
                        <label className="flex items-center gap-1.5 text-zinc-450 cursor-pointer select-none mt-4.5">
                          <input 
                            type="checkbox" 
                            checked={activeResume.isPublic}
                            onChange={(e) => updateResume(activeResume.id, { isPublic: e.target.checked })}
                            className="rounded accent-indigo-600"
                          />
                          <span>Public</span>
                        </label>
                        <div className="h-4 w-px bg-zinc-800 mt-4.5"></div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${activeResume.name}"? This cannot be undone.`)) {
                              const remaining = resumes.filter(r => r.id !== activeResume.id);
                              deleteResume(activeResume.id);
                              if (remaining.length > 0) {
                                setSelectedResumeId(remaining[0].id);
                              } else {
                                setSelectedResumeId('');
                              }
                            }
                          }}
                          className="flex items-center gap-1 text-rose-500 hover:text-rose-400 font-bold hover:bg-rose-955/20 px-2 py-1 rounded-lg transition mt-4.5 cursor-pointer"
                          title="Delete this resume version"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* SUB-TAB 1: CONTENT EDITOR WORKSPACE */}
                    {resumeSubTab === 'content' && (
                      <div className="space-y-4 animate-fade-in">
                        
                        {/* A. Personal Details Card */}
                        <div id="section-personal" className="border border-zinc-850 bg-zinc-950/40 p-4.5 rounded-2xl relative overflow-hidden backdrop-blur-sm space-y-4 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="relative w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                                {activeResume.personalPhoto || userProfile.profilePhoto ? (
                                  <img 
                                    src={activeResume.personalPhoto || userProfile.profilePhoto} 
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-zinc-600" />
                                )}
                              </div>
                              <div className="space-y-0.5 text-left">
                                <h4 className="text-sm font-extrabold text-white leading-none">
                                  {activeResume.personalName || userProfile.name || 'Set Full Name'}
                                </h4>
                                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                                  {activeResume.personalTitle || userProfile.experience || 'Set Job Title'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-850/60 transition text-zinc-400 hover:text-white text-[10.5px] font-bold cursor-pointer"
                            >
                              {isEditingPersonal ? 'Save details' : 'Edit details'}
                            </button>
                          </div>

                          {isEditingPersonal ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-3.5 border-t border-zinc-900 text-left">
                              <div>
                                <label className="text-zinc-550 block mb-1">Full Name</label>
                                <input
                                  type="text"
                                  value={activeResume.personalName ?? userProfile.name ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalName: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-550 block mb-1">Professional Title</label>
                                <input
                                  type="text"
                                  value={activeResume.personalTitle ?? userProfile.experience ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalTitle: e.target.value })}
                                  placeholder="e.g. Senior Software Engineer"
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-550 block mb-1">Email</label>
                                <input
                                  type="email"
                                  value={activeResume.personalEmail ?? userProfile.email ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalEmail: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-550 block mb-1">Phone</label>
                                <input
                                  type="text"
                                  value={activeResume.personalPhone ?? userProfile.phone ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalPhone: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-550 block mb-1">Location</label>
                                <input
                                  type="text"
                                  value={activeResume.personalLocation ?? userProfile.location ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalLocation: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-550 block mb-1">Photo URL</label>
                                <input
                                  type="text"
                                  value={activeResume.personalPhoto ?? userProfile.profilePhoto ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalPhoto: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-550 block mb-1">LinkedIn URL</label>
                                <input
                                  type="text"
                                  value={activeResume.personalLinkedin ?? userProfile.linkedin ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalLinkedin: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-550 block mb-1">GitHub URL</label>
                                <input
                                  type="text"
                                  value={activeResume.personalGithub ?? userProfile.github ?? ''}
                                  onChange={(e) => updateResume(activeResume.id, { personalGithub: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-zinc-200 outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-[10.5px] pt-3.5 border-t border-zinc-900 text-zinc-400 font-medium text-left">
                              <div className="flex items-center gap-1.5 truncate">
                                <span>📧</span>
                                <span className="truncate">{activeResume.personalEmail || userProfile.email || 'Email Spec'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>📞</span>
                                <span>{activeResume.personalPhone || userProfile.phone || 'Phone Spec'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <span>📍</span>
                                <span className="truncate">{activeResume.personalLocation || userProfile.location || 'Location Spec'}</span>
                              </div>
                              {activeResume.personalLinkedin && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <span>🔗</span>
                                  <span className="truncate">{activeResume.personalLinkedin}</span>
                                </div>
                              )}
                              {activeResume.personalGithub && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <span>💻</span>
                                  <span className="truncate">{activeResume.personalGithub}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* B. Stacked Accordion Panels */}
                        <div className="space-y-3">
                          
                          {/* 1. Professional Summary Accordion */}
                          <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20" id="section-summary">
                            <div 
                              onClick={() => toggleResumeSection('summary')}
                              className="flex justify-between items-center px-4 py-3 bg-zinc-900/60 cursor-pointer hover:bg-zinc-850/60 transition"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">Professional Summary</span>
                              </div>
                              {openResumeSections.summary ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            </div>
                            
                            {openResumeSections.summary && (
                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 text-left">
                                <label className="text-zinc-550 block mb-1.5 text-[10.5px] font-bold">Introduce yourself with key strengths & credentials</label>
                                <textarea
                                  rows={5}
                                  value={activeResume.summary}
                                  onChange={(e) => updateResume(activeResume.id, { summary: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 transition leading-normal font-sans text-xs"
                                  placeholder="Highly driven software developer..."
                                />
                              </div>
                            )}
                          </div>

                          {/* 2. Work Experience Accordion */}
                          <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20" id="section-experience">
                            <div 
                              onClick={() => toggleResumeSection('experience')}
                              className="flex justify-between items-center px-4 py-3 bg-zinc-900/60 cursor-pointer hover:bg-zinc-850/60 transition"
                            >
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">Work Experience</span>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setEditingEntryType('experience');
                                    setEditingEntryIndex(null);
                                    setEditingEntryData({ title: '', subtitle: '', startDate: '', endDate: '', location: '', description: '', hidden: false });
                                    setShowEditEntryModal(true);
                                  }}
                                  className="text-[9.5px] font-extrabold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 cursor-pointer transition"
                                >
                                  + Add Entry
                                </button>
                                {openResumeSections.experience ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                              </div>
                            </div>
                            {openResumeSections.experience && (
                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 text-xs">
                                {localExp.length === 0 ? (
                                  <div className="text-center py-6 text-zinc-650 italic">No experience entries added. Click "+ Add Entry".</div>
                                ) : (
                                  <div className="space-y-2.5">
                                    {localExp.map((exp, idx) => (
                                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/50 transition">
                                        <div 
                                          onClick={() => {
                                            setEditingEntryType('experience');
                                            setEditingEntryIndex(idx);
                                            let start = '', end = '';
                                            if (exp.duration) {
                                              const dates = exp.duration.split(' - ');
                                              start = dates[0] || '';
                                              end = dates[1] || '';
                                            }
                                            setEditingEntryData({
                                              title: exp.role,
                                              subtitle: exp.company,
                                              startDate: start,
                                              endDate: end,
                                              location: '',
                                              description: exp.description,
                                              hidden: !!exp.hidden
                                            });
                                            setShowEditEntryModal(true);
                                          }}
                                          className="flex-1 flex items-center gap-2 cursor-pointer text-left"
                                        >
                                          <span className="text-zinc-600 select-none text-[11px] font-bold">::</span>
                                          <div className="flex flex-col min-w-0">
                                            <span className={`font-bold text-zinc-300 truncate ${exp.hidden ? 'line-through opacity-40' : ''}`}>
                                              {exp.role || 'New Position'}
                                            </span>
                                            <span className="text-[9.5px] text-zinc-550 mt-0.5 truncate">{exp.company} {exp.duration ? `(${exp.duration})` : ''}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            disabled={idx === 0}
                                            onClick={() => {
                                              const updated = [...localExp];
                                              const temp = updated[idx];
                                              updated[idx] = updated[idx - 1];
                                              updated[idx - 1] = temp;
                                              setLocalExp(updated);
                                              updateResume(activeResume.id, { experience: formatExperience(updated) });
                                            }}
                                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                                          >
                                            ▲
                                          </button>
                                          <button
                                            disabled={idx === localExp.length - 1}
                                            onClick={() => {
                                              const updated = [...localExp];
                                              const temp = updated[idx];
                                              updated[idx] = updated[idx + 1];
                                              updated[idx + 1] = temp;
                                              setLocalExp(updated);
                                              updateResume(activeResume.id, { experience: formatExperience(updated) });
                                            }}
                                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                                          >
                                            ▼
                                          </button>
                                          <button
                                            onClick={() => {
                                              const updated = [...localExp];
                                              updated[idx].hidden = !updated[idx].hidden;
                                              setLocalExp(updated);
                                              updateResume(activeResume.id, { experience: formatExperience(updated) });
                                            }}
                                            className="p-1 text-zinc-550 hover:text-zinc-350 cursor-pointer"
                                          >
                                            {exp.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
                                          </button>
                                          <button
                                            onClick={() => {
                                              const updated = localExp.filter((_, i) => i !== idx);
                                              setLocalExp(updated);
                                              updateResume(activeResume.id, { experience: formatExperience(updated) });
                                            }}
                                            className="p-1 text-rose-500 hover:text-rose-450 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 3. Education Accordion */}
                          <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20" id="section-education">
                            <div 
                              onClick={() => toggleResumeSection('education')}
                              className="flex justify-between items-center px-4 py-3 bg-zinc-900/60 cursor-pointer hover:bg-zinc-850/60 transition"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">Education</span>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setEditingEntryType('education');
                                    setEditingEntryIndex(null);
                                    setEditingEntryData({ title: '', subtitle: '', startDate: '', endDate: '', location: '', description: '', hidden: false });
                                    setShowEditEntryModal(true);
                                  }}
                                  className="text-[9.5px] font-extrabold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 cursor-pointer transition"
                                >
                                  + Add Entry
                                </button>
                                {openResumeSections.education ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                              </div>
                            </div>
                            {openResumeSections.education && (
                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 text-xs">
                                {localEdu.length === 0 ? (
                                  <div className="text-center py-6 text-zinc-650 italic">No education entries added. Click "+ Add Entry".</div>
                                ) : (
                                  <div className="space-y-2.5">
                                    {localEdu.map((edu, idx) => (
                                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/50 transition">
                                        <div 
                                          onClick={() => {
                                            setEditingEntryType('education');
                                            setEditingEntryIndex(idx);
                                            let start = '', end = '';
                                            if (edu.duration) {
                                              const dates = edu.duration.split(' - ');
                                              start = dates[0] || '';
                                              end = dates[1] || '';
                                            }
                                            setEditingEntryData({
                                              title: edu.degree,
                                              subtitle: edu.school,
                                              startDate: start,
                                              endDate: end,
                                              location: edu.gpa || '',
                                              description: '',
                                              hidden: !!edu.hidden
                                            });
                                            setShowEditEntryModal(true);
                                          }}
                                          className="flex-1 flex items-center gap-2 cursor-pointer text-left"
                                        >
                                          <span className="text-zinc-600 select-none text-[11px] font-bold">::</span>
                                          <div className="flex flex-col min-w-0">
                                            <span className={`font-bold text-zinc-300 truncate ${edu.hidden ? 'line-through opacity-40' : ''}`}>
                                              {edu.degree || 'New Degree'}
                                            </span>
                                            <span className="text-[9.5px] text-zinc-550 mt-0.5 truncate">{edu.school} {edu.duration ? `(${edu.duration})` : ''}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            disabled={idx === 0}
                                            onClick={() => {
                                              const updated = [...localEdu];
                                              const temp = updated[idx];
                                              updated[idx] = updated[idx - 1];
                                              updated[idx - 1] = temp;
                                              setLocalEdu(updated);
                                              updateResume(activeResume.id, { education: formatEducation(updated) });
                                            }}
                                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                                          >
                                            ▲
                                          </button>
                                          <button
                                            disabled={idx === localEdu.length - 1}
                                            onClick={() => {
                                              const updated = [...localEdu];
                                              const temp = updated[idx];
                                              updated[idx] = updated[idx + 1];
                                              updated[idx + 1] = temp;
                                              setLocalEdu(updated);
                                              updateResume(activeResume.id, { education: formatEducation(updated) });
                                            }}
                                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                                          >
                                            ▼
                                          </button>
                                          <button
                                            onClick={() => {
                                              const updated = [...localEdu];
                                              updated[idx].hidden = !updated[idx].hidden;
                                              setLocalEdu(updated);
                                              updateResume(activeResume.id, { education: formatEducation(updated) });
                                            }}
                                            className="p-1 text-zinc-550 hover:text-zinc-350 cursor-pointer"
                                          >
                                            {edu.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
                                          </button>
                                          <button
                                            onClick={() => {
                                              const updated = localEdu.filter((_, i) => i !== idx);
                                              setLocalEdu(updated);
                                              updateResume(activeResume.id, { education: formatEducation(updated) });
                                            }}
                                            className="p-1 text-rose-500 hover:text-rose-450 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 4. Skills Accordion */}
                          <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20" id="section-skills">
                            <div 
                              onClick={() => toggleResumeSection('skills')}
                              className="flex justify-between items-center px-4 py-3 bg-zinc-900/60 cursor-pointer hover:bg-zinc-850/60 transition"
                            >
                              <div className="flex items-center gap-2">
                                <Award className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">Skills</span>
                              </div>
                              {openResumeSections.skills ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            </div>
                            
                            {openResumeSections.skills && (
                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 text-left space-y-3.5">
                                <div>
                                  <label className="text-zinc-550 block mb-1.5 text-[10.5px] font-bold">Skills List (comma-separated)</label>
                                  <input
                                    type="text"
                                    value={activeResume.skills}
                                    onChange={(e) => updateResume(activeResume.id, { skills: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-mono text-xs"
                                    placeholder="React, Go, TypeScript, Docker..."
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 5. Projects Accordion */}
                          <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20" id="section-projects">
                            <div 
                              onClick={() => toggleResumeSection('projects')}
                              className="flex justify-between items-center px-4 py-3 bg-zinc-900/60 cursor-pointer hover:bg-zinc-850/60 transition"
                            >
                              <div className="flex items-center gap-2">
                                <Code className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">Key Projects</span>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setEditingEntryType('project');
                                    setEditingEntryIndex(null);
                                    setEditingEntryData({ title: '', subtitle: '', startDate: '', endDate: '', location: '', description: '', hidden: false });
                                    setShowEditEntryModal(true);
                                  }}
                                  className="text-[9.5px] font-extrabold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 cursor-pointer transition"
                                >
                                  + Add Entry
                                </button>
                                {openResumeSections.projects ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                              </div>
                            </div>
                            {openResumeSections.projects && (
                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 text-xs">
                                {localProj.length === 0 ? (
                                  <div className="text-center py-6 text-zinc-650 italic">No project entries added. Click "+ Add Entry".</div>
                                ) : (
                                  <div className="space-y-2.5">
                                    {localProj.map((proj, idx) => (
                                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/50 transition">
                                        <div 
                                          onClick={() => {
                                            setEditingEntryType('project');
                                            setEditingEntryIndex(idx);
                                            setEditingEntryData({
                                              title: proj.title,
                                              subtitle: '',
                                              startDate: '',
                                              endDate: '',
                                              location: '',
                                              description: proj.description,
                                              hidden: !!proj.hidden
                                            });
                                            setShowEditEntryModal(true);
                                          }}
                                          className="flex-1 flex items-center gap-2 cursor-pointer text-left"
                                        >
                                          <span className="text-zinc-600 select-none text-[11px] font-bold">::</span>
                                          <div className="flex flex-col min-w-0">
                                            <span className={`font-bold text-zinc-300 truncate ${proj.hidden ? 'line-through opacity-40' : ''}`}>
                                              {proj.title || 'New Project'}
                                            </span>
                                            <span className="text-[9.5px] text-zinc-550 mt-0.5 truncate">{proj.description.substring(0, 60)}...</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            disabled={idx === 0}
                                            onClick={() => {
                                              const updated = [...localProj];
                                              const temp = updated[idx];
                                              updated[idx] = updated[idx - 1];
                                              updated[idx - 1] = temp;
                                              setLocalProj(updated);
                                              updateResume(activeResume.id, { projects: formatProjects(updated) });
                                            }}
                                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                                          >
                                            ▲
                                          </button>
                                          <button
                                            disabled={idx === localProj.length - 1}
                                            onClick={() => {
                                              const updated = [...localProj];
                                              const temp = updated[idx];
                                              updated[idx] = updated[idx + 1];
                                              updated[idx + 1] = temp;
                                              setLocalProj(updated);
                                              updateResume(activeResume.id, { projects: formatProjects(updated) });
                                            }}
                                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                                          >
                                            ▼
                                          </button>
                                          <button
                                            onClick={() => {
                                              const updated = [...localProj];
                                              updated[idx].hidden = !updated[idx].hidden;
                                              setLocalProj(updated);
                                              updateResume(activeResume.id, { projects: formatProjects(updated) });
                                            }}
                                            className="p-1 text-zinc-550 hover:text-zinc-350 cursor-pointer"
                                          >
                                            {proj.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
                                          </button>
                                          <button
                                            onClick={() => {
                                              const updated = localProj.filter((_, i) => i !== idx);
                                              setLocalProj(updated);
                                              updateResume(activeResume.id, { projects: formatProjects(updated) });
                                            }}
                                            className="p-1 text-rose-500 hover:text-rose-450 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 6. Certifications Accordion */}
                          <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20" id="section-certifications">
                            <div 
                              onClick={() => toggleResumeSection('certifications')}
                              className="flex justify-between items-center px-4 py-3 bg-zinc-900/60 cursor-pointer hover:bg-zinc-850/60 transition"
                            >
                              <div className="flex items-center gap-2">
                                <Award className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">Certifications</span>
                              </div>
                              {openResumeSections.certifications ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            </div>
                            
                            {openResumeSections.certifications && (
                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 text-left">
                                <label className="text-zinc-550 block mb-1.5 text-[10.5px] font-bold">Certifications (comma-separated)</label>
                                <textarea
                                  rows={3}
                                  value={activeResume.certifications}
                                  onChange={(e) => updateResume(activeResume.id, { certifications: e.target.value })}
                                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-mono text-xs leading-normal"
                                  placeholder="AWS Solutions Architect, Google Cloud Professional..."
                                />
                              </div>
                            )}
                          </div>

                        </div>

                        {/* C. Centered Add Content Button */}
                        <div className="pt-2 flex justify-center">
                          <button
                            onClick={() => setShowAddContentModal(true)}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer hover:opacity-95 transition text-xs shadow-md shadow-pink-500/10 flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Content Section</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 2: CUSTOMIZE DESIGN WORKSPACE */}
                    {resumeSubTab === 'customize' && (
                      <div className="space-y-4 animate-fade-in text-xs text-left">
                        
                        {/* 1. Language & Region Settings */}
                        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span>🌍</span>
                            <span>Language & Region Settings</span>
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-zinc-550 block mb-1 font-bold">Language</label>
                              <select
                                value={activeResume.language || 'English (UK)'}
                                onChange={(e) => updateResume(activeResume.id, { language: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300 outline-none"
                              >
                                <option value="English (UK)">English (UK)</option>
                                <option value="English (US)">English (US)</option>
                                <option value="German">German</option>
                                <option value="Spanish">Spanish</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-zinc-550 block mb-1 font-bold">Date Format</label>
                              <select
                                value={activeResume.dateFormat || 'DD MMM YYYY'}
                                onChange={(e) => updateResume(activeResume.id, { dateFormat: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300 outline-none"
                              >
                                <option value="DD MMM YYYY">DD MMM YYYY</option>
                                <option value="MM/YYYY">MM/YYYY</option>
                                <option value="YYYY">YYYY</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-zinc-550 block mb-1 font-bold">Page Format</label>
                              <select
                                value={activeResume.pageFormat || 'A4'}
                                onChange={(e) => updateResume(activeResume.id, { pageFormat: e.target.value as any })}
                                className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300 outline-none"
                              >
                                <option value="A4">A4 Standard</option>
                                <option value="Letter">US Letter</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* 2. Color Swatches & Picker */}
                        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span>🎨</span>
                            <span>Accent Colors & Palette application</span>
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Standard color circles */}
                            {[
                              { id: 'indigo', color: '#4f46e5', hexClass: 'bg-indigo-600 border-indigo-500' },
                              { id: 'emerald', color: '#059669', hexClass: 'bg-emerald-600 border-emerald-500' },
                              { id: 'violet', color: '#7c3aed', hexClass: 'bg-violet-600 border-violet-500' },
                              { id: 'amber', color: '#d97706', hexClass: 'bg-amber-600 border-amber-500' },
                              { id: 'rose', color: '#e11d48', hexClass: 'bg-rose-600 border-rose-500' },
                              { id: 'sky', color: '#0284c7', hexClass: 'bg-sky-500 border-sky-400' },
                              { id: 'slate', color: '#4b5563', hexClass: 'bg-zinc-600 border-zinc-500' },
                              { id: 'cherry', color: '#b91c1c', hexClass: 'bg-red-700 border-red-600' },
                            ].map((col) => {
                              const isSel = (activeResume.accentColor === col.id) || (col.id === 'indigo' && !activeResume.accentColor);
                              return (
                                <div
                                  key={col.id}
                                  onClick={() => updateResume(activeResume.id, { accentColor: col.id, customColorHex: col.color })}
                                  className={`w-6 h-6 rounded-full cursor-pointer border-2 transition ${col.hexClass} ${isSel ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                                />
                              );
                            })}
                            {/* Custom Color Wheel Picker */}
                            <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 p-1 rounded-xl">
                              <input 
                                type="color" 
                                value={activeResume.customColorHex || '#4f46e5'} 
                                onChange={(e) => updateResume(activeResume.id, { accentColor: 'custom', customColorHex: e.target.value })}
                                className="w-5 h-5 rounded-full border border-zinc-750 cursor-pointer overflow-hidden p-0 bg-transparent"
                              />
                              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">{activeResume.customColorHex || '#4f46e5'}</span>
                            </div>
                          </div>

                          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-zinc-850/60">
                            {[
                              { field: 'applyColorName', label: 'Color Name' },
                              { field: 'applyColorHeadings', label: 'Color Headings' },
                              { field: 'applyColorHeadingsLine', label: 'Color Headings Line' },
                              { field: 'applyColorDates', label: 'Color Dates' },
                              { field: 'applyColorSubtitle', label: 'Color Subtitle' },
                              { field: 'applyColorLinkIcons', label: 'Color Link Icons' },
                            ].map(item => (
                              <label key={item.field} className="flex items-center gap-2 text-zinc-450 cursor-pointer hover:text-white transition select-none">
                                <input
                                  type="checkbox"
                                  checked={!!activeResume[item.field as keyof ResumeVersion]}
                                  onChange={(e) => updateResume(activeResume.id, { [item.field]: e.target.checked })}
                                  className="rounded accent-indigo-600"
                                />
                                <span>{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 3. Section Layout Reordering & Columns */}
                        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span>📋</span>
                            <span>Layout Columns & Section Order</span>
                          </h4>

                          {/* Column count picker */}
                          <div>
                            <span className="text-[10px] font-bold text-zinc-550 block mb-2">Display Columns</span>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { id: 'one', label: 'One Column', desc: 'Linear standard' },
                                { id: 'two', label: 'Two Columns', desc: 'Split grid sidebar' },
                              ].map(col => {
                                const isSel = (activeResume.layoutColumns || 'one') === col.id;
                                return (
                                  <div
                                    key={col.id}
                                    onClick={() => updateResume(activeResume.id, { layoutColumns: col.id as any })}
                                    className={`border p-2.5 rounded-xl cursor-pointer transition select-none flex flex-col justify-between ${isSel ? 'border-indigo-650 bg-indigo-500/10' : 'border-zinc-850 hover:bg-zinc-900 bg-zinc-950/40'}`}
                                  >
                                    <span className={`font-bold block ${isSel ? 'text-indigo-400' : 'text-zinc-300'}`}>{col.label}</span>
                                    <span className="text-[9px] text-zinc-550 mt-1 leading-normal">{col.desc}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Reordering list */}
                          <div className="pt-2 border-t border-zinc-850/60">
                            <span className="text-[10px] font-bold text-zinc-550 block mb-2">Change Section Order</span>
                            <div className="space-y-1.5">
                              {(activeResume.sectionOrder ?? ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']).map((sect, idx, arr) => {
                                const label = {
                                  summary: 'Professional Summary',
                                  experience: 'Work Experience',
                                  education: 'Education History',
                                  skills: 'Skills list',
                                  projects: 'Key Projects',
                                  certifications: 'Certifications'
                                }[sect] || sect;
                                return (
                                  <div key={sect} className="flex justify-between items-center p-2 rounded-lg bg-zinc-950 border border-zinc-850/40">
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-650 text-[10px] font-bold">::</span>
                                      <span className="font-bold text-zinc-300">{label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        disabled={idx === 0}
                                        onClick={() => handleMoveSection(idx, 'up')}
                                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        disabled={idx === arr.length - 1}
                                        onClick={() => handleMoveSection(idx, 'down')}
                                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 4. Spacing, Margins & Sizes */}
                        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span>📐</span>
                            <span>Spacing, Margins & Sizes</span>
                          </h4>

                          <div className="space-y-3">
                            {[
                              { field: 'fontSizePt', label: 'Font Size', val: `${activeResume.fontSizePt ?? 10.5} pt`, fallback: 10.5 },
                              { field: 'lineHeight', label: 'Line Height', val: `${activeResume.lineHeight ?? 1.25}x`, fallback: 1.25 },
                              { field: 'marginHorizontal', label: 'Left & Right Margin', val: `${activeResume.marginHorizontal ?? 12} mm`, fallback: 12 },
                              { field: 'marginVertical', label: 'Top & Bottom Margin', val: `${activeResume.marginVertical ?? 12} mm`, fallback: 12 },
                              { field: 'entrySpacing', label: 'Space between Entries', val: `${activeResume.entrySpacing ?? 12} px`, fallback: 12 },
                            ].map(item => (
                              <div key={item.field} className="flex justify-between items-center">
                                <div>
                                  <span className="font-bold text-zinc-300 block">{item.label}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{item.val}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAdjustSpacing(item.field as any, 'dec')}
                                    className="w-7 h-7 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => handleAdjustSpacing(item.field as any, 'inc')}
                                    className="w-7 h-7 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 5. Typography Font Selector */}
                        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span>🔤</span>
                            <span>Typography & Google Fonts Selection</span>
                          </h4>

                          {/* Font category card select */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                              { id: 'sans', label: 'Aa Sans', sub: 'Inter / Roboto' },
                              { id: 'serif', label: 'Aa Serif', sub: 'Lora / Amiri' },
                              { id: 'mono', label: 'Aa Mono', sub: 'Fira / JetBrains' },
                            ].map(cat => {
                              const isSel = (activeResume.customFontFamily || 'sans') === cat.id;
                              return (
                                <div
                                  key={cat.id}
                                  onClick={() => {
                                    const defaultFont = { sans: 'Inter', serif: 'Lora', mono: 'Fira Code' }[cat.id];
                                    updateResume(activeResume.id, { customFontFamily: cat.id as any, customFont: defaultFont });
                                  }}
                                  className={`border p-2 rounded-xl cursor-pointer transition select-none flex flex-col justify-between ${isSel ? 'border-indigo-650 bg-indigo-500/10' : 'border-zinc-850 hover:bg-zinc-900 bg-zinc-950/40'}`}
                                >
                                  <span className={`font-bold block ${isSel ? 'text-indigo-400' : 'text-zinc-300'}`}>{cat.label}</span>
                                  <span className="text-[8px] text-zinc-550 mt-1 leading-normal">{cat.sub}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Google Fonts Chips */}
                          <div className="pt-2 border-t border-zinc-850/60">
                            <span className="text-[10px] font-bold text-zinc-550 block mb-2">Available Google Fonts</span>
                            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
                              {(activeResume.customFontFamily === 'serif' ? [
                                'Lora', 'Source Serif Pro', 'Zilla Slab', 'PT Serif', 'Literata', 'EB Garamond', 'Playfair Display', 'Aleo', 'Crimson Pro', 'Cormorant Garamond', 'Vollkorn', 'Amiri', 'Crimson Text', 'Merriweather', 'Georgia'
                              ] : activeResume.customFontFamily === 'mono' ? [
                                'Source Code Pro', 'Fira Code', 'JetBrains Mono', 'Inconsolata', 'Courier Prime', 'IBM Plex Mono', 'Roboto Mono', 'Space Mono'
                              ] : [
                                'Inter', 'Roboto', 'Outfit', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Nunito', 'Ubuntu', 'Helvetica'
                              ]).map(font => {
                                const isSel = activeResume.customFont === font;
                                return (
                                  <button
                                    key={font}
                                    onClick={() => updateResume(activeResume.id, { customFont: font })}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${isSel ? 'bg-indigo-600 border-indigo-500 text-white font-extrabold' : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
                                  >
                                    {font}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 6. Section Heading Style Controls */}
                        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span>✒️</span>
                            <span>Section Headings & Custom Layouts</span>
                          </h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-zinc-550 block mb-1 font-bold">Heading Line Style</label>
                              <select
                                value={activeResume.headingStyle || 'simple'}
                                onChange={(e) => updateResume(activeResume.id, { headingStyle: e.target.value as any })}
                                className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300 outline-none"
                              >
                                <option value="simple">Simple Text Only</option>
                                <option value="underline">Bottom Line Border</option>
                                <option value="left-block">Left Ribbon block</option>
                                <option value="background-fill">Background tint fill</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-zinc-550 block mb-1 font-bold">Heading Capitalization</label>
                              <select
                                value={activeResume.headingCapitalization || 'uppercase'}
                                onChange={(e) => updateResume(activeResume.id, { headingCapitalization: e.target.value as any })}
                                className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300 outline-none"
                              >
                                <option value="capitalize">Standard casing</option>
                                <option value="uppercase">All caps uppercase</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* 7. Footer Options */}
                        <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <span>📄</span>
                            <span>Footer custom configurations</span>
                          </h4>
                          
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { field: 'footerPageNumbers', label: 'Page Numbers' },
                              { field: 'footerEmail', label: 'User Email' },
                              { field: 'footerName', label: 'Full Name' },
                            ].map(item => (
                              <label key={item.field} className="flex items-center gap-2 text-zinc-450 cursor-pointer hover:text-white transition select-none">
                                <input
                                  type="checkbox"
                                  checked={!!activeResume[item.field as keyof ResumeVersion]}
                                  onChange={(e) => updateResume(activeResume.id, { [item.field]: e.target.checked })}
                                  className="rounded accent-indigo-600"
                                />
                                <span>{item.label}</span>
                              </label>
                            ))}
                          </div>
                          <div>
                            <label className="text-zinc-550 block mb-1 font-bold">Custom footer text</label>
                            <input
                              type="text"
                              value={activeResume.footerCustomText || ''}
                              onChange={(e) => updateResume(activeResume.id, { footerCustomText: e.target.value })}
                              placeholder="e.g. Generated by Nexrume Operating System"
                              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-zinc-200 outline-none text-xs"
                            />
                          </div>
                        </div>

                      </div>
                    )}

                    {/* SUB-TAB 3: AI DIAGNOSTICS & CHECKS */}
                    {resumeSubTab === 'ai-tools' && (
                      <div className="space-y-4 animate-fade-in text-xs text-left">
                        
                        {/* Circular Scoregauge */}
                        <div className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-6 shadow-sm">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            {/* SVG gauge meter */}
                            <svg className="w-full h-full transform -rotate-90">
                              <circle 
                                cx="56" cy="56" r="46" 
                                className="stroke-zinc-800 fill-none" 
                                strokeWidth="8"
                              />
                              <circle 
                                cx="56" cy="56" r="46" 
                                className="stroke-indigo-500 fill-none transition-all duration-1000" 
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 46}
                                strokeDashoffset={2 * Math.PI * 46 * (1 - (activeResume.atsScore || 75) / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center leading-none">
                              <span className="text-2xl font-black text-white">{activeResume.atsScore || 75}</span>
                              <span className="text-[9px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">ATS Score</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 sm:max-w-sm text-center sm:text-left">
                            <h4 className="text-sm font-extrabold text-white">SDE Resume Checker</h4>
                            <p className="text-zinc-450 leading-relaxed text-[11px]">
                              Our parser assesses keyword match parameters, layout format, quantitative metrics, and contact integrity. A score above 85 represents high matching probability.
                            </p>
                          </div>
                        </div>

                        {/* Diagnostics check list */}
                        <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-white uppercase tracking-wider text-[10px]">Diagnostics Match parameters</h4>
                          
                          <div className="space-y-3.5">
                            <div className="space-y-1.5">
                              <span className="font-bold text-zinc-400 block">Critical Diagnostics Checklist:</span>
                              <ul className="text-zinc-500 list-disc pl-4 text-[10.5px] space-y-2 leading-relaxed">
                                {activeResume.atsScore < 85 ? (
                                  <>
                                    <li><span className="text-indigo-400 font-semibold">Missing Keywords:</span> Add key terms: <code className="bg-zinc-950 border border-zinc-850 text-indigo-300 px-1 py-0.5 rounded font-mono text-[9px]">"distributed systems engineering"</code>, <code className="bg-zinc-950 border border-zinc-850 text-indigo-300 px-1 py-0.5 rounded font-mono text-[9px]">"cloud scaling configurations"</code>.</li>
                                    <li><span className="text-indigo-400 font-semibold">Experience Metrics:</span> Experience blocks should integrate quantitative results (e.g. "improved speed by 25%", "reduced cloud spend by $10K").</li>
                                    <li><span className="text-indigo-400 font-semibold">Contact Links:</span> Ensure LinkedIn and GitHub URLs are fully resolved in your profile details.</li>
                                  </>
                                ) : (
                                  <>
                                    <li className="text-emerald-500 font-semibold">Excellent match parameters. Strong keyword correlation.</li>
                                    <li>Quantitative results are present across experience entries.</li>
                                    <li>Standard Harvard SDE formatting is valid. Ready to send!</li>
                                  </>
                                )}
                              </ul>
                            </div>

                            <button 
                              onClick={() => {
                                updateResume(activeResume.id, { atsScore: 92 });
                                alert("AI Advisor: Keyword match criteria updated! Score raised to 92.");
                              }}
                              className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 rounded-xl transition cursor-pointer"
                            >
                              Run Real-time Optimization Scan
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* RIGHT PANEL: FlowCV Realistic Live Preview (xl:col-span-5) */}
                  <div className="xl:col-span-5 space-y-4">
                    
                    {/* Floating controls toolbar */}
                    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.print()}
                          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Print / Save</span>
                        </button>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setShowAtsDrawer(!showAtsDrawer)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${activeResume.atsScore >= 85 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/20' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'}`}
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>ATS Scan: {activeResume.atsScore}%</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible ATS diagnostics card */}
                    {showAtsDrawer && (
                      <div className="bg-zinc-900 border border-emerald-950/40 rounded-2xl p-4 space-y-3 animate-fade-in relative z-20">
                        <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                          <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>ATS Feedback & Recommendations</span>
                          </span>
                          <span className="text-[10px] text-zinc-550">Score: {activeResume.atsScore}%</span>
                        </div>

                        <div className="text-xs space-y-3">
                          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${activeResume.atsScore >= 85 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${activeResume.atsScore}%` }}
                            ></div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="font-bold text-zinc-400 block">Critical Diagnostics:</span>
                            <ul className="text-zinc-500 list-disc pl-4 text-[10px] space-y-1.5 leading-relaxed">
                              {activeResume.atsScore < 85 ? (
                                <>
                                  <li><span className="text-indigo-400 font-semibold">Missing Keywords:</span> Add key terms: <code className="bg-zinc-950 text-indigo-300 px-1 py-0.5 rounded font-mono text-[9px]">"distributed systems engineering"</code>, <code className="bg-zinc-950 text-indigo-300 px-1 py-0.5 rounded font-mono text-[9px]">"cloud scaling configurations"</code>.</li>
                                  <li><span className="text-indigo-400 font-semibold">Experience Metrics:</span> Experience blocks should integrate quantitative results (e.g. "improved speed by 25%", "reduced cloud spend by $10K").</li>
                                  <li><span className="text-indigo-400 font-semibold">Contact Links:</span> Ensure LinkedIn and GitHub URLs are fully resolved in your profile details.</li>
                                </>
                              ) : (
                                <>
                                  <li className="text-emerald-500 font-semibold">Excellent match parameters. Strong keyword correlation.</li>
                                  <li>Quantitative results are present across experience entries.</li>
                                  <li>Standard Harvard SDE formatting is valid. Ready to send!</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* REALISTIC A4 PREVIEW CONTAINER */}
                    <div className="relative group bg-zinc-950 p-2 rounded-2xl border border-zinc-850 shadow-inner overflow-x-auto">
                      
                      {/* Document Sheet Canvas */}
                      <div 
                        id="resume-print-canvas"
                        className="bg-white text-zinc-900 shadow-2xl transition-all duration-300 select-text w-full max-w-[21cm] mx-auto min-h-[29.7cm] flex flex-col justify-between border border-zinc-200 text-left"
                        style={{
                          fontFamily: activeResume.customFont ? `"${activeResume.customFont}", sans-serif` : (activeResume.fontFamily === 'serif' ? 'Georgia, serif' : activeResume.fontFamily === 'mono' ? 'Courier, monospace' : 'Inter, system-ui, sans-serif'),
                          fontSize: activeResume.fontSizePt ? `${activeResume.fontSizePt}pt` : (activeResume.fontSize === 'sm' ? '11px' : activeResume.fontSize === 'lg' ? '14px' : '12.5px'),
                          lineHeight: activeResume.lineHeight ? `${activeResume.lineHeight}` : (activeResume.spacing === 'compact' ? '1.25' : activeResume.spacing === 'loose' ? '1.75' : '1.5'),
                          paddingTop: activeResume.marginVertical !== undefined ? `${activeResume.marginVertical}mm` : '20mm',
                          paddingBottom: activeResume.marginVertical !== undefined ? `${activeResume.marginVertical}mm` : '20mm',
                          paddingLeft: activeResume.marginHorizontal !== undefined ? `${activeResume.marginHorizontal}mm` : '20mm',
                          paddingRight: activeResume.marginHorizontal !== undefined ? `${activeResume.marginHorizontal}mm` : '20mm',
                        }}
                      >
                        {/* Dynamic Template rendering inside sheet */}
                        {(() => {
                          const primaryHex = activeResume.customColorHex || {
                            indigo: '#4f46e5',
                            emerald: '#059669',
                            violet: '#7c3aed',
                            amber: '#d97706',
                            rose: '#e11d48',
                            sky: '#0284c7',
                            slate: '#3f3f46',
                          }[activeResume.accentColor || 'indigo'] || '#4f46e5';

                          const resName = activeResume.personalName ?? userProfile.name;
                          const resTitle = activeResume.personalTitle ?? userProfile.experience;
                          const resEmail = activeResume.personalEmail ?? userProfile.email;
                          const resPhone = activeResume.personalPhone ?? userProfile.phone;
                          const resLocation = activeResume.personalLocation ?? userProfile.location;
                          const resLinkedin = activeResume.personalLinkedin ?? userProfile.linkedin;
                          const resGithub = activeResume.personalGithub ?? userProfile.github;

                          const fontSizeStyle = activeResume.fontSizePt ? `${activeResume.fontSizePt}pt` : (activeResume.fontSize === 'sm' ? '11px' : activeResume.fontSize === 'lg' ? '14px' : '12.5px');
                          const lineHeightStyle = activeResume.lineHeight ? `${activeResume.lineHeight}` : (activeResume.spacing === 'compact' ? '1.25' : activeResume.spacing === 'loose' ? '1.75' : '1.5');

                          const bulletsRenderer = (desc: string) => {
                            if (!desc) return null;
                            const bullets = desc.split(/[\n]+/).filter(b => b.trim() !== '');
                            if (bullets.length <= 1) return <p className="text-zinc-650 mt-0.5 leading-relaxed" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>{desc}</p>;
                            return (
                              <ul className="pl-4 mt-1 space-y-0.5 text-zinc-650" style={{ listStyleType: activeResume.listStyle === 'hyphen' ? 'none' : 'disc', paddingLeft: activeResume.indentBody === false ? '0px' : '16px' }}>
                                {bullets.map((bullet, index) => (
                                  <li key={index} className="leading-relaxed" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
                                    {activeResume.listStyle === 'hyphen' ? `- ${bullet.trim()}` : bullet.trim()}
                                  </li>
                                ))}
                              </ul>
                            );
                          };

                          const renderHeading = (text: string) => {
                            const capText = activeResume.headingCapitalization === 'uppercase' ? text.toUpperCase() : text;
                            const hSize = {
                              S: 'text-[10px]',
                              M: 'text-[11.5px]',
                              L: 'text-[13px]',
                              XL: 'text-[15px]'
                            }[activeResume.headingSize || 'M'];

                            const headingColor = activeResume.applyColorHeadings ? primaryHex : '#18181b';
                            const lineColor = activeResume.applyColorHeadingsLine ? primaryHex : '#e4e4e7';

                            let headingStyle: React.CSSProperties = {
                              color: headingColor,
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                            };

                            if (activeResume.headingStyle === 'underline') {
                              return (
                                <div className="border-b pb-0.5 mb-2.5 text-left" style={{ borderColor: lineColor }}>
                                  <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
                                </div>
                              );
                            } else if (activeResume.headingStyle === 'left-block') {
                              return (
                                <div className="pl-2 border-l-4 mb-2.5 text-left" style={{ borderColor: lineColor }}>
                                  <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
                                </div>
                              );
                            } else if (activeResume.headingStyle === 'background-fill') {
                              return (
                                <div className="px-2.5 py-1 mb-2.5 rounded text-left" style={{ backgroundColor: lineColor }}>
                                  <span className={`${hSize} uppercase tracking-wider font-extrabold`} style={{ ...headingStyle, color: activeResume.applyColorHeadings ? headingColor : '#ffffff' }}>
                                    {capText}
                                  </span>
                                </div>
                              );
                            } else if (activeResume.headingStyle === 'wavy') {
                              return (
                                <div className="mb-2.5 text-left">
                                  <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
                                  <div className="h-0.5 mt-0.5" style={{ borderBottom: `2px wavy ${lineColor}` }}></div>
                                </div>
                              );
                            } else if (activeResume.headingStyle === 'double-line') {
                              return (
                                <div className="border-b-4 border-double pb-0.5 mb-2.5 text-left" style={{ borderColor: lineColor }}>
                                  <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mb-1.5 text-left">
                                  <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
                                </div>
                              );
                            }
                          };

                          const renderSection = (sectionId: string) => {
                            switch (sectionId) {
                              case 'summary':
                                if (!activeResume.summary) return null;
                                return (
                                  <div key="summary" className="space-y-1" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
                                    {renderHeading('Professional Summary')}
                                    <p className="text-zinc-650 leading-relaxed text-justify" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
                                      {activeResume.summary}
                                    </p>
                                  </div>
                                );
                              case 'experience':
                                const visibleExp = localExp.filter(exp => !exp.hidden);
                                if (visibleExp.length === 0) return null;
                                return (
                                  <div key="experience" className="space-y-1.5" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
                                    {renderHeading('Work Experience')}
                                    <div className="space-y-2.5 text-left" style={{ display: 'flex', flexDirection: 'column', gap: `${activeResume.entrySpacing || 6}px` }}>
                                      {visibleExp.map((exp, idx) => (
                                        <div key={idx} className="space-y-0.5 text-left">
                                          <div className="flex justify-between items-baseline font-bold text-zinc-800">
                                            <span style={{ fontSize: fontSizeStyle, color: activeResume.applyColorJobTitle ? primaryHex : 'inherit' }}>
                                              {exp.role} {exp.company && <span className="font-normal text-zinc-550" style={{ color: activeResume.applyColorSubtitle ? primaryHex : 'inherit' }}>at {exp.company}</span>}
                                            </span>
                                            <span className="text-[9.5px] text-zinc-500 font-normal" style={{ color: activeResume.applyColorDates ? primaryHex : 'inherit' }}>{exp.duration}</span>
                                          </div>
                                          {bulletsRenderer(exp.description)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              case 'education':
                                const visibleEdu = localEdu.filter(edu => !edu.hidden);
                                if (visibleEdu.length === 0) return null;
                                return (
                                  <div key="education" className="space-y-1.5" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
                                    {renderHeading('Education')}
                                    <div className="space-y-2 text-left" style={{ display: 'flex', flexDirection: 'column', gap: `${activeResume.entrySpacing || 4}px` }}>
                                      {visibleEdu.map((edu, idx) => (
                                        <div key={idx} className="space-y-0.5 text-left">
                                          <div className="flex justify-between items-baseline font-bold text-zinc-800">
                                            <span style={{ fontSize: fontSizeStyle }}>
                                              {activeResume.educationTitleOrder === 'school-degree' ? edu.school : edu.degree}
                                              <span className="font-normal text-zinc-550">
                                                {activeResume.educationTitleOrder === 'school-degree' ? ` — ${edu.degree}` : ` — ${edu.school}`}
                                              </span>
                                            </span>
                                            <span className="text-[9.5px] text-zinc-500 font-normal font-mono" style={{ color: activeResume.applyColorDates ? primaryHex : 'inherit' }}>{edu.duration}</span>
                                          </div>
                                          {edu.gpa && (
                                            <div className="text-[9.5px] text-zinc-500 font-semibold text-left">
                                              GPA: {edu.gpa}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              case 'skills':
                                if (!activeResume.skills) return null;
                                return (
                                  <div key="skills" className="space-y-1" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
                                    {renderHeading('Technical Skills')}
                                    <div className="flex flex-wrap gap-1.5 pt-0.5 text-left">
                                      {activeResume.skills.split(',').map((skill, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-zinc-55 text-zinc-800 px-2 py-0.5 rounded text-[9.5px] border border-zinc-200 font-medium"
                                          style={{ fontSize: `calc(${fontSizeStyle} - 1.5px)` }}
                                        >
                                          {skill.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              case 'projects':
                                const visibleProj = localProj.filter(proj => !proj.hidden);
                                if (visibleProj.length === 0) return null;
                                return (
                                  <div key="projects" className="space-y-1.5" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
                                    {renderHeading('Key Projects')}
                                    <div className="space-y-2 text-left" style={{ display: 'flex', flexDirection: 'column', gap: `${activeResume.entrySpacing || 6}px` }}>
                                      {visibleProj.map((proj, idx) => (
                                        <div key={idx} className="space-y-0.5 text-left">
                                          <span className="font-bold text-zinc-800 block" style={{ fontSize: fontSizeStyle, color: activeResume.applyColorSubtitle ? primaryHex : 'inherit' }}>
                                            {proj.title}
                                          </span>
                                          <p className="text-zinc-650 leading-relaxed text-left" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
                                            {proj.description}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              case 'certifications':
                                if (!activeResume.certifications) return null;
                                return (
                                  <div key="certifications" className="space-y-1" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
                                    {renderHeading('Certifications')}
                                    <div className="flex flex-wrap gap-1.5 pt-0.5 text-left">
                                      {activeResume.certifications.split(',').map((cert, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-zinc-55 text-zinc-800 px-2 py-0.5 rounded text-[9.5px] border border-zinc-200 font-medium"
                                          style={{ fontSize: `calc(${fontSizeStyle} - 1.5px)` }}
                                        >
                                          {cert.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              default:
                                return null;
                            }
                          };

                          const renderHeader = () => {
                            const alignClass = activeResume.headerAlignment === 'center' ? 'text-center justify-center' : 'text-left justify-start';
                            const nameSizeClass = {
                              XS: 'text-lg',
                              S: 'text-xl',
                              M: 'text-2xl',
                              L: 'text-3xl',
                              XL: 'text-4xl'
                            }[activeResume.nameSize || 'M'];

                            const nameWeight = activeResume.nameBold !== false ? 'font-extrabold' : 'font-semibold';
                            const nameColor = activeResume.applyColorName ? primaryHex : '#18181b';
                            const iconColor = activeResume.applyColorHeaderIcons ? primaryHex : '#71717a';

                            const items = [
                              { text: resEmail, key: 'email', show: !!resEmail, icon: '📧' },
                              { text: resPhone, key: 'phone', show: !!resPhone, icon: '📞' },
                              { text: resLocation, key: 'location', show: !!resLocation, icon: '📍' },
                              { text: resLinkedin, key: 'linkedin', show: !!resLinkedin, icon: '🔗' },
                              { text: resGithub, key: 'github', show: !!resGithub, icon: '💻' }
                            ].filter(i => i.show);

                            const delimiter = activeResume.headerDetailsSeparator === 'bar' ? '|' : activeResume.headerDetailsSeparator === 'icon' ? 'icon' : '•';

                            return (
                              <div className={`space-y-1 mb-3.5 ${activeResume.headerAlignment === 'center' ? 'text-center' : 'text-left'}`}>
                                <h1 className={`${nameSizeClass} ${nameWeight} tracking-tight`} style={{ color: nameColor }}>
                                  {resName}
                                </h1>
                                <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold text-left md:text-center" style={{ color: activeResume.applyColorJobTitle ? primaryHex : undefined, textAlign: activeResume.headerAlignment === 'center' ? 'center' : 'left' }}>
                                  {resTitle || 'Full Stack Engineer'}
                                </p>
                                
                                {activeResume.headerDetailsArrangement === 'stacked' ? (
                                  <div className="flex flex-col gap-0.5 text-[9.5px] text-zinc-650 mt-1.5 font-mono">
                                    {items.map(item => (
                                      <div key={item.key} className={`flex items-center gap-1.5 ${alignClass}`}>
                                        <span style={{ color: iconColor }}>{item.icon}</span>
                                        <span>{item.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : activeResume.headerDetailsArrangement === 'grid' ? (
                                  <div className={`grid grid-cols-2 gap-1 text-[9.5px] text-zinc-655 mt-1.5 font-mono max-w-md ${activeResume.headerAlignment === 'center' ? 'mx-auto' : ''}`}>
                                    {items.map(item => (
                                      <div key={item.key} className="flex items-center gap-1.5 truncate">
                                        <span style={{ color: iconColor }}>{item.icon}</span>
                                        <span className="truncate">{item.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] text-zinc-655 mt-1.5 font-mono ${alignClass}`}>
                                    {items.map((item, idx) => (
                                      <React.Fragment key={item.key}>
                                        <div className="flex items-center gap-1">
                                          {delimiter === 'icon' && <span style={{ color: iconColor }}>{item.icon}</span>}
                                          <span>{item.text}</span>
                                        </div>
                                        {idx < items.length - 1 && delimiter !== 'icon' && (
                                          <span className="text-zinc-300 font-bold">{delimiter}</span>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                )}
                                <div className="w-full border-b border-zinc-200 pt-2.5"></div>
                              </div>
                            );
                          };

                          const renderFooter = () => {
                            const showFooter = activeResume.footerPageNumbers || activeResume.footerEmail || activeResume.footerName || activeResume.footerCustomText;
                            if (!showFooter) return null;

                            return (
                              <div className="border-t border-zinc-200 mt-6 pt-2 flex justify-between items-center text-[8.5px] text-zinc-450 font-mono">
                                <div>
                                  {activeResume.footerName && <span className="mr-3 font-semibold text-zinc-650">{resName}</span>}
                                  {activeResume.footerEmail && <span>{resEmail}</span>}
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  {activeResume.footerCustomText && <span className="italic">{activeResume.footerCustomText}</span>}
                                  {activeResume.footerPageNumbers && <span className="font-bold">Page 1 of 1</span>}
                                </div>
                              </div>
                            );
                          };

                          const defaultOrder = activeResume.sectionOrder || ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'];
                          const isTwoColumn = activeResume.layoutColumns === 'two' || (activeResume.layoutColumns !== 'one' && activeResume.template === 'modern');

                          return (
                            <div className="flex flex-col justify-between h-full flex-1">
                              <div>
                                {renderHeader()}
                                {isTwoColumn ? (
                                  <div className="grid grid-cols-12 gap-6 items-stretch">
                                    <div className="col-span-4 flex flex-col gap-3.5 border-r border-zinc-150 pr-4.5 text-left">
                                      {activeResume.personalPhoto && (
                                        <div className="w-20 h-20 rounded-xl border border-zinc-200 overflow-hidden mb-2.5 shadow-sm mx-auto">
                                          <img src={activeResume.personalPhoto} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                      )}
                                      {defaultOrder.filter(s => ['summary', 'skills', 'certifications'].includes(s)).map(s => renderSection(s))}
                                    </div>
                                    <div className="col-span-8 flex flex-col gap-3.5 text-left">
                                      {defaultOrder.filter(s => ['experience', 'education', 'projects'].includes(s)).map(s => renderSection(s))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-3.5 text-left">
                                    {activeResume.personalPhoto && (
                                      <div className="w-20 h-20 rounded-xl border border-zinc-200 overflow-hidden mb-2.5 shadow-sm">
                                        <img src={activeResume.personalPhoto} alt="Profile" className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    {defaultOrder.map(s => renderSection(s))}
                                  </div>
                                )}
                              </div>
                              {renderFooter()}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (() => {
            // Profile Completion Metric calculation (10 specific fields)
            const completionFields = [
              { key: 'profilePhoto', label: 'Photo' },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'location', label: 'Location' },
              { key: 'linkedin', label: 'LinkedIn' },
              { key: 'portfolio', label: 'Portfolio' },
              { key: 'education', label: 'Education' },
              { key: 'skills', label: 'Skills' },
              { key: 'resumes', label: 'Resume' }
            ];

            const missingFields: string[] = [];
            let completedCount = 0;

            completionFields.forEach(field => {
              let completed = false;
              if (field.key === 'skills') {
                completed = (userProfile.skills && userProfile.skills.length > 0);
                if (!completed) missingFields.push('Skills Missing');
              } else if (field.key === 'resumes') {
                completed = (resumes && resumes.length > 0);
                if (!completed) missingFields.push('Resume Missing');
              } else {
                const val = userProfile[field.key as keyof typeof userProfile];
                completed = (typeof val === 'string' && (val as string).trim() !== '');
                if (!completed) {
                  missingFields.push(`${field.label} Missing`);
                }
              }
              if (completed) completedCount++;
            });

            const completionPercentage = Math.round((completedCount / completionFields.length) * 100);

            // Check if profile was edited
            const arrayEqual = (a: any[], b: any[]) => {
              if (!a || !b) return a === b;
              if (a.length !== b.length) return false;
              for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
              }
              return true;
            };

            const isProfileChanged = (
              tempProfile.name !== (userProfile.name || '') ||
              tempProfile.email !== (userProfile.email || '') ||
              tempProfile.phone !== (userProfile.phone || '') ||
              tempProfile.location !== (userProfile.location || '') ||
              tempProfile.profilePhoto !== (userProfile.profilePhoto || '') ||
              tempProfile.experience !== (userProfile.experience || '') ||
              tempProfile.education !== (userProfile.education || '') ||
              tempProfile.github !== (userProfile.github || '') ||
              tempProfile.leetcode !== (userProfile.leetcode || '') ||
              tempProfile.linkedin !== (userProfile.linkedin || '') ||
              tempProfile.portfolio !== (userProfile.portfolio || '') ||
              tempProfile.theme !== (userProfile.theme || 'dark') ||
              tempProfile.timeZone !== (userProfile.timeZone || '') ||
              tempProfile.defaultWorkMode !== (userProfile.defaultWorkMode || 'Remote') ||
              tempProfile.defaultResumeVersion !== (userProfile.defaultResumeVersion || '') ||
              tempProfile.defaultEmailAccount !== (userProfile.defaultEmailAccount || '') ||
              tempProfile.defaultApplicationMethod !== (userProfile.defaultApplicationMethod || 'Company Careers Page') ||
              tempProfile.defaultLocationPreference !== (userProfile.defaultLocationPreference || 'Remote') ||
              tempProfile.language !== (userProfile.language || 'English') ||
              tempProfile.notificationInApp !== (userProfile.notifications?.inApp !== false) ||
              tempProfile.notificationEmail !== (userProfile.notifications?.email !== false) ||
              tempProfile.notificationPush !== (userProfile.notifications?.push !== false) ||
              !arrayEqual(tempProfile.skills, userProfile.skills || []) ||
              !arrayEqual(tempProfile.certifications, userProfile.certifications || [])
            );

            return (
              <div className="space-y-6 animate-fade-in relative z-10 text-zinc-350">
                
                {/* Profile Summary Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-12 translate-x-12"></div>
                  
                  <div className="relative group shrink-0">
                    <img 
                      src={userProfile.profilePhoto || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"} 
                      alt={userProfile.name}
                      className="w-16 h-16 rounded-full border-2 border-zinc-800 object-cover"
                    />
                  </div>
                  
                  <div className="text-center sm:text-left flex-1 min-w-0 z-10">
                    <h2 className="text-lg font-extrabold text-white truncate">{userProfile.name}</h2>
                    <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">{userProfile.experience || 'User'}</p>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{userProfile.email}</p>
                  </div>
                  
                  {/* Completion Meter */}
                  <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0 bg-zinc-955/60 border border-zinc-850 p-4 rounded-xl z-10 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Profile Strength</span>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-955/40 border border-indigo-900/30 px-2 py-0.5 rounded-full">{completionPercentage}%</span>
                    </div>
                    <div className="w-40 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    {missingFields.length > 0 ? (
                      <span className="text-[9.5px] text-amber-500 font-semibold mt-1 text-center sm:text-right max-w-[200px]">
                        ⚡ Missing: {missingFields.map(f => f.replace(' Missing', '')).join(', ')}
                      </span>
                    ) : (
                      <span className="text-[9.5px] text-emerald-400 font-bold mt-1">✓ Complete profile</span>
                    )}
                  </div>
                </div>

                {/* Settings Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  
                  {/* Left Sidebar Sections Navigation */}
                  <div className="flex flex-col gap-1 p-1 bg-zinc-950/60 border border-zinc-850 rounded-2xl md:col-span-1">
                    {[
                      { id: 'profile', label: 'Profile Settings', icon: User },
                      { id: 'preferences', label: 'Preferences', icon: Settings },
                      { id: 'integrations', label: 'Integrations', icon: Network },
                      { id: 'security', label: 'Security & Auth', icon: Shield }
                    ].map((sec) => {
                      const Icon = sec.icon;
                      const isSecActive = settingsSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            setSettingsSection(sec.id as any);
                            setIsSettingsEditMode(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-left ${
                            isSecActive
                              ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/15'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{sec.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Content Area */}
                  <div className="md:col-span-3 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 text-xs relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none -translate-y-12 translate-x-12"></div>
                      
                      {/* Section 1: PROFILE */}
                      {settingsSection === 'profile' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white">Profile Settings</h3>
                              <p className="text-[10px] text-zinc-500">Configure your personal and professional profile details.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSettingsEditMode(!isSettingsEditMode);
                              }}
                              className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-855 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold rounded-lg transition text-[10px] cursor-pointer"
                            >
                              {isSettingsEditMode ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Profile Photo Uploader */}
                            <div className="col-span-full">
                              <label className="text-zinc-500 block mb-1">Profile Photo</label>
                              <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-955/20 border border-zinc-850/60 p-4 rounded-2xl">
                                <img 
                                  src={tempProfile.profilePhoto || userProfile.profilePhoto || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"} 
                                  alt="Preview"
                                  className="w-16 h-16 rounded-full border border-zinc-800 object-cover shrink-0"
                                />
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                  {isSettingsEditMode ? (
                                    <div className="flex flex-wrap gap-2">
                                      <label className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer select-none text-center">
                                        Upload Image
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden" 
                                          onChange={handleProfilePhotoUpload} 
                                        />
                                      </label>
                                      {tempProfile.profilePhoto && (
                                        <button
                                          type="button"
                                          onClick={() => setTempProfile({ ...tempProfile, profilePhoto: '' })}
                                          className="bg-zinc-850 hover:bg-zinc-750 text-zinc-400 hover:text-rose-455 font-bold py-2 px-4 border border-zinc-800 rounded-xl text-xs transition cursor-pointer"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-zinc-500 font-medium font-mono truncate max-w-xs sm:max-w-md">
                                      {userProfile.profilePhoto ? 'Custom Uploaded Photo' : 'Default Avatar'}
                                    </div>
                                  )}
                                  <p className="text-[9.5px] text-zinc-500">Supports PNG, JPG, or GIF (max 2MB).</p>
                                </div>
                              </div>
                            </div>

                            {/* Full Name */}
                            <div>
                              <label className="text-zinc-500 block mb-1">Full Name</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="text" 
                                  value={tempProfile.name || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                  placeholder="e.g. Naveen Kumar"
                                  className="bg-zinc-955 border border-zinc-850 text-zinc-200 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">{userProfile.name || 'Not Added'}</div>
                              )}
                            </div>

                            {/* Email Address */}
                            <div>
                              <label className="text-zinc-500 block mb-1">Email Address</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="email" 
                                  value={tempProfile.email || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                                  placeholder="e.g. naveen@nexora.ai"
                                  className="bg-zinc-955 border border-zinc-850 text-zinc-200 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">{userProfile.email || 'Not Added'}</div>
                              )}
                            </div>

                            {/* Phone Number */}
                            <div>
                              <label className="text-zinc-500 block mb-1">Phone Number</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="text" 
                                  value={tempProfile.phone || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                                  placeholder="e.g. +91 98765 43210"
                                  className="bg-zinc-955 border border-zinc-850 text-zinc-200 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">{userProfile.phone || 'Not Added'}</div>
                              )}
                            </div>

                            {/* Location */}
                            <div>
                              <label className="text-zinc-550 block mb-1">Location</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="text" 
                                  value={tempProfile.location || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                                  placeholder="e.g. Bangalore, India"
                                  className="bg-zinc-955 border border-zinc-850 text-zinc-200 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">{userProfile.location || 'Not Added'}</div>
                              )}
                            </div>

                            {/* Years of Experience */}
                            <div>
                              <label className="text-zinc-550 block mb-1">Years of Experience</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="text" 
                                  value={tempProfile.experience || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, experience: e.target.value })}
                                  placeholder="e.g. 4 Years"
                                  className="bg-zinc-955 border border-zinc-850 text-zinc-200 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">{userProfile.experience || 'Not Added'}</div>
                              )}
                            </div>

                            {/* GitHub URL */}
                            <div>
                              <label className="text-zinc-550 block mb-1">GitHub Profile Link</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="text" 
                                  value={tempProfile.github || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, github: e.target.value })}
                                  placeholder="e.g. github.com/naveen-dev"
                                  className="bg-zinc-955 border border-zinc-855 text-zinc-205 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                  {userProfile.github ? (
                                    <a href={userProfile.github.startsWith('http') ? userProfile.github : `https://${userProfile.github}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{userProfile.github}</a>
                                  ) : 'Not Added'}
                                </div>
                              )}
                            </div>

                            {/* LinkedIn URL */}
                            <div>
                              <label className="text-zinc-550 block mb-1">LinkedIn Profile Link</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="text" 
                                  value={tempProfile.linkedin || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, linkedin: e.target.value })}
                                  placeholder="e.g. linkedin.com/in/naveen-dev"
                                  className="bg-zinc-955 border border-zinc-855 text-zinc-205 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                  {userProfile.linkedin ? (
                                    <a href={userProfile.linkedin.startsWith('http') ? userProfile.linkedin : `https://${userProfile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{userProfile.linkedin}</a>
                                  ) : 'Not Added'}
                                </div>
                              )}
                            </div>

                            {/* Portfolio Website */}
                            <div className="col-span-full">
                              <label className="text-zinc-550 block mb-1">Portfolio Website</label>
                              {isSettingsEditMode ? (
                                <input 
                                  type="text" 
                                  value={tempProfile.portfolio || ''} 
                                  onChange={(e) => setTempProfile({ ...tempProfile, portfolio: e.target.value })}
                                  placeholder="e.g. naveen.dev"
                                  className="bg-zinc-955 border border-zinc-855 text-zinc-205 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                />
                              ) : (
                                <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                  {userProfile.portfolio ? (
                                    <a href={userProfile.portfolio.startsWith('http') ? userProfile.portfolio : `https://${userProfile.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{userProfile.portfolio}</a>
                                  ) : 'Not Added'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 2: PREFERENCES */}
                      {settingsSection === 'preferences' && (() => {
                        const emailSuggestions = Array.from(new Set([
                          userProfile.email,
                          ...(applications || []).map(a => a.appliedFromEmail).filter(Boolean)
                        ])).filter(email => email.trim() !== '');

                        return (
                          <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                              <div>
                                <h3 className="text-sm font-bold text-white">App Preferences</h3>
                                <p className="text-[10px] text-zinc-500">Configure theme, timezone, and application defaults.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsSettingsEditMode(!isSettingsEditMode)}
                                className="px-3.5 py-1.5 bg-zinc-955 hover:bg-zinc-855 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold rounded-lg transition text-[10px] cursor-pointer"
                              >
                                {isSettingsEditMode ? 'Cancel Edit' : 'Edit Preferences'}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-zinc-505 block mb-1">Theme Preferences</label>
                                {isSettingsEditMode ? (
                                  <select 
                                    value={tempProfile.theme || 'dark'} 
                                    onChange={(e) => setTempProfile({ ...tempProfile, theme: e.target.value as any })}
                                    className="bg-zinc-950 border border-zinc-850 text-zinc-300 w-full p-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition"
                                  >
                                    <option value="dark">Dark Theme</option>
                                    <option value="light">Light Theme</option>
                                    <option value="cyberpunk">Cyberpunk Neon</option>
                                  </select>
                                ) : (
                                  <div className="bg-zinc-955/20 border border-zinc-855/50 p-2.5 rounded-lg text-zinc-300 font-medium capitalize flex items-center gap-2">
                                    <span>{userProfile.theme === 'dark' ? '🌙' : userProfile.theme === 'light' ? '☀️' : '⚡'}</span>
                                    <span>{userProfile.theme} Theme</span>
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="text-zinc-505 block mb-1">Time Zone</label>
                                {isSettingsEditMode ? (
                                  <select
                                    value={tempProfile.timeZone || 'America/Los_Angeles'}
                                    onChange={(e) => setTempProfile({ ...tempProfile, timeZone: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-850 text-zinc-300 w-full p-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition"
                                  >
                                    <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                                    <option value="America/New_York">Eastern Time (America/New_York)</option>
                                    <option value="Europe/London">London Time (Europe/London)</option>
                                    <option value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</option>
                                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                                  </select>
                                ) : (
                                  <div className="bg-zinc-955/20 border border-zinc-855/50 p-2.5 rounded-lg text-zinc-350 font-medium font-mono">
                                    {userProfile.timeZone || 'America/Los_Angeles'}
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="text-zinc-505 block mb-1">Language</label>
                                {isSettingsEditMode ? (
                                  <select
                                    value={tempProfile.language || 'English'}
                                    onChange={(e) => setTempProfile({ ...tempProfile, language: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-850 text-zinc-300 w-full p-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition"
                                  >
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="German">German</option>
                                    <option value="French">French</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Chinese">Chinese</option>
                                  </select>
                                ) : (
                                  <div className="bg-zinc-955/20 border border-zinc-855/50 p-2.5 rounded-lg text-zinc-350 font-medium">
                                    {userProfile.language || 'English'}
                                  </div>
                                )}
                              </div>

                              <div className="col-span-full border-t border-zinc-800/60 pt-4 space-y-3">
                                <label className="text-zinc-505 block font-bold text-xs uppercase tracking-wider">Notification Settings</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <label className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-850 p-3 rounded-xl cursor-pointer hover:bg-zinc-950/60 transition select-none">
                                    <input
                                      type="checkbox"
                                      disabled={!isSettingsEditMode}
                                      checked={isSettingsEditMode ? tempProfile.notificationInApp : (userProfile.notifications?.inApp !== false)}
                                      onChange={(e) => setTempProfile({ ...tempProfile, notificationInApp: e.target.checked })}
                                      className="rounded border-zinc-800 text-indigo-650 focus:ring-indigo-500/30 w-4 h-4 bg-zinc-900 cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-bold text-zinc-250 text-xs">In-App</span>
                                      <span className="text-[10px] text-zinc-500">Alerts in Career OS portal</span>
                                    </div>
                                  </label>

                                  <label className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-850 p-3 rounded-xl cursor-pointer hover:bg-zinc-950/60 transition select-none">
                                    <input
                                      type="checkbox"
                                      disabled={!isSettingsEditMode}
                                      checked={isSettingsEditMode ? tempProfile.notificationEmail : (userProfile.notifications?.email !== false)}
                                      onChange={(e) => setTempProfile({ ...tempProfile, notificationEmail: e.target.checked })}
                                      className="rounded border-zinc-800 text-indigo-650 focus:ring-indigo-500/30 w-4 h-4 bg-zinc-900 cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-bold text-zinc-250 text-xs">Email Alerts</span>
                                      <span className="text-[10px] text-zinc-500">Daily summaries to inbox</span>
                                    </div>
                                  </label>

                                  <label className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-850 p-3 rounded-xl cursor-pointer hover:bg-zinc-950/60 transition select-none">
                                    <input
                                      type="checkbox"
                                      disabled={!isSettingsEditMode}
                                      checked={isSettingsEditMode ? tempProfile.notificationPush : (userProfile.notifications?.push !== false)}
                                      onChange={(e) => setTempProfile({ ...tempProfile, notificationPush: e.target.checked })}
                                      className="rounded border-zinc-800 text-indigo-655 focus:ring-indigo-500/30 w-4 h-4 bg-zinc-900 cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-bold text-zinc-250 text-xs">Push Notifications</span>
                                      <span className="text-[10px] text-zinc-500">Direct system alerts</span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Job Application Defaults Section */}
                            <div className="border-t border-zinc-800/60 pt-4 space-y-4">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Default Application Preferences</h4>
                              <p className="text-[10.5px] text-zinc-500 -mt-2">These settings pre-fill fields when adding new applications in the job tracker.</p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-zinc-505 block mb-1">Default Work Mode</label>
                                  {isSettingsEditMode ? (
                                    <select
                                      value={tempProfile.defaultWorkMode || 'Remote'}
                                      onChange={(e) => setTempProfile({ ...tempProfile, defaultWorkMode: e.target.value as any })}
                                      className="bg-zinc-955 border border-zinc-850 text-zinc-300 w-full p-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition"
                                    >
                                      <option value="Remote">Remote</option>
                                      <option value="Hybrid">Hybrid</option>
                                      <option value="Onsite">Onsite</option>
                                    </select>
                                  ) : (
                                    <div className="bg-zinc-950/20 border border-zinc-850/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                      {userProfile.defaultWorkMode || 'Remote'}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="text-zinc-505 block mb-1">Default Resume Version</label>
                                  {isSettingsEditMode ? (
                                    <select
                                      value={tempProfile.defaultResumeVersion || ''}
                                      onChange={(e) => setTempProfile({ ...tempProfile, defaultResumeVersion: e.target.value })}
                                      className="bg-zinc-955 border border-zinc-850 text-zinc-300 w-full p-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition"
                                    >
                                      <option value="">No Default</option>
                                      {resumes.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div className="bg-zinc-955/20 border border-zinc-855/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                      {userProfile.defaultResumeVersion || 'Not Added'}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="text-zinc-505 block mb-1">Default Email Account</label>
                                  {isSettingsEditMode ? (
                                    <>
                                      <input
                                        type="email"
                                        list="pref-emails-list"
                                        placeholder="e.g. email@example.com"
                                        value={tempProfile.defaultEmailAccount || ''}
                                        onChange={(e) => setTempProfile({ ...tempProfile, defaultEmailAccount: e.target.value })}
                                        className="bg-zinc-955 border border-zinc-855 text-zinc-205 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                      />
                                      <datalist id="pref-emails-list">
                                        {emailSuggestions.map(email => (
                                          <option key={email} value={email} />
                                        ))}
                                      </datalist>
                                    </>
                                  ) : (
                                    <div className="bg-zinc-955/20 border border-zinc-855/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                      {userProfile.defaultEmailAccount || 'Not Added'}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="text-zinc-505 block mb-1">Default Application Method</label>
                                  {isSettingsEditMode ? (
                                    <select
                                      value={tempProfile.defaultApplicationMethod || 'Company Careers Page'}
                                      onChange={(e) => setTempProfile({ ...tempProfile, defaultApplicationMethod: e.target.value })}
                                      className="bg-zinc-955 border border-zinc-850 text-zinc-300 w-full p-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition"
                                    >
                                      <option value="LinkedIn">LinkedIn</option>
                                      <option value="Company Careers Page">Company Careers Page</option>
                                      <option value="Referral">Referral</option>
                                      <option value="Indeed">Indeed</option>
                                      <option value="Glassdoor">Glassdoor</option>
                                      <option value="Wellfound">Wellfound</option>
                                      <option value="Recruiter Outreach">Recruiter Outreach</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  ) : (
                                    <div className="bg-zinc-950/20 border border-zinc-855/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                      {userProfile.defaultApplicationMethod || 'Company Careers Page'}
                                    </div>
                                  )}
                                </div>

                                <div className="col-span-full">
                                  <label className="text-zinc-505 block mb-1">Default Location Preference</label>
                                  {isSettingsEditMode ? (
                                    <input
                                      type="text"
                                      placeholder="e.g. Remote, Seattle, WA"
                                      value={tempProfile.defaultLocationPreference || ''}
                                      onChange={(e) => setTempProfile({ ...tempProfile, defaultLocationPreference: e.target.value })}
                                      className="bg-zinc-955 border border-zinc-855 text-zinc-205 w-full p-2.5 rounded-lg outline-none focus:border-indigo-500 transition"
                                    />
                                  ) : (
                                    <div className="bg-zinc-955/20 border border-zinc-855/50 p-2.5 rounded-lg text-zinc-300 font-medium">
                                      {userProfile.defaultLocationPreference || 'Not Added'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Section 3: INTEGRATIONS */}
                      {settingsSection === 'integrations' && (() => {
                        return (
                          <div className="space-y-6 animate-fade-in">
                            <div className="border-b border-zinc-800 pb-3">
                              <h3 className="text-sm font-bold text-white">External Integrations</h3>
                              <p className="text-[10px] text-zinc-500">Connect your external accounts to sync career and progress data.</p>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                              {/* Card 1: Google Sheets */}
                              <div className="bg-zinc-955/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                                <div className="space-y-3.5">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-emerald-955/40 border border-emerald-900/30 flex items-center justify-center font-bold text-emerald-400 text-base">
                                        田
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-zinc-200 text-xs">Google Sheets</span>
                                        <span className="text-[10px] text-zinc-505 font-medium">Auto-sync job application records</span>
                                      </div>
                                    </div>
                                    <span className={`text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 border rounded-full text-center ${
                                      googleSheetsConnected ? 'bg-emerald-955/35 text-emerald-400 border-emerald-900/25' : 'bg-zinc-950 text-zinc-550 border border-zinc-850'
                                    }`}>
                                      {googleSheetsConnected ? 'Connected' : 'Disconnected'}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-zinc-450 leading-relaxed">
                                    {googleSheetsConnected ? (
                                      <div className="space-y-1">
                                        <p>Sheet Tab: <span className="font-mono text-zinc-300 font-bold">{googleSheetsTab || 'Sheet1'}</span></p>
                                        <p className="truncate">Spreadsheet ID: <span className="font-mono text-zinc-300">{googleSheetsId}</span></p>
                                      </div>
                                    ) : (
                                      <p>Connect a Google Sheet spreadsheet to automatically back up and view all your career application logs live in a spreadsheet format.</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                  {googleSheetsConnected ? (
                                    <>
                                      {googleSheetsId && (
                                        <a 
                                          href={`https://docs.google.com/spreadsheets/d/${googleSheetsId}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-1.5 px-3 border border-zinc-800 rounded-xl text-[10px] transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <ExternalLink className="w-3 h-3 text-zinc-450" />
                                          <span>Open Sheet</span>
                                        </a>
                                      )}
                                      <button 
                                        onClick={async () => {
                                          setIsSheetsSyncing(true);
                                          try {
                                            await syncGoogleSheets();
                                          } catch (e) {}
                                          setIsSheetsSyncing(false);
                                        }}
                                        disabled={isSheetsSyncing}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3.5 rounded-xl text-[10px] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                      >
                                        <RefreshCw className={`w-3 h-3 ${isSheetsSyncing ? 'animate-spin' : ''}`} />
                                        <span>Sync Now</span>
                                      </button>
                                      <button 
                                        onClick={disconnectGoogleSheets}
                                        className="bg-rose-955/20 border border-rose-900/30 text-rose-455 font-bold py-1.5 px-3.5 rounded-xl hover:bg-rose-955/30 transition text-[10px] cursor-pointer"
                                      >
                                        Disconnect
                                      </button>
                                    </>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        let finalId = sheetInputId.trim();
                                        if (finalId.includes('docs.google.com')) {
                                          const match = finalId.match(/\/d\/([a-zA-Z0-9-_]+)/);
                                          if (match) finalId = match[1];
                                        }
                                        connectGoogleSheets(finalId, sheetInputTab || 'Sheet1');
                                        setTimeout(() => syncGoogleSheets(), 300);
                                      }}
                                      className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-1.5 px-3.5 rounded-xl text-[10px] transition duration-200 cursor-pointer"
                                    >
                                      {sheetInputId ? 'Connect & Sync' : 'Create & Sync New Sheet'}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Card 2: LeetCode Integration */}
                              <div className="bg-zinc-955/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                                <div className="space-y-3.5">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-amber-955/40 border border-amber-900/30 flex items-center justify-center font-bold text-amber-500 text-base">
                                        LC
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-zinc-200 text-xs">LeetCode Sync</span>
                                        <span className="text-[10px] text-zinc-505 font-medium">Sync solve counts & daily streaks</span>
                                      </div>
                                    </div>
                                    <span className={`text-[9.5px] font-black tracking-wider uppercase px-2.5 py-0.5 border rounded-full text-center ${
                                      userProfile.leetcodeConnected ? 'bg-amber-955/35 text-amber-400 border-amber-900/25' : 'bg-zinc-950 text-zinc-550 border border-zinc-850'
                                    }`}>
                                      {userProfile.leetcodeConnected ? 'Connected' : 'Disconnected'}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-zinc-455 leading-relaxed">
                                    {userProfile.leetcodeConnected ? (
                                      <div className="space-y-1.5">
                                        <p>Username: <span className="font-mono text-zinc-200 font-bold">@{userProfile.leetcode}</span></p>
                                        <div className="grid grid-cols-4 gap-2 bg-zinc-955/50 p-2 border border-zinc-900 rounded-lg text-center font-mono">
                                          <div>
                                            <div className="text-[10px] text-zinc-500">Easy</div>
                                            <div className="text-emerald-405 font-bold">{userProfile.leetcodeEasy || 0}</div>
                                          </div>
                                          <div>
                                            <div className="text-[10px] text-zinc-500">Med</div>
                                            <div className="text-amber-405 font-bold">{userProfile.leetcodeMedium || 0}</div>
                                          </div>
                                          <div>
                                            <div className="text-[10px] text-zinc-500">Hard</div>
                                            <div className="text-rose-405 font-bold">{userProfile.leetcodeHard || 0}</div>
                                          </div>
                                          <div>
                                            <div className="text-[10px] text-zinc-500">Total</div>
                                            <div className="text-indigo-405 font-bold">{userProfile.leetcodeSolved || 0}</div>
                                          </div>
                                        </div>
                                        {userProfile.leetcodeLastSync && (
                                          <p className="text-[9px] text-zinc-550">Last Synced: {new Date(userProfile.leetcodeLastSync).toLocaleString()}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <p>Connect your LeetCode username to automatically pull question solve counts and track coding streaks directly on Nexora Career OS.</p>
                                        <input 
                                          type="text"
                                          placeholder="Enter LeetCode Username"
                                          value={leetcodeUsernameInput}
                                          onChange={e => setLeetcodeUsernameInput(e.target.value)}
                                          className="w-full bg-zinc-905 border border-zinc-800 focus:border-indigo-500 rounded-lg p-2 text-zinc-300 outline-none text-xs"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                  {userProfile.leetcodeConnected ? (
                                    <>
                                      <button 
                                        onClick={async () => {
                                          syncLeetcode();
                                          addNotification('LeetCode Synced', 'Solve counts have been synchronized successfully.', 'success');
                                        }}
                                        className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-1.5 px-3.5 rounded-xl text-[10px] transition flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Sync Now</span>
                                      </button>
                                      <button 
                                        onClick={() => {
                                          disconnectLeetcode();
                                          addNotification('LeetCode Disconnected', 'LeetCode account unlinked.', 'info');
                                        }}
                                        className="bg-rose-955/20 border border-rose-900/30 text-rose-455 font-bold py-1.5 px-3.5 rounded-xl hover:bg-rose-955/30 transition text-[10px] cursor-pointer"
                                      >
                                        Disconnect
                                      </button>
                                    </>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        const trimmed = leetcodeUsernameInput.trim();
                                        if (trimmed) {
                                          connectLeetcode(trimmed, 'https://leetcode.com/' + trimmed);
                                          setLeetcodeUsernameInput('');
                                        } else {
                                          alert('Please enter a username.');
                                        }
                                      }}
                                      disabled={!leetcodeUsernameInput.trim()}
                                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-1.5 px-3.5 rounded-xl text-[10px] transition duration-200 cursor-pointer"
                                    >
                                      Connect & Sync
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Card 3: GitHub Placeholder */}
                              <div className="bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl flex flex-col justify-between opacity-60">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-lg">
                                    G
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-400 text-xs">GitHub Contributions</span>
                                    <span className="text-[10px] text-zinc-600">Track commit metrics & repository stats</span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-zinc-550 italic font-mono pt-4">Coming Soon</span>
                              </div>

                              {/* Card 4: LinkedIn Placeholder */}
                              <div className="bg-zinc-950/20 border border-zinc-900/60 p-5 rounded-2xl flex flex-col justify-between opacity-60">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-lg">
                                    in
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-400 text-xs">LinkedIn Profile Sync</span>
                                    <span className="text-[10px] text-zinc-600">Sync profile contacts & recruitment states</span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-zinc-550 italic font-mono pt-4">Coming Soon</span>
                              </div>
                            </div>

                            {/* Advanced Sheet ID & logs Accordion */}
                            <div className="border border-zinc-850 rounded-xl bg-zinc-950/20 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setShowSheetsAdvanced(!showSheetsAdvanced)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-955/40 hover:bg-zinc-955/60 transition font-bold text-zinc-350 text-xs"
                              >
                                <span>Google Sheets Advanced Config & Audit Logs</span>
                                <ChevronDown className={`w-4 h-4 text-zinc-550 transition duration-200 ${showSheetsAdvanced ? 'rotate-180' : ''}`} />
                              </button>
                              
                              {showSheetsAdvanced && (
                                <div className="p-4 border-t border-zinc-850/80 space-y-4 bg-zinc-955/10 animate-slide-down">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-zinc-505 block mb-1">Google Sheets Spreadsheet ID</label>
                                      <input 
                                        type="text" 
                                        placeholder="Auto-created when blank"
                                        value={sheetInputId}
                                        onChange={(e) => setSheetInputId(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-855 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-indigo-500 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-zinc-505 block mb-1">Google Sheets Active Tab Name</label>
                                      <input 
                                        type="text" 
                                        placeholder="Sheet1"
                                        value={sheetInputTab}
                                        onChange={(e) => setSheetInputTab(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-855 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-indigo-500 text-xs"
                                      />
                                    </div>
                                  </div>

                                  {googleSheetsLogs.length > 0 && (
                                    <div className="space-y-1.5">
                                      <label className="text-zinc-505 block font-bold">Integration Operation Logs</label>
                                      <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-3 max-h-[120px] overflow-y-auto font-mono text-[9px] text-zinc-555 space-y-1 scrollbar-thin">
                                        {googleSheetsLogs.map((log, idx) => (
                                          <div key={idx} className="leading-normal">{log}</div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Section 4: SECURITY */}
                      {settingsSection === 'security' && (
                        <div className="space-y-6">
                          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                            <div>
                              <h3 className="text-sm font-bold text-white">Security & Authentications</h3>
                              <p className="text-[10px] text-zinc-500">Verify login state, passwords, and 2-Factor Authentication parameters.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-zinc-950/20 border border-zinc-855 p-4 rounded-xl flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-zinc-300">Password Status</span>
                                <span className="text-[10px] text-zinc-500">Secure password configured</span>
                              </div>
                              <span className="text-[9.5px] font-extrabold uppercase bg-emerald-955/40 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full">Active</span>
                            </div>

                            <div className="bg-zinc-955/20 border border-zinc-855 p-4 rounded-xl flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-zinc-300">2-Factor Authentication (2FA)</span>
                                <span className="text-[10px] text-zinc-500">Protect account with verification</span>
                              </div>
                              <span className="text-[9.5px] font-extrabold uppercase bg-zinc-950 text-zinc-550 border border-zinc-850 px-2 py-0.5 rounded-full">Disabled</span>
                            </div>

                            <div className="bg-zinc-955/20 border border-zinc-855 p-4 rounded-xl flex items-center justify-between col-span-full">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-455 text-sm">
                                  💻
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-zinc-200">Active Device Session</span>
                                  <span className="text-[10px] text-zinc-500">Windows Desktop • Chrome Browser (Current Session)</span>
                                </div>
                              </div>
                              <span className="text-[9.5px] font-extrabold uppercase bg-indigo-955/40 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded-full">Current</span>
                            </div>

                            <div className="bg-zinc-955/20 border border-zinc-855 p-4 rounded-xl flex items-center justify-between col-span-full">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-455 text-sm">
                                  🕒
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-zinc-200">Last Account Login</span>
                                  <span className="text-[10px] text-zinc-500">Recent session authorization timestamp</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-zinc-350">{new Date().toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                            </div>

                            {/* Change Password Form */}
                            <div className="border-t border-zinc-800/60 pt-5 col-span-full space-y-4">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Change Password</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <label className="text-zinc-505 block mb-1">Current Password</label>
                                  <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-indigo-500 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-505 block mb-1">New Password</label>
                                  <input 
                                    type="password" 
                                    placeholder="Min. 8 characters"
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-indigo-500 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-505 block mb-1">Confirm New Password</label>
                                  <input 
                                    type="password" 
                                    placeholder="Repeat new password"
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-indigo-500 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    addNotification('Password Updated', 'Your account password has been changed successfully.', 'success');
                                  }}
                                  className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-2 px-4 rounded-xl text-[10px] transition duration-200 cursor-pointer"
                                >
                                  Update Password
                                </button>
                              </div>
                            </div>

                            {/* Device Pairing Cross-Sync */}
                            <div className="border-t border-zinc-800/60 pt-5 col-span-full space-y-4">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Device Pairing & Cross-Sync</h4>
                              <p className="text-[10px] text-zinc-550 leading-relaxed">
                                Since Google OAuth is restricted inside native wrapper apps (mobile APK & desktop EXE), you can log in on your system web browser, copy a secure Pairing Token, and paste it below to link your device.
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Generate Token (for logged in web users) */}
                                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl space-y-3">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-zinc-300">Generate Pairing Token</span>
                                    <span className="text-[10px] text-zinc-500">Copy this token to pair your mobile/desktop wrappers.</span>
                                  </div>
                                  
                                  {pairingToken ? (
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="text" 
                                        readOnly
                                        value={pairingToken}
                                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-[10px] text-zinc-400 outline-none w-full font-mono select-all"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(pairingToken);
                                          addNotification('Token Copied', 'Pairing token copied to clipboard.', 'success');
                                        }}
                                        className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold px-3 py-2 rounded-lg text-[10px] transition shrink-0"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        try {
                                          const res = await fetch('/api/auth/pairing-token');
                                          const data = await res.json();
                                          if (data.success) {
                                            setPairingToken(data.token);
                                          } else {
                                            alert(data.message || "Failed to generate token.");
                                          }
                                        } catch (e) {
                                          alert("Failed to fetch pairing token. Make sure you are logged in.");
                                        }
                                      }}
                                      className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-[10px] transition cursor-pointer"
                                    >
                                      Generate Token
                                    </button>
                                  )}
                                </div>

                                {/* Paste Token (to authenticate device) */}
                                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl space-y-3">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-zinc-300">Enter Pairing Token</span>
                                    <span className="text-[10px] text-zinc-500">Paste the token generated from your browser session.</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="Paste secure token here..."
                                      value={inputPairingToken}
                                      onChange={(e) => setInputPairingToken(e.target.value)}
                                      className="bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg p-2 text-[10px] text-zinc-300 outline-none w-full font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const trimmed = inputPairingToken.trim();
                                        if (!trimmed) return alert("Please paste a valid token.");
                                        
                                        // Save token to cookie
                                        document.cookie = `nexrume-session=${trimmed}; path=/; max-age=604800; secure; samesite=lax`;
                                        
                                        // Trigger session verification
                                        await checkSession();
                                        setInputPairingToken('');
                                        addNotification('Device Paired', 'Successfully authenticated session via pairing token.', 'success');
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-[10px] transition shrink-0"
                                    >
                                      Pair
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Unsaved Changes Save/Cancel Floating Panel */}
                    {isSettingsEditMode && isProfileChanged && (
                      <div className="flex items-center justify-end gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl animate-fade-in shadow-xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                        <span className="text-zinc-400 text-xs font-medium mr-auto pl-2">You have unsaved settings modifications.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsEditMode(false);
                            setTempProfile({
                              name: userProfile.name || '',
                              email: userProfile.email || '',
                              phone: userProfile.phone || '',
                              location: userProfile.location || '',
                              profilePhoto: userProfile.profilePhoto || '',
                              experience: userProfile.experience || '',
                              skills: userProfile.skills || [],
                              education: userProfile.education || '',
                              certifications: userProfile.certifications || [],
                              github: userProfile.github || '',
                              leetcode: userProfile.leetcode || '',
                              linkedin: userProfile.linkedin || '',
                              portfolio: userProfile.portfolio || '',
                              theme: userProfile.theme || 'dark',
                              timeZone: userProfile.timeZone || '',
                              defaultWorkMode: userProfile.defaultWorkMode || 'Remote',
                              defaultResumeVersion: userProfile.defaultResumeVersion || '',
                              defaultEmailAccount: userProfile.defaultEmailAccount || '',
                              defaultApplicationMethod: userProfile.defaultApplicationMethod || 'Company Careers Page',
                              defaultLocationPreference: userProfile.defaultLocationPreference || 'Remote',
                              language: userProfile.language || 'English',
                              notificationInApp: userProfile.notifications?.inApp !== false,
                              notificationEmail: userProfile.notifications?.email !== false,
                              notificationPush: userProfile.notifications?.push !== false
                            });
                          }}
                          className="px-3.5 py-1.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950 text-zinc-400 hover:text-white rounded-xl transition text-[11px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const { notificationInApp, notificationEmail, notificationPush, ...restProfile } = tempProfile;
                            updateProfile({
                              ...restProfile,
                              notifications: {
                                inApp: !!notificationInApp,
                                email: !!notificationEmail,
                                push: !!notificationPush
                              }
                            });
                            setIsSettingsEditMode(false);
                            addNotification('Profile Updated', 'Your profile and application preferences have been saved successfully.', 'success');
                          }}
                          className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl transition text-[11px] font-bold cursor-pointer shadow-md shadow-indigo-600/10"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {showEditJobModal && editingJob && (() => {
        const isEditInterviewVisible = editShortlisted || ['Shortlisted', 'Assessment', 'Interview', 'Offer'].includes(editStatus);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 ${isEditInterviewVisible ? 'max-w-4xl xl:max-w-5xl' : 'max-w-2xl'} w-full space-y-4 animate-scale-in flex flex-col max-h-[90vh]`}>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2 shrink-0">
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">Modify Application</span>
                  <span className="text-[10px] text-zinc-500 font-medium">ATS-Style Application Editor</span>
                </div>
                <button onClick={() => setShowEditJobModal(false)} className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer">&times;</button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden pr-2 text-xs select-none">
                <div className={`grid grid-cols-1 ${isEditInterviewVisible ? 'xl:grid-cols-2 gap-5 xl:h-full xl:min-h-0 xl:overflow-hidden' : 'lg:flex-1 lg:overflow-y-auto lg:scrollbar-thin lg:pr-2'}`}>
                  {/* Column 1: Core Form Fields & Tabs */}
                  <div className={`space-y-3.5 ${isEditInterviewVisible ? 'xl:h-full xl:overflow-y-auto xl:scrollbar-thin xl:pr-2 xl:pb-1' : ''}`}>
                    {/* Core Details (Always Visible) */}
                    <div className="grid grid-cols-2 gap-3.5 bg-zinc-950/20 border border-zinc-855 p-3 rounded-xl">
                      <div>
                        <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                          Company Name *
                        </label>
                        <input 
                          type="text" 
                          value={editCompany} 
                          onChange={e => setEditCompany(e.target.value)}
                          className="w-full h-[36px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                          Role / Position *
                        </label>
                        <input 
                          type="text" 
                          value={editRole} 
                          onChange={e => setEditRole(e.target.value)}
                          className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                          Location
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. San Francisco, CA" 
                          value={editLoc} 
                          onChange={e => setEditLoc(e.target.value)}
                          className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                          Work Mode
                        </label>
                        <SearchableDropdown
                          options={['Remote', 'Hybrid', 'Onsite']}
                          value={editWorkMode}
                          onChange={val => setEditWorkMode(val as any)}
                          placeholder="Select mode"
                        />
                      </div>
                    </div>

                    {/* Sub-Tabs Navigation */}
                    <div className="flex bg-zinc-950 border border-zinc-850 rounded-xl p-0.5 select-none text-[10px] items-center">
                      <button 
                        type="button"
                        onClick={() => setEditFormSubTab('details')}
                        className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition h-7 flex items-center justify-center ${editFormSubTab === 'details' ? 'bg-zinc-850 text-white border border-zinc-800/40 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Details & Tracking
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditFormSubTab('notes')}
                        className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition h-7 flex items-center justify-center ${editFormSubTab === 'notes' ? 'bg-zinc-850 text-white border border-zinc-800/40 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Notes & CRM
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditFormSubTab('attachments')}
                        className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition h-7 flex items-center justify-center ${editFormSubTab === 'attachments' ? 'bg-zinc-850 text-white border border-zinc-800/40 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Attachments ({editAttachments.length})
                      </button>
                    </div>

                    {/* Tab 1: Details & Tracking */}
                    {editFormSubTab === 'details' && (
                      <div className="space-y-3.5 mt-1 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Job URL
                            </label>
                            <input 
                              type="url" 
                              placeholder="https://..." 
                              value={editUrl} 
                              onChange={e => setEditUrl(e.target.value)}
                              className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Email Account Used
                            </label>
                            <SmartEmailInput
                              value={editEmailUsed}
                              onChange={val => setEditEmailUsed(val)}
                              applications={applications}
                              placeholder="e.g. alex@gmail.com"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Application Method
                            </label>
                            <SearchableDropdown
                              options={[
                                "Company Careers Page", "LinkedIn", "Naukri", "Indeed", "Foundit",
                                "Wellfound", "Internshala", "Referral", "Recruiter Outreach",
                                "Direct Email", "Campus Placement", "Career Fair", "Other"
                              ]}
                              value={editAppMethod}
                              onChange={val => setEditAppMethod(val)}
                              allowCustom={true}
                              placeholder="Select Method..."
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Application Type
                            </label>
                            <div className="relative">
                              <select 
                                value={editAppType} 
                                onChange={e => setEditAppType(e.target.value as any)} 
                                className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-3 pr-7 text-zinc-150 outline-none transition appearance-none cursor-pointer text-xs"
                              >
                                <option value="Full Time">Full Time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Apprenticeship">Apprenticeship</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-550">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Resume Version
                            </label>
                            <SearchableDropdown
                              options={resumes.map(r => r.name)}
                              value={editResumeVersion}
                              onChange={val => setEditResumeVersion(val)}
                              allowCustom={true}
                              placeholder="Select Resume..."
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Application Date
                            </label>
                            <input 
                              type="text" 
                              placeholder="2026-05-15"
                              value={editAppDate} 
                              onChange={e => setEditAppDate(e.target.value)}
                              className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-150 outline-none transition text-xs" 
                            />
                          </div>
                        </div>

                        {editAppMethod === 'Other' && (
                          <div className="animate-fade-in">
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Custom Method
                            </label>
                            <input 
                              type="text" 
                              placeholder="Specify custom method..." 
                              value={editCustomMethod}
                              onChange={e => setEditCustomMethod(e.target.value)}
                              className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-100 outline-none transition text-xs" 
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3.5 items-center">
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Current Status
                            </label>
                            <div className="relative">
                              <select 
                                value={editStatus} 
                                onChange={e => {
                                  const nextStatus = e.target.value as any;
                                  setEditStatus(nextStatus);
                                  if (['Shortlisted', 'Assessment', 'Interview', 'Offer'].includes(nextStatus)) {
                                    setEditShortlisted(true);
                                  }
                                }} 
                                className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-3 pr-7 text-zinc-150 outline-none transition appearance-none cursor-pointer text-xs"
                              >
                                <option value="Saved">Saved</option>
                                <option value="Applied">Applied</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Assessment">Assessment</option>
                                <option value="Interview">Interview</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Withdrawn">Withdrawn</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-550">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Shortlisted?
                            </label>
                            <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 select-none text-[10px] h-[36px] items-center">
                              <button 
                                type="button" 
                                onClick={() => setEditShortlisted(true)}
                                className={`flex-1 py-1 px-3 rounded-lg font-bold transition h-full flex items-center justify-center ${editShortlisted ? 'bg-emerald-650 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Yes
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setEditShortlisted(false)}
                                className={`flex-1 py-1 px-3 rounded-lg font-bold transition h-full flex items-center justify-center ${!editShortlisted ? 'bg-zinc-850 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className={`grid ${isEditInterviewVisible ? 'grid-cols-1 gap-2.5' : 'grid-cols-2 gap-3.5'} pt-1.5 border-t border-zinc-900/60`}>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                              Upload Resume (PDF/DOCX)
                            </label>
                            <input 
                              type="file" 
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setUploadedResumeUrl(reader.result as string);
                                    setEditResumeVersion('Uploaded: ' + file.name);
                                    setResumeUploadStatus('success');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full h-[36px] bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl text-[9.5px] text-zinc-400 file:mr-2 file:py-0.5 file:px-1.5 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-zinc-850 file:text-zinc-350 outline-none cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1.5 text-[10px]">
                              Resume Tags (Press Enter)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="text" 
                                placeholder="e.g. Python, Docker" 
                                value={editNewTagInput}
                                onChange={e => setEditNewTagInput(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const tag = editNewTagInput.trim();
                                    if (tag && !editResumeTags.includes(tag)) {
                                      setEditResumeTags([...editResumeTags, tag]);
                                    }
                                    setEditNewTagInput('');
                                  }
                                }}
                                className="flex-1 h-[30px] bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-2 text-zinc-155 outline-none text-[10.5px]" 
                              />
                              <button 
                                type="button" 
                                onClick={() => {
                                  const tag = editNewTagInput.trim();
                                  if (tag && !editResumeTags.includes(tag)) {
                                    setEditResumeTags([...editResumeTags, tag]);
                                  }
                                  setEditNewTagInput('');
                                }}
                                className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[9.5px] font-bold text-zinc-350 h-[30px] px-2.5 rounded-lg transition"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>

                        {editResumeTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {editResumeTags.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                <span>{tag}</span>
                                <button type="button" onClick={() => setEditResumeTags(editResumeTags.filter(t => t !== tag))} className="text-[10px] text-indigo-500 hover:text-indigo-300 font-bold">&times;</button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-zinc-900/60">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 font-bold text-[10px]">Was a Referral Used?</span>
                            <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 select-none text-[10px] h-[30px] items-center">
                              <button 
                                type="button" 
                                onClick={() => setEditReferralUsed(true)}
                                className={`px-3 py-1 rounded-lg font-bold transition h-full flex items-center justify-center ${editReferralUsed ? 'bg-indigo-650 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                Yes
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setEditReferralUsed(false)}
                                className={`px-3 py-1 rounded-lg font-bold transition h-full flex items-center justify-center ${!editReferralUsed ? 'bg-zinc-850 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>

                        {editReferralUsed && (
                          <div className="grid grid-cols-2 gap-3 border-t border-zinc-900 pt-2 animate-fade-in">
                            <div>
                              <label className="text-zinc-400 font-bold block mb-1 text-[10px]">Referrer Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. John Doe" 
                                value={editReferrerName}
                                onChange={e => setEditReferrerName(e.target.value)}
                                className="w-full h-[36px] bg-zinc-955 border border-zinc-800 rounded-xl px-3 text-zinc-100 outline-none text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-400 font-bold block mb-1 text-[10px]">LinkedIn Profile</label>
                              <input 
                                type="text" 
                                placeholder="linkedin.com/in/..." 
                                value={editReferrerLinkedin}
                                onChange={e => setEditReferrerLinkedin(e.target.value)}
                                className="w-full h-[36px] bg-zinc-955 border border-zinc-800 rounded-xl px-3 text-zinc-100 outline-none text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-zinc-400 font-bold block mb-1 text-[10px]">Referral Notes</label>
                              <textarea 
                                placeholder="Any context or notes from referrer..." 
                                value={editReferralNotes}
                                onChange={e => setEditReferralNotes(e.target.value)}
                                rows={1.5}
                                className="w-full bg-zinc-955 border border-zinc-800 rounded-xl p-2 text-zinc-100 outline-none text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* Chronological Timeline History section */}
                        {editingJob.timeline && editingJob.timeline.length > 0 && (
                          <div className="pt-3.5 border-t border-zinc-900/60 space-y-2">
                            <span className="text-[10px] text-zinc-455 font-bold uppercase tracking-wider block">Timeline History</span>
                            <div className="flex flex-col gap-1.5 pl-1.5 border-l border-indigo-900/40 relative ml-1 pt-0.5">
                              {editingJob.timeline.map((item: any, idx: number) => (
                                <div key={idx} className="relative text-[9.5px] text-zinc-400 flex items-center justify-between">
                                  <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -left-[10.5px] border border-zinc-900"></div>
                                  <span className="font-semibold text-zinc-300">{item.stage}</span>
                                  <span className="text-zinc-600 font-mono text-[8.5px]">{new Date(item.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Notes & CRM */}
                    {editFormSubTab === 'notes' && (
                      <div className="space-y-3.5 mt-1 animate-fade-in">
                        <div>
                          <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                            Application Notes
                          </label>
                          <textarea 
                            placeholder="e.g. Job description, key skills needed, reminders..." 
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value)}
                            rows={3.5}
                            className="w-full bg-zinc-955 border border-zinc-800 rounded-xl p-2.5 text-zinc-150 outline-none transition text-xs" 
                          />
                        </div>

                        <div className="border-t border-zinc-900/60 pt-2.5 space-y-2.5">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Recruiter CRM</span>
                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-zinc-550 block mb-1 text-[9.5px]">Recruiter Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Sarah Jenkins" 
                                value={editRecruiterName}
                                onChange={e => setEditRecruiterName(e.target.value)}
                                className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-155 outline-none transition text-xs" 
                              />
                            </div>
                            <div>
                              <label className="text-zinc-555 block mb-1 text-[9.5px]">Contact Details (Email/Phone)</label>
                              <input 
                                type="text" 
                                placeholder="sjenkins@google.com" 
                                value={editRecruiterContact}
                                onChange={e => setEditRecruiterContact(e.target.value)}
                                className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-155 outline-none transition text-xs" 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-zinc-555 block mb-1 text-[9.5px]">Follow-Up Reminders / Status Info</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Follow up on Monday regarding tech assessment" 
                              value={editRecruiterFollowUp}
                              onChange={e => setEditRecruiterFollowUp(e.target.value)}
                              className="w-full h-[36px] bg-zinc-955 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-zinc-155 outline-none transition text-xs" 
                            />
                          </div>
                        </div>

                        <div className="border-t border-zinc-900/60 pt-2.5">
                          <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                            Follow-Up Notes
                          </label>
                          <textarea 
                            placeholder="e.g. Sent follow up email on May 28, waiting for scheduling confirmation..." 
                            value={editFollowUpNotes}
                            onChange={e => setEditFollowUpNotes(e.target.value)}
                            rows={2.5}
                            className="w-full bg-zinc-955 border border-zinc-800 rounded-xl p-2.5 text-zinc-150 outline-none transition text-xs" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Attachments */}
                    {editFormSubTab === 'attachments' && (
                      <div className="space-y-3 mt-1 animate-fade-in">
                        <div>
                          <label className="text-zinc-400 font-bold block mb-1 text-[10px]">
                            Upload Documents (JD, Offer Letter, Assessment)
                          </label>
                          <input 
                            type="file" 
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (!files) return;
                              const arr = Array.from(files).map(f => ({
                                name: f.name,
                                url: '#',
                                uploadDate: new Date().toLocaleDateString(),
                                size: f.size >= 1000000 ? `${(f.size / 1000000).toFixed(1)} MB` : `${Math.round(f.size / 1000)} KB`
                              }));
                              setEditAttachments([...editAttachments, ...arr]);
                            }}
                            className="w-full h-[36px] bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl text-[9.5px] text-zinc-400 file:mr-2 file:py-0.5 file:px-1.5 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-zinc-850 file:text-zinc-350 outline-none cursor-pointer"
                          />
                        </div>

                        {editAttachments.length > 0 ? (
                          <div className="space-y-1.5 border-t border-zinc-900/60 pt-2.5 max-h-[150px] overflow-y-auto scrollbar-thin">
                            {editAttachments.map((file, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-[9.5px] font-mono text-zinc-300">
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-zinc-200 truncate max-w-[200px]" title={file.name}>{file.name}</span>
                                  <span className="text-zinc-500 text-[8.5px]">{file.size} • {file.uploadDate}</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => setEditAttachments(editAttachments.filter((_, i) => i !== idx))} 
                                  className="text-rose-500 hover:text-rose-400 px-1.5 font-bold text-[12px]"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-zinc-550 border border-dashed border-zinc-850 rounded-xl leading-normal text-[10px] italic">
                            No attachments uploaded yet. Support multiple files.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Interview Pipeline (Conditional) */}
                  {isEditInterviewVisible && (
                    <div className="border-t xl:border-t-0 xl:border-l border-zinc-800/80 pt-4 xl:pt-0 xl:pl-5 space-y-3.5 flex flex-col xl:h-full xl:overflow-hidden min-h-0">
                      {/* Interview Header */}
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Interview Process</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            const rId = `round-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                            const newRound = {
                              id: rId,
                              type: 'Technical Assessment',
                              status: 'Pending',
                              date: '',
                              time: '',
                              meetingLink: '',
                              notes: ''
                            };
                            setEditRounds([...editRounds, newRound]);
                            setRoundOpenState(prev => ({ ...prev, [rId]: true }));
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          + Add Round
                        </button>
                      </div>

                      {/* Smart Templates Selector */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-2.5">
                        <span className="text-[10px] text-zinc-555 font-bold uppercase tracking-wider">Templates:</span>
                        <div className="flex gap-1.5 text-[9px]">
                          <button 
                            type="button" 
                            onClick={() => {
                              const timestamp = Date.now();
                              const rounds = [
                                { id: `round-1-${timestamp}`, type: 'Coding Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' },
                                { id: `round-2-${timestamp}`, type: 'Technical Assessment', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' },
                                { id: `round-3-${timestamp}`, type: 'HR Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' }
                              ];
                              setEditRounds(rounds);
                            }}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                          >
                            SWE
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              const timestamp = Date.now();
                              const rounds = [
                                { id: `round-1-${timestamp}`, type: 'Technical Assessment', status: 'Pending', name: 'Online Assessment', date: '', time: '', meetingLink: '', notes: '' },
                                { id: `round-2-${timestamp}`, type: 'Coding Round', status: 'Pending', name: 'Technical Round 1', date: '', time: '', meetingLink: '', notes: '' },
                                { id: `round-3-${timestamp}`, type: 'Coding Round', status: 'Pending', name: 'Technical Round 2', date: '', time: '', meetingLink: '', notes: '' },
                                { id: `round-4-${timestamp}`, type: 'Managerial Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' },
                                { id: `round-5-${timestamp}`, type: 'HR Round', status: 'Pending', date: '', time: '', meetingLink: '', notes: '' }
                              ];
                              setEditRounds(rounds);
                            }}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                          >
                            Product
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              const timestamp = Date.now();
                              const rounds = [
                                { id: `round-1-${timestamp}`, type: 'Coding Round', status: 'Pending', name: 'Technical Round', date: '', time: '', meetingLink: '', notes: '' },
                                { id: `round-2-${timestamp}`, type: 'Final Interview', status: 'Pending', name: 'Founder Round', date: '', time: '', meetingLink: '', notes: '' }
                              ];
                              setEditRounds(rounds);
                            }}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                          >
                            Startup
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setEditRounds([])}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-0.5 rounded transition text-zinc-400 font-bold cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 mt-1">
                        <span>Total Interview Rounds: {editRounds.length}</span>
                      </div>

                      {editRounds.length === 0 ? (
                        <div className="text-center py-8 text-zinc-550 border border-dashed border-zinc-850 rounded-xl leading-normal text-[10px] italic">
                          No interview rounds configured yet. Select a template or click "+ Add Round" to build your process.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[340px] xl:max-h-none xl:flex-1 xl:overflow-y-auto xl:min-h-0 pr-1 pb-1 scrollbar-thin">
                          {editRounds.map((round, idx) => {
                            const isCollapsed = !roundOpenState[round.id];
                            
                            let statusBadgeColor = 'bg-zinc-800 text-zinc-450 border-zinc-700';
                            let statusSymbol = '○';
                            if (round.status === 'Scheduled') {
                              statusBadgeColor = 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';
                              statusSymbol = '📅';
                            } else if (round.status === 'Passed') {
                              statusBadgeColor = 'bg-emerald-955/40 text-emerald-400 border-emerald-900/30';
                              statusSymbol = '✓';
                            } else if (round.status === 'Failed') {
                              statusBadgeColor = 'bg-rose-955/40 text-rose-455 border-rose-900/30';
                              statusSymbol = '✗';
                            } else if (round.status === 'Skipped') {
                              statusBadgeColor = 'bg-zinc-900 text-zinc-500 border-zinc-850';
                              statusSymbol = '—';
                            }

                            return (
                              <div 
                                key={round.id} 
                                draggable
                                onDragStart={(e) => {
                                  setDraggedEditRoundIndex(idx);
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                }}
                                onDrop={(e) => {
                                  handleEditRoundDrop(idx);
                                }}
                                onDragEnd={() => {
                                  setDraggedEditRoundIndex(null);
                                }}
                                className={`border border-zinc-850 bg-zinc-950 rounded-xl overflow-hidden shadow-sm transition text-xs ${draggedEditRoundIndex === idx ? 'opacity-40 border-indigo-500 border-dashed' : 'hover:border-zinc-700'}`}
                              >
                                {/* Round Card Header */}
                                <div 
                                  onClick={() => setRoundOpenState(prev => ({ ...prev, [round.id]: !prev[round.id] }))}
                                  className="flex justify-between items-center bg-zinc-900/40 hover:bg-zinc-900 transition px-3 py-2 cursor-pointer select-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-zinc-650 font-bold cursor-grab active:cursor-grabbing hover:text-zinc-300 select-none">☰</span>
                                    <span className="font-extrabold text-zinc-300 flex items-center gap-1.5">
                                      <span className="text-zinc-500 font-bold">{statusSymbol}</span>
                                      {idx + 1}. {round.name || round.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {/* Status selector select */}
                                    <select 
                                      value={round.status} 
                                      onChange={e => {
                                        setEditRounds(editRounds.map(r => r.id === round.id ? { ...r, status: e.target.value as any } : r));
                                      }} 
                                      className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-lg cursor-pointer outline-none bg-zinc-950 ${statusBadgeColor}`}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Scheduled">Scheduled</option>
                                      <option value="Passed">Passed</option>
                                      <option value="Failed">Failed</option>
                                      <option value="Skipped">Skipped</option>
                                    </select>

                                    <div className="flex items-center border border-zinc-850 rounded bg-zinc-950 p-0.5 text-[8px] font-bold">
                                      <button type="button" disabled={idx === 0} onClick={() => {
                                        const reordered = [...editRounds];
                                        const temp = reordered[idx];
                                        reordered[idx] = reordered[idx - 1];
                                        reordered[idx - 1] = temp;
                                        setEditRounds(reordered);
                                      }} className="px-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-500 transition">▲</button>
                                      <button type="button" disabled={idx === editRounds.length - 1} onClick={() => {
                                        const reordered = [...editRounds];
                                        const temp = reordered[idx];
                                        reordered[idx] = reordered[idx + 1];
                                        reordered[idx + 1] = temp;
                                        setEditRounds(reordered);
                                      }} className="px-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-500 transition">▼</button>
                                    </div>

                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setEditRounds(editRounds.filter(r => r.id !== round.id));
                                      }} 
                                      className="text-rose-500 hover:text-rose-455 p-0.5 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Collapsible Detail fields */}
                                {!isCollapsed && (
                                  <div className="p-3 border-t border-zinc-855/60 bg-zinc-955/30 space-y-2.5">
                                    <div className="grid grid-cols-2 gap-2.5">
                                      <div>
                                        <label className="text-zinc-555 block mb-1 text-[9px]">Round Type</label>
                                        <select 
                                          value={round.type} 
                                          onChange={e => {
                                            setEditRounds(editRounds.map(r => r.id === round.id ? { ...r, type: e.target.value as any } : r));
                                          }} 
                                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300"
                                        >
                                          <option value="Technical Assessment">Technical Assessment</option>
                                          <option value="Communication Assessment">Communication Assessment</option>
                                          <option value="Coding Round">Coding Round</option>
                                          <option value="Behavioral Round">Behavioral Round</option>
                                          <option value="HR Round">HR Round</option>
                                          <option value="Managerial Round">Managerial Round</option>
                                          <option value="Final Interview">Final Interview</option>
                                          <option value="Custom Round">Custom Round</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-zinc-555 block mb-1 text-[9px]">Custom Name (Optional)</label>
                                        <input 
                                          type="text" 
                                          placeholder="e.g. Founder Round" 
                                          value={round.name || ''} 
                                          onChange={e => {
                                            setEditRounds(editRounds.map(r => r.id === round.id ? { ...r, name: e.target.value } : r));
                                          }} 
                                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300" 
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5">
                                      <div>
                                        <label className="text-zinc-555 block mb-1 text-[9px]">Interview Date</label>
                                        <input 
                                          type="date" 
                                          value={round.date || ''} 
                                          onChange={e => {
                                            setEditRounds(editRounds.map(r => r.id === round.id ? { ...r, date: e.target.value } : r));
                                          }} 
                                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300" 
                                        />
                                      </div>
                                      <div>
                                        <label className="text-zinc-555 block mb-1 text-[9px]">Interview Time</label>
                                        <input 
                                          type="time" 
                                          value={round.time || ''} 
                                          onChange={e => {
                                            setEditRounds(editRounds.map(r => r.id === round.id ? { ...r, time: e.target.value } : r));
                                          }} 
                                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300" 
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-zinc-555 block mb-1 text-[9px]">Meeting Link (Meet, Zoom, Teams)</label>
                                      <input 
                                        type="url" 
                                        placeholder="https://..." 
                                        value={round.meetingLink || ''} 
                                        onChange={e => {
                                          setEditRounds(editRounds.map(r => r.id === round.id ? { ...r, meetingLink: e.target.value } : r));
                                        }} 
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 outline-none text-[11px] text-zinc-300 font-mono" 
                                      />
                                    </div>

                                    <div>
                                      <label className="text-zinc-555 block mb-1 text-[9px]">Round Notes</label>
                                      <textarea 
                                        placeholder="Questions asked, preparation points, feedback..." 
                                        value={round.notes || ''} 
                                        onChange={e => {
                                          setEditRounds(editRounds.map(r => r.id === round.id ? { ...r, notes: e.target.value } : r));
                                        }} 
                                        rows={2}
                                        className="w-full bg-zinc-955 border border-zinc-800 rounded-lg p-2 outline-none text-[11px] text-zinc-350" 
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2.5 pt-2.5 border-t border-zinc-800 shrink-0">
                <button onClick={() => setShowEditJobModal(false)} className="bg-zinc-800 hover:bg-zinc-755 text-zinc-300 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer">Cancel</button>
                <button 
                  onClick={() => {
                    if (!editCompany || !editRole) {
                      alert("Please fill out Company Name and Role / Position.");
                      return;
                    }

                    if (editStatus !== editingJob.status) {
                      updateApplicationStatus(editingJob.id, editStatus);
                    }

                    const totalRds = editRounds.length;
                    const passedRds = editRounds.filter(r => r.status === 'Passed').length;
                    const currentRd = Math.min(totalRds, passedRds + 1);

                    updateApplication(editingJob.id, { 
                      company: editCompany, 
                      role: editRole, 
                      location: editLoc, 
                      jobUrl: editUrl, 
                      workMode: editWorkMode, 
                      appliedDate: editAppDate,
                      status: editStatus,
                      appliedFromEmail: editEmailUsed,
                      source: editAppMethod === 'Other' ? editCustomMethod : editAppMethod,
                      customMethod: editAppMethod === 'Other' ? editCustomMethod : '',
                      applicationType: editAppType,
                      referralUsed: editReferralUsed,
                      referrerName: editReferralUsed ? editReferrerName : "",
                      referrerLinkedin: editReferralUsed ? editReferrerLinkedin : "",
                      referralNotes: editReferralUsed ? editReferralNotes : "",
                      shortlisted: editShortlisted,
                      resumeUsed: editResumeVersion,
                      resumeFile: uploadedResumeUrl || editResumeFile || editingJob.resumeFile,
                      resumeTags: editResumeTags,
                      interviewRounds: editRounds,
                      notes: editNotes,
                      recruiterName: editRecruiterName,
                      recruiterContact: editRecruiterContact,
                      recruiterFollowUp: editRecruiterFollowUp,
                      followUpNotes: editFollowUpNotes,
                      attachments: editAttachments,
                      totalRounds: totalRds || undefined,
                      currentRound: totalRds ? currentRd : undefined
                    });
                    setShowEditJobModal(false);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-indigo-650/10"
                >
                  Save Changes
                </button>
            </div>
          </div>
        </div>
      );
    })()}

      {/* MODAL 3: RESUME PREVIEW */}
      {previewResume && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5 shrink-0">
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm">Resume Previewer</span>
                <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase tracking-wider">{previewResumeName}</span>
              </div>
              <button 
                onClick={() => {
                  setPreviewResume(null);
                  setPreviewResumeName('');
                }} 
                className="text-zinc-550 hover:text-zinc-350 text-xl font-bold px-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Preview Body */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs scrollbar-thin">
              {previewResume.isMockFile ? (
                /* Uploaded File Viewer Layout */
                <div className="space-y-4">
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center gap-3.5 shadow-inner">
                    <div className="w-10 h-10 bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-zinc-200 block truncate text-xs">{previewResume.name}</span>
                      <span className="text-zinc-550 text-[9px] font-mono">{previewResume.size || 'Size Unknown'} • Uploaded {previewResume.uploadDate}</span>
                    </div>
                    {previewResume.fileUrl && (previewResume.fileUrl.startsWith('http://') || previewResume.fileUrl.startsWith('https://')) && (
                      <a 
                        href={previewResume.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] transition shrink-0 cursor-pointer"
                      >
                        Open Raw Document
                      </a>
                    )}
                  </div>

                  {(() => {
                    const url = previewResume.fileUrl || '';
                    
                    if (url.startsWith('drive-mock') || url.includes('drive-mock')) {
                      return (
                        <div className="bg-zinc-900 border border-zinc-850 p-8 rounded-xl text-center space-y-4 shadow-xl">
                          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
                          <div className="space-y-1">
                            <span className="text-zinc-200 font-bold block text-sm">Mock Google Drive File</span>
                            <p className="text-zinc-400 text-xs max-w-md mx-auto leading-relaxed">
                              This link is simulated. To preview live documents directly in the dashboard, link your active Google Drive account in the Settings tab, or upload a local PDF/image resume.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    if (url.includes('drive.google.com')) {
                      let embedUrl = url;
                      if (embedUrl.includes('/view')) {
                        embedUrl = embedUrl.split('/view')[0] + '/preview';
                      } else if (embedUrl.includes('/edit')) {
                        embedUrl = embedUrl.split('/edit')[0] + '/preview';
                      } else {
                        const match = embedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                        if (match && match[1]) {
                          embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
                        }
                      }
                      return (
                        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-white shadow-2xl">
                          <iframe 
                            src={embedUrl} 
                            className="w-full h-[550px] border-0" 
                            title="Google Drive Document Preview"
                            allow="autoplay"
                          />
                        </div>
                      );
                    }
                    
                    const isDataPdf = url.startsWith('data:application/pdf');
                    const isHttpPdf = (url.startsWith('http://') || url.startsWith('https://')) && url.endsWith('.pdf');
                    if (isDataPdf || isHttpPdf) {
                      return (
                        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-white shadow-2xl">
                          <iframe 
                            src={url} 
                            className="w-full h-[550px] border-0" 
                            title="PDF Document Preview"
                          />
                        </div>
                      );
                    }
                    
                    const isDataImg = url.startsWith('data:image/');
                    const isHttpImg = (url.startsWith('http://') || url.startsWith('https://')) && (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.webp'));
                    if (isDataImg || isHttpImg) {
                      return (
                        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 p-4 shadow-2xl flex items-center justify-center min-h-[400px]">
                          <img 
                            src={url} 
                            className="max-w-full h-auto max-h-[550px] rounded shadow-md object-contain" 
                            alt="Resume Preview" 
                          />
                        </div>
                      );
                    }
                    
                    // Interactive drag-and-drop file upload zone fallback
                    return (
                      <div 
                        onDragOver={handleFallbackDragOver}
                        onDragLeave={handleFallbackDragLeave}
                        onDrop={handleFallbackDrop}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                          isResumeDragging 
                            ? 'border-indigo-500 bg-indigo-950/15' 
                            : 'border-zinc-850 bg-zinc-950/40 hover:border-zinc-750'
                        } flex flex-col items-center justify-center space-y-4 min-h-[300px]`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 transition-colors">
                          <Upload className={`w-7 h-7 ${isResumeDragging ? 'text-indigo-400 animate-bounce' : 'text-zinc-550'}`} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-zinc-200 font-bold block text-sm">Upload local file to preview</span>
                          <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
                            To preview <span className="font-mono text-indigo-400 font-bold">&quot;{previewResume.name}&quot;</span>, drop the file here or click below to select it from your computer.
                          </p>
                        </div>
                        <div>
                          <label className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-2 px-4 rounded-xl text-[10px] transition cursor-pointer select-none inline-block">
                            Browse File
                            <input 
                              type="file" 
                              accept=".pdf,.png,.jpg,.jpeg,.webp" 
                              className="hidden" 
                              onChange={handleFallbackUpload} 
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Linked ResumeVersion Viewer Layout */
                <div className="space-y-4">
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-200 block text-xs">{previewResume.name}</span>
                        <span className="text-zinc-550 text-[9.5px]">Linked Resume Version: <span className="font-mono text-indigo-400 font-bold">{previewResume.version}</span></span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedResumeId(previewResume.id);
                        setActiveTab('resumes');
                        setPreviewResume(null);
                      }} 
                      className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 font-bold py-1.5 px-3 rounded-lg text-[10px] transition shrink-0 cursor-pointer flex items-center gap-1 border border-zinc-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Edit in Resume Studio</span>
                    </button>
                  </div>

                  {/* Document Viewer Paper Style */}
                  <div className="bg-white text-zinc-900 p-8 rounded-xl font-sans min-h-[450px] border border-zinc-350 shadow-xl space-y-4 max-w-[21cm] mx-auto select-text relative rounded-2xl">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                      <Briefcase className="w-72 h-72 text-zinc-900" />
                    </div>

                    {/* Header */}
                    <div className="border-b-2 border-zinc-850 pb-3 text-center space-y-1">
                      <h2 className="text-xl font-extrabold text-zinc-900 uppercase tracking-tight">{userProfile.name}</h2>
                      <div className="text-[10px] text-zinc-650 font-medium flex flex-wrap justify-center gap-x-3">
                        <span>📧 {userProfile.email}</span>
                        {userProfile.phone && <span>📞 {userProfile.phone}</span>}
                        {userProfile.location && <span>📍 {userProfile.location}</span>}
                        {userProfile.linkedin && <span>🔗 {userProfile.linkedin.replace('linkedin.com/in/', '')}</span>}
                      </div>
                    </div>

                    {/* Resume content blocks */}
                    <div className="space-y-4 text-[10px] leading-relaxed text-zinc-800">
                      {/* Summary */}
                      {previewResume.summary && (
                        <div className="space-y-1">
                          <span className="font-bold text-zinc-900 border-b border-zinc-300 block uppercase tracking-wider text-[10.5px]">Professional Summary</span>
                          <p>{previewResume.summary}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {previewResume.skills && (
                        <div className="space-y-1">
                          <span className="font-bold text-zinc-900 border-b border-zinc-300 block uppercase tracking-wider text-[10.5px]">Technical Skills</span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {previewResume.skills.split(',').map((skill: string, idx: number) => (
                              <span key={idx} className="bg-zinc-100 text-zinc-850 px-2 py-0.5 rounded text-[9.5px] border border-zinc-200 font-medium">{skill.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {previewResume.experience && (
                        <div className="space-y-2">
                          <span className="font-bold text-zinc-900 border-b border-zinc-300 block uppercase tracking-wider text-[10.5px]">Experience</span>
                          <div className="space-y-2">
                            {parseExperience(previewResume.experience).map((exp, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between font-bold text-zinc-900">
                                  <span>{exp.role}</span>
                                  <span>{exp.duration || 'N/A'}</span>
                                </div>
                                <p className="italic text-zinc-650">{exp.company}</p>
                                <p>{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {previewResume.projects && (
                        <div className="space-y-2">
                          <span className="font-bold text-zinc-900 border-b border-zinc-300 block uppercase tracking-wider text-[10.5px]">Projects</span>
                          <div className="space-y-2">
                            {parseProjects(previewResume.projects).map((proj, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <span className="font-bold text-zinc-900 block">{proj.title}</span>
                                <p>{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {previewResume.education && (
                        <div className="space-y-1">
                          <span className="font-bold text-zinc-900 border-b border-zinc-300 block uppercase tracking-wider text-[10.5px]">Education</span>
                          {parseEducation(previewResume.education).map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-baseline">
                              <div>
                                <span className="font-semibold text-zinc-900">{edu.degree}</span>
                                <span className="text-zinc-650 text-[9.5px]"> — {edu.school}</span>
                              </div>
                              <span className="font-mono text-zinc-550 text-[9.5px]">{edu.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-800 pt-3 flex justify-end shrink-0">
              <button 
                onClick={() => {
                  setPreviewResume(null);
                  setPreviewResumeName('');
                }} 
                className="bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT RESUME ENTRY */}
      {showEditEntryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-xl w-full space-y-4 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 shrink-0">
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-sm">
                  {editingEntryIndex !== null ? 'Modify Entry' : 'Create Entry'} ({editingEntryType === 'experience' ? 'Work Experience' : editingEntryType === 'education' ? 'Education' : 'Key Project'})
                </span>
                <span className="text-[10px] text-zinc-550 font-medium">Configure item details for A4 canvas rendering</span>
              </div>
              <button 
                onClick={() => setShowEditEntryModal(false)} 
                className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-left scrollbar-thin">
              {/* Title Field (Role / Degree / Project Title) */}
              <div>
                <label className="text-zinc-400 font-bold block mb-1.5 text-[10px] uppercase tracking-wider">
                  {editingEntryType === 'experience' ? 'Job Title / Role' : editingEntryType === 'education' ? 'Degree / Field of Study' : 'Project Title'} *
                </label>
                <input
                  type="text"
                  value={editingEntryData.title}
                  onChange={e => setEditingEntryData({ ...editingEntryData, title: e.target.value })}
                  placeholder={
                    editingEntryType === 'experience' 
                      ? 'e.g. Senior Software Engineer' 
                      : editingEntryType === 'education' 
                        ? 'e.g. B.S. Computer Science' 
                        : 'e.g. Distributed Ledger Platform'
                  }
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Subtitle Field (Company / School) - Only for Exp/Edu */}
              {editingEntryType !== 'project' && (
                <div>
                  <label className="text-zinc-400 font-bold block mb-1.5 text-[10px] uppercase tracking-wider">
                    {editingEntryType === 'experience' ? 'Company Name' : 'School / University'}
                  </label>
                  <input
                    type="text"
                    value={editingEntryData.subtitle}
                    onChange={e => setEditingEntryData({ ...editingEntryData, subtitle: e.target.value })}
                    placeholder={editingEntryType === 'experience' ? 'e.g. Google' : 'e.g. Harvard University'}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              )}

              {/* Duration Dates (Start / End) - Only for Exp/Edu */}
              {editingEntryType !== 'project' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1.5 text-[10px] uppercase tracking-wider">Start Date</label>
                    <input
                      type="text"
                      value={editingEntryData.startDate}
                      onChange={e => setEditingEntryData({ ...editingEntryData, startDate: e.target.value })}
                      placeholder="e.g. Sep 2021"
                      className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1.5 text-[10px] uppercase tracking-wider">End Date</label>
                    <input
                      type="text"
                      value={editingEntryData.endDate}
                      onChange={e => setEditingEntryData({ ...editingEntryData, endDate: e.target.value })}
                      placeholder="e.g. Present"
                      className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Location or GPA - Only for Exp/Edu */}
              {editingEntryType !== 'project' && (
                <div>
                  <label className="text-zinc-400 font-bold block mb-1.5 text-[10px] uppercase tracking-wider">
                    {editingEntryType === 'experience' ? 'Location (Optional)' : 'GPA (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={editingEntryData.location}
                    onChange={e => setEditingEntryData({ ...editingEntryData, location: e.target.value })}
                    placeholder={editingEntryType === 'experience' ? 'e.g. Mountain View, CA' : 'e.g. 3.92 / 4.00'}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              )}

              {/* Description - Only for Exp/Project */}
              {editingEntryType !== 'education' && (
                <div>
                  <label className="text-zinc-400 font-bold block mb-1.5 text-[10px] uppercase tracking-wider">Description</label>
                  <textarea
                    rows={4}
                    value={editingEntryData.description}
                    onChange={e => setEditingEntryData({ ...editingEntryData, description: e.target.value })}
                    placeholder="Enter bullet points (one per line) or summary description..."
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-zinc-200 outline-none focus:border-indigo-500 font-mono text-xs leading-normal"
                  />
                </div>
              )}

              {/* Hidden Checkbox */}
              <div className="flex items-center gap-2.5 pt-1.5">
                <input
                  type="checkbox"
                  id="hide-entry-checkbox"
                  checked={editingEntryData.hidden}
                  onChange={e => setEditingEntryData({ ...editingEntryData, hidden: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="hide-entry-checkbox" className="text-zinc-300 font-semibold cursor-pointer select-none">
                  Hide this entry from the resume (keep in library)
                </label>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-between shrink-0">
              <div>
                {editingEntryIndex !== null && (
                  <button
                    onClick={() => {
                      if (!confirm("Are you sure you want to delete this entry?")) return;
                      if (editingEntryType === 'experience') {
                        const updated = localExp.filter((_, i) => i !== editingEntryIndex);
                        setLocalExp(updated);
                        if (activeResume) {
                          updateResume(activeResume.id, { experience: formatExperience(updated) });
                        }
                      } else if (editingEntryType === 'education') {
                        const updated = localEdu.filter((_, i) => i !== editingEntryIndex);
                        setLocalEdu(updated);
                        if (activeResume) {
                          updateResume(activeResume.id, { education: formatEducation(updated) });
                        }
                      } else if (editingEntryType === 'project') {
                        const updated = localProj.filter((_, i) => i !== editingEntryIndex);
                        setLocalProj(updated);
                        if (activeResume) {
                          updateResume(activeResume.id, { projects: formatProjects(updated) });
                        }
                      }
                      setShowEditEntryModal(false);
                    }}
                    className="bg-rose-950/40 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Entry</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditEntryModal(false)}
                  className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!editingEntryData.title.trim()) {
                      alert("Please fill in the title field.");
                      return;
                    }
                    if (!activeResume) return;

                    if (editingEntryType === 'experience') {
                      const updated = [...localExp];
                      let duration = '';
                      if (editingEntryData.startDate || editingEntryData.endDate) {
                        duration = `${editingEntryData.startDate.trim()}${editingEntryData.endDate ? ' - ' + editingEntryData.endDate.trim() : ''}`;
                      }
                      const entry = {
                        role: editingEntryData.title.trim(),
                        company: editingEntryData.subtitle.trim(),
                        duration,
                        description: editingEntryData.description.trim(),
                        hidden: editingEntryData.hidden
                      };
                      if (editingEntryIndex !== null) {
                        updated[editingEntryIndex] = entry;
                      } else {
                        updated.push(entry);
                      }
                      setLocalExp(updated);
                      updateResume(activeResume.id, { experience: formatExperience(updated) });
                    } else if (editingEntryType === 'education') {
                      const updated = [...localEdu];
                      let duration = '';
                      if (editingEntryData.startDate || editingEntryData.endDate) {
                        duration = `${editingEntryData.startDate.trim()}${editingEntryData.endDate ? ' - ' + editingEntryData.endDate.trim() : ''}`;
                      }
                      const entry = {
                        degree: editingEntryData.title.trim(),
                        school: editingEntryData.subtitle.trim(),
                        duration,
                        gpa: editingEntryData.location.trim(),
                        hidden: editingEntryData.hidden
                      };
                      if (editingEntryIndex !== null) {
                        updated[editingEntryIndex] = entry;
                      } else {
                        updated.push(entry);
                      }
                      setLocalEdu(updated);
                      updateResume(activeResume.id, { education: formatEducation(updated) });
                    } else if (editingEntryType === 'project') {
                      const updated = [...localProj];
                      const entry = {
                        title: editingEntryData.title.trim(),
                        description: editingEntryData.description.trim(),
                        hidden: editingEntryData.hidden
                      };
                      if (editingEntryIndex !== null) {
                        updated[editingEntryIndex] = entry;
                      } else {
                        updated.push(entry);
                      }
                      setLocalProj(updated);
                      updateResume(activeResume.id, { projects: formatProjects(updated) });
                    }
                    setShowEditEntryModal(false);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD RESUME CONTENT */}
      {showAddContentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 animate-scale-in flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 shrink-0">
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-sm">Add Content Section</span>
                <span className="text-[10px] text-zinc-550 font-medium">Select a section to expand and focus the editor</span>
              </div>
              <button 
                onClick={() => setShowAddContentModal(false)} 
                className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { key: 'personal', label: 'Personal Details', icon: User, action: () => setIsEditingPersonal(true) },
                { key: 'summary', label: 'Professional Summary', icon: FileText },
                { key: 'experience', label: 'Work Experience', icon: Briefcase },
                { key: 'education', label: 'Education', icon: BookOpen },
                { key: 'projects', label: 'Key Projects', icon: Code },
                { key: 'skills', label: 'Technical Skills', icon: Database },
                { key: 'certifications', label: 'Certifications', icon: Award }
              ].map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => {
                    if (sec.action) {
                      sec.action();
                    } else {
                      setOpenResumeSections(prev => ({ ...prev, [sec.key]: true }));
                    }
                    setShowAddContentModal(false);
                    
                    // Smooth scroll-navigate to section container
                    setTimeout(() => {
                      const el = document.getElementById(`section-${sec.key}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add highlight animations
                        el.classList.add('ring-2', 'ring-indigo-500/80', 'ring-offset-2', 'ring-offset-zinc-950');
                        setTimeout(() => {
                          el.classList.remove('ring-2', 'ring-indigo-500/80', 'ring-offset-2', 'ring-offset-zinc-950');
                        }, 1200);
                      }
                    }, 150);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/20 hover:bg-zinc-800/40 hover:border-zinc-700 transition cursor-pointer text-left font-semibold text-zinc-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center text-indigo-400">
                    <sec.icon className="w-4 h-4" />
                  </div>
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-end shrink-0">
              <button
                onClick={() => setShowAddContentModal(false)}
                className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
