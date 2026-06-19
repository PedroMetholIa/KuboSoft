/**
 * Actualiza referencias .png/.jpg/.jpeg → .webp en archivos .ts y .html
 * y añade loading="lazy" / fetchpriority="high" a <img> tags.
 *
 * Uso: node scripts/update-references.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR   = path.join(__dirname, '..', 'src');

// Imágenes above-the-fold: logo principal en header/nav → eager + high priority
// Las demás → lazy
const EAGER_PATTERNS = [
  /nav-logo-img/,
  /footer-logo-img/,
  /header-logo/,
  /class="logo-img"/,
];

const TARGET_EXTS = ['.ts', '.html'];
const IMG_EXTS_RE = /\.(png|jpg|jpeg)/gi;

// ── Helpers ───────────────────────────────────────────────────────────────────

function walk(dir, exts, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '_originals') {
      walk(full, exts, results);
    } else if (exts.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function isEagerImg(line) {
  return EAGER_PATTERNS.some(p => p.test(line));
}

/**
 * Procesa una línea que contiene un <img> tag:
 * - Añade loading="lazy" si no tiene loading=
 * - O añade fetchpriority="high" loading="eager" si es above-the-fold
 * No toca etiquetas que ya tienen los atributos.
 */
function processImgTag(fullTag, context = '') {
  const isAboveFold = isEagerImg(fullTag) || isEagerImg(context);

  // Ya tiene el atributo
  const hasLoading  = /loading=/i.test(fullTag);
  const hasPriority = /fetchpriority=/i.test(fullTag);

  let result = fullTag;

  if (isAboveFold) {
    if (!hasLoading)  result = result.replace(/<img\b/i, '<img loading="eager"');
    if (!hasPriority) result = result.replace(/<img\b/i, '<img fetchpriority="high"');
  } else {
    if (!hasLoading)  result = result.replace(/<img\b/i, '<img loading="lazy"');
  }

  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = walk(SRC_DIR, TARGET_EXTS);
let totalRefsUpdated = 0;
let totalImgsTagged  = 0;
const changedFiles   = [];

for (const file of files) {
  let original = fs.readFileSync(file, 'utf8');
  let content  = original;

  // 1. Reemplazar extensiones .png/.jpg/.jpeg → .webp en rutas de assets
  //    Solo dentro de strings que contienen "assets/" para no tocar otras cosas
  const beforeRefs = content;
  content = content.replace(
    /(assets\/[^"'`\s)>]+?)\.(png|jpg|jpeg)/gi,
    (_, base, ext) => `${base}.webp`
  );
  const refsUpdated = (content.match(/\.webp/g) || []).length - (beforeRefs.match(/\.webp/g) || []).length;
  totalRefsUpdated += refsUpdated;

  // 2. Añadir loading/fetchpriority a <img> tags (solo en .html y templates .ts)
  //    Procesamos línea por línea para tener contexto de clase
  const lines = content.split('\n');
  const processedLines = lines.map((line, i) => {
    // Líneas con <img> (puede ser multilínea en templates, pero la mayoría son inline)
    if (/<img\b/i.test(line)) {
      const before = line;
      line = line.replace(/<img\b[^>]*>/gi, tag => processImgTag(tag, line));
      if (line !== before) totalImgsTagged++;
    }
    return line;
  });
  content = processedLines.join('\n');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles.push(path.relative(path.join(__dirname, '..'), file));
  }
}

console.log('\n📝 ACTUALIZACIÓN DE REFERENCIAS');
console.log('─'.repeat(50));
console.log(`  Referencias .png/.jpg → .webp : ${totalRefsUpdated}`);
console.log(`  <img> con lazy/eager añadido  : ${totalImgsTagged}`);
console.log(`  Archivos modificados          : ${changedFiles.length}`);
changedFiles.forEach(f => console.log(`    • ${f}`));
console.log('─'.repeat(50) + '\n');
