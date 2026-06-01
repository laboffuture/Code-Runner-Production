'use client';

import Editor, { OnChange } from '@monaco-editor/react';
import { Loader } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: OnChange;
  isDark?: boolean;
  /** Fired on paste with the number of characters pasted (integrity capture). */
  onPaste?: (chars: number) => void;
}

export function CodeEditor({ language, value, onChange, isDark = true, onPaste }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      theme={isDark ? 'vs-dark' : 'light'}
      value={value}
      onChange={onChange}
      onMount={(editor: any) => {
        try {
          editor.onDidPaste((e: any) => {
            try {
              const text = editor.getModel()?.getValueInRange(e.range) || '';
              if (text) onPaste?.(text.length);
            } catch {
              /* ignore */
            }
          });
        } catch {
          /* editor API unavailable */
        }
      }}
      loading={<Loader className="h-8 w-8 animate-spin text-cyan-500" />}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        contextmenu: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontFamily: "'Fira Code', 'Courier New', monospace",
        fontLigatures: true,
        lineHeight: 22,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}
