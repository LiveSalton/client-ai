import path from 'node:path';
import { resolveConfigPath } from './config.mjs';

export function safeScreenName(name) {
  return String(name || 'screen').replace(/[^a-zA-Z0-9._-]+/g, '-');
}

export function expectedPathForScreen(config, screen) {
  const expected = screen.expected || {};
  if (expected.path) return resolveConfigPath(config, expected.path);
  return path.join(config.project.outputDir, 'expected', `${safeScreenName(screen.name)}.png`);
}

export function actualPathForScreen(config, screen) {
  return path.join(config.project.outputDir, 'actual', `${safeScreenName(screen.name)}.png`);
}

export function diffPathForScreen(config, screen) {
  return path.join(config.project.outputDir, 'diff', `${safeScreenName(screen.name)}.png`);
}

export function normalizedExpectedPathForScreen(config, screen) {
  return path.join(config.project.outputDir, 'diff', `${safeScreenName(screen.name)}.expected-normalized.png`);
}

export function normalizedActualPathForScreen(config, screen) {
  return path.join(config.project.outputDir, 'diff', `${safeScreenName(screen.name)}.actual-normalized.png`);
}
