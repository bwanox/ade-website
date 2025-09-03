// Implementation moved here to avoid name collision with legacy stub hero-data.ts
import React from 'react';
export interface FeatureItem { title: string; sub: string; icon: JSX.Element; }
export interface StatItem { k: string; v: string; }
export const baseFeatures = (accentIconClasses: string = 'w-8 h-8 text-accent'): FeatureItem[] => [
  { title:'Innovation', sub:'Pipelines', icon:<svg className={accentIconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M12 2v8l6 2-6 2v8l-6-4 6-4-6-2 6-2-6-2 6-2z"/></svg> },
  { title:'Collaborative', sub:'Mesh', icon:<svg className={accentIconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="3"/><path d="M2 12h4M18 12h4M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83"/></svg> },
  { title:'Future', sub:'Focus', icon:<svg className={accentIconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><circle cx="12" cy="12" r="8"/><path d="M12 4v8l4 4"/></svg> },
];
export const cuteFeatures = (accentIconClasses='w-8 h-8 text-accent'): FeatureItem[] => [
  { title:'Innovation', sub:'Play', icon:<svg className={accentIconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><circle cx="12" cy="12" r="8"/><path d="M9 10l6 4-6 4V10z"/></svg> },
  { title:'Collab', sub:'Buzz', icon:<svg className={accentIconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><circle cx="12" cy="12" r="3"/><path d="M2 12h4M18 12h4M12 2v4M12 18v4M5 5l2.5 2.5M19 5l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5"/></svg> },
  { title:'Future', sub:'Ready', icon:<svg className={accentIconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M12 3l7 4v7c0 4-3 7-7 7s-7-3-7-7V7l7-4z"/><path d="M9.5 12h5"/></svg> },
];
export const baseStats: StatItem[] = [ {k:'Active Modules',v:'24'}, {k:'Contributors',v:'58'}, {k:'Open Ideas',v:'132'} ];
export const extendedStats: StatItem[] = [ ...baseStats, {k:'Graph Links',v:'11k'}, {k:'Live Sessions',v:'8'} ];
