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
import { ViewMode } from "../types/taxonomy";

type Viewport = { w: number; h: number };

// Minimal “good enough” types for this module.
// You can replace these later with real domain models.
type LineageItem = [rank: string, name: string];
type Lineage = LineageItem[];
type Lineages = Lineage[];

type TaxonNode = {
	name: string;
	totCount: number;
	unaCount: number;
	lnIndex: number;
	layers?: number[];
	degrees?: number[];
	// plus many more keys in your real structure
	[key: string]: any;
};

type TaxSet = Record<string, TaxonNode>;

export function computePlotState(args: {
	eValueApplied: boolean;
	eValue: number;
	collapse: boolean;
	lns: Lineages;
	key: string; // keep external API stable for now
	taxSet: TaxSet;
	view: ViewMode;
	viewport?: Viewport; // new, optional
}) {
	const lyr = args.key;

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
	lyr: string;
	taxSet: TaxSet;
	view: ViewMode;
	viewport: Viewport;
}) {
	let [croppedLns, relTaxSet] = crop(input.lns, input.lyr, input.taxSet);

	[croppedLns, relTaxSet] = eFilter(
		input.eValueApplied,
		input.eValue,
		croppedLns,
		relTaxSet,
	);

	const minRankPattern = calcMinRankPattern(croppedLns, rankPatternFull);

	[croppedLns, relTaxSet] = marry(croppedLns, input.lyr, relTaxSet, input.view);

	[croppedLns, relTaxSet] = collapseLineages(
		input.collapse,
		croppedLns,
		relTaxSet,
	);

	relTaxSet = assignDegreesLayers(
		croppedLns,
		input.lyr,
		minRankPattern,
		relTaxSet,
		input.view,
	);

	const [layerWidth, cx, cy] = getLayerWidthInPx(
		0,
		0,
		input.viewport.w,
		input.viewport.h,
		minRankPattern,
	);

	relTaxSet = calcSVGPaths(cx, cy, layerWidth, relTaxSet);
	relTaxSet = color(croppedLns, input.lns, input.lyr, relTaxSet, input.taxSet);
	relTaxSet = label(cx, cy, layerWidth, input.lyr, minRankPattern, relTaxSet);

	return relTaxSet;
}

function getAncestors(
	lns: Lineages,
	lyr: string,
	relTaxSet: Record<string, TaxonNode>,
	taxSet: TaxSet,
) {
	const root = relTaxSet[lyr];
	if (!root) return [];

	const rootIndex = root.lnIndex;

	for (const ln of lns) {
		const itemAtIndex = ln[rootIndex];
		if (!itemAtIndex) continue;

		const [rankAtIndex, nameAtIndex] = itemAtIndex;

		if (!lyr.includes(nameAtIndex) || !lyr.includes(rankAtIndex)) continue;

		const ancestors = [];
		for (let j = 0; j < rootIndex; j++) {
			const [rank, name] = ln[j];
			const key = `${name} ${rank}`;
			const currTxn = taxSet[key];
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

function determinePaintingOrder(relTaxSet: Record<string, TaxonNode>) {
	return Object.keys(relTaxSet).sort(
		(a, b) => (relTaxSet[b].layers?.[0] ?? 0) - (relTaxSet[a].layers?.[0] ?? 0),
	);
}
