const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_IMAGE = 'C:/Users/Suvro/Downloads/Untitled design (23).png';

const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets');
const RES_DIR = path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');

function safeWriteFileSync(filePath, buffer) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      fs.writeFileSync(filePath, buffer);
      return;
    } catch (err) {
      if (attempt === 5) throw err;
      const start = Date.now();
      while (Date.now() - start < 150) {} // 150ms synchronous pause
    }
  }
}

async function run() {
  console.log('========================================================');
  console.log('🚀 GENERATING ALL APP ICONS & LOGOS FROM 2048x2048 MASTER');
  console.log(`   Source: ${SOURCE_IMAGE}`);
  console.log('========================================================\n');

  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error('Master image not found: ' + SOURCE_IMAGE);
  }

  // Verify source image metadata
  const meta = await sharp(SOURCE_IMAGE).metadata();
  console.log(`ℹ Master image loaded: ${meta.width}x${meta.height}, format: ${meta.format}, alpha: ${meta.hasAlpha}`);

  // 1. Transparent master buffer
  const transparentMasterBuffer = await sharp(SOURCE_IMAGE).png().toBuffer();
  
  // 2. Trimmed master buffer (tight bounding box of the logo artwork)
  const trimmedInfo = await sharp(SOURCE_IMAGE).trim().toBuffer({ resolveWithObject: true });
  const trimmedMasterBuffer = trimmedInfo.data;
  console.log(`ℹ Trimmed logo bounding box: ${trimmedInfo.info.width}x${trimmedInfo.info.height}`);

  // Helper: creates a transparent canvas of [targetSize x targetSize] with the trimmed logo scaled & centered
  async function makeCenteredTransparentLogo(targetSize, scaleRatio = 0.84) {
    const innerSize = Math.round(targetSize * scaleRatio);
    const scaledLogo = await sharp(trimmedMasterBuffer)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    return await sharp({
      create: {
        width: targetSize,
        height: targetSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: scaledLogo, gravity: 'center' }])
      .png()
      .toBuffer();
  }

  // Helper: creates a solid white background canvas with the trimmed logo centered
  async function makeCenteredSolidLogo(targetSize, scaleRatio = 0.82) {
    const innerSize = Math.round(targetSize * scaleRatio);
    const scaledLogo = await sharp(trimmedMasterBuffer)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    return await sharp({
      create: {
        width: targetSize,
        height: targetSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: scaledLogo, gravity: 'center' }])
      .png()
      .toBuffer();
  }

  // Helper: creates a circular masked solid white icon with trimmed logo centered
  async function makeCenteredRoundLogo(targetSize, scaleRatio = 0.72) {
    const solidBuffer = await makeCenteredSolidLogo(targetSize, scaleRatio);
    const circleSvg = Buffer.from(
      `<svg width="${targetSize}" height="${targetSize}"><circle cx="${targetSize / 2}" cy="${targetSize / 2}" r="${targetSize / 2}" fill="white"/></svg>`
    );
    return await sharp(solidBuffer)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  // --- SECTION 1: Root Project Assets ---
  console.log('\n📁 1. Updating Root Assets (2048x2048)...');
  const rootIconPng = path.join(PROJECT_ROOT, 'icon.png');
  const rootIconTransPng = path.join(PROJECT_ROOT, 'icon-transparent.png');

  // Solid root icon (2048x2048)
  const rootSolid2048 = await makeCenteredSolidLogo(2048, 0.75);
  safeWriteFileSync(rootIconPng, rootSolid2048);
  console.log('✔ Saved root icon.png (2048x2048 solid white)');

  // Transparent root icon (2048x2048)
  safeWriteFileSync(rootIconTransPng, transparentMasterBuffer);
  console.log('✔ Saved root icon-transparent.png (2048x2048 RGBA transparent)');

  // --- SECTION 2: Web & PWA Assets ---
  console.log('\n📦 2. Generating Web & PWA assets...');
  // Transparent app logo (512x512) for in-app reels, feed avatars, header, modals
  const appLogoTrans512 = await makeCenteredTransparentLogo(512, 0.84);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'app-logo.png'), appLogoTrans512);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'app-logo-transparent.png'), appLogoTrans512);
  safeWriteFileSync(path.join(ASSETS_DIR, 'app-logo.png'), appLogoTrans512);
  console.log('✔ Saved public/app-logo.png, public/app-logo-transparent.png, src/assets/app-logo.png (512x512 transparent)');

  // Solid app icon (512x512) for PWA homescreen and notifications
  const appIconSolid512 = await makeCenteredSolidLogo(512, 0.70);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'app-icon.png'), appIconSolid512);
  safeWriteFileSync(path.join(ASSETS_DIR, 'app-icon.png'), appIconSolid512);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'logo512.png'), appIconSolid512);
  console.log('✔ Saved public/app-icon.png, src/assets/app-icon.png, public/logo512.png (512x512 solid)');

  // Scaled Web Icons
  const appIconSolid192 = await makeCenteredSolidLogo(192, 0.70);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'logo192.png'), appIconSolid192);

  const appleTouchIcon180 = await makeCenteredSolidLogo(180, 0.70);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleTouchIcon180);

  const favicon64 = await makeCenteredSolidLogo(64, 0.80);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'favicon.png'), favicon64);

  const favicon32 = await makeCenteredSolidLogo(32, 0.82);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), favicon32);

  const favicon16 = await makeCenteredSolidLogo(16, 0.85);
  safeWriteFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), favicon16);

  // Generate public/favicon.svg containing the logo as well
  const favB64 = favicon64.toString('base64');
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image href="data:image/png;base64,${favB64}" width="64" height="64" /></svg>`;
  safeWriteFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), Buffer.from(faviconSvg, 'utf-8'));
  console.log('✔ Saved logo192, apple-touch-icon (180), favicon (64, 32, 16, svg)');

  // --- SECTION 3: Android Mipmap densities ---
  console.log('\n📱 3. Generating Android Mipmap Densities...');
  const MIPMAP_CONFIGS = [
    { folder: 'mipmap-ldpi', launcherSize: 36, foregroundSize: 81 },
    { folder: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
    { folder: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
    { folder: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
    { folder: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
    { folder: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
  ];

  for (const cfg of MIPMAP_CONFIGS) {
    const targetDir = path.join(RES_DIR, cfg.folder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // A. ic_launcher.png (Legacy square launcher icon with solid white background)
    const icLauncherBuf = await makeCenteredSolidLogo(cfg.launcherSize, 0.70);
    safeWriteFileSync(path.join(targetDir, 'ic_launcher.png'), icLauncherBuf);

    // B. ic_launcher_round.png (Circular masked launcher icon)
    const icLauncherRoundBuf = await makeCenteredRoundLogo(cfg.launcherSize, 0.64);
    safeWriteFileSync(path.join(targetDir, 'ic_launcher_round.png'), icLauncherRoundBuf);

    // C. ic_launcher_background.png (Solid white background layer for adaptive icon)
    const bgBuf = await sharp({
      create: {
        width: cfg.foregroundSize,
        height: cfg.foregroundSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    }).png().toBuffer();
    safeWriteFileSync(path.join(targetDir, 'ic_launcher_background.png'), bgBuf);

    // D. ic_launcher_foreground.png (Adaptive foreground: 48% scale of 108dp canvas = ~52dp inside 72dp squircle viewport)
    const fgBuf = await makeCenteredTransparentLogo(cfg.foregroundSize, 0.48);
    safeWriteFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fgBuf);

    console.log(`✔ ${cfg.folder}: launcher (${cfg.launcherSize}x${cfg.launcherSize}), adaptive (${cfg.foregroundSize}x${cfg.foregroundSize})`);
  }

  // --- SECTION 4: Android Drawables & Native Splash Assets ---
  console.log('\n🎨 4. Generating Android Drawables & Splash Assets...');
  const drawableDir = path.join(RES_DIR, 'drawable');
  if (fs.existsSync(drawableDir)) {
    // Adaptive foreground in drawable (432x432, 48% scale)
    const drawableFgBuf = await makeCenteredTransparentLogo(432, 0.48);
    safeWriteFileSync(path.join(drawableDir, 'ic_launcher_foreground.png'), drawableFgBuf);

    // Native Splash Screen transparent logos (512x512)
    const splashLogo512 = await makeCenteredTransparentLogo(512, 0.84);
    safeWriteFileSync(path.join(drawableDir, 'app_logo_splash.png'), splashLogo512);
    safeWriteFileSync(path.join(drawableDir, 'splash_icon.png'), splashLogo512);
    console.log('✔ drawable/ic_launcher_foreground.png, app_logo_splash.png, splash_icon.png generated.');
  }

  // Multi-density splash_logo.png
  const splashSizes = [
    { folder: 'drawable-mdpi', size: 160 },
    { folder: 'drawable-hdpi', size: 240 },
    { folder: 'drawable-xhdpi', size: 320 },
    { folder: 'drawable-xxhdpi', size: 480 },
    { folder: 'drawable-xxxhdpi', size: 640 },
  ];
  for (const s of splashSizes) {
    const targetDir = path.join(RES_DIR, s.folder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const splashBuf = await makeCenteredTransparentLogo(s.size, 0.84);
    safeWriteFileSync(path.join(targetDir, 'splash_logo.png'), splashBuf);
    console.log(`✔ ${s.folder}/splash_logo.png (${s.size}x${s.size})`);
  }

  // --- SECTION 5: Delete Old Unused Icon Files ---
  console.log('\n🧹 5. Cleaning up old unused icon files...');
  const obsoleteFiles = [
    path.join(ASSETS_DIR, 'finalicon.png'),
    path.join(ASSETS_DIR, 'finallastone.png'),
    path.join(PROJECT_ROOT, 'scripts', 'test_icon.png'),
    path.join(PUBLIC_DIR, 'test-new-transparent.png')
  ];

  for (const file of obsoleteFiles) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✔ Deleted obsolete file: ${path.relative(PROJECT_ROOT, file)}`);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 ALL APP ICONS & LOGOS SUCCESSFULLY GENERATED & UPDATED!');
  console.log('========================================================\n');
}

run().catch(err => {
  console.error('❌ Error generating assets:', err);
  process.exit(1);
});
