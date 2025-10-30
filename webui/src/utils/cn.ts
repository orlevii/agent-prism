/**
 * Simple utility for conditionally joining classNames together
 * This is a simplified version - consider using 'clsx' or 'classnames' for more complex scenarios
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
