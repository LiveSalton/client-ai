#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_KEY = 'aicoding.formatViewer.designMd';
const PARSER_VERSION = 5;
const SCHEMA_KEYS = ['version', 'name', 'description', 'colors', 'typography', 'rounded', 'spacing', 'components'];
const EXTENSION_KEYS = ['schemaVersion', 'layout', 'options', 'tokens', 'designTokens', 'design_tokens', 'states', 'rules', 'implementationRules', 'openDecisions', 'decisions'];
const dataPath = process.env.AICODING_CANVAS_DATA || path.resolve(process.cwd(), '.aicoding-canvas-data.json');
const scriptArgs = parseJson(process.env.AICODING_CANVAS_SCRIPT_ARGS || '{}');
const targetFilePath = typeof scriptArgs.targetFilePath === 'string' ? scriptArgs.targetFilePath : '';
const existing = await readCanvasData(dataPath);

if (!targetFilePath) {
  existing[DATA_KEY] = createErrorData('', 'No target file path was provided.');
  await writeCanvasDataAtomic(dataPath, existing);
  process.exit(0);
}

try {
  existing[DATA_KEY] = await parseDesignMdFile(targetFilePath);
} catch (error) {
  existing[DATA_KEY] = createErrorData(targetFilePath, error instanceof Error ? error.message : String(error));
}

await writeCanvasDataAtomic(dataPath, existing);

async function parseDesignMdFile(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const warnings = [];
  const frontmatter = await parseFrontmatter(source, warnings);
  const sections = parseSections(frontmatter.body);
  const title = findDocumentTitle(frontmatter.body) || stringValue(frontmatter.data.name || frontmatter.data.title) || 'DESIGN.md';
  const tokens = parseTokens(frontmatter.data, sections, warnings);
  const components = parseComponents(frontmatter.data, sections);
  const states = parseStates(frontmatter.data, sections, components);
  const rules = parseRules(frontmatter.data, sections);
  const openDecisions = parseOpenDecisions(frontmatter.data, sections);
  const designSystem = parseDesignSystem(frontmatter.data, frontmatter.body, sections, warnings);

  addCompletenessWarnings(warnings, sections, tokens, components, states, rules);

  return {
    schemaVersion: 1,
    parserVersion: PARSER_VERSION,
    sourcePath: filePath,
    updatedAt: new Date().toISOString(),
    title,
    tokens,
    sections,
    components,
    states,
    rules,
    openDecisions,
    designSystem,
    warnings,
    error: frontmatter.error,
  };
}

async function parseFrontmatter(source, warnings) {
  const normalized = source.replace(/^\uFEFF/u, '');
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/u);
  if (!match) {
    warnings.push({ severity: 'warning', message: 'No YAML frontmatter found. Markdown sections will be used as the only source.' });
    return { data: {}, body: normalized, error: null };
  }

  try {
    const yaml = await importYaml();
    const parsed = yaml ? yaml.parse(match[1]) : parseSimpleYaml(match[1]);
    return {
      data: isRecord(parsed) ? parsed : {},
      body: normalized.slice(match[0].length),
      error: null,
    };
  } catch (error) {
    const repaired = repairYamlScalars(match[1]);
    if (repaired !== match[1]) {
      try {
        const yaml = await importYaml();
        const parsed = yaml ? yaml.parse(repaired) : parseSimpleYaml(repaired);
        warnings.push({ severity: 'info', message: 'Frontmatter contained unquoted ":" inside scalar values and was auto-repaired.' });
        return {
          data: isRecord(parsed) ? parsed : {},
          body: normalized.slice(match[0].length),
          error: null,
        };
      } catch {
        // fall through to the original error path
      }
    }
    const message = error instanceof Error ? error.message : String(error);
    warnings.push({ severity: 'danger', message: `Frontmatter YAML could not be parsed: ${message}` });
    return {
      data: {},
      body: normalized.slice(match[0].length),
      error: message,
    };
  }
}

function repairYamlScalars(text) {
  return text.split('\n').map(line => {
    const match = /^(\s*[\p{L}_][\p{L}\p{N}_-]*):\s+(.*)$/u.exec(line);
    if (!match) return line;
    const value = match[2];
    if (!value || /^["'|>#&*[{]/u.test(value)) return line;
    if (!/:\s/u.test(value)) return line;
    return `${match[1]}: ${JSON.stringify(value)}`;
  }).join('\n');
}

async function importYaml() {
  try {
    const mod = await import('yaml');
    return mod.default || mod;
  } catch {
    return null;
  }
}

function parseSections(markdown) {
  const sections = [];
  let current = null;

  for (const line of markdown.split(/\r?\n/u)) {
    const match = /^(#{2,4})\s+(.+?)\s*$/u.exec(line);
    if (match) {
      current = {
        level: match[1].length,
        title: normalizeHeading(match[2]),
        rawTitle: match[2].trim(),
        excerpt: '',
        wordCount: 0,
        completeness: 'empty',
      };
      sections.push(current);
      continue;
    }
    if (current) current.excerpt += `${line}\n`;
  }

  for (const section of sections) {
    section.excerpt = compactExcerpt(section.excerpt);
    section.wordCount = countWords(section.excerpt);
    section.completeness = section.wordCount === 0 ? 'empty' : section.wordCount < 30 ? 'thin' : 'ready';
  }

  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    if (section.completeness !== 'empty') continue;
    const childWordCount = countChildSectionWords(sections, index);
    if (childWordCount > 0) {
      section.wordCount = childWordCount;
      section.completeness = childWordCount < 30 ? 'thin' : 'ready';
    }
  }

  return sections;
}

function countChildSectionWords(sections, index) {
  const parent = sections[index];
  let total = 0;
  for (let cursor = index + 1; cursor < sections.length; cursor += 1) {
    const child = sections[cursor];
    if (child.level <= parent.level) break;
    total += child.wordCount;
  }
  return total;
}

function parseTokens(frontmatter, sections, warnings) {
  const tokens = [];
  const frontmatterTokens = firstRecord(frontmatter, ['tokens', 'designTokens', 'design_tokens']);
  const addFrontmatterGroup = (group, value) => {
    if (!isRecord(value) || tokens.some(token => normalizeHeading(token.group) === normalizeHeading(group))) return;
    const entries = flattenTokenEntries(value);
    tokens.push({ group, count: entries.length, source: 'frontmatter', entries: entries.slice(0, 24) });
  };

  if (frontmatterTokens) {
    for (const [group, value] of Object.entries(frontmatterTokens)) {
      addFrontmatterGroup(group, value);
    }
  }

  for (const group of ['colors', 'typography', 'spacing', 'rounded', 'radii', 'radius', 'layout', 'elevation', 'shadows', 'motion', 'options']) {
    addFrontmatterGroup(group, frontmatter[group]);
  }

  for (const section of sections.filter(section => /color|typography|font|spacing|radius|shadow|elevation|token/u.test(section.title))) {
    if (tokens.some(token => normalizeHeading(token.group) === section.title)) continue;
    const entries = parseInlineTokens(section.excerpt);
    tokens.push({ group: section.rawTitle, count: entries.length, source: 'markdown', entries: entries.slice(0, 24) });
  }

  if (tokens.length === 0) {
    warnings.push({ severity: 'warning', message: 'No token groups were detected in frontmatter or token sections.' });
  }

  return tokens;
}

function parseDesignSystem(frontmatter, markdown, sections, warnings) {
  const topLevelKeys = Object.keys(isRecord(frontmatter) ? frontmatter : {});
  const schemaKeySet = new Set(SCHEMA_KEYS);
  const extensionKeySet = new Set(EXTENSION_KEYS);
  const unknownKeys = topLevelKeys.filter(key => !schemaKeySet.has(key) && !extensionKeySet.has(key));
  const markdownSystem = parseMarkdownDesignSystem(sections);
  const colors = mergeByName(parseColorTokens(firstRecord(frontmatter, ['colors'])), markdownSystem.colors);
  const typography = mergeByName(parseTypographyTokens(firstRecord(frontmatter, ['typography'])), markdownSystem.typography);
  const rounded = mergeByName(parseScaleTokens(firstRecord(frontmatter, ['rounded']), 'rounded'), markdownSystem.rounded);
  const spacing = mergeByName(parseScaleTokens(firstRecord(frontmatter, ['spacing']), 'spacing'), markdownSystem.spacing);
  const layout = mergeByName(parseScaleTokens(firstRecord(frontmatter, ['layout']), 'layout'), markdownSystem.layout);
  const options = parseOptionTokens(firstRecord(frontmatter, ['options']));
  const componentTokens = mergeByName(parseComponentTokens(firstRecord(frontmatter, ['components'])), markdownSystem.components);
  const references = parseTokenReferences(frontmatter, markdown, colors);
  const contrastPairs = buildContrastPairs(colors);
  const componentPropertyCounts = countComponentProperties(componentTokens);
  const presentSchemaKeys = unique([
    ...topLevelKeys.filter(key => schemaKeySet.has(key)),
    ...(colors.length > 0 ? ['colors'] : []),
    ...(typography.length > 0 ? ['typography'] : []),
    ...(rounded.length > 0 ? ['rounded'] : []),
    ...(spacing.length > 0 ? ['spacing'] : []),
    ...(componentTokens.length > 0 ? ['components'] : []),
  ]);
  const extensionKeys = unique([
    ...topLevelKeys.filter(key => extensionKeySet.has(key)),
    ...(layout.length > 0 ? ['layout'] : []),
  ]);

  if (colors.length > 0 && !colors.some(color => color.role === 'primary')) {
    warnings.push({ severity: 'warning', message: 'Colors are defined but no primary color token was found.' });
  }
  if (unknownKeys.length > 0) {
    warnings.push({ severity: 'info', message: `Custom frontmatter keys detected: ${unknownKeys.join(', ')}.` });
  }

  return {
    schemaVersion: 1,
    schemaKeys: SCHEMA_KEYS,
    presentSchemaKeys,
    extensionKeys,
    unknownKeys,
    name: stringValue(frontmatter.name) || markdownSystem.name,
    description: stringValue(frontmatter.description) || markdownSystem.description,
    version: stringValue(frontmatter.version),
    colors,
    typography,
    rounded,
    spacing,
    layout,
    options,
    components: componentTokens,
    references,
    contrastPairs,
    componentPropertyCounts,
  };
}

function parseColorTokens(colors) {
  if (!colors) return [];
  return Object.entries(colors).flatMap(([name, value]) => {
    if (isRecord(value)) {
      return flattenTokenEntries(value, name).map(entry => colorToken(entry.name, entry.value));
    }
    return [colorToken(name, formatScalar(value))];
  });
}

function colorToken(name, value) {
  const rgb = parseColor(value);
  return {
    name,
    value,
    role: classifyColorRole(name),
    family: classifyColorFamily(name),
    luminance: rgb ? round(relativeLuminance(rgb), 4) : null,
    contrastOnWhite: rgb ? round(contrastRatio(rgb, { r: 255, g: 255, b: 255 }), 2) : null,
    contrastOnBlack: rgb ? round(contrastRatio(rgb, { r: 0, g: 0, b: 0 }), 2) : null,
    isDisplayable: isDisplayableColor(value),
  };
}

function parseTypographyTokens(typography) {
  if (!typography) return [];
  return Object.entries(typography).map(([name, value]) => {
    const record = isRecord(value) ? value : { value };
    const properties = Object.entries(record).map(([property, raw]) => ({ property, value: formatScalar(raw) }));
    return {
      name,
      fontFamily: stringValue(record.fontFamily),
      fontSize: stringValue(record.fontSize || record.size),
      fontWeight: stringValue(record.fontWeight || record.weight),
      lineHeight: stringValue(record.lineHeight),
      letterSpacing: stringValue(record.letterSpacing),
      properties,
    };
  });
}

function parseScaleTokens(group, kind) {
  if (!group) return [];
  return Object.entries(group).map(([name, value]) => {
    const formatted = formatScalar(value);
    const dimension = parseDimension(formatted);
    return {
      name,
      value: formatted,
      kind,
      numericValue: dimension?.value ?? null,
      unit: dimension?.unit ?? '',
    };
  });
}

function parseOptionTokens(options) {
  if (!options) return [];
  return Object.entries(options).map(([name, value]) => ({
    name,
    value: formatScalar(value),
    enabled: typeof value === 'boolean' ? value : null,
  }));
}

function parseComponentTokens(components) {
  if (!components) return [];
  return Object.entries(components).map(([name, value]) => {
    const record = isRecord(value) ? value : { value };
    const properties = Object.entries(record).map(([property, raw]) => {
      const valueText = formatScalar(raw);
      const reference = parseReference(valueText);
      return {
        property,
        value: valueText,
        reference,
        resolvedGroup: reference?.split('.')[0] || '',
      };
    });
    return {
      name,
      category: classifyComponentCategory(name),
      state: inferComponentState(name),
      properties,
    };
  });
}

function parseTokenReferences(frontmatter, markdown, colors = []) {
  const counts = new Map();
  const colorNames = new Set(colors.map(color => color.name));
  const visit = value => {
    if (typeof value === 'string') {
      for (const match of value.matchAll(/\{([A-Za-z0-9_.-]+)\}/gu)) {
        counts.set(match[1], (counts.get(match[1]) || 0) + 1);
      }
      for (const match of value.matchAll(/var\(--([a-z0-9-]+)\)|`--([a-z0-9-]+)`/giu)) {
        const name = match[1] || match[2];
        const group = colorNames.has(name) ? 'colors' : /width|breakpoint|container|grid|gutter/u.test(name) ? 'layout' : 'tokens';
        const path = `${group}.${name}`;
        counts.set(path, (counts.get(path) || 0) + 1);
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (isRecord(value)) {
      for (const item of Object.values(value)) visit(item);
    }
  };
  visit(frontmatter);
  visit(markdown);
  return Array.from(counts.entries())
    .map(([path, count]) => ({ path, group: path.split('.')[0] || '', count }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, 40);
}

function buildContrastPairs(colors) {
  const backgrounds = colors.filter(color => /canvas|surface|background|bg|paper|card|tile|black|white|neutral/u.test(color.name.toLowerCase()));
  const foregrounds = colors.filter(color => /ink|text|body|foreground|on-|primary|link/u.test(color.name.toLowerCase()));
  const pairs = [];
  for (const background of backgrounds.slice(0, 8)) {
    const bg = parseColor(background.value);
    if (!bg) continue;
    for (const foreground of foregrounds.slice(0, 10)) {
      if (background.name === foreground.name) continue;
      const fg = parseColor(foreground.value);
      if (!fg) continue;
      const ratio = contrastRatio(bg, fg);
      pairs.push({
        background: background.name,
        foreground: foreground.name,
        backgroundValue: background.value,
        foregroundValue: foreground.value,
        ratio: round(ratio, 2),
        grade: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'Large' : 'Fail',
      });
    }
  }
  return pairs.sort((a, b) => b.ratio - a.ratio).slice(0, 16);
}

function countComponentProperties(components) {
  const counts = new Map();
  for (const component of components) {
    for (const property of component.properties) {
      counts.set(property.property, (counts.get(property.property) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([property, count]) => ({ property, count }))
    .sort((a, b) => b.count - a.count || a.property.localeCompare(b.property));
}

function parseMarkdownDesignSystem(sections) {
  const colorSection = withChildSections(sections, findSectionLike(sections, [/^colors?$/u, /color tokens/u, /color palette/u, /palette/u]));
  const typographySection = withChildSections(sections, findSectionLike(sections, [/typography tokens/u, /^typography$/u, /typography rules/u]));
  const spacingSection = withChildSections(sections, findSectionLike(sections, [/spacing scale/u, /^spacing$/u]));
  const layoutSection = withChildSections(sections, findSectionLike(sections, [/layout tokens/u, /^layout$/u]));
  const roundedSection = withChildSections(sections, findSectionLike(sections, [/shape|border radius|rounded/u]));
  const titleSection = sections[0];
  return {
    name: '',
    description: titleSection?.excerpt.split(/\r?\n/u).find(line => line.trim() && !line.trim().startsWith('>'))?.trim() || '',
    colors: parseMarkdownColorTable(colorSection),
    typography: parseMarkdownTypographyTable(typographySection),
    spacing: parseMarkdownScaleTable(spacingSection, 'spacing', ['Step', 'Token']),
    layout: parseMarkdownScaleTable(layoutSection, 'layout', ['Token', 'Name']),
    rounded: parseMarkdownScaleTable(roundedSection, 'rounded', ['Context', 'Token', 'Name']),
    components: parseMarkdownComponentCatalogue(sections),
  };
}

function stripTokenReference(value) {
  return String(value || '').replace(/[{}`]/gu, '').replace(/^(typography|colors?|spacing|rounded|layout)\./u, '').trim();
}

function withChildSections(sections, target) {
  if (!target) return target;
  const index = sections.indexOf(target);
  if (index === -1) return target;
  let excerpt = target.excerpt || '';
  for (let i = index + 1; i < sections.length; i += 1) {
    const child = sections[i];
    if (child.level <= target.level) break;
    excerpt += `\n### ${child.rawTitle}\n${child.excerpt}\n`;
  }
  return { ...target, excerpt: compactExcerpt(excerpt) };
}

function parseMarkdownColorTable(section) {
  if (!section) return [];
  const fromTable = parseMarkdownTable(section.excerpt).flatMap(row => {
    const rawName = stripTokenReference(row.Token || row.Name || row.Color || '');
    const rawValue = row.Value || row.Default || '';
    const name = tokenName(rawName);
    const value = firstTokenValue(rawValue);
    if (!name || !value) return [];
    return [colorToken(name, value)];
  });
  if (fromTable.length > 0) return fromTable;
  return parseMarkdownColorBullets(section.excerpt);
}

function parseMarkdownColorBullets(excerpt) {
  const tokens = [];
  let roleHint = '';
  for (const line of String(excerpt || '').split(/\r?\n/u)) {
    const heading = /^#{2,4}\s+(.+?)\s*$/u.exec(line);
    if (heading) {
      roleHint = classifyColorRoleHeading(heading[1]);
      continue;
    }
    const match = /^\s*[-*]\s+\*\*([^*]+)\*\*\s*[—:–-]?\s*\(?\s*`?(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\))`?/u.exec(line);
    if (!match) continue;
    const name = tokenName(match[1]);
    if (!name) continue;
    const token = colorToken(name, match[2]);
    if (roleHint) token.role = roleHint;
    tokens.push(token);
  }
  return tokens;
}

function classifyColorRoleHeading(rawTitle) {
  const title = normalizeHeading(rawTitle);
  if (/primary|brand/u.test(title)) return 'primary';
  if (/accent|secondary/u.test(title)) return 'accent';
  if (/surface|background|canvas/u.test(title)) return 'surface';
  if (/neutral|text|ink/u.test(title)) return 'text';
  if (/semantic|state|status|feedback/u.test(title)) return 'semantic';
  if (/border|divider|stroke/u.test(title)) return 'border';
  return '';
}

function parseMarkdownTypographyTable(section) {
  if (!section) return [];
  return parseMarkdownTable(section.excerpt).flatMap(row => {
    const rawName = stripTokenReference(row.Token || row.Name || row.Style || row.Role || '');
    const rawValue = row.Value || row.Default
      || Object.entries(row)
        .filter(([key]) => !['Token', 'Name', 'Style', 'Role', 'Notes'].includes(key))
        .map(([key, cell]) => `${key}: ${cell}`)
        .join(' / ');
    const name = slugToken(rawName);
    if (!name || !rawValue) return [];
    const properties = [{ property: 'value', value: cleanMarkdown(rawValue) }];
    const fontFamily = extractFontFamily(rawValue, rawName);
    const fontSize = extractFontSize(rawValue, rawName);
    const fontWeight = extractFontWeight(rawValue, rawName);
    const lineHeight = extractLineHeight(rawValue, rawName);
    if (fontFamily) properties.push({ property: 'fontFamily', value: fontFamily });
    if (fontSize) properties.push({ property: 'fontSize', value: fontSize });
    if (fontWeight) properties.push({ property: 'fontWeight', value: fontWeight });
    if (lineHeight) properties.push({ property: 'lineHeight', value: lineHeight });
    return [{
      name,
      fontFamily,
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing: '',
      properties,
    }];
  });
}

function parseMarkdownScaleTable(section, kind, nameColumns) {
  if (!section) return [];
  return parseMarkdownTable(section.excerpt).flatMap(row => {
    const rawName = nameColumns.map(column => row[column]).find(Boolean) || '';
    const rawValue = row.Value || row['Min-width'] || row['Container max-width'] || '';
    const name = tokenName(rawName) || slugToken(rawName);
    const value = firstCssValue(rawValue);
    if (!name || !value) return [];
    const dimension = parseDimension(value);
    return [{
      name,
      value,
      kind,
      numericValue: dimension?.value ?? null,
      unit: dimension?.unit ?? '',
    }];
  });
}

function parseMarkdownComponentCatalogue(sections) {
  const catalogueIndex = sections.findIndex(section => /component catalogue/u.test(section.title));
  if (catalogueIndex < 0) return [];
  const result = [];
  for (let index = catalogueIndex + 1; index < sections.length; index += 1) {
    const section = sections[index];
    if (section.level <= sections[catalogueIndex].level && !/component catalogue/u.test(section.title)) break;
    if (section.level !== 3) continue;
    result.push(markdownComponentFromSection(section));
  }
  return result;
}

function markdownComponentFromSection(section) {
  const name = slugToken(section.rawTitle);
  const text = section.excerpt;
  const properties = [];
  const background = firstMatchValue(text, [/\bbg\s+([#A-Za-z0-9()[\]._-]+)/iu, /\bbackground(?:Color)?:?\s+([#A-Za-z0-9()[\]._-]+)/iu]);
  const foreground = firstMatchValue(text, [/\b(?:text|color)\s+([#A-Za-z0-9()[\]._-]+)/iu]);
  const border = firstMatchValue(text, [/\bborder(?:-color)?:?.*?([#][0-9a-f]{3,8}|--[a-z0-9-]+|var\(--[a-z0-9-]+\))/iu]);
  const radius = firstMatchValue(text, [/([0-9.]+(?:rem|px|em)|[0-9]+px)\s+radius/iu, /radius\s+([0-9.]+(?:rem|px|em)|[0-9]+px|[0-9]+em)/iu]);
  const padding = firstMatchValue(text, [/padding(?:[: ]+)([0-9./\srempx]+?)(?:,|\n|$)/iu]);
  const typography = firstMatchValue(text, [/([0-9.]+(?:rem|px))(?:\/[0-9.]+(?:rem|px))?/iu]);
  if (background) properties.push({ property: 'backgroundColor', value: normalizeCssReference(background), reference: '', resolvedGroup: '' });
  if (foreground) properties.push({ property: 'textColor', value: normalizeCssReference(foreground), reference: '', resolvedGroup: '' });
  if (border) properties.push({ property: 'borderColor', value: normalizeCssReference(border), reference: '', resolvedGroup: '' });
  if (radius) properties.push({ property: 'rounded', value: radius, reference: '', resolvedGroup: '' });
  if (padding) properties.push({ property: 'padding', value: padding.trim(), reference: '', resolvedGroup: '' });
  if (typography) properties.push({ property: 'typography', value: typography, reference: '', resolvedGroup: '' });

  if (/button/u.test(section.title) && !properties.some(property => property.property === 'backgroundColor')) {
    properties.push({ property: 'backgroundColor', value: '{colors.brand}', reference: 'colors.brand', resolvedGroup: 'colors' });
    properties.push({ property: 'textColor', value: '#fff', reference: '', resolvedGroup: '' });
  }
  if (/card|article preview/u.test(section.title) && !properties.some(property => property.property === 'backgroundColor')) {
    properties.push({ property: 'backgroundColor', value: '#fff', reference: '', resolvedGroup: '' });
  }

  return {
    name,
    category: classifyComponentCategory(name),
    state: '',
    properties,
  };
}

function parseMarkdownTable(text) {
  const lines = text.split(/\r?\n/u).map(line => line.trim()).filter(line => /^\|.*\|$/u.test(line));
  if (lines.length < 2) return [];
  const header = splitTableLine(lines[0]);
  return lines.slice(2).flatMap(line => {
    const cells = splitTableLine(line);
    if (cells.length < 2) return [];
    return [Object.fromEntries(header.map((key, index) => [cleanMarkdown(key), cleanMarkdown(cells[index] || '')]))];
  });
}

function splitTableLine(line) {
  return line.replace(/^\|/u, '').replace(/\|$/u, '').split('|').map(cell => cell.trim());
}

function findSectionLike(sections, patterns) {
  return sections.find(section => patterns.some(pattern => pattern.test(section.title)));
}

function cleanMarkdown(value) {
  return String(value || '')
    .replace(/`/gu, '')
    .replace(/\*\*/gu, '')
    .replace(/&nbsp;/gu, ' ')
    .trim();
}

function tokenName(value) {
  return cleanMarkdown(value).replace(/^--/u, '').trim();
}

function slugToken(value) {
  return cleanMarkdown(value)
    .toLowerCase()
    .replace(/[—–]/gu, '-')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');
}

function firstTokenValue(value) {
  return cleanMarkdown(value).split(/\s+/u)[0] || '';
}

function firstCssValue(value) {
  const cleaned = cleanMarkdown(value);
  return /[0-9.]+(?:rem|px|em|%)|[0-9]+|var\(--[a-z0-9-]+\)|#[0-9a-f]{3,8}/iu.exec(cleaned)?.[0] || cleaned.split(/\s+/u)[0] || '';
}

function extractFontFamily(rawValue, rawName) {
  const text = cleanMarkdown(`${rawName} ${rawValue}`);
  const quoted = /'([^']+)'|"([^"]+)"/u.exec(text);
  if (quoted) return quoted[1] || quoted[2] || '';
  if (/source sans pro/iu.test(text)) return 'Source Sans Pro, sans-serif';
  if (/\blora\b/iu.test(text)) return 'Lora, serif';
  return '';
}

function extractFontSize(rawValue, rawName) {
  const text = cleanMarkdown(`${rawName} ${rawValue}`);
  if (/line height|weight/iu.test(rawName)) return '';
  return /[0-9.]+(?:rem|px)/iu.exec(text)?.[0] || '';
}

function extractFontWeight(rawValue, rawName) {
  const text = cleanMarkdown(`${rawName} ${rawValue}`);
  return /weight\s*([0-9]+)/iu.exec(text)?.[1] || (/weight/iu.test(rawName) ? /[0-9]+/u.exec(text)?.[0] || '' : '');
}

function extractLineHeight(rawValue, rawName) {
  const text = cleanMarkdown(`${rawName} ${rawValue}`);
  return /line[- ]height.*?([0-9.]+(?:rem|px)?)/iu.exec(text)?.[1] || (/line height/iu.test(rawName) ? /[0-9.]+(?:rem|px)?/u.exec(rawValue)?.[0] || '' : '');
}

function firstMatchValue(text, patterns) {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) return cleanMarkdown(match[1]);
  }
  return '';
}

function normalizeCssReference(value) {
  const cleaned = cleanMarkdown(value);
  const cssVar = /^var\(--([a-z0-9-]+)\)$/iu.exec(cleaned) || /^--([a-z0-9-]+)$/iu.exec(cleaned);
  return cssVar ? `{colors.${cssVar[1]}}` : cleaned;
}

function mergeByName(primary, fallback) {
  const seen = new Set(primary.map(item => item.name));
  return [...primary, ...fallback.filter(item => !seen.has(item.name))];
}

function parseComponents(frontmatter, sections) {
  const components = [];
  const frontmatterComponents = firstRecord(frontmatter, ['components']);

  if (frontmatterComponents) {
    for (const [name, value] of Object.entries(frontmatterComponents)) {
      const record = isRecord(value) ? value : {};
      const properties = Object.entries(record).map(([key, child]) => `${key}: ${formatScalar(child)}`);
      components.push({
        name,
        variants: toStringArray(record.variants),
        states: unique([...toStringArray(record.states), inferComponentState(name)].filter(Boolean)),
        rules: unique([...toStringArray(record.rules || record.guidelines), ...properties]),
        source: 'frontmatter',
      });
    }
  }

  const componentSection = findSection(sections, ['components', 'component rules', 'component contract']);
  if (!componentSection) {
    return components.length > 0 ? components : parseMarkdownComponentsForCoverage(sections);
  }

  for (const component of parseComponentBullets(componentSection.excerpt)) {
    const existing = components.find(item => normalizeHeading(item.name) === normalizeHeading(component.name));
    if (existing) {
      existing.variants = unique([...existing.variants, ...component.variants]);
      existing.states = unique([...existing.states, ...component.states]);
      existing.rules = unique([...existing.rules, ...component.rules]);
    } else {
      components.push({ ...component, source: 'markdown' });
    }
  }

  return components;
}

function parseMarkdownComponentsForCoverage(sections) {
  const designComponents = parseMarkdownComponentCatalogue(sections);
  return designComponents.map(component => ({
    name: component.name,
    variants: [],
    states: component.state ? [component.state] : [],
    rules: component.properties.map(property => `${property.property}: ${property.value}`),
    source: 'markdown',
  }));
}

function parseStates(frontmatter, sections, components) {
  const rawStates = firstRecord(frontmatter, ['states', 'interactionStates', 'interaction_states']);
  const knownStates = ['default', 'hover', 'focus', 'focus-visible', 'active', 'disabled', 'loading', 'error', 'empty', 'selected', 'pressed'];
  const states = [];

  if (rawStates) {
    for (const [name, value] of Object.entries(rawStates)) {
      states.push({
        name,
        components: toStringArray(isRecord(value) ? value.components : []),
        requirement: isRecord(value) ? stringValue(value.requirement || value.rule) : stringValue(value),
        source: 'frontmatter',
      });
    }
  }

  const stateSection = findSection(sections, ['states', 'interaction states', 'state matrix', 'component states']);
  if (stateSection) {
    for (const stateName of knownStates) {
      if (!wordRegex(stateName).test(stateSection.excerpt)) continue;
      if (!states.some(item => normalizeHeading(item.name) === normalizeHeading(stateName))) {
        states.push({
          name: stateName,
          components: components.filter(component => component.states.includes(stateName)).map(component => component.name),
          requirement: lineContaining(stateSection.excerpt, stateName),
          source: 'markdown',
        });
      }
    }
  }

  for (const component of components) {
    for (const stateName of component.states) {
      const state = states.find(item => normalizeHeading(item.name) === normalizeHeading(stateName));
      if (state) state.components = unique([...state.components, component.name]);
      else states.push({ name: stateName, components: [component.name], requirement: '', source: component.source });
    }
  }

  return states;
}

function parseRules(frontmatter, sections) {
  const rules = [];
  for (const value of toStringArray(frontmatter.rules || frontmatter.implementationRules)) {
    rules.push({ kind: 'Rule', text: value, source: 'frontmatter' });
  }

  for (const section of sections) {
    if (!/do|dont|rule|implementation|accessibility|responsive|motion|state/u.test(section.title)) continue;
    for (const bullet of extractBullets(section.excerpt)) {
      rules.push({ kind: classifyRule(section.rawTitle, bullet), text: bullet, source: 'markdown' });
    }
  }

  return uniqueBy(rules, rule => `${rule.kind}:${rule.text}`);
}

function parseOpenDecisions(frontmatter, sections) {
  const decisions = [];
  for (const value of toStringArray(frontmatter.openDecisions || frontmatter.decisions)) {
    decisions.push({ text: value, source: 'frontmatter' });
  }

  for (const section of sections) {
    if (!/open|decision|todo|gap|unknown|question/u.test(section.title)) continue;
    for (const bullet of extractBullets(section.excerpt)) {
      decisions.push({ text: bullet, source: 'markdown' });
    }
  }

  return uniqueBy(decisions, decision => decision.text);
}

function addCompletenessWarnings(warnings, sections, tokens, components, states, rules) {
  const hasTokenGroup = group => tokens.some(token => normalizeHeading(token.group) === normalizeHeading(group) && token.count > 0);
  const coveredByStructuredData = {
    colors: hasTokenGroup('colors'),
    typography: hasTokenGroup('typography'),
    layout: hasTokenGroup('layout'),
    components: components.length > 0,
  };
  for (const required of ['overview', 'colors', 'typography', 'layout', 'components']) {
    if (!hasSection(sections, required) && !coveredByStructuredData[required]) {
      warnings.push({
        severity: required === 'colors' || required === 'typography' ? 'danger' : 'warning',
        message: `Missing ## ${titleCase(required)} section.`,
      });
    }
  }

  if (tokens.length > 0 && !tokens.some(token => token.count > 0)) {
    warnings.push({ severity: 'warning', message: 'Token sections exist but no concrete token entries were detected.' });
  }
  if (components.length === 0) warnings.push({ severity: 'warning', message: 'No component rules were detected.' });
  if (states.length === 0) warnings.push({ severity: 'warning', message: 'No component or interaction states were detected.' });
  if (rules.length === 0) warnings.push({ severity: 'warning', message: "No Do/Don't or implementation rules were detected." });
}

function hasSection(sections, required) {
  const aliases = {
    colors: [/^colors?$/u, /color tokens/u],
    typography: [/^typography$/u, /typography tokens/u],
    layout: [/^layout$/u, /layout tokens/u],
    components: [/^components?$/u, /component catalogue/u, /component contract/u],
    overview: [/^overview$/u, /brand & style/u],
  }[required] || [new RegExp(`^${escapeRegExp(required)}$`, 'u')];
  return sections.some(section => aliases.some(pattern => pattern.test(section.title)) || section.title.startsWith(`${required} `) || section.title.startsWith(`${required} &`));
}

function findDocumentTitle(markdown) {
  return markdown.match(/^#\s+(.+?)\s*$/mu)?.[1]?.trim();
}

function flattenTokenEntries(value, prefix = '') {
  if (!isRecord(value)) return prefix ? [{ name: prefix, value: formatScalar(value) }] : [];
  const entries = [];
  for (const [key, child] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (isRecord(child)) entries.push(...flattenTokenEntries(child, name));
    else entries.push({ name, value: formatScalar(child) });
  }
  return entries;
}

function parseInlineTokens(text) {
  const entries = [];
  const patterns = [
    /`([^`]+)`\s*[:=-]\s*([^,\n]+)/gu,
    /^[-*]\s+([^:：]+)[:：]\s*(.+)$/gmu,
    /\b(--[a-z0-9-]+)\b\s*[:=]?\s*([#a-z0-9().,%\s-]+)?/giu,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const name = match[1]?.trim();
      const value = match[2]?.trim() || '';
      if (name) entries.push({ name, value });
    }
  }
  return uniqueBy(entries, entry => `${entry.name}:${entry.value}`);
}

function parseComponentBullets(text) {
  return extractBullets(text).flatMap(bullet => {
    const match = /^`?([A-Z][A-Za-z0-9._/-]+)`?\s*(?:[:：-]\s*)?(.*)$/u.exec(bullet);
    if (!match) return [];
    const rest = match[2] || '';
    return [{
      name: match[1],
      variants: parseNamedList(rest, ['variant', 'variants']),
      states: knownWords(rest, ['default', 'hover', 'focus', 'focus-visible', 'active', 'disabled', 'loading', 'error', 'empty', 'selected', 'pressed']),
      rules: rest ? [rest] : [],
    }];
  });
}

function parseNamedList(text, labels) {
  const values = [];
  for (const label of labels) {
    const match = new RegExp(`${label}s?\\s*[:=]\\s*([^.;]+)`, 'iu').exec(text);
    if (match) values.push(...match[1].split(/[,/]/u).map(value => value.trim()).filter(Boolean));
  }
  return unique(values);
}

function knownWords(text, words) {
  return words.filter(word => wordRegex(word).test(text));
}

function lineContaining(text, word) {
  return text.split(/\r?\n/u).map(line => line.trim()).find(line => wordRegex(word).test(line)) || '';
}

function wordRegex(word) {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'iu');
}

function extractBullets(text) {
  return text
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => /^[-*]\s+\S/u.test(line) || /^\d+\.\s+\S/u.test(line))
    .map(line => line.replace(/^[-*]\s+/u, '').replace(/^\d+\.\s+/u, '').trim())
    .filter(Boolean);
}

function classifyRule(sectionTitle, text) {
  const value = `${sectionTitle} ${text}`.toLowerCase();
  if (/\bdon'?t\b|\bdont\b|\bavoid\b|\bnever\b/u.test(value)) return "Don't";
  if (/\bdo\b|\bmust\b|\brequire\b|\bshould\b/u.test(value)) return 'Do';
  if (/\ba11y\b|\baccessibility\b|\bfocus\b|\bcontrast\b/u.test(value)) return 'Accessibility';
  if (/\bmotion\b|\banimation\b|\breduced\b/u.test(value)) return 'Motion';
  return 'Rule';
}

function findSection(sections, names) {
  const normalized = names.map(normalizeHeading);
  return sections.find(section => normalized.includes(section.title));
}

function firstRecord(source, keys) {
  if (!isRecord(source)) return null;
  for (const key of keys) {
    if (isRecord(source[key])) return source[key];
  }
  return null;
}

function parseReference(value) {
  const match = /^\{([A-Za-z0-9_.-]+)\}$/u.exec(value.trim());
  return match?.[1] || '';
}

function classifyColorRole(name) {
  const value = name.toLowerCase();
  if (/^primary|primary|brand|accent|link|cta/u.test(value)) return 'primary';
  if (/surface|canvas|background|bg|paper|card|tile|panel/u.test(value)) return 'surface';
  if (/ink|text|body|foreground|on-/u.test(value)) return 'text';
  if (/border|divider|hairline|rule|stroke/u.test(value)) return 'border';
  if (/error|success|warning|danger|info/u.test(value)) return 'semantic';
  if (/neutral|gray|grey|muted|secondary|tertiary/u.test(value)) return 'neutral';
  return 'accent';
}

function classifyColorFamily(name) {
  const value = name.toLowerCase();
  if (/black|ink|dark|midnight|void/u.test(value)) return 'dark';
  if (/white|canvas|paper|cream|pearl|parchment/u.test(value)) return 'light';
  if (/blue|cyan|sky/u.test(value)) return 'blue';
  if (/green|mint|emerald/u.test(value)) return 'green';
  if (/red|rose|pink|coral|crimson/u.test(value)) return 'red';
  if (/yellow|gold|amber|orange/u.test(value)) return 'warm';
  if (/purple|violet|dusk/u.test(value)) return 'purple';
  if (/gray|grey|neutral|muted|slate/u.test(value)) return 'neutral';
  return 'other';
}

function classifyComponentCategory(name) {
  const value = name.toLowerCase();
  if (/button|cta|link|tag|chip|badge/u.test(value)) return 'action';
  if (/search|picker|toggle|radio|rating|text-?area/u.test(value)) return 'form';
  if (/code|terminal|snippet|stat\b|stat-|matrix/u.test(value)) return 'data';
  if (/table|list|row|cell/u.test(value)) return 'data';
  if (/nav|tabs?\b|menu|sidebar/u.test(value)) return 'navigation';
  if (/banner|strip|marquee|logo-wall/u.test(value)) return 'layout';
  if (/tier|pricing|accordion/u.test(value)) return 'surface';
  if (/card|tile|panel|surface|modal|toast/u.test(value)) return 'surface';
  if (/input|form|field|select|checkbox/u.test(value)) return 'form';
  if (/hero|section|band|footer|header|divider|sticky/u.test(value)) return 'layout';
  return 'component';
}

function inferComponentState(name) {
  const value = name.toLowerCase();
  for (const state of ['hover', 'focus', 'active', 'pressed', 'selected', 'disabled', 'loading', 'error', 'empty']) {
    if (new RegExp(`(?:^|[-_])${state}(?:$|[-_])`, 'u').test(value)) return state;
  }
  return '';
}

function parseDimension(value) {
  const match = /^(-?\d*\.?\d+)([a-zA-Z%]+)?$/u.exec(String(value).trim());
  if (!match) return null;
  return { value: Number(match[1]), unit: match[2] || '' };
}

function parseColor(value) {
  const raw = String(value || '').trim();
  let match = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/iu.exec(raw);
  if (match) {
    const hex = match[1];
    const expanded = hex.length === 3 || hex.length === 4
      ? hex.split('').map(char => `${char}${char}`).join('')
      : hex;
    return {
      r: parseInt(expanded.slice(0, 2), 16),
      g: parseInt(expanded.slice(2, 4), 16),
      b: parseInt(expanded.slice(4, 6), 16),
    };
  }
  match = /^rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)/iu.exec(raw);
  if (match) {
    return {
      r: clampChannel(Number(match[1])),
      g: clampChannel(Number(match[2])),
      b: clampChannel(Number(match[3])),
    };
  }
  return null;
}

function isDisplayableColor(value) {
  const raw = String(value || '').trim();
  return !!raw && !raw.startsWith('{') && !/color-mix|var\(/iu.test(raw);
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function relativeLuminance(color) {
  const channels = [color.r, color.g, color.b].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a, b) {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const light = Math.max(first, second);
  const dark = Math.min(first, second);
  return (light + 0.05) / (dark + 0.05);
}

function round(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.map(formatScalar).filter(Boolean);
  if (typeof value === 'string') return value.split(/\r?\n|,/u).map(item => item.trim()).filter(Boolean);
  if (isRecord(value)) return Object.entries(value).map(([key, child]) => `${key}: ${formatScalar(child)}`);
  return [];
}

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value);
}

function formatScalar(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(formatScalar).join(', ');
  if (isRecord(value)) return Object.entries(value).map(([key, child]) => `${key}: ${formatScalar(child)}`).join(', ');
  return String(value).trim();
}

function normalizeHeading(value) {
  return String(value || '').replace(/[`*_]/gu, '').replace(/[’']/gu, '').trim().replace(/^\d+[.)]\s*/u, '').toLowerCase();
}

function compactExcerpt(value) {
  return value.replace(/\n{3,}/gu, '\n\n').trim().slice(0, 4000);
}

function countWords(value) {
  return value.match(/[\p{L}\p{N}_-]+/gu)?.length || 0;
}

function titleCase(value) {
  return value.replace(/\b[a-z]/gu, char => char.toUpperCase());
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const key = keyFn(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function parseJson(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function parseSimpleYaml(raw) {
  const result = {};
  const stack = [{ indent: -1, value: result }];
  for (const line of raw.split(/\r?\n/u)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const match = /^(\s*)([A-Za-z0-9_-]+):\s*(.*)$/u.exec(line);
    if (!match) continue;
    const indent = match[1].length;
    while (stack.length > 1 && indent <= stack.at(-1).indent) stack.pop();
    const parent = stack.at(-1).value;
    const key = match[2];
    const rawValue = stripInlineComment(match[3]);
    if (rawValue === '') {
      parent[key] = {};
      stack.push({ indent, value: parent[key] });
    } else {
      parent[key] = parseSimpleYamlScalar(rawValue);
    }
  }
  return result;
}

function parseSimpleYamlScalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+(?:\.\d+)?$/u.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function stripInlineComment(value) {
  let quote = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if ((char === '"' || char === "'") && value[index - 1] !== '\\') {
      quote = quote === char ? '' : quote || char;
    }
    if (char === '#' && !quote && /\s/u.test(value[index - 1] || ' ')) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value.trimEnd();
}

async function readCanvasData(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

async function writeCanvasDataAtomic(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(tempPath, filePath);
}

function createErrorData(sourcePath, message) {
  return {
    schemaVersion: 1,
    parserVersion: PARSER_VERSION,
    sourcePath,
    updatedAt: new Date().toISOString(),
    title: 'DESIGN.md',
    tokens: [],
    sections: [],
    components: [],
    states: [],
    rules: [],
    openDecisions: [],
    designSystem: {
      schemaVersion: 1,
      schemaKeys: SCHEMA_KEYS,
      presentSchemaKeys: [],
      extensionKeys: [],
      unknownKeys: [],
      name: '',
      description: '',
      version: '',
      colors: [],
      typography: [],
      rounded: [],
      spacing: [],
      layout: [],
      options: [],
      components: [],
      references: [],
      contrastPairs: [],
      componentPropertyCounts: [],
    },
    warnings: [],
    error: message,
  };
}
