import { twoVminHeights } from "../../data/staticData";
import {
	round,
	lineLength,
	sin,
	cos,
	calcOptLabel,
	calcHorizontalSpace,
} from "../radialGeometry";

/**
 * Compute label placement/transform metadata (`lblObj`) for each taxon in `relTaxSet`.
 *
 * What this produces:
 * - For every taxon key in `relTaxSet`, assigns `relTaxSet[key].lblObj` with properties used by the UI:
 *   - rotation transform around the label's origin point
 *   - label y coordinate
 *   - abbreviated label text + x position (abbrContent/abbrX) when space allows
 *   - extended label text (extContent), usually "name + percent"
 *   - "frame" coordinates and CSS-like transform/origin for a label background frame
 *
 * How placement works (high level):
 * - Derive the taxon's wedge mid-angle from its `degrees` array.
 * - Place label anchor point at a ring offset (`midLyr`) based on the taxon's first rank layer.
 * - Estimate wedge width and available space (vertical vs horizontal) and choose:
 *   - rotated text along wedge direction (for edge-touching/simple wedges), or
 *   - internal label placement using measured space heuristics, or
 *   - no label if wedge is too small.
 * - Finally, set a special root label object for `lyr` at the center.
 *
 * Notes / assumptions:
 * - Each taxon in relTaxSet has:
 *   - `degrees: number[]` (angular boundaries)
 *   - `layers: number[]` (layer boundaries)
 *   - `rank`, `name`, `totCount`, `unaCount`
 * - `minRankPattern` contains the rank strings used to map rank -> label layer index.
 * - This function mutates `relTaxSet`.
 *
 * @param cx - Center x coordinate.
 * @param cy - Center y coordinate.
 * @param layerWidth - Width (in pixels) per radial layer index.
 * @param lyr - Root layer key in relTaxSet (used for percent calculation and root label).
 * @param minRankPattern - Ordered rank list used to determine first label layer for a rank.
 * @param relTaxSet - Reduced taxon lookup map keyed by "<name> <rank>".
 *
 * @returns The same `relTaxSet` object with `lblObj` assigned.
 */
export const label = (
	cx: number,
	cy: number,
	layerWidth: number,
	lyr: string,
	minRankPattern: string[],
	relTaxSet: any,
) => {
	// --- Compute viewport scaling (twoVmin) and a y-offset tweak from lookup table. ---
	const twoVmin = Math.min(window.innerWidth, window.innerHeight) / (100 / 2);
	const twoVminKey = round(twoVmin, 1);

	// Safety: if the lookup key doesn't exist, fall back to 0 offset (avoid NaN).
	const yOffset = (twoVminHeights as any)?.[twoVminKey]
		? (twoVminHeights as any)[twoVminKey] / 4
		: 0;

	// --- Assign a label object for every taxon in relTaxSet. ---
	for (let key in relTaxSet) {
		const txn = relTaxSet[key];

		// --- Safety: skip taxa without geometry. ---
		if (
			!txn?.degrees ||
			!Array.isArray(txn.degrees) ||
			txn.degrees.length === 0
		)
			continue;
		if (!txn?.layers || !Array.isArray(txn.layers) || txn.layers.length === 0)
			continue;

		// --- Compute wedge angles and wedge midpoint angle. ---
		const startDeg = txn["degrees"][0];
		const endDeg = txn["degrees"][txn["degrees"].length - 1];
		const midDeg = startDeg + (endDeg - startDeg) / 2;

		// --- Determine which label "ring" this rank belongs to. ---
		const fstLabelLyr = minRankPattern.indexOf(txn.rank);
		const midLyr = fstLabelLyr + 0.333;

		// --- Compute label anchor point and wedge border points at the label radius. ---
		const labelCx = round(midLyr * layerWidth * cos(midDeg)) + cx;
		const labelCy = round(-midLyr * layerWidth * sin(midDeg)) + cy;

		const pointOnStartBorderX = round(midLyr * layerWidth * cos(startDeg)) + cx;
		const pointOnStartBorderY =
			round(-midLyr * layerWidth * sin(startDeg)) + cy;

		const pointOnEndBorderX = round(midLyr * layerWidth * cos(endDeg)) + cx;
		const pointOnEndBorderY = round(-midLyr * layerWidth * sin(endDeg)) + cy;

		// --- Measure wedge range/width at the label radius. ---
		const range = endDeg - startDeg;
		const shapeWidth = lineLength(
			pointOnStartBorderX,
			pointOnStartBorderY,
			pointOnEndBorderX,
			pointOnEndBorderY,
		);

		// --- Build extended label content: "<name> <percent>%". ---
		// Safety: if relTaxSet[lyr] missing, percent becomes 0.
		const rootTot = relTaxSet?.[lyr]?.totCount ?? 0;
		const perc = rootTot ? round((txn.totCount / rootTot) * 100) : 0;

		const [extContent, extWidth]: any[] = calcOptLabel(
			2,
			`${txn.name} ${perc}%`,
			Infinity,
		);
		// extWidth is intentionally unused; kept for parity with calcOptLabel return signature.
		extWidth;

		// --- Baseline label positioning values. ---
		const y = labelCy + yOffset;
		const originX = labelCx;
		const originY = labelCy;

		let frameTransformOrigin = "center";
		let frameTransform = "";

		// --- Decide label strategy based on available space and wedge location. ---
		let angle: number, abbrContent: any, abbrX: any, abbrWidth: any;

		// If wedge is not "tiny": either it’s wide enough, or its angular range is large enough.
		if (!(shapeWidth < twoVmin && range < 180)) {
			// --- Case A: wedge touches plot edge and is simple-shaped (2 layers) with unaCount > 0. ---
			if (txn.unaCount > 0 && txn.layers.length === 2) {
				// Compute available space along the wedge for the label.
				const spaceInPx =
					0.666 * layerWidth +
					(txn.layers[1] - fstLabelLyr - 1) * layerWidth +
					4 * 15;

				// Species labels are abbreviated like "E. coli".
				if (txn.rank === "species") {
					[abbrContent, abbrWidth] = calcOptLabel(
						2,
						`${txn.name.slice(0, 1)}. ${txn.name
							.split(" ")
							.slice(1)
							.join(" ")}`,
						spaceInPx,
					);
				} else {
					[abbrContent, abbrWidth] = calcOptLabel(2, txn.name, spaceInPx);
				}

				// Rotate label along wedge direction and flip depending on hemisphere.
				angle = midDeg <= 180 ? 270 + midDeg : 270 - midDeg;

				if (midDeg >= 180 && midDeg < 360) {
					angle = 360 - angle;
					abbrX = labelCx;
					frameTransformOrigin = "left";
					frameTransform = `translate(0%, -50%) rotate(${angle}deg)`;
				} else if (midDeg >= 0 && midDeg < 180) {
					abbrX = labelCx - abbrWidth;
					frameTransformOrigin = "right";
					frameTransform = `translate(-100%, -50%) rotate(${angle}deg)`;
				}
			} else {
				// --- Case B: wedge is internal/irregular: compare vertical vs horizontal space. ---
				const lstLabelLyr = Math.min.apply(Math, txn.layers.slice(1));
				const verticalSpace = (lstLabelLyr - fstLabelLyr - 0.4) * layerWidth;

				// Pick an angle that aims labels "inward" depending on the hemisphere.
				angle =
					(270 - midDeg + 360) % 360 > 180 && (270 - midDeg + 360) % 360 <= 360
						? midDeg % 360
						: (midDeg + 180) % 360;

				const hemisphere =
					(270 - midDeg + 360) % 360 > 180 && (270 - midDeg + 360) % 360 <= 360
						? "below"
						: "above";

				// Compute available horizontal space using wedge boundaries and viewport geometry.
				const horizontalSpace = calcHorizontalSpace(
					angle,
					cx,
					cy,
					endDeg,
					hemisphere,
					fstLabelLyr,
					labelCx,
					labelCy,
					layerWidth,
					lstLabelLyr,
					yOffset,
					startDeg,
				);

				// Prefer whichever direction yields more space.
				if (verticalSpace > horizontalSpace) {
					[abbrContent, abbrWidth] = calcOptLabel(
						2,
						txn.name,
						verticalSpace,
						true,
					);

					angle = midDeg <= 180 ? 270 + midDeg : 270 - midDeg;

					if (midDeg >= 180 && midDeg < 360) {
						angle = 360 - angle;
						abbrX = labelCx;
						frameTransformOrigin = "left";
						frameTransform = `translate(0%, -50%) rotate(${angle}deg)`;
					} else if (midDeg >= 0 && midDeg < 180) {
						abbrX = labelCx - abbrWidth;
						frameTransformOrigin = "right";
						frameTransform = `translate(-100%, -50%) rotate(${angle}deg)`;
					}
				} else {
					[abbrContent, abbrWidth] = calcOptLabel(
						2,
						txn.name,
						horizontalSpace - 6,
						true,
					);

					abbrX = labelCx - abbrWidth / 2;
					frameTransformOrigin = "center";
					frameTransform = `translate(-50%, -50%) rotate(${angle}deg)`;
				}
			}
		} else {
			// --- Case C: wedge is too small for a meaningful label. ---
			abbrContent = "";

			angle = midDeg <= 180 ? 270 + midDeg : 270 - midDeg;

			if (midDeg >= 180 && midDeg < 360) {
				angle = 360 - angle;
				abbrX = labelCx;
				frameTransformOrigin = "left";
				frameTransform = `translate(0%, -50%) rotate(${angle}deg)`;
			} else if (midDeg >= 0 && midDeg < 180) {
				abbrX = labelCx;
				frameTransformOrigin = "right";
				frameTransform = `translate(-100%, -50%) rotate(${angle}deg)`;
			}
		}

		// --- Store computed label object. Hide super-short abbreviations to avoid ugly "stubs". ---
		relTaxSet[key]["lblObj"] = {
			transform: `rotate(${round(angle)} ${originX} ${originY})`,
			y: y,
			abbrX: abbrContent.length < 4 ? 0 : abbrX,
			abbrContent: abbrContent.length < 4 ? "" : abbrContent,
			extContent: extContent,
			frameX: labelCx,
			frameY: labelCy,
			frameTransform: frameTransform,
			frameTransformOrigin: frameTransformOrigin,
		};
	}

	// --- Special case: root label in the center. ---
	if (relTaxSet?.[lyr]) {
		const [abbrContent, abbrWidth]: any[] = calcOptLabel(
			2,
			relTaxSet[lyr]["name"],
			2 * layerWidth,
			true,
		);

		relTaxSet[lyr]["lblObj"] = {
			transform: ``,
			y: cy + yOffset,
			extContent: relTaxSet[lyr]["name"],
			abbrContent: abbrContent.length < 4 ? "" : abbrContent,
			abbrX: abbrContent.length < 4 ? 0 : cx - abbrWidth / 2,
			frameX: cx,
			frameY: cy,
			frameTransformOrigin: "center",
			frameTransform: `translate(-50%, -50%) rotate(0deg)`,
		};
	}

	return relTaxSet;
};
