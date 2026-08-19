/**
 * A one-listener bus so anything on the page can ask the effects layer for a
 * burst of botanical/cosmos marks without threading refs through the tree.
 */

let listener = null;

export function onBurst(fn) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

/** Ask for a burst at viewport coordinates. */
export function burst(x, y, opts) {
  listener?.(x, y, opts);
}
