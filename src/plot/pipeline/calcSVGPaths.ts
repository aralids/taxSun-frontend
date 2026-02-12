import { round, calculateArcEndpoints } from "../radialGeometry";

export const calcSVGPaths = (
	cx: number,
	cy: number,
	layerWidth: number,
	relTaxSet: any,
) => {
	for (let key in relTaxSet) {
		let SVGPath = "";
		const layerArr = relTaxSet[key]["layers"];
		const degArr = relTaxSet[key]["degrees"];
		const startDeg = degArr[0];
		const endDeg = degArr[degArr.length - 1];
		const innRad = round(layerArr[0] * layerWidth);

		// If calculating central taxon shape - circle.
		if (layerArr[0] === 0) {
			SVGPath = `M ${cx}, ${cy} m -${layerWidth}, 0 a ${layerWidth},${layerWidth} 0 1,0 ${
				layerWidth * 2
			},0 a ${layerWidth},${layerWidth} 0 1,0 -${layerWidth * 2},0`;
		} else {
			// If the shape to be drawn completes a full circle...
			if (round(endDeg - startDeg) >= 360) {
				const innerArcPath = `M ${cx}, ${cy} m -${innRad}, 0 a ${innRad},${innRad} 0 1,0 ${
					innRad * 2
				},0 a ${innRad},${innRad} 0 1,0 -${innRad * 2},0`;
				SVGPath = innerArcPath;

				// ...and consists simply of two concentric circles.
				if (layerArr.length === 2) {
					let outerCirc = layerArr[1] * layerWidth;
					let midArcPath: string = `M ${cx}, ${cy} m -${outerCirc}, 0 a ${outerCirc},${outerCirc} 0 1,0 ${
						outerCirc * 2
					},0 a ${outerCirc},${outerCirc} 0 1,0 -${outerCirc * 2},0`;
					SVGPath = SVGPath + " " + midArcPath;
				}
				// ...and is of irregular shape.
				else {
					let midArc: any = {};
					for (let i = layerArr.length - 1; i >= 1; i--) {
						let curr = degArr[i];
						let prev = degArr[i - 1];
						let MorL = i === layerArr.length - 1 ? "M" : "L";
						midArc = calculateArcEndpoints(
							layerArr[i],
							layerWidth,
							prev,
							curr,
							cx,
							cy,
						);
						let midArcPath: string = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
						if (Math.abs(curr - prev) >= 180) {
							midArcPath = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;
						}
						SVGPath = SVGPath + " " + midArcPath;
					}
					let lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${cx},${
						cy + layerArr[layerArr.length - 1] * layerWidth
					}`;
					SVGPath = SVGPath + " " + lineInnertoOuter;
				}
			}
			// If the shape doesn't complete a full circle.
			else {
				let innerArc: any = calculateArcEndpoints(
					layerArr[0],
					layerWidth,
					startDeg,
					endDeg,
					cx,
					cy,
				);
				let innerArcPath: string = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innRad},${innRad} 0 0 1 ${innerArc["x2"]},${innerArc["y2"]}`;
				if (Math.abs(endDeg - startDeg) >= 180) {
					innerArcPath = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innerArc["radius"]},${innerArc["radius"]} 0 1 1 ${innerArc["x2"]},${innerArc["y2"]}`;
				}

				SVGPath = innerArcPath;
				let midArc: any = {};
				for (let i = layerArr.length - 1; i >= 0; i--) {
					let curr = degArr[i];
					let prev = i === 0 ? startDeg : degArr[i - 1];
					midArc = calculateArcEndpoints(
						layerArr[i],
						layerWidth,
						prev,
						curr,
						cx,
						cy,
					);
					let midArcPath: string = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
					if (Math.abs(curr - prev) >= 180) {
						midArcPath = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;
					}
					SVGPath = SVGPath + " " + midArcPath;
				}

				let lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${innerArc["x1"]},${innerArc["y1"]}`;
				SVGPath = SVGPath + " " + lineInnertoOuter;
			}
		}
		relTaxSet[key]["path"] = SVGPath;
	}
	return relTaxSet;
};
