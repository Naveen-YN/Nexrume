"use client";

import React, { useRef, useEffect, useState } from 'react';
import { List, Link, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  });

  // Keep editor content in sync with external value, avoiding cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const checkActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        list: document.queryCommandState('insertUnorderedList'),
        alignLeft: document.queryCommandState('justifyLeft'),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignRight: document.queryCommandState('justifyRight'),
        alignJustify: document.queryCommandState('justifyFull'),
      });
    } catch (e) {
      // Ignore queryCommandState issues
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleInput();
    checkActiveFormats();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const addLink = () => {
    const selection = window.getSelection();
    let defaultUrl = 'https://';
    if (selection && selection.toString()) {
      const text = selection.toString();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        defaultUrl = text;
      }
    }
    const url = prompt('Enter the link URL:', defaultUrl);
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-955 focus-within:border-indigo-500 transition">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-zinc-900 border-b border-zinc-800 select-none">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold transition text-xs ${
            activeFormats.bold ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg italic transition text-xs font-serif ${
            activeFormats.italic ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg underline transition text-xs ${
            activeFormats.underline ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Underline"
        >
          U
        </button>
        
        <span className="w-px h-4 bg-zinc-800 mx-1 shrink-0" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            activeFormats.list ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        
        <button
          type="button"
          onClick={addLink}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          title="Insert Link"
        >
          <Link className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-zinc-800 mx-1 shrink-0" />

        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            activeFormats.alignLeft ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            activeFormats.alignCenter ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            activeFormats.alignRight ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyFull')}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            activeFormats.alignJustify ? 'bg-indigo-650 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Justify"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={checkActiveFormats}
        onMouseUp={checkActiveFormats}
        className="w-full min-h-[140px] p-3 text-zinc-300 outline-none text-[11.5px] leading-relaxed select-text empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-600 empty:before:pointer-events-none empty:before:block font-sans"
        data-placeholder={placeholder}
      />
    </div>
  );
};
