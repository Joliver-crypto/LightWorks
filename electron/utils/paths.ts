import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export function getDocumentsDir(): string {
  try { 
    return app.getPath('documents'); 
  } catch { 
    return app.getPath('home'); 
  }
}

export function getExperimentsDir(): string {
  const custom = process.env.LIGHTWORKS_EXPERIMENTS_DIR?.trim();
  const base = custom && custom.length > 0
    ? custom
    : path.join(getDocumentsDir(), 'LightWorks', 'Experiments');
  fs.mkdirSync(base, { recursive: true });
  return base;
}

export function sanitizeFileName(name: string): string {
  const safe = (name || 'Untitled').replace(/[\/\\?%*:|"<>]/g, '-').trim();
  return safe.length ? safe : 'Untitled';
}

export function nextUniqueExperimentPath(baseName: string): string {
  const dir = getExperimentsDir();
  const root = sanitizeFileName(baseName);
  let candidate = path.join(dir, `${root}.lightworks`);
  let i = 1;
  while (fs.existsSync(candidate)) {
    const n = String(i).padStart(2, '0');
    candidate = path.join(dir, `${root}-${n}.lightworks`);
    i++;
  }
  return candidate;
}









