// src/plot/computePlotState.ts
import {
	calcBasicInfo,
	determinePaintingOrder,
	getAncestors,
} from "./plotPipeline";

export type ViewMode =
	| "unaltered"
	| "marriedTaxaI"
	| "marriedTaxaII"
	| "allEqual";

export function computePlotState(args: {
	eValueApplied: boolean;
	eValue: number;
	collapse: boolean;
	lns: any;
	key: string;
	taxSet: any;
	view: ViewMode;
}) {
	const relTaxSet = calcBasicInfo(
		args.eValueApplied,
		args.eValue,
		args.collapse,
		args.lns,
		args.key,
		args.taxSet,
		args.view,
	);

	return {
		relTaxSet,
		paintingOrder: determinePaintingOrder(relTaxSet),
		ancestors: getAncestors(args.lns, args.key, relTaxSet, args.taxSet),
	};
}
