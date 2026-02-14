export function round(number: number, decimal = 3): number {
	return Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

export function radians(degrees: number): number {
	degrees = 270 - degrees;
	var pi = Math.PI;
	return degrees * (pi / 180);
}

export function cos(number: number): number {
	return Math.cos(radians(number));
}

export function sin(number: number): number {
	return Math.sin(radians(number));
}
