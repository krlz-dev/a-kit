import fs from 'fs';
import path from 'path';

const ICONS_SRC = '/home/krlz/Documents/repositorios/cloudicons/wwwroot/icons';
const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_ICONS = path.join(PROJECT_ROOT, 'public', 'icons');
const CATALOG_OUT = path.join(PROJECT_ROOT, 'src', 'features', 'arch', 'constants', 'cloudCatalog.js');

const PROVIDERS = [
  { id: 'generic', label: 'Generic', color: '#c8e600' },
  { id: 'aws', label: 'AWS', color: '#FF9900' },
  { id: 'azure', label: 'Azure', color: '#0078D4' },
  { id: 'gcp', label: 'GCP', color: '#4285F4' },
  { id: 'microsoft365', label: 'M365', color: '#D83B01' },
  { id: 'fabric', label: 'Fabric', color: '#117865' },
  { id: 'dynamics365', label: 'D365', color: '#002050' },
  { id: 'entra', label: 'Entra', color: '#0078D4' },
  { id: 'powerplatform', label: 'Power', color: '#742774' },
];

const entries = [];
let copied = 0;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyIcon(srcPath, provider, filename) {
  const destDir = path.join(PUBLIC_ICONS, provider);
  ensureDir(destDir);
  const dest = path.join(destDir, filename);
  fs.copyFileSync(srcPath, dest);
  copied++;
  return `/icons/${provider}/${encodeURIComponent(filename)}`;
}

function cleanLabel(raw) {
  return raw
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function slugify(provider, name) {
  return `${provider}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

// ── AWS Architecture Service Icons ──
function scanAwsArch() {
  const base = path.join(ICONS_SRC, 'aws');
  const archDir = fs.readdirSync(base).find(d => d.startsWith('Architecture-Service-Icons_'));
  if (!archDir) return;
  const archPath = path.join(base, archDir);
  const categories = fs.readdirSync(archPath).filter(d => d.startsWith('Arch_'));

  for (const catDir of categories) {
    const category = catDir.replace(/^Arch_/, '').replace(/-/g, ' ');
    const dir48 = path.join(archPath, catDir, '48');
    if (!fs.existsSync(dir48)) continue;

    for (const file of fs.readdirSync(dir48).filter(f => f.endsWith('.svg'))) {
      const label = file
        .replace(/^Arch_/, '')
        .replace(/_48\.svg$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      const iconUrl = copyIcon(path.join(dir48, file), 'aws', file);
      entries.push({
        type: slugify('aws', label),
        label,
        provider: 'aws',
        category,
        iconUrl,
        color: '#FF9900',
      });
    }
  }
}

// ── AWS Resource Icons ──
function scanAwsResource() {
  const base = path.join(ICONS_SRC, 'aws');
  const resDir = fs.readdirSync(base).find(d => d.startsWith('Resource-Icons_'));
  if (!resDir) return;
  const resPath = path.join(base, resDir);
  const categories = fs.readdirSync(resPath).filter(d => d.startsWith('Res_'));

  for (const catDir of categories) {
    const category = catDir.replace(/^Res_/, '').replace(/-/g, ' ');
    const catPath = path.join(resPath, catDir);

    // Resource icons may have size subdirs or flat files
    const svgs48 = [];

    // Check if there are size subdirectories
    const sub48 = path.join(catPath, '48');
    if (fs.existsSync(sub48)) {
      for (const file of fs.readdirSync(sub48).filter(f => f.endsWith('.svg'))) {
        svgs48.push({ file, fullPath: path.join(sub48, file) });
      }
    } else {
      // Flat: pick *_48.svg files
      for (const file of fs.readdirSync(catPath).filter(f => f.endsWith('_48.svg'))) {
        svgs48.push({ file, fullPath: path.join(catPath, file) });
      }
    }

    for (const { file, fullPath } of svgs48) {
      const label = file
        .replace(/^Res_/, '')
        .replace(/_48\.svg$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      const iconUrl = copyIcon(fullPath, 'aws', file);
      entries.push({
        type: slugify('aws', `res-${label}`),
        label,
        provider: 'aws',
        category: `Resource ${category}`,
        iconUrl,
        color: '#FF9900',
      });
    }
  }
}

// ── Azure ──
function scanAzure() {
  const iconsDir = path.join(ICONS_SRC, 'azure', 'Azure_Public_Service_Icons', 'Icons');
  if (!fs.existsSync(iconsDir)) return;

  for (const catDir of fs.readdirSync(iconsDir)) {
    const catPath = path.join(iconsDir, catDir);
    if (!fs.statSync(catPath).isDirectory()) continue;
    const category = cleanLabel(catDir);

    for (const file of fs.readdirSync(catPath).filter(f => f.endsWith('.svg'))) {
      const label = file
        .replace(/\.svg$/, '')
        .replace(/^\d+-icon-service-/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      const iconUrl = copyIcon(path.join(catPath, file), 'azure', file);
      entries.push({
        type: slugify('azure', label),
        label,
        provider: 'azure',
        category,
        iconUrl,
        color: '#0078D4',
      });
    }
  }
}

// ── GCP ──
function scanGcp() {
  const base = path.join(ICONS_SRC, 'gcp');
  if (!fs.existsSync(base)) return;

  for (const serviceDir of fs.readdirSync(base)) {
    const servicePath = path.join(base, serviceDir);
    if (!fs.statSync(servicePath).isDirectory()) continue;

    const svgFile = fs.readdirSync(servicePath).find(f => f.endsWith('.svg'));
    if (!svgFile) continue;

    const label = serviceDir
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    const iconUrl = copyIcon(path.join(servicePath, svgFile), 'gcp', svgFile);
    entries.push({
      type: slugify('gcp', serviceDir),
      label,
      provider: 'gcp',
      category: 'GCP',
      iconUrl,
      color: '#4285F4',
    });
  }
}

// ── Microsoft 365 ──
function scanM365() {
  const blueDir = path.join(ICONS_SRC, 'microsoft365', 'Microsoft Blue', '48x48 Dark Blue Icon');
  if (!fs.existsSync(blueDir)) return;

  for (const file of fs.readdirSync(blueDir).filter(f => f.endsWith('.svg'))) {
    const label = file.replace(/\.svg$/, '').trim();
    const iconUrl = copyIcon(path.join(blueDir, file), 'microsoft365', file);
    entries.push({
      type: slugify('m365', label),
      label,
      provider: 'microsoft365',
      category: 'Microsoft 365',
      iconUrl,
      color: '#D83B01',
    });
  }
}

// ── Fabric ──
function scanFabric() {
  const svgDir = path.join(ICONS_SRC, 'fabric', 'svg');
  if (!fs.existsSync(svgDir)) return;

  for (const file of fs.readdirSync(svgDir).filter(f => f.endsWith('_48_item.svg'))) {
    const label = file
      .replace(/_48_item\.svg$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    const iconUrl = copyIcon(path.join(svgDir, file), 'fabric', file);
    entries.push({
      type: slugify('fabric', label),
      label,
      provider: 'fabric',
      category: 'Fabric',
      iconUrl,
      color: '#117865',
    });
  }
}

// ── Dynamics 365 ──
function scanDynamics365() {
  const base = path.join(ICONS_SRC, 'dynamics365', 'Dynamics 365');
  if (!fs.existsSync(base)) return;

  for (const subDir of fs.readdirSync(base)) {
    const subPath = path.join(base, subDir);
    if (!fs.statSync(subPath).isDirectory()) continue;
    const category = subDir;

    for (const file of fs.readdirSync(subPath).filter(f => f.endsWith('.svg'))) {
      const label = file
        .replace(/\.svg$/, '')
        .replace(/_scalable$/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
      const iconUrl = copyIcon(path.join(subPath, file), 'dynamics365', file);
      entries.push({
        type: slugify('d365', label),
        label,
        provider: 'dynamics365',
        category,
        iconUrl,
        color: '#002050',
      });
    }
  }
}

// ── Entra ──
function scanEntra() {
  const colorDir = path.join(ICONS_SRC, 'entra', 'Microsoft Entra color icons SVG');
  if (!fs.existsSync(colorDir)) return;

  for (const file of fs.readdirSync(colorDir).filter(f => f.endsWith('.svg'))) {
    const label = file
      .replace(/\.svg$/, '')
      .replace(/ color icon$/i, '')
      .trim();
    const iconUrl = copyIcon(path.join(colorDir, file), 'entra', file);
    entries.push({
      type: slugify('entra', label),
      label,
      provider: 'entra',
      category: 'Entra',
      iconUrl,
      color: '#0078D4',
    });
  }
}

// ── Power Platform ──
function scanPowerPlatform() {
  const base = path.join(ICONS_SRC, 'powerplatform');
  if (!fs.existsSync(base)) return;

  // Root-level SVGs
  for (const file of fs.readdirSync(base).filter(f => f.endsWith('.svg'))) {
    const label = file
      .replace(/\.svg$/, '')
      .replace(/_scalable$/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
    const iconUrl = copyIcon(path.join(base, file), 'powerplatform', file);
    entries.push({
      type: slugify('power', label),
      label,
      provider: 'powerplatform',
      category: 'Power Platform',
      iconUrl,
      color: '#742774',
    });
  }

  // Power Platform/ subdirectory
  const ppDir = path.join(base, 'Power Platform');
  if (fs.existsSync(ppDir)) {
    for (const file of fs.readdirSync(ppDir).filter(f => f.endsWith('.svg'))) {
      const label = file
        .replace(/\.svg$/, '')
        .replace(/_scalable$/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
      const iconUrl = copyIcon(path.join(ppDir, file), 'powerplatform', file);
      entries.push({
        type: slugify('power', label),
        label,
        provider: 'powerplatform',
        category: 'Power Platform',
        iconUrl,
        color: '#742774',
      });
    }
  }
}

// ── Main ──
console.log('Scanning cloud icon providers…');

// Clean output dirs
if (fs.existsSync(PUBLIC_ICONS)) fs.rmSync(PUBLIC_ICONS, { recursive: true });
ensureDir(PUBLIC_ICONS);

scanAwsArch();
console.log(`  AWS Arch: ${entries.length} icons`);
const afterArch = entries.length;

scanAwsResource();
console.log(`  AWS Resource: ${entries.length - afterArch} icons`);
const afterRes = entries.length;

scanAzure();
console.log(`  Azure: ${entries.length - afterRes} icons`);
const afterAzure = entries.length;

scanGcp();
console.log(`  GCP: ${entries.length - afterAzure} icons`);
const afterGcp = entries.length;

scanM365();
console.log(`  M365: ${entries.length - afterGcp} icons`);
const afterM365 = entries.length;

scanFabric();
console.log(`  Fabric: ${entries.length - afterM365} icons`);
const afterFabric = entries.length;

scanDynamics365();
console.log(`  D365: ${entries.length - afterFabric} icons`);
const afterD365 = entries.length;

scanEntra();
console.log(`  Entra: ${entries.length - afterD365} icons`);
const afterEntra = entries.length;

scanPowerPlatform();
console.log(`  Power Platform: ${entries.length - afterEntra} icons`);

console.log(`\nTotal: ${entries.length} cloud icons, ${copied} files copied`);

// ── Generate catalog JS ──
const output = `// Auto-generated by scripts/generate-cloud-catalog.mjs — do not edit
export const PROVIDERS = ${JSON.stringify(PROVIDERS, null, 2)};

export const CLOUD_COMPONENTS = ${JSON.stringify(entries, null, 2)};
`;

ensureDir(path.dirname(CATALOG_OUT));
fs.writeFileSync(CATALOG_OUT, output);
console.log(`Catalog written to ${path.relative(PROJECT_ROOT, CATALOG_OUT)}`);
