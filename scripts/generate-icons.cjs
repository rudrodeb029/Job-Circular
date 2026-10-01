const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RES_DIR = path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// Candidate sources in order of priority:
// 1. Path provided as CLI argument: node scripts/generate-icons.cjs "C:\path\to\image.png"
// 2. icon.png in project root
// 3. icon.jpg in project root
// 4. public/app-logo.png
// 5. Downloads candidates
const cliArg = process.argv[2] ? path.resolve(process.argv[2]) : null;

const SOURCE_CANDIDATES = [
  cliArg,
  'C:\\Users\\Suvro\\Downloads\\icons\\main_icon.png',
  path.join(PROJECT_ROOT, 'icon.png'),
  path.join(PROJECT_ROOT, 'icon.jpg'),
  path.join(PROJECT_ROOT, 'icon.jpeg'),
  path.join(PUBLIC_DIR, 'app-logo.png'),
  path.join(ASSETS_DIR, 'app-logo.png'),
  'C:\\Users\\Suvro\\Downloads\\finallastone.png',
  'C:\\Users\\Suvro\\Downloads\\LastFinal.png',
  'C:\\Users\\Suvro\\Downloads\\Finalicon.png',
  'C:\\Users\\Suvro\\Downloads\\Untitled design (9).png',
].filter(Boolean);

const SOURCE_ICON = SOURCE_CANDIDATES.find(p => fs.existsSync(p));

if (!SOURCE_ICON) {
  console.error('\n❌ Error: Could not find any source image.');
  console.error('👉 Usage:');
  console.error('   1. Put an "icon.png" (recommended: 1024x1024 px) in the project root, OR');
  console.error('   2. Run: npm run generate-icons -- "C:\\path\\to\\your-image.png"\n');
  process.exit(1);
}

const MIPMAP_CONFIGS = [
  { folder: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
  { folder: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
  { folder: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
  { folder: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
  { folder: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
];

async function generateIcons() {
  console.log('========================================================');
  console.log(`🚀 Starting generation from master image:`);
  console.log(`   ${SOURCE_ICON}`);
  console.log('========================================================\n');

  // Verify master image metadata
  const metadata = await sharp(SOURCE_ICON).metadata();
  console.log(`ℹ️  Master Image Size: ${metadata.width}x${metadata.height} px, format: ${metadata.format}`);
  if (metadata.width < 512 || metadata.height < 512) {
    console.warn(`⚠️ Warning: Master image is smaller than 512x512. Recommended size is 1024x1024 px for crisp HD quality.`);
  }

  // 1. Generate Web / PWA Assets (public/ and src/assets/)
  console.log('\n📦 1. Generating Web, PWA & Public assets...');
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const webSizes = [
    { file: 'app-logo.png', size: 512 },
    { file: 'app-icon.png', size: 512 },
    { file: 'logo512.png', size: 512 },
    { file: 'logo192.png', size: 192 },
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'favicon.png', size: 64 },
    { file: 'favicon-32x32.png', size: 32 },
    { file: 'favicon-16x16.png', size: 16 }
  ];

  for (const item of webSizes) {
    await sharp(SOURCE_ICON).resize(item.size, item.size).png().toFile(path.join(PUBLIC_DIR, item.file));
    if (fs.existsSync(DIST_DIR)) {
      await sharp(SOURCE_ICON).resize(item.size, item.size).png().toFile(path.join(DIST_DIR, item.file));
    }
  }

  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(ASSETS_DIR, 'app-logo.png'));
  await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(ASSETS_DIR, 'app-icon.png'));
  console.log('✔ Public & Web assets generated successfully (512x512, 192x192, 180x180, 64x64, 32x32, 16x16).');

  // 2. Generate Android Mipmap Icons
  console.log('\n📱 2. Generating Android mipmap densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)...');
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

    // C. ic_launcher_background.png (Solid White Background for adaptive icon)
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

    // D. ic_launcher_foreground.png (Adaptive icon foreground with 72% safe-zone)
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

    console.log(`✔ ${cfg.folder}: launcher (${cfg.launcherSize}x${cfg.launcherSize}), adaptive (${cfg.foregroundSize}x${cfg.foregroundSize})`);
  }

  // 3. Generate Android Drawables (Splash screens & base foregrounds)
  console.log('\n🎨 3. Generating Android Drawables & Native Splash Assets...');
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

    // Splash screen icons (Android 12+ & Native Launch Splash)
    await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(drawableDir, 'app_logo_splash.png'));
    await sharp(SOURCE_ICON).resize(512, 512).png().toFile(path.join(drawableDir, 'splash_icon.png'));
    console.log('✔ drawable/app_logo_splash.png & splash_icon.png generated (512x512).');
  }

  // 4. Copy Status Bar Notification Icons from Downloads if present
  const downloadsRes = 'C:\\Users\\Suvro\\Downloads\\icons\\res';
  if (fs.existsSync(downloadsRes)) {
    const densities = ['drawable-mdpi', 'drawable-hdpi', 'drawable-xhdpi', 'drawable-xxhdpi', 'drawable-xxxhdpi'];
    for (const d of densities) {
      const srcFile = path.join(downloadsRes, d, 'ic_stat_notification.png');
      const destDir = path.join(RES_DIR, d);
      if (fs.existsSync(srcFile)) {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcFile, path.join(destDir, 'ic_stat_notification.png'));
        console.log(`✔ Copied ${d}/ic_stat_notification.png`);
      }
    }
  }

  console.log('\n========================================================');
  console.log('🎉 SUCCESS! All Android, Web, Splash, and PWA icons');
  console.log('   have been generated at all required sizes!');
  console.log('========================================================\n');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
