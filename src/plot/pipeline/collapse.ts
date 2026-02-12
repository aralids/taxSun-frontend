export const collapse = (
	collapse: Boolean,
	croppedLns: string[][][],
	taxSet: any,
) => {
	let relTaxSet: any = {};
	for (let i = 0; i < croppedLns.length; i++) {
		for (let j = croppedLns[i].length - 1; j >= 0; j--) {
			const taxon = croppedLns[i][j][1] + " " + croppedLns[i][j][0];

			if (
				collapse &&
				taxSet[taxon].unaCount === 0 &&
				taxSet[taxon].directChildren.length === 1
			) {
				croppedLns[i].splice(j, 1);
			} else {
				relTaxSet[taxon] = { ...taxSet[taxon] };
			}
		}
	}
	return [croppedLns, relTaxSet];
};
