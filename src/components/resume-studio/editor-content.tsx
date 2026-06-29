import React, { useState, useEffect, useRef } from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';
import { 
  User, Mail, Phone, MapPin, Globe, Award, BookOpen, 
  Briefcase, GraduationCap, Code, Plus, Trash2, EyeOff, 
  Eye, ChevronUp, ChevronDown, Upload, Image, GripVertical, 
  Copy, Edit3, Check, Calendar, Shield, Clock, Info, Heart, 
  Bookmark, CheckCircle, Trophy, Users, Landmark, PenTool, 
  Compass, Library, ExternalLink, RefreshCw,
  FileText, Music, Home as HomeIcon, Folder, Newspaper, Share2, 
  Brain, Puzzle, Pencil, MousePointer, Atom, Luggage, Bike, Sparkles,
  Lightbulb, Flag
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { AddContentModal } from './add-content-modal';
import { RichTextEditor } from './rich-text-editor';

const DEFAULT_ICONS = [
  { name: 'award', label: 'Award', icon: Award },
  { name: 'certificate', label: 'Certificate', icon: FileText },
  { name: 'books', label: 'Books', icon: BookOpen },
  { name: 'education', label: 'Education', icon: GraduationCap },
  { name: 'briefcase', label: 'Work', icon: Briefcase },
  { name: 'code', label: 'Skills', icon: Code },
  { name: 'contact', label: 'Contact', icon: User },
  { name: 'folder', label: 'Custom', icon: Folder }
];

const MORE_ICONS = [
  { name: 'home', label: 'Home', icon: HomeIcon },
  { name: 'globe', label: 'Globe', icon: Globe },
  { name: 'music', label: 'Music', icon: Music },
  { name: 'newspaper', label: 'News', icon: Newspaper },
  { name: 'network', label: 'Network', icon: Share2 },
  { name: 'brain', label: 'Brain', icon: Brain },
  { name: 'puzzle', label: 'Puzzle', icon: Puzzle },
  { name: 'pencil', label: 'Pencil', icon: Pencil },
  { name: 'pointer', label: 'Pointer', icon: MousePointer },
  { name: 'sync', label: 'Sync', icon: RefreshCw },
  { name: 'atom', label: 'Atom', icon: Atom },
  { name: 'suitcase', label: 'Suitcase', icon: Luggage },
  { name: 'bicycle', label: 'Bike', icon: Bike },
  { name: 'sparkles', label: 'Sparkles', icon: Sparkles }
];

const allIconsMap: Record<string, React.ComponentType<any>> = {
  award: Award,
  certificate: FileText,
  books: BookOpen,
  education: GraduationCap,
  music: Music,
  globe: Globe,
  home: HomeIcon,
  briefcase: Briefcase,
  contact: User,
  folder: Folder,
  newspaper: Newspaper,
  network: Share2,
  brain: Brain,
  puzzle: Puzzle,
  pencil: Pencil,
  pointer: MousePointer,
  sync: RefreshCw,
  atom: Atom,
  suitcase: Luggage,
  bicycle: Bike,
  code: Code,
  sparkles: Sparkles
};

const getSectionIconName = (sectionId: string, activeResume: any) => {
  const customSettings = activeResume.sectionSettings?.[sectionId];
  if (customSettings?.icon) return customSettings.icon;
  
  const defaultMap: Record<string, string> = {
    summary: 'pencil',
    experience: 'briefcase',
    education: 'education',
    skills: 'code',
    projects: 'award',
    certifications: 'certificate',
    achievements: 'award',
    publications: 'books',
    languages: 'globe',
    interests: 'sparkles',
    references: 'contact',
    awards: 'award',
    organizations: 'home',
    courses: 'books',
    volunteering: 'sparkles',
    declaration: 'certificate',
    signature: 'pencil',
    patents: 'certificate',
    hobbies: 'bicycle',
    'custom-section': 'folder'
  };
  
  if (sectionId.startsWith('custom-')) return 'folder';
  return defaultMap[sectionId] || 'folder';
};

const isSectionIconShown = (sectionId: string, activeResume: any) => {
  const customSettings = activeResume.sectionSettings?.[sectionId];
  if (customSettings && customSettings.showIcon !== undefined) {
    return customSettings.showIcon;
  }
  return true; // default to shown
};

const parseCustomContent = (content: string) => {
  if (content && content.trim().startsWith('[')) {
    try {
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }
  return [];
};

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
  
  // Custom headers & editing states
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [openIconDropdownId, setOpenIconDropdownId] = useState<string | null>(null);

  // Profile photo drag & drop states
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Personal details states
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [isCustomizationsOpen, setIsCustomizationsOpen] = useState(false);
  const [draggedContactIndex, setDraggedContactIndex] = useState<number | null>(null);
  const [showMorePersonal, setShowMorePersonal] = useState(false);
  const [showMoreSocial, setShowMoreSocial] = useState(false);

  // Manage Photo Modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [tempPhoto, setTempPhoto] = useState(activeResume.personalPhoto || '');
  const [tempZoom, setTempZoom] = useState(activeResume.photoZoom || 1);
  const [tempStyle, setTempStyle] = useState(activeResume.photoStyle || 'circle');

  useEffect(() => {
    if (isPhotoModalOpen) {
      setTempPhoto(activeResume.personalPhoto || '');
      setTempZoom(activeResume.photoZoom || 1);
      setTempStyle(activeResume.photoStyle || 'circle');
    }
  }, [isPhotoModalOpen, activeResume.personalPhoto, activeResume.photoZoom, activeResume.photoStyle]);

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
    { field: 'email', label: 'Email', placeholder: 'e.g. email@domain.com' },
    { field: 'phone', label: 'Phone', placeholder: 'e.g. +1 (555) 019-2834' },
    { field: 'location', label: 'Location', placeholder: 'e.g. San Francisco, CA' },
    { field: 'linkedin', label: 'LinkedIn', placeholder: 'e.g. linkedin.com/in/username' },
    { field: 'github', label: 'GitHub', placeholder: 'e.g. github.com/username' },
    { field: 'portfolio', label: 'Portfolio', placeholder: 'e.g. portfolio.dev' },
    { field: 'website', label: 'Website', placeholder: 'e.g. website.com' },
    { field: 'nationality', label: 'Nationality', placeholder: 'e.g. Indian, American' },
    { field: 'dob', label: 'Date of Birth', placeholder: 'e.g. 24 Jan 2000' },
    { field: 'visa', label: 'Visa Status', placeholder: 'e.g. H-1B, F-1 OPT, Citizen' },
    { field: 'availability', label: 'Availability', placeholder: 'e.g. Immediate, 1 Month' },
    { field: 'passport', label: 'Passport or Id', placeholder: 'e.g. Passport or ID details' },
    { field: 'gender', label: 'Gender/Pronoun', placeholder: 'e.g. Male, Female, They/Them' },
    { field: 'disability', label: 'Disability', placeholder: 'e.g. None, Details' },
    { field: 'gitbook', label: 'GitBook', placeholder: 'e.g. username.gitbook.io' },
    { field: 'medium', label: 'Medium', placeholder: 'e.g. medium.com/@username' },
    { field: 'orcid', label: 'ORCID', placeholder: 'e.g. 0000-0000-0000-0000' },
    { field: 'skype', label: 'Skype', placeholder: 'e.g. live:username' },
    { field: 'bluesky', label: 'Bluesky', placeholder: 'e.g. username.bsky.social' },
    { field: 'threads', label: 'Threads', placeholder: 'e.g. threads.net/@username' },
    { field: 'x', label: 'X', placeholder: 'e.g. x.com/username' },
    { field: 'leetcode', label: 'LeetCode', placeholder: 'e.g. leetcode.com/username' },
    { field: 'codechef', label: 'CodeChef', placeholder: 'e.g. codechef.com/users/username' },
    { field: 'hackerrank', label: 'HackerRank', placeholder: 'e.g. hackerrank.com/username' },
    { field: 'custom', label: 'Custom Field', placeholder: 'e.g. Details' }
  ];

  const getUnifiedSocialFields = () => {
    const fields = [...(activeResume.socialFields || [])];
    
    const ensureField = (fieldKey: string, label: string, defaultValue: string) => {
      if (!fields.some(f => f.field === fieldKey)) {
        fields.push({
          id: `social-${fieldKey}`,
          field: fieldKey,
          label,
          value: defaultValue,
          hidden: false
        });
      }
    };

    ensureField('email', 'Email', activeResume.personalEmail !== undefined ? activeResume.personalEmail : (userProfile.email || ''));
    ensureField('phone', 'Phone', activeResume.personalPhone !== undefined ? activeResume.personalPhone : (userProfile.phone || ''));
    ensureField('location', 'Location', activeResume.personalLocation !== undefined ? activeResume.personalLocation : (userProfile.location || ''));

    // Legacy fields migration
    if (activeResume.personalLinkedin && !fields.some(f => f.field === 'linkedin')) {
      fields.push({
        id: 'social-linkedin',
        field: 'linkedin',
        label: 'LinkedIn',
        value: activeResume.personalLinkedin,
        linkUrl: activeResume.personalLinkedin,
        hidden: false
      });
    }
    if (activeResume.personalGithub && !fields.some(f => f.field === 'github')) {
      fields.push({
        id: 'social-github',
        field: 'github',
        label: 'GitHub',
        value: activeResume.personalGithub,
        linkUrl: activeResume.personalGithub,
        hidden: false
      });
    }
    if (activeResume.personalPortfolio && !fields.some(f => f.field === 'portfolio')) {
      fields.push({
        id: 'social-portfolio',
        field: 'portfolio',
        label: 'Portfolio',
        value: activeResume.personalPortfolio,
        linkUrl: activeResume.personalPortfolio,
        hidden: false
      });
    }

    return fields;
  };

  const socialFields = getUnifiedSocialFields();

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

  const handlePhotoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
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

    if (socialFields.some(f => f.field === fieldKey)) return;

    const newField = {
      id: `social-${Date.now()}`,
      field: fieldKey,
      label: fieldConfig.label,
      value: '',
      linkUrl: '',
      hidden: false
    };

    onUpdateResume({
      socialFields: [...socialFields, newField]
    });
  };

  const updateSocialFieldVal = (id: string, value: string) => {
    const updated = socialFields.map(f => f.id === id ? { ...f, value } : f);
    const target = socialFields.find(f => f.id === id);
    const legacyUpdates: Partial<ResumeVersion> = {};
    if (target) {
      if (target.field === 'email') legacyUpdates.personalEmail = value;
      if (target.field === 'phone') legacyUpdates.personalPhone = value;
      if (target.field === 'location') legacyUpdates.personalLocation = value;
      if (target.field === 'linkedin') legacyUpdates.personalLinkedin = value;
      if (target.field === 'github') legacyUpdates.personalGithub = value;
      if (target.field === 'portfolio') legacyUpdates.personalPortfolio = value;
    }
    onUpdateResume({
      socialFields: updated,
      ...legacyUpdates
    });
  };

  const updateSocialFieldLinkUrl = (id: string, linkUrl: string) => {
    const updated = socialFields.map(f => f.id === id ? { ...f, linkUrl } : f);
    const target = socialFields.find(f => f.id === id);
    const legacyUpdates: Partial<ResumeVersion> = {};
    if (target) {
      if (target.field === 'linkedin') legacyUpdates.personalLinkedin = linkUrl;
      if (target.field === 'github') legacyUpdates.personalGithub = linkUrl;
      if (target.field === 'portfolio') legacyUpdates.personalPortfolio = linkUrl;
    }
    onUpdateResume({
      socialFields: updated,
      ...legacyUpdates
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

  const handleContactFieldDrop = (dropIndex: number) => {
    if (draggedContactIndex === null || draggedContactIndex === dropIndex) return;
    const list = [...socialFields];
    const draggedItem = list[draggedContactIndex];
    list.splice(draggedContactIndex, 1);
    list.splice(dropIndex, 0, draggedItem);
    onUpdateResume({ socialFields: list });
    setDraggedContactIndex(null);
  };

  const isLinkField = (field: string) => {
    return [
      'linkedin', 'github', 'portfolio', 'website', 'leetcode', 
      'codechef', 'hackerrank', 'gitbook', 'medium', 'orcid', 
      'skype', 'bluesky', 'threads', 'x', 'custom'
    ].includes(field);
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

  const updateSectionSetting = (sectionId: string, updates: any) => {
    const sectionSettings = activeResume.sectionSettings || {};
    const current = sectionSettings[sectionId] || {};
    onUpdateResume({
      sectionSettings: {
        ...sectionSettings,
        [sectionId]: {
          ...current,
          ...updates
        }
      }
    });
  };

  const renameSectionInline = (sectionId: string, newName: string) => {
    updateSectionSetting(sectionId, { title: newName });
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
    // Check sectionSettings first
    const customTitle = activeResume.sectionSettings?.[id]?.title;
    if (customTitle) return customTitle;

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
    if (text.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Fallback
      }
    }
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
          
          let startDate = '';
          let endDate = '';
          if (duration.includes(' - ')) {
            const dParts = duration.split(' - ');
            startDate = dParts[0].trim();
            endDate = dParts[1].trim();
          } else if (duration.includes(' – ')) {
            const dParts = duration.split(' – ');
            startDate = dParts[0].trim();
            endDate = dParts[1].trim();
          } else {
            startDate = duration;
          }
          
          const description = gpa ? `CGPA: ${gpa}` : '';

          return { 
            id: `edu-${idx}`, 
            school, 
            degree: degree.trim(), 
            startDate, 
            endDate, 
            location: '', 
            description, 
            hidden: isHidden 
          };
        }
        return { 
          id: `edu-${idx}`, 
          school: cleanLine, 
          degree: '', 
          startDate: '', 
          endDate: '', 
          location: '', 
          description: '', 
          hidden: isHidden 
        };
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
      const eduStr = JSON.stringify(list);
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
       {!expandedSections.personal ? (
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 shadow-sm relative group hover:border-zinc-800 transition">
          {/* Edit pencil button top right */}
          <button
            onClick={() => toggleSectionCollapse('personal')}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center cursor-pointer transition shadow-md hover:scale-105 active:scale-95 z-10"
            title="Edit Personal Details"
          >
            <Pencil className="w-3.5 h-3.5 text-white" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pr-10">
            {/* Left side: Information */}
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider truncate">
                  {getEditorFieldValue('personalName') || 'Your Full Name'}
                </h3>
                {getEditorFieldValue('personalTitle') && (
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                    {getEditorFieldValue('personalTitle')}
                  </p>
                )}
              </div>

              {/* Active contact channels list */}
              {socialFields.filter(f => !f.hidden && f.value?.trim()).length > 0 ? (
                <div className="space-y-1.5 text-[11px] text-zinc-400 font-medium mt-2 text-left">
                  {socialFields
                    .filter(f => !f.hidden && f.value?.trim())
                    .slice(0, 3)
                    .map(field => {
                      const getCollapsedFieldIcon = (fieldKey: string) => {
                        switch (fieldKey) {
                          case 'email': return <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
                          case 'phone': return <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
                          case 'location': return <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
                          default: return <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
                        }
                      };
                      return (
                        <div key={field.id} className="flex items-center gap-2">
                          {getCollapsedFieldIcon(field.field)}
                          <span className="truncate max-w-[200px]">{field.value}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-[10.5px] text-zinc-550 italic">No contact information added yet.</p>
              )}
            </div>

            {/* Right side: Photo */}
            {activeResume.personalPhoto && activeResume.showPhoto !== false && (
              <div 
                onClick={(e) => { e.stopPropagation(); setIsPhotoModalOpen(true); }}
                className="w-16 h-20 border border-zinc-800 bg-zinc-950 overflow-hidden shrink-0 cursor-pointer hover:border-zinc-500 transition relative group flex items-center justify-center"
                style={{
                  borderRadius: activeResume.photoStyle === 'circle' ? '50%' : activeResume.photoStyle === 'rounded' ? '12px' : activeResume.photoStyle === 'portrait' || activeResume.photoStyle === 'landscape' ? '8px' : '0px',
                  aspectRatio: activeResume.photoStyle === 'portrait' ? '3/4' : activeResume.photoStyle === 'landscape' ? '4/3' : '1/1'
                }}
              >
                <img 
                  src={activeResume.personalPhoto} 
                  alt="Preview" 
                  className="w-full h-full object-cover pointer-events-none select-none"
                  style={{ transform: `scale(${activeResume.photoZoom || 1})` }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                  <Pencil className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Expanded Edit Form */
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 shadow-sm space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Edit Personal Details</h3>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition cursor-pointer text-[10px] font-black uppercase tracking-wider select-none">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Get Tips</span>
            </div>
          </div>

          {/* Form details & Photo row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Left inputs */}
            <div className="sm:col-span-2 space-y-3.5">
              <div className="space-y-1">
                <label className="text-zinc-450 font-black block text-[10px] uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Dev"
                  value={getEditorFieldValue('personalName')}
                  onChange={e => onUpdateResume({ personalName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-450 font-black block text-[10px] uppercase tracking-wider">Professional Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={getEditorFieldValue('personalTitle')}
                  onChange={e => onUpdateResume({ personalTitle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                />
              </div>
            </div>

            {/* Right: Photo editor */}
            <div className="sm:col-span-1 bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 relative">
              <label className="text-zinc-450 font-black block text-[9px] uppercase tracking-wider absolute top-2 left-0 right-0 text-center">Photo</label>
              
              <div 
                onClick={() => setIsPhotoModalOpen(true)}
                className="w-16 h-20 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 flex items-center justify-center overflow-hidden relative cursor-pointer transition-all mt-4 group animate-fade-in"
                style={{
                  borderRadius: activeResume.photoStyle === 'circle' ? '50%' : activeResume.photoStyle === 'rounded' ? '12px' : activeResume.photoStyle === 'portrait' || activeResume.photoStyle === 'landscape' ? '8px' : '0px',
                  aspectRatio: activeResume.photoStyle === 'portrait' ? '3/4' : activeResume.photoStyle === 'landscape' ? '4/3' : '1/1'
                }}
              >
                {activeResume.personalPhoto ? (
                  <>
                    <img 
                      src={activeResume.personalPhoto} 
                      alt="Preview" 
                      className="w-full h-full object-contain pointer-events-none select-none"
                      style={{ transform: `scale(${activeResume.photoZoom || 1})` }}
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                      <span className="text-[9px] font-black uppercase tracking-wider text-white text-center px-1">Manage Photo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Image className="w-5 h-5 text-zinc-650" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                      <span className="text-[9px] font-black uppercase tracking-wider text-white text-center px-1">Add Photo</span>
                    </div>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </div>
          </div>

          {/* Social / Contact fields list */}
          <div className="space-y-3 pt-3 border-t border-zinc-900">
            {socialFields.map((field, index) => {
              const matchedCfg = allOptionalFields.find(f => f.field === field.field);
              const isLink = isLinkField(field.field);
              const isDefaultField = ['email', 'phone', 'location'].includes(field.field);

              return (
                <div 
                  key={field.id} 
                  className="space-y-1 relative"
                >
                  <div className="flex items-center justify-between">
                    {field.field === 'custom' ? (
                      <input 
                        type="text"
                        value={field.label}
                        onChange={e => updateSocialFieldLabel(field.id, e.target.value)}
                        className="bg-transparent border-b border-zinc-800 outline-none text-[10px] font-black uppercase text-indigo-400 focus:border-indigo-500 w-32"
                      />
                    ) : (
                      <span className="text-zinc-450 font-black block text-[10px] uppercase tracking-wider">{field.label}</span>
                    )}
                    
                    {!isDefaultField && (
                      <button
                        onClick={() => removeSocialField(field.id)}
                        className="text-rose-500 hover:text-rose-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        type="button"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Field</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder={matchedCfg?.placeholder || `e.g. enter ${field.label.toLowerCase()}`}
                        value={field.value}
                        onChange={e => updateSocialFieldVal(field.id, e.target.value)}
                        className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px] ${
                          isLink ? 'pr-16' : 'pr-10'
                        }`}
                      />

                      {/* Link button inside the input */}
                      {isLink && (
                        <button
                          type="button"
                          onClick={() => setEditingLinkId(editingLinkId === field.id ? null : field.id)}
                          className="absolute right-2 top-1.5 bg-indigo-650/15 border border-indigo-500/35 hover:bg-indigo-650/30 text-indigo-400 text-[9.5px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Link</span>
                        </button>
                      )}
                    </div>

                    {/* Drag / Reorder handle on the right */}
                    <div className="flex gap-0.5 shrink-0">
                      <button
                        onClick={() => moveSocialField(index, 'up')}
                        disabled={index === 0}
                        className="text-zinc-550 hover:text-zinc-350 p-1 disabled:opacity-20 cursor-pointer"
                        type="button"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSocialField(index, 'down')}
                        disabled={index === socialFields.length - 1}
                        className="text-zinc-550 hover:text-zinc-350 p-1 disabled:opacity-20 cursor-pointer"
                        type="button"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Popover overlay for actual Link URL */}
                    {editingLinkId === field.id && (
                      <div className="absolute right-12 top-[-75px] bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-2xl z-50 w-64 space-y-2.5 animate-scale-in">
                        <div className="flex justify-between items-center border-b border-zinc-850 pb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Link URL</span>
                          <button
                            type="button"
                            onClick={() => setEditingLinkId(null)}
                            className="text-zinc-500 hover:text-zinc-300 font-bold"
                          >
                            &times;
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="text"
                            placeholder={matchedCfg?.placeholder || "https://..."}
                            value={field.linkUrl || ''}
                            onChange={e => updateSocialFieldLinkUrl(field.id, e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-zinc-300 outline-none focus:border-indigo-500 text-[10.5px]"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingLinkId(null)}
                            className="bg-indigo-650 hover:bg-indigo-600 rounded-lg p-2 text-white flex items-center justify-center cursor-pointer transition shadow"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add details list of buttons */}
          <div className="pt-2 border-t border-zinc-900 space-y-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Add details</span>
            <div className="flex flex-wrap gap-1.5">
              {allOptionalFields.map(opt => {
                const alreadyAdded = socialFields.some(f => f.field === opt.field && opt.field !== 'custom');
                if (alreadyAdded) return null;
                return (
                  <button
                    key={opt.field}
                    onClick={() => addSocialField(opt.field)}
                    className="bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-[9.5px] text-zinc-400 px-2.5 py-1.5 rounded-lg transition font-semibold cursor-pointer active:scale-[0.98] flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Done Button */}
          <div className="pt-3 flex justify-center border-t border-zinc-900">
            <button
              onClick={() => toggleSectionCollapse('personal')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-[11px] font-black uppercase tracking-wider py-2.5 px-10 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-950/20 active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

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
              {(() => {
                const isEditing = editingSectionId === sectionId;
                const sectionIconName = getSectionIconName(sectionId, activeResume);
                const showIcon = isSectionIconShown(sectionId, activeResume);
                const SectionIconComponent = showIcon ? (allIconsMap[sectionIconName] || Folder) : EyeOff;
                const isDropdownOpen = openIconDropdownId === sectionId;

                return (
                  <div className="bg-zinc-900 border-b border-zinc-850 p-4">
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between w-full">
                        {/* Left: Icon Selector and Title Input */}
                        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                          {/* Icon Dropdown Selector */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenIconDropdownId(isDropdownOpen ? null : sectionId)}
                              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider shrink-0 transition"
                            >
                              <SectionIconComponent className="w-4 h-4 text-indigo-400" />
                              <span>{showIcon ? sectionIconName : 'No Icon'}</span>
                              <ChevronDown className="w-3 h-3 text-zinc-550" />
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute left-0 mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 p-3 space-y-3.5 max-h-[300px] overflow-y-auto">
                                {/* Toggle Switch to show/hide icon */}
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Show Section Icon</span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={showIcon}
                                      onChange={e => updateSectionSetting(sectionId, { showIcon: e.target.checked })}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-350 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                                  </label>
                                </div>

                                {showIcon && (
                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1.5">Recommended</span>
                                      <div className="grid grid-cols-4 gap-1.5">
                                        {DEFAULT_ICONS.map(ic => {
                                          const IconComp = ic.icon;
                                          const isSelected = sectionIconName === ic.name;
                                          return (
                                            <button
                                              key={ic.name}
                                              type="button"
                                              onClick={() => {
                                                updateSectionSetting(sectionId, { icon: ic.name });
                                                setOpenIconDropdownId(null);
                                              }}
                                              className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                                                isSelected 
                                                  ? 'bg-indigo-650/15 border-indigo-500/50 text-indigo-400' 
                                                  : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                                              }`}
                                              title={ic.label}
                                            >
                                              <IconComp className="w-4 h-4" />
                                              <span className="text-[7.5px] font-bold truncate max-w-full">{ic.label}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-1.5">Other Icons</span>
                                      <div className="grid grid-cols-4 gap-1.5">
                                        {MORE_ICONS.map(ic => {
                                          const IconComp = ic.icon;
                                          const isSelected = sectionIconName === ic.name;
                                          return (
                                            <button
                                              key={ic.name}
                                              type="button"
                                              onClick={() => {
                                                updateSectionSetting(sectionId, { icon: ic.name });
                                                setOpenIconDropdownId(null);
                                              }}
                                              className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                                                isSelected 
                                                  ? 'bg-indigo-650/15 border-indigo-500/50 text-indigo-400' 
                                                  : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                                              }`}
                                              title={ic.label}
                                            >
                                              <IconComp className="w-4 h-4" />
                                              <span className="text-[7.5px] font-bold truncate max-w-full">{ic.label}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Heading Text Input */}
                          <input
                            type="text"
                            value={title}
                            onChange={e => renameSectionInline(sectionId, e.target.value)}
                            placeholder="Heading Title"
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-black text-white uppercase tracking-wider outline-none focus:border-indigo-500 flex-1 min-w-[120px]"
                          />

                          {/* For Custom Sections: Type Selection (Normal / Skill) */}
                          {sectionId.startsWith('custom-') && (
                            <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px] font-black uppercase tracking-wider shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const customs = activeResume.customSections || [];
                                  const updatedCustoms = customs.map(cs => 
                                    cs.id === sectionId ? { ...cs, isSkillType: false } : cs
                                  );
                                  onUpdateResume({ customSections: updatedCustoms });
                                }}
                                className={`px-2 py-1.5 rounded transition ${
                                  !activeResume.customSections?.find(cs => cs.id === sectionId)?.isSkillType
                                    ? 'bg-indigo-650 text-white shadow'
                                    : 'text-zinc-550 hover:text-zinc-350'
                                }`}
                              >
                                Normal
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const customs = activeResume.customSections || [];
                                  const updatedCustoms = customs.map(cs => 
                                    cs.id === sectionId ? { ...cs, isSkillType: true } : cs
                                  );
                                  onUpdateResume({ customSections: updatedCustoms });
                                }}
                                className={`px-2 py-1.5 rounded transition ${
                                  !!activeResume.customSections?.find(cs => cs.id === sectionId)?.isSkillType
                                    ? 'bg-indigo-650 text-white shadow'
                                    : 'text-zinc-550 hover:text-zinc-350'
                                }`}
                              >
                                Skill
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Right: Done Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSectionId(null);
                            setOpenIconDropdownId(null);
                          }}
                          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shrink-0 transition active:scale-[0.98] shadow-md shadow-pink-500/10 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Done</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center select-none w-full">
                        {/* Normal Header: Title and edit buttons */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="cursor-grab active:cursor-grabbing text-zinc-650 hover:text-zinc-400 shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Icon Indicator */}
                          {showIcon && <SectionIconComponent className="w-4 h-4 text-indigo-400 shrink-0" />}
                          
                          {/* Section Title Display */}
                          <span className="text-xs font-black text-white uppercase tracking-wider truncate">
                            {title}
                          </span>

                          {/* Edit Heading pill button */}
                          <button
                            type="button"
                            onClick={() => setEditingSectionId(sectionId)}
                            className="bg-zinc-955 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-400" />
                            <span>Edit Heading</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-3.5 shrink-0">
                          {/* Section Controls */}
                          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5">
                            <button
                              onClick={() => moveSection(secIdx, 'up')}
                              disabled={secIdx === 0}
                              className="text-zinc-555 hover:text-zinc-300 p-0.5 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveSection(secIdx, 'down')}
                              disabled={secIdx === (activeResume.sectionOrder || []).length - 1}
                              className="text-zinc-555 hover:text-zinc-300 p-0.5 disabled:opacity-20 cursor-pointer"
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
                    )}
                  </div>
                );
              })()}

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
                            const newEdu = { id: `edu-${Date.now()}`, school: '', degree: '', startDate: '', endDate: '', location: '', description: '', hidden: false };
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
                                    {edu.degree && edu.school 
                                      ? `${edu.degree}, ${edu.school}` 
                                      : edu.school || edu.degree || 'Empty school details'}
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
                              </div>                              {isEntryExpanded && (
                                <div className="p-4 space-y-3.5 border-t border-zinc-850 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-zinc-555 font-black uppercase text-[9px]">Degree</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. Bachelor of Technology - B.Tech"
                                      value={edu.degree || ''}
                                      onChange={e => {
                                        const list = [...eduList];
                                        list[idx].degree = e.target.value;
                                        syncLegacyList(list, 'edu');
                                      }}
                                      className="w-full bg-zinc-955 border border-zinc-800 rounded-lg p-2 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-zinc-555 font-black uppercase text-[9px]">School</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. Malla Reddy University"
                                      value={edu.school || ''}
                                      onChange={e => {
                                        const list = [...eduList];
                                        list[idx].school = e.target.value;
                                        syncLegacyList(list, 'edu');
                                      }}
                                      className="w-full bg-zinc-955 border border-zinc-800 rounded-lg p-2 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">Start Date</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. 2021"
                                        value={edu.startDate || ''}
                                        onChange={e => {
                                          const list = [...eduList];
                                          list[idx].startDate = e.target.value;
                                          syncLegacyList(list, 'edu');
                                        }}
                                        className="w-full bg-zinc-955 border border-zinc-800 rounded-lg p-2 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">End Date</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. 2025"
                                        value={edu.endDate || ''}
                                        onChange={e => {
                                          const list = [...eduList];
                                          list[idx].endDate = e.target.value;
                                          syncLegacyList(list, 'edu');
                                        }}
                                        className="w-full bg-zinc-955 border border-zinc-800 rounded-lg p-2 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-zinc-555 font-black uppercase text-[9px]">Location</span>
                                      <input
                                        type="text"
                                        placeholder="e.g. Hyderabad, Telangana"
                                        value={edu.location || ''}
                                        onChange={e => {
                                          const list = [...eduList];
                                          list[idx].location = e.target.value;
                                          syncLegacyList(list, 'edu');
                                        }}
                                        className="w-full bg-zinc-955 border border-zinc-800 rounded-lg p-2 text-zinc-300 outline-none focus:border-indigo-500 transition text-[11px]"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-zinc-555 font-black uppercase text-[9px]">Description</span>
                                    <RichTextEditor
                                      placeholder="Course: Computer Science and Engineering Specialization in Artificial Intelligence and Machine Learning&#10;CGPA: 8.35"
                                      value={edu.description || ''}
                                      onChange={htmlVal => {
                                        const list = [...eduList];
                                        list[idx].description = htmlVal;
                                        syncLegacyList(list, 'edu');
                                      }}
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
                        .map(cs => {
                          const isSkillType = cs.isSkillType;
                          return (
                            <div key={cs.id} className="space-y-2">
                              {isSkillType ? (
                                (() => {
                                  const list = parseCustomContent(cs.content);
                                  return (
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500 font-bold">Skill Groups / Details</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newList = [...list, { id: `item-${Date.now()}`, title: 'Group Title', details: 'Item details or comma-separated list' }];
                                            onUpdateResume({
                                              customSections: (activeResume.customSections || []).map(item => 
                                                item.id === cs.id ? { ...item, content: JSON.stringify(newList) } : item
                                              )
                                            });
                                          }}
                                          className="bg-indigo-650/80 hover:bg-indigo-650 text-[10px] font-black uppercase text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition active:scale-[0.98]"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Add Item Group</span>
                                        </button>
                                      </div>

                                      {list.length === 0 ? (
                                        <div className="text-center py-5 border border-dashed border-zinc-850 rounded-xl text-zinc-650 text-[10px]">
                                          No items added yet. Click "Add Item Group" to start.
                                        </div>
                                      ) : (
                                        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                                          {list.map((item: any, idx: number) => (
                                            <div key={item.id || idx} className="bg-zinc-900 border border-zinc-850 rounded-xl p-3 flex flex-col gap-2 relative">
                                              <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Group #{idx + 1}</span>
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => {
                                                      const newList = [...list];
                                                      const temp = newList[idx];
                                                      newList[idx] = newList[idx - 1];
                                                      newList[idx - 1] = temp;
                                                      onUpdateResume({
                                                        customSections: (activeResume.customSections || []).map(csItem => 
                                                          csItem.id === cs.id ? { ...csItem, content: JSON.stringify(newList) } : csItem
                                                        )
                                                      });
                                                    }}
                                                    className="text-zinc-550 hover:text-zinc-350 disabled:opacity-20"
                                                  >
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    disabled={idx === list.length - 1}
                                                    onClick={() => {
                                                      const newList = [...list];
                                                      const temp = newList[idx];
                                                      newList[idx] = newList[idx + 1];
                                                      newList[idx + 1] = temp;
                                                      onUpdateResume({
                                                        customSections: (activeResume.customSections || []).map(csItem => 
                                                          csItem.id === cs.id ? { ...csItem, content: JSON.stringify(newList) } : csItem
                                                        )
                                                      });
                                                    }}
                                                    className="text-zinc-550 hover:text-zinc-350 disabled:opacity-20"
                                                  >
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const newList = list.filter((_: any, i: number) => i !== idx);
                                                      onUpdateResume({
                                                        customSections: (activeResume.customSections || []).map(csItem => 
                                                          csItem.id === cs.id ? { ...csItem, content: JSON.stringify(newList) } : csItem
                                                        )
                                                      });
                                                    }}
                                                    className="text-rose-500 hover:text-rose-455"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-1 gap-2.5">
                                                <div className="space-y-1">
                                                  <span className="text-zinc-555 font-black uppercase text-[8.5px]">Title / Label</span>
                                                  <input
                                                    type="text"
                                                    placeholder="e.g. Languages"
                                                    value={item.title || ''}
                                                    onChange={e => {
                                                      const newList = [...list];
                                                      newList[idx] = { ...newList[idx], title: e.target.value };
                                                      onUpdateResume({
                                                        customSections: (activeResume.customSections || []).map(csItem => 
                                                          csItem.id === cs.id ? { ...csItem, content: JSON.stringify(newList) } : csItem
                                                        )
                                                      });
                                                    }}
                                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300 text-[11px]"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <span className="text-zinc-555 font-black uppercase text-[8.5px]">Description / Details</span>
                                                  <input
                                                    type="text"
                                                    placeholder="e.g. JavaScript, Python, Go"
                                                    value={item.details || ''}
                                                    onChange={e => {
                                                      const newList = [...list];
                                                      newList[idx] = { ...newList[idx], details: e.target.value };
                                                      onUpdateResume({
                                                        customSections: (activeResume.customSections || []).map(csItem => 
                                                          csItem.id === cs.id ? { ...csItem, content: JSON.stringify(newList) } : csItem
                                                        )
                                                      });
                                                    }}
                                                    className="w-full bg-zinc-955 border border-zinc-800 rounded p-1.5 text-zinc-300 text-[11px]"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
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

      {/* MANAGE PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-[2px] animate-fade-in p-4 text-left">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative space-y-5 text-zinc-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-black uppercase text-white tracking-widest mx-auto">Manage Photo</h3>
              <button 
                onClick={() => setIsPhotoModalOpen(false)} 
                className="absolute top-4 right-4 p-1.5 hover:bg-zinc-800 border border-zinc-800 rounded-full cursor-pointer transition text-zinc-450 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            {/* Photo Crop Window Container */}
            <div className="h-64 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center overflow-hidden relative">
              {tempPhoto ? (
                <div 
                  className={`overflow-hidden border border-zinc-800 relative shadow-inner bg-zinc-950 flex items-center justify-center`}
                  style={{
                    width: tempStyle === 'portrait' ? '140px' : tempStyle === 'landscape' ? '210px' : '180px',
                    height: tempStyle === 'portrait' ? '190px' : tempStyle === 'landscape' ? '160px' : '180px',
                    borderRadius: tempStyle === 'circle' ? '50%' : tempStyle === 'rounded' ? '24px' : '0px'
                  }}
                >
                  <img 
                    src={tempPhoto} 
                    alt="Preview Crop" 
                    className="w-full h-full object-contain select-none pointer-events-none"
                    style={{ transform: `scale(${tempZoom})` }}
                  />
                </div>
              ) : (
                <div className="text-zinc-550 flex flex-col items-center gap-2">
                  <Image className="w-8 h-8 text-zinc-600 animate-pulse" />
                  <span className="text-xs">No profile photo uploaded.</span>
                </div>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-2">
              
              {/* Left Column: Zoom Slider & Shape Selectors */}
              <div className="space-y-4 w-full md:w-fit">
                {/* Zoom Slider */}
                <div className="flex items-center gap-2.5">
                  <Image className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={tempZoom}
                    onChange={(e) => setTempZoom(parseFloat(e.target.value))}
                    disabled={!tempPhoto}
                    className="w-40 accent-pink-650 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Image className="w-5 h-5 text-zinc-550" />
                </div>

                {/* Shape selectors */}
                <div className="flex items-center gap-2.5">
                  {[
                    { id: 'circle', label: 'Circle', class: 'rounded-full w-7 h-7' },
                    { id: 'rounded', label: 'Rounded Square', class: 'rounded-lg w-7 h-7' },
                    { id: 'square', label: 'Square', class: 'rounded-sm w-7 h-7' },
                    { id: 'portrait', label: 'Portrait', class: 'rounded-md w-6 h-8' },
                    { id: 'landscape', label: 'Landscape', class: 'rounded-md w-8 h-6' }
                  ].map(shape => (
                    <button
                      key={shape.id}
                      onClick={() => setTempStyle(shape.id as any)}
                      disabled={!tempPhoto}
                      className={`border cursor-pointer transition flex items-center justify-center ${shape.class} ${
                        tempStyle === shape.id 
                          ? 'border-indigo-500 bg-indigo-950/40 shadow-sm' 
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-white'
                      }`}
                      title={shape.label}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Save, Replace, Delete Buttons */}
              <div className="flex flex-col gap-2.5 w-full md:w-48">
                {/* Save */}
                <button
                  onClick={() => {
                    onUpdateResume({
                      personalPhoto: tempPhoto,
                      photoZoom: tempZoom,
                      photoStyle: tempStyle,
                      showPhoto: true
                    });
                    setIsPhotoModalOpen(false);
                  }}
                  disabled={!tempPhoto}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:opacity-95 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-rose-500/10 active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  <span>Save</span>
                </button>

                {/* Replace Photo */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-350 font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <Upload className="w-4 h-4 text-zinc-500" />
                  <span>Replace Photo</span>
                </button>

                {/* Delete Photo */}
                {tempPhoto && (
                  <button
                    onClick={() => {
                      if (confirm("Delete profile photo?")) {
                        setTempPhoto('');
                        onUpdateResume({ personalPhoto: '' });
                      }
                    }}
                    className="w-full bg-zinc-950 hover:bg-rose-955/20 border border-rose-955/35 text-rose-500 font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
