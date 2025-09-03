export default function LoadingCourse() {
  return (
    <div className="animate-pulse container max-w-6xl mx-auto px-4 py-24 space-y-8">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="h-16 w-3/4 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
