"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

// Types aligned with the admin manager structure
type WeeklyPlanEntry = {
  type: "image" | "csv";
  imageUrl?: string;
  storagePath?: string;
  csvText?: string;
  updatedAt?: any;
};

type WeeklyPlans = Record<string, Record<string, WeeklyPlanEntry>>;

function parseCSV(text: string): string[][] {
  if (!text) return [];
  const rows: string[][] = [];
  let i = 0, cur = "", inQuotes = false, row: string[] = [];
  const pushCell = () => { row.push(cur); cur = ""; };
  const pushRow = () => { rows.push(row); row = []; };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { pushCell(); i++; continue; }
      if (ch === '\n') { pushCell(); pushRow(); i++; continue; }
      if (ch === '\r') { // handle CRLF
        if (text[i + 1] === '\n') i++;
        pushCell(); pushRow(); i++; continue;
      }
      cur += ch; i++;
    }
  }
  // flush last cell/row
  if (cur.length > 0 || row.length > 0) { pushCell(); pushRow(); }
  return rows;
}

function CSVTable({ csv }: { csv: string }) {
  const rows = useMemo(() => parseCSV(csv), [csv]);
  if (!rows.length) return <div className="text-sm text-muted-foreground">No data</div>;
  const header = rows[0];
  const body = rows.slice(1);
  return (
    <div className="border rounded-md overflow-hidden pt-24">
      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
            <tr>
              {header.map((h, i) => (
                <th key={i} className="text-left p-2 border-b font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className={ri % 2 ? "bg-muted/20" : undefined}>
                {r.map((c, ci) => (
                  <td key={ci} className="p-2 align-top border-b whitespace-pre-wrap">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  // Yearly
  const [yearLabel, setYearLabel] = useState<string>("");
  const [yearImageUrl, setYearImageUrl] = useState<string | null>(null);

  // Weekly
  const [plans, setPlans] = useState<WeeklyPlans>({});
  const [loading, setLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const yearlySnap = await getDoc(doc(db, "calendars", "yearly"));
        if (!cancelled && yearlySnap.exists()) {
          const y = yearlySnap.data() as any;
          setYearLabel(y.yearLabel || "");
          setYearImageUrl(y.imageUrl || null);
        }
        const weeklySnap = await getDoc(doc(db, "calendars", "weekly"));
        if (!cancelled && weeklySnap.exists()) {
          const w = weeklySnap.data() as any;
          setPlans((w.plans as WeeklyPlans) || {});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const majors = useMemo(() => Object.keys(plans).sort((a, b) => a.localeCompare(b)), [plans]);
  const semesters = useMemo(() => (selectedMajor && plans[selectedMajor]) ? Object.keys(plans[selectedMajor]).sort((a, b) => a.localeCompare(b)) : [], [plans, selectedMajor]);

  // Initialize selections when data loads/changes
  useEffect(() => {
    if (!majors.length) { setSelectedMajor(""); setSelectedSemester(""); return; }
    if (!selectedMajor || !plans[selectedMajor]) {
      setSelectedMajor(majors[0]);
    }
  }, [majors]);
  useEffect(() => {
    if (!selectedMajor) { setSelectedSemester(""); return; }
    const sems = semesters;
    if (sems.length && (!selectedSemester || !plans[selectedMajor]?.[selectedSemester])) {
      setSelectedSemester(sems[0]);
    }
  }, [selectedMajor, semesters]);

  const current = selectedMajor && selectedSemester ? plans[selectedMajor]?.[selectedSemester] : undefined;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground mt-2">Yearly overview and weekly plans by major and semester.</p>
      </div>

      {/* Yearly calendar */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Yearly Calendar {yearLabel ? `(${yearLabel})` : ""}</CardTitle>
          <CardDescription>The official year overview. Click the image to enlarge.</CardDescription>
        </CardHeader>
        <CardContent>
          {yearImageUrl ? (
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full group">
                  <div className="relative w-full overflow-hidden rounded-md border">
                    <Image src={yearImageUrl} alt={yearLabel || "Yearly calendar"} width={1600} height={900} className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Click to zoom</div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl p-0 overflow-hidden">
                <div className="relative w-full h-[70vh]">
                  <Image src={yearImageUrl} alt={yearLabel || "Yearly calendar"} fill className="object-contain" />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="text-sm text-muted-foreground">No yearly calendar available yet.</div>
          )}
        </CardContent>
      </Card>

      {/* Weekly plans */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Plans</CardTitle>
          <CardDescription>Browse plans by major and semester. Some majors provide image plans, others provide CSV tables.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Major</div>
                <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loading ? "Loading…" : majors.length ? "Select major" : "No majors"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {majors.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Semester</div>
                <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={!selectedMajor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={!selectedMajor ? "Pick a major first" : semesters.length ? "Select semester" : "No semesters"} />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Quick jump list */}
              {selectedMajor ? (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Semesters for {selectedMajor}</div>
                  <div className="flex flex-wrap gap-2">
                    {semesters.map((s) => (
                      <Button key={s} size="sm" variant={s === selectedSemester ? "default" : "outline"} onClick={() => setSelectedSemester(s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Content area */}
            <div className="min-h-[240px]">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : !selectedMajor ? (
                <div className="text-sm text-muted-foreground">Select a major to view its weekly plans.</div>
              ) : !current ? (
                <div className="text-sm text-muted-foreground">No plan found for this selection.</div>
              ) : current.type === "image" && current.imageUrl ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full group">
                      <div className="relative w-full overflow-hidden rounded-md border">
                        <Image src={current.imageUrl} alt={`${selectedMajor} ${selectedSemester}`} width={1600} height={900} className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Click to zoom</div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0 overflow-hidden">
                    <div className="relative w-full h-[70vh]">
                      <Image src={current.imageUrl} alt={`${selectedMajor} ${selectedSemester}`} fill className="object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : current.type === "csv" && current.csvText ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{current.type}</Badge>
                    <span className="text-sm text-muted-foreground">{selectedMajor} • {selectedSemester}</span>
                    <div className="ml-auto" />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const blob = new Blob([current.csvText!], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = `${selectedMajor}-${selectedSemester}.csv`;
                        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                      }}
                    >
                      Download CSV
                    </Button>
                  </div>
                  <CSVTable csv={current.csvText} />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Unsupported plan format.</div>
              )}
            </div>
          </div>

          {/* Browse all majors */}
          <Separator className="my-8" />
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Browse all majors</h3>
            <div className="text-sm text-muted-foreground">{majors.length} majors</div>
          </div>
          {majors.length === 0 ? (
            <div className="text-sm text-muted-foreground">No weekly plans available yet.</div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {majors.map((m) => {
                  const semEntries = Object.entries(plans[m] || {}).sort((a, b) => a[0].localeCompare(b[0]));
                  return (
                    <Card key={m} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">{m}</CardTitle>
                          <Badge variant="secondary">{semEntries.length} semesters</Badge>
                        </div>
                        <CardDescription>Select a semester to view</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {semEntries.map(([sem, data]) => (
                            <Button
                              key={sem}
                              size="sm"
                              variant={m === selectedMajor && sem === selectedSemester ? "default" : "outline"}
                              onClick={() => { setSelectedMajor(m); setSelectedSemester(sem); }}
                            >
                              {sem}
                            </Button>
                          ))}
                        </div>
                        {/* Tiny preview */}
                        {(() => {
                          const first = semEntries[0]?.[1];
                          if (!first) return null;
                          return first.type === "image" && first.imageUrl ? (
                            <div className="mt-4 relative w-full h-32 overflow-hidden rounded border">
                              <Image src={first.imageUrl} alt={`${m} preview`} fill className="object-cover" />
                            </div>
                          ) : first.type === "csv" && first.csvText ? (
                            <div className="mt-4 text-xs text-muted-foreground border rounded p-2 max-h-24 overflow-hidden whitespace-pre-wrap">
                              {first.csvText.slice(0, 220)}{first.csvText.length > 220 ? "…" : ""}
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
