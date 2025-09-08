import { describe, it, expect, vi } from 'vitest';
vi.mock('@/lib/firebase', ()=> ({ db: {}, storage: {}, auth: {} }));
import { updateArrayItem, removeArrayItem } from '../types';

// Minimal unit tests placeholder; real Firestore + storage dependent helpers will be mocked in future.
describe('array helpers', () => {
  it('updateArrayItem patches correct index', () => {
    const list = [{a:1},{a:2},{a:3}];
    const out = updateArrayItem(list,1,{a:20});
    expect(out[1].a).toBe(20);
    expect(out[0].a).toBe(1);
  });
  it('removeArrayItem removes correct index', () => {
    const list = [1,2,3];
    const out = removeArrayItem(list,1);
    expect(out).toEqual([1,3]);
  });
});
