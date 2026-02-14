import { round } from "../utils";

/**
 * Assign radial "layers" (ring indices) and angular "degrees" (start/end angles)
 * for every taxon encountered in the cropped lineage set, and store these arrays
 * back into `relTaxSet[taxon]`.
 *
 * High-level idea:
 * 1) Align each lineage against `minRankPattern` so taxa can be placed onto consistent rings.
 *    - `firstAlLayers[taxonKey]` stores the first ring index where that taxon appears.
 *    - Special-case: if a taxon is directly under the root (j === 1), force first layer to 1
 *      to handle missing-rank gaps under the root.
 * 2) Walk through each lineage in order and accumulate angles from `startDeg`.
 *    - If view === "allEqual", each lineage gets equal slice.
 *    - Else, each lineage’s slice is proportional to the leaf’s `unaCount`.
 * 3) For each taxon on each lineage:
 *    - Append its end-layer for that lineage (used for rank gaps / filling)
 *    - Append its end-degree for that lineage (angular extent)
 * 4) Compress consecutive duplicate layer boundaries for each taxon (remove redundant segments),
 *    then assign `layers` and `degrees` arrays onto `relTaxSet[taxon]`.
 *
 * Notes / assumptions:
 * - `croppedLns` elements are arrays of [rank, name] pairs.
 * - `relTaxSet` is keyed by "<name> <rank>" and contains `unaCount` at least for leaf taxa.
 * - `minRankPattern` defines the global ring order (e.g. ["superkingdom","phylum",...]).
 * - This function mutates `relTaxSet` by adding `layers` and `degrees` per taxon.
 *
 * @param croppedLns - Cropped lineage paths in [rank, name] format.
 * @param lyr - Root layer key used to retrieve subtree total count (unless view === "allEqual").
 * @param minRankPattern - Ordered list of ranks that define ring positions.
 * @param relTaxSet - Reduced taxon lookup map keyed by "<name> <rank>".
 * @param view - Plot mode; affects how degree sizes are computed ("allEqual" uses equal slices).
 *
 * @returns The same `relTaxSet` object with `layers` and `degrees` assigned for taxa encountered.
 */
export const assignDegreesLayers = (
	croppedLns: string[][][],
	lyr: string,
	minRankPattern: string[],
	relTaxSet: any,
	view: string,
) => {
	// --- 1) Align each lineage to the global rank pattern and record first aligned layer per taxon. ---
	const alignedLns: string[][] = []; // (kept for debugging / parity with your original; not used downstream)
	const firstAlLayers: any = {};

	for (let i = 0; i < croppedLns.length; i++) {
		// Create an aligned lineage array of length = number of ranks (fill missing ranks with null).
		const alignedLn: any = new Array(minRankPattern.length).fill(null);

		for (let j = 0; j < croppedLns[i].length; j++) {
			const rank = croppedLns[i][j][0];
			const name = croppedLns[i][j][1];
			const key = name + " " + rank;

			// Find the layer index for this rank in the global pattern.
			const idx = minRankPattern.indexOf(rank);

			// If rank exists in pattern, place it into the aligned array and record its first layer.
			if (idx > -1) {
				alignedLn.splice(idx, 1, croppedLns[i][j]);
				firstAlLayers[key] = idx;
			}

			// Special-case: if this node is directly below the root (j === 1),
			// force its first layer to 1 (handles rank gaps under the root).
			if (j === 1) {
				firstAlLayers[key] = 1;
			}
		}

		alignedLns.push(alignedLn);
	}

	// --- 2) Prepare containers for per-taxon layer boundaries and degree boundaries. ---
	const layers: any = {};
	const degrees: any = {};
	let startDeg = 0;

	// --- Determine total used to normalize angles. ---
	// allEqual: equal slice per lineage
	// otherwise: weighted by `unaCount` and normalized by subtree totCount
	const sumCount =
		view === "allEqual"
			? croppedLns.length
			: (relTaxSet?.[lyr]?.["totCount"] ?? croppedLns.length);

	// Safety: avoid divide-by-zero; if sumCount is 0, just return relTaxSet unchanged.
	if (!sumCount || sumCount <= 0) return relTaxSet;

	// --- 3) Walk each lineage, accumulate degrees, and record per-taxon segments. ---
	for (let i = 0; i < croppedLns.length; i++) {
		// Leaf taxon key for weighting (when not in allEqual view).
		const leaf = croppedLns[i][croppedLns[i].length - 1];
		const childTaxon = leaf[1] + " " + leaf[0];

		for (let j = 0; j < croppedLns[i].length; j++) {
			const curr = croppedLns[i][j];
			const currTaxon = curr[1] + " " + curr[0];

			// --- Initialize this taxon the first time we see it:
			// - first boundary starts at current startDeg
			// - first layer starts at its first aligned layer (or undefined if not found)
			if (!layers[currTaxon]) {
				degrees[currTaxon] = [round(startDeg, 3)];
				layers[currTaxon] = [firstAlLayers[currTaxon]];
			}

			// --- Determine the "last layer" boundary for this taxon in THIS lineage:
			// If there is a rank gap before the next node, the current node fills it,
			// so its last layer becomes the next node's first layer.
			let lastLayer: number;
			if (j === croppedLns[i].length - 1) {
				// Leaf extends to the outermost ring boundary.
				lastLayer = minRankPattern.length;
			} else {
				const next = croppedLns[i][j + 1];
				const nextTaxon = next[1] + " " + next[0];
				lastLayer = firstAlLayers[nextTaxon];
			}

			// Append the last layer boundary for this lineage segment.
			layers[currTaxon] = layers[currTaxon].concat([lastLayer]);

			// --- Compute end-degree boundary for this segment. ---
			// allEqual: add equal slice
			// otherwise: add slice proportional to leaf unaCount
			const slice =
				view === "allEqual"
					? 360 / sumCount
					: ((relTaxSet?.[childTaxon]?.["unaCount"] ?? 0) * 360) / sumCount;

			const degree = round(startDeg + slice, 3);
			degrees[currTaxon] = degrees[currTaxon].concat([degree]);
		}

		// --- Advance startDeg by this lineage's slice. ---
		const slice =
			view === "allEqual"
				? 360 / sumCount
				: ((relTaxSet?.[childTaxon]?.["unaCount"] ?? 0) * 360) / sumCount;

		startDeg += round(slice, 3);
	}

	// --- 4) Compress redundant consecutive layer boundaries and assign results onto relTaxSet. ---
	for (let taxon in relTaxSet) {
		// Safety: some relTaxSet taxa may never appear in croppedLns (or were not initialized).
		if (!layers[taxon] || !degrees[taxon]) continue;

		// Remove segments where the layer boundary doesn't change (duplicate boundaries).
		for (let i = layers[taxon].length - 1; i >= 1; i--) {
			if (layers[taxon][i] === layers[taxon][i - 1]) {
				// Keep the later degree boundary (end) as the earlier one, then remove the duplicate entry.
				degrees[taxon][i - 1] = degrees[taxon][i];
				degrees[taxon].splice(i, 1);
				layers[taxon].splice(i, 1);
			}
		}

		// Attach computed geometry arrays to the taxon metadata.
		relTaxSet[taxon]["layers"] = layers[taxon];
		relTaxSet[taxon]["degrees"] = degrees[taxon];
	}

	return relTaxSet;
};
