import { createPalette, midColor, tintify } from "../radialGeometry";

export const color = (
	croppedLns: string[][][],
	lns: string[][][],
	lyr: string,
	relTaxSet: any,
	taxSet: any,
) => {
	const lnsLstTxn =
		lns.length >= 1
			? lns[lns.length - 1][lns[lns.length - 1].length - 1][1] +
				" " +
				lns[lns.length - 1][lns[lns.length - 1].length - 1][0]
			: "";
	const lns2ndLstTxn =
		lns.length >= 2
			? lns[lns.length - 2][lns[lns.length - 2].length - 1][1] +
				" " +
				lns[lns.length - 2][lns[lns.length - 2].length - 1][0]
			: "";
	const lns3rdLstTxn =
		lns.length >= 3
			? lns[lns.length - 3][lns[lns.length - 3].length - 1][1] +
				" " +
				lns[lns.length - 3][lns[lns.length - 3].length - 1][0]
			: "";
	const offset =
		(Number(taxSet[lnsLstTxn].taxID) +
			Number(taxSet[lns2ndLstTxn].taxID) +
			Number(taxSet[lns3rdLstTxn].taxID) * 2 +
			12) %
		22;
	const palette = createPalette(offset, 100);
	let colors: any = {};
	let hueColored: string[] = [];
	let colorIndex = 0;
	relTaxSet[lyr]["color"] = "#ffffff";
	for (let i = 0; i < croppedLns.length; i++) {
		if (croppedLns[i].length > 1) {
			let firstAncestor = croppedLns[i][1][1] + " " + croppedLns[i][1][0];
			if (hueColored.indexOf(firstAncestor) === -1) {
				colors[firstAncestor] = palette[colorIndex % palette.length];
				relTaxSet[firstAncestor]["color"] =
					palette[colorIndex % palette.length];
				hueColored.push(firstAncestor);
				colorIndex++;
			}

			for (let j = 2; j < croppedLns[i].length; j++) {
				let currTaxon = croppedLns[i][j][1] + " " + croppedLns[i][j][0];
				let ancestorColor = colors[firstAncestor];
				let nextColorIndex =
					(palette.indexOf(ancestorColor) + 1) % palette.length;
				let nextColor = palette[nextColorIndex];
				let selfStartDeg = relTaxSet[currTaxon]["degrees"][0];
				let ancestorStartDeg = relTaxSet[firstAncestor]["degrees"][0];
				let ancestorEndDeg =
					relTaxSet[firstAncestor]["degrees"][
						relTaxSet[firstAncestor]["degrees"].length - 1
					];
				let coef =
					(selfStartDeg - ancestorStartDeg) /
					(ancestorEndDeg - ancestorStartDeg);
				let tintFactor = (relTaxSet[currTaxon]["layers"][0] - 1) / 10;
				var hue = midColor(ancestorColor, nextColor, coef);
				var tintifiedHue = tintify(hue, tintFactor);
				colors[currTaxon] = tintifiedHue;
				relTaxSet[currTaxon]["color"] = tintifiedHue;
			}
		}
	}
	return relTaxSet;
};
