import { round } from "./math";

export function createPalette(colorOffset: any, n: number): string[] {
	let newColors: string[] = [];
	for (let i = 0; i < n; i++) {
		var r = Math.sin(0.3 * colorOffset + 4) * 55 + 200;
		var g = Math.sin(0.3 * colorOffset + 2) * 55 + 200;
		var b = Math.sin(0.3 * colorOffset) * 55 + 200;
		var newColor = `rgb(${round(r, 0)}, ${round(g, 0)}, ${round(b, 0)})`;
		newColors.push(newColor);
		colorOffset += 3;
	}
	return newColors;
}

export function midColor(rgb1: string, rgb2: string, coef: number): string {
	var coef = coef / 2;
	var rgb1List: number[] =
		rgb1.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];
	var rgb2List: number[] =
		rgb2.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];
	var newRgb: number[] = [];
	for (let i = 0; i < 3; i++) {
		var newNum =
			rgb1List[i] < rgb2List[i]
				? rgb1List[i] + coef * (rgb2List[i] - rgb1List[i])
				: rgb1List[i] - coef * (rgb1List[i] - rgb2List[i]);
		newRgb.push(Math.round(newNum));
	}
	return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}

export function tintify(rgb: string, tintFactor: number): string {
	var rgbList: number[] =
		rgb.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];
	var newRgb: number[] = [];
	for (let i = 0; i < 3; i++) {
		var newNum = rgbList[i] + (255 - rgbList[i]) * tintFactor;
		newRgb.push(Math.round(newNum));
	}
	return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}
