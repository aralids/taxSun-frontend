import { binarySearch } from "../radialGeometry";

/**
 * Apply an e-value threshold to the *leaf* taxon of each cropped lineage.
 *
 * For each lineage in `croppedLns`, this function:
 *  - Looks at the last taxon (leaf) of the lineage
 *  - Uses `binarySearch` to find the cut-off index in the leaf's sorted `eValues`
 *  - Slices `eValues`, `geneNames`, `names`, and `fastaHeaders` to keep only entries that pass the threshold
 *  - Updates the leaf's `unaCount` to the new number of remaining hits
 *  - Propagates the resulting count difference (`diff`) up the lineage by decrementing `totCount`
 *  - Deletes taxa from `relTaxSet` whose `totCount` becomes 0
 *  - Removes lineages whose leaf ends up with `unaCount === 0`
 *
 * Notes / assumptions:
 *  - `relTaxSet[<name rank>].eValues` is sorted in the same order expected by `binarySearch`
 *    and aligned index-wise with `geneNames`, `names`, and `fastaHeaders`.
 *  - This function mutates `relTaxSet` in place and mutates `croppedLns` (via `splice`) when removing empty lineages.
 *
 * @param eValueApplied - Whether the e-value filter is enabled.
 * @param eValue - The e-value threshold. If Infinity, filtering is effectively disabled.
 * @param croppedLns - Cropped lineage paths; each lineage is an array of [rank, name] pairs.
 * @param relTaxSet - Reduced taxon lookup map keyed by "<name> <rank>" containing counts and hit arrays.
 *
 * @returns A tuple: [croppedLns, relTaxSet] after filtering.
 */
export const eFilter = (
	eValueApplied: boolean,
	eValue: number,
	croppedLns: string[][][],
	relTaxSet: any,
) => {
	// --- Early gate: only do work if the filter is enabled and the threshold is finite. ---
	if (eValueApplied && eValue !== Infinity) {
		// --- Iterate backwards so we can safely remove lineages in-place. ---
		for (let i = croppedLns.length - 1; i >= 0; i--) {
			// --- Identify the leaf taxon for this lineage ("<name> <rank>"). ---
			const ln = croppedLns[i];
			const last = ln[ln.length - 1];
			const lastTaxon = last[1] + " " + last[0];

			// --- Safety: if upstream deletions removed this taxon, skip to avoid crashing. ---
			if (!relTaxSet[lastTaxon]) continue;

			// --- Save old leaf unaCount so we can compute how much to subtract from lineage totCounts. ---
			const oldUnaCount = relTaxSet[lastTaxon]["unaCount"];

			// --- Compute cut-off position inside the leaf's eValues using binary search. ---
			// We clamp the result to protect against any unexpected return value from binarySearch.
			const eVals: any[] = relTaxSet[lastTaxon]["eValues"] ?? [];
			let cutOffIndex = binarySearch(eVals, eValue);
			if (cutOffIndex < 0) cutOffIndex = 0;
			if (cutOffIndex > eVals.length) cutOffIndex = eVals.length;

			// --- Slice all aligned arrays to keep only hits that pass the threshold. ---
			relTaxSet[lastTaxon]["eValues"] = eVals.slice(cutOffIndex);
			relTaxSet[lastTaxon]["geneNames"] = (
				relTaxSet[lastTaxon]["geneNames"] ?? []
			).slice(cutOffIndex);
			relTaxSet[lastTaxon]["names"] = (
				relTaxSet[lastTaxon]["names"] ?? []
			).slice(cutOffIndex);
			relTaxSet[lastTaxon]["fastaHeaders"] = (
				relTaxSet[lastTaxon]["fastaHeaders"] ?? []
			).slice(cutOffIndex);

			// --- Update leaf unaCount to reflect the remaining number of hits. ---
			const newUnaCount = relTaxSet[lastTaxon]["eValues"].length;
			relTaxSet[lastTaxon]["unaCount"] = newUnaCount;

			// --- Propagate the reduction in hits to totCount along the entire lineage. ---
			const diff = oldUnaCount - newUnaCount;
			for (const txn of ln) {
				const name = txn[1] + " " + txn[0];

				// Safety: if a node was deleted earlier, skip it.
				if (!relTaxSet[name]) continue;

				relTaxSet[name]["totCount"] = relTaxSet[name]["totCount"] - diff;

				// --- If a node becomes empty, remove it from relTaxSet. ---
				if (relTaxSet[name]["totCount"] === 0) {
					delete relTaxSet[name];
				}
			}

			// --- If leaf has no remaining hits, remove the whole lineage. ---
			if (newUnaCount === 0) {
				croppedLns.splice(i, 1);
			}
		}
	}

	// --- Return the filtered lineages and the mutated reduced taxSet. ---
	return [croppedLns, relTaxSet];
};
