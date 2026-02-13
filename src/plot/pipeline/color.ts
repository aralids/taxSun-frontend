import { createPalette, midColor, tintify } from "../radialGeometry";

/**
 * Assign colors to taxa in `relTaxSet` for visualization.
 *
 * Coloring strategy:
 * - Create a deterministic color palette using an `offset` derived from the taxIDs
 *   of the last few lineages in `lns` (so different datasets tend to start on different hues).
 * - The root layer (`lyr`) is colored white.
 * - For each cropped lineage:
 *   - The first ancestor below the root (index 1 in the lineage) gets a unique base hue from the palette.
 *   - Deeper taxa derive their hue by interpolating between the ancestor's hue and the "next" palette hue,
 *     using the taxon's relative angular position within the ancestor wedge.
 *   - Then the hue is "tintified" based on radial depth (layer index) to create variation across rings.
 *
 * Notes / assumptions:
 * - `relTaxSet[taxon].degrees` exists and is an array of degree boundaries (start at index 0).
 * - `relTaxSet[taxon].layers` exists and its first element is the start layer index.
 * - `taxSet[taxon].taxID` exists for taxa used in the offset calculation; missing taxIDs fall back to 0.
 * - This function mutates `relTaxSet` by adding/updating a `color` field per taxon.
 *
 * @param croppedLns - Cropped lineage paths in [rank, name] format.
 * @param lns - Original lineage list (used only to derive a deterministic palette offset).
 * @param lyr - Root layer key; will be colored white.
 * @param relTaxSet - Reduced taxon lookup map keyed by "<name> <rank>".
 * @param taxSet - Full taxon lookup map keyed by "<name> <rank>", used for taxID-based palette offset.
 *
 * @returns The same `relTaxSet` object with `color` assigned for taxa encountered.
 */
export const color = (
	croppedLns: string[][][],
	lns: string[][][],
	lyr: string,
	relTaxSet: any,
	taxSet: any,
) => {
	// --- Compute taxon keys for the last 1–3 lineages in `lns` (used for deterministic palette offset). ---
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

	// --- Safely read taxIDs (fall back to 0 if missing) and compute palette offset. ---
	const id1 = Number(taxSet?.[lnsLstTxn]?.taxID ?? 0);
	const id2 = Number(taxSet?.[lns2ndLstTxn]?.taxID ?? 0);
	const id3 = Number(taxSet?.[lns3rdLstTxn]?.taxID ?? 0);

	const offset = (id1 + id2 + id3 * 2 + 12) % 22;

	// --- Build a color palette from the offset (100 colors). ---
	const palette = createPalette(offset, 100);

	// --- Track assigned hues and keep deterministic mapping for first-level ancestors. ---
	const colors: any = {};
	const hueColored: string[] = [];
	let colorIndex = 0;

	// --- Root is explicitly colored white. ---
	if (relTaxSet?.[lyr]) relTaxSet[lyr]["color"] = "#ffffff";

	// --- Assign colors by walking each lineage. ---
	for (let i = 0; i < croppedLns.length; i++) {
		// Only color if we have at least root + one descendant.
		if (croppedLns[i].length > 1) {
			// --- Identify the first ancestor below the root (lineage index 1). ---
			const firstAncestor = croppedLns[i][1][1] + " " + croppedLns[i][1][0];

			// --- Give each first ancestor a unique base hue from the palette (once). ---
			if (hueColored.indexOf(firstAncestor) === -1) {
				const base = palette[colorIndex % palette.length];
				colors[firstAncestor] = base;

				if (relTaxSet?.[firstAncestor]) {
					relTaxSet[firstAncestor]["color"] = base;
				}

				hueColored.push(firstAncestor);
				colorIndex++;
			}

			// --- For deeper taxa: derive hue from ancestor + angular position + radial depth tint. ---
			for (let j = 2; j < croppedLns[i].length; j++) {
				const currTaxon = croppedLns[i][j][1] + " " + croppedLns[i][j][0];

				// Safety: if geometry is missing for either node, skip.
				if (!relTaxSet?.[currTaxon] || !relTaxSet?.[firstAncestor]) continue;

				const ancestorColor = colors[firstAncestor];
				const nextColorIndex =
					(palette.indexOf(ancestorColor) + 1) % palette.length;
				const nextColor = palette[nextColorIndex];

				// --- Use the taxon's start angle relative to ancestor wedge as interpolation coefficient. ---
				const selfStartDeg = relTaxSet[currTaxon]["degrees"]?.[0];
				const ancestorStartDeg = relTaxSet[firstAncestor]["degrees"]?.[0];
				const ancestorEndDeg =
					relTaxSet[firstAncestor]["degrees"]?.[
						relTaxSet[firstAncestor]["degrees"].length - 1
					];

				// Safety: avoid NaN / divide-by-zero if ancestor wedge is degenerate.
				const denom = ancestorEndDeg - ancestorStartDeg;
				const coef = denom ? (selfStartDeg - ancestorStartDeg) / denom : 0;

				// --- Tint deeper rings slightly more. ---
				const tintFactor = (relTaxSet[currTaxon]["layers"]?.[0] - 1) / 10;

				const hue = midColor(ancestorColor, nextColor, coef);
				const tintifiedHue = tintify(hue, tintFactor);

				colors[currTaxon] = tintifiedHue;
				relTaxSet[currTaxon]["color"] = tintifiedHue;
			}
		}
	}

	return relTaxSet;
};
