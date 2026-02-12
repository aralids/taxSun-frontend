import { twoVminHeights } from "../../data/staticData";
import {
	round,
	lineLength,
	sin,
	cos,
	calcOptLabel,
	calcHorizontalSpace,
} from "../radialGeometry";

export const label = (
	cx: number,
	cy: number,
	layerWidth: number,
	lyr: string,
	minRankPattern: string[],
	relTaxSet: any,
) => {
	const twoVmin = Math.min(window.innerWidth, window.innerHeight) / (100 / 2);
	const yOffset = twoVminHeights[round(twoVmin, 1)] / 4;
	for (let key in relTaxSet) {
		const txn = relTaxSet[key];
		const startDeg = txn["degrees"][0];
		const endDeg = txn["degrees"][txn["degrees"].length - 1];
		const midDeg = startDeg + (endDeg - startDeg) / 2;
		const fstLabelLyr = minRankPattern.indexOf(txn.rank);
		const midLyr = fstLabelLyr + 0.333;

		const labelCx = round(midLyr * layerWidth * cos(midDeg)) + cx;
		const labelCy = round(-midLyr * layerWidth * sin(midDeg)) + cy;
		const pointOnStartBorderX = round(midLyr * layerWidth * cos(startDeg)) + cx;
		const pointOnStartBorderY =
			round(-midLyr * layerWidth * sin(startDeg)) + cy;
		const pointOnEndBorderX = round(midLyr * layerWidth * cos(endDeg)) + cx;
		const pointOnEndBorderY = round(-midLyr * layerWidth * sin(endDeg)) + cy;

		const range = txn["degrees"][txn["degrees"].length - 1] - txn["degrees"][0];
		const shapeWidth = lineLength(
			pointOnStartBorderX,
			pointOnStartBorderY,
			pointOnEndBorderX,
			pointOnEndBorderY,
		);

		const perc = round((txn.totCount / relTaxSet[lyr].totCount) * 100);
		const [extContent, extWidth]: any[] = calcOptLabel(
			2,
			`${txn.name} ${perc}%`,
			Infinity,
		);
		extWidth;
		const y = labelCy + yOffset;
		const originX = labelCx;
		const originY = labelCy;

		let frameTransformOrigin = "center";
		let frameTransform = "";

		let angle, abbrContent: any, abbrX, abbrWidth: any;
		if (!(shapeWidth < twoVmin && range < 180)) {
			// If the wedge touches the edge of the plot and is simple-shaped.
			if (txn.unaCount > 0 && txn.layers.length === 2) {
				let spaceInPx =
					0.666 * layerWidth +
					(txn.layers[1] - fstLabelLyr - 1) * layerWidth +
					4 * 15;
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
				// If the wedge is internal, measure both vertical and horizontal available space.
				//console.log(key);
				const lstLabelLyr = Math.min.apply(Math, txn.layers.slice(1));
				const verticalSpace = (lstLabelLyr - fstLabelLyr - 0.4) * layerWidth;

				angle =
					(270 - midDeg + 360) % 360 > 180 && (270 - midDeg + 360) % 360 <= 360
						? midDeg % 360
						: (midDeg + 180) % 360;
				const hemisphere =
					(270 - midDeg + 360) % 360 > 180 && (270 - midDeg + 360) % 360 <= 360
						? "below"
						: "above";

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
			// If the wedge is too small for any label.
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

		//console.log("\n");

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

	return relTaxSet;
};
