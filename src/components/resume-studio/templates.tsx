import React from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';
import { 
  Phone, Mail, MapPin, Globe, 
  Award, BookOpen, Briefcase, GraduationCap, Code, 
  CheckCircle, Star, ShieldAlert, Cpu, Database, 
  FileText, Activity, AlertCircle, Sparkles
} from 'lucide-react';

export const TEMPLATES = [
  { id: 'ats-classic', name: 'ATS Classic', category: 'ATS', desc: 'Standard top-to-bottom layout optimized for scanning.' },
  { id: 'ats-modern', name: 'ATS Modern', category: 'ATS', desc: 'Clean, double-divider grid layout for modern corporate roles.' },
  { id: 'ats-executive', name: 'ATS Executive', category: 'ATS', desc: 'Serif-focused, traditional layout for management and leads.' },
  { id: 'ats-professional', name: 'ATS Professional', category: 'ATS', desc: 'Compact spacing, left-header alignment for seasoned pros.' },
  { id: 'ats-compact', name: 'ATS Compact', category: 'ATS', desc: 'Ultra-efficient grid structure to fit rich experience in one page.' },
  
  { id: 'creative-blue', name: 'Creative Blue', category: 'Creative', desc: 'Stunning accent sidebar with elegant typography.' },
  { id: 'minimal-white', name: 'Minimal White', category: 'Creative', desc: 'Spacious, clean template with micro-borders.' },
  { id: 'designer-portfolio', name: 'Designer Portfolio', category: 'Creative', desc: 'Bold headings and tags suited for visual fields.' },
  { id: 'startup-style', name: 'Startup Style', category: 'Creative', desc: 'Vibrant, high-energy layout with modern badge elements.' },
  { id: 'gradient-bold', name: 'Gradient Bold', category: 'Creative', desc: 'Eye-catching top header gradient for a premium feel.' },
  
  { id: 'research-cv', name: 'Research CV', category: 'Academic', desc: 'Multi-page friendly format with citation grids.' },
  { id: 'university-cv', name: 'University CV', category: 'Academic', desc: 'Standard academic layout for admissions and research.' },
  { id: 'fellowship-cv', name: 'Fellowship CV', category: 'Academic', desc: 'Highlights honors, references, and educational milestones.' },
  { id: 'phd-cv', name: 'PhD CV', category: 'Academic', desc: 'Formal academic layout optimized for long publications list.' },
  
  { id: 'software-engineer', name: 'Software Engineer', category: 'Tech', desc: 'Showcases side-by-side technical skills and project grids.' },
  { id: 'ai-ml-engineer', name: 'AI/ML Engineer', category: 'Tech', desc: 'Highlights models, datasets, and publications prominently.' },
  { id: 'data-scientist', name: 'Data Scientist', category: 'Tech', desc: 'Structured analytics panels and KPI bullet points.' },
  { id: 'devops-engineer', name: 'DevOps Engineer', category: 'Tech', desc: 'Highlights tools, system structures, and certifications.' },
  
  { id: 'college-graduate', name: 'College Graduate', category: 'Fresher', desc: 'Puts education at the top and highlights coursework.' },
  { id: 'internship-resume', name: 'Internship Resume', category: 'Fresher', desc: 'Objective and portfolio-oriented layout.' },
  { id: 'entry-level-sde', name: 'Entry-Level SDE', category: 'Fresher', desc: 'Emphasizes coding achievements and personal projects.' }
];

export interface TemplateRenderProps {
  activeResume: ResumeVersion;
  userProfile: UserProfile;
  primaryHex: string;
  fontSizeStyle: string;
  lineHeightStyle: string;
  renderHeading: (text: string) => React.ReactNode;
  bulletsRenderer: (desc: string) => React.ReactNode;
  renderHeader: () => React.ReactNode;
  renderFooter: () => React.ReactNode;
  renderSection: (sectionId: string) => React.ReactNode;
}

export const TemplateRenderer: React.FC<TemplateRenderProps> = ({
  activeResume,
  userProfile,
  primaryHex,
  fontSizeStyle,
  lineHeightStyle,
  renderHeading,
  bulletsRenderer,
  renderHeader,
  renderFooter,
  renderSection
}) => {
  const { template = 'ats-classic', layoutColumns = 'one', sectionOrder = [] } = activeResume;

  // Render a clean photo block based on custom size and style settings
  const renderPhotoBlock = () => {
    if (!activeResume.showPhoto || !activeResume.personalPhoto) return null;
    const isCircle = activeResume.photoStyle === 'circle';
    const size = activeResume.photoSize || 80;
    return (
      <div 
        className={`border border-zinc-200 overflow-hidden shadow-sm mx-auto sm:mx-0 shrink-0`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: isCircle ? '50%' : '12px',
        }}
      >
        <img 
          src={activeResume.personalPhoto} 
          alt="Profile" 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  };

  const isTwoColumn = layoutColumns === 'two' || ['creative-blue', 'software-engineer'].includes(template);

  // Creative side column templates
  if (template === 'creative-blue') {
    return (
      <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 bg-white text-zinc-900">
        <div className="grid grid-cols-12 items-stretch h-full flex-1">
          {/* Side Column (Accent Background) */}
          <div 
            className="col-span-4 p-5 text-white flex flex-col gap-4 border-r border-zinc-200"
            style={{ backgroundColor: primaryHex }}
          >
            {renderPhotoBlock()}
            <div className="text-white space-y-4">
              {renderHeader()}
              {sectionOrder
                .filter(s => ['skills', 'languages', 'interests', 'references'].includes(s))
                .map(s => (
                  <div key={s} className="text-white">
                    {renderSection(s)}
                  </div>
                ))}
            </div>
          </div>
          {/* Main Column */}
          <div className="col-span-8 p-6 flex flex-col gap-4">
            {sectionOrder
              .filter(s => ['summary', 'experience', 'projects', 'education', 'certifications', 'achievements', 'publications'].includes(s))
              .map(s => renderSection(s))}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-zinc-150 bg-zinc-50">
          {renderFooter()}
        </div>
      </div>
    );
  }

  // Tech / Software Engineer template with split columns
  if (template === 'software-engineer') {
    return (
      <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 p-6 bg-white text-zinc-900">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b border-zinc-200">
            <div className="flex-1">
              {renderHeader()}
            </div>
            {renderPhotoBlock()}
          </div>
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Tech Skills & Credentials Sidebar */}
            <div className="col-span-4 border-r border-zinc-100 pr-5 flex flex-col gap-4">
              {sectionOrder
                .filter(s => ['skills', 'certifications', 'languages', 'interests'].includes(s))
                .map(s => renderSection(s))}
            </div>
            {/* SDE Experience & Projects Main */}
            <div className="col-span-8 flex flex-col gap-4">
              {sectionOrder
                .filter(s => ['summary', 'experience', 'projects', 'education', 'achievements', 'publications', 'references'].includes(s))
                .map(s => renderSection(s))}
            </div>
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  }

  // Gradient Bold Header Template
  if (template === 'gradient-bold') {
    return (
      <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 bg-white text-zinc-900">
        <div>
          {/* Stunning bold header banner */}
          <div 
            className="p-6 text-white text-center flex flex-col items-center gap-3 relative shadow-inner"
            style={{ 
              background: `linear-gradient(135deg, ${primaryHex} 0%, #1e1b4b 100%)` 
            }}
          >
            {renderPhotoBlock()}
            <div className="text-white text-center">
              {renderHeader()}
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {isTwoColumn ? (
              <div className="grid grid-cols-12 gap-6 items-stretch">
                <div className="col-span-4 flex flex-col gap-4 border-r border-zinc-150 pr-4.5">
                  {sectionOrder
                    .filter(s => ['summary', 'skills', 'certifications', 'languages', 'interests', 'references'].includes(s))
                    .map(s => renderSection(s))}
                </div>
                <div className="col-span-8 flex flex-col gap-4">
                  {sectionOrder
                    .filter(s => ['experience', 'education', 'projects', 'achievements', 'publications'].includes(s))
                    .map(s => renderSection(s))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sectionOrder.map(s => renderSection(s))}
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-2">
          {renderFooter()}
        </div>
      </div>
    );
  }

  // Classic standard template (Default fallback for ATS)
  return (
    <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 p-6 bg-white text-zinc-900">
      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1">
            {renderHeader()}
          </div>
          {renderPhotoBlock()}
        </div>
        
        {isTwoColumn ? (
          <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-4 flex flex-col gap-4 border-r border-zinc-150 pr-4.5">
              {sectionOrder
                .filter(s => ['summary', 'skills', 'certifications', 'languages', 'interests', 'references'].includes(s))
                .map(s => renderSection(s))}
            </div>
            <div className="col-span-8 flex flex-col gap-4">
              {sectionOrder
                .filter(s => ['experience', 'education', 'projects', 'achievements', 'publications'].includes(s))
                .map(s => renderSection(s))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sectionOrder.map(s => renderSection(s))}
          </div>
        )}
      </div>
      {renderFooter()}
    </div>
  );
};
