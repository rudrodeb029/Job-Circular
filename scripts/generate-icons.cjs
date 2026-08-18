const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_CANDIDATES = [
  'C:\\Users\\Suvro\\Downloads\\finalicon (2).png',
  'C:\\Users\\Suvro\\Downloads\\LastFinal.png',
  'C:\\Users\\Suvro\\Downloads\\Finalicon.png',
  'C:\\Users\\Suvro\\Downloads\\Untitled design (9).png',
];

const SOURCE_ICON = SOURCE_CANDIDATES.find(p => fs.existsSync(p));

if (!SOURCE_ICON) {
  console.error('❌ Could not find any source icon in Downloads.');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RES_DIR = path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets');

const MIPMAP_CONFIGS = [
  { folder: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
  { folder: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
  { folder: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
  { folder: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
  { folder: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
];

async function generateIcons() {
  console.log(`🚀 Starting comprehensive icon generation from: ${SOURCE_ICON}`);

  // 1. Generate Public / Web & PWA Assets
  console.log('📦 1. Generating Web & PWA assets in public/ & src/assets/...');
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'app-icon.png'));
  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'app-logo.png'));
  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'logo512.png'));
  await sharp(SOURCE_ICON).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'logo192.png'));
  await sharp(SOURCE_ICON).resize(180, 180).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  await sharp(SOURCE_ICON).resize(64, 64).png().toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  await sharp(SOURCE_ICON).resize(32, 32).png().toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
  await sharp(SOURCE_ICON).resize(16, 16).png().toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));

  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(ASSETS_DIR, 'app-icon.png'));
  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(ASSETS_DIR, 'app-logo.png'));
  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(ASSETS_DIR, 'finalicon.png'));
  console.log('✔ Web, PWA, and assets icons generated successfully.');

  // 2. Generate Android Mipmap Icons
  console.log('📱 2. Generating Android mipmap icons (Auto-adjusted background)...');
  for (const cfg of MIPMAP_CONFIGS) {
    const targetDir = path.join(RES_DIR, cfg.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // A. ic_launcher.png (Standard launcher icon)
    await sharp(SOURCE_ICON)
      .resize(cfg.launcherSize, cfg.launcherSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // B. ic_launcher_round.png (Circular masked launcher icon)
    const circleBuffer = Buffer.from(
      `<svg width="${cfg.launcherSize}" height="${cfg.launcherSize}"><circle cx="${cfg.launcherSize / 2}" cy="${cfg.launcherSize / 2}" r="${cfg.launcherSize / 2}" fill="white"/></svg>`
    );
    await sharp(SOURCE_ICON)
      .resize(cfg.launcherSize, cfg.launcherSize)
      .composite([{ input: circleBuffer, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // C. ic_launcher_background.png (Pure Solid White #FFFFFF)
    await sharp({
      create: {
        width: cfg.foregroundSize,
        height: cfg.foregroundSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toFile(path.join(targetDir, 'ic_launcher_background.png'));

    // D. ic_launcher_foreground.png (Adaptive icon foreground with safe-zone padding)
    const iconScaledSize = Math.round(cfg.foregroundSize * 0.72);
    const scaledIconBuffer = await sharp(SOURCE_ICON)
      .resize(iconScaledSize, iconScaledSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: cfg.foregroundSize,
        height: cfg.foregroundSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: scaledIconBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✔ Generated ${cfg.folder} (launcher: ${cfg.launcherSize}x${cfg.launcherSize}, fg: ${cfg.foregroundSize}x${cfg.foregroundSize})`);
  }

  // 3. Generate Android drawable foreground & splash assets
  const drawableDir = path.join(RES_DIR, 'drawable');
  if (fs.existsSync(drawableDir)) {
    const iconScaledSize = Math.round(432 * 0.72);
    const scaledIconBuffer = await sharp(SOURCE_ICON)
      .resize(iconScaledSize, iconScaledSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: 432,
        height: 432,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: scaledIconBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(drawableDir, 'ic_launcher_foreground.png'));

    await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(drawableDir, 'splash_icon.png'));
  }

  console.log('🎉 All Android and Web app icons generated successfully from finalicon (2).png!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
