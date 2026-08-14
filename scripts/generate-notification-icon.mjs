/**
 * Generate Android Push Notification Icons directly from public/app-icon.png
 * Removes white outer background, keeps original emblem silhouette for status bar.
 * No circular mask, no artificial circle borders.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const RES_DIR = join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');
const APP_ICON_PATH = join(PROJECT_ROOT, 'public', 'app-icon.png');

const NOTIFICATION_DENSITIES = [
  { folder: 'drawable-mdpi',    size: 24 },
  { folder: 'drawable-hdpi',    size: 36 },
  { folder: 'drawable-xhdpi',   size: 48 },
  { folder: 'drawable-xxhdpi',  size: 72 },
  { folder: 'drawable-xxxhdpi', size: 96 },
];

async function generateAppIconNotificationIcons() {
  console.log('\n🔔 Processing public/app-icon.png into Push Notification Icons (Original Shape, No Circle)...\n');

  if (!existsSync(APP_ICON_PATH)) {
    console.error(`❌ Source image not found: ${APP_ICON_PATH}`);
    return;
  }

  // Read raw pixel data of public/app-icon.png
  const { data, info } = await sharp(APP_ICON_PATH)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Extract logo emblem (remove near-white background > 230, make logo pixels solid white for status bar silhouette)
  const processedData = Buffer.from(data);
  for (let i = 0; i < processedData.length; i += 4) {
    const r = processedData[i];
    const g = processedData[i + 1];
    const b = processedData[i + 2];

    // Background (near white/light gray)
    if (r > 230 && g > 230 && b > 230) {
      processedData[i + 3] = 0; // 100% transparent background
    } else {
      // Logo emblem pixel -> pure white #FFFFFF for Android status bar stencil
      processedData[i] = 255;
      processedData[i + 1] = 255;
      processedData[i + 2] = 255;
      processedData[i + 3] = 255;
    }
  }

  // Create clean master logo PNG buffer (trimmed of empty space)
  const masterLogoBuffer = await sharp(processedData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .trim()
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Resize master logo silhouette for all Android density folders
  for (const density of NOTIFICATION_DENSITIES) {
    const dir = join(RES_DIR, density.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const resizedBuffer = await sharp(masterLogoBuffer)
      .resize(density.size, density.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Save as ic_stat_onesignal_default.png (OneSignal default)
    await sharp(resizedBuffer).toFile(join(dir, 'ic_stat_onesignal_default.png'));

    // Save as ic_notification.png (Firebase & Android default)
    await sharp(resizedBuffer).toFile(join(dir, 'ic_notification.png'));

    console.log(`  ✅ ${density.folder}: ${density.size}×${density.size}px status bar notification icon generated`);
  }

  console.log('\n  ✅ All Push Notification Icons generated successfully!\n');
}

generateAppIconNotificationIcons();
