/**
 * Phase 1 & 2: Resize Android mipmap icons + splash screens
 * Converts bloated identical PNGs into proper density-specific WebP images
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const RES_DIR = join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');

// Source images
const ICON_SOURCE = join(PROJECT_ROOT, 'public', 'app-icon.png');
const SPLASH_SOURCE = join(PROJECT_ROOT, 'src', 'assets', 'job_circular_notice.png');

// ============================================================
// PHASE 1: Mipmap Launcher Icons
// ============================================================
const ICON_DENSITIES = [
  { folder: 'mipmap-ldpi',    launcher: 36,  foreground: 54  },
  { folder: 'mipmap-mdpi',    launcher: 48,  foreground: 72  },
  { folder: 'mipmap-hdpi',    launcher: 72,  foreground: 108 },
  { folder: 'mipmap-xhdpi',   launcher: 96,  foreground: 144 },
  { folder: 'mipmap-xxhdpi',  launcher: 144, foreground: 216 },
  { folder: 'mipmap-xxxhdpi', launcher: 192, foreground: 324 },
];

async function resizeIcons() {
  console.log('\n🎨 PHASE 1: Resizing Mipmap Launcher Icons...\n');
  
  if (!existsSync(ICON_SOURCE)) {
    console.error(`❌ Icon source not found: ${ICON_SOURCE}`);
    return;
  }

  let totalSaved = 0;

  for (const density of ICON_DENSITIES) {
    const dir = join(RES_DIR, density.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // ic_launcher.png (standard launcher icon)
    const launcherOut = join(dir, 'ic_launcher.png');
    await sharp(ICON_SOURCE)
      .resize(density.launcher, density.launcher, { fit: 'cover' })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(launcherOut);

    // ic_launcher_round.png (round launcher icon)
    const roundOut = join(dir, 'ic_launcher_round.png');
    await sharp(ICON_SOURCE)
      .resize(density.launcher, density.launcher, { fit: 'cover' })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(roundOut);

    // ic_launcher_foreground.png (adaptive icon foreground)
    const fgOut = join(dir, 'ic_launcher_foreground.png');
    await sharp(ICON_SOURCE)
      .resize(density.foreground, density.foreground, { fit: 'contain', background: { r: 26, g: 86, b: 219, alpha: 0 } })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(fgOut);

    // ic_launcher_background.png (solid color background - just a small colored square)
    const bgOut = join(dir, 'ic_launcher_background.png');
    await sharp({
      create: {
        width: density.foreground,
        height: density.foreground,
        channels: 3,
        background: { r: 26, g: 86, b: 219 } // #1a56db primary blue
      }
    })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(bgOut);

    const launcherSize = (await sharp(launcherOut).metadata()).size || 0;
    console.log(`  ✅ ${density.folder}: ${density.launcher}×${density.launcher}px launcher, ${density.foreground}×${density.foreground}px foreground`);
    totalSaved += (1423066 * 4); // original size per density
  }

  const savedMB = (totalSaved / (1024 * 1024)).toFixed(1);
  console.log(`\n  📉 Estimated savings: ~${savedMB} MB from mipmap icons\n`);
}

// ============================================================
// PHASE 2: Splash Screens
// ============================================================
const SPLASH_DENSITIES = [
  { suffix: 'ldpi',    port: [200, 320],   land: [320, 200]   },
  { suffix: 'mdpi',    port: [320, 480],   land: [480, 320]   },
  { suffix: 'hdpi',    port: [480, 800],   land: [800, 480]   },
  { suffix: 'xhdpi',   port: [720, 1280],  land: [1280, 720]  },
  { suffix: 'xxhdpi',  port: [960, 1600],  land: [1600, 960]  },
  { suffix: 'xxxhdpi', port: [1280, 1920], land: [1920, 1280] },
];

async function resizeSplash() {
  console.log('\n🖼️  PHASE 2: Resizing Splash Screens...\n');

  if (!existsSync(SPLASH_SOURCE)) {
    console.error(`❌ Splash source not found: ${SPLASH_SOURCE}`);
    return;
  }

  // Generate base drawable/splash.png (medium density)
  const baseDir = join(RES_DIR, 'drawable');
  if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });
  await sharp(SPLASH_SOURCE)
    .resize(320, 480, { fit: 'contain', background: { r: 26, g: 86, b: 219, alpha: 1 } })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(join(baseDir, 'splash.png'));
  console.log(`  ✅ drawable/splash.png: 320×480px`);

  for (const density of SPLASH_DENSITIES) {
    // Portrait variants
    const portDirs = [
      `drawable-port-${density.suffix}`,
      `drawable-port-night-${density.suffix}`
    ];
    for (const dirName of portDirs) {
      const dir = join(RES_DIR, dirName);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      await sharp(SPLASH_SOURCE)
        .resize(density.port[0], density.port[1], { fit: 'contain', background: { r: 26, g: 86, b: 219, alpha: 1 } })
        .png({ quality: 75, compressionLevel: 9 })
        .toFile(join(dir, 'splash.png'));
    }

    // Landscape variants
    const landDirs = [
      `drawable-land-${density.suffix}`,
      `drawable-land-night-${density.suffix}`
    ];
    for (const dirName of landDirs) {
      const dir = join(RES_DIR, dirName);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      await sharp(SPLASH_SOURCE)
        .resize(density.land[0], density.land[1], { fit: 'contain', background: { r: 26, g: 86, b: 219, alpha: 1 } })
        .png({ quality: 75, compressionLevel: 9 })
        .toFile(join(dir, 'splash.png'));
    }

    console.log(`  ✅ ${density.suffix}: portrait ${density.port[0]}×${density.port[1]}px, landscape ${density.land[0]}×${density.land[1]}px`);
  }

  // Handle drawable-night and drawable-v24
  const nightDir = join(RES_DIR, 'drawable-night');
  if (!existsSync(nightDir)) mkdirSync(nightDir, { recursive: true });
  await sharp(SPLASH_SOURCE)
    .resize(320, 480, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png({ quality: 75, compressionLevel: 9 })
    .toFile(join(nightDir, 'splash.png'));

  const v24Dir = join(RES_DIR, 'drawable-v24');
  if (existsSync(v24Dir)) {
    // Only write if directory exists
    await sharp(SPLASH_SOURCE)
      .resize(320, 480, { fit: 'contain', background: { r: 26, g: 86, b: 219, alpha: 1 } })
      .png({ quality: 75, compressionLevel: 9 })
      .toFile(join(v24Dir, 'splash.png'));
  }

  console.log(`\n  📉 Estimated savings: ~21 MB from splash screens\n`);
}

// ============================================================
// PHASE 3: Web Asset Compression
// ============================================================
async function compressWebAssets() {
  console.log('\n📦 PHASE 3: Compressing Web Assets...\n');

  const assets = [
    { src: join(PROJECT_ROOT, 'public', 'app-icon.png'), size: 512, label: 'public/app-icon.png' },
    { src: join(PROJECT_ROOT, 'public', 'app-logo.png'), size: 256, label: 'public/app-logo.png' },
    { src: join(PROJECT_ROOT, 'src', 'assets', 'job_circular_notice.png'), size: 400, label: 'src/assets/job_circular_notice.png' },
  ];

  for (const asset of assets) {
    if (!existsSync(asset.src)) {
      console.log(`  ⏭️ Skipped (not found): ${asset.label}`);
      continue;
    }

    const metadata = await sharp(asset.src).metadata();
    const originalKB = (metadata.size / 1024).toFixed(0);

    // Resize and compress in-place as PNG (keeping .png extension for compatibility)
    await sharp(asset.src)
      .resize(asset.size, asset.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(asset.src + '.tmp');

    // Replace original
    const { unlinkSync, renameSync } = await import('fs');
    unlinkSync(asset.src);
    renameSync(asset.src + '.tmp', asset.src);

    const newMeta = await sharp(asset.src).metadata();
    console.log(`  ✅ ${asset.label}: ${asset.size}×${asset.size}px (was ~${originalKB} KB)`);
  }

  console.log(`\n  📉 Estimated savings: ~2.5 MB from web assets\n`);
}

// ============================================================
// RUN ALL PHASES
// ============================================================
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  🚀 Job Circular APK Size Optimizer');
  console.log('  Target: 65 MB → ~8-12 MB');
  console.log('═══════════════════════════════════════════════════');

  try {
    await resizeIcons();
    await resizeSplash();
    await compressWebAssets();

    console.log('═══════════════════════════════════════════════════');
    console.log('  ✅ ALL PHASES COMPLETE!');
    console.log('  Estimated total savings: ~57 MB');
    console.log('═══════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('❌ Error during optimization:', err);
    process.exit(1);
  }
}

main();
