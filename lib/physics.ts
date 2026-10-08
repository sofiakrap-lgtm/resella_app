/**
 * Gesture physics. Two functions, both taken from the way iOS behaves rather
 * than from a textbook, because the textbook answers feel wrong in the hand.
 */

/**
 * Where a flick would come to rest. This is exponential decay, the same curve
 * scrolling uses, not the v^2/(2a) a physics course would give you: that one
 * undershoots badly at the speeds a thumb actually produces.
 *
 * @param velocity px per second at the moment the finger left
 * @param decelerationRate 0.998 reads like scrolling, 0.99 is snappier
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Resistance past a boundary. The further you pull, the less the element
 * follows, so the edge reads as soft rather than frozen, and it never quite
 * stops moving while the finger is still moving.
 *
 * @param overshoot how far past the boundary the finger is
 * @param dimension the size of the thing being dragged
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** The nearest value in a list, used on the projected endpoint, not the release point. */
export function nearest(value: number, candidates: number[]): number {
  let best = candidates[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const distance = Math.abs(candidate - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

/** Movement below this is noise, not a direction. */
export const HYSTERESIS = 10;

/** Faster than a hand can move, so anything above it is a measurement error. */
const MAX_VELOCITY = 4000;

/**
 * A short position history, enough to get a release velocity that is not
 * whatever the last single event happened to say.
 */
export class VelocityTracker {
  private samples: { value: number; time: number }[] = [];

  add(value: number, time = performance.now()) {
    this.samples.push({ value, time });
    if (this.samples.length > 5) this.samples.shift();
  }

  /**
   * px per second, measured over the last ~100ms of movement.
   *
   * Clamped, because a dropped frame can put 100px between two events and
   * report a speed no thumb can produce, which would throw a sheet off the
   * screen on what the hand felt as a nudge.
   */
  velocity(): number {
    if (this.samples.length < 2) return 0;
    const last = this.samples[this.samples.length - 1];
    let first = this.samples[0];
    for (const sample of this.samples) {
      if (last.time - sample.time <= 100) {
        first = sample;
        break;
      }
    }
    const elapsed = last.time - first.time;
    if (elapsed <= 0) return 0;
    const speed = ((last.value - first.value) / elapsed) * 1000;
    return Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, speed));
  }

  reset() {
    this.samples = [];
  }
}

/**
 * Pointer capture, which keeps a drag tracking after the finger leaves the
 * element. Both calls throw if the pointer is no longer active, which happens
 * on a cancelled or already released gesture, and a throw there would abort
 * the handler and leave the element stuck mid drag.
 */
export function capture(element: Element | null, pointerId: number) {
  try {
    element?.setPointerCapture(pointerId);
  } catch {
    // Without capture the drag still tracks inside the element's own bounds.
  }
}

export function release(element: Element | null, pointerId: number) {
  try {
    if (element?.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
  } catch {
    // Already released by the browser, which is the outcome we wanted.
  }
}
