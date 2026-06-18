import React, { useState, useEffect } from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';
import { 
  User, FileText, Briefcase, GraduationCap, 
  Award, BookOpen, Languages, Plus, Trash2, 
  EyeOff, Eye, ChevronUp, ChevronDown, Upload, Image 
} from 'lucide-react';

// Compatibility Parsers
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
    return { role: '', company: '', duration: '', description: text, hidden: isHidden };
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
      return { school, degree: degree.trim(), duration, gpa, hidden: isHidden };
    }
    return { school: text, degree: '', duration: '', gpa: '', hidden: isHidden };
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
    return { title: '', description: text, hidden: isHidden };
  });
}

function formatProjects(items: ParsedProject[]): string {
  return items.map(item => {
    const prefix = item.hidden ? '[HIDDEN] ' : '';
    if (!item.title) return `${prefix}${item.description}`;
    return `${prefix}${item.title}: ${item.description}`;
  }).join('\n');
}

interface EditorContentProps {
  activeResume: ResumeVersion;
  userProfile: UserProfile;
  onUpdateResume: (updates: Partial<ResumeVersion>) => void;
}

type TabType = 'personal' | 'skills' | 'experience' | 'education' | 'credentials' | 'extras';

export const EditorContent: React.FC<EditorContentProps> = ({
  activeResume,
  userProfile,
  onUpdateResume
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  // Local parsed array states for list items
  const [expList, setExpList] = useState<ParsedExperience[]>([]);
  const [eduList, setEduList] = useState<ParsedEducation[]>([]);
  const [projList, setProjList] = useState<ParsedProject[]>([]);

  // Initialize arrays when active resume loads/switches
  useEffect(() => {
    if (activeResume) {
      setExpList(parseExperience(activeResume.experience || ''));
      setEduList(parseEducation(activeResume.education || ''));
      setProjList(parseProjects(activeResume.projects || ''));
    }
  }, [activeResume.id]);

  // Sync back local array edits to parent resume strings
  const syncExperience = (list: ParsedExperience[]) => {
    setExpList(list);
    onUpdateResume({ experience: formatExperience(list) });
  };

  const syncEducation = (list: ParsedEducation[]) => {
    setEduList(list);
    onUpdateResume({ education: formatEducation(list) });
  };

  const syncProjects = (list: ParsedProject[]) => {
    setProjList(list);
    onUpdateResume({ projects: formatProjects(list) });
  };

  // Image upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateResume({ personalPhoto: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Array item helpers (Achievements, CertificationsList, LanguagesList, etc.)
  const addItem = (field: keyof ResumeVersion, defaultObj: any) => {
    const list = (activeResume[field] as any[]) || [];
    onUpdateResume({ [field]: [...list, { id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...defaultObj }] });
  };

  const removeItem = (field: keyof ResumeVersion, id: string) => {
    const list = (activeResume[field] as any[]) || [];
    onUpdateResume({ [field]: list.filter((i: any) => i.id !== id) });
  };

  const updateItem = (field: keyof ResumeVersion, id: string, updates: any) => {
    const list = (activeResume[field] as any[]) || [];
    onUpdateResume({ [field]: list.map((i: any) => i.id === id ? { ...i, ...updates } : i) });
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-850">
        {[
          { id: 'personal', label: 'Info & Photo', icon: User },
          { id: 'skills', label: 'Summary & Skills', icon: FileText },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'education', label: 'Edu & Projects', icon: GraduationCap },
          { id: 'credentials', label: 'Credentials', icon: Award },
          { id: 'extras', label: 'Extras', icon: BookOpen }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PERSONAL INFORMATION & PHOTO */}
      {activeTab === 'personal' && (
        <div className="space-y-4 animate-fade-in">
          {/* Photo Management Grid */}
          <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Profile Photo Customizer</span>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview Container */}
              <div 
                className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative group"
                style={{ borderRadius: activeResume.photoStyle === 'circle' ? '50%' : '12px' }}
              >
                {activeResume.personalPhoto ? (
                  <img src={activeResume.personalPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 text-zinc-700" />
                )}
              </div>
              
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex flex-wrap gap-2 items-center">
                  <label className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {activeResume.personalPhoto && (
                    <button
                      onClick={() => onUpdateResume({ personalPhoto: '' })}
                      className="text-xs font-bold text-rose-500 hover:bg-rose-955/20 border border-transparent hover:border-rose-900/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400">
                    <input 
                      type="checkbox" 
                      checked={!!activeResume.showPhoto} 
                      onChange={e => onUpdateResume({ showPhoto: e.target.checked })} 
                      className="rounded accent-indigo-650"
                    />
                    <span>Show in Resume</span>
                  </label>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-550 font-bold text-[9px] uppercase">Style:</span>
                    <select
                      value={activeResume.photoStyle || 'circle'}
                      onChange={e => onUpdateResume({ photoStyle: e.target.value as any })}
                      className="bg-zinc-950 border border-zinc-800 text-[10px] rounded p-1 text-zinc-300 outline-none"
                    >
                      <option value="circle">Circular</option>
                      <option value="square">Square</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-zinc-550 font-bold text-[9px] uppercase shrink-0">Photo Size:</span>
                  <input
                    type="range"
                    min={40}
                    max={150}
                    value={activeResume.photoSize || 80}
                    onChange={e => onUpdateResume({ photoSize: parseInt(e.target.value) })}
                    className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                  />
                  <span className="text-[10px] font-mono text-zinc-400 w-8">{activeResume.photoSize || 80}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Fields Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Full Name', field: 'personalName', placeholder: 'Enter Full Name' },
              { label: 'Job Title / Headline', field: 'personalTitle', placeholder: 'Enter Job Title' },
              { label: 'Email Address', field: 'personalEmail', placeholder: 'Enter Email Address' },
              { label: 'Phone Number', field: 'personalPhone', placeholder: 'Enter Phone Number' },
              { label: 'Location / City', field: 'personalLocation', placeholder: 'Enter Location Preference' },
              { label: 'LinkedIn Profile', field: 'personalLinkedin', placeholder: 'linkedin.com/in/username' },
              { label: 'GitHub Link', field: 'personalGithub', placeholder: 'github.com/username' },
              { label: 'Portfolio Link', field: 'personalPortfolio', placeholder: 'yourportfolio.dev' }
            ].map(col => (
              <div key={col.field}>
                <label className="text-zinc-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">{col.label}</label>
                <input
                  type="text"
                  placeholder={col.placeholder}
                  value={activeResume[col.field as keyof ResumeVersion] as string || ''}
                  onChange={e => onUpdateResume({ [col.field]: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-250 outline-none focus:border-indigo-500 transition text-[11px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUMMARY & TECHNICAL SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div>
            <label className="text-zinc-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">Professional Summary</label>
            <textarea
              placeholder="Write a professional summary matching your SDE targets..."
              value={activeResume.summary || ''}
              onChange={e => onUpdateResume({ summary: e.target.value })}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 outline-none focus:border-indigo-500 transition text-[11px] leading-relaxed"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">Technical Skills (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Next.js, Node.js, Python, AWS, Docker"
              value={activeResume.skills || ''}
              onChange={e => onUpdateResume({ skills: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-250 outline-none focus:border-indigo-500 transition text-[11px]"
            />
          </div>
        </div>
      )}

      {/* TAB 3: WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Work Experience Blocks</span>
            <button
              onClick={() => {
                const newExp: ParsedExperience = { role: 'Software Engineer', company: 'New Company', duration: '2024 - Present', description: 'Developed core system structures.' };
                syncExperience([...expList, newExp]);
              }}
              className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-bold text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Work</span>
            </button>
          </div>

          {expList.length === 0 ? (
            <div className="text-center py-6 text-zinc-550 text-[11px] border border-dashed border-zinc-850 rounded-xl italic">
              No experience blocks added. Click "+ Add Work" to start.
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
              {expList.map((exp, idx) => (
                <div key={idx} className="bg-zinc-955 border border-zinc-850 p-3 rounded-xl space-y-2 relative">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                    <span className="text-[10px] font-bold text-indigo-400">Experience #{idx + 1}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          const list = [...expList];
                          list[idx].hidden = !list[idx].hidden;
                          syncExperience(list);
                        }}
                        className="text-zinc-500 hover:text-zinc-350 cursor-pointer"
                        title="Toggle Visibility"
                      >
                        {exp.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          const list = expList.filter((_, i) => i !== idx);
                          syncExperience(list);
                        }}
                        className="text-rose-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Role (e.g. SDE)"
                      value={exp.role}
                      onChange={e => {
                        const list = [...expList];
                        list[idx].role = e.target.value;
                        syncExperience(list);
                      }}
                      className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-350 outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={e => {
                        const list = [...expList];
                        list[idx].company = e.target.value;
                        syncExperience(list);
                      }}
                      className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-350 outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={exp.duration}
                      onChange={e => {
                        const list = [...expList];
                        list[idx].duration = e.target.value;
                        syncExperience(list);
                      }}
                      className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-350 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <textarea
                    placeholder="Describe achievements, queries, scalable configurations..."
                    value={exp.description}
                    onChange={e => {
                      const list = [...expList];
                      list[idx].description = e.target.value;
                      syncExperience(list);
                    }}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px] text-zinc-300 font-mono outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EDUCATION & PROJECTS */}
      {activeTab === 'education' && (
        <div className="space-y-4 animate-fade-in">
          {/* Education list */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Education Degrees</span>
              <button
                onClick={() => {
                  const newEdu: ParsedEducation = { school: 'University Name', degree: 'B.S. Computer Science', duration: '2020 - 2024', gpa: '3.8' };
                  syncEducation([...eduList, newEdu]);
                }}
                className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-bold text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add School</span>
              </button>
            </div>
            {eduList.length === 0 ? (
              <div className="text-center py-4 text-zinc-550 text-[10px] border border-dashed border-zinc-850 rounded-xl italic">
                No education details present.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                {eduList.map((edu, idx) => (
                  <div key={idx} className="bg-zinc-955 border border-zinc-850 p-2.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                      <span className="text-[9px] font-bold text-zinc-500">Degree #{idx + 1}</span>
                      <button
                        onClick={() => syncEducation(eduList.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                      <input
                        type="text"
                        placeholder="School"
                        value={edu.school}
                        onChange={e => {
                          const list = [...eduList];
                          list[idx].school = e.target.value;
                          syncEducation(list);
                        }}
                        className="col-span-2 bg-zinc-950 border border-zinc-800 rounded p-1 text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={e => {
                          const list = [...eduList];
                          list[idx].degree = e.target.value;
                          syncEducation(list);
                        }}
                        className="col-span-2 bg-zinc-950 border border-zinc-800 rounded p-1 text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={edu.duration}
                        onChange={e => {
                          const list = [...eduList];
                          list[idx].duration = e.target.value;
                          syncEducation(list);
                        }}
                        className="col-span-3 bg-zinc-950 border border-zinc-800 rounded p-1 text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="GPA"
                        value={edu.gpa}
                        onChange={e => {
                          const list = [...eduList];
                          list[idx].gpa = e.target.value;
                          syncEducation(list);
                        }}
                        className="bg-zinc-950 border border-zinc-800 rounded p-1 text-zinc-300 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects list */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Key Projects</span>
              <button
                onClick={() => {
                  const newProj: ParsedProject = { title: 'Project Title', description: 'Built an analytical pipeline scaling to 10K requests.' };
                  syncProjects([...projList, newProj]);
                }}
                className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-bold text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>
            {projList.length === 0 ? (
              <div className="text-center py-4 text-zinc-550 text-[10px] border border-dashed border-zinc-850 rounded-xl italic">
                No projects added.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                {projList.map((proj, idx) => (
                  <div key={idx} className="bg-zinc-955 border border-zinc-850 p-2.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={proj.title}
                        onChange={e => {
                          const list = [...projList];
                          list[idx].title = e.target.value;
                          syncProjects(list);
                        }}
                        className="bg-transparent font-bold text-zinc-300 outline-none w-3/4 border-b border-transparent hover:border-zinc-800 focus:border-indigo-500 text-[11px]"
                      />
                      <button
                        onClick={() => syncProjects(projList.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      placeholder="Write brief description..."
                      value={proj.description}
                      onChange={e => {
                        const list = [...projList];
                        list[idx].description = e.target.value;
                        syncProjects(list);
                      }}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px] text-zinc-300 font-mono outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CREDENTIALS (Certifications, Achievements, Publications) */}
      {activeTab === 'credentials' && (
        <div className="space-y-4 animate-fade-in text-xs">
          {/* Certifications list */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Certifications Details</span>
              <button
                onClick={() => addItem('certificationsList', { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2024', credentialId: 'AWS-10293' })}
                className="bg-indigo-650 hover:bg-indigo-550 text-[9px] font-bold text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Cert</span>
              </button>
            </div>
            <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
              {((activeResume.certificationsList) || []).map((cert: any) => (
                <div key={cert.id} className="bg-zinc-955 border border-zinc-850 p-2.5 rounded-xl grid grid-cols-4 gap-1.5">
                  <input
                    type="text"
                    placeholder="Name"
                    value={cert.name}
                    onChange={e => updateItem('certificationsList', cert.id, { name: e.target.value })}
                    className="col-span-2 bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Issuer"
                    value={cert.issuer}
                    onChange={e => updateItem('certificationsList', cert.id, { issuer: e.target.value })}
                    className="col-span-2 bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Date"
                    value={cert.date}
                    onChange={e => updateItem('certificationsList', cert.id, { date: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Credential ID"
                    value={cert.credentialId}
                    onChange={e => updateItem('certificationsList', cert.id, { credentialId: e.target.value })}
                    className="col-span-2 bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none"
                  />
                  <button
                    onClick={() => removeItem('certificationsList', cert.id)}
                    className="text-rose-500 hover:text-rose-455 flex items-center justify-center border border-zinc-800 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements list */}
          <div className="space-y-2 pt-2 border-t border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Achievements & Honors</span>
              <button
                onClick={() => addItem('achievementsList', { title: 'Hackathon Winner', description: 'First place out of 100+ teams.' })}
                className="bg-indigo-650 hover:bg-indigo-550 text-[9px] font-bold text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Achievement</span>
              </button>
            </div>
            <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
              {((activeResume.achievementsList) || []).map((ach: any) => (
                <div key={ach.id} className="bg-zinc-955 border border-zinc-850 p-2.5 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      placeholder="Achievement Title"
                      value={ach.title}
                      onChange={e => updateItem('achievementsList', ach.id, { title: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none w-3/4"
                    />
                    <button
                      onClick={() => removeItem('achievementsList', ach.id)}
                      className="text-rose-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Brief description..."
                    value={ach.description}
                    onChange={e => updateItem('achievementsList', ach.id, { description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: EXTRAS (Languages, Interests, References, Custom) */}
      {activeTab === 'extras' && (
        <div className="space-y-4 animate-fade-in text-xs">
          {/* Publications & Languages row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Languages list */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Languages</span>
                <button
                  onClick={() => addItem('languagesList', { language: 'Spanish', proficiency: 'Professional Working' })}
                  className="bg-indigo-650 hover:bg-indigo-550 text-[9px] font-bold text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
              <div className="space-y-1.5 max-h-[130px] overflow-y-auto scrollbar-thin">
                {((activeResume.languagesList) || []).map((lang: any) => (
                  <div key={lang.id} className="flex gap-1.5 items-center bg-zinc-955 border border-zinc-850 p-1.5 rounded-lg">
                    <input
                      type="text"
                      placeholder="Language"
                      value={lang.language}
                      onChange={e => updateItem('languagesList', lang.id, { language: e.target.value })}
                      className="w-1/2 bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Proficiency"
                      value={lang.proficiency}
                      onChange={e => updateItem('languagesList', lang.id, { proficiency: e.target.value })}
                      className="w-1/2 bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none"
                    />
                    <button
                      onClick={() => removeItem('languagesList', lang.id)}
                      className="text-rose-500 hover:text-rose-400 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* References list */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">References</span>
                <button
                  onClick={() => addItem('referencesList', { name: 'Reference Name', position: 'Lead Architect', company: 'Google', contact: 'ref@google.com' })}
                  className="bg-indigo-650 hover:bg-indigo-550 text-[9px] font-bold text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
              <div className="space-y-1.5 max-h-[130px] overflow-y-auto scrollbar-thin">
                {((activeResume.referencesList) || []).map((ref: any) => (
                  <div key={ref.id} className="bg-zinc-955 border border-zinc-850 p-2 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        placeholder="Name"
                        value={ref.name}
                        onChange={e => updateItem('referencesList', ref.id, { name: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none w-3/4"
                      />
                      <button
                        onClick={() => removeItem('referencesList', ref.id)}
                        className="text-rose-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        type="text"
                        placeholder="Role"
                        value={ref.position}
                        onChange={e => updateItem('referencesList', ref.id, { position: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded p-1 text-[9px] text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={ref.company}
                        onChange={e => updateItem('referencesList', ref.id, { company: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded p-1 text-[9px] text-zinc-300 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Contact"
                        value={ref.contact}
                        onChange={e => updateItem('referencesList', ref.id, { contact: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded p-1 text-[9px] text-zinc-300 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
