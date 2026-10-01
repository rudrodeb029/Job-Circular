const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_IMAGE = 'C:/Users/Suvro/.gemini/antigravity/brain/9b6c9ad4-0b79-4ffc-9298-03cbf24e4d29/.user_uploaded/media_1790833627103.png';

const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets');
const RES_DIR = path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');

async function createTransparentMaster(sourcePath) {
  console.log('🔄 Creating 100% transparent version of the master logo...');
  const { data, info } = await sharp(sourcePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBgColor(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const minVal = Math.min(r, g, b);
    const diff = Math.max(r, g, b) - minVal;
    return (minVal >= 235 && diff <= 22);
  }

  function addPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * width + x;
    if (!visited[p] && isBgColor(x, y)) {
      visited[p] = 1;
      queue.push(p);
    }
  }

  // Seed flood fill from image perimeter
  for (let x = 0; x < width; x++) {
    addPixel(x, 0);
    addPixel(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    addPixel(0, y);
    addPixel(width - 1, y);
  }

  // Seed flood fill from inside the "C" letter loop
  addPixel(650, 480);
  addPixel(620, 500);

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);
    addPixel(cx + 1, cy);
    addPixel(cx - 1, cy);
    addPixel(cx, cy + 1);
    addPixel(cx, cy - 1);
  }

  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const p = y * width + x;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      if (visited[p]) {
        // Fully transparent background pixel
        out[idx] = 0;
        out[idx + 1] = 0;
        out[idx + 2] = 0;
        out[idx + 3] = 0;
      } else {
        // Check if neighboring pixel is background to smooth/anti-alias the edge
        let neighborIsBg = false;
        if (x > 0 && visited[p - 1]) neighborIsBg = true;
        else if (x < width - 1 && visited[p + 1]) neighborIsBg = true;
        else if (y > 0 && visited[p - width]) neighborIsBg = true;
        else if (y < height - 1 && visited[p + width]) neighborIsBg = true;

        const minVal = Math.min(r, g, b);
        if (neighborIsBg && minVal > 220) {
          const t = (minVal - 220) / (255 - 220);
          const a = Math.max(0, Math.min(255, Math.round(255 * (1 - t))));
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = a;
        } else {
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = 255;
        }
      }
    }
  }

  const transBuffer = await sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
  console.log('✔ Transparent master buffer created successfully.');
  return transBuffer;
}

async function run() {
  console.log('========================================================');
  console.log('🚀 GENERATING ALL APP ICONS & LOGOS FROM 1024x1024 MASTER');
  console.log(`   Source: ${SOURCE_IMAGE}`);
  console.log('========================================================\n');

  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error('Master image not found: ' + SOURCE_IMAGE);
  }

  // 1. Save copies to root
  const rootIconPng = path.join(PROJECT_ROOT, 'icon.png');
  const rootIconTransPng = path.join(PROJECT_ROOT, 'icon-transparent.png');
  fs.copyFileSync(SOURCE_IMAGE, rootIconPng);
  console.log('✔ Saved root icon.png (1024x1024)');

  const transparentBuffer = await createTransparentMaster(SOURCE_IMAGE);
  fs.writeFileSync(rootIconTransPng, transparentBuffer);
  console.log('✔ Saved root icon-transparent.png (1024x1024, RGBA transparent)');

  // 2. Web & PWA Assets
  console.log('\n📦 2. Generating Web & PWA assets...');
  // Transparent in-app logo (USED FOR REEL CARDS, FEED AVATARS, HEADER)
  await sharp(transparentBuffer).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'app-logo.png'));
  await sharp(transparentBuffer).resize(512, 512).png().toFile(path.join(ASSETS_DIR, 'app-logo.png'));
  console.log('✔ Generated public/app-logo.png & src/assets/app-logo.png (512x512, 100% TRANSPARENT)');

  // Solid app-icon for PWA launcher / Homescreen
  await sharp(SOURCE_IMAGE).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'app-icon.png'));
  await sharp(SOURCE_IMAGE).resize(512, 512).png().toFile(path.join(ASSETS_DIR, 'app-icon.png'));
  await sharp(SOURCE_IMAGE).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'logo512.png'));
  await sharp(SOURCE_IMAGE).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'logo192.png'));
  await sharp(SOURCE_IMAGE).resize(180, 180).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  await sharp(SOURCE_IMAGE).resize(64, 64).png().toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  await sharp(SOURCE_IMAGE).resize(32, 32).png().toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
  await sharp(SOURCE_IMAGE).resize(16, 16).png().toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));
  console.log('✔ Generated all PWA & Favicon assets (512, 192, 180, 64, 32, 16).');

  // 3. Android Mipmap densities
  console.log('\n📱 3. Generating Android Mipmap densities...');
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

    // A. ic_launcher.png (1:1 square)
    await sharp(SOURCE_IMAGE)
      .resize(cfg.launcherSize, cfg.launcherSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // B. ic_launcher_round.png (Circular masked launcher)
    const circleSvg = Buffer.from(
      `<svg width="${cfg.launcherSize}" height="${cfg.launcherSize}"><circle cx="${cfg.launcherSize / 2}" cy="${cfg.launcherSize / 2}" r="${cfg.launcherSize / 2}" fill="white"/></svg>`
    );
    await sharp(SOURCE_IMAGE)
      .resize(cfg.launcherSize, cfg.launcherSize)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // C. ic_launcher_background.png (Solid clean white background)
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

    // D. ic_launcher_foreground.png (Adaptive foreground with safe zone using transparent logo)
    const iconScaledSize = Math.round(cfg.foregroundSize * 0.72);
    const scaledIconBuffer = await sharp(transparentBuffer)
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

  // 4. Android Drawables & Splash Assets
  console.log('\n🎨 4. Generating Android Drawables & Native Splash Assets...');
  const drawableDir = path.join(RES_DIR, 'drawable');
  if (fs.existsSync(drawableDir)) {
    const iconScaledSize = Math.round(432 * 0.72);
    const scaledIconBuffer = await sharp(transparentBuffer)
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

    // Splash screen icons
    await sharp(transparentBuffer).resize(512, 512).png().toFile(path.join(drawableDir, 'app_logo_splash.png'));
    await sharp(transparentBuffer).resize(512, 512).png().toFile(path.join(drawableDir, 'splash_icon.png'));
    console.log('✔ drawable/ic_launcher_foreground.png, app_logo_splash.png & splash_icon.png generated.');
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
    await sharp(transparentBuffer).resize(s.size, s.size).png().toFile(path.join(targetDir, 'splash_logo.png'));
    console.log(`✔ ${s.folder}/splash_logo.png (${s.size}x${s.size})`);
  }

  // 5. Clean up temporary test files
  const testFile = path.join(PUBLIC_DIR, 'test-new-transparent.png');
  if (fs.existsSync(testFile)) fs.unlinkSync(testFile);

  console.log('\n========================================================');
  console.log('🎉 COMPLETED! All icons and logos updated with the new 1024x1024 master!');
  console.log('========================================================\n');
}

run().catch(err => {
  console.error('❌ Error generating assets:', err);
  process.exit(1);
});
