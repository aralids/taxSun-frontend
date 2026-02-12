import { binarySearch } from "../radialGeometry";

export const eFilter = (
	eValueApplied: Boolean,
	eValue: number,
	croppedLns: string[][][],
	relTaxSet: any,
) => {
	if (eValueApplied && eValue !== Infinity) {
		for (let i = croppedLns.length - 1; i >= 0; i--) {
			let ln = croppedLns[i];
			let lastTaxon = ln[ln.length - 1][1] + " " + ln[ln.length - 1][0];
			let oldUnaCount = relTaxSet[lastTaxon]["unaCount"];

			const cutOffIndex = binarySearch(relTaxSet[lastTaxon]["eValues"], eValue);
			relTaxSet[lastTaxon]["eValues"] =
				relTaxSet[lastTaxon]["eValues"].slice(cutOffIndex);
			relTaxSet[lastTaxon]["geneNames"] =
				relTaxSet[lastTaxon]["geneNames"].slice(cutOffIndex);
			relTaxSet[lastTaxon]["names"] =
				relTaxSet[lastTaxon]["names"].slice(cutOffIndex);
			relTaxSet[lastTaxon]["fastaHeaders"] =
				relTaxSet[lastTaxon]["fastaHeaders"].slice(cutOffIndex);

			/*
			for (let i = 0; i < relTaxSet[lastTaxon]["eValues"].length; i++) {
				const ev = relTaxSet[lastTaxon]["eValues"][i];
				if (ev <= eValue) {
					newGeneNames = newGeneNames.concat([
						relTaxSet[lastTaxon]["geneNames"][i],
					]);
					newNames = newNames.concat([relTaxSet[lastTaxon]["names"][i]]);
					newHeaders = newHeaders.concat([
						relTaxSet[lastTaxon]["fastaHeaders"][i],
					]);
				}
			}

			relTaxSet[lastTaxon]["geneNames"] = newGeneNames;
			relTaxSet[lastTaxon]["names"] = newNames;
			relTaxSet[lastTaxon]["fastaHeaders"] = newHeaders;
            */

			let newUnaCount = relTaxSet[lastTaxon]["eValues"].length;
			relTaxSet[lastTaxon]["unaCount"] = newUnaCount;

			let diff = oldUnaCount - newUnaCount;
			for (let txn of ln) {
				const name = txn[1] + " " + txn[0];
				relTaxSet[name]["totCount"] = relTaxSet[name]["totCount"] - diff;
				if (relTaxSet[name]["totCount"] === 0) {
					delete relTaxSet[name];
				}
			}

			if (newUnaCount === 0) {
				croppedLns = croppedLns.slice(0, i).concat(croppedLns.slice(i + 1));
			}
		}
	}

	return [croppedLns, relTaxSet];
};
