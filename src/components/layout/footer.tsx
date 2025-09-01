import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground z-0 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo className="text-accent" />
            <span className="text-xl font-bold font-headline">NexusConnect</span>
          </div>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} NexusConnect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-gray-400 hover:text-accent transition-colors">
              <Twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-accent transition-colors">
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-accent transition-colors">
              <Linkedin className="h-6 w-6" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
