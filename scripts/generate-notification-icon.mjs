/**
 * Generate Android Circular App Logo Notification Icons
 * Creates a clean, crisp circular notification icon containing the white App Logo
 * for status bar and notification tray display.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const RES_DIR = join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');

const LOGO_SOURCE = existsSync(join(PROJECT_ROOT, 'public', 'app-icon.png'))
  ? join(PROJECT_ROOT, 'public', 'app-icon.png')
  : join(PROJECT_ROOT, 'public', 'app-logo.png');

const NOTIFICATION_DENSITIES = [
  { folder: 'drawable-mdpi',    size: 24 },
  { folder: 'drawable-hdpi',    size: 36 },
  { folder: 'drawable-xhdpi',   size: 48 },
  { folder: 'drawable-xxhdpi',  size: 72 },
  { folder: 'drawable-xxxhdpi', size: 96 },
];

async function generateCircularNotificationIcons() {
  console.log('\n⭕ Generating Circular App Logo notification icons...\n');

  if (!existsSync(LOGO_SOURCE)) {
    console.error(`❌ Source image not found at: ${LOGO_SOURCE}`);
    return;
  }

  for (const density of NOTIFICATION_DENSITIES) {
    const dir = join(RES_DIR, density.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const size = density.size;

    // 1. Create a circular white mask SVG buffer
    const circleMaskSvg = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="#ffffff"/>
      </svg>`
    );

    // 2. Process source logo inside the circle mask
    // We create a white circle badge containing the logo outline for Android notification bar
    const circleIconBuffer = await sharp(LOGO_SOURCE)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: circleMaskSvg,
        blend: 'dest-in'
      }])
      .ensureAlpha()
      .toBuffer();

    // 3. Make the image pure white on transparent for Android monochrome status bar
    const alphaChannel = await sharp(circleIconBuffer)
      .extractChannel('alpha')
      .toBuffer();

    const whiteCircleIcon = await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .joinChannel(alphaChannel)
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Save as ic_stat_onesignal_default.png & ic_notification.png
    await sharp(whiteCircleIcon).toFile(join(dir, 'ic_stat_onesignal_default.png'));
    await sharp(whiteCircleIcon).toFile(join(dir, 'ic_notification.png'));

    console.log(`  ✅ ${density.folder}: ${size}×${size}px circular white logo icon generated`);
  }

  console.log('\n  ✅ Circular notification icons generated successfully!\n');
}

generateCircularNotificationIcons();
