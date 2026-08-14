/**
 * Generate Android notification icon:
 * App Logo shape converted to pure white silhouette on 100% transparent background.
 * This ensures Android renders the exact app logo shape in status bar notifications.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const RES_DIR = join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');

// Use app-logo.png or app-icon.png
const LOGO_SOURCE = existsSync(join(PROJECT_ROOT, 'public', 'app-logo.png'))
  ? join(PROJECT_ROOT, 'public', 'app-logo.png')
  : join(PROJECT_ROOT, 'public', 'app-icon.png');

const NOTIFICATION_DENSITIES = [
  { folder: 'drawable-mdpi',    size: 24 },
  { folder: 'drawable-hdpi',    size: 36 },
  { folder: 'drawable-xhdpi',   size: 48 },
  { folder: 'drawable-xxhdpi',  size: 72 },
  { folder: 'drawable-xxxhdpi', size: 96 },
];

async function generateLogoNotificationIcons() {
  console.log('\n🔔 Generating pure white App Logo notification icons...\n');

  if (!existsSync(LOGO_SOURCE)) {
    console.error(`❌ Source logo not found at: ${LOGO_SOURCE}`);
    return;
  }

  for (const density of NOTIFICATION_DENSITIES) {
    const dir = join(RES_DIR, density.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Step 1: Resize source logo to density size
    const resizedBuffer = await sharp(LOGO_SOURCE)
      .resize(density.size, density.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .toBuffer();

    // Step 2: Extract alpha channel (mask of the logo shape)
    const alphaChannel = await sharp(resizedBuffer)
      .extractChannel('alpha')
      .toBuffer();

    // Step 3: Create pure white image of target size, apply alpha mask
    // Result: Pure #FFFFFF app logo shape on transparent background
    const whiteLogoIcon = await sharp({
      create: {
        width: density.size,
        height: density.size,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .joinChannel(alphaChannel)
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Save as ic_stat_onesignal_default.png (OneSignal default)
    const onesignalPath = join(dir, 'ic_stat_onesignal_default.png');
    await sharp(whiteLogoIcon).toFile(onesignalPath);

    // Save as ic_notification.png (Firebase & Android default)
    const notificationPath = join(dir, 'ic_notification.png');
    await sharp(whiteLogoIcon).toFile(notificationPath);

    console.log(`  ✅ ${density.folder}: ${density.size}×${density.size}px pure white app logo icon generated`);
  }

  console.log('\n  ✅ App Logo notification icons generated successfully!\n');
}

generateLogoNotificationIcons();
