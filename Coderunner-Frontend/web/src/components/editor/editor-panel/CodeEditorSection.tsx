'use client';

import { Upload, X } from 'lucide-react';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { Button } from '@/components/ui/button';
import type { Problem } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

interface CodeEditorSectionProps {
  code: string;
  onChange: (value: string) => void;
  problem: Problem;
  uploadedImages?: string[];
  onImageUpload?: (file: File) => void;
  onRemoveImage?: (index: number) => void;
  onPaste?: (chars: number) => void;
}

export default function CodeEditorSection({
  code,
  onChange,
  problem,
  uploadedImages = [],
  onImageUpload,
  onRemoveImage,
  onPaste,
}: CodeEditorSectionProps) {
  const { character, accentColor } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const requiresImages = problem.title?.toLowerCase().includes('pygame') ||
                         problem.description?.toLowerCase().includes('image');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div
      className={`code-editor-section flex-1 flex flex-col overflow-hidden relative border-b-2 ${hasCompilerTheme ? '' : 'bg-white dark:bg-slate-950 border-purple-200/50 dark:border-purple-700/30'}`}
      style={hasCompilerTheme ? { background: 'rgba(5, 8, 20, 0.88)', borderColor: accentRgba(0.15) } : {}}
    >

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          language="python"
          value={code}
          onChange={(value) => onChange(value ?? '')}
          isDark={isDark}
          onPaste={onPaste}
        />
      </div>

      {/* Image Upload Section (for Pygame problems) */}
      {requiresImages && onImageUpload && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Images for Pygame
            </span>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs"
                asChild
              >
                <span>
                  <Upload className="w-3 h-3 mr-1" />
                  Upload Image
                </span>
              </Button>
            </label>
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border border-slate-300 dark:border-slate-600"
                  />
                  {onRemoveImage && (
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
