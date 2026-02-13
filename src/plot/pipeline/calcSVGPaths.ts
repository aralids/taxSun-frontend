import { round, calculateArcEndpoints } from "../radialGeometry";

/**
 * Compute SVG path strings for each taxon in `relTaxSet` based on its precomputed
 * radial `layers` and angular `degrees` arrays.
 *
 * Expected inputs on each `relTaxSet[key]`:
 * - `layers`: number[]  (layer boundaries, in "layer index" units; multiplied by `layerWidth`)
 * - `degrees`: number[] (angular boundaries, in degrees)
 *
 * Output:
 * - Adds/overwrites `relTaxSet[key].path` with an SVG "d" path string describing:
 *   - a full circle (center node), or
 *   - a ring sector (partial arc), or
 *   - a full 360° ring (concentric circles) or an "irregular" ring (multiple arc segments)
 *
 * Notes / assumptions:
 * - `assignDegreesLayers` (or equivalent) has already populated `layers` and `degrees`.
 * - `calculateArcEndpoints(layerIndex, layerWidth, startDeg, endDeg, cx, cy)` returns an object
 *   with endpoints (x1,y1,x2,y2) and `radius`.
 * - This function mutates `relTaxSet` in place.
 *
 * @param cx - Center x coordinate of the plot.
 * @param cy - Center y coordinate of the plot.
 * @param layerWidth - Width (in pixels) per radial layer index.
 * @param relTaxSet - Taxon lookup map; each entry must have `layers` and `degrees`.
 *
 * @returns The same `relTaxSet` object with `path` assigned for each eligible taxon.
 */
export const calcSVGPaths = (
	cx: number,
	cy: number,
	layerWidth: number,
	relTaxSet: any,
) => {
	// --- For each taxon, build its SVG path ("d") string from layers + degrees. ---
	for (let key in relTaxSet) {
		let SVGPath = "";

		// --- Read geometry arrays produced by earlier pipeline stages. ---
		const layerArr = relTaxSet[key]?.["layers"];
		const degArr = relTaxSet[key]?.["degrees"];

		// (label is not used; just to emphasize the guard block)
		// --- Safety: skip taxa without valid geometry arrays. ---
		_have_layers_and_degrees: if (
			!Array.isArray(layerArr) ||
			!Array.isArray(degArr)
		)
			continue;
		if (layerArr.length === 0 || degArr.length === 0) continue;

		// --- Start/end angles and inner radius for the taxon's innermost layer boundary. ---
		const startDeg = degArr[0];
		const endDeg = degArr[degArr.length - 1];
		const degSpan = round(endDeg - startDeg);

		const innRad = round(layerArr[0] * layerWidth);

		// --- Case 1: central taxon (layer 0) is drawn as a full circle. ---
		if (layerArr[0] === 0) {
			SVGPath = `M ${cx}, ${cy} m -${layerWidth}, 0 a ${layerWidth},${layerWidth} 0 1,0 ${
				layerWidth * 2
			},0 a ${layerWidth},${layerWidth} 0 1,0 -${layerWidth * 2},0`;
		} else {
			// --- Case 2: taxon covers a full circle (360° or more). ---
			if (degSpan >= 360) {
				// Inner circle of the ring.
				const innerArcPath = `M ${cx}, ${cy} m -${innRad}, 0 a ${innRad},${innRad} 0 1,0 ${
					innRad * 2
				},0 a ${innRad},${innRad} 0 1,0 -${innRad * 2},0`;
				SVGPath = innerArcPath;

				// --- 2a) Simple ring: exactly two layer boundaries => two concentric circles. ---
				if (layerArr.length === 2) {
					const outerCirc = layerArr[1] * layerWidth;
					const midArcPath = `M ${cx}, ${cy} m -${outerCirc}, 0 a ${outerCirc},${outerCirc} 0 1,0 ${
						outerCirc * 2
					},0 a ${outerCirc},${outerCirc} 0 1,0 -${outerCirc * 2},0`;
					SVGPath = SVGPath + " " + midArcPath;
				}
				// --- 2b) Irregular full-circle ring: multiple boundaries => stitch arc segments. ---
				else {
					let midArc: any = {};

					// Walk layer boundaries from outer -> inner (excluding the innermost, since inner circle already drawn).
					for (let i = layerArr.length - 1; i >= 1; i--) {
						const curr = degArr[i];
						const prev = degArr[i - 1];

						// First segment uses "M" to move to start, subsequent segments use "L".
						const MorL = i === layerArr.length - 1 ? "M" : "L";

						// Compute arc endpoints at this radius and angle span.
						midArc = calculateArcEndpoints(
							layerArr[i],
							layerWidth,
							prev,
							curr,
							cx,
							cy,
						);

						// SVG arc flag: large-arc when angle span >= 180.
						let midArcPath = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
						if (Math.abs(curr - prev) >= 180) {
							midArcPath = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;
						}

						SVGPath = SVGPath + " " + midArcPath;
					}

					// Close shape by connecting inner/outer appropriately.
					const lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${cx},${
						cy + layerArr[layerArr.length - 1] * layerWidth
					}`;
					SVGPath = SVGPath + " " + lineInnertoOuter;
				}
			}
			// --- Case 3: taxon is a partial arc (does NOT complete full circle). ---
			else {
				// Inner arc from startDeg -> endDeg at inner radius.
				const innerArc: any = calculateArcEndpoints(
					layerArr[0],
					layerWidth,
					startDeg,
					endDeg,
					cx,
					cy,
				);

				// SVG arc flag: large-arc when angle span >= 180.
				let innerArcPath = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innRad},${innRad} 0 0 1 ${innerArc["x2"]},${innerArc["y2"]}`;
				if (Math.abs(endDeg - startDeg) >= 180) {
					innerArcPath = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innerArc["radius"]},${innerArc["radius"]} 0 1 1 ${innerArc["x2"]},${innerArc["y2"]}`;
				}

				SVGPath = innerArcPath;

				// Walk boundaries from outer -> inner and connect arcs with line segments.
				let midArc: any = {};
				for (let i = layerArr.length - 1; i >= 0; i--) {
					const curr = degArr[i];
					const prev = i === 0 ? startDeg : degArr[i - 1];

					midArc = calculateArcEndpoints(
						layerArr[i],
						layerWidth,
						prev,
						curr,
						cx,
						cy,
					);

					let midArcPath = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
					if (Math.abs(curr - prev) >= 180) {
						midArcPath = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;
					}

					SVGPath = SVGPath + " " + midArcPath;
				}

				// Close shape by connecting back to the inner arc start point.
				const lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${innerArc["x1"]},${innerArc["y1"]}`;
				SVGPath = SVGPath + " " + lineInnertoOuter;
			}
		}

		// --- Store the computed SVG path onto the taxon object. ---
		relTaxSet[key]["path"] = SVGPath;
	}

	// --- Return relTaxSet for convenience/chaining. ---
	return relTaxSet;
};
