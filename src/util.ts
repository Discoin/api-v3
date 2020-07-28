/**
 * Round a number to a certain number of digits of precision after the decimal point.
 * @param number Number to round
 * @param precision Digits of precision after the decimal point
 */
export function roundDecimals(number: number, precision: number): number {
  return parseFloat(number.toFixed(precision));
}
