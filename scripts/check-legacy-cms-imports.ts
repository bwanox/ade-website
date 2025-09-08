#!/usr/bin/env ts-node
/**
 * Build-time scan for deprecated './cms' dashboard imports.
 * Exits with code 1 (non-blocking now if run separately) when occurrences are found.
 * Integrate into CI or prebuild to escalate deprecation.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..', 'src');
const TARGET_PATTERN = /from ['"].\/cms['"];?|require\(['"].\/cms['"]\)/g;

let matches: { file:string; line:number; text:string }[] = [];

function scanFile(file:string) {
  const content = fs.readFileSync(file, 'utf8');
  if (TARGET_PATTERN.test(content)) {
    content.split(/\n/).forEach((ln, idx)=> {
      if (ln.includes("./cms")) matches.push({ file, line: idx+1, text: ln.trim() });
    });
  }
}

function walk(dir:string) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(entry)) scanFile(full);
  }
}

walk(ROOT);

if (matches.length) {
  console.warn('\n[DEPRECATION] Found legacy imports from ./cms (compat file scheduled for removal Q1 2026):');
  for (const m of matches) console.warn(`  - ${path.relative(process.cwd(), m.file)}:${m.line} -> ${m.text}`);
  console.warn('\nReplace with: import { ... } from "./managers";');
  process.exitCode = 0; // non-fatal for now; change to 1 later to fail build
} else {
  console.log('No legacy ./cms imports detected.');
}
