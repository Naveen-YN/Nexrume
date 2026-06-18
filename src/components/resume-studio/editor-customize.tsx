import React from 'react';
import { ResumeVersion } from '../../db/mockData';
import { 
  Palette, Type, AlignLeft, AlignCenter, AlignRight, 
  ChevronUp, ChevronDown, Move, Compass 
} from 'lucide-react';

interface EditorCustomizeProps {
  activeResume: ResumeVersion;
  onUpdateResume: (updates: Partial<ResumeVersion>) => void;
}

export const EditorCustomize: React.FC<EditorCustomizeProps> = ({
  activeResume,
  onUpdateResume
}) => {

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
    { name: 'Dark Blue', hex: '#1e3a8a', label: 'Corporate' },
    { name: 'Modern Purple', hex: '#7c3aed', label: 'Creative' },
    { name: 'Emerald', hex: '#059669', label: 'Tech' },
    { name: 'Corporate Gray', hex: '#4b5563', label: 'Executive' },
    { name: 'Minimal Black', hex: '#18181b', label: 'Standard' }
  ];

  // Reordering handlers for Layout Builder
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...(activeResume.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    
    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    onUpdateResume({ sectionOrder: list });
  };

  const getSectionTitle = (id: string) => {
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
      references: 'References'
    }[id] || id;
  };

  return (
    <div className="space-y-5 text-xs">
      
      {/* 1. TYPOGRAPHY CONTROLS */}
      <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Advanced Typography</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-500 font-bold block mb-1 uppercase text-[9px]">Font Family</label>
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

          <div>
            <label className="text-zinc-500 font-bold block mb-1 uppercase text-[9px]">Text Alignment</label>
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
                    className={`flex-1 py-1 rounded flex items-center justify-center transition cursor-pointer ${
                      activeResume.nameAlign === align.id ? 'bg-indigo-650 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Font Sizes */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500">
              <span>Body Font Size</span>
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
              <span>Name Title Size</span>
              <span className="font-mono text-zinc-400">{activeResume.nameSizePx || 32}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={60}
              value={activeResume.nameSizePx || 32}
              onChange={e => onUpdateResume({ nameSizePx: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-650"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Spacings */}
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
              <span>Section Margin</span>
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

      {/* 2. COLOR CUSTOMIZER */}
      <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>Color & Accent Palette</span>
        </span>

        {/* Preset Themes list */}
        <div className="space-y-1.5">
          <span className="text-zinc-500 font-bold block uppercase text-[9px]">Select Theme Preset</span>
          <div className="flex flex-wrap gap-2">
            {presetThemes.map(theme => (
              <button
                key={theme.name}
                onClick={() => onUpdateResume({ customColorHex: theme.hex })}
                className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 rounded-lg text-[10px] text-zinc-300 font-semibold cursor-pointer"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.hex }} />
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom hex selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-900">
          {[
            { label: 'Primary Accent', field: 'customColorHex' },
            { label: 'Name Text', field: 'headingColor' },
            { label: 'Heading Text', field: 'bodyTextColor' }
          ].map(col => (
            <div key={col.field}>
              <span className="text-zinc-550 font-bold block uppercase text-[8.5px] mb-1">{col.label}</span>
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
                  className="w-full bg-transparent text-[10px] text-zinc-350 outline-none uppercase font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. LAYOUT BUILDER & SECTIONS REORDERING */}
      <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider flex items-center gap-1">
          <Move className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Layout Builder (Reordering)</span>
        </span>

        <p className="text-[9.5px] text-zinc-500 leading-normal">
          Toggle single/double column structure and reorder sections dynamically to optimize ATS scan readability.
        </p>

        {/* Layout Column Toggle */}
        <div className="flex gap-3 items-center pt-1">
          <span className="text-zinc-550 font-bold block uppercase text-[9px]">Grid Columns:</span>
          <div className="flex gap-1 bg-zinc-950 p-0.5 rounded border border-zinc-800 text-[10px]">
            {[
              { id: 'one', label: 'Single Column' },
              { id: 'two', label: 'Double Column' }
            ].map(col => (
              <button
                key={col.id}
                onClick={() => onUpdateResume({ layoutColumns: col.id as any })}
                className={`px-3 py-1 rounded font-bold cursor-pointer transition ${
                  activeResume.layoutColumns === col.id ? 'bg-indigo-650 text-white' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reordering List */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-900 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
          {(activeResume.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']).map((sec, idx, arr) => (
            <div key={sec} className="bg-zinc-950 border border-zinc-900 p-2 rounded-lg flex items-center justify-between text-[11px] font-semibold text-zinc-300">
              <div className="flex items-center gap-2">
                <Move className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                <span>{getSectionTitle(sec)}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => moveSection(idx, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-250 disabled:opacity-30 rounded cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveSection(idx, 'down')}
                  disabled={idx === arr.length - 1}
                  className="p-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-250 disabled:opacity-30 rounded cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
