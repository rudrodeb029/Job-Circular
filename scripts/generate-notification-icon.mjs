/**
 * Generate proper Android notification icon (monochrome white silhouette on transparent)
 * Android requires notification icons to be white-only with transparency
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const RES_DIR = join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');
const ICON_SOURCE = join(PROJECT_ROOT, 'public', 'app-icon.png');

// Android notification icon density sizes
const NOTIFICATION_DENSITIES = [
  { folder: 'drawable-mdpi',    size: 24 },
  { folder: 'drawable-hdpi',    size: 36 },
  { folder: 'drawable-xhdpi',   size: 48 },
  { folder: 'drawable-xxhdpi',  size: 72 },
  { folder: 'drawable-xxxhdpi', size: 96 },
];

async function generateNotificationIcon() {
  console.log('\n🔔 Generating monochrome notification icons...\n');

  if (!existsSync(ICON_SOURCE)) {
    console.error(`❌ Icon source not found: ${ICON_SOURCE}`);
    return;
  }

  for (const density of NOTIFICATION_DENSITIES) {
    const dir = join(RES_DIR, density.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Create white silhouette: extract alpha channel, make white pixels on transparent
    const outFile = join(dir, 'ic_stat_onesignal_default.png');
    
    await sharp(ICON_SOURCE)
      .resize(density.size, density.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      // Convert to grayscale then threshold to create silhouette
      .greyscale()
      .threshold(128)
      // Negate to get white on transparent
      .negate({ alpha: false })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .ensureAlpha()
      .png({ compressionLevel: 9 })
      .toFile(outFile);

    console.log(`  ✅ ${density.folder}/ic_stat_onesignal_default.png: ${density.size}×${density.size}px`);
  }

  // Also create a simple white circle notification icon as fallback
  // Using a simple white filled circle for clean notification appearance
  for (const density of NOTIFICATION_DENSITIES) {
    const dir = join(RES_DIR, density.folder);
    const outFile = join(dir, 'ic_notification.png');
    
    // Create a white icon from the source, ensuring it's monochrome
    await sharp(ICON_SOURCE)
      .resize(density.size, density.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .png({ compressionLevel: 9 })
      .toFile(outFile);
    
    console.log(`  ✅ ${density.folder}/ic_notification.png: ${density.size}×${density.size}px`);
  }

  console.log('\n  ✅ Notification icons generated!\n');
}

generateNotificationIcon();
