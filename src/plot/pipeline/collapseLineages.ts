/**
 * Optionally collapse "single-child, empty" internal taxa out of each lineage to simplify the paths.
 *
 * For each lineage in `croppedLns`, this function iterates from leaf -> root and:
 * - If `collapse` is enabled, removes a taxon from the lineage when:
 *   - `taxSet[taxon].unaCount === 0` (no unassigned hits at that node)
 *   - `taxSet[taxon].directChildren.length === 1` (it is a simple pass-through node)
 *   - the node is NOT the lineage root (we never remove index 0)
 * - Regardless of collapsing, builds a reduced `relTaxSet` containing only taxa that appear
 *   in the (possibly collapsed) lineages.
 *
 * Notes / assumptions:
 * - `croppedLns` lineages are arrays of [rank, name] pairs.
 * - `taxSet` keys are "<name> <rank>" and contain at least `unaCount` and `directChildren`.
 * - This function mutates `croppedLns` in place (via splice).
 *
 * @param collapse - Whether collapsing is enabled.
 * @param croppedLns - The lineage paths to optionally simplify.
 * @param taxSet - Full taxon lookup map keyed by "<name> <rank>".
 *
 * @returns A tuple: [croppedLns, relTaxSet]
 */
export const collapseLineages = (
	collapse: boolean,
	croppedLns: string[][][],
	taxSet: any,
) => {
	// --- Build a reduced taxSet containing only nodes still relevant after collapsing. ---
	let relTaxSet: any = {};

	// --- Traverse each lineage. ---
	for (let i = 0; i < croppedLns.length; i++) {
		// --- Walk from leaf -> root so splice-removals don't affect yet-to-visit indices. ---
		for (let j = croppedLns[i].length - 1; j >= 0; j--) {
			// --- Construct "<name> <rank>" key for the current node. ---
			const taxon = croppedLns[i][j][1] + " " + croppedLns[i][j][0];

			// --- Root node is index 0; we never remove it. ---
			const taxonIsRoot = j === 0;

			// --- Safety: if the node is missing in taxSet, skip collapsing and don't copy. ---
			// (If you prefer, you could still copy a fallback object here.)
			if (!taxSet?.[taxon]) continue;

			// --- If collapse enabled and this node is an "empty pass-through", remove it from the lineage. ---
			if (
				collapse &&
				taxSet[taxon].unaCount === 0 &&
				taxSet[taxon].directChildren.length === 1 &&
				!taxonIsRoot
			) {
				croppedLns[i].splice(j, 1);
			} else {
				// --- Otherwise keep the node and include it in the reduced taxSet. ---
				relTaxSet[taxon] = { ...taxSet[taxon] };
			}
		}
	}

	// --- Return the possibly-collapsed lineages and the reduced taxSet. ---
	return [croppedLns, relTaxSet];
};
