#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exampleRoot = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(exampleRoot, '../..');
const keepTemp = process.argv.includes('--keep');
const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'architecture-basic-smoke-'));

const fixtures = {
  dot: path.join(exampleRoot, 'dependency-impact.dot'),
  dsl: path.join(exampleRoot, 'system-context.structurizr.dsl'),
  mermaid: path.join(exampleRoot, 'business-flow.mmd'),
  model: path.join(exampleRoot, 'architecture-model.json'),
};

try {
  validateModel();
  const viewers = [
    runViewer('dot', fixtures.dot),
    runViewer('dsl', fixtures.dsl),
    runViewer('mermaid', fixtures.mermaid),
  ];
  console.log(JSON.stringify({
    status: 'passed',
    model: path.relative(pluginRoot, fixtures.model),
    viewers,
    tempRoot: keepTemp ? tempRoot : undefined,
  }, null, 2));
} finally {
  if (!keepTemp) {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function validateModel() {
  const model = JSON.parse(readFileSync(fixtures.model, 'utf8'));
  assert(model.schemaVersion === 1, 'architecture-model.json must use schemaVersion 1');
  assert(Array.isArray(model.nodes) && model.nodes.length > 0, 'architecture-model.json must contain nodes');
  assert(Array.isArray(model.edges) && model.edges.length > 0, 'architecture-model.json must contain edges');

  const nodeIds = new Set();
  for (const node of model.nodes) {
    assert(typeof node.id === 'string' && node.id.length > 0, 'every node needs an id');
    assert(!nodeIds.has(node.id), `duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
    validateConfidence(node, `node ${node.id}`);
    validateSourceRefs(node, `node ${node.id}`);
  }

  const edgeIds = new Set();
  for (const edge of model.edges) {
    assert(typeof edge.id === 'string' && edge.id.length > 0, 'every edge needs an id');
    assert(!edgeIds.has(edge.id), `duplicate edge id: ${edge.id}`);
    edgeIds.add(edge.id);
    assert(nodeIds.has(edge.from), `edge ${edge.id} references missing source node ${edge.from}`);
    assert(nodeIds.has(edge.to), `edge ${edge.id} references missing target node ${edge.to}`);
    validateConfidence(edge, `edge ${edge.id}`);
    validateSourceRefs(edge, `edge ${edge.id}`);
  }
}

function validateConfidence(item, label) {
  assert(['high', 'medium', 'low', 'unknown'].includes(item.confidence), `${label} has invalid confidence`);
}

function validateSourceRefs(item, label) {
  assert(Array.isArray(item.sourceRefs) && item.sourceRefs.length > 0, `${label} must include sourceRefs`);
  for (const sourceRef of item.sourceRefs) {
    const filePart = sourceRef.split('#')[0];
    assert(existsSync(path.join(exampleRoot, filePart)), `${label} sourceRef does not exist: ${sourceRef}`);
  }
}

function runViewer(viewer, targetFilePath) {
  const dataKey = `aicoding.formatViewer.${viewer}`;
  const scriptPath = path.join(pluginRoot, 'canvases', viewer, 'scripts/index.mjs');
  const dataPath = path.join(tempRoot, `${viewer}.canvas.data.json`);
  assert(existsSync(scriptPath), `viewer script missing: ${scriptPath}`);

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: pluginRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      QODER_CANVAS_SCRIPT_ARGS: JSON.stringify({ targetFilePath }),
      QODER_CANVAS_DATA: dataPath,
    },
  });

  if ((result.status ?? 1) !== 0) {
    throw new Error(`${viewer} viewer exited with ${result.status}\n${result.stderr || result.stdout}`);
  }

  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  const entry = data[dataKey];
  assert(entry && typeof entry === 'object', `${viewer} viewer did not write ${dataKey}`);
  assert(!entry.error, `${viewer} viewer returned error: ${entry.error}`);
  assert(entry.sourcePath === targetFilePath, `${viewer} viewer sourcePath mismatch`);

  if (viewer === 'dot' || viewer === 'mermaid') {
    assert(typeof entry.svg === 'string' && entry.svg.includes('<svg'), `${viewer} viewer did not produce SVG`);
  }
  if (viewer === 'dsl') {
    assert(entry.workspace?.name === 'Order Platform', 'dsl viewer did not parse the expected workspace');
    assert(Array.isArray(entry.views) && entry.views.length > 0, 'dsl viewer did not produce views');
  }

  return {
    viewer,
    source: path.relative(pluginRoot, targetFilePath),
    dataKey,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
