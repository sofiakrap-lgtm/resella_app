/**
 * Haptics, kept deliberately thin.
 *
 * Three rules decide where these are allowed to fire: the cause has to be
 * obvious, the tap has to land on the same frame as the thing it describes,
 * and it has to earn its place. Feedback on everything trains people to
 * ignore all of it, so this is reserved for commits and snaps.
 *
 * iOS Safari does not implement the Vibration API, so on the device this app
 * is designed for these calls are a no op. They are here for Android and for
 * the day Safari ships it, not as a feature anyone is told about.
 */

type Kind = 'snap' | 'commit' | 'success' | 'warning';

const patterns: Record<Kind, number | number[]> = {
  snap: 8,
  commit: 12,
  success: [10, 40, 16],
  warning: [18, 60, 18],
};

export function haptic(kind: Kind) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  // A buzz is vestibular enough that it belongs with the motion setting, so
  // "Vähennä liikettä" turns it off along with the travel.
  if (document.documentElement.dataset.motion === 'reduce') return;
  try {
    navigator.vibrate(patterns[kind]);
  } catch {
    // A browser that refuses is not an error worth reporting.
  }
}
