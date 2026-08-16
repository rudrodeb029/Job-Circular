const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_ICON = 'C:\\Users\\Suvro\\Downloads\\AppIcon.png';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const RES_DIR = path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

const MIPMAP_CONFIGS = [
  { folder: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
  { folder: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
  { folder: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
  { folder: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
  { folder: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
];

async function generateIcons() {
  console.log(`Starting icon generation from: ${SOURCE_ICON}`);
  
  if (!fs.existsSync(SOURCE_ICON)) {
    throw new Error(`Source icon not found at ${SOURCE_ICON}`);
  }

  // 1. Generate Public / Web Assets
  console.log('Generating Web & PWA assets in public/...');
  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'app-icon.png'));
  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'app-logo.png'));
  await sharp(SOURCE_ICON).resize(64, 64).png().toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  await sharp(SOURCE_ICON).resize(180, 180).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✔ Public icons generated.');

  // 2. Generate Android Mipmap Icons
  for (const cfg of MIPMAP_CONFIGS) {
    const targetDir = path.join(RES_DIR, cfg.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // A. ic_launcher.png
    await sharp(SOURCE_ICON)
      .resize(cfg.launcherSize, cfg.launcherSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // B. ic_launcher_round.png (with circular mask)
    const circleBuffer = Buffer.from(
      `<svg width="${cfg.launcherSize}" height="${cfg.launcherSize}"><circle cx="${cfg.launcherSize / 2}" cy="${cfg.launcherSize / 2}" r="${cfg.launcherSize / 2}" fill="black"/></svg>`
    );
    await sharp(SOURCE_ICON)
      .resize(cfg.launcherSize, cfg.launcherSize)
      .composite([{ input: circleBuffer, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // C. ic_launcher_foreground.png (for adaptive icon)
    await sharp(SOURCE_ICON)
      .resize(cfg.foregroundSize, cfg.foregroundSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✔ Generated ${cfg.folder} (launcher: ${cfg.launcherSize}x${cfg.launcherSize}, fg: ${cfg.foregroundSize}x${cfg.foregroundSize})`);
  }

  // 3. Generate Android drawable foreground if exists
  const drawableDir = path.join(RES_DIR, 'drawable');
  if (fs.existsSync(drawableDir)) {
    await sharp(SOURCE_ICON)
      .resize(432, 432)
      .png()
      .toFile(path.join(drawableDir, 'ic_launcher_foreground.png'));
    console.log('✔ Generated drawable/ic_launcher_foreground.png');
  }

  console.log('🎉 All Android and Web app icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
