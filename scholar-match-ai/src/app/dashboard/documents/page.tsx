'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUpload, type UploadedDocument } from '@/components/document-upload';
import { seedApplications, seedScholarships } from '@/lib/mock-data';
import { formatFileSize } from '@/lib/utils';
import { FileText, CheckCircle2, AlertTriangle, HardDrive } from 'lucide-react';

const VERIFICATION_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  verified: { label: 'AI verified', variant: 'success' },
  needs_review: { label: 'Needs review', variant: 'warning' },
  pending: { label: 'Pending', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export default function DocumentsPage() {
  // Seeded documents from the demo applications, normalized to the upload component's shape.
  const initialDocs: UploadedDocument[] = useMemo(
    () =>
      seedApplications.flatMap((app) =>
        app.documents.map((d) => ({
          id: d.id,
          file_name: d.file_name,
          file_size: d.file_size,
          mime_type: d.mime_type,
          storage_path: d.storage_path,
          type: d.type,
          progress: 100,
          state: d.verification_state === 'verified' ? ('verified' as const) : ('needs_review' as const),
          extractedEvidence:
            d.verification_state === 'verified'
              ? [d.extracted_text ?? 'Text layer extracted', 'Language: English (confident)']
              : [],
          verificationNote:
            d.verification_state === 'verified'
              ? 'Verified in a previous session.'
              : 'Scores partially legible — please confirm the overall band score.',
        }))
      ),
    []
  );

  const [docs, setDocs] = useState<UploadedDocument[]>(initialDocs);

  const handleUploaded = (doc: UploadedDocument) => setDocs((prev) => [doc, ...prev]);
  const handleDeleted = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  const totalSize = docs.reduce((acc, d) => acc + d.file_size, 0);
  const verified = docs.filter((d) => d.state === 'verified').length;
  const needsReview = docs.filter((d) => d.state === 'needs_review').length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload once, reuse across applications. AI verification checks readability, language, and completeness, then
          maps extracted evidence back into your profile facts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{docs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success-50 text-success-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{verified}</p>
              <p className="text-xs text-muted-foreground mt-1">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{needsReview}</p>
              <p className="text-xs text-muted-foreground mt-1">Needs review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-100 text-secondary-foreground flex items-center justify-center flex-shrink-0">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{formatFileSize(totalSize)}</p>
              <p className="text-xs text-muted-foreground mt-1">Storage used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="max-w-full overflow-x-auto justify-start">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="library">Library ({docs.length})</TabsTrigger>
          <TabsTrigger value="usage">Where they&apos;re used</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <DocumentUpload existingDocuments={docs} onUploaded={handleUploaded} onDelete={handleDeleted} />
        </TabsContent>

        <TabsContent value="library" className="mt-4 space-y-3">
          {docs.map((doc) => {
            const badge = VERIFICATION_BADGE[doc.state] ?? VERIFICATION_BADGE.pending;
            return (
              <Card key={doc.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{doc.file_name}</p>
                      <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                      <Badge variant="outline" className="text-[10px]">{doc.type.replace(/_/g, ' ')}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(doc.file_size)} · {doc.mime_type} · path: {doc.storage_path}
                    </p>
                    {doc.extractedEvidence.length > 0 && (
                      <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                        {doc.extractedEvidence.map((e, i) => (
                          <li key={i}>• {e}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {docs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nothing in your library yet.</p>}
        </TabsContent>

        <TabsContent value="usage" className="mt-4 space-y-3">
          {seedApplications.map((app) => {
            const sch = seedScholarships.find((s) => s.id === app.scholarship_id);
            return (
              <Card key={app.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{sch?.name ?? app.scholarship_id}</CardTitle>
                  <CardDescription>
                    {app.documents.length} document(s) attached · status: {app.status.replace(/_/g, ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {app.documents.length === 0 && (
                      <span className="text-xs text-danger-600">No documents yet — this blocks the readiness score.</span>
                    )}
                    {app.documents.map((d) => (
                      <Badge key={d.id} variant="secondary" className="text-[10px]">
                        {d.type.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}