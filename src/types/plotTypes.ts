// src/types/plotTypes.ts

/**
 * Shared plot + pipeline domain types for taxSun.
 * Keep these lightweight so you can gradually tighten them over time.
 */

// ---------- Lineage types ----------

export type Rank = string;
export type TaxonName = string;

/**
 * A single lineage entry as used throughout your pipeline.
 * Order is IMPORTANT: [rank, name]
 * Example: ["phylum", "Firmicutes"]
 */
export type LineageItem = [rank: Rank, name: TaxonName];

export type Lineage = LineageItem[];
export type Lineages = Lineage[];

/**
 * Taxon keys are consistently formatted in your code as: "<name> <rank>"
 * Example: "Firmicutes phylum"
 */
export type TaxonKey = string;

// ---------- Geometry + label types ----------

export type Viewport = { w: number; h: number };

/**
 * Label metadata object written by label.ts into relTaxSet[taxon].lblObj
 * and consumed by the UI for rendering.
 */
export type LabelObject = {
	transform: string;
	y: number;

	abbrX: number;
	abbrContent: string;

	extContent: string;

	frameX: number;
	frameY: number;

	frameTransform: string;
	frameTransformOrigin: "left" | "right" | "center";
};

// ---------- Taxon node + sets ----------

/**
 * Minimal taxon node shape used across pipeline functions.
 * It includes:
 * - core fields you use a lot
 * - optional fields produced by pipeline stages (layers/degrees/path/color/lblObj)
 * - optional fields from your raw taxSet that some stages depend on
 *
 * Keep `[key: string]: any` so you can evolve without constantly updating types.
 */
export type TaxonNode = {
	// --- core identity ---
	name: string;
	rank: Rank;
	lnIndex: number;

	// --- counts used everywhere ---
	totCount: number;
	unaCount: number;

	// --- optional fields from the raw taxSet you sometimes read ---
	rawCount?: number;
	taxID?: string;

	children?: TaxonKey[];
	directChildren?: TaxonKey[];

	// arrays aligned by index (used e.g. in eFilter)
	eValues?: number[];
	geneNames?: string[];
	fastaHeaders?: string[];
	names?: string[];

	// --- fields produced/attached by the pipeline ---
	layers?: number[];
	degrees?: number[];
	path?: string;
	color?: string;
	lblObj?: LabelObject;

	// allow additional keys from your real schema without fighting TS
	[key: string]: any;
};

/**
 * Full taxSet and reduced relTaxSet share the same basic shape:
 * both are maps from "<name> <rank>" to a taxon node.
 */
export type TaxSet = Record<TaxonKey, TaxonNode>;
export type RelTaxSet = Record<TaxonKey, TaxonNode>;

/**
 * Convenience: some pipeline functions return tuples.
 */
export type CropResult = [croppedLns: Lineages, relTaxSet: RelTaxSet];

/**
 * Ancestor breadcrumb entry for the currently focused root taxon.
 * Used by the UI to render "you are here" navigation.
 */
export type Ancestor = {
	ancKey: TaxonKey;
	ancName: string;
	ancPerc: number;
};

export type PlotModel = {
	relTaxSet: any;
	paintingOrder: string[];
	ancestors: Ancestor[];
};

export type ViewMode =
	| "unaltered"
	| "marriedTaxaI"
	| "marriedTaxaII"
	| "allEqual";
