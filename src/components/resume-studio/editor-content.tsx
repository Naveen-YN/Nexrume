import React, { useState, useEffect, useRef } from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';
import { 
  User, Mail, Phone, MapPin, Globe, Award, BookOpen, 
  Briefcase, GraduationCap, Code, Plus, Trash2, EyeOff, 
  Eye, ChevronUp, ChevronDown, Upload, Image, GripVertical, 
  Copy, Edit3, Check, Calendar, Shield, Clock, Info, Heart, 
  Bookmark, CheckCircle, Trophy, Users, Landmark, PenTool, 
  Compass, Library, ExternalLink, RefreshCw
} from 'lucide-react';
import { AddContentModal } from './add-content-modal';

interface EditorContentProps {
  activeResume: ResumeVersion;
  userProfile: UserProfile;
  onUpdateResume: (updates: Partial<ResumeVersion>) => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  activeResume,
  userProfile,
  onUpdateResume
}) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true
  });
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  
  // Drag & Drop items
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [draggedEntryIndex, setDraggedEntryIndex] = useState<number | null>(null);

  // Profile photo drag & drop states
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEditorFieldValue = (field: string) => {
    const val = activeResume[field as keyof ResumeVersion];
    if (val !== undefined) return val as string;
    switch (field) {
      case 'personalName': return userProfile.name || '';
      case 'personalTitle': return userProfile.experience || '';
      case 'personalEmail': return userProfile.email || '';
      case 'personalPhone': return userProfile.phone || '';
      case 'personalLocation': return userProfile.location || '';
      default: return '';
    }
  };


  // Optional personal fields list
  const allOptionalFields = [
    { field: 'linkedin', label: 'LinkedIn', placeholder: 'e.g. linkedin.com/in/username' },
    { field: 'github', label: 'GitHub', placeholder: 'e.g. github.com/username' },
    { field: 'portfolio', label: 'Portfolio', placeholder: 'e.g. portfolio.dev' },
    { field: 'leetcode', label: 'LeetCode', placeholder: 'e.g. leetcode.com/username' },
    { field: 'codechef', label: 'CodeChef', placeholder: 'e.g. codechef.com/users/username' },
    { field: 'hackerrank', label: 'HackerRank', placeholder: 'e.g. hackerrank.com/username' },
    { field: 'website', label: 'Website', placeholder: 'e.g. mywebsite.com' },
    { field: 'nationality', label: 'Nationality', placeholder: 'e.g. Indian, American' },
    { field: 'dob', label: 'Date of Birth', placeholder: 'e.g. 24 Jan 2000' },
    { field: 'visa', label: 'Visa Status', placeholder: 'e.g. H-1B, F-1 OPT, Citizen' },
    { field: 'availability', label: 'Availability', placeholder: 'e.g. Immediate, 1 Month' },
    { field: 'custom', label: 'Custom Field', placeholder: 'e.g. Custom details' }
  ];

  const socialFields = activeResume.socialFields || [];

  // Toggle section collapse
  const toggleSectionCollapse = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle entry collapse
  const toggleEntryCollapse = (id: string) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Profile Photo handlers
  const handlePhotoFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateResume({ 
        personalPhoto: event.target?.result as string,
        showPhoto: true 
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFile(file);
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPhotoDragging(true);
  };

  const handlePhotoDragLeave = () => {
    setIsPhotoDragging(false);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPhotoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePhotoFile(file);
  };

  // Social Contact Fields Management
  const addSocialField = (fieldKey: string) => {
    const fieldConfig = allOptionalFields.find(f => f.field === fieldKey);
    if (!fieldConfig) return;

    // Check if already exists
    if (socialFields.some(f => f.field === fieldKey)) return;

    const newField = {
      id: `social-${Date.now()}`,
      field: fieldKey,
      label: fieldConfig.label,
      value: '',
      hidden: false
    };

    onUpdateResume({
      socialFields: [...socialFields, newField]
    });
  };

  const updateSocialFieldVal = (id: string, value: string) => {
    onUpdateResume({
      socialFields: socialFields.map(f => f.id === id ? { ...f, value } : f)
    });
  };

  const updateSocialFieldLabel = (id: string, label: string) => {
    onUpdateResume({
      socialFields: socialFields.map(f => f.id === id ? { ...f, label } : f)
    });
  };

  const toggleSocialFieldHide = (id: string) => {
    onUpdateResume({
      socialFields: socialFields.map(f => f.id === id ? { ...f, hidden: !f.hidden } : f)
    });
  };

  const removeSocialField = (id: string) => {
    onUpdateResume({
      socialFields: socialFields.filter(f => f.id !== id)
    });
  };

  const moveSocialField = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= socialFields.length) return;
    const list = [...socialFields];
    const temp = list[index];
    list[index] = list[nextIdx];
    list[nextIdx] = temp;
    onUpdateResume({ socialFields: list });
  };

  // Section Ordering Management
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...(activeResume.sectionOrder || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    onUpdateResume({ sectionOrder: list });
  };

  const deleteSection = (sectionId: string) => {
    if (window.confirm(`Are you sure you want to remove the entire "${getSectionTitle(sectionId)}" section?`)) {
      onUpdateResume({
        sectionOrder: (activeResume.sectionOrder || []).filter(s => s !== sectionId)
      });
    }
  };

  const duplicateSection = (sectionId: string) => {
    const title = prompt("Enter title for the duplicated custom section:", `${getSectionTitle(sectionId)} Copy`);
    if (!title) return;
    
    const id = `custom-${Date.now()}`;
    const newCustoms = [...(activeResume.customSections || []), {
      id,
      title,
      content: ''
    }];

    onUpdateResume({
      customSections: newCustoms,
      sectionOrder: [...(activeResume.sectionOrder || []), id]
    });
  };

  const renameSectionInline = (sectionId: string, newName: string) => {
    // If custom section, update its title in customSections array
    if (sectionId.startsWith('custom-')) {
      onUpdateResume({
        customSections: (activeResume.customSections || []).map(cs => 
          cs.id === sectionId ? { ...cs, title: newName } : cs
        )
      });
    }
  };

  const getSectionTitle = (id: string) => {
    if (id.startsWith('custom-')) {
      const found = (activeResume.customSections || []).find(cs => cs.id === id);
      return found?.title || 'Custom Section';
    }
    return {
      summary: 'Professional Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Technical Skills',
      projects: 'Key Projects',
      certifications: 'Certifications',
      achievements: 'Achievements & Honors',
      publications: 'Publications',
      languages: 'Languages',
      interests: 'Interests',
      references: 'References',
      awards: 'Awards & Honors',
      organizations: 'Organizations',
      courses: 'Courses',
      volunteering: 'Volunteering',
      declaration: 'Declaration',
      signature: 'Signature',
      patents: 'Patents',
      hobbies: 'Hobbies',
      'custom-section': 'Custom Section'
    }[id] || id;
  };

  // Section drag handlers
  const handleSectionDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleSectionDrop = (dropIndex: number) => {
    if (draggedSectionIndex === null || draggedSectionIndex === dropIndex) return;
    const list = [...(activeResume.sectionOrder || [])];
    const draggedItem = list[draggedSectionIndex];
    list.splice(draggedSectionIndex, 1);
    list.splice(dropIndex, 0, draggedItem);
    onUpdateResume({ sectionOrder: list });
    setDraggedSectionIndex(null);
  };

  // Entry CRUD Helpers
  const addListEntry = (field: keyof ResumeVersion, defaultObj: any) => {
    const list = (activeResume[field] as any[]) || [];
    const newEntryId = `entry-${Date.now()}`;
    onUpdateResume({
      [field]: [...list, { id: newEntryId, ...defaultObj, hidden: false }]
    });
    toggleEntryCollapse(newEntryId);
  };

  const updateListEntry = (field: keyof ResumeVersion, id: string, updates: any) => {
    const list = (activeResume[field] as any[]) || [];
    onUpdateResume({
      [field]: list.map((item: any) => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const deleteListEntry = (field: keyof ResumeVersion, id: string) => {
    const list = (activeResume[field] as any[]) || [];
    onUpdateResume({
      [field]: list.filter((item: any) => item.id !== id)
    });
  };

  const duplicateListEntry = (field: keyof ResumeVersion, entry: any) => {
    const list = (activeResume[field] as any[]) || [];
    const newEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      hidden: false
    };
    onUpdateResume({
      [field]: [...list, newEntry]
    });
  };

  const moveListEntry = (field: keyof ResumeVersion, index: number, direction: 'up' | 'down') => {
    const list = (activeResume[field] as any[]) || [];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    onUpdateResume({ [field]: list });
  };

  // Helper parsers for legacy fields
  const parseLegacyList = (text: string, type: 'exp' | 'edu' | 'proj') => {
    if (!text) return [];
    const lines = text.split('\n').filter(l => l.trim() !== '');
    return lines.map((line, idx) => {
      let isHidden = false;
      let cleanLine = line.trim();
      if (cleanLine.startsWith('[HIDDEN]')) {
        isHidden = true;
        cleanLine = cleanLine.substring(8).trim();
      }

      if (type === 'exp') {
        const match = cleanLine.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\):\s*(.+)$/);
        if (match) {
          return { id: `exp-${idx}`, role: match[1].trim(), company: match[2].trim(), duration: match[3].trim(), description: match[4].trim(), hidden: isHidden };
        }
        return { id: `exp-${idx}`, role: '', company: '', duration: '', description: cleanLine, hidden: isHidden };
      }

      if (type === 'edu') {
        const parts = cleanLine.split(' - ');
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
          return { id: `edu-${idx}`, school, degree: degree.trim(), duration, gpa, hidden: isHidden };
        }
        return { id: `edu-${idx}`, school: cleanLine, degree: '', duration: '', gpa: '', hidden: isHidden };
      }

      // Proj
      const colonIndex = cleanLine.indexOf(':');
      if (colonIndex > 0) {
        return {
          id: `proj-${idx}`,
          title: cleanLine.substring(0, colonIndex).trim(),
          description: cleanLine.substring(colonIndex + 1).trim(),
          hidden: isHidden
        };
      }
      return { id: `proj-${idx}`, title: '', description: cleanLine, hidden: isHidden };
    });
  };

  const syncLegacyList = (list: any[], type: 'exp' | 'edu' | 'proj') => {
    if (type === 'exp') {
      const expStr = list.map(item => {
        const prefix = item.hidden ? '[HIDDEN] ' : '';
        if (!item.role && !item.company) return `${prefix}${item.description}`;
        const durationStr = item.duration ? ` (${item.duration})` : '';
        return `${prefix}${item.role} at ${item.company}${durationStr}: ${item.description}`;
      }).join('\n');
      onUpdateResume({ experience: expStr });
    }
    
    if (type === 'edu') {
      const eduStr = list.map(item => {
        if (!item.school) return '';
        const prefix = item.hidden ? '[HIDDEN] ' : '';
        let str = prefix + item.school;
        if (item.degree) str += ` - ${item.degree}`;
        if (item.duration) str += ` (${item.duration})`;
        if (item.gpa) str += ` (GPA ${item.gpa})`;
        return str;
      }).filter(Boolean).join('\n');
      onUpdateResume({ education: eduStr });
    }

    if (type === 'proj') {
      const projStr = list.map(item => {
        const prefix = item.hidden ? '[HIDDEN] ' : '';
        if (!item.title) return `${prefix}${item.description}`;
        return `${prefix}${item.title}: ${item.description}`;
      }).join('\n');
      onUpdateResume({ projects: projStr });
    }
  };

  // Legacy array mappings for easier rendering
  const expList = parseLegacyList(activeResume.experience || '', 'exp');
  const eduList = parseLegacyList(activeResume.education || '', 'edu');
  const projList = parseLegacyList(activeResume.projects || '', 'proj');

  return (
    <div className="space-y-6">
      
      {/* 1. PERSONAL DETAILS CARD */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-sm">
        {/* Header bar */}
        <button 
          onClick={() => toggleSectionCollapse('personal')}
          className="w-full flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-850 hover:bg-zinc-850/60 transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">Personal Information & Photo</span>
          </div>
          <div>
            {expandedSections.personal ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </div>
        </button>

        {expandedSections.personal && (
          <div className="p-5 space-y-5 animate-fade-in text-xs">
            {/* Profile Photo Editor Block */}
            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-4">
              <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider">Profile Photo</span>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Drag and Drop preview circle */}
                <div 
                  onDragOver={handlePhotoDragOver}
                  onDragLeave={handlePhotoDragLeave}
                  onDrop={handlePhotoDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer group transition-all duration-300 ${
                    isPhotoDragging ? 'border-indigo-500 bg-indigo-950/20' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                  style={{ borderRadius: activeResume.photoStyle === 'circle' ? '50%' : activeResume.photoStyle === 'rounded' ? '16px' : '0px' }}
                >
                  {activeResume.personalPhoto ? (
                    <img 
                      src={activeResume.personalPhoto} 
                      alt="Preview" 
                      className="w-full h-full object-cover pointer-events-none select-none"
                    />
                  ) : (
                    <div className="text-center p-2 text-zinc-650 flex flex-col items-center gap-1.5 select-none pointer-events-none">
                      <Image className="w-6 h-6" />
                      <span className="text-[8px] font-black uppercase tracking-wider">Drag here</span>
                    </div>
                  )}
                  {/* Overlay upload prompt */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition select-none">
                    <Upload className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[10px] font-black uppercase tracking-wider text-zinc-300 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{activeResume.personalPhoto ? 'Replace Image' : 'Select Image'}</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                    
                    {activeResume.personalPhoto && (
                      <button
                        onClick={() => onUpdateResume({ personalPhoto: '' })}
                        className="bg-zinc-950 border border-transparent hover:border-rose-900/35 hover:bg-rose-955/20 text-[10px] font-black uppercase tracking-wider text-rose-500 px-3 py-2 rounded-lg transition cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-400 select-none">
                      <input 
                        type="checkbox" 
                        checked={!!activeResume.showPhoto} 
                        onChange={e => onUpdateResume({ showPhoto: e.target.checked })} 
                        className="rounded accent-indigo-650"
                      />
                      <span>Show Photo in Resume</span>
                    </label>

                    {/* Shapes */}
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-zinc-550 font-black text-[9px] uppercase tracking-wider">Shape:</span>
                      <div className="flex bg-zinc-950 p-0.5 rounded border border-zinc-800 text-[9px] font-black uppercase tracking-wider">
                        {[
                          { id: 'circle', label: 'Circle' },
                          { id: 'rounded', label: 'Rounded' },
                          { id: 'square', label: 'Square' }
                        ].map(shape => (
                          <button
                            key={shape.id}
                            onClick={() => onUpdateResume({ photoStyle: shape.id as any })}
                            className={`px-2 py-1 rounded cursor-pointer transition ${
                              (activeResume.photoStyle || 'circle') === shape.id 
                                ? 'bg-indigo-650 text-white shadow' 
                                : 'text-zinc-550 hover:text-zinc-350'
                            }`}
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Size slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-555 font-black text-[9px] uppercase tracking-wider shrink-0">Photo Size:</span>
                    <input
                      type="range"
                      min={40}
                      max={150}
                      value={activeResume.photoSize || 80}
                      onChange={e => onUpdateResume({ photoSize: parseInt(e.target.value) })}
                      className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                    />
                    <span className="text-[10px] font-mono text-zinc-400 w-10 shrink-0">{activeResume.photoSize || 80}px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core details fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', field: 'personalName', placeholder: 'e.g. Alex Dev' },
                { label: 'Job Title / Professional Headline', field: 'personalTitle', placeholder: 'e.g. Senior Software Engineer' },
                { label: 'Email Address', field: 'personalEmail', placeholder: 'e.g. alex.dev@gmail.com' },
                { label: 'Phone Number', field: 'personalPhone', placeholder: 'e.g. +1 (555) 019-2834' },
                { label: 'Location / Address', field: 'personalLocation', placeholder: 'e.g. San Francisco, CA' }
              ].map(col => (
                <div key={col.field} className="space-y-1">
                  <label className="text-zinc-450 font-black block text-[10px] uppercase tracking-wider">{col.label}</label>
                  <input
                    type="text"
                    placeholder={col.placeholder}
                    value={getEditorFieldValue(col.field)}
                    onChange={e => onUpdateResume({ [col.field]: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                  />
                </div>
              ))}
            </div>

            {/* Optional / Dynamic social links */}
            {socialFields.length > 0 && (
              <div className="space-y-3.5 pt-3 border-t border-zinc-900">
                <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider">Additional Contact Channels</span>
                <div className="space-y-2.5">
                  {socialFields.map((field, index) => {
                    const matchedCfg = allOptionalFields.find(f => f.field === field.field);
                    return (
                      <div 
                        key={field.id} 
                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl transition hover:border-zinc-800"
                      >
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            onClick={() => moveSocialField(index, 'up')}
                            disabled={index === 0}
                            className="text-zinc-550 hover:text-zinc-350 p-0.5 disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSocialField(index, 'down')}
                            disabled={index === socialFields.length - 1}
                            className="text-zinc-550 hover:text-zinc-350 p-0.5 disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-24 text-[10px] font-black uppercase text-zinc-400 truncate shrink-0">
                          {field.field === 'custom' ? (
                            <input 
                              type="text"
                              value={field.label}
                              onChange={e => updateSocialFieldLabel(field.id, e.target.value)}
                              className="w-full bg-transparent border-b border-zinc-800 outline-none text-[10px] font-black uppercase text-indigo-400 focus:border-indigo-500"
                            />
                          ) : (
                            field.label
                          )}
                        </div>

                        <input 
                          type="text"
                          placeholder={matchedCfg?.placeholder || 'e.g. details'}
                          value={field.value}
                          onChange={e => updateSocialFieldVal(field.id, e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg p-1.5 text-zinc-300 outline-none focus:border-indigo-500 text-[10.5px]"
                        />

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleSocialFieldHide(field.id)}
                            className="text-zinc-550 hover:text-zinc-350 p-1 cursor-pointer"
                            title={field.hidden ? "Show on Resume" : "Hide from Resume"}
                          >
                            {field.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                          </button>
                          <button
                            onClick={() => removeSocialField(field.id)}
                            className="text-rose-500 hover:text-rose-400 p-1 cursor-pointer"
                            title="Remove field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dropdown to add optional fields */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-550 uppercase tracking-wider">Add fields:</span>
                <div className="flex flex-wrap gap-1.5">
                  {allOptionalFields.map(opt => {
                    const alreadyAdded = socialFields.some(f => f.field === opt.field && opt.field !== 'custom');
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={opt.field}
                        onClick={() => addSocialField(opt.field)}
                        className="bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-[9.5px] text-zinc-400 px-2.5 py-1.5 rounded-lg transition font-semibold cursor-pointer active:scale-[0.98]"
                      >
                        + {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. COLLAPSIBLE SECTIONS LIST */}
      <div className="space-y-4">
        {(activeResume.sectionOrder || []).map((sectionId, secIdx) => {
          const isExpanded = !!expandedSections[sectionId];
          const title = getSectionTitle(sectionId);

          return (
            <div 
              key={sectionId} 
              className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-sm"
              draggable={true}
              onDragStart={() => handleSectionDragStart(secIdx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleSectionDrop(secIdx)}
            >
              {/* Section Header */}
              <div className="flex justify-between items-center bg-zinc-900 border-b border-zinc-850 p-4 select-none">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="cursor-grab active:cursor-grabbing text-zinc-650 hover:text-zinc-400 shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  {/* Inline editable title */}
                  <input
                    type="text"
                    value={title}
                    onChange={e => renameSectionInline(sectionId, e.target.value)}
                    disabled={!sectionId.startsWith('custom-')}
                    className={`bg-transparent text-xs font-black text-white uppercase tracking-wider outline-none border-b border-transparent truncate max-w-sm focus:border-indigo-500 py-0.5 ${
                      sectionId.startsWith('custom-') ? 'hover:border-zinc-800' : 'cursor-default'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  {/* Section Controls */}
                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5">
                    <button
                      onClick={() => moveSection(secIdx, 'up')}
                      disabled={secIdx === 0}
                      className="text-zinc-550 hover:text-zinc-300 p-0.5 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(secIdx, 'down')}
                      disabled={secIdx === (activeResume.sectionOrder || []).length - 1}
                      className="text-zinc-550 hover:text-zinc-300 p-0.5 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => duplicateSection(sectionId)}
                    className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                    title="Duplicate Section"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteSection(sectionId)}
                    className="text-rose-500 hover:text-rose-400 p-1 cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleSectionCollapse(sectionId)}
                    className="text-zinc-500 hover:text-zinc-350 p-1 cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Section Body */}
              {isExpanded && (
                <div className="p-5 animate-fade-in space-y-4">
                  {/* Summary Block */}
                  {sectionId === 'summary' && (
                    <div className="space-y-1.5 text-xs">
                      <label className="text-zinc-450 font-black block text-[10px] uppercase tracking-wider">Profile Summary Details</label>
                      <textarea
                        placeholder="e.g. Results-oriented Software Engineer with 5+ years of experience building scalable systems..."
                        value={activeResume.summary || ''}
                        onChange={e => onUpdateResume({ summary: e.target.value })}
                        rows={5}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px] leading-relaxed font-mono"
                      />
                    </div>
                  )}

                  {/* Skills Block */}
                  {sectionId === 'skills' && (
                    <div className="space-y-1.5 text-xs">
                      <label className="text-zinc-450 font-black block text-[10px] uppercase tracking-wider">Skills Tokens (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Next.js, TypeScript, AWS, Node.js, Docker, Kubernetes"
                        value={activeResume.skills || ''}
                        onChange={e => onUpdateResume({ skills: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px] font-mono"
                      />
                    </div>
                  )}

                  {/* Experience List Block */}
                  {sectionId === 'experience' && (
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-bold">Entries List</span>
                        <button
                          onClick={() => {
                            const newExp = { id: `exp-${Date.now()}`, role: 'Software Engineer', company: 'Employer Name', duration: 'Start Date - End Date', description: 'Developed core services and systems.' };
                            syncLegacyList([...expList, newExp], 'exp');
                          }}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Work Entry</span>
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {expList.map((exp, idx) => {
                          const isEntryExpanded = !!expandedEntries[exp.id];
                          return (
                            <div key={exp.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden">
                              <div className="flex justify-between items-center p-3 bg-zinc-950 select-none">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    exp.hidden ? 'bg-rose-955/20 border-rose-900/30 text-rose-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                  }`}>
                                    {exp.hidden ? 'Hidden' : `Entry #${idx + 1}`}
                                  </span>
                                  <span className="text-[11px] text-zinc-300 font-bold truncate">
                                    {exp.role ? `${exp.role} at ${exp.company}` : (exp.description?.substring(0, 30) || '')}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      const list = [...expList];
                                      list[idx].hidden = !list[idx].hidden;
                                      syncLegacyList(list, 'exp');
                                    }}
                                    className="text-zinc-550 hover:text-zinc-350 p-0.5 cursor-pointer"
                                    title={exp.hidden ? "Show in Resume" : "Hide from Resume"}
                                  >
                                    {exp.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newCopy = { ...exp, id: `exp-copy-${Date.now()}` };
                                      syncLegacyList([...expList, newCopy], 'exp');
                                    }}
                                    className="text-zinc-550 hover:text-zinc-350 p-0.5 cursor-pointer"
                                    title="Duplicate Entry"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      syncLegacyList(expList.filter(item => item.id !== exp.id), 'exp');
                                    }}
                                    className="text-rose-500 hover:text-rose-455 p-0.5 cursor-pointer"
                                    title="Delete Entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => toggleEntryCollapse(exp.id)}
                                    className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                                  >
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {isEntryExpanded && (
                                <div className="p-4 space-y-3 border-t border-zinc-850 text-xs">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">Role</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. Software Engineer"
                                        value={exp.role}
                                        onChange={e => {
                                          const list = [...expList];
                                          list[idx].role = e.target.value;
                                          syncLegacyList(list, 'exp');
                                        }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">Company / Employer</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. Google"
                                        value={exp.company}
                                        onChange={e => {
                                          const list = [...expList];
                                          list[idx].company = e.target.value;
                                          syncLegacyList(list, 'exp');
                                        }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">Duration (Dates | Location)</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. Jan 2022 - Present | NY"
                                        value={exp.duration}
                                        onChange={e => {
                                          const list = [...expList];
                                          list[idx].duration = e.target.value;
                                          syncLegacyList(list, 'exp');
                                        }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-zinc-555 font-black uppercase text-[9px]">Description (separate bullets by newline)</span>
                                    <textarea
                                      placeholder="Wrote scalable query algorithms..."
                                      value={exp.description}
                                      onChange={e => {
                                        const list = [...expList];
                                        list[idx].description = e.target.value;
                                        syncLegacyList(list, 'exp');
                                      }}
                                      rows={3}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 font-mono outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Education List Block */}
                  {sectionId === 'education' && (
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-bold">Entries List</span>
                        <button
                          onClick={() => {
                            const newEdu = { id: `edu-${Date.now()}`, school: 'University Name', degree: 'Degree Name', duration: 'Start Date - End Date', gpa: '' };
                            syncLegacyList([...eduList, newEdu], 'edu');
                          }}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add School</span>
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {eduList.map((edu, idx) => {
                          const isEntryExpanded = !!expandedEntries[edu.id];
                          return (
                            <div key={edu.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden">
                              <div className="flex justify-between items-center p-3 bg-zinc-955 select-none">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    edu.hidden ? 'bg-rose-955/20 border-rose-900/30 text-rose-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                  }`}>
                                    {edu.hidden ? 'Hidden' : `School #${idx + 1}`}
                                  </span>
                                  <span className="text-[11px] text-zinc-300 font-bold truncate">
                                    {edu.school ? `${edu.school} — ${edu.degree}` : 'Empty school details'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      const list = [...eduList];
                                      list[idx].hidden = !list[idx].hidden;
                                      syncLegacyList(list, 'edu');
                                    }}
                                    className="text-zinc-550 hover:text-zinc-350 p-0.5 cursor-pointer"
                                    title={edu.hidden ? "Show in Resume" : "Hide from Resume"}
                                  >
                                    {edu.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newCopy = { ...edu, id: `edu-copy-${Date.now()}` };
                                      syncLegacyList([...eduList, newCopy], 'edu');
                                    }}
                                    className="text-zinc-550 hover:text-zinc-350 p-0.5 cursor-pointer"
                                    title="Duplicate Entry"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      syncLegacyList(eduList.filter(item => item.id !== edu.id), 'edu');
                                    }}
                                    className="text-rose-500 hover:text-rose-455 p-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => toggleEntryCollapse(edu.id)}
                                    className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                                  >
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {isEntryExpanded && (
                                <div className="p-4 space-y-3 border-t border-zinc-850 text-xs">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">School Name</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. Stanford University"
                                        value={edu.school}
                                        onChange={e => {
                                          const list = [...eduList];
                                          list[idx].school = e.target.value;
                                          syncLegacyList(list, 'edu');
                                        }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">Degree / Major</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. B.S. Computer Science"
                                        value={edu.degree}
                                        onChange={e => {
                                          const list = [...eduList];
                                          list[idx].degree = e.target.value;
                                          syncLegacyList(list, 'edu');
                                        }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">Duration (Dates | Location)</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. Sep 2018 - Jun 2022"
                                        value={edu.duration}
                                        onChange={e => {
                                          const list = [...eduList];
                                          list[idx].duration = e.target.value;
                                          syncLegacyList(list, 'edu');
                                        }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">GPA Score</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. 3.9"
                                        value={edu.gpa}
                                        onChange={e => {
                                          const list = [...eduList];
                                          list[idx].gpa = e.target.value;
                                          syncLegacyList(list, 'edu');
                                        }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Projects List Block */}
                  {sectionId === 'projects' && (
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-bold">Entries List</span>
                        <button
                          onClick={() => {
                            const newProj = { id: `proj-${Date.now()}`, title: 'Project Name', description: 'Describe what you built...' };
                            syncLegacyList([...projList, newProj], 'proj');
                          }}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Project</span>
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {projList.map((proj, idx) => {
                          const isEntryExpanded = !!expandedEntries[proj.id];
                          return (
                            <div key={proj.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden">
                              <div className="flex justify-between items-center p-3 bg-zinc-955 select-none">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    proj.hidden ? 'bg-rose-955/20 border-rose-900/30 text-rose-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                  }`}>
                                    {proj.hidden ? 'Hidden' : `Project #${idx + 1}`}
                                  </span>
                                  <span className="text-[11px] text-zinc-300 font-bold truncate">
                                    {proj.title || 'Empty project title'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      const list = [...projList];
                                      list[idx].hidden = !list[idx].hidden;
                                      syncLegacyList(list, 'proj');
                                    }}
                                    className="text-zinc-550 hover:text-zinc-350 p-0.5 cursor-pointer"
                                    title={proj.hidden ? "Show in Resume" : "Hide from Resume"}
                                  >
                                    {proj.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newCopy = { ...proj, id: `proj-copy-${Date.now()}` };
                                      syncLegacyList([...projList, newCopy], 'proj');
                                    }}
                                    className="text-zinc-550 hover:text-zinc-350 p-0.5 cursor-pointer"
                                    title="Duplicate Entry"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      syncLegacyList(projList.filter(item => item.id !== proj.id), 'proj');
                                    }}
                                    className="text-rose-500 hover:text-rose-455 p-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => toggleEntryCollapse(proj.id)}
                                    className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                                  >
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {isEntryExpanded && (
                                <div className="p-4 space-y-3 border-t border-zinc-850 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-zinc-555 font-black uppercase text-[9px]">Project Title</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. E-Commerce Pipeline Platform"
                                      value={proj.title}
                                      onChange={e => {
                                        const list = [...projList];
                                        list[idx].title = e.target.value;
                                        syncLegacyList(list, 'proj');
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-indigo-500 font-bold"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-zinc-555 font-black uppercase text-[9px]">Description & Tech Stack</span>
                                    <textarea
                                      placeholder="Implemented a load balancer scaling to 15k users using Redis, Docker, Node.js..."
                                      value={proj.description}
                                      onChange={e => {
                                        const list = [...projList];
                                        list[idx].description = e.target.value;
                                        syncLegacyList(list, 'proj');
                                      }}
                                      rows={3}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 font-mono outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Certifications Block */}
                  {sectionId === 'certifications' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-550 font-black uppercase">Credentials</span>
                        <button
                          onClick={() => addListEntry('certificationsList', { name: 'New Certificate', issuer: 'Issuer Name', date: 'Date', credentialId: '' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Certificate</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.certificationsList) || []).map((cert: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[cert.id];
                          return (
                            <div key={cert.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{cert.name || `Certificate #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('certificationsList', cert.id, { hidden: !cert.hidden })}
                                    className="text-zinc-550 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {cert.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('certificationsList', cert.id)}
                                    className="text-rose-500 hover:text-rose-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(cert.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 grid grid-cols-2 gap-3 border-t border-zinc-850">
                                  <input
                                    type="text"
                                    placeholder="Certification Name"
                                    value={cert.name}
                                    onChange={e => updateListEntry('certificationsList', cert.id, { name: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Issuer"
                                    value={cert.issuer}
                                    onChange={e => updateListEntry('certificationsList', cert.id, { issuer: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Date"
                                    value={cert.date}
                                    onChange={e => updateListEntry('certificationsList', cert.id, { date: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Credential ID"
                                    value={cert.credentialId}
                                    onChange={e => updateListEntry('certificationsList', cert.id, { credentialId: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Achievements Block */}
                  {sectionId === 'achievements' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-550 font-black uppercase">Achievements</span>
                        <button
                          onClick={() => addListEntry('achievementsList', { title: 'New Achievement', description: '' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Achievement</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.achievementsList) || []).map((ach: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[ach.id];
                          return (
                            <div key={ach.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{ach.title || `Achievement #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('achievementsList', ach.id, { hidden: !ach.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {ach.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('achievementsList', ach.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(ach.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 space-y-2 border-t border-zinc-850">
                                  <input
                                    type="text"
                                    placeholder="Achievement Title"
                                    value={ach.title}
                                    onChange={e => updateListEntry('achievementsList', ach.id, { title: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <textarea
                                    placeholder="Description of the milestone or recognition..."
                                    value={ach.description}
                                    onChange={e => updateListEntry('achievementsList', ach.id, { description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Publications Block */}
                  {sectionId === 'publications' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-550 font-black uppercase">Publications</span>
                        <button
                          onClick={() => addListEntry('publicationsList', { title: 'New Publication', publisher: 'Publisher Name', year: 'YYYY' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Publication</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.publicationsList) || []).map((pub: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[pub.id];
                          return (
                            <div key={pub.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{pub.title || `Publication #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('publicationsList', pub.id, { hidden: !pub.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {pub.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('publicationsList', pub.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(pub.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 grid grid-cols-3 gap-3 border-t border-zinc-850">
                                  <input
                                    type="text"
                                    placeholder="Title"
                                    value={pub.title}
                                    onChange={e => updateListEntry('publicationsList', pub.id, { title: e.target.value })}
                                    className="col-span-2 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Year"
                                    value={pub.year}
                                    onChange={e => updateListEntry('publicationsList', pub.id, { year: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Publisher"
                                    value={pub.publisher}
                                    onChange={e => updateListEntry('publicationsList', pub.id, { publisher: e.target.value })}
                                    className="col-span-3 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Languages Block */}
                  {sectionId === 'languages' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Languages</span>
                        <button
                          onClick={() => addListEntry('languagesList', { language: 'Language Name', proficiency: 'Full Professional' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Language</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.languagesList) || []).map((lang: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[lang.id];
                          return (
                            <div key={lang.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{lang.language || `Language #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('languagesList', lang.id, { hidden: !lang.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {lang.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('languagesList', lang.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(lang.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 grid grid-cols-2 gap-3 border-t border-zinc-850">
                                  <input
                                    type="text"
                                    placeholder="Language"
                                    value={lang.language}
                                    onChange={e => updateListEntry('languagesList', lang.id, { language: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Proficiency Level"
                                    value={lang.proficiency}
                                    onChange={e => updateListEntry('languagesList', lang.id, { proficiency: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* References Block */}
                  {sectionId === 'references' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">References</span>
                        <button
                          onClick={() => addListEntry('referencesList', { name: 'Reference Name', position: 'Position', company: 'Company', contact: 'Contact Info' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Reference</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.referencesList) || []).map((ref: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[ref.id];
                          return (
                            <div key={ref.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{ref.name || `Reference #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('referencesList', ref.id, { hidden: !ref.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {ref.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('referencesList', ref.id)}
                                    className="text-rose-500 hover:text-rose-455 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(ref.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 grid grid-cols-2 gap-3 border-t border-zinc-850">
                                  <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={ref.name}
                                    onChange={e => updateListEntry('referencesList', ref.id, { name: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Position / Title"
                                    value={ref.position}
                                    onChange={e => updateListEntry('referencesList', ref.id, { position: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Company"
                                    value={ref.company}
                                    onChange={e => updateListEntry('referencesList', ref.id, { company: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Contact Email/Phone"
                                    value={ref.contact}
                                    onChange={e => updateListEntry('referencesList', ref.id, { contact: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Awards Block */}
                  {sectionId === 'awards' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Awards & Recognitions</span>
                        <button
                          onClick={() => addListEntry('awardsList', { title: 'Award Title', issuer: 'Issuer Name', date: 'Date', description: '' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Award</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.awardsList) || []).map((aw: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[aw.id];
                          return (
                            <div key={aw.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{aw.title || `Award #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('awardsList', aw.id, { hidden: !aw.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {aw.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('awardsList', aw.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(aw.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 space-y-2 border-t border-zinc-850">
                                  <div className="grid grid-cols-3 gap-3">
                                    <input
                                      type="text"
                                      placeholder="Award Title"
                                      value={aw.title}
                                      onChange={e => updateListEntry('awardsList', aw.id, { title: e.target.value })}
                                      className="col-span-2 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Date"
                                      value={aw.date}
                                      onChange={e => updateListEntry('awardsList', aw.id, { date: e.target.value })}
                                      className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Issuer (e.g. Google, University)"
                                    value={aw.issuer}
                                    onChange={e => updateListEntry('awardsList', aw.id, { issuer: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Short description..."
                                    value={aw.description}
                                    onChange={e => updateListEntry('awardsList', aw.id, { description: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Organizations Block */}
                  {sectionId === 'organizations' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Organizations</span>
                        <button
                          onClick={() => addListEntry('organizationsList', { name: 'Org Name', role: 'Role', date: 'Duration', description: '' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Org</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.organizationsList) || []).map((org: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[org.id];
                          return (
                            <div key={org.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{org.name || `Org #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('organizationsList', org.id, { hidden: !org.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {org.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('organizationsList', org.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(org.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 space-y-2 border-t border-zinc-850">
                                  <div className="grid grid-cols-3 gap-3">
                                    <input
                                      type="text"
                                      placeholder="Org Name"
                                      value={org.name}
                                      onChange={e => updateListEntry('organizationsList', org.id, { name: e.target.value })}
                                      className="col-span-2 bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Dates"
                                      value={org.date}
                                      onChange={e => updateListEntry('organizationsList', org.id, { date: e.target.value })}
                                      className="bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Your Role (e.g. Lead, Member)"
                                    value={org.role}
                                    onChange={e => updateListEntry('organizationsList', org.id, { role: e.target.value })}
                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <textarea
                                    placeholder="Describe your role or contributions..."
                                    value={org.description}
                                    onChange={e => updateListEntry('organizationsList', org.id, { description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300 font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Interests Block */}
                  {sectionId === 'interests' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Interests List</span>
                        <button
                          onClick={() => addListEntry('interestsList', { name: 'Interest Name' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Interest</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {((activeResume.interestsList) || []).map((int: any) => (
                          <div key={int.id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg text-xs">
                            <input
                              type="text"
                              value={int.name}
                              onChange={e => updateListEntry('interestsList', int.id, { name: e.target.value })}
                              className="bg-transparent text-zinc-300 border-b border-transparent hover:border-zinc-700 outline-none w-20 text-[10px]"
                            />
                            <button
                              onClick={() => deleteListEntry('interestsList', int.id)}
                              className="text-rose-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hobbies Block */}
                  {sectionId === 'hobbies' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Hobbies</span>
                        <button
                          onClick={() => addListEntry('hobbiesList', { name: 'Hobby Name' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Hobby</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {((activeResume.hobbiesList) || []).map((hob: any) => (
                          <div key={hob.id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg text-xs">
                            <input
                              type="text"
                              value={hob.name}
                              onChange={e => updateListEntry('hobbiesList', hob.id, { name: e.target.value })}
                              className="bg-transparent text-zinc-300 border-b border-transparent hover:border-zinc-700 outline-none w-20 text-[10px]"
                            />
                            <button
                              onClick={() => deleteListEntry('hobbiesList', hob.id)}
                              className="text-rose-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Courses Block */}
                  {sectionId === 'courses' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Courses Completed</span>
                        <button
                          onClick={() => addListEntry('coursesList', { name: 'Course Title', provider: 'Platform Name', date: 'Date' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Course</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.coursesList) || []).map((crs: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[crs.id];
                          return (
                            <div key={crs.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{crs.name || `Course #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('coursesList', crs.id, { hidden: !crs.hidden })}
                                    className="text-zinc-555 hover:text-zinc-355 cursor-pointer"
                                  >
                                    {crs.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('coursesList', crs.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(crs.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 grid grid-cols-3 gap-3 border-t border-zinc-850">
                                  <input
                                    type="text"
                                    placeholder="Course Title"
                                    value={crs.name}
                                    onChange={e => updateListEntry('coursesList', crs.id, { name: e.target.value })}
                                    className="col-span-2 bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Date"
                                    value={crs.date}
                                    onChange={e => updateListEntry('coursesList', crs.id, { date: e.target.value })}
                                    className="bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Provider / Platform"
                                    value={crs.provider}
                                    onChange={e => updateListEntry('coursesList', crs.id, { provider: e.target.value })}
                                    className="col-span-3 bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Volunteering Block */}
                  {sectionId === 'volunteering' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Volunteering Experience</span>
                        <button
                          onClick={() => addListEntry('volunteeringList', { role: 'Volunteer Role', organization: 'Org Name', date: 'Duration', description: '' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Volunteering</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.volunteeringList) || []).map((vol: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[vol.id];
                          return (
                            <div key={vol.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{vol.role || `Volunteer #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('volunteeringList', vol.id, { hidden: !vol.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {vol.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('volunteeringList', vol.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(vol.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 space-y-2 border-t border-zinc-850">
                                  <div className="grid grid-cols-3 gap-3">
                                    <input
                                      type="text"
                                      placeholder="Org Name"
                                      value={vol.organization}
                                      onChange={e => updateListEntry('volunteeringList', vol.id, { organization: e.target.value })}
                                      className="col-span-2 bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Dates"
                                      value={vol.date}
                                      onChange={e => updateListEntry('volunteeringList', vol.id, { date: e.target.value })}
                                      className="bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Your Volunteer Role"
                                    value={vol.role}
                                    onChange={e => updateListEntry('volunteeringList', vol.id, { role: e.target.value })}
                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <textarea
                                    placeholder="Describe your service or accomplishments..."
                                    value={vol.description}
                                    onChange={e => updateListEntry('volunteeringList', vol.id, { description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300 font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Declaration Block */}
                  {sectionId === 'declaration' && (
                    <div className="space-y-1.5 text-xs">
                      <label className="text-zinc-455 font-black block text-[10px] uppercase">Declaration Text</label>
                      <textarea
                        placeholder="I hereby declare that the above-mentioned details are true to the best of my knowledge..."
                        value={activeResume.declarationText || ''}
                        onChange={e => onUpdateResume({ declarationText: e.target.value })}
                        rows={3}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  )}

                  {/* Signature Block */}
                  {sectionId === 'signature' && (
                    <div className="space-y-3.5 text-xs bg-zinc-900 p-4 border border-zinc-850 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-zinc-400">Signature Image Authorization</span>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-12 bg-white rounded border border-zinc-300 flex items-center justify-center overflow-hidden">
                          {activeResume.signatureImage ? (
                            <img src={activeResume.signatureImage} alt="Signature" className="h-8 object-contain" />
                          ) : (
                            <PenTool className="w-5 h-5 text-zinc-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[10px] font-black uppercase tracking-wider text-zinc-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition w-fit">
                            <Upload className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Upload Signature File</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const r = new FileReader();
                                r.onload = ev => onUpdateResume({ signatureImage: ev.target?.result as string });
                                r.readAsDataURL(file);
                              }}
                              className="hidden" 
                            />
                          </label>
                          {activeResume.signatureImage && (
                            <button
                              onClick={() => onUpdateResume({ signatureImage: '' })}
                              className="text-rose-500 hover:text-rose-400 font-bold"
                            >
                              Clear Signature
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Patents Block */}
                  {sectionId === 'patents' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-555 font-black uppercase">Patents Filed / Granted</span>
                        <button
                          onClick={() => addListEntry('patentsList', { title: 'Patent Title', number: 'App/Patent Number', date: 'Date', description: '' })}
                          className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Patent</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {((activeResume.patentsList) || []).map((pat: any, idx: number) => {
                          const isEntryExpanded = !!expandedEntries[pat.id];
                          return (
                            <div key={pat.id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden text-xs">
                              <div className="flex justify-between items-center p-2.5 bg-zinc-955 select-none">
                                <span className="text-[10px] text-zinc-300 font-bold">{pat.title || `Patent #${idx + 1}`}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateListEntry('patentsList', pat.id, { hidden: !pat.hidden })}
                                    className="text-zinc-555 hover:text-zinc-350 cursor-pointer"
                                  >
                                    {pat.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry('patentsList', pat.id)}
                                    className="text-rose-500 hover:text-rose-450 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleEntryCollapse(pat.id)} className="text-zinc-500">
                                    {isEntryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {isEntryExpanded && (
                                <div className="p-3.5 space-y-2 border-t border-zinc-850">
                                  <div className="grid grid-cols-3 gap-3">
                                    <input
                                      type="text"
                                      placeholder="Patent Title"
                                      value={pat.title}
                                      onChange={e => updateListEntry('patentsList', pat.id, { title: e.target.value })}
                                      className="col-span-2 bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Date Filed/Issued"
                                      value={pat.date}
                                      onChange={e => updateListEntry('patentsList', pat.id, { date: e.target.value })}
                                      className="bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Patent Number (e.g. US-19283-A1)"
                                    value={pat.number}
                                    onChange={e => updateListEntry('patentsList', pat.id, { number: e.target.value })}
                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300"
                                  />
                                  <textarea
                                    placeholder="Short description of the patent parameters..."
                                    value={pat.description}
                                    onChange={e => updateListEntry('patentsList', pat.id, { description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300 font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Sections Block */}
                  {sectionId.startsWith('custom-') && (
                    <div className="space-y-3 text-xs">
                      {((activeResume.customSections) || [])
                        .filter(cs => cs.id === sectionId)
                        .map(cs => (
                          <div key={cs.id} className="space-y-2">
                            <textarea
                              placeholder="Write your custom section paragraphs here. You can use normal markdown format..."
                              value={cs.content || ''}
                              onChange={e => {
                                onUpdateResume({
                                  customSections: (activeResume.customSections || []).map(item => 
                                    item.id === cs.id ? { ...item, content: e.target.value } : item
                                  )
                                });
                              }}
                              rows={5}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px] leading-relaxed font-mono"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. ADD CONTENT BUTTON */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setIsContentModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-wider text-white px-5 py-3 rounded-xl flex items-center gap-2 transition shadow-lg hover:shadow-indigo-500/10 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section Content Library</span>
        </button>
      </div>

      {/* Add Content Modal overlay */}
      <AddContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        activeResume={activeResume}
        onAddSection={sectionId => {
          onUpdateResume({
            sectionOrder: [...(activeResume.sectionOrder || []), sectionId]
          });
          setIsContentModalOpen(false);
          // Auto expand the new section
          setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
        }}
      />
    </div>
  );
};
