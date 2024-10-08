/**
 * Warn the user that a function is deprecated
 */
export function deprecated(fn: string, replace?: string): void {
  if (replace) {
    console.warn('%s is deprecated and will be removed in future version, replace with %s', fn, replace);
  } else {
    console.warn('%s is deprecated and will be removed in future version', fn);
  }
}
