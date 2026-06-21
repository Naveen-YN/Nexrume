import React from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';
import { TemplateRenderer, TEMPLATE_STYLES } from './templates';
import { 
  Phone, Mail, MapPin, Globe, Award, BookOpen, Briefcase, 
  GraduationCap, Code, ShieldAlert, Cpu, Database, Flag, 
  Calendar, Shield, Clock, Info, Link as LinkIcon, Heart, 
  Bookmark, CheckCircle, Trophy, Users, Landmark, PenTool, 
  Compass, Library
} from 'lucide-react';
import { 
  FaLinkedin, FaGlobe, FaTwitter, FaYoutube, FaTelegram, 
  FaDiscord, FaSlack, FaMedium, FaInstagram, FaSkype, FaFacebook 
} from 'react-icons/fa';
import { SiGithub, SiLeetcode, SiCodechef, SiHackerrank } from 'react-icons/si';

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
  const renderHeading = (text: string) => {
    const hStyle = activeResume.headingStyle || config.headingStyle || 'simple';
    const capText = activeResume.headingCapitalization === 'uppercase' ? text.toUpperCase() : text;
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

    if (hStyle === 'underline') {
      return (
        <div className="border-b pb-0.5 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider`} style={headingCSS}>{capText}</span>
        </div>
      );
    } else if (hStyle === 'left-block') {
      return (
        <div className="pl-2 border-l-4 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider`} style={headingCSS}>{capText}</span>
        </div>
      );
    } else if (hStyle === 'background-fill') {
      return (
        <div className="px-2.5 py-1 mb-2 rounded text-left" style={{ backgroundColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider font-extrabold`} style={{ ...headingCSS, color: '#ffffff' }}>
            {capText}
          </span>
        </div>
      );
    } else if (hStyle === 'wavy') {
      return (
        <div className="mb-2 text-left">
          <span className={`${hSize} uppercase tracking-wider`} style={headingCSS}>{capText}</span>
          <div className="h-0.5 mt-0.5" style={{ borderBottom: `2px wavy ${lineColor}` }}></div>
        </div>
      );
    } else if (hStyle === 'double-line') {
      return (
        <div className="border-b-4 border-double pb-0.5 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider`} style={headingCSS}>{capText}</span>
        </div>
      );
    } else if (hStyle === 'none') {
      return (
        <div className="mb-1.5 text-left">
          <span className={`${hSize} uppercase tracking-wider`} style={headingCSS}>{capText}</span>
        </div>
      );
    } else {
      return (
        <div className="mb-1.5 text-left border-b border-zinc-150 pb-0.5">
          <span className={`${hSize} uppercase tracking-wider`} style={headingCSS}>{capText}</span>
        </div>
      );
    }
  };

  // Render Section Selector (Renders all 21 standard resume sections)
  const renderSection = (sectionId: string) => {
    const spaceBottomStyle = { marginBottom: `${activeResume.entrySpacing || 8}px` };

    switch (sectionId) {
      case 'summary':
        if (!activeResume.summary) return null;
        return (
          <div key="summary" className="space-y-1 text-left" style={spaceBottomStyle}>
            {renderHeading('Professional Summary')}
            <p className="text-zinc-650 leading-relaxed text-justify text-[11px]" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
              {activeResume.summary}
            </p>
          </div>
        );

      case 'experience':
        const lines = (activeResume.experience || '').split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) return null;
        return (
          <div key="experience" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Work Experience')}
            <div className="space-y-3 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 6}px` }}>
              {lines.map((line, idx) => {
                const isHidden = line.startsWith('[HIDDEN]');
                if (isHidden) return null;
                const cleanLine = line.replace('[HIDDEN]', '').trim();
                const match = cleanLine.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\):\s*(.+)$/);
                if (match) {
                  return (
                    <div key={idx} className="space-y-0.5 text-left">
                      <div className="flex justify-between items-baseline font-bold text-zinc-850 text-[11px]" style={{ fontSize: fontSizeStyle }}>
                        <span>
                          {match[1].trim()}{' '}
                          <span className="font-semibold text-zinc-500">at {match[2].trim()}</span>
                        </span>
                        <span className="text-[9.5px] text-zinc-500 font-normal">{match[3].trim()}</span>
                      </div>
                      {bulletsRenderer(match[4].trim())}
                    </div>
                  );
                }
                return (
                  <div key={idx} className="text-[11px] text-zinc-600" style={{ fontSize: fontSizeStyle }}>
                    {cleanLine}
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
          // Fallback to legacy text parsing
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
            {renderHeading('Education')}
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
            {renderHeading('Technical Skills')}
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
        const projLines = (activeResume.projects || '').split('\n').filter(l => l.trim() !== '');
        if (projLines.length === 0) return null;
        return (
          <div key="projects" className="space-y-1.5 text-left" style={spaceBottomStyle}>
            {renderHeading('Key Projects')}
            <div className="space-y-2 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 6}px` }}>
              {projLines.map((line, idx) => {
                if (line.startsWith('[HIDDEN]')) return null;
                const cleanLine = line.replace('[HIDDEN]', '').trim();
                const colonIndex = cleanLine.indexOf(':');
                if (colonIndex > 0) {
                  const title = cleanLine.substring(0, colonIndex).trim();
                  const desc = cleanLine.substring(colonIndex + 1).trim();
                  return (
                    <div key={idx} className="space-y-0.5 text-left">
                      <span className="font-bold text-zinc-850 block text-[11px]" style={{ fontSize: fontSizeStyle }}>
                        {title}
                      </span>
                      <p className="text-zinc-600 leading-relaxed text-justify text-[11px]" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
                        {desc}
                      </p>
                    </div>
                  );
                }
                return <div key={idx} className="text-[11px] text-zinc-650">{cleanLine}</div>;
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
            {renderHeading('Certifications')}
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
            {renderHeading('Achievements & Honors')}
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
            {renderHeading('Languages')}
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
            {renderHeading('References')}
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
            {renderHeading('Awards & Recognitions')}
            <div className="space-y-1.5">
              {visibleAwards.map(aw => (
                <div key={aw.id} className="text-[11px] flex justify-between items-baseline" style={{ fontSize: fontSizeStyle }}>
                  <div>
                    <span className="font-bold text-zinc-800">{aw.title}</span>
                    <span className="text-zinc-500 text-[10px] ml-1.5">from {aw.issuer}</span>
                    {aw.description && <p className="text-zinc-500 text-[10px] mt-0.5">{aw.description}</p>}
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
            {renderHeading('Publications & Articles')}
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
            {renderHeading('Organizations & Memberships')}
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
            {renderHeading('Interests')}
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
            {renderHeading('Courses & Training')}
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
            {renderHeading('Volunteering Experience')}
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
            {renderHeading('Declaration')}
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
            {renderHeading('Patents')}
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
            {renderHeading('Hobbies')}
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
                {renderHeading(cust.title || 'Custom Section')}
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

    // Build the dynamic social fields array combining default, legacy and dynamic contact channels
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

    const dynamicFields = (activeResume.socialFields || [])
      .filter(f => !f.hidden && f.value?.trim())
      .map(f => ({ field: f.field, label: f.label || f.field, value: f.value }));

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
      if (name.includes('twitter') || name.includes('x.com')) return FaTwitter;
      if (name.includes('youtube')) return FaYoutube;
      if (name.includes('telegram')) return FaTelegram;
      if (name.includes('discord')) return FaDiscord;
      if (name.includes('slack')) return FaSlack;
      if (name.includes('medium')) return FaMedium;
      if (name.includes('instagram')) return FaInstagram;
      if (name.includes('skype')) return FaSkype;
      if (name.includes('facebook')) return FaFacebook;

      if (name.includes('portfolio') || name.includes('website') || name.includes('web') || name.includes('link')) return Globe;
      if (name.includes('nationality') || name.includes('citizen')) return Flag;
      if (name.includes('dob') || name.includes('birth')) return Calendar;
      if (name.includes('visa')) return Shield;
      if (name.includes('availability')) return Clock;
      
      return Info;
    };

    const socialItems = [...defaultFields, ...legacySocials, ...dynamicFields].map(item => ({
      ...item,
      Icon: getFieldIcon(item.field, item.label)
    }));

    const separator = activeResume.headerDetailsSeparator === 'bar' ? '|' : activeResume.headerDetailsSeparator === 'icon' ? 'icon' : '•';
    const showIcons = activeResume.linkIconEnabled !== false;

    return (
      <div className={`${alignTextClass} w-full`}>
        <h1 
          className={`${nameWeight} tracking-tight leading-tight`} 
          style={{ 
            color: nameColor,
            fontSize: activeResume.nameSizePx ? `${activeResume.nameSizePx}px` : '32px',
            textAlign: activeResume.nameAlign || 'left',
            letterSpacing: letterSpacingStyle === 'loose' ? '0.05em' : letterSpacingStyle === 'tight' ? '-0.02em' : 'normal',
            marginBottom: resTitle ? '4px' : '8px'
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
              marginBottom: '8px'
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

          const parseContactItem = (contact: { field: string; label: string; value?: string }) => {
            const val = contact.value?.trim() || '';
            if (!val) return { text: '', url: '' };

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
            display: 'inline-block',
            verticalAlign: 'middle',
            color: activeResume.linkColor || (activeResume.linkBlueColor !== false ? '#2563eb' : primaryHex),
            fontWeight: activeResume.linkFontWeight || 'normal',
            fontStyle: activeResume.linkItalic ? 'italic' : 'normal',
            textDecoration: activeResume.linkUnderline !== false ? 'underline' : 'none'
          };

          const textStyle: React.CSSProperties = {
            display: 'inline-block',
            verticalAlign: 'middle',
            color: activeResume.bodyTextColor || '#4b5563',
          };

          return activeResume.headerDetailsArrangement === 'stacked' ? (
            <div className={`w-full text-[9.5px] text-zinc-650 mt-1 font-mono ${alignTextClass}`} style={{ wordBreak: 'break-word' }}>
              {socialItems.map((item, idx) => {
                const Icon = item.Icon;
                const { text, url } = parseContactItem(item);
                if (!text) return null;
                return (
                  <div key={idx} style={{ margin: '2px 0' }}>
                    <span style={{ display: 'inline-block', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {showIcons && (
                        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', lineHeight: '1' }}>
                          <Icon className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
                        </span>
                      )}
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{text}</a>
                      ) : (
                        <span style={textStyle}>{text}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : activeResume.headerDetailsArrangement === 'grid' ? (
            <div className={`grid grid-cols-2 gap-x-4 gap-y-1 text-[9.5px] text-zinc-650 mt-1 font-mono max-w-lg ${activeResume.nameAlign === 'center' ? 'mx-auto' : ''}`}>
              {socialItems.map((item, idx) => {
                const Icon = item.Icon;
                const { text, url } = parseContactItem(item);
                if (!text) return null;
                return (
                  <div key={idx} style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      {showIcons && (
                        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', lineHeight: '1' }}>
                          <Icon className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
                        </span>
                      )}
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={linkStyle} className="truncate">{text}</a>
                      ) : (
                        <span style={textStyle} className="truncate">{text}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              className={`w-full text-[9.5px] text-zinc-650 mt-1 font-mono ${alignTextClass}`}
              style={{ wordBreak: 'break-word' }}
            >
              {socialItems.map((item, idx) => {
                const Icon = item.Icon;
                const { text, url } = parseContactItem(item);
                if (!text) return null;
                return (
                  <React.Fragment key={idx}>
                    <span 
                      style={{ 
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {showIcons && separator === 'icon' && (
                        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px', lineHeight: '1' }}>
                          <Icon className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
                        </span>
                      )}
                      {showIcons && separator !== 'icon' && idx === 0 && (
                        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px', lineHeight: '1' }}>
                          <Icon className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
                        </span>
                      )}
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{text}</a>
                      ) : (
                        <span style={textStyle}>{text}</span>
                      )}
                    </span>
                    {idx < socialItems.length - 1 && separator !== 'icon' && (
                      <span 
                        className="text-zinc-300 font-bold" 
                        style={{ 
                          display: 'inline-block', 
                          verticalAlign: 'middle', 
                          marginLeft: '8px', 
                          marginRight: '8px' 
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
