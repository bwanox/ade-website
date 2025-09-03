"use client";
import React, { useEffect, useRef, useState } from 'react';
import { BoardAndSos } from '@/components/landing/board-and-sos';

interface Props {
  sectionIds: string[];
  offset?: number; // extra distance from top when aligning
}

/*
  This component observes the vertical midpoint of the currently most visible main column section
  and positions the BoardAndSos block so that its top roughly aligns with that section's top edge.
  On very tall side content it will clamp inside its own container height.
*/
export const BoardAndSosFollower: React.FC<Props> = ({ sectionIds, offset = 0 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [y, setY] = useState<number>(0);

  useEffect(() => {
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (!sections.length) return;

    const handle = () => {
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      // Find section whose top is just above middle of viewport or the last visible
      const target = sections.reduce<HTMLElement | null>((acc, el) => {
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + scrollY;
        if (rect.top <= viewportH * 0.4) return el; // progressively pick deeper sections
        return acc ?? el;
      }, null) || sections[0];

      const targetTopAbs = target.getBoundingClientRect().top + scrollY;
      const base = targetTopAbs - (sections[0].getBoundingClientRect().top + scrollY); // distance from first section top
      setY(base);
    };

    handle();
    window.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, [sectionIds]);

  return (
    <div ref={containerRef} className="relative w-full min-h-full">
      <div style={{ transform: `translateY(${y + offset}px)`, transition: 'transform 0.25s ease-out' }} className="space-y-8 will-change-transform">
        <BoardAndSos />
      </div>
    </div>
  );
};
