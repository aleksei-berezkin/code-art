/**
 * Concat classnames
 */
export function cc(...classNames: (undefined | null | string | boolean | number)[]) {
  return classNames.filter(Boolean).join(' ')
}
