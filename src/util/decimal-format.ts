/**
 * Rounds a number to a certain number of decimals of precision.
 * @param number The number you want to round
 * @param precision Number of decimals of precision that should be kept
 * @returns The rounded number
 */
export function roundDecimals(number: number, precision: number): number {
	return parseFloat(number.toFixed(precision));
}
