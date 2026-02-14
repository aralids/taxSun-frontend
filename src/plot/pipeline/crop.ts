// src/plot/pipeline/crop.ts
import type {
	CropResult,
	Lineages,
	RelTaxSet,
	TaxSet,
	TaxonKey,
} from "../../types/plotTypes";

/**
 * Crop a set of taxonomic lineage paths (`lns`) to only the sub-tree under a chosen layer (`lyr`),
 * and return:
 *  1) `croppedLns`: only those lineages that belong to the selected root taxon/taxa
 *  2) `relTaxSet`: a reduced taxSet containing only taxa that appear in `croppedLns`
 *     (plus a synthetic merged node when `lyr` represents multiple root taxa joined by " & ").
 *
 * The function supports two cases:
 * - Single-root layer: `lyr` is one taxon at some rank (e.g. "Bacteria superkingdom")
 * - Multi-root layer: `lyr` represents multiple taxa merged at the same rank
 *   (e.g. "Bacteria & Archaea superkingdom"), producing a synthetic node keyed by `lyr`.
 *
 * @param lns - All lineage paths. Each lineage is an array of [rank, name] pairs.
 *              Example: [["superkingdom","Bacteria"],["phylum","Firmicutes"], ...]
 * @param lyr - The selected layer key in the form "<name(s)> <rank>".
 *              If multiple names are merged, they are joined by " & ".
 * @param taxSet - Lookup map keyed by "<name> <rank>" holding metadata for each taxon,
 *                 including `lnIndex` which points to where that taxon appears in a lineage path.
 *
 * @returns A tuple: [croppedLns, relTaxSet]
 */
export const crop = (
	lns: Lineages,
	lyr: TaxonKey,
	taxSet: TaxSet,
): CropResult => {
	// --- Parse the selected layer into root taxa and root rank (the "subtree root"). ---
	// Example lyr: "Bacteria & Archaea superkingdom"
	// rootTaxa -> ["Bacteria","Archaea"], rootRank -> "superkingdom"
	const rootTaxa = lyr.split(" ").slice(0, -1).join(" ").split(" & ");
	const rootRank = lyr.split(" ").slice(-1)[0];

	// --- Map each root taxon to its expected position (lnIndex) inside each lineage path. ---
	// We guard against missing taxSet entries by returning -1, then skipping those indices later.
	const lyrIndices = rootTaxa.map((item) => {
		const key: TaxonKey = `${item} ${rootRank}`;
		const node = taxSet[key];
		return node ? node["lnIndex"] : -1;
	});

	// --- Build croppedLns: keep only those lineages that match any of the root taxa at rootRank. ---
	// For every matching lineage, we slice from (root node + 1) onward and prefix a synthetic root:
	// [[rootRank, "<rootTaxa joined>"], ...rest-of-lineage]
	let croppedLns: Lineages = [];
	for (let i = 0; i < lns.length; i++) {
		for (let j = 0; j < rootTaxa.length; j++) {
			const taxon = rootTaxa[j];
			const index = lyrIndices[j];
			const rank = rootRank;

			// Skip missing/unknown indices (taxon not found in taxSet at this rank).
			if (index < 0) continue;

			// Keep only the lineages where the lineage node at lnIndex matches (rank, taxon).
			if (
				lns[i][index] &&
				lns[i][index][1] === taxon &&
				lns[i][index][0] === rank
			) {
				const croppedLn: any = [[rootRank, rootTaxa.join(" & ")]].concat(
					lns[i].slice(index + 1),
				);
				croppedLns.push(croppedLn);
			}
		}
	}

	// --- Create relTaxSet: the reduced taxSet relevant to the cropped subtree. ---
	// This includes:
	// - the selected layer `lyr` (either copied directly or built as a synthetic merged node)
	// - all taxa that appear anywhere inside `croppedLns`
	const relTaxSet: RelTaxSet = {} as RelTaxSet;

	// --- Case A: single root taxon (lyr exists as a real node in taxSet). ---
	if (rootTaxa.length === 1) {
		if (taxSet[lyr]) relTaxSet[lyr] = { ...taxSet[lyr] };
	} else {
		// --- Case B: multiple root taxa merged into one synthetic node keyed by `lyr`. ---
		// We aggregate arrays (children, names, headers, etc.) and sum counts across roots.
		relTaxSet[lyr] = {
			children: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc.concat(taxSet[k]?.["children"] ?? []);
			}, [] as TaxonKey[]),

			directChildren: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc.concat(taxSet[k]?.["directChildren"] ?? []);
			}, [] as TaxonKey[]),

			eValues: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc.concat(taxSet[k]?.["eValues"] ?? []);
			}, [] as number[]),

			fastaHeaders: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc.concat(taxSet[k]?.["fastaHeaders"] ?? []);
			}, [] as string[]),

			geneNames: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc.concat(taxSet[k]?.["geneNames"] ?? []);
			}, [] as string[]),

			// Keep the lnIndex of the first root taxon (assumes all roots share the same rank slot).
			lnIndex:
				taxSet[`${rootTaxa[0]} ${rootRank}` as TaxonKey]?.["lnIndex"] ?? 0,

			// Synthetic display name for merged roots.
			name: rootTaxa.join(" & "),

			names: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc.concat(taxSet[k]?.["names"] ?? []);
			}, [] as string[]),

			rank: rootRank,

			rawCount: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc + Number(taxSet[k]?.["rawCount"] ?? 0);
			}, 0),

			// No single taxID exists for a merged node.
			taxID: "",

			totCount: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc + Number(taxSet[k]?.["totCount"] ?? 0);
			}, 0),

			unaCount: rootTaxa.reduce((acc, txn) => {
				const k: TaxonKey = `${txn} ${rootRank}`;
				return acc + Number(taxSet[k]?.["unaCount"] ?? 0);
			}, 0),
		};

		// --- Deduplicate croppedLns ---
		// Multiple roots can match the same lineage; we remove duplicates by hashing each lineage.
		const seen = new Set<string>();
		const unique: Lineages = [];
		for (const ln of croppedLns) {
			const k = JSON.stringify(ln);
			if (!seen.has(k)) {
				seen.add(k);
				unique.push(ln);
			}
		}
		croppedLns = unique;
	}

	// --- Populate relTaxSet with every node that appears in any cropped lineage. ---
	// We skip i=0 because that's the synthetic root node [[rootRank, "<joined roots>"]] we created.
	for (const ln of croppedLns) {
		for (let i = 1; i < ln.length; i++) {
			const key: TaxonKey = `${ln[i][1]} ${ln[i][0]}`;
			// Guard: only copy if the node exists in the original taxSet.
			if (taxSet[key]) {
				relTaxSet[key] = {
					...taxSet[key],
				};
			}
		}
	}

	// --- Return the cropped lineages and their corresponding reduced taxSet. ---
	return [croppedLns, relTaxSet];
};
