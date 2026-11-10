import { Device } from '@capacitor/device';

let cachedDeviceId = null;

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
      return cachedDeviceId;
    }
  } catch (err) {
    console.warn('[Device] Could not get native device ID, falling back to local UUID:', err);
  }

  // Web / fallback: persistent UUID in localStorage
  let localUuid = localStorage.getItem('app_device_id');
  if (!localUuid) {
    localUuid = 'web-' + (crypto?.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));
    localStorage.setItem('app_device_id', localUuid);
  }

  cachedDeviceId = localUuid;
  return cachedDeviceId;
}
