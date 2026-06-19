/**
 * Convierte todas las imágenes rasterizadas de src/assets/ a WebP (calidad 80),
 * guarda los originales en src/assets/_originals/, e imprime un resumen.
 *
 * Uso: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR   = path.join(__dirname, '..', 'src', 'assets');
const ORIGINALS_DIR = path.join(ASSETS_DIR, '_originals');
const QUALITY = 80;
const EXTS = ['.png', '.jpg', '.jpeg', '.gif'];

// Imágenes que NO convertir (SVGs excluidos por extensión; esta lista por seguridad extra)
const SKIP_PATTERNS = ['_originals'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function humanSize(bytes) {
  return bytes >= 1_048_576
    ? (bytes / 1_048_576).toFixed(1) + ' MB'
    : (bytes / 1024).toFixed(0) + ' KB';
}

function getAllImages(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_PATTERNS.some(p => full.includes(p))) getAllImages(full, results);
    } else if (EXTS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

function mirrorPath(originalPath) {
  // Reconstruye la ruta bajo _originals/ manteniendo la estructura de carpetas
  const rel = path.relative(ASSETS_DIR, originalPath);
  return path.join(ORIGINALS_DIR, rel);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const images = getAllImages(ASSETS_DIR);
console.log(`\n🔍 Encontradas ${images.length} imágenes rasterizadas\n`);

const results = [];

for (const imgPath of images) {
  const ext      = path.extname(imgPath).toLowerCase();
  const dir      = path.dirname(imgPath);
  const base     = path.basename(imgPath, ext);
  const webpPath = path.join(dir, base + '.webp');

  const origSize = fs.statSync(imgPath).size;

  // --- Backup del original ---
  const backupPath = mirrorPath(imgPath);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(imgPath, backupPath);
  }

  // --- Convertir a WebP ---
  try {
    let pipeline = sharp(imgPath);

    // GIFs animados: sharp sólo convierte el primer frame; los dejamos en paz
    if (ext === '.gif') {
      results.push({ file: path.relative(ASSETS_DIR, imgPath), origSize, webpSize: null, skipped: 'GIF animado' });
      continue;
    }

    await pipeline.webp({ quality: QUALITY }).toFile(webpPath);

    const webpSize = fs.statSync(webpPath).size;
    const saving   = ((origSize - webpSize) / origSize * 100).toFixed(0);

    // Si el WebP es más grande (raro en PNG pequeños), conservamos el original
    if (webpSize >= origSize) {
      fs.unlinkSync(webpPath);
      results.push({ file: path.relative(ASSETS_DIR, imgPath), origSize, webpSize, skipped: 'WebP más pesado' });
      continue;
    }

    // Eliminar el original del directorio de trabajo (ya está en backup)
    fs.unlinkSync(imgPath);

    results.push({ file: path.relative(ASSETS_DIR, imgPath), origSize, webpSize, saving: +saving });
    process.stdout.write(`  ✓ ${path.relative(ASSETS_DIR, imgPath)}  ${humanSize(origSize)} → ${humanSize(webpSize)} (-${saving}%)\n`);
  } catch (err) {
    results.push({ file: path.relative(ASSETS_DIR, imgPath), origSize, webpSize: null, skipped: err.message });
    console.warn(`  ⚠ ${path.relative(ASSETS_DIR, imgPath)}: ${err.message}`);
  }
}

// ── Resumen ───────────────────────────────────────────────────────────────────

const converted = results.filter(r => r.saving !== undefined);
const skipped   = results.filter(r => r.skipped);

const totalBefore = converted.reduce((s, r) => s + r.origSize, 0);
const totalAfter  = converted.reduce((s, r) => s + r.webpSize, 0);
const totalSaving = totalBefore - totalAfter;

console.log('\n' + '─'.repeat(70));
console.log(`📦 RESUMEN DE OPTIMIZACIÓN`);
console.log('─'.repeat(70));
console.log(`  Imágenes convertidas : ${converted.length}`);
console.log(`  Imágenes omitidas    : ${skipped.length}` + (skipped.length ? ' (' + skipped.map(r => r.file.split('/').pop() + ': ' + r.skipped).join(', ') + ')' : ''));
console.log(`  Peso antes           : ${humanSize(totalBefore)}`);
console.log(`  Peso después         : ${humanSize(totalAfter)}`);
console.log(`  Ahorro total         : ${humanSize(totalSaving)} (-${(totalSaving/totalBefore*100).toFixed(0)}%)`);
console.log('─'.repeat(70));
console.log(`\nBackup de originales en: src/assets/_originals/\n`);

// Exportar mapa old→new para el script de referencias
const refMap = {};
for (const r of converted) {
  const ext = path.extname(r.file);
  const webpRel = r.file.replace(new RegExp(ext + '$'), '.webp');
  refMap[r.file.replace(/\\/g, '/')] = webpRel.replace(/\\/g, '/');
}
fs.writeFileSync(
  path.join(__dirname, 'webp-refmap.json'),
  JSON.stringify(refMap, null, 2)
);
console.log('📄 Mapa de referencias guardado en scripts/webp-refmap.json\n');
