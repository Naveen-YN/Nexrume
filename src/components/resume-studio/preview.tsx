import React from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';
import { TemplateRenderer } from './templates';
import { 
  Phone, Mail, MapPin, Globe, 
  Award, BookOpen, Briefcase, GraduationCap, Code, 
  Plus, Trash2, ShieldAlert, Cpu, Database 
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { SiGithub } from 'react-icons/si';

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
  const primaryHex = activeResume.customColorHex || {
    indigo: '#4f46e5',
    emerald: '#059669',
    violet: '#7c3aed',
    amber: '#d97706',
    rose: '#e11d48',
    sky: '#0284c7',
    slate: '#3f3f46',
  }[activeResume.accentColor || 'indigo'] || '#4f46e5';

  // Fallbacks for profile details (placeholders instead of fake values for new users)
  const resName = activeResume.personalName || userProfile.name || 'Your Full Name';
  const resTitle = activeResume.personalTitle || userProfile.experience || 'Professional Headline';
  const resEmail = activeResume.personalEmail || userProfile.email || 'email@example.com';
  const resPhone = activeResume.personalPhone || userProfile.phone || '+1 (555) 000-0000';
  const resLocation = activeResume.personalLocation || userProfile.location || 'City, State';
  const resLinkedin = activeResume.personalLinkedin || userProfile.linkedin || '';
  const resGithub = activeResume.personalGithub || userProfile.github || '';
  const resPortfolio = activeResume.personalPortfolio || userProfile.portfolio || '';

  // Setup sizes
  const fontSizeStyle = activeResume.fontSizePt ? `${activeResume.fontSizePt}pt` : (activeResume.fontSize === 'sm' ? '11px' : activeResume.fontSize === 'lg' ? '14px' : '12.5px');
  const lineHeightStyle = activeResume.lineHeight ? `${activeResume.lineHeight}` : (activeResume.spacing === 'compact' ? '1.25' : activeResume.spacing === 'loose' ? '1.75' : '1.5');

  // Helper parser for legacy text experience, education, projects
  const bulletsRenderer = (desc: string) => {
    if (!desc) return null;
    const bullets = desc.split(/[\n]+/).filter(b => b.trim() !== '');
    if (bullets.length <= 1) {
      return (
        <p className="text-zinc-600 mt-0.5 leading-relaxed text-[11px]" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
          {desc}
        </p>
      );
    }
    return (
      <ul 
        className="pl-4 mt-1 space-y-0.5 text-zinc-600 list-disc text-[11px]" 
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
    const capText = activeResume.headingCapitalization === 'uppercase' ? text.toUpperCase() : text;
    const hSize = {
      S: 'text-[10px]',
      M: 'text-[11.5px]',
      L: 'text-[13px]',
      XL: 'text-[15px]'
    }[activeResume.headingSize || 'M'];

    const headingColor = activeResume.applyColorHeadings ? primaryHex : '#18181b';
    const lineColor = activeResume.applyColorHeadingsLine ? primaryHex : '#e4e4e7';

    const headingStyle: React.CSSProperties = {
      color: headingColor,
      fontWeight: 700,
      letterSpacing: '0.05em',
    };

    if (activeResume.headingStyle === 'underline') {
      return (
        <div className="border-b pb-0.5 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
        </div>
      );
    } else if (activeResume.headingStyle === 'left-block') {
      return (
        <div className="pl-2 border-l-4 mb-2 text-left" style={{ borderColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
        </div>
      );
    } else if (activeResume.headingStyle === 'background-fill') {
      return (
        <div className="px-2.5 py-1 mb-2 rounded text-left" style={{ backgroundColor: lineColor }}>
          <span className={`${hSize} uppercase tracking-wider font-extrabold`} style={{ ...headingStyle, color: '#ffffff' }}>
            {capText}
          </span>
        </div>
      );
    } else if (activeResume.headingStyle === 'wavy') {
      return (
        <div className="mb-2 text-left">
          <span className={`${hSize} uppercase tracking-wider`} style={headingStyle}>{capText}</span>
          <div className="h-0.5 mt-0.5" style={{ borderBottom: `2px wavy ${lineColor}` }}></div>
        </div>
      );
    } else if (activeResume.headingStyle === 'double-line') {
      return (
        <div className="border-b-4 border-double pb-0.5 mb-2 text-left" style={{ borderColor: lineColor }}>
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

  // Render Section Selector
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        if (!activeResume.summary) return null;
        return (
          <div key="summary" className="space-y-1 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('Professional Summary')}
            <p className="text-zinc-650 leading-relaxed text-justify text-[11px]" style={{ fontSize: fontSizeStyle, lineHeight: lineHeightStyle }}>
              {activeResume.summary}
            </p>
          </div>
        );

      case 'experience':
        // Parse legacy string experience to render neatly
        const lines = (activeResume.experience || '').split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) return null;
        return (
          <div key="experience" className="space-y-1.5 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('Work Experience')}
            <div className="space-y-3 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 6}px` }}>
              {lines.map((line, idx) => {
                let isHidden = line.startsWith('[HIDDEN]');
                if (isHidden) return null;
                const cleanLine = line.replace('[HIDDEN]', '').trim();
                const match = cleanLine.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\):\s*(.+)$/);
                if (match) {
                  return (
                    <div key={idx} className="space-y-0.5 text-left">
                      <div className="flex justify-between items-baseline font-bold text-zinc-850 text-[11px]" style={{ fontSize: fontSizeStyle }}>
                        <span>
                          {match[1].trim()}{' '}
                          <span className="font-normal text-zinc-500">at {match[2].trim()}</span>
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
        const eduLines = (activeResume.education || '').split('\n').filter(l => l.trim() !== '');
        if (eduLines.length === 0) return null;
        return (
          <div key="education" className="space-y-1.5 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('Education')}
            <div className="space-y-2 flex flex-col" style={{ gap: `${activeResume.entrySpacing || 4}px` }}>
              {eduLines.map((line, idx) => {
                if (line.startsWith('[HIDDEN]')) return null;
                const cleanLine = line.replace('[HIDDEN]', '').trim();
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

                  return (
                    <div key={idx} className="space-y-0.5 text-left">
                      <div className="flex justify-between items-baseline font-bold text-zinc-850 text-[11px]" style={{ fontSize: fontSizeStyle }}>
                        <span>
                          {school}{' '}
                          <span className="font-normal text-zinc-500">— {degree}</span>
                        </span>
                        <span className="text-[9.5px] text-zinc-500 font-normal font-mono">{duration}</span>
                      </div>
                      {gpa && <div className="text-[9.5px] text-zinc-500 font-semibold">GPA: {gpa}</div>}
                    </div>
                  );
                }
                return <div key={idx} className="text-[11px] text-zinc-600">{cleanLine}</div>;
              })}
            </div>
          </div>
        );

      case 'skills':
        if (!activeResume.skills) return null;
        return (
          <div key="skills" className="space-y-1 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('Technical Skills')}
            <div className="flex flex-wrap gap-1.5 pt-0.5 text-left">
              {activeResume.skills.split(',').map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-[9.5px] border border-zinc-200 font-semibold"
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
          <div key="projects" className="space-y-1.5 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
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
        if (certList.length === 0) return null;
        return (
          <div key="certifications" className="space-y-1 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('Certifications')}
            <div className="space-y-1.5 text-left">
              {certList.map(cert => (
                <div key={cert.id} className="text-[11px] flex justify-between items-baseline" style={{ fontSize: fontSizeStyle }}>
                  <span className="font-semibold text-zinc-800">
                    {cert.name}{' '}
                    <span className="font-normal text-zinc-500">— {cert.issuer}</span>
                  </span>
                  <span className="text-[9.5px] text-zinc-500">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        const achList = activeResume.achievementsList || [];
        if (achList.length === 0) return null;
        return (
          <div key="achievements" className="space-y-1 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('Achievements & Honors')}
            <div className="space-y-1.5">
              {achList.map(ach => (
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
        if (langList.length === 0) return null;
        return (
          <div key="languages" className="space-y-1 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('Languages')}
            <div className="flex flex-wrap gap-1.5">
              {langList.map(lang => (
                <span 
                  key={lang.id} 
                  className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-medium"
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
        if (refList.length === 0) return null;
        return (
          <div key="references" className="space-y-1.5 text-left" style={{ marginBottom: `${activeResume.entrySpacing || 8}px` }}>
            {renderHeading('References')}
            <div className="grid grid-cols-2 gap-3">
              {refList.map(ref => (
                <div key={ref.id} className="text-[10px] space-y-0.5 border-l-2 border-zinc-200 pl-2 leading-relaxed" style={{ fontSize: fontSizeStyle }}>
                  <span className="font-bold text-zinc-800 block">{ref.name}</span>
                  <span className="text-zinc-550 block">{ref.position} at {ref.company}</span>
                  <span className="text-zinc-500 font-mono block">{ref.contact}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Header Details Renderer (emojis replaced with Lucide icons)
  const renderHeader = () => {
    const alignClass = activeResume.headerAlignment === 'center' ? 'text-center justify-center' : 'text-left justify-start';
    const nameSizeClass = activeResume.nameSizePx 
      ? '' 
      : {
          XS: 'text-lg',
          S: 'text-xl',
          M: 'text-2xl',
          L: 'text-3xl',
          XL: 'text-4xl'
        }[activeResume.nameSize || 'M'];

    const nameWeight = activeResume.nameBold !== false ? 'font-extrabold' : 'font-semibold';
    const nameColor = activeResume.headingColor || '#18181b';
    const iconColor = primaryHex;

    const items = [
      { text: resEmail, key: 'email', show: !!resEmail, icon: Mail },
      { text: resPhone, key: 'phone', show: !!resPhone, icon: Phone },
      { text: resLocation, key: 'location', show: !!resLocation, icon: MapPin },
      { text: resLinkedin, key: 'linkedin', show: !!resLinkedin, icon: FaLinkedin },
      { text: resGithub, key: 'github', show: !!resGithub, icon: SiGithub },
      { text: resPortfolio, key: 'portfolio', show: !!resPortfolio, icon: Globe }
    ].filter(i => i.show);

    const delimiter = activeResume.headerDetailsSeparator === 'bar' ? '|' : activeResume.headerDetailsSeparator === 'icon' ? 'icon' : '•';

    return (
      <div className={`space-y-1.5 ${activeResume.headerAlignment === 'center' ? 'text-center' : 'text-left'}`}>
        <h1 
          className={`${nameSizeClass} ${nameWeight} tracking-tight leading-tight`} 
          style={{ 
            color: nameColor,
            fontSize: activeResume.nameSizePx ? `${activeResume.nameSizePx}px` : undefined,
            textAlign: activeResume.headerAlignment === 'center' ? 'center' : 'left'
          }}
        >
          {resName}
        </h1>
        <p 
          className="text-[10px] tracking-widest text-zinc-500 uppercase font-extrabold" 
          style={{ 
            color: activeResume.applyColorJobTitle ? primaryHex : undefined, 
            textAlign: activeResume.headerAlignment === 'center' ? 'center' : 'left' 
          }}
        >
          {resTitle}
        </p>
        
        {activeResume.headerDetailsArrangement === 'stacked' ? (
          <div className="flex flex-col gap-0.5 text-[9.5px] text-zinc-650 mt-1 font-mono">
            {items.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key} className={`flex items-center gap-1.5 ${alignClass}`}>
                  <Icon className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        ) : activeResume.headerDetailsArrangement === 'grid' ? (
          <div className={`grid grid-cols-2 gap-1 text-[9.5px] text-zinc-650 mt-1 font-mono max-w-md ${activeResume.headerAlignment === 'center' ? 'mx-auto' : ''}`}>
            {items.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-1.5 truncate">
                  <Icon className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
                  <span className="truncate">{item.text}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[9.5px] text-zinc-650 mt-1 font-mono ${alignClass}`}>
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.key}>
                  <div className="flex items-center gap-1">
                    {delimiter === 'icon' && <Icon className="w-3 h-3 shrink-0" style={{ color: iconColor }} />}
                    <span>{item.text}</span>
                  </div>
                  {idx < items.length - 1 && delimiter !== 'icon' && (
                    <span className="text-zinc-300 font-bold">{delimiter}</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
        <div className="w-full border-b border-zinc-200 pt-2"></div>
      </div>
    );
  };

  const renderFooter = () => {
    const showFooter = activeResume.footerPageNumbers || activeResume.footerEmail || activeResume.footerName || activeResume.footerCustomText;
    if (!showFooter) return null;

    return (
      <div className="border-t border-zinc-200 mt-6 pt-2.5 flex justify-between items-center text-[8.5px] text-zinc-450 font-mono">
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
      className="bg-white text-zinc-950 shadow-2xl transition-all duration-300 select-text w-full max-w-[21cm] mx-auto min-h-[29.7cm] flex flex-col justify-between border border-zinc-200 text-left origin-top"
      style={{
        transform: `scale(${zoom})`,
        fontFamily: activeResume.customFont ? `"${activeResume.customFont}", sans-serif` : (activeResume.fontFamily === 'serif' ? 'Georgia, serif' : activeResume.fontFamily === 'mono' ? 'Courier, monospace' : 'Inter, system-ui, sans-serif'),
        fontSize: fontSizeStyle,
        lineHeight: lineHeightStyle,
        paddingTop: activeResume.marginVertical !== undefined ? `${activeResume.marginVertical}mm` : '20mm',
        paddingBottom: activeResume.marginVertical !== undefined ? `${activeResume.marginVertical}mm` : '20mm',
        paddingLeft: activeResume.marginHorizontal !== undefined ? `${activeResume.marginHorizontal}mm` : '20mm',
        paddingRight: activeResume.marginHorizontal !== undefined ? `${activeResume.marginHorizontal}mm` : '20mm',
        backgroundColor: activeResume.backgroundColor || '#ffffff'
      }}
    >
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
