import React from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';
import { TemplateRenderer, TEMPLATE_STYLES } from './templates';
import { 
  Phone, Mail, MapPin, Globe, Award, BookOpen, Briefcase, 
  GraduationCap, Code, ShieldAlert, Cpu, Database, Flag, 
  Calendar, Shield, Clock, Info, Link as LinkIcon, Heart, 
  Bookmark, CheckCircle, Trophy, Users, Landmark, PenTool, 
  Compass, Library, FileText, Music, Home, Folder, Newspaper, Share2, 
  Brain, Puzzle, Pencil, MousePointer, RefreshCw, Atom, Luggage, Bike, 
  Sparkles, User
} from 'lucide-react';
import { 
  FaLinkedin, FaGlobe, FaTwitter, FaYoutube, FaTelegram, 
  FaDiscord, FaSlack, FaMedium, FaInstagram, FaSkype, FaFacebook 
} from 'react-icons/fa';
import { SiGithub, SiLeetcode, SiCodechef, SiHackerrank } from 'react-icons/si';

const iconMap: Record<string, React.ComponentType<any>> = {
  award: Award,
  certificate: FileText,
  books: BookOpen,
  education: GraduationCap,
  music: Music,
  globe: Globe,
  home: Home,
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

interface PreviewProps {
  activeResume: ResumeVersion;
  userProfile: UserProfile;
  zoom: number;
}

export const Preview: React.FC<PreviewProps> = ({
  activeResume,
  userProfile,
  zoom
}) => {
  // Resolve primary accent color
  const config = TEMPLATE_STYLES[activeResume.template || 'ats-classic'] || TEMPLATE_STYLES['ats-classic'];
  const primaryHex = activeResume.customColorHex || config.presetColor || {
    indigo: '#4f46e5',
    emerald: '#059669',
    violet: '#7c3aed',
    amber: '#d97706',
    rose: '#e11d48',
    sky: '#0284c7',
    slate: '#3f3f46',
  }[activeResume.accentColor || 'indigo'] || '#4f46e5';

  // Fallbacks for profile details
  const resName = activeResume.personalName !== undefined ? activeResume.personalName : (userProfile.name || 'Your Full Name');
  const resTitle = activeResume.personalTitle !== undefined ? activeResume.personalTitle : (userProfile.experience || '');
  const resEmail = activeResume.personalEmail !== undefined ? activeResume.personalEmail : (userProfile.email || '');
  const resPhone = activeResume.personalPhone !== undefined ? activeResume.personalPhone : (userProfile.phone || '');
  const resLocation = activeResume.personalLocation !== undefined ? activeResume.personalLocation : (userProfile.location || '');


  // Setup sizes & typography overrides
  const fontSizeStyle = activeResume.fontSizePt ? `${activeResume.fontSizePt}pt` : (activeResume.fontSize === 'sm' ? '11px' : activeResume.fontSize === 'lg' ? '14px' : '12.5px');
  const lineHeightStyle = activeResume.lineHeight ? `${activeResume.lineHeight}` : (activeResume.spacing === 'compact' ? '1.25' : activeResume.spacing === 'loose' ? '1.75' : '1.5');
  const letterSpacingStyle = activeResume.letterSpacing || 'normal';

  // Helper parser for legacy bullet points
  const bulletsRenderer = (desc: string) => {
    if (!desc) return null;
    const bullets = desc.split(/[\n]+/).filter(b => b.trim() !== '');
    if (bullets.length <= 1) {
      return (
        <p className="text-zinc-600 mt-0.5 leading-relaxed text-[11px] whitespace-pre-line" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
          {desc}
        </p>
      );
    }
    return (
      <ul 
        className="pl-4 mt-1 space-y-0.5 text-zinc-650 list-disc text-[11px]" 
        style={{ 
          listStyleType: activeResume.listStyle === 'hyphen' ? 'none' : 'disc',
          paddingLeft: activeResume.indentBody === false ? '0px' : '16px' 
        }}
      >
        {bullets.map((bullet, index) => (
          <li key={index} className="leading-relaxed" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
            {activeResume.listStyle === 'hyphen' ? `- ${bullet.trim()}` : bullet.trim()}
          </li>
        ))}
      </ul>
    );
  };

  // Section Heading Builder
  const renderHeading = (text: string, sectionId?: string) => {
    const hStyle = activeResume.headingStyle || config.headingStyle || 'simple';
    let displayText = text;
    if (sectionId) {
      const customTitle = activeResume.sectionSettings?.[sectionId]?.title;
      if (customTitle) {
        displayText = customTitle;
      }
    }
    const capText = activeResume.headingCapitalization === 'uppercase' ? displayText.toUpperCase() : displayText;
    const hSize = {
      S: 'text-[10px]',
      M: 'text-[11.5px]',
      L: 'text-[13px]',
      XL: 'text-[15px]'
    }[activeResume.headingSize || 'M'];

    const headingColor = activeResume.applyColorHeadings ? primaryHex : '#18181b';
    const lineColor = activeResume.applyColorHeadingsLine ? primaryHex : '#e4e4e7';

    const headingCSS: React.CSSProperties = {
      color: headingColor,
      fontWeight: 800,
      letterSpacing: '0.05em',
    };

    let iconNode = null;
    if (sectionId) {
      const showIcon = isSectionIconShown(sectionId, activeResume);
      const iconName = getSectionIconName(sectionId, activeResume);
      if (showIcon && iconName) {
        const IconComponent = iconMap[iconName];
        if (IconComponent) {
          iconNode = <IconComponent className="w-3.5 h-3.5 inline-block mr-1.5 shrink-0 align-text-bottom" style={{ color: headingColor }} />;
        }
      }
    }

    if (hStyle === 'underline') {
      return (
        <div className="border-b pb-0.5 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider inline-flex items-center`} style={headingCSS}>
            {iconNode}
            {capText}
          </span>
        </div>
      );
    } else if (hStyle === 'left-block') {
      return (
        <div className="pl-2 border-l-4 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider inline-flex items-center`} style={headingCSS}>
            {iconNode}
            {capText}
          </span>
        </div>
      );
    } else if (hStyle === 'background-fill') {
      return (
        <div className="px-2.5 py-1 mb-2 rounded text-left" style={{ backgroundColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider font-extrabold inline-flex items-center`} style={{ ...headingCSS, color: '#ffffff' }}>
            {iconNode && React.cloneElement(iconNode as any, { style: { color: '#ffffff' } })}
            {capText}
          </span>
        </div>
      );
    } else if (hStyle === 'wavy') {
      return (
        <div className="mb-2 text-left">
          <span className={`${hSize} uppercase tracking-wider inline-flex items-center`} style={headingCSS}>
            {iconNode}
            {capText}
          </span>
          <div className="h-0.5 mt-0.5" style={{ borderBottom: `2px wavy ${lineColor}` }}></div>
        </div>
      );
    } else if (hStyle === 'double-line') {
      return (
        <div className="border-b-4 border-double pb-0.5 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider inline-flex items-center`} style={headingCSS}>
            {iconNode}
            {capText}
          </span>
        </div>
      );
    } else if (hStyle === 'none') {
      return (
        <div className="mb-1.5 text-left">
          <span className={`${hSize} uppercase tracking-wider inline-flex items-center`} style={headingCSS}>
            {iconNode}
            {capText}
          </span>
        </div>
      );
    } else {
      return (
        <div className="mb-1.5 text-left border-b border-zinc-150 pb-0.5">
          <span className={`${hSize} uppercase tracking-wider inline-flex items-center`} style={headingCSS}>
            {iconNode}
            {capText}
          </span>
        </div>
      );
    }
  };

  // Render Section Selector (Renders all 21 standard resume sections)
  const renderSection = (sectionId: string) => {
    const spaceBottomStyle = { marginBottom: `${activeResume.entrySpacing || 8}px` };

    if (sectionId.startsWith('custom-')) {
      const found = (activeResume.customSections || []).find(cs => cs.id === sectionId);
      if (!found || found.hidden) return null;
      
      const settings = activeResume.sectionSettings?.[sectionId];
      const title = settings?.title || found.title || 'Custom Section';

      if (found.isSkillType) {
        const list = parseCustomContent(found.content || '');
        if (list.length === 0) return null;
        return (
          <div key={sectionId} className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading(title, sectionId)}
            <div className="space-y-1 flex flex-col" style={{ gap: '2px' }}>
              {list.map((item: any, idx: number) => (
                <div key={item.id || idx} className="text-zinc-650 text-[11px] leading-relaxed text-justify" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
                  <span className="font-bold text-zinc-800 mr-1.5">{item.title}:</span>
                  <span>{item.details}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      const customType = settings?.customType || 'Normal';
      if (customType === 'Normal') {
        const entries = parseCustomContent(found.content || '');
        const visibleEntries = entries.filter((e: any) => !e.hidden);
        if (visibleEntries.length === 0) {
          if (found.content && !found.content.trim().startsWith('[')) {
            return (
              <div key={sectionId} className="space-y-1 text-left" style={spaceBottomStyle}>
                {renderHeading(title, sectionId)}
                <p className="text-zinc-650 leading-relaxed text-justify text-[11px]" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
                  {found.content}
                </p>
              </div>
            );
          }
          return null;
        }

        return (
          <div key={sectionId} className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading(title, sectionId)}
            <div className="space-y-3 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 6}px` }}>
              {visibleEntries.map((entry: any, entryIdx: number) => {
                const leftParts = [entry.title, entry.subtitle].filter(Boolean);
                const leftText = leftParts.join(', ');
                const durationStr = [entry.startDate, entry.endDate].filter(Boolean).join(' – ');
                const rightParts = [durationStr, entry.location].filter(Boolean).join(' | ');

                return (
                  <div key={entryIdx} className="space-y-0.5 text-left">
                    <div className="flex justify-between items-baseline font-bold text-zinc-850 text-[11px]" style={{ fontSize: fontSizeStyle }}>
                      <span>
                        {entry.link ? (
                          <a href={entry.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-650 font-bold" style={{ color: primaryHex }}>
                            {leftText}
                          </a>
                        ) : leftText}
                      </span>
                      {rightParts && (
                        <span className="text-[9.5px] text-zinc-500 font-normal font-mono">{rightParts}</span>
                      )}
                    </div>
                    {entry.description && (
                      <div 
                        className="text-zinc-650 leading-relaxed text-justify text-[10.5px] rich-text-content"
                        style={{ fontSize: `calc(${fontSizeStyle} - 0.5px)`, lineHeight: lineHeightStyle }}
                        dangerouslySetInnerHTML={{ __html: entry.description }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else {
        return (
          <div key={sectionId} className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading(title, sectionId)}
            <div 
              className="text-zinc-650 leading-relaxed text-justify text-[11px] rich-text-content" 
              style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }} 
              dangerouslySetInnerHTML={{ __html: found.content || '' }}
            />
          </div>
        );
      }
    }

    switch (sectionId) {
      case 'summary':
        let summaryEntries: any[] = [];
        const summaryData = activeResume.summary || '';
        if (summaryData.trim().startsWith('[')) {
          try {
            summaryEntries = JSON.parse(summaryData);
          } catch (e) {
            summaryEntries = [];
          }
        } else {
          // Parse legacy
          const lines = summaryData.split('\n').filter(l => l.trim() !== '');
          summaryEntries = lines.map((line, idx) => {
            const isHidden = line.startsWith('[HIDDEN]');
            const cleanLine = line.replace('[HIDDEN]', '').trim();
            return {
              id: `summary-${idx}`,
              title: '',
              description: cleanLine,
              hidden: isHidden
            };
          });
        }

        const visibleSummary = summaryEntries.filter(s => !s.hidden);
        if (visibleSummary.length === 0) return null;

        return (
          <div key="summary" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Professional Summary', 'summary')}
            <div className="space-y-1.5 flex flex-col">
              {visibleSummary.map((sum, idx) => (
                <div 
                  key={idx} 
                  className="text-zinc-650 leading-relaxed text-justify text-[11px] rich-text-content" 
                  style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }} 
                  dangerouslySetInnerHTML={{ __html: sum.description }}
                />
              ))}
            </div>
          </div>
        );

      case 'experience':
        let expEntries: any[] = [];
        const expData = activeResume.experience || '';
        if (expData.trim().startsWith('[')) {
          try {
            expEntries = JSON.parse(expData);
          } catch (e) {
            expEntries = [];
          }
        } else {
          // Parse legacy
          const lines = expData.split('\n').filter(l => l.trim() !== '');
          expEntries = lines.map((line, idx) => {
            const isHidden = line.startsWith('[HIDDEN]');
            const cleanLine = line.replace('[HIDDEN]', '').trim();
            const match = cleanLine.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\):\s*(.+)$/);
            if (match) {
              return { id: `exp-${idx}`, role: match[1].trim(), company: match[2].trim(), duration: match[3].trim(), description: match[4].trim(), hidden: isHidden };
            }
            return { id: `exp-${idx}`, role: '', company: '', duration: '', description: cleanLine, hidden: isHidden };
          });
        }

        const visibleExp = expEntries.filter(e => !e.hidden);
        if (visibleExp.length === 0) return null;

        return (
          <div key="experience" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Work Experience', 'experience')}
            <div className="space-y-3 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 6}px` }}>
              {visibleExp.map((exp, idx) => {
                const durationStr = exp.duration || [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
                const rightParts = [durationStr, exp.location].filter(Boolean).join(' | ');
                const leftText = exp.role ? `${exp.role} at ${exp.company}` : '';

                return (
                  <div key={idx} className="space-y-0.5 text-left">
                    <div className="flex justify-between items-baseline font-bold text-zinc-850 text-[11px]" style={{ fontSize: fontSizeStyle }}>
                      <span>
                        {exp.link ? (
                          <a href={exp.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-650 font-bold" style={{ color: primaryHex }}>
                            {leftText || exp.description?.substring(0, 30)}
                          </a>
                        ) : (
                          leftText || <span className="font-normal text-zinc-655">{exp.description}</span>
                        )}
                      </span>
                      {rightParts && (
                        <span className="text-[9.5px] text-zinc-550 font-normal font-mono">{rightParts}</span>
                      )}
                    </div>
                    {exp.role && exp.description && (
                      <div 
                        className="text-zinc-655 leading-relaxed text-justify text-[10.5px] rich-text-content"
                        style={{ fontSize: `calc(${fontSizeStyle} - 0.5px)`, lineHeight: lineHeightStyle }}
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'education':
        const eduData = activeResume.education || '';
        let eduList: any[] = [];
        if (eduData.trim().startsWith('[')) {
          try {
            eduList = JSON.parse(eduData);
          } catch (e) {
            eduList = [];
          }
        }
        
        if (eduList.length === 0) {
          const parseLegacyEdu = (text: string) => {
            const lines = text.split('\n').filter(l => l.trim() !== '');
            return lines.map((line, idx) => {
              let isHidden = false;
              let cleanLine = line.trim();
              if (cleanLine.startsWith('[HIDDEN]')) {
                isHidden = true;
                cleanLine = cleanLine.substring(8).trim();
              }
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
                return { school, degree, duration, gpa, hidden: isHidden, location: '', description: '' };
              }
              return { school: cleanLine, degree: '', duration: '', gpa: '', hidden: isHidden, location: '', description: '' };
            });
          };
          eduList = parseLegacyEdu(eduData);
        }

        const visibleEdu = eduList.filter(item => !item.hidden);
        if (visibleEdu.length === 0) return null;

        return (
          <div key="education" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Education', 'education')}
            <div className="space-y-3 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 6}px` }}>
              {visibleEdu.map((edu, idx) => {
                const leftParts = [edu.degree, edu.school].filter(Boolean);
                const leftText = leftParts.join(', ');
                
                let durationStr = '';
                if (edu.startDate || edu.endDate) {
                  durationStr = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
                } else if (edu.duration) {
                  durationStr = edu.duration;
                }
                
                const rightParts = [durationStr, edu.location].filter(Boolean).join(' | ');

                return (
                  <div key={idx} className="space-y-0.5 text-left">
                    <div className="flex justify-between items-baseline font-bold text-zinc-850 text-[11px]" style={{ fontSize: fontSizeStyle }}>
                      <span>{leftText}</span>
                      {rightParts && (
                        <span className="text-[9.5px] text-zinc-500 font-normal font-mono">{rightParts}</span>
                      )}
                    </div>
                    {edu.description && (
                      <div 
                        className="text-zinc-650 leading-relaxed text-justify text-[10.5px] rich-text-content"
                        style={{ fontSize: `calc(${fontSizeStyle} - 0.5px)`, lineHeight: lineHeightStyle }}
                        dangerouslySetInnerHTML={{ __html: edu.description }}
                      />
                    )}
                    {!edu.description && edu.gpa && (
                      <div className="text-[9.5px] text-zinc-500 font-bold">
                        CGPA: {edu.gpa}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'skills':
        if (!activeResume.skills) return null;
        return (
          <div key="skills" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Technical Skills', 'skills')}
            <div className="flex flex-wrap gap-1.5 pt-0.5 text-left">
              {activeResume.skills.split(',').map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-50 text-zinc-800 px-2 py-0.5 rounded text-[9.5px] border border-zinc-200 font-semibold"
                  style={{ fontSize: `calc(${fontSizeStyle} - 1.5px)` }}
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        );

      case 'projects':
        let projEntries: any[] = [];
        const projData = activeResume.projects || '';
        if (projData.trim().startsWith('[')) {
          try {
            projEntries = JSON.parse(projData);
          } catch (e) {
            projEntries = [];
          }
        } else {
          // Parse legacy
          const lines = projData.split('\n').filter(l => l.trim() !== '');
          projEntries = lines.map((line, idx) => {
            const isHidden = line.startsWith('[HIDDEN]');
            const cleanLine = line.replace('[HIDDEN]', '').trim();
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
        }

        const visibleProj = projEntries.filter(p => !p.hidden);
        if (visibleProj.length === 0) return null;

        return (
          <div key="projects" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Key Projects', 'projects')}
            <div className="space-y-3 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 6}px` }}>
              {visibleProj.map((proj, idx) => {
                const durationStr = proj.duration || [proj.startDate, proj.endDate].filter(Boolean).join(' – ');
                const rightParts = [durationStr, proj.location].filter(Boolean).join(' | ');
                const leftText = proj.title || '';

                return (
                  <div key={idx} className="space-y-0.5 text-left">
                    <div className="flex justify-between items-baseline font-bold text-zinc-855 text-[11px]" style={{ fontSize: fontSizeStyle }}>
                      <span>
                        {proj.link ? (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-650 font-bold" style={{ color: primaryHex }}>
                            {leftText || proj.description?.substring(0, 30)}
                          </a>
                        ) : (
                          leftText || <span className="font-normal text-zinc-650">{proj.description}</span>
                        )}
                      </span>
                      {rightParts && (
                        <span className="text-[9.5px] text-zinc-550 font-normal font-mono">{rightParts}</span>
                      )}
                    </div>
                    {proj.title && proj.description && (
                      <div 
                        className="text-zinc-655 leading-relaxed text-justify text-[10.5px] rich-text-content"
                        style={{ fontSize: `calc(${fontSizeStyle} - 0.5px)`, lineHeight: lineHeightStyle }}
                        dangerouslySetInnerHTML={{ __html: proj.description }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'certifications':
        const certList = activeResume.certificationsList || [];
        const visibleCerts = certList.filter(c => !c.hidden);
        if (visibleCerts.length === 0) return null;
        return (
          <div key="certifications" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Certifications', 'certifications')}
            <div className="space-y-1.5 text-left">
              {visibleCerts.map(cert => (
                <div key={cert.id} className="text-[11px] flex justify-between items-baseline" style={{ fontSize: fontSizeStyle }}>
                  <span className="font-semibold text-zinc-800">
                    {cert.name}{' '}
                    <span className="font-normal text-zinc-500">— {cert.issuer}</span>
                  </span>
                  <span className="text-[9.5px] text-zinc-500 font-mono">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        const achList = activeResume.achievementsList || [];
        const visibleAchs = achList.filter(a => !a.hidden);
        if (visibleAchs.length === 0) return null;
        return (
          <div key="achievements" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Achievements & Honors', 'achievements')}
            <div className="space-y-1.5">
              {visibleAchs.map(ach => (
                <div key={ach.id} className="text-[11px]" style={{ fontSize: fontSizeStyle }}>
                  <span className="font-bold text-zinc-800 block">{ach.title}</span>
                  <span className="text-zinc-600 block text-[10px]">{ach.description}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        const langList = activeResume.languagesList || [];
        const visibleLangs = langList.filter(l => !l.hidden);
        if (visibleLangs.length === 0) return null;
        return (
          <div key="languages" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Languages', 'languages')}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {visibleLangs.map(lang => (
                <span 
                  key={lang.id} 
                  className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{ fontSize: fontSizeStyle }}
                >
                  {lang.language} ({lang.proficiency})
                </span>
              ))}
            </div>
          </div>
        );

      case 'references':
        const refList = activeResume.referencesList || [];
        const visibleRefs = refList.filter(r => !r.hidden);
        if (visibleRefs.length === 0) return null;
        return (
          <div key="references" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('References', 'references')}
            <div className="grid grid-cols-2 gap-3">
              {visibleRefs.map(ref => (
                <div key={ref.id} className="text-[10px] space-y-0.5 border-l-2 border-zinc-200 pl-2 leading-relaxed" style={{ fontSize: fontSizeStyle }}>
                  <span className="font-bold text-zinc-800 block">{ref.name}</span>
                  <span className="text-zinc-550 block">{ref.position} at {ref.company}</span>
                  <span className="text-zinc-500 font-mono block">{ref.contact}</span>
                </div>
              ))}
            </div>
          </div>
        );

      // New FlowCV Specific Content Blocks
      case 'awards':
        const awards = activeResume.awardsList || [];
        const visibleAwards = awards.filter(a => !a.hidden);
        if (visibleAwards.length === 0) return null;
        return (
          <div key="awards" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Awards & Recognitions', 'awards')}
            <div className="space-y-1.5">
              {visibleAwards.map(aw => (
                <div key={aw.id} className="text-[11px] flex justify-between items-baseline" style={{ fontSize: fontSizeStyle }}>
                  <div>
                    <span className="font-bold text-zinc-800">{aw.title}</span>
                    <span className="text-zinc-500 text-[10px] ml-1.5">from {aw.issuer}</span>
                    {aw.description && <p className="text-zinc-550 text-[10px] mt-0.5">{aw.description}</p>}
                  </div>
                  <span className="text-[9.5px] text-zinc-500 font-mono">{aw.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'publications':
        const publications = activeResume.publicationsList || [];
        const visiblePubs = publications.filter(p => !p.hidden);
        if (visiblePubs.length === 0) return null;
        return (
          <div key="publications" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Publications & Articles', 'publications')}
            <div className="space-y-2">
              {visiblePubs.map(pub => (
                <div key={pub.id} className="text-[11px]" style={{ fontSize: fontSizeStyle }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-zinc-800">{pub.title}</span>
                    <span className="text-[9.5px] text-zinc-500 font-mono">{pub.year}</span>
                  </div>
                  <span className="text-zinc-500 italic block text-[10px]">{pub.publisher}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'organizations':
        const orgs = activeResume.organizationsList || [];
        const visibleOrgs = orgs.filter(o => !o.hidden);
        if (visibleOrgs.length === 0) return null;
        return (
          <div key="organizations" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Organizations & Memberships', 'organizations')}
            <div className="space-y-2">
              {visibleOrgs.map(org => (
                <div key={org.id} className="text-[11px]" style={{ fontSize: fontSizeStyle }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-zinc-800">{org.name}</span>
                    <span className="text-[9.5px] text-zinc-500 font-mono">{org.date}</span>
                  </div>
                  <span className="text-zinc-500 block text-[10px] font-semibold">{org.role}</span>
                  {org.description && <p className="text-zinc-550 text-[10px] mt-0.5">{org.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        const interests = activeResume.interestsList || [];
        const visibleInterests = interests.filter(i => !i.hidden);
        if (visibleInterests.length === 0) return null;
        return (
          <div key="interests" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Interests', 'interests')}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {visibleInterests.map(int => (
                <span 
                  key={int.id} 
                  className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{ fontSize: fontSizeStyle }}
                >
                  {int.name}
                </span>
              ))}
            </div>
          </div>
        );

      case 'courses':
        const courses = activeResume.coursesList || [];
        const visibleCourses = courses.filter(c => !c.hidden);
        if (visibleCourses.length === 0) return null;
        return (
          <div key="courses" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Courses & Training', 'courses')}
            <div className="space-y-1.5">
              {visibleCourses.map(crs => (
                <div key={crs.id} className="text-[11px] flex justify-between items-baseline" style={{ fontSize: fontSizeStyle }}>
                  <span>
                    <span className="font-bold text-zinc-800">{crs.name}</span>
                    <span className="text-zinc-500 text-[10px] ml-1.5">— {crs.provider}</span>
                  </span>
                  <span className="text-[9.5px] text-zinc-500 font-mono">{crs.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'volunteering':
        const volunteers = activeResume.volunteeringList || [];
        const visibleVolunteers = volunteers.filter(v => !v.hidden);
        if (visibleVolunteers.length === 0) return null;
        return (
          <div key="volunteering" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Volunteering Experience', 'volunteering')}
            <div className="space-y-2">
              {visibleVolunteers.map(vol => (
                <div key={vol.id} className="text-[11px]" style={{ fontSize: fontSizeStyle }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-zinc-800">{vol.role}</span>
                    <span className="text-[9.5px] text-zinc-500 font-mono">{vol.date}</span>
                  </div>
                  <span className="text-zinc-500 block text-[10px] font-semibold">{vol.organization}</span>
                  {vol.description && <p className="text-zinc-550 text-[10px] mt-0.5">{vol.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'declaration':
        if (!activeResume.declarationText) return null;
        return (
          <div key="declaration" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Declaration', 'declaration')}
            <p className="text-zinc-600 leading-relaxed text-justify text-[10px] italic" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
              {activeResume.declarationText}
            </p>
          </div>
        );

      case 'signature':
        if (!activeResume.signatureImage) return null;
        return (
          <div key="signature" className="flex flex-col items-end pt-2 text-right" style={spaceBottomStyle}>
            <div className="w-32 border-b border-zinc-300 pb-1 flex justify-center">
              <img src={activeResume.signatureImage} alt="Signature" className="h-8 object-contain" />
            </div>
            <span className="text-[8px] uppercase tracking-wider text-zinc-400 mt-1 block mr-4">Authorized Signature</span>
          </div>
        );

      case 'patents':
        const patents = activeResume.patentsList || [];
        const visiblePatents = patents.filter(p => !p.hidden);
        if (visiblePatents.length === 0) return null;
        return (
          <div key="patents" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Patents', 'patents')}
            <div className="space-y-1.5">
              {visiblePatents.map(pat => (
                <div key={pat.id} className="text-[11px]" style={{ fontSize: fontSizeStyle }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-zinc-800">{pat.title}</span>
                    <span className="text-[9.5px] text-zinc-500 font-mono">{pat.date}</span>
                  </div>
                  <span className="text-zinc-500 text-[10px] block">Patent/App Number: {pat.number}</span>
                  {pat.description && <p className="text-zinc-550 text-[10px] mt-0.5">{pat.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'hobbies':
        const hobbies = activeResume.hobbiesList || [];
        const visibleHobbies = hobbies.filter(h => !h.hidden);
        if (visibleHobbies.length === 0) return null;
        return (
          <div key="hobbies" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Hobbies', 'hobbies')}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {visibleHobbies.map(hob => (
                <span 
                  key={hob.id} 
                  className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{ fontSize: fontSizeStyle }}
                >
                  {hob.name}
                </span>
              ))}
            </div>
          </div>
        );

      case 'custom-section':
        const customs = activeResume.customSections || [];
        const visibleCustoms = customs.filter(c => !c.hidden);
        if (visibleCustoms.length === 0) return null;
        return (
          <div key="custom-section" className="space-y-2 text-left" style={spaceBottomStyle}>
            {visibleCustoms.map(cust => (
              <div key={cust.id} className="space-y-1">
                {renderHeading(cust.title || 'Custom Section', cust.id)}
                <p className="text-zinc-650 leading-relaxed text-justify text-[11px] whitespace-pre-line" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
                  {cust.content}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Header Details Renderer
  const renderHeader = () => {
    const alignClass = activeResume.nameAlign === 'center' ? 'text-center justify-center' : activeResume.nameAlign === 'right' ? 'text-right justify-end' : 'text-left justify-start';
    const alignTextClass = activeResume.nameAlign === 'center' ? 'text-center' : activeResume.nameAlign === 'right' ? 'text-right' : 'text-left';
    
    const nameWeight = activeResume.nameBold !== false ? 'font-black' : 'font-semibold';
    const nameColor = activeResume.headingColor || '#09090b';
    const iconColor = activeResume.linkColor || primaryHex;

    const getFieldIcon = (field: string, label?: string) => {
      const name = (label || field || '').toLowerCase().trim();
      if (name.includes('email')) return Mail;
      if (name.includes('phone') || name.includes('mobile') || name.includes('contact')) return Phone;
      if (name.includes('location') || name.includes('address')) return MapPin;
      if (name.includes('linkedin')) return FaLinkedin;
      if (name.includes('github')) return SiGithub;
      if (name.includes('leetcode')) return SiLeetcode;
      if (name.includes('codechef')) return SiCodechef;
      if (name.includes('hackerrank')) return SiHackerrank;
      
      // Dynamic brand checks
      if (name.includes('twitter') || name.includes('x.com') || name === 'x') return FaTwitter;
      if (name.includes('youtube')) return FaYoutube;
      if (name.includes('telegram')) return FaTelegram;
      if (name.includes('discord')) return FaDiscord;
      if (name.includes('slack')) return FaSlack;
      if (name.includes('medium')) return FaMedium;
      if (name.includes('instagram')) return FaInstagram;
      if (name.includes('skype')) return FaSkype;
      if (name.includes('facebook')) return FaFacebook;

      if (name.includes('portfolio') || name.includes('website') || name.includes('web') || name.includes('link') || name.includes('gitbook') || name.includes('orcid') || name.includes('bluesky') || name.includes('threads')) return Globe;
      if (name.includes('nationality') || name.includes('citizen')) return Flag;
      if (name.includes('dob') || name.includes('birth')) return Calendar;
      if (name.includes('visa')) return Shield;
      if (name.includes('availability')) return Clock;
      
      return Info;
    };

    let socialItems: any[] = [];
    if (activeResume.socialFields && activeResume.socialFields.length > 0) {
      socialItems = activeResume.socialFields
        .filter(f => !f.hidden && f.value?.trim())
        .map(f => ({
          field: f.field,
          label: f.label || f.field,
          value: f.value,
          linkUrl: f.linkUrl,
          Icon: getFieldIcon(f.field, f.label)
        }));
    } else {
      const defaultFields = [
        { field: 'email', label: 'Email', value: resEmail },
        { field: 'phone', label: 'Phone', value: resPhone },
        { field: 'location', label: 'Location', value: resLocation },
      ].filter(i => i.value?.trim());

      const legacySocials = [
        { field: 'linkedin', label: 'LinkedIn', value: activeResume.personalLinkedin },
        { field: 'github', label: 'GitHub', value: activeResume.personalGithub },
        { field: 'portfolio', label: 'Portfolio', value: activeResume.personalPortfolio }
      ].filter(i => i.value?.trim());

      socialItems = [...defaultFields, ...legacySocials].map(item => ({
        ...item,
        linkUrl: undefined,
        Icon: getFieldIcon(item.field, item.label)
      }));
    }

    const separator = activeResume.headerDetailsSeparator === 'bar' ? '|' : activeResume.headerDetailsSeparator === 'icon' ? 'icon' : '•';
    const showIcons = activeResume.linkIconEnabled !== false;

    return (
      <div 
        className="w-full flex flex-col"
        style={{ 
          alignItems: activeResume.nameAlign === 'center' ? 'center' : activeResume.nameAlign === 'right' ? 'flex-end' : 'flex-start',
          textAlign: activeResume.nameAlign || 'left',
          gap: resTitle ? '4px' : '8px'
        }}
      >
        <h1 
          className={`${nameWeight} tracking-tight leading-tight`} 
          style={{ 
            color: nameColor,
            fontSize: activeResume.nameSizePx ? `${activeResume.nameSizePx}px` : '32px',
            textAlign: activeResume.nameAlign || 'left',
            letterSpacing: letterSpacingStyle === 'loose' ? '0.05em' : letterSpacingStyle === 'tight' ? '-0.02em' : 'normal',
          }}
        >
          {resName}
        </h1>
        {resTitle && (
          <p 
            className="text-[10px] tracking-widest text-zinc-500 uppercase font-black" 
            style={{ 
              color: activeResume.applyColorJobTitle ? primaryHex : undefined, 
              textAlign: activeResume.nameAlign || 'left',
              marginBottom: '4px'
            }}
          >
            {resTitle}
          </p>
        )}
        
        {(() => {
          const formatUrl = (urlStr: string) => {
            let clean = urlStr.trim();
            if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
              clean = `https://${clean}`;
            }
            return clean;
          };

          const parseContactItem = (contact: { field: string; label: string; value?: string; linkUrl?: string }) => {
            const val = contact.value?.trim() || '';
            if (!val) return { text: '', url: '' };

            if (contact.linkUrl?.trim()) {
              return { text: val, url: formatUrl(contact.linkUrl) };
            }

            // Check for custom text | link format
            if (val.includes('|')) {
              const parts = val.split('|');
              const text = parts[0].trim();
              const url = parts.slice(1).join('|').trim();
              return { text, url: formatUrl(url) };
            }

            // Check if it's a URL
            const isUrl = val.startsWith('http://') || val.startsWith('https://') || val.startsWith('www.');
            if (isUrl) {
              const url = formatUrl(val);
              let text = val;
              try {
                const cleanUrl = val.startsWith('www.') ? `https://${val}` : val;
                const urlObj = new URL(cleanUrl);
                
                if (['linkedin', 'github', 'leetcode', 'codechef', 'hackerrank'].includes(contact.field.toLowerCase())) {
                  const handle = urlObj.pathname.replace(/^\/+/g, '').replace(/\/+$/g, '');
                  text = handle ? handle : (contact.label || contact.field);
                } else {
                  text = urlObj.hostname.replace('www.', '');
                }
              } catch (e) {
                text = val;
              }
              return { text, url };
            }

            // Check if it's an email
            if (contact.field === 'email' || (val.includes('@') && !val.includes(' '))) {
              const email = val.startsWith('mailto:') ? val : `mailto:${val}`;
              return { text: val, url: email };
            }

            return { text: val, url: '' };
          };

          const linkStyle: React.CSSProperties = {
            color: activeResume.linkColor || (activeResume.linkBlueColor !== false ? '#2563eb' : primaryHex),
            fontWeight: activeResume.linkFontWeight || 'normal',
            fontStyle: activeResume.linkItalic ? 'italic' : 'normal',
            textDecoration: activeResume.linkUnderline !== false ? 'underline' : 'none'
          };

          const textStyle: React.CSSProperties = {
            color: activeResume.bodyTextColor || '#4b5563',
          };

          const getContactItemSpan = (item: any, idx: number, iconSpace: string) => {
            const Icon = item.Icon;
            const { text, url } = parseContactItem(item);
            if (!text) return null;
            
            return (
              <span 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: iconSpace,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle'
                }}
              >
                {showIcons && (
                  <Icon 
                    size={11} 
                    className="shrink-0" 
                    style={{ 
                      color: iconColor, 
                      width: '11px', 
                      height: '11px',
                      display: 'inline-block',
                      verticalAlign: 'middle'
                    }} 
                  />
                )}
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{text}</a>
                ) : (
                  <span style={textStyle}>{text}</span>
                )}
              </span>
            );
          };

          return activeResume.headerDetailsArrangement === 'stacked' ? (
            <div 
              className="w-full text-[9.5px] text-zinc-650 font-mono flex flex-col gap-1" 
              style={{ 
                alignItems: activeResume.nameAlign === 'center' ? 'center' : activeResume.nameAlign === 'right' ? 'flex-end' : 'flex-start',
                wordBreak: 'break-word' 
              }}
            >
              {socialItems.map((item, idx) => {
                const span = getContactItemSpan(item, idx, '6px');
                if (!span) return null;
                return <div key={idx}>{span}</div>;
              })}
            </div>
          ) : activeResume.headerDetailsArrangement === 'grid' ? (
            <div className={`grid grid-cols-2 gap-x-4 gap-y-1 text-[9.5px] text-zinc-650 font-mono max-w-lg ${activeResume.nameAlign === 'center' ? 'mx-auto' : ''}`}>
              {socialItems.map((item, idx) => {
                const span = getContactItemSpan(item, idx, '6px');
                if (!span) return null;
                return (
                  <div key={idx} style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {span}
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              className="w-full text-[9.5px] text-zinc-650 font-mono flex flex-wrap"
              style={{ 
                justifyContent: activeResume.nameAlign === 'center' ? 'center' : activeResume.nameAlign === 'right' ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                columnGap: '12px',
                rowGap: '4px',
                wordBreak: 'break-word' 
              }}
            >
              {socialItems.map((item, idx) => {
                const span = getContactItemSpan(item, idx, '4px');
                if (!span) return null;
                return (
                  <React.Fragment key={idx}>
                    {span}
                    {idx < socialItems.length - 1 && separator !== 'icon' && (
                      <span 
                        className="text-zinc-300 font-bold select-none" 
                        style={{ 
                          marginLeft: '2px', 
                          marginRight: '2px',
                          display: 'inline-block',
                          verticalAlign: 'middle'
                        }}
                      >
                        {separator}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderFooter = () => {
    const showFooter = activeResume.footerPageNumbers || activeResume.footerEmail || activeResume.footerName || activeResume.footerCustomText;
    if (!showFooter) return null;

    return (
      <div className="border-t border-zinc-200 mt-6 pt-2.5 flex justify-between items-center text-[8.5px] text-zinc-450 font-mono select-none">
        <div>
          {activeResume.footerName && <span className="mr-3 font-semibold text-zinc-650">{resName}</span>}
          {activeResume.footerEmail && <span>{resEmail}</span>}
        </div>
        <div className="text-right flex items-center gap-3">
          {activeResume.footerCustomText && <span className="italic">{activeResume.footerCustomText}</span>}
          {activeResume.signatureImage && (
            <div className="flex items-center gap-1">
              <span className="text-[7.5px] uppercase text-zinc-400">Signature:</span>
              <img src={activeResume.signatureImage} alt="Sig" className="h-4 object-contain bg-white rounded px-0.5" />
            </div>
          )}
          {activeResume.footerPageNumbers && <span className="font-bold">Page 1 of 1</span>}
        </div>
      </div>
    );
  };

  return (
    <div 
      id="resume-print-canvas"
      className="bg-white text-zinc-950 shadow-2xl transition-all duration-350 select-text mx-auto flex flex-col justify-between border border-zinc-200 text-left relative rounded-sm"
      style={{
        width: activeResume.pageFormat === 'Letter' ? '215.9mm' : '210mm',
        minHeight: activeResume.pageFormat === 'Letter' ? '279.4mm' : '297mm',
        zoom: zoom,
        overflow: 'hidden',
        fontFamily: activeResume.customFont ? `"${activeResume.customFont}", sans-serif` : (activeResume.fontFamily === 'serif' ? 'Georgia, serif' : activeResume.fontFamily === 'mono' ? 'Courier, monospace' : 'Inter, system-ui, sans-serif'),
        fontSize: fontSizeStyle,
        lineHeight: lineHeightStyle,
        paddingTop: activeResume.marginTop !== undefined ? `${activeResume.marginTop}mm` : (activeResume.marginVertical !== undefined ? `${activeResume.marginVertical}mm` : '20mm'),
        paddingBottom: activeResume.marginBottom !== undefined ? `${activeResume.marginBottom}mm` : (activeResume.marginVertical !== undefined ? `${activeResume.marginVertical}mm` : '20mm'),
        paddingLeft: activeResume.marginLeft !== undefined ? `${activeResume.marginLeft}mm` : (activeResume.marginHorizontal !== undefined ? `${activeResume.marginHorizontal}mm` : '20mm'),
        paddingRight: activeResume.marginRight !== undefined ? `${activeResume.marginRight}mm` : (activeResume.marginHorizontal !== undefined ? `${activeResume.marginHorizontal}mm` : '20mm'),
        backgroundColor: activeResume.backgroundColor || '#ffffff'
      }}
    >
      {/* Visual page pagination boundaries (A4 size is 29.7cm height) */}
      <div data-html2canvas-ignore="true" className="absolute left-0 right-0 border-b border-dashed border-rose-400/40 pointer-events-none select-none print:hidden z-50 flex items-center justify-end" style={{ top: '29.7cm' }}>
        <span className="bg-rose-500 text-white font-black text-[8px] px-2 py-0.5 rounded-l uppercase tracking-widest shadow-lg -mt-5">
          Page 1 Boundary
        </span>
      </div>
      <div data-html2canvas-ignore="true" className="absolute left-0 right-0 border-b border-dashed border-rose-400/40 pointer-events-none select-none print:hidden z-50 flex items-center justify-end" style={{ top: '59.4cm' }}>
        <span className="bg-rose-500 text-white font-black text-[8px] px-2 py-0.5 rounded-l uppercase tracking-widest shadow-lg -mt-5">
          Page 2 Boundary
        </span>
      </div>

      <TemplateRenderer
        activeResume={activeResume}
        userProfile={userProfile}
        primaryHex={primaryHex}
        fontSizeStyle={fontSizeStyle}
        lineHeightStyle={lineHeightStyle}
        renderHeading={renderHeading}
        bulletsRenderer={bulletsRenderer}
        renderHeader={renderHeader}
        renderFooter={renderFooter}
        renderSection={renderSection}
      />
    </div>
  );
};
