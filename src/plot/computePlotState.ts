// src/plot/computePlotState.ts
import { round, getLayerWidthInPx } from "./radialGeometry";
import { crop } from "./pipeline/crop";
import { eFilter } from "./pipeline/eFilter";
import { calcMinRankPattern } from "./pipeline/rank";
import { rankPatternFull } from "../data/staticData";
import { marry } from "./pipeline/marry";
import { collapseLineages } from "./pipeline/collapseLineages";
import { assignDegreesLayers } from "./pipeline/assignDegreesLayers";
import { calcSVGPaths } from "./pipeline/calcSVGPaths";
import { color } from "./pipeline/color";
import { label } from "./pipeline/label";

import type {
	Lineages,
	TaxSet,
	TaxonNode,
	RelTaxSet,
	Viewport,
	ViewMode,
	TaxonKey,
} from "../types/plotTypes";

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
	const lyr: TaxonKey = args.key;

	const viewport: Viewport = args.viewport ?? {
		w: window.innerWidth,
		h: window.innerHeight,
	};

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
	// 1) Crop lineages + shrink taxSet to relevant subtree
	let [croppedLns, relTaxSet] = crop(input.lns, input.lyr, input.taxSet);

	// 2) Apply e-value filter (mutates relTaxSet + may remove lineages)
	[croppedLns, relTaxSet] = eFilter(
		input.eValueApplied,
		input.eValue,
		croppedLns,
		relTaxSet,
	);

	// 3) Compute minimal rank pattern for the currently visible subtree
	const minRankPattern = calcMinRankPattern(croppedLns, rankPatternFull);

	// 4) Optionally marry low-abundance taxa into merged nodes
	[croppedLns, relTaxSet] = marry(croppedLns, input.lyr, relTaxSet, input.view);

	// 5) Optionally collapse pass-through nodes to simplify lineage paths
	[croppedLns, relTaxSet] = collapseLineages(
		input.collapse,
		croppedLns,
		relTaxSet,
	);

	// 6) Assign layers + degrees onto relTaxSet
	relTaxSet = assignDegreesLayers(
		croppedLns,
		input.lyr,
		minRankPattern,
		relTaxSet,
		input.view,
	);

	// 7) Compute geometry constants for the current viewport
	const [layerWidth, cx, cy] = getLayerWidthInPx(
		0,
		0,
		input.viewport.w,
		input.viewport.h,
		minRankPattern,
	);

	// 8) Compute SVG paths, colors, and label objects
	relTaxSet = calcSVGPaths(cx, cy, layerWidth, relTaxSet);
	relTaxSet = color(croppedLns, input.lns, input.lyr, relTaxSet, input.taxSet);
	relTaxSet = label(cx, cy, layerWidth, input.lyr, minRankPattern, relTaxSet);

	return relTaxSet;
}

function getAncestors(
	lns: Lineages,
	lyr: TaxonKey,
	relTaxSet: RelTaxSet,
	taxSet: TaxSet,
) {
	const root = relTaxSet[lyr];
	if (!root) return [];

	const rootIndex = root.lnIndex;

	for (const ln of lns) {
		const itemAtIndex = ln[rootIndex];
		if (!itemAtIndex) continue;

		const [rankAtIndex, nameAtIndex] = itemAtIndex;

		// lyr is of the form "<name(s)> <rank>" so check both are present.
		if (!lyr.includes(nameAtIndex) || !lyr.includes(rankAtIndex)) continue;

		const ancestors: { ancKey: TaxonKey; ancName: string; ancPerc: number }[] =
			[];

		for (let j = 0; j < rootIndex; j++) {
			const [rank, name] = ln[j];
			const key: TaxonKey = `${name} ${rank}`;
			const currTxn: TaxonNode | undefined = taxSet[key];
			if (!currTxn) continue;

			ancestors.unshift({
				ancKey: key,
				ancName: currTxn.name,
				ancPerc: round((root.totCount * 100) / currTxn.totCount, 2),
			});
		}

		return ancestors;
	}

	return [];
}

function determinePaintingOrder(relTaxSet: RelTaxSet): TaxonKey[] {
	return (Object.keys(relTaxSet) as TaxonKey[]).sort(
		(a, b) => (relTaxSet[b].layers?.[0] ?? 0) - (relTaxSet[a].layers?.[0] ?? 0),
	);
}
