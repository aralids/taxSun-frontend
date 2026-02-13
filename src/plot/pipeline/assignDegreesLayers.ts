import { round } from "../radialGeometry";
import { isAllEqualView, toTaxonKey } from "../../types/taxonomy";
import type {
	CroppedLineages,
	RelTaxSet,
	ViewMode,
	TaxonKey,
} from "../../types/taxonomy";

export type AssignDegreesLayersArgs = {
	croppedLns: CroppedLineages;
	lyr: string;
	minRankPattern: string[];
	relTaxSet: RelTaxSet;
	view: ViewMode;
};

export const assignDegreesLayers = ({
	croppedLns,
	lyr,
	minRankPattern,
	relTaxSet,
	view,
}: AssignDegreesLayersArgs): RelTaxSet => {
	if (croppedLns.length === 0) return relTaxSet;

	const isAllEqual = isAllEqualView(view);

	const rankToIndex: Record<string, number> = Object.create(null);
	for (let i = 0; i < minRankPattern.length; i++) {
		rankToIndex[minRankPattern[i]] = i;
	}

	const firstAlignedLayerByTaxon: Record<TaxonKey, number> =
		Object.create(null);

	for (let lineageIdx = 0; lineageIdx < croppedLns.length; lineageIdx++) {
		const lineage = croppedLns[lineageIdx];

		for (let entryIdx = 0; entryIdx < lineage.length; entryIdx++) {
			const entry = lineage[entryIdx];
			const key = toTaxonKey(entry);

			const alignedIdx = rankToIndex[entry[0]];
			if (alignedIdx !== undefined) firstAlignedLayerByTaxon[key] = alignedIdx;

			if (entryIdx === 1) firstAlignedLayerByTaxon[key] = 1;
		}
	}

	const sumCount = isAllEqual
		? croppedLns.length
		: (relTaxSet[lyr]?.totCount ?? 0);
	if (sumCount <= 0) return relTaxSet;

	let startDeg = 0;

	const layersByTaxon: Record<TaxonKey, number[]> = Object.create(null);
	const degreesByTaxon: Record<TaxonKey, number[]> = Object.create(null);

	for (let lineageIdx = 0; lineageIdx < croppedLns.length; lineageIdx++) {
		const lineage = croppedLns[lineageIdx];
		const childTaxonKey = toTaxonKey(lineage[lineage.length - 1]);

		const childUnaCount = relTaxSet[childTaxonKey]?.unaCount ?? 0;
		const childIncrement = isAllEqual
			? 360 / sumCount
			: (childUnaCount * 360) / sumCount;

		for (let entryIdx = 0; entryIdx < lineage.length; entryIdx++) {
			const currTaxonKey = toTaxonKey(lineage[entryIdx]);

			if (!layersByTaxon[currTaxonKey]) {
				layersByTaxon[currTaxonKey] = [
					firstAlignedLayerByTaxon[currTaxonKey] ?? 0,
				];
				degreesByTaxon[currTaxonKey] = [round(startDeg, 3)];
			}

			const lastLayer =
				entryIdx === lineage.length - 1
					? minRankPattern.length
					: (firstAlignedLayerByTaxon[toTaxonKey(lineage[entryIdx + 1])] ?? 0);

			layersByTaxon[currTaxonKey].push(lastLayer);
			degreesByTaxon[currTaxonKey].push(round(startDeg + childIncrement, 3));
		}

		startDeg += round(childIncrement, 3);
	}

	const nextRelTaxSet: RelTaxSet = { ...relTaxSet };

	for (const taxonKey in nextRelTaxSet) {
		const layers = layersByTaxon[taxonKey];
		const degrees = degreesByTaxon[taxonKey];
		if (!layers || !degrees) continue;

		for (let i = layers.length - 1; i >= 1; i--) {
			if (layers[i] === layers[i - 1]) {
				degrees[i - 1] = degrees[i];
				degrees.splice(i, 1);
				layers.splice(i, 1);
			}
		}

		nextRelTaxSet[taxonKey] = { ...nextRelTaxSet[taxonKey], layers, degrees };
	}

	return nextRelTaxSet;
};
