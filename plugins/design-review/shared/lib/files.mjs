import fs from 'node:fs/promises';
import path from 'node:path';

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readText(filePath, fallback = null) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (fallback !== null) return fallback;
    throw error;
  }
}

export async function writeText(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, value, 'utf8');
}

export async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (fallback !== null) return fallback;
    throw error;
  }
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

export function unique(values) {
  return Array.from(new Set(values));
}
