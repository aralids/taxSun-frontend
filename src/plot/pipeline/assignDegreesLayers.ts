import { round } from "../radialGeometry";

export const assignDegreesLayers = (
	croppedLns: string[][][],
	lyr: string,
	minRankPattern: string[],
	relTaxSet: any,
	view: string,
) => {
	let alignedLns: string[][] = [];
	let firstAlLayers: any = {};
	for (let i = 0; i < croppedLns.length; i++) {
		let alignedLn: any = new Array(minRankPattern.length).fill(null);
		for (let j = 0; j < croppedLns[i].length; j++) {
			let index = minRankPattern.indexOf(croppedLns[i][j][0]);
			if (index > -1) {
				alignedLn.splice(index, 1, croppedLns[i][j]);
				firstAlLayers[croppedLns[i][j][1] + " " + croppedLns[i][j][0]] = index;
			}
			if (j === 1) {
				firstAlLayers[croppedLns[i][j][1] + " " + croppedLns[i][j][0]] = 1;
			}
		}
		alignedLns.push(alignedLn);
	}

	//console.log("minRankPattern: ", minRankPattern);
	//console.log("alignedLns: ", alignedLns);
	//console.log("firstAlLayers: ", firstAlLayers);

	let layers: any = {};
	let degrees: any = {};
	let startDeg = 0;
	let sumCount =
		view === "allEqual" ? croppedLns.length : relTaxSet[lyr]["totCount"];
	for (let i = 0; i < croppedLns.length; i++) {
		let childTaxon =
			croppedLns[i][croppedLns[i].length - 1][1] +
			" " +
			croppedLns[i][croppedLns[i].length - 1][0];
		for (let j = 0; j < croppedLns[i].length; j++) {
			let currTaxon = croppedLns[i][j][1] + " " + croppedLns[i][j][0];

			// Determine first layers and degrees.
			// Every taxon starts at its firstLayerAligned UNLESS
			// its parent is the root taxon but there are missing ranks in between -
			// in which case starts at its firstLayerUnaligned, which is layer 1.
			if (!layers[currTaxon]) {
				degrees[currTaxon] = [round(startDeg, 3)];
				layers[currTaxon] = [firstAlLayers[currTaxon]];
			}

			// Determine the last layer (for the current lineage - next iteration might be for the same taxon,
			// but different lineage and a different last layer, but the first layer is the same for both).
			// If there is a rank gap between the current taxon and the next one, the current taxon fills it.
			let lastLayer: number;
			if (j === croppedLns[i].length - 1) {
				lastLayer = minRankPattern.length;
			} else {
				let nextTaxon = croppedLns[i][j + 1][1] + " " + croppedLns[i][j + 1][0];
				lastLayer = firstAlLayers[nextTaxon];
			}

			layers[currTaxon] = layers[currTaxon].concat([lastLayer]);

			const degree = round(
				view === "allEqual"
					? startDeg + 360 / sumCount
					: startDeg + (relTaxSet[childTaxon]["unaCount"] * 360) / sumCount,
				3,
			);
			degrees[currTaxon] = degrees[currTaxon].concat([degree]);
		}

		startDeg += round(
			view === "allEqual"
				? 360 / sumCount
				: (relTaxSet[childTaxon]["unaCount"] * 360) / sumCount,
			3,
		);
	}

	for (let taxon in relTaxSet) {
		for (let i = layers[taxon].length - 1; i >= 1; i--) {
			if (layers[taxon][i] === layers[taxon][i - 1]) {
				degrees[taxon][i - 1] = degrees[taxon][i];
				degrees[taxon].splice(i, 1);
				layers[taxon].splice(i, 1);
			}
		}
		relTaxSet[taxon]["layers"] = layers[taxon];
		relTaxSet[taxon]["degrees"] = degrees[taxon];
	}

	return relTaxSet;
};
