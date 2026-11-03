import React from 'react';

/**
 * NativeAdCard Component (Safeguarded)
 * In-page Native AdMob ads cannot be legitimately rendered as scraped HTML with simulated
 * click dispatch (cta.performClick) without violating AdMob Invalid Traffic & Native Ads policies.
 * Real AdMob Adaptive Banner Ads are instead served in native views at the bottom of detail pages.
 */
export default function NativeAdCard() {
  return null;
}
