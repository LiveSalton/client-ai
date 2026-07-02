import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { parseArgs } from './args.mjs';
import { ensureDir, pathExists } from './files.mjs';

export function findPluginRoot() {
  const envRoot = process.env.DESIGN_PLUGIN_ROOT;
  if (envRoot) return path.resolve(envRoot);
  return path.resolve(new URL('../..', import.meta.url).pathname);
}

export async function findConfigPath(explicitPath) {
  const candidates = [
    explicitPath,
    'design.qa.yaml',
    'design.qa.yml',
    '.design-qa.yaml',
    '.design-qa.yml',
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = path.resolve(process.cwd(), candidate);
    if (await pathExists(resolved)) return resolved;
  }

  return path.resolve(process.cwd(), explicitPath || 'design.qa.yaml');
}

export async function loadConfig(options = {}) {
  const args = options.args || parseArgs();
  const configPath = await findConfigPath(args.config || options.configPath);
  const configDir = path.dirname(configPath);
  let raw = '';
  let config = {};

  try {
    raw = await fs.readFile(configPath, 'utf8');
    config = YAML.parse(raw) || {};
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    config = {};
  }

  const project = config.project || {};
  const outputDir = path.resolve(configDir, project.outputDir || '.design-qa');
  const normalized = {
    ...config,
    project: {
      name: project.name || path.basename(configDir),
      baseUrl: project.baseUrl || 'http://localhost:3000',
      outputDir,
      appCommand: project.appCommand,
      appReadyUrl: project.appReadyUrl || project.baseUrl,
      appReadyTimeoutMs: project.appReadyTimeoutMs || 60000,
    },
    design: {
      designMd: 'DESIGN.md',
      screenSpec: 'SCREEN_SPEC.md',
      ...(config.design || {}),
    },
    screens: Array.isArray(config.screens) ? config.screens : [],
    code: {
      include: [
        'src/**/*.{ts,tsx,js,jsx,css,scss,html,vue,svelte}',
        'app/**/*.{ts,tsx,js,jsx,css,scss,html,vue,svelte}',
        'pages/**/*.{ts,tsx,js,jsx,css,scss,html,vue,svelte}',
        'components/**/*.{ts,tsx,js,jsx,css,scss,html,vue,svelte}',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '.design-qa/**',
      ],
      ...(config.code || {}),
    },
    components: {
      libraryImportPatterns: [],
      rawElementPolicy: {
        button: 'prefer-design-system',
        input: 'prefer-design-system',
        select: 'prefer-design-system',
        textarea: 'prefer-design-system',
        dialog: 'prefer-design-system',
      },
      allowedRawElementFiles: [],
      ...(config.components || {}),
    },
    a11y: {
      disabledRules: [],
      includeSelectors: [],
      excludeSelectors: [],
      ...(config.a11y || {}),
    },
    uiAlignment: {
      enabled: true,
      defaultTolerancePx: 6,
      positionTolerancePx: 4,
      sizeTolerancePx: 4,
      fontSizeTolerancePx: 1,
      lineHeightTolerancePx: 2,
      colorTolerance: 8,
      requireSelectors: false,
      anchors: [],
      elements: [],
      checks: [],
      tolerance: {
        positionPx: 4,
        sizePx: 4,
        fontSizePx: 1,
        lineHeightPx: 2,
        colorDelta: 8,
      },
      tokens: {},
      ...(config.uiAlignment || {}),
    },
    debt: {
      maxHardCodedColors: 0,
      maxArbitraryTailwindValues: 5,
      maxInlineStyles: 0,
      allowedColorValues: ['#000', '#fff', 'transparent'],
      ...(config.debt || {}),
    },
    __meta: {
      configPath,
      configDir,
      pluginRoot: findPluginRoot(),
    },
  };

  await ensureDir(normalized.project.outputDir);
  await ensureDir(path.join(normalized.project.outputDir, 'reports'));
  await ensureDir(path.join(normalized.project.outputDir, 'expected'));
  await ensureDir(path.join(normalized.project.outputDir, 'actual'));
  await ensureDir(path.join(normalized.project.outputDir, 'diff'));

  return normalized;
}

export function resolveConfigPath(config, maybeRelativePath) {
  if (!maybeRelativePath) return undefined;
  if (path.isAbsolute(maybeRelativePath)) return maybeRelativePath;
  return path.resolve(config.__meta.configDir, maybeRelativePath);
}

export function screenUrl(config, screen) {
  const rawUrl = screen?.app?.url || '/';
  if (/^https?:\/\//.test(rawUrl)) return rawUrl;
  const base = config.project.baseUrl.replace(/\/$/, '');
  const suffix = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${base}${suffix}`;
}
