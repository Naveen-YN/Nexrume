import React from 'react';
import { 
  X, FileText, Briefcase, GraduationCap, Code, 
  Award, Languages, Trophy, BookOpen, Users, 
  UserCheck, Heart, Bookmark, PenTool, CheckCircle, 
  FileSignature, Landmark, FileCode, Search, HelpCircle, Sparkles, Compass
} from 'lucide-react';
import { ResumeVersion } from '../../db/mockData';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeResume: ResumeVersion;
  onAddSection: (sectionId: string) => void;
}

export const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen,
  onClose,
  activeResume,
  onAddSection
}) => {
  if (!isOpen) return null;

  const currentSections = activeResume.sectionOrder || [];

  const libraryItems = [
    { id: 'summary', title: 'Professional Summary', icon: FileText, desc: 'A short overview of your key strengths, experience, and SDE goals.' },
    { id: 'experience', title: 'Work Experience', icon: Briefcase, desc: 'Your professional roles, employers, responsibilities, and key metrics.' },
    { id: 'education', title: 'Education', icon: GraduationCap, desc: 'Your degrees, institutions, academic honors, and graduation dates.' },
    { id: 'skills', title: 'Skills', icon: Code, desc: 'Your technical skills, language stacks, tools, and developer proficiency.' },
    { id: 'projects', title: 'Projects', icon: FileCode, desc: 'Key products, GitHub repositories, or tools you have designed and built.' },
    { id: 'certifications', title: 'Certifications', icon: Award, desc: 'Industry certificates, licenses, or professional credentials.' },
    { id: 'languages', title: 'Languages', icon: Languages, desc: 'Languages you speak and your proficiency level.' },
    { id: 'awards', title: 'Awards & Honors', icon: Trophy, desc: 'Recognitions, scholarships, hackathon victories, or fellowships.' },
    { id: 'publications', title: 'Publications', icon: BookOpen, desc: 'Books, research papers, articles, or columns you have authored.' },
    { id: 'organizations', title: 'Organizations', icon: Users, desc: 'Clubs, student chapters, professional bodies, or industry unions.' },
    { id: 'references', title: 'References', icon: UserCheck, desc: 'Contact details of managers or peers who can vouch for your work.' },
    { id: 'interests', title: 'Interests', icon: Search, desc: 'Your technical or scientific topics of interest.' },
    { id: 'courses', title: 'Courses', icon: Bookmark, desc: 'Online classes, certificates, or university courses completed.' },
    { id: 'achievements', title: 'Achievements', icon: Sparkles, desc: 'Major career highlights, promotions, or professional milestones.' },
    { id: 'volunteering', title: 'Volunteering', icon: Heart, desc: 'Non-profit contributions or social causes you support.' },
    { id: 'declaration', title: 'Declaration', icon: Landmark, desc: 'A formal statement confirming the authenticity of your details.' },
    { id: 'signature', title: 'Signature', icon: PenTool, desc: 'A physical signature drawing or photo authorization block.' },
    { id: 'patents', title: 'Patents', icon: CheckCircle, desc: 'Patents filed or granted for technological innovations.' },
    { id: 'hobbies', title: 'Hobbies', icon: Compass, desc: 'Personal hobbies or extracurricular pastimes.' },
    { id: 'custom-section', title: 'Custom Section', icon: HelpCircle, desc: 'Add a completely customizable section for anything else.' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-850">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-indigo-400" />
              <span>Add Content to Resume</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Select a section to include in your resume template structure.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 hover:bg-zinc-900 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-thin">
          {libraryItems.map(item => {
            const Icon = item.icon;
            const isAdded = currentSections.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isAdded) {
                    onAddSection(item.id);
                  }
                }}
                disabled={isAdded}
                className={`flex flex-col text-left p-4 rounded-xl border transition select-none h-full justify-between cursor-pointer ${
                  isAdded 
                    ? 'bg-zinc-900/40 border-zinc-900 text-zinc-550 opacity-60 cursor-not-allowed'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 text-zinc-350 active:scale-[0.98]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isAdded ? 'bg-zinc-955 text-zinc-650' : 'bg-zinc-955 text-indigo-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isAdded && (
                      <span className="text-[9px] font-black uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-zinc-500">
                        Added
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xs font-extrabold ${isAdded ? 'text-zinc-500' : 'text-white'}`}>{item.title}</h3>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                {!isAdded && (
                  <div className="text-[10px] text-indigo-400 font-bold mt-3 hover:text-indigo-300 flex items-center gap-1">
                    <span>+ Add Section</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
