import React, { useState } from 'react';
import { ResumeVersion } from '../../db/mockData';
import { 
  Palette, Type, AlignLeft, AlignCenter, AlignRight, 
  ChevronUp, ChevronDown, Move, Compass, Globe, LayoutGrid, 
  Columns, Image, Link as LinkIcon, MoreHorizontal, Menu, 
  Sliders, Calendar, SlidersHorizontal, CheckSquare, Settings
} from 'lucide-react';
import { TEMPLATES, TEMPLATE_STYLES } from './templates';

interface EditorCustomizeProps {
  activeResume: ResumeVersion;
  onUpdateResume: (updates: Partial<ResumeVersion>) => void;
}

type CustomizeSubTab = 'document' | 'templates' | 'layout' | 'font' | 'header' | 'colors' | 'photo' | 'links' | 'footer' | 'sections';

export const EditorCustomize: React.FC<EditorCustomizeProps> = ({
  activeResume,
  onUpdateResume
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CustomizeSubTab>('templates');

  const fontFamilies = [
    { id: 'Inter', name: 'Inter (Sans-Serif)' },
    { id: 'Roboto', name: 'Roboto' },
    { id: 'Georgia', name: 'Georgia (Serif)' },
    { id: 'Playfair Display', name: 'Playfair Display' },
    { id: 'Courier Prime', name: 'Courier Prime (Mono)' },
    { id: 'JetBrains Mono', name: 'JetBrains Mono' },
    { id: 'Outfit', name: 'Outfit (Modern)' },
    { id: 'Lora', name: 'Lora' },
    { id: 'Merriweather', name: 'Merriweather' },
    { id: 'Rubik', name: 'Rubik' }
  ];

  const presetThemes = [
    { name: 'Dark Indigo', hex: '#4f46e5', label: 'Tech' },
    { name: 'Navy Blue', hex: '#1e3a8a', label: 'Corporate' },
    { name: 'Modern Purple', hex: '#7c3aed', label: 'Creative' },
    { name: 'Emerald Green', hex: '#059669', label: 'Management' },
    { name: 'Crimson Red', hex: '#be123c', label: 'Executive' },
    { name: 'Corporate Charcoal', hex: '#3f3f46', label: 'Standard' }
  ];

  // Reordering handlers for Layout Builder
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...(activeResume.sectionOrder || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    
    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    onUpdateResume({ sectionOrder: list });
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

  // Sub tabs config
  const subTabsList = [
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'document', label: 'Document', icon: Globe },
    { id: 'layout', label: 'Layout', icon: Columns },
    { id: 'font', label: 'Font', icon: Type },
    { id: 'header', label: 'Header', icon: AlignLeft },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'photo', label: 'Photo', icon: Image },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'footer', label: 'Footer', icon: MoreHorizontal },
    { id: 'sections', label: 'Sections', icon: Menu }
  ];

  return (
    <div className="space-y-5 text-xs">
      {/* Sub Tabs Horizontal Menu Grid */}
      <div className="grid grid-cols-5 gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-850">
        {subTabsList.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer gap-1 text-center truncate ${
                isActive ? 'bg-indigo-650 text-white shadow' : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/40'
              }`}
            >
              <TabIcon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: DOCUMENT */}
      {activeSubTab === 'document' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-450 block uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Document Formatting</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px]">Document Language</label>
              <select
                value={activeResume.language || 'English (UK)'}
                onChange={e => onUpdateResume({ language: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none"
              >
                <option value="English (UK)">English (UK)</option>
                <option value="English (US)">English (US)</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="French">French</option>
                <option value="Italian">Italian</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px]">Date Format</label>
              <select
                value={activeResume.dateFormat || 'DD MMM YYYY'}
                onChange={e => onUpdateResume({ dateFormat: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none"
              >
                <option value="DD MMM YYYY">24 Jan 2022</option>
                <option value="MM/YYYY">01/2022</option>
                <option value="YYYY-MM-DD">2022-01-24</option>
                <option value="MMM YYYY">Jan 2022</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px]">Page Size</label>
              <select
                value={activeResume.pageFormat || 'A4'}
                onChange={e => onUpdateResume({ pageFormat: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none"
              >
                <option value="A4">A4 Standard</option>
                <option value="Letter">US Letter</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TEMPLATES */}
      {activeSubTab === 'templates' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-3 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates Library</span>
          </span>

          <p className="text-[9.5px] text-zinc-550 leading-normal">
            Switch template layouts instantly. All template selections are 100% compatible with ATS scanners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {TEMPLATES.map(tmpl => {
              const isSelected = activeResume.template === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => onUpdateResume({ template: tmpl.id })}
                  className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-950/20 border-indigo-600 text-white' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 text-zinc-350'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-[11px]">{tmpl.name}</span>
                    <span className="text-[8.5px] font-black uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-zinc-500">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-zinc-500 mt-1 leading-normal">{tmpl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LAYOUT */}
      {activeSubTab === 'layout' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-indigo-400" />
            <span>Layout Columns</span>
          </span>

          <div className="space-y-3.5">
            <label className="text-zinc-500 font-bold block uppercase text-[9px]">Columns Structure</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'one', label: 'One Column' },
                { id: 'two', label: 'Two Column' },
                { id: 'sidebar-left', label: 'Sidebar Left' },
                { id: 'sidebar-right', label: 'Sidebar Right' }
              ].map(layout => (
                <button
                  key={layout.id}
                  onClick={() => onUpdateResume({ layoutColumns: layout.id as any })}
                  className={`py-3 rounded-lg border text-center font-bold transition cursor-pointer text-[10px] ${
                    (activeResume.layoutColumns || 'one') === layout.id
                      ? 'bg-indigo-650 border-indigo-600 text-white'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-300'
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500">
                <span>Entry Spacing</span>
                <span className="font-mono text-zinc-400">{activeResume.entrySpacing || 12}px</span>
              </div>
              <input
                type="range"
                min={4}
                max={24}
                value={activeResume.entrySpacing || 12}
                onChange={e => onUpdateResume({ entrySpacing: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-450 mt-4 select-none">
                <input 
                  type="checkbox" 
                  checked={activeResume.indentBody !== false} 
                  onChange={e => onUpdateResume({ indentBody: e.target.checked })} 
                  className="rounded accent-indigo-650"
                />
                <span>Indent Bullet Points</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FONT */}
      {activeSubTab === 'font' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span>Typography Settings</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px]">Font Family</label>
              <select
                value={activeResume.customFont || 'Inter'}
                onChange={e => onUpdateResume({ customFont: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none text-[11px]"
              >
                {fontFamilies.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px]">Font Spacing</label>
              <select
                value={activeResume.letterSpacing || 'normal'}
                onChange={e => onUpdateResume({ letterSpacing: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none text-[11px]"
              >
                <option value="tight">Tight</option>
                <option value="normal">Normal</option>
                <option value="loose">Loose</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-900">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500">
                <span>Font Size</span>
                <span className="font-mono text-zinc-400">{activeResume.fontSizePt || 10.5}pt</span>
              </div>
              <input
                type="range"
                min={8}
                max={16}
                step={0.5}
                value={activeResume.fontSizePt || 10.5}
                onChange={e => onUpdateResume({ fontSizePt: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500">
                <span>Line Height</span>
                <span className="font-mono text-zinc-400">{activeResume.lineHeight || 1.25}</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={2.0}
                step={0.05}
                value={activeResume.lineHeight || 1.25}
                onChange={e => onUpdateResume({ lineHeight: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500">
                <span>Margins (H & V)</span>
                <span className="font-mono text-zinc-400">{activeResume.marginVertical || 12}mm</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={activeResume.marginVertical || 12}
                onChange={e => onUpdateResume({ marginVertical: parseInt(e.target.value), marginHorizontal: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: HEADER */}
      {activeSubTab === 'header' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>Header & Name Controls</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px]">Name Alignment</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded p-0.5 max-w-xs">
                {[
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'right', icon: AlignRight }
                ].map(align => {
                  const Icon = align.icon;
                  return (
                    <button
                      key={align.id}
                      onClick={() => onUpdateResume({ nameAlign: align.id as any, headerAlignment: align.id as any })}
                      className={`flex-1 py-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                        activeResume.nameAlign === align.id ? 'bg-indigo-650 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px]">Details Arrangement</label>
              <select
                value={activeResume.headerDetailsArrangement || 'inline'}
                onChange={e => onUpdateResume({ headerDetailsArrangement: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none text-[11px]"
              >
                <option value="inline">Inline (Saves space)</option>
                <option value="stacked">Stacked (Vertical list)</option>
                <option value="grid">Grid (2 columns)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-900">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500">
                <span>Name Font Size</span>
                <span className="font-mono text-zinc-400">{activeResume.nameSizePx || 32}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                value={activeResume.nameSizePx || 32}
                onChange={e => onUpdateResume({ nameSizePx: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px] mb-1">Details Separator</label>
              <select
                value={activeResume.headerDetailsSeparator || 'bullet'}
                onChange={e => onUpdateResume({ headerDetailsSeparator: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 outline-none text-[11px]"
              >
                <option value="bullet">Bullet ( • )</option>
                <option value="bar">Bar ( | )</option>
                <option value="icon">None (Icons Only)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: COLORS */}
      {activeSubTab === 'colors' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Colors & Theme Accent</span>
          </span>

          <div className="space-y-2">
            <label className="text-zinc-500 font-bold block uppercase text-[9px]">Select Preset Theme</label>
            <div className="flex flex-wrap gap-2">
              {presetThemes.map(theme => (
                <button
                  key={theme.name}
                  onClick={() => onUpdateResume({ customColorHex: theme.hex })}
                  className="flex items-center gap-1.5 bg-zinc-905 border border-zinc-800 hover:border-zinc-700 px-3 py-2 rounded-xl text-[10.5px] text-zinc-300 font-semibold cursor-pointer transition"
                >
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.hex }} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-900">
            {[
              { label: 'Theme Accent', field: 'customColorHex' },
              { label: 'Name Color', field: 'headingColor' },
              { label: 'Background', field: 'backgroundColor' },
              { label: 'Dividers', field: 'dividerColor' }
            ].map(col => (
              <div key={col.field} className="space-y-1">
                <span className="text-zinc-500 font-bold block uppercase text-[8.5px] truncate">{col.label}</span>
                <div className="flex gap-1.5 items-center bg-zinc-950 border border-zinc-800 rounded p-1">
                  <input
                    type="color"
                    value={activeResume[col.field as keyof ResumeVersion] as string || '#4f46e5'}
                    onChange={e => onUpdateResume({ [col.field]: e.target.value })}
                    className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={activeResume[col.field as keyof ResumeVersion] as string || ''}
                    onChange={e => onUpdateResume({ [col.field]: e.target.value })}
                    className="w-full bg-transparent text-[9.5px] text-zinc-400 outline-none uppercase font-mono"
                    placeholder="#HEX"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: PHOTO */}
      {activeSubTab === 'photo' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-indigo-400" />
            <span>Profile Photo Layout</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-500 font-bold block uppercase text-[9px] mb-1">Photo Border Style</label>
              <select
                value={activeResume.photoStyle || 'circle'}
                onChange={e => onUpdateResume({ photoStyle: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none text-[11px]"
              >
                <option value="circle">Circular shape</option>
                <option value="rounded">Rounded square</option>
                <option value="square">Square corners</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 mb-1">
                <span>Custom Image Size</span>
                <span className="font-mono text-zinc-450">{activeResume.photoSize || 80}px</span>
              </div>
              <input
                type="range"
                min={40}
                max={150}
                value={activeResume.photoSize || 80}
                onChange={e => onUpdateResume({ photoSize: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-900">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-450 select-none">
              <input 
                type="checkbox" 
                checked={activeResume.showPhoto !== false} 
                onChange={e => onUpdateResume({ showPhoto: e.target.checked })} 
                className="rounded accent-indigo-650"
              />
              <span>Render profile photo in current template</span>
            </label>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: LINKS */}
      {activeSubTab === 'links' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Social & Links Settings</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-450 select-none">
              <input 
                type="checkbox" 
                checked={activeResume.linkIconEnabled !== false} 
                onChange={e => onUpdateResume({ linkIconEnabled: e.target.checked })} 
                className="rounded accent-indigo-650"
              />
              <span>Show Social Brand Icons</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-455 select-none">
              <input 
                type="checkbox" 
                checked={activeResume.linkBlueColor !== false} 
                onChange={e => onUpdateResume({ linkBlueColor: e.target.checked })} 
                className="rounded accent-indigo-650"
              />
              <span>Highlight Links in Blue color</span>
            </label>
          </div>
        </div>
      )}

      {/* SUB-TAB 9: FOOTER */}
      {activeSubTab === 'footer' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <MoreHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Footer Metadata Settings</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-450 select-none">
              <input 
                type="checkbox" 
                checked={!!activeResume.footerPageNumbers} 
                onChange={e => onUpdateResume({ footerPageNumbers: e.target.checked })} 
                className="rounded accent-indigo-650"
              />
              <span>Render Page Numbers</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-450 select-none">
              <input 
                type="checkbox" 
                checked={!!activeResume.footerEmail} 
                onChange={e => onUpdateResume({ footerEmail: e.target.checked })} 
                className="rounded accent-indigo-650"
              />
              <span>Show Email in Footer</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-450 select-none">
              <input 
                type="checkbox" 
                checked={!!activeResume.footerName} 
                onChange={e => onUpdateResume({ footerName: e.target.checked })} 
                className="rounded accent-indigo-650"
              />
              <span>Show Name in Footer</span>
            </label>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-900">
            <label className="text-zinc-500 font-bold block uppercase text-[9px]">Custom Footer Text</label>
            <input
              type="text"
              placeholder="e.g. Confidential / Designed by Alex Dev"
              value={activeResume.footerCustomText || ''}
              onChange={e => onUpdateResume({ footerCustomText: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 outline-none"
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 10: SECTIONS */}
      {activeSubTab === 'sections' && (
        <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-4 animate-fade-in">
          <span className="text-[10px] font-bold text-zinc-455 block uppercase tracking-wider flex items-center gap-1.5">
            <Menu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sections Structure</span>
          </span>

          <p className="text-[9.5px] text-zinc-550 leading-normal">
            Master visibility order for the A4 document template. Drag sections using handles or use Up/Down controls to rearrange sections.
          </p>

          <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
            {(activeResume.sectionOrder || []).map((sec, idx, arr) => (
              <div key={sec} className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-bold text-zinc-300 hover:border-zinc-800 transition">
                <div className="flex items-center gap-2 truncate">
                  <Move className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                  <span className="truncate">{getSectionTitle(sec)}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => moveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 bg-zinc-900 border border-zinc-800 text-zinc-550 hover:text-zinc-250 disabled:opacity-20 rounded cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === arr.length - 1}
                    className="p-0.5 bg-zinc-900 border border-zinc-800 text-zinc-550 hover:text-zinc-250 disabled:opacity-20 rounded cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
