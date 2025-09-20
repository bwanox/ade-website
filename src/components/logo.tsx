import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-primary', props.className)}
      {...props}
    >
      <title>KURO Logo</title>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 15v5M12 9V4" />
      <path d="M15 12h5M9 12H4" />
      <path d="m16.5 16.5 3 3M4.5 4.5l3 3" />
      <path d="m4.5 19.5 3-3M19.5 4.5l-3 3" />
    </svg>
  );
}
