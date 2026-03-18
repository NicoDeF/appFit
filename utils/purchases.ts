/**
 * RevenueCat wrapper — utils/purchases.ts
 *
 * Currently stubbed so the app bundles without react-native-purchases installed.
 *
 * To enable real RevenueCat:
 *  1. npm install react-native-purchases
 *  2. Add "react-native-purchases" back to plugins in app.json
 *  3. npx expo run:android  (native rebuild required)
 *  4. Replace the API keys below with your real RevenueCat keys
 *  5. Replace the stub implementations below with the real ones (commented out)
 *  6. In RevenueCat dashboard:
 *     - Create an Entitlement named "premium"
 *     - Create an Offering with ANNUAL + MONTHLY packages
 *     - Link to your App Store / Play Store products
 */

// ─── Types (mirrored from react-native-purchases so paywall.tsx compiles) ────
export type PurchasesPackage = {
  packageType: string;
  product: { priceString: string; title: string; description: string };
};

export const PACKAGE_TYPE = {
  ANNUAL: 'ANNUAL',
  MONTHLY: 'MONTHLY',
} as const;

export type PurchasesOffering = {
  availablePackages: PurchasesPackage[];
};

// ─── Replace with your real RevenueCat API keys ───────────────────────────────
// const RC_KEYS = {
//   ios:     'appl_REPLACE_WITH_YOUR_IOS_KEY',
//   android: 'goog_REPLACE_WITH_YOUR_ANDROID_KEY',
// };
// ─────────────────────────────────────────────────────────────────────────────

export const ENTITLEMENT_ID = 'premium';

/** Call once on app start (after user ID is known). */
export function initPurchases(_userId?: string | null) {
  // TODO: uncomment when react-native-purchases is installed
  // const apiKey = Platform.OS === 'ios' ? RC_KEYS.ios : RC_KEYS.android;
  // Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.WARN : LOG_LEVEL.ERROR);
  // Purchases.configure({ apiKey, appUserID: _userId ?? null });
}

/** Fetch the current offering from RevenueCat. Returns null on error. */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  // TODO: return real offerings when react-native-purchases is installed
  return null;
}

/**
 * Purchase a package. Returns true if the user is now premium.
 * Throws on user-cancellation or payment failure so the UI can handle it.
 */
export async function purchasePackage(_pkg: PurchasesPackage): Promise<boolean> {
  // TODO: real purchase flow when react-native-purchases is installed
  return false;
}

/** Restore previous purchases. Returns true if the user has an active entitlement. */
export async function restorePurchases(): Promise<boolean> {
  // TODO: real restore flow when react-native-purchases is installed
  return false;
}

/** Check if the user currently has an active premium entitlement. */
export async function checkEntitlement(): Promise<boolean> {
  // TODO: real check when react-native-purchases is installed
  return false;
}

/** Call on user logout so RevenueCat resets to an anonymous user. */
export async function logoutPurchases(): Promise<void> {
  // TODO: Purchases.logOut() when react-native-purchases is installed
}
