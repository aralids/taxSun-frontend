export function binarySearch(arr: number[], val: number) {
	let i1 = 0;
	let i2 = arr.length - 1;
	while (
		!(Math.floor((i1 + i2) / 2) == arr.length - 1) &&
		!(Math.floor((i1 + i2) / 2) == 0 && arr[Math.floor((i1 + i2) / 2)] > val) &&
		!(
			arr[Math.floor((i1 + i2) / 2)] <= val &&
			arr[Math.floor((i1 + i2) / 2) + 1] > val
		)
	) {
		if (arr[Math.floor((i1 + i2) / 2)] > val) {
			i2 = Math.floor((i1 + i2) / 2) - 1;
		} else {
			i1 = Math.floor((i1 + i2) / 2) + 1;
		}
	}
	if (Math.floor((i1 + i2) / 2) == 0 && arr[Math.floor((i1 + i2) / 2)] > val) {
		return 0;
	}
	return Math.floor((i1 + i2) / 2) + 1;
}
