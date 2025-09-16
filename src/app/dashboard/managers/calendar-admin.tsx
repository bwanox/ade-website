"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ImageDropzone } from '@/components/upload/image-dropzone';

function DropZone({
  accept,
  onFiles,
  children,
  className,
}: {
  accept?: string;
  onFiles: (files: FileList) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
  };
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cn(
        'border-2 border-dashed rounded-md p-6 text-sm text-muted-foreground flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors',
        className,
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      {children}
    </div>
  );
}

type WeeklyPlans = {
  [major: string]: {
    [semester: string]: {
      type: 'image' | 'csv';
      imageUrl?: string;
      storagePath?: string;
      csvText?: string;
      updatedAt?: any;
    };
  };
};

type PlanEntry = {
  major: string;
  semester: string;
  mode: 'image' | 'csv';
  imageUrl: string | null;
  imagePath: string | null;
  csvText: string;
};

export function AdminCalendarManager() {
  // Yearly calendar state
  const [yearLabel, setYearLabel] = useState('');
  const [yearImageUrl, setYearImageUrl] = useState<string | null>(null);
  const [yearImagePath, setYearImagePath] = useState<string | null>(null);
  const [savingYear, setSavingYear] = useState(false);

  // Weekly plans state
  const [plans, setPlans] = useState<WeeklyPlans>({});
  const [savingPlan, setSavingPlan] = useState(false);
  const [entries, setEntries] = useState<PlanEntry[]>([
    { major: '', semester: '', mode: 'image', imageUrl: null, imagePath: null, csvText: '' },
  ]);

  // Load existing data
  useEffect(() => {
    const load = async () => {
      // Yearly
      const yearlySnap = await getDoc(doc(db, 'calendars', 'yearly'));
      if (yearlySnap.exists()) {
        const y = yearlySnap.data() as any;
        setYearLabel(y.yearLabel || '');
        if (y.imageUrl) setYearImageUrl(y.imageUrl);
        if (y.storagePath) setYearImagePath(y.storagePath);
      }
      // Weekly
      const weeklySnap = await getDoc(doc(db, 'calendars', 'weekly'));
      if (weeklySnap.exists()) {
        const w = weeklySnap.data() as any;
        setPlans((w.plans as WeeklyPlans) || {});
      }
    };
    load();
  }, []);

  const saveYearly = async () => {
    if (!yearLabel) return alert('Please enter a year label, e.g. 2025/2026');
    try {
      setSavingYear(true);
      await setDoc(
        doc(db, 'calendars', 'yearly'),
        {
          yearLabel,
          imageUrl: yearImageUrl || null,
          storagePath: yearImagePath || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      alert('Yearly calendar saved');
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSavingYear(false);
    }
  };

  // Helpers for dynamic weekly entries
  const addEntry = () =>
    setEntries((prev) => [...prev, { major: '', semester: '', mode: 'image', imageUrl: null, imagePath: null, csvText: '' }]);

  const removeEntry = (index: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== index));

  const updateEntry = (index: number, patch: Partial<PlanEntry>) =>
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));

  const handleEntryFile = async (index: number, files: FileList) => {
    const f = files[0];
    if (!f) return;
    const entry = entries[index];
    if (entry.mode === 'csv') {
      const text = await f.text();
      updateEntry(index, { csvText: text });
    }
  };

  const saveAllPlans = async () => {
    // Validate
    for (const [i, e] of entries.entries()) {
      if (!e.major || !e.semester)
        return alert(`Row ${i + 1}: Enter major and semester`);
      if (e.mode === 'image' && !e.imageUrl) {
        return alert(`Row ${i + 1}: Upload an image first`);
      }
      if (e.mode === 'csv' && !e.csvText)
        return alert(`Row ${i + 1}: Provide CSV text (drop a CSV file)`);
    }

    try {
      setSavingPlan(true);
      let update: WeeklyPlans = { ...plans };

      for (const e of entries) {
        const majorKey = e.major.trim();
        const semKey = e.semester.trim();
        if (!update[majorKey]) update[majorKey] = {} as WeeklyPlans[string];

        if (e.mode === 'image') {
          update[majorKey][semKey] = {
            type: 'image',
            imageUrl: e.imageUrl || undefined,
            storagePath: e.imagePath || undefined,
            updatedAt: new Date().toISOString(),
          };
        } else {
          update[majorKey][semKey] = {
            type: 'csv',
            csvText: e.csvText,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      await setDoc(
        doc(db, 'calendars', 'weekly'),
        { plans: update, updatedAt: serverTimestamp() },
        { merge: true },
      );

      setPlans(update);
      setEntries([{ major: '', semester: '', mode: 'image', imageUrl: null, imagePath: null, csvText: '' }]);
      alert('Weekly plans saved');
    } catch (e) {
      console.error(e);
      alert('Failed to save weekly plans');
    } finally {
      setSavingPlan(false);
    }
  };

  const majors = useMemo(() => Object.keys(plans).sort(), [plans]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Yearly Calendar</CardTitle>
          <CardDescription>Enter a label like 2025/2026 and upload an image of the yearly calendar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[240px_1fr] items-start">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year label</label>
              <Input
                placeholder="2025/2026"
                value={yearLabel}
                onChange={(e) => setYearLabel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageDropzone
                existingUrl={yearImageUrl}
                previousPath={yearImagePath}
                pathPrefix={`calendars/yearly/${(yearLabel || 'year').replace(/\s+/g, '_')}-`}
                description="Drag & drop or click to select"
                onUploaded={({ url, path }) => { setYearImageUrl(url); setYearImagePath(path); }}
              />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={saveYearly} disabled={savingYear}>
              {savingYear ? 'Saving…' : 'Save Yearly Calendar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Planning</CardTitle>
          <CardDescription>
            Add multiple majors and semesters at once. Choose Image or CSV per row. CSV content is stored as text in Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div key={idx} className="rounded-md border p-3 space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Major</label>
                    <Input
                      placeholder="e.g. CS"
                      value={entry.major}
                      onChange={(e) => updateEntry(idx, { major: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <Input
                      placeholder="e.g. Semester 1"
                      value={entry.semester}
                      onChange={(e) => updateEntry(idx, { semester: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={entry.mode === 'image' ? 'default' : 'outline'}
                        onClick={() => updateEntry(idx, { mode: 'image', csvText: '' })}
                      >
                        Image
                      </Button>
                      <Button
                        type="button"
                        variant={entry.mode === 'csv' ? 'default' : 'outline'}
                        onClick={() => updateEntry(idx, { mode: 'csv', imageUrl: null, imagePath: null })}
                      >
                        CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {entry.mode === 'image' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plan Image</label>
                    <ImageDropzone
                      existingUrl={entry.imageUrl}
                      previousPath={entry.imagePath}
                      pathPrefix={`calendars/weekly/${(entry.major || 'major').replace(/\s+/g, '_')}-${(entry.semester || 'semester').replace(/\s+/g, '_')}-`}
                      description="Drag & drop or click to select"
                      onUploaded={({ url, path }) => updateEntry(idx, { imageUrl: url, imagePath: path })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CSV</label>
                    <DropZone accept=".csv,text/csv,text/plain" onFiles={(files) => handleEntryFile(idx, files)}>
                      <div className="text-center">
                        <p>Drag & drop CSV here, or click to select</p>
                      </div>
                    </DropZone>
                    {entry.csvText && (
                      <pre className="mt-3 max-h-64 overflow-auto text-xs p-3 rounded border bg-muted/30">{entry.csvText.slice(0, 4000)}</pre>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <div className="text-xs text-muted-foreground">Row {idx + 1}</div>
                  <Button type="button" variant="outline" onClick={() => removeEntry(idx)} disabled={entries.length === 1}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={addEntry}>Add another</Button>
            <Button onClick={saveAllPlans} disabled={savingPlan}>
              {savingPlan ? 'Saving…' : 'Save All'}
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Existing Plans</h4>
            {majors.length === 0 && (
              <div className="text-sm text-muted-foreground">No plans yet</div>
            )}
            <div className="space-y-4">
              {majors.map((m) => (
                <div key={m} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m}</div>
                    <Badge variant="secondary">{Object.keys(plans[m] || {}).length} semesters</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(plans[m] || {}).map(([sem, data]) => (
                      <div key={sem} className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{sem}</div>
                          <Badge className="capitalize" variant="outline">{data.type}</Badge>
                        </div>
                        {data.type === 'image' && data.imageUrl ? (
                          <img src={data.imageUrl} alt={`${m} ${sem}`} className="max-h-40 rounded-md border" />
                        ) : (
                          <pre className="max-h-40 overflow-auto text-xs p-2 rounded border bg-muted/30 whitespace-pre-wrap">
                            {data.csvText?.slice(0, 2000) || '—'}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminCalendarManager;
