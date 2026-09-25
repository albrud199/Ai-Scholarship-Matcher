'use client';

import { useCallback, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatFileSize } from '@/lib/utils';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  FileSearch,
} from 'lucide-react';

export interface UploadedDocument {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  type: 'transcript' | 'cv' | 'sop' | 'recommendation_letter' | 'language_test' | 'passport' | 'other';
  progress: number;
  state: 'uploading' | 'verifying' | 'verified' | 'needs_review' | 'failed';
  extractedEvidence: string[];
  verificationNote?: string;
}

export const DOCUMENT_TYPES: UploadedDocument['type'][] = [
  'transcript',
  'cv',
  'sop',
  'recommendation_letter',
  'language_test',
  'passport',
  'other',
];

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'text/plain'];
const MAX_SIZE = 10 * 1024 * 1024;

/**
 * Deterministic mock "AI verification + evidence extraction" pipeline.
 * Replace with the real Gemini Vision pass + parser behind the same interface.
 */
function runVerification(fileName: string, type: UploadedDocument['type'], fileSize: number): { state: UploadedDocument['state']; note: string; evidence: string[] } {
  const lower = fileName.toLowerCase();
  const now = new Date();
  const uploadedAt = now.toISOString().slice(0, 10).replace(/-/g, '');

  if (fileSize < 8 * 1024) {
    return { state: 'needs_review', note: 'Possible blurry or partial scan — file is unusually small. Please re-check.', evidence: [] };
  }
  if (lower.includes('ielts') || lower.includes('toefl') || lower.includes('language')) {
    return {
      state: 'verified',
      note: 'Language test detected, content in English, scores legible.',
      evidence: ['Document type: language test report', 'Detected: overall band score present', 'Language: English (confident)'],
    };
  }
  if (type === 'transcript' || lower.includes('transcript') || lower.includes('grade')) {
    return {
      state: 'verified',
      note: 'Transcript detected, GPA line extracted.',
      evidence: ['Document type: academic transcript', 'Detected: cumulative GPA line', 'Language: English (confident)'],
    };
  }
  if (type === 'cv' || lower.includes('cv') || lower.includes('resume')) {
    return {
      state: 'verified',
      note: 'CV parsed successfully.',
      evidence: ['Document type: CV/résumé', 'Page count within recommended 1–2 pages', 'Detected sections: Experience, Education'],
    };
  }
  if (type === 'sop') {
    return {
      state: 'verified',
      note: 'Statement of purpose stored for review.',
      evidence: ['Document type: statement of purpose', 'Word count estimated from text layer'],
    };
  }
  return {
    state: 'verified',
    note: 'Document accepted and stored.',
    evidence: [`Document type: ${type.replace(/_/g, ' ')}`, `Reference ID: DOC-${uploadedAt}-${fileSize % 997}`],
  };
}

export function DocumentUpload({
  existingDocuments = [],
  onUploaded,
  onDelete,
}: {
  existingDocuments?: UploadedDocument[];
  onUploaded?: (doc: UploadedDocument) => void;
  onDelete?: (id: string) => void;
}) {
  const [docs, setDocs] = useState<UploadedDocument[]>(existingDocuments);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    (file: File, type: UploadedDocument['type']) => {
      if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(`"${file.name}" is not a supported format. Use PDF, PNG, JPG, DOC, or TXT.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" exceeds the 10 MB limit.`);
        return;
      }
      setError('');

      const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const doc: UploadedDocument = {
        id,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/pdf',
        storage_path: `documents/user-1/${id}/${file.name}`,
        type,
        progress: 0,
        state: 'uploading',
        extractedEvidence: [],
      };
      setDocs((prev) => [doc, ...prev]);

      // Simulated Supabase Storage transfer with progress ticks.
      const tick = setInterval(() => {
        setDocs((prev) =>
          prev.map((d) => {
            if (d.id !== id) return d;
            const next = Math.min(100, d.progress + Math.random() * 30 + 10);
            if (next >= 100 && d.state === 'uploading') {
              clearInterval(tick);
              // AI verification phase
              setTimeout(() => {
                const result = runVerification(file.name, type, file.size);
                setDocs((p) =>
                  p.map((x) =>
                    x.id === id
                      ? { ...x, state: result.state, verificationNote: result.note, extractedEvidence: result.evidence }
                      : x
                  )
                );
                onUploaded?.({ ...doc, progress: 100, state: result.state, verificationNote: result.note, extractedEvidence: result.evidence });
              }, 900);
              return { ...d, progress: 100, state: 'verifying' };
            }
            return { ...d, progress: next };
          })
        );
      }, 250);
    },
    [onUploaded]
  );

  const handleFiles = (files: FileList | null, defaultType: UploadedDocument['type']) => {
    if (!files) return;
    Array.from(files).forEach((f) => uploadFile(f, defaultType));
  };

  const removeDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    onDelete?.(id);
  };

  const updateType = (id: string, type: UploadedDocument['type']) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, type } : d)));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload documents"
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/50 hover:bg-secondary-50'
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files, 'other');
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
          onChange={(e) => {
            handleFiles(e.target.files, 'other');
            e.target.value = '';
          }}
        />
        <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="font-medium">Drag &amp; drop documents here, or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">
          PDF, PNG, JPG, DOC or TXT · up to 10 MB each · stored in private Supabase Storage
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      doc.state === 'verified'
                        ? 'bg-success-50 text-success-600'
                        : doc.state === 'failed'
                        ? 'bg-danger-50 text-danger-600'
                        : 'bg-primary-50 text-primary-600'
                    )}
                  >
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{doc.file_name}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Remove ${doc.file_name}`} onClick={() => removeDoc(doc.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Select value={doc.type} onValueChange={(v) => updateType(doc.id, v as UploadedDocument['type'])}>
                        <SelectTrigger className="h-7 w-44 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">
                              {t.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                      <StateBadge state={doc.state} />
                    </div>

                    {(doc.state === 'uploading' || doc.state === 'verifying') && (
                      <div className="mt-3">
                        <Progress value={doc.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          {doc.state === 'uploading' ? `Uploading… ${Math.round(doc.progress)}%` : 'AI verification in progress…'}
                        </p>
                      </div>
                    )}

                    {doc.verificationNote && (
                      <p
                        className={cn(
                          'text-xs mt-2 flex items-start gap-1.5',
                          doc.state === 'verified' ? 'text-success-600' : doc.state === 'needs_review' ? 'text-warning-600' : 'text-danger-600'
                        )}
                      >
                        {doc.state === 'verified' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        )}
                        {doc.verificationNote}
                      </p>
                    )}

                    {doc.extractedEvidence.length > 0 && (
                      <div className="mt-2 rounded-md bg-secondary-50 p-2.5">
                        <p className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                          <FileSearch className="h-3.5 w-3.5 text-primary" />
                          Extracted evidence → profile facts
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {doc.extractedEvidence.map((e, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Sparkles className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: UploadedDocument['state'] }) {
  const map: Record<
    UploadedDocument['state'],
    { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default' }
  > = {
    uploading: { label: 'Uploading', variant: 'secondary' },
    verifying: { label: 'Verifying', variant: 'default' },
    verified: { label: 'AI verified', variant: 'success' },
    needs_review: { label: 'Needs review', variant: 'warning' },
    failed: { label: 'Failed', variant: 'destructive' },
  };
  const { label, variant } = map[state];
  return (
    <Badge variant={variant} className="text-[10px]">
      {label}
    </Badge>
  );
}