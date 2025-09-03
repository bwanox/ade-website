import Link from 'next/link';

export default function CourseNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <h2 className="text-4xl font-headline font-bold">Course Not Found</h2>
      <p className="text-muted-foreground max-w-md">The course you are looking for does not exist or has been removed.</p>
      <Link href="/" className="text-accent underline underline-offset-4">Return Home</Link>
    </div>
  );
}
