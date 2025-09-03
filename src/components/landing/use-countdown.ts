'use client';
import { useEffect, useState } from 'react';

export interface CountdownState { days:number; hours:number; minutes:number; seconds:number; expired:boolean }

export function useCountdown(target: string | Date): CountdownState {
  const [state,setState]=useState<CountdownState>({days:0,hours:0,minutes:0,seconds:0,expired:false});
  useEffect(()=>{
    const targetDate = typeof target === 'string' ? new Date(target) : target;
    let raf:number; let prev=0; // throttle to ~1s using rAF
    const tick=(ts:number)=>{
      if(ts-prev>1000){
        prev=ts;
        const now = new Date();
        const diff = targetDate.getTime()-now.getTime();
        if(diff<=0){ setState(s=>({...s,expired:true,days:0,hours:0,minutes:0,seconds:0})); return; }
        const days=Math.floor(diff/86400000);
        const hours=Math.floor(diff/3600000)%24;
        const minutes=Math.floor(diff/60000)%60;
        const seconds=Math.floor(diff/1000)%60;
        setState({days,hours,minutes,seconds,expired:false});
      }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[target]);
  return state;
}
