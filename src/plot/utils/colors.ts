import { round } from "./math";

/**
 * Generates a smooth RGB color palette using phase-shifted sine waves.
 *
 * The palette is deterministic for a given `colorOffset` and `n`.
 * Colors are generated in the bright pastel range (≈145–255 per channel)
 * due to the `*55 + 200` transformation.
 *
 * @param colorOffset - Starting offset used as phase input for the sine waves.
 *                      Different offsets yield different palettes.
 * @param n - Number of colors to generate.
 * @returns Array of CSS rgb() strings.
 *
 * @example
 * createPalette(0, 3)
 * // ["rgb(255, 200, 145)", ...]
 */
export function createPalette(colorOffset: number, n: number): string[] {
	let newColors: string[] = [];

	for (let i = 0; i < n; i++) {
		// Phase-shifted sine waves create smooth variation between channels
		const r = Math.sin(0.3 * colorOffset + 4) * 55 + 200;
		const g = Math.sin(0.3 * colorOffset + 2) * 55 + 200;
		const b = Math.sin(0.3 * colorOffset) * 55 + 200;

		const newColor = `rgb(${round(r, 0)}, ${round(g, 0)}, ${round(b, 0)})`;
		newColors.push(newColor);

		// Step forward in phase space
		colorOffset += 3;
	}

	return newColors;
}

/**
 * Computes an interpolated color between two RGB strings.
 *
 * The interpolation factor is scaled internally (`coef / 2`),
 * so a value of 1 does NOT mean full interpolation.
 *
 * @param rgb1 - First color in `rgb(r,g,b)` format.
 * @param rgb2 - Second color in `rgb(r,g,b)` format.
 * @param coef - Interpolation strength (typically between 0 and 1).
 * @returns Interpolated color as CSS rgb() string.
 *
 * @example
 * midColor("rgb(100, 100, 100)", "rgb(200, 200, 200)", 1)
 * // returns mid-ish tone between them
 */
export function midColor(rgb1: string, rgb2: string, coef: number): string {
	const scaledCoef = coef / 2;

	const rgb1List: number[] =
		rgb1.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];

	const rgb2List: number[] =
		rgb2.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];

	const newRgb: number[] = [];

	for (let i = 0; i < 3; i++) {
		const newNum =
			rgb1List[i] < rgb2List[i]
				? rgb1List[i] + scaledCoef * (rgb2List[i] - rgb1List[i])
				: rgb1List[i] - scaledCoef * (rgb1List[i] - rgb2List[i]);

		newRgb.push(Math.round(newNum));
	}

	return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}

/**
 * Lightens (tints) a color toward white.
 *
 * Each RGB channel is shifted toward 255 by `tintFactor`.
 *
 * @param rgb - Base color in `rgb(r,g,b)` format.
 * @param tintFactor - Value between 0 and 1.
 *                     0 → no change
 *                     1 → fully white
 * @returns Tinted color as CSS rgb() string.
 *
 * @example
 * tintify("rgb(100, 150, 200)", 0.5)
 * // returns lighter version of the color
 */
export function tintify(rgb: string, tintFactor: number): string {
	const rgbList: number[] =
		rgb.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];

	const newRgb: number[] = [];

	for (let i = 0; i < 3; i++) {
		const newNum = rgbList[i] + (255 - rgbList[i]) * tintFactor;
		newRgb.push(Math.round(newNum));
	}

	return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}
