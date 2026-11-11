import { Device } from '@capacitor/device';

let cachedDeviceId = null;

// Initialize on module load
if (typeof window !== 'undefined') {
  cachedDeviceId = localStorage.getItem('app_device_id');
  Device.getId().then(info => {
    if (info?.identifier) {
      cachedDeviceId = info.identifier;
      localStorage.setItem('app_device_id', info.identifier);
    }
  }).catch(() => {});
}

/**
 * Synchronous getter for device ID (if already cached or stored).
 */
export function getSyncDeviceId() {
  return cachedDeviceId || (typeof localStorage !== 'undefined' ? localStorage.getItem('app_device_id') : '') || '';
}

/**
 * Gets a persistent, unique device identifier.
 * - On Native Android: Uses Settings.Secure.ANDROID_ID (SSAID) via @capacitor/device.
 *   Does NOT require READ_PHONE_STATE permission. 100% Google Play policy compliant.
 * - On Web / Development: Generates and persists a cryptographically random UUID.
 *
 * @returns {Promise<string>} The unique device ID string.
 */
export async function getDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;

  try {
    const info = await Device.getId();
    if (info?.identifier) {
      cachedDeviceId = info.identifier;
      if (typeof localStorage !== 'undefined') localStorage.setItem('app_device_id', info.identifier);
      return cachedDeviceId;
    }
  } catch (err) {
    console.warn('[Device] Could not get native device ID, falling back to local UUID:', err);
  }

  // Web / fallback: persistent UUID in localStorage
  let localUuid = typeof localStorage !== 'undefined' ? localStorage.getItem('app_device_id') : null;
  if (!localUuid) {
    localUuid = 'web-' + (crypto?.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));
    if (typeof localStorage !== 'undefined') localStorage.setItem('app_device_id', localUuid);
  }

  cachedDeviceId = localUuid;
  return cachedDeviceId;
}
