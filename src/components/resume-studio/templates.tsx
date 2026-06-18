import React from 'react';
import { ResumeVersion, UserProfile } from '../../db/mockData';

export const TEMPLATES = [
  // 1. ATS / Corporate Categories (12 templates)
  { id: 'ats-classic', name: 'ATS Classic', category: 'ATS', desc: 'Standard top-to-bottom layout optimized for scanning.' },
  { id: 'ats-modern', name: 'ATS Modern', category: 'ATS', desc: 'Clean, double-divider grid layout for modern corporate roles.' },
  { id: 'ats-executive', name: 'ATS Executive', category: 'ATS', desc: 'Serif-focused, traditional layout for management and leads.' },
  { id: 'ats-professional', name: 'ATS Professional', category: 'ATS', desc: 'Compact spacing, left-header alignment for seasoned pros.' },
  { id: 'ats-compact', name: 'ATS Compact', category: 'ATS', desc: 'Ultra-efficient grid structure to fit rich experience in one page.' },
  { id: 'ats-basic', name: 'ATS Basic', category: 'ATS Basic', desc: 'Minimal styling, black & white plain text layout.' },
  { id: 'ats-minimalist', name: 'ATS Minimalist', category: 'ATS Basic', desc: 'Clean, spacious, single column format.' },
  { id: 'ats-standard', name: 'ATS Standard', category: 'ATS Basic', desc: 'Standard layout recommended for federal and bank applications.' },
  { id: 'ats-formal', name: 'ATS Formal', category: 'ATS Executive', desc: 'Symmetrical traditional format for corporate governance.' },
  { id: 'ats-dense', name: 'ATS Dense', category: 'ATS Basic', desc: 'Very small margins and tight line heights for long resumes.' },
  { id: 'ats-grid', name: 'ATS Grid', category: 'ATS Modern', desc: 'Neat grid rows for skills and certifications.' },
  { id: 'ats-elegant', name: 'ATS Elegant', category: 'ATS Executive', desc: 'Garamond font layout with centered classic headers.' },

  // 2. Professional / Professional Blue / Corporate Black (13 templates)
  { id: 'prof-navy', name: 'Tech Navy', category: 'Professional Blue', desc: 'Deep Navy accents with bold horizontal dividers.' },
  { id: 'prof-emerald', name: 'Emerald Leader', category: 'Professional', desc: 'Mint emerald accenting for sustainability and tech roles.' },
  { id: 'prof-slate', name: 'Slate Manager', category: 'Professional', desc: 'Slate gray text headers with clean right-aligned dates.' },
  { id: 'prof-charcoal', name: 'Charcoal Grid', category: 'Professional', desc: 'Charcoal headers with double borders.' },
  { id: 'prof-royal', name: 'Royal Executive', category: 'Professional Blue', desc: 'Royal blue accents with elegant left-block style.' },
  { id: 'prof-amber', name: 'Amber Growth', category: 'Professional', desc: 'Amber gold highlight colors for business management.' },
  { id: 'prof-crimson', name: 'Crimson Edge', category: 'Professional', desc: 'Burgundy crimson headers with left vertical lines.' },
  { id: 'prof-corporate-black', name: 'Corporate Black', category: 'Corporate Black', desc: 'Premium deep dark headers and thick divider lines.' },
  { id: 'prof-steel', name: 'Steel Tech', category: 'Corporate Black', desc: 'Steel gray headers, clean modern borders.' },
  { id: 'prof-classic-blue', name: 'Classic Blue', category: 'Professional Blue', desc: 'FlowCV-like classic corporate blue layout.' },
  { id: 'prof-teal', name: 'Teal Creative', category: 'Professional Blue', desc: 'Dark teal color theme, compact and neat.' },
  { id: 'prof-indigo', name: 'Indigo SDE', category: 'Professional', desc: 'Indigo accents, highly recommended for engineering leaders.' },
  { id: 'prof-gold', name: 'Gold Premium', category: 'Professional', desc: 'Gold accent lettering with sophisticated serif headers.' },

  // 3. Minimal / Modern Purple / Creative (13 templates)
  { id: 'min-white', name: 'Spacious White', category: 'Minimal White', desc: 'Clean layout with wide margins and light borders.' },
  { id: 'min-spacious', name: 'Minimal Spacious', category: 'Minimal White', desc: 'Wide margins, light gray dividers, minimalist styling.' },
  { id: 'min-accent', name: 'Border Accent', category: 'Minimal White', desc: 'Thin top border accent with modern typeface.' },
  { id: 'min-centered', name: 'Centered Simple', category: 'Minimal White', desc: 'Symmetrical centered headers with no dividers.' },
  { id: 'min-editorial', name: 'Editorial Serif', category: 'Minimal White', desc: 'New York Times style serif typeface layout.' },
  { id: 'creative-purple', name: 'Modern Purple', category: 'Modern Purple', desc: 'Vibrant purple accenting with badge-style skills.' },
  { id: 'creative-gradient', name: 'Gradient Bold', category: 'Creative', desc: 'Eye-catching top header gradient for a premium feel.' },
  { id: 'creative-sidebar-left', name: 'Creative Left Sidebar', category: 'Creative', desc: 'Accent left sidebar containing contact and skills.' },
  { id: 'creative-sidebar-right', name: 'Creative Right Sidebar', category: 'Creative', desc: 'Accent right sidebar containing contact and skills.' },
  { id: 'creative-designer', name: 'Designer Board', category: 'Designer', desc: 'Bold headings and tags suited for visual fields.' },
  { id: 'creative-portfolio', name: 'Portfolio Visual', category: 'Portfolio', desc: 'Modern badge layout optimized for project showcases.' },
  { id: 'creative-uiux', name: 'UI/UX Visual', category: 'Designer', desc: 'Inter font with large visual headings.' },
  { id: 'creative-neon', name: 'Neon Startup', category: 'Creative', desc: 'Neon pink/violet accents, startup vibes.' },

  // 4. Tech Categories (10 templates)
  { id: 'tech-sde', name: 'Software Engineer', category: 'Software Engineer', desc: 'Showcases side-by-side technical skills and project grids.' },
  { id: 'tech-ai', name: 'AI Engineer', category: 'AI Engineer', desc: 'Highlights models, datasets, and publications prominently.' },
  { id: 'tech-data', name: 'Data Scientist', category: 'Data Scientist', desc: 'Structured analytics panels and KPI bullet points.' },
  { id: 'tech-devops', name: 'DevOps Engineer', category: 'DevOps Engineer', desc: 'Highlights tools, system structures, and certifications.' },
  { id: 'tech-cyber', name: 'Cyber Security', category: 'Tech', desc: 'Security tools, clearance status, and vulnerability projects.' },
  { id: 'tech-cloud', name: 'Cloud Solutions', category: 'Tech', desc: 'Multi-cloud badges and infrastructure diagrams.' },
  { id: 'tech-systems', name: 'Systems Architect', category: 'Tech', desc: 'Deep technical blocks and architecture descriptions.' },
  { id: 'tech-frontend', name: 'Frontend Engineer', category: 'Tech', desc: 'Modern styling focused on user interfaces.' },
  { id: 'tech-backend', name: 'Backend Developer', category: 'Tech', desc: 'Highlights API architectures and caching layers.' },
  { id: 'tech-fullstack', name: 'Full Stack Engineer', category: 'Tech', desc: 'Balanced layout for frontend, backend, and cloud.' },

  // 5. Student / Graduate Categories (5 templates)
  { id: 'student-grad', name: 'College Graduate', category: 'Graduate', desc: 'Puts education at the top and highlights coursework.' },
  { id: 'student-intern', name: 'Internship Ready', category: 'Internship', desc: 'Objective and portfolio-oriented layout.' },
  { id: 'student-fresher', name: 'Fresher Classic', category: 'Fresher', desc: 'Emphasizes coding achievements and personal projects.' },
  { id: 'student-entry', name: 'Entry Level SDE', category: 'Student', desc: 'Highlights hackathons, skills, and coding scores.' },
  { id: 'student-associate', name: 'Associate Standard', category: 'Student', desc: 'Clean, simple layout for first career steps.' }
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

// Layout Configuration mapping for all 50 template styles
export const TEMPLATE_STYLES: Record<string, {
  layoutColumns?: 'one' | 'two' | 'sidebar-left' | 'sidebar-right';
  headerStyle?: 'centered' | 'left' | 'corporate' | 'card' | 'gradient';
  headingStyle?: 'simple' | 'underline' | 'left-block' | 'background-fill' | 'wavy' | 'double-line' | 'none';
  fontFamily?: 'sans' | 'serif' | 'mono';
  presetColor?: string;
  dividerStyle?: 'solid' | 'dashed' | 'double' | 'wavy' | 'none';
}> = {
  // ATS
  'ats-classic': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans' },
  'ats-modern': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'simple', fontFamily: 'sans', dividerStyle: 'solid' },
  'ats-executive': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'double-line', fontFamily: 'serif' },
  'ats-professional': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'left-block', fontFamily: 'sans' },
  'ats-compact': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'simple', fontFamily: 'sans' },
  'ats-basic': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'none', fontFamily: 'sans', dividerStyle: 'none' },
  'ats-minimalist': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'none', fontFamily: 'sans', dividerStyle: 'none' },
  'ats-standard': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'serif' },
  'ats-formal': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'underline', fontFamily: 'serif' },
  'ats-dense': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'simple', fontFamily: 'sans' },
  'ats-grid': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'simple', fontFamily: 'sans' },
  'ats-elegant': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'underline', fontFamily: 'serif' },

  // Professional
  'prof-navy': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#1e3a8a' },
  'prof-emerald': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#059669' },
  'prof-slate': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'simple', fontFamily: 'sans', presetColor: '#4b5563' },
  'prof-charcoal': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'double-line', fontFamily: 'sans', presetColor: '#374151' },
  'prof-royal': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'left-block', fontFamily: 'sans', presetColor: '#1d4ed8' },
  'prof-amber': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#b45309' },
  'prof-crimson': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'left-block', fontFamily: 'sans', presetColor: '#991b1b' },
  'prof-corporate-black': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#09090b', dividerStyle: 'solid' },
  'prof-steel': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#64748b' },
  'prof-classic-blue': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#2563eb' },
  'prof-teal': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#0d9488' },
  'prof-indigo': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#4f46e5' },
  'prof-gold': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'underline', fontFamily: 'serif', presetColor: '#854d0e' },

  // Minimal / Creative
  'min-white': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'none', fontFamily: 'sans', presetColor: '#18181b', dividerStyle: 'none' },
  'min-spacious': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'none', fontFamily: 'sans', presetColor: '#27272a', dividerStyle: 'none' },
  'min-accent': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'none', fontFamily: 'sans', presetColor: '#0f172a' },
  'min-centered': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'none', fontFamily: 'sans', dividerStyle: 'none' },
  'min-editorial': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'double-line', fontFamily: 'serif', presetColor: '#111827' },
  'creative-purple': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'background-fill', fontFamily: 'sans', presetColor: '#7c3aed' },
  'creative-gradient': { layoutColumns: 'one', headerStyle: 'gradient', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#6366f1' },
  'creative-sidebar-left': { layoutColumns: 'sidebar-left', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#4f46e5' },
  'creative-sidebar-right': { layoutColumns: 'sidebar-right', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#4f46e5' },
  'creative-designer': { layoutColumns: 'two', headerStyle: 'left', headingStyle: 'background-fill', fontFamily: 'sans', presetColor: '#db2777' },
  'creative-portfolio': { layoutColumns: 'two', headerStyle: 'centered', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#06b6d4' },
  'creative-uiux': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#ec4899' },
  'creative-neon': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'wavy', fontFamily: 'sans', presetColor: '#d946ef' },

  // Tech
  'tech-sde': { layoutColumns: 'two', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#4f46e5' },
  'tech-ai': { layoutColumns: 'two', headerStyle: 'left', headingStyle: 'left-block', fontFamily: 'sans', presetColor: '#8b5cf6' },
  'tech-data': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#059669' },
  'tech-devops': { layoutColumns: 'two', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#0891b2' },
  'tech-cyber': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'left-block', fontFamily: 'mono', presetColor: '#10b981' },
  'tech-cloud': { layoutColumns: 'two', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#0284c7' },
  'tech-systems': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#475569' },
  'tech-frontend': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#f43f5e' },
  'tech-backend': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#0f172a' },
  'tech-fullstack': { layoutColumns: 'two', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#6366f1' },

  // Student
  'student-grad': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#2563eb' },
  'student-intern': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#0891b2' },
  'student-fresher': { layoutColumns: 'one', headerStyle: 'centered', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#4f46e5' },
  'student-entry': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'left-block', fontFamily: 'sans', presetColor: '#7c3aed' },
  'student-associate': { layoutColumns: 'one', headerStyle: 'left', headingStyle: 'underline', fontFamily: 'sans', presetColor: '#4b5563' }
};

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
  const { template = 'ats-classic', sectionOrder = [] } = activeResume;

  // Read layout configuration mapping overrides for selected template ID
  const config = TEMPLATE_STYLES[template] || TEMPLATE_STYLES['ats-classic'];
  const layout = activeResume.layoutColumns || config.layoutColumns || 'one';

  // Render photo block
  const renderPhotoBlock = () => {
    if (!activeResume.showPhoto || !activeResume.personalPhoto) return null;
    const isCircle = activeResume.photoStyle === 'circle';
    const isRounded = activeResume.photoStyle === 'rounded';
    const size = activeResume.photoSize || 80;
    
    return (
      <div 
        className="border border-zinc-200 overflow-hidden shadow-xs mx-auto sm:mx-0 shrink-0 select-none print:shadow-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: isCircle ? '50%' : isRounded ? '16px' : '0px',
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

  // Gradient layout header banner
  const isGradientHeader = template === 'creative-gradient';

  // Section classifications for sidebar
  const sidebarSectionList = ['skills', 'certifications', 'languages', 'interests', 'hobbies', 'courses', 'references', 'signature', 'declaration'];

  // Columns Layout Renderings
  if (layout === 'sidebar-left' || template === 'creative-sidebar-left') {
    return (
      <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 bg-white text-zinc-900">
        <div>
          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-start gap-4">
            <div className="flex-1">{renderHeader()}</div>
            {renderPhotoBlock()}
          </div>
          {/* Columns */}
          <div className="grid grid-cols-12 items-stretch border-t border-zinc-150">
            {/* Left Sidebar */}
            <div className="col-span-4 bg-zinc-50/50 p-5 border-r border-zinc-150 flex flex-col gap-4">
              {sectionOrder
                .filter(s => sidebarSectionList.includes(s))
                .map(s => renderSection(s))}
            </div>
            {/* Right Main Content */}
            <div className="col-span-8 p-6 flex flex-col gap-4">
              {sectionOrder
                .filter(s => !sidebarSectionList.includes(s))
                .map(s => renderSection(s))}
            </div>
          </div>
        </div>
        <div className="px-6 py-2 border-t border-zinc-150 bg-zinc-50">
          {renderFooter()}
        </div>
      </div>
    );
  }

  if (layout === 'sidebar-right' || template === 'creative-sidebar-right') {
    return (
      <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 bg-white text-zinc-900">
        <div>
          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-start gap-4">
            <div className="flex-1">{renderHeader()}</div>
            {renderPhotoBlock()}
          </div>
          {/* Columns */}
          <div className="grid grid-cols-12 items-stretch border-t border-zinc-150">
            {/* Left Main Content */}
            <div className="col-span-8 p-6 flex flex-col gap-4 border-r border-zinc-150">
              {sectionOrder
                .filter(s => !sidebarSectionList.includes(s))
                .map(s => renderSection(s))}
            </div>
            {/* Right Sidebar */}
            <div className="col-span-4 bg-zinc-50/50 p-5 flex flex-col gap-4">
              {sectionOrder
                .filter(s => sidebarSectionList.includes(s))
                .map(s => renderSection(s))}
            </div>
          </div>
        </div>
        <div className="px-6 py-2 border-t border-zinc-150 bg-zinc-50">
          {renderFooter()}
        </div>
      </div>
    );
  }

  if (layout === 'two' || ['tech-sde', 'tech-ai', 'tech-devops', 'tech-fullstack', 'creative-designer'].includes(template)) {
    return (
      <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 p-6 bg-white text-zinc-900">
        <div>
          <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-zinc-150">
            <div className="flex-1">{renderHeader()}</div>
            {renderPhotoBlock()}
          </div>
          <div className="grid grid-cols-12 gap-6">
            {/* Left 50% Column */}
            <div className="col-span-6 flex flex-col gap-4">
              {sectionOrder
                .filter((_, idx) => idx % 2 === 0)
                .map(s => renderSection(s))}
            </div>
            {/* Right 50% Column */}
            <div className="col-span-6 flex flex-col gap-4">
              {sectionOrder
                .filter((_, idx) => idx % 2 !== 0)
                .map(s => renderSection(s))}
            </div>
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  }

  if (isGradientHeader) {
    return (
      <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 bg-white text-zinc-900">
        <div>
          {/* Bold Header Banner */}
          <div 
            className="p-6 text-white text-center flex flex-col items-center gap-3 relative shadow-inner"
            style={{ 
              background: `linear-gradient(135deg, ${primaryHex} 0%, #09090b 100%)` 
            }}
          >
            {renderPhotoBlock()}
            <div className="text-white text-center w-full">
              {renderHeader()}
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {sectionOrder.map(s => renderSection(s))}
          </div>
        </div>
        <div className="px-6 py-2 border-t border-zinc-150 bg-zinc-50">
          {renderFooter()}
        </div>
      </div>
    );
  }

  // Fallback to Single Column layout (ats-classic, min-white, etc.)
  return (
    <div className="flex flex-col justify-between h-full min-h-[29.7cm] flex-1 p-6 bg-white text-zinc-900">
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">{renderHeader()}</div>
          {renderPhotoBlock()}
        </div>
        <div className="flex flex-col gap-4">
          {sectionOrder.map(s => renderSection(s))}
        </div>
      </div>
      {renderFooter()}
    </div>
  );
};
