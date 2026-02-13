/**
 * Compute the minimal rank pattern required for the current cropped lineage set.
 *
 * Steps:
 * 1) Collect all rank strings (item[0]) appearing in `croppedLns`.
 * 2) Remove duplicates and empty values.
 * 3) Filter `rankPatternFull` so that only ranks actually present in `croppedLns`
 *    remain, preserving the original global rank order.
 *
 * This ensures that the resulting rank pattern:
 * - Contains only ranks that occur in the current subtree.
 * - Preserves the canonical order defined by `rankPatternFull`.
 *
 * Notes / assumptions:
 * - Each lineage node is a tuple `[rank: string, name: string]`.
 * - `rankPatternFull` is the master ordered list of ranks.
 *
 * @param croppedLns - Cropped lineage paths in `[rank, name]` format.
 * @param rankPatternFull - Full ordered list of all possible ranks.
 *
 * @returns A filtered rank pattern containing only ranks present in `croppedLns`.
 */
export const calcMinRankPattern = (
	croppedLns: [string, string][][],
	rankPatternFull: string[],
) => {
	// --- 1) Collect all ranks from all lineages. ---
	const allRanks = croppedLns.reduce<string[]>(
		(accumulator, ln) => accumulator.concat(ln.map((item) => item[0])),
		[],
	);

	// --- 2) Remove duplicates and empty values using a Set (preserves insertion order). ---
	const ranksUnique: string[] = Array.from(
		new Set(allRanks.filter((value) => value !== "")),
	);

	// --- 3) Keep only ranks that appear in croppedLns, preserving global rank order. ---
	const rankPattern: string[] = rankPatternFull.filter((item) =>
		ranksUnique.includes(item),
	);

	return rankPattern;
};
