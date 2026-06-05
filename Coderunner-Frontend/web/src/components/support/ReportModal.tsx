'use client';

import { useEffect, useRef, useState } from 'react';
import { Bug, HelpCircle, Send, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

interface ReportModalProps {
  type: 'bug_report' | 'doubt';
  open: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'pending' | 'sent' | 'error';

const COPY = {
  bug_report: {
    heading: 'Report a bug',
    subtext: 'Goes to the developers.',
    Icon: Bug,
  },
  doubt: {
    heading: 'Ask a doubt',
    subtext: 'Goes to your teacher.',
    Icon: HelpCircle,
  },
} as const;

export function ReportModal({ type, open, onClose }: ReportModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the success auto-close timer on unmount so it can't fire late.
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  if (!open) return null;

  const { heading, subtext, Icon } = COPY[type];
  const pending = status === 'pending';
  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !pending;

  const reset = () => {
    setTitle('');
    setDescription('');
    setStatus('idle');
  };

  const handleClose = () => {
    if (pending) return; // don't close mid-pending
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('pending');
    try {
      await api.tickets.create({
        type,
        title: title.trim(),
        description: description.trim(),
      });
      setStatus('sent');
      closeTimer.current = setTimeout(() => {
        reset();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to send ticket', err);
      setStatus('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-space text-slate-100">
            <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            {heading}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-space">
            {subtext}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="report-title" className="text-xs font-space text-slate-400">
              Title
            </label>
            <input
              id="report-title"
              type="text"
              required
              maxLength={140}
              value={title}
              disabled={pending}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'bug_report' ? 'Briefly, what went wrong?' : 'What is your question about?'}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-slate-500 disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="report-description" className="text-xs font-space text-slate-400">
              Details
            </label>
            <textarea
              id="report-description"
              required
              maxLength={4000}
              rows={5}
              value={description}
              disabled={pending}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'bug_report' ? 'Steps to reproduce, what you expected, what happened...' : 'Describe your doubt in detail...'}
              className="resize-none rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-slate-500 disabled:opacity-60"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-400 font-space">Couldn&apos;t send — try again.</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={pending}
              className="text-slate-400 hover:text-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || status === 'sent'}
              className="gap-2 text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {status === 'sent' ? (
                <>
                  <Check className="h-4 w-4" /> Sent
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> {pending ? 'Sending…' : 'Send'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
