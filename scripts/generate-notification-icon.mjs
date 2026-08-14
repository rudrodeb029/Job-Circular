/**
 * Generate Android Push Notification Icons:
 * Clean, sharp, white notification bell silhouette for status bar & small notification badge.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const RES_DIR = join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');

const NOTIFICATION_DENSITIES = [
  { folder: 'drawable-mdpi',    size: 24 },
  { folder: 'drawable-hdpi',    size: 36 },
  { folder: 'drawable-xhdpi',   size: 48 },
  { folder: 'drawable-xxhdpi',  size: 72 },
  { folder: 'drawable-xxxhdpi', size: 96 },
];

async function generateBellNotificationIcons() {
  console.log('\n🔔 Generating clean white Bell Notification Icons for Android status bar...\n');

  for (const density of NOTIFICATION_DENSITIES) {
    const dir = join(RES_DIR, density.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const size = density.size;
    const padding = Math.round(size * 0.12);
    const bellSize = size - (padding * 2);

    // Create SVG crisp white notification bell shape
    const bellSvg = Buffer.from(
      `<svg width="${bellSize}" height="${bellSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="#ffffff"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    );

    const bellBuffer = await sharp(bellSvg)
      .resize(bellSize, bellSize)
      .png({ compressionLevel: 9 })
      .toBuffer();

    const finalBuffer = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: bellBuffer, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Save as ic_stat_onesignal_default.png (OneSignal default)
    await sharp(finalBuffer).toFile(join(dir, 'ic_stat_onesignal_default.png'));

    // Save as ic_notification.png (Firebase & Android default)
    await sharp(finalBuffer).toFile(join(dir, 'ic_notification.png'));

    console.log(`  ✅ ${density.folder}: ${size}×${size}px clean white bell notification icon generated`);
  }

  console.log('\n  ✅ Clean Bell Notification Icons generated successfully!\n');
}

generateBellNotificationIcons();
