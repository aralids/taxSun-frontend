// src/plot/computePlotState.ts
import { round, getLayerWidthInPx } from "./utils";
import { rankPatternFull } from "../data/staticData";

import {
	assignDegreesLayers,
	calcSVGPaths,
	collapseLineages,
	color,
	crop,
	eFilter,
	label,
	marry,
	calcMinRankPattern,
} from "./pipeline";

import type {
	Lineages,
	TaxSet,
	TaxonNode,
	RelTaxSet,
	Viewport,
	ViewMode,
	TaxonKey,
	Ancestor,
} from "../types/plotTypes";

/**
 * Computes the full plot-ready state for the current view:
 * - `relTaxSet`: the relevant (possibly filtered/transformed) taxon subtree enriched with geometry + styles
 * - `paintingOrder`: draw order for SVG groups
 * - `ancestors`: ancestor breadcrumb for the currently focused root (`key`)
 *
 * Notes:
 * - This function is intentionally "orchestrator-y": it wires together the pipeline steps.
 * - Most heavy lifting lives in `calcBasicInfo` and the individual pipeline modules.
 */
export function computePlotState(args: {
	eValueApplied: boolean;
	eValue: number;
	collapse: boolean;
	lns: Lineages;
	key: string; // keep external API stable for now
	taxSet: TaxSet;
	view: ViewMode;
	viewport?: Viewport; // optional override (helps with testing)
}) {
	// Internal typing: the plot pipeline uses `TaxonKey`.
	// External API currently accepts `string`, so we cast here to keep call sites stable.
	const lyr: TaxonKey = args.key as TaxonKey;

	// Viewport can be injected for tests; otherwise use the browser viewport.
	const viewport: Viewport = args.viewport ?? {
		w: window.innerWidth,
		h: window.innerHeight,
	};

	// Run the pipeline to produce a plot-enriched relTaxSet.
	const relTaxSet = calcBasicInfo({
		eValueApplied: args.eValueApplied,
		eValue: args.eValue,
		collapse: args.collapse,
		lns: args.lns,
		lyr,
		taxSet: args.taxSet,
		view: args.view,
		viewport,
	});

	return {
		relTaxSet,
		paintingOrder: determinePaintingOrder(relTaxSet),
		ancestors: getAncestors(args.lns, lyr, relTaxSet, args.taxSet),
	};
}

/**
 * Runs the "plot pipeline" and returns a `RelTaxSet` enriched with:
 * - filtered/cropped membership
 * - optional marriage + collapse transforms
 * - layer/degree layout information
 * - SVG path geometry
 * - colors + labels
 *
 * This is the core "derive plot model from raw data" function.
 */
function calcBasicInfo(input: {
	eValueApplied: boolean;
	eValue: number;
	collapse: boolean;
	lns: Lineages;
	lyr: TaxonKey;
	taxSet: TaxSet;
	view: ViewMode;
	viewport: Viewport;
}): RelTaxSet {
	// 1) Crop lineages + shrink taxSet to relevant subtree.
	//    Output: `croppedLns` contains only lineages relevant to `lyr`,
	//    and `relTaxSet` contains only taxa referenced by those lineages.
	let [croppedLns, relTaxSet] = crop(input.lns, input.lyr, input.taxSet);

	// 2) Apply e-value filter.
	//    Mutates relTaxSet (slices arrays etc) and may also remove lineages from croppedLns.
	[croppedLns, relTaxSet] = eFilter(
		input.eValueApplied,
		input.eValue,
		croppedLns,
		relTaxSet,
	);

	// 3) Compute minimal rank pattern for what remains visible.
	//    This drives how many layers exist and how ranks map to plot rings.
	const minRankPattern = calcMinRankPattern(croppedLns, rankPatternFull);

	// 4) Optionally merge low-abundance taxa into combined nodes.
	//    (Depending on `view`, marry() may be a no-op.)
	[croppedLns, relTaxSet] = marry(croppedLns, input.lyr, relTaxSet, input.view);

	// 5) Optionally collapse pass-through nodes (nodes with a single child etc.)
	//    This simplifies the rendered lineage paths.
	[croppedLns, relTaxSet] = collapseLineages(
		input.collapse,
		croppedLns,
		relTaxSet,
	);

	// 6) Assign layers + degrees onto relTaxSet.
	//    This is where each node learns which ring it belongs to and its angular span.
	relTaxSet = assignDegreesLayers(
		croppedLns,
		input.lyr,
		minRankPattern,
		relTaxSet,
		input.view,
	);

	// 7) Compute geometry constants for the current viewport.
	//    layerWidth: ring thickness (px)
	//    cx/cy: plot center (px)
	const [layerWidth, cx, cy] = getLayerWidthInPx(
		0,
		0,
		input.viewport.w,
		input.viewport.h,
		minRankPattern,
	);

	// 8) Compute SVG paths, colors, and label objects.
	//    Ordering matters: paths depend on geometry, labels depend on geometry too,
	//    colors may depend on the original taxSet + lineage context.
	relTaxSet = calcSVGPaths(cx, cy, layerWidth, relTaxSet);
	relTaxSet = color(croppedLns, input.lns, input.lyr, relTaxSet, input.taxSet);
	relTaxSet = label(cx, cy, layerWidth, input.lyr, minRankPattern, relTaxSet);

	return relTaxSet;
}

/**
 * Reconstructs the ancestor breadcrumb for the current `lyr` by locating
 * a lineage that contains the root at `root.lnIndex`, then walking upward.
 *
 * Returns ancestors from closest-to-root first (so UI can render from root outward),
 * each with:
 * - `ancKey`: TaxonKey for clicking / navigation
 * - `ancName`: display name (from taxSet)
 * - `ancPerc`: percentage contribution of `lyr` relative to ancestor's totCount
 */
function getAncestors(
	lns: Lineages,
	lyr: TaxonKey,
	relTaxSet: RelTaxSet,
	taxSet: TaxSet,
) {
	// If lyr isn't present in relTaxSet (e.g. filtered away), no ancestors to show.
	const root = relTaxSet[lyr];
	if (!root) return [];

	// lnIndex is the position of the root within its lineage arrays.
	const rootIndex = root.lnIndex;

	// Find a lineage where the item at rootIndex matches `lyr`.
	// (We only need one lineage to reconstruct ancestors.)
	for (const ln of lns) {
		const itemAtIndex = ln[rootIndex];
		if (!itemAtIndex) continue;

		const [rankAtIndex, nameAtIndex] = itemAtIndex;

		// `lyr` is formatted like "<name(s)> <rank>", so we do a coarse contains check.
		// This is intentionally forgiving because names may contain spaces.
		if (!lyr.includes(nameAtIndex) || !lyr.includes(rankAtIndex)) continue;

		const ancestors: Ancestor[] = [];

		// Walk from lineage start up to (but excluding) the root position.
		for (let j = 0; j < rootIndex; j++) {
			const [rank, name] = ln[j];
			const key: TaxonKey = `${name} ${rank}`;
			const currTxn: TaxonNode | undefined = taxSet[key];
			if (!currTxn) continue;

			// Unshift so the returned array is in "root -> ... -> child" order.
			ancestors.unshift({
				ancKey: key,
				ancName: currTxn.name,
				ancPerc: round((root.totCount * 100) / currTxn.totCount, 2),
			});
		}

		return ancestors;
	}

	// No matching lineage found.
	return [];
}

/**
 * Determines render order for taxa, typically drawing outer (larger layer index)
 * before inner (smaller), depending on your SVG grouping strategy.
 *
 * Current heuristic: sort descending by the first layer index.
 */
function determinePaintingOrder(relTaxSet: RelTaxSet): TaxonKey[] {
	return (Object.keys(relTaxSet) as TaxonKey[]).sort(
		(a, b) => (relTaxSet[b].layers?.[0] ?? 0) - (relTaxSet[a].layers?.[0] ?? 0),
	);
}
