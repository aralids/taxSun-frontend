// src/types/taxonomy.ts

/** Rank + taxon name stored as [rank, name] */
export type LineageEntry = [rank: string, name: string];
export type Lineage = LineageEntry[];
export type CroppedLineages = Lineage[];

export type TaxonKey = string;

export type ViewMode =
	| "unaltered"
	| "marriedTaxaI"
	| "marriedTaxaII"
	| "allEqual";

export type TaxonStats = {
	unaCount: number;
	totCount?: number;
	layers?: number[];
	degrees?: number[];
	directChildren?: TaxonKey[];
	[key: string]: unknown;
};

export type RelTaxSet = Record<TaxonKey, TaxonStats>;

/** Single canonical way to build keys everywhere */
export const toTaxonKey = (entry: LineageEntry): TaxonKey =>
	`${entry[1]} ${entry[0]}`;

/** Centralized “equal weights” check */
export const isAllEqualView = (view: ViewMode): boolean => view === "allEqual";
