import { round, sin, cos } from "./math";
import {
	getFourCorners,
	lineIntersect,
	pointOnLine,
	lineCircleCollision,
	lineLength,
} from "./geometry";
import { calibri1px } from "../../data/staticData";

/**
 * Computes the horizontal space (in pixels) available for a label along a radial plot boundary.
 *
 * High-level idea:
 * - Treat the label as a rotated rectangle (centered at `labelCx,labelCy` with half-height `halfHeight`).
 * - Compute where the relevant plot boundary lines (at `startDeg` and `endDeg`) intersect that rectangle.
 * - If the primary intersection fails / lies outside the expected segment, fall back to line–circle intersections.
 * - Return the distance between the two intersection points as the usable horizontal space.
 *
 * @param angle - Label rotation angle (degrees), used when computing the rotated label rectangle corners.
 * @param cx - Plot center x-coordinate (pixels).
 * @param cy - Plot center y-coordinate (pixels).
 * @param endDeg - End angle (degrees) delimiting the label span in the plot.
 * @param hemisphere - Which side of the label rectangle to intersect ("above" or "below").
 * @param fstLabelLyr - Inner layer index at which label span begins.
 * @param labelCx - Label rectangle center x-coordinate (pixels).
 * @param labelCy - Label rectangle center y-coordinate (pixels).
 * @param layerWidth - Width of one plot layer (pixels).
 * @param lstLabelLyr - Outer layer index at which label span ends.
 * @param halfHeight - Half the label rectangle height (pixels).
 * @param startDeg - Start angle (degrees) delimiting the label span in the plot.
 * @returns The distance (pixels) between the two computed intersection points, i.e. available horizontal space.
 */
export function calcHorizontalSpace(
	angle: number,
	cx: number,
	cy: number,
	endDeg: number,
	hemisphere: string,
	fstLabelLyr: number,
	labelCx: number,
	labelCy: number,
	layerWidth: number,
	lstLabelLyr: number,
	halfHeight: number,
	startDeg: number,
) {
	const startFstCornerX = round(fstLabelLyr * layerWidth * cos(startDeg)) + cx;
	const startFstCornerY = round(-fstLabelLyr * layerWidth * sin(startDeg)) + cy;
	const startLstCornerX = round(lstLabelLyr * layerWidth * cos(startDeg)) + cx;
	const startLstCornerY = round(-lstLabelLyr * layerWidth * sin(startDeg)) + cy;

	const endFstCornerX = round(fstLabelLyr * layerWidth * cos(endDeg)) + cx;
	const endFstCornerY = round(-fstLabelLyr * layerWidth * sin(endDeg)) + cy;
	const endLstCornerX = round(lstLabelLyr * layerWidth * cos(endDeg)) + cx;
	const endLstCornerY = round(-lstLabelLyr * layerWidth * sin(endDeg)) + cy;

	let fourPoints: any = getFourCorners(
		labelCy - halfHeight,
		labelCy + halfHeight,
		0,
		window.innerWidth,
		labelCx,
		labelCy,
		angle,
	);

	let p1: any, p2: any;
	if (hemisphere === "above") {
		p1 = lineIntersect(
			startFstCornerX,
			startFstCornerY,
			startLstCornerX,
			startLstCornerY,
			fourPoints["bottomLeft"][0],
			fourPoints["bottomLeft"][1],
			fourPoints["bottomRight"][0],
			fourPoints["bottomRight"][1],
		);

		p2 = lineIntersect(
			endFstCornerX,
			endFstCornerY,
			endLstCornerX,
			endLstCornerY,
			fourPoints["bottomLeft"][0],
			fourPoints["bottomLeft"][1],
			fourPoints["bottomRight"][0],
			fourPoints["bottomRight"][1],
		);
	} else if (hemisphere === "below") {
		p1 = lineIntersect(
			startFstCornerX,
			startFstCornerY,
			startLstCornerX,
			startLstCornerY,
			fourPoints["topLeft"][0],
			fourPoints["topLeft"][1],
			fourPoints["topRight"][0],
			fourPoints["topRight"][1],
		);

		p2 = lineIntersect(
			endFstCornerX,
			endFstCornerY,
			endLstCornerX,
			endLstCornerY,
			fourPoints["topLeft"][0],
			fourPoints["topLeft"][1],
			fourPoints["topRight"][0],
			fourPoints["topRight"][1],
		);
	}

	if (p1 !== null && pointOnLine(p1.y, startFstCornerY, startLstCornerY)) {
	} else {
		if (hemisphere === "above") {
			[p1, p2] = lineCircleCollision(
				cx,
				cy,
				lstLabelLyr * layerWidth,
				fourPoints["topLeft"][0],
				fourPoints["topLeft"][1],
				fourPoints["topRight"][0],
				fourPoints["topRight"][1],
			);
		} else if (hemisphere === "below") {
			[p1, p2] = lineCircleCollision(
				cx,
				cy,
				lstLabelLyr * layerWidth,
				fourPoints["bottomLeft"][0],
				fourPoints["bottomLeft"][1],
				fourPoints["bottomRight"][0],
				fourPoints["bottomRight"][1],
			);
		}
	}

	return lineLength(p1.x, p1.y, p2.x, p2.y);
}

/**
 * Produces an "optimal" label string that fits within a given horizontal space (in pixels).
 *
 * Uses a pre-measured per-character width table (`calibri1px`) scaled by the computed font size in pixels
 * to estimate rendered text width. If the full label doesn't fit, it truncates and appends an ellipsis:
 * - internal === false  -> "..."
 * - internal === true   -> "."
 *
 * @param fontSizeInVmin - Font size expressed in vmin units (relative to viewport).
 * @param fullLabel - Original label text to display.
 * @param spaceInPx - Available horizontal space in pixels.
 * @param internal - If true, use a single-dot suffix (.) instead of three dots (...).
 * @returns Tuple: [optimizedLabel, estimatedLabelWidthInPx]
 */
export function calcOptLabel(
	fontSizeInVmin: number,
	fullLabel: string,
	spaceInPx: number,
	internal = false,
) {
	const fontSizeInPx =
		Math.min(window.innerWidth, window.innerHeight) / (100 / fontSizeInVmin);

	const labelWidth = fullLabel
		.split("")
		.reduce((acc, letter) => acc + calibri1px[letter] * fontSizeInPx, 0);

	if (labelWidth <= spaceInPx) {
		return [fullLabel, labelWidth];
	} else {
		let optLabel = "";
		let optLabelWidth = internal
			? calibri1px["."] * fontSizeInPx
			: 3 * calibri1px["."] * fontSizeInPx;
		let pointer = 0;
		while (optLabelWidth <= spaceInPx && pointer < fullLabel.length) {
			optLabel += fullLabel[pointer];
			optLabelWidth += calibri1px[fullLabel[pointer]] * fontSizeInPx;
			pointer++;
		}

		optLabelWidth -= calibri1px[optLabel[optLabel.length - 1]] * fontSizeInPx;
		optLabel = internal
			? optLabel.slice(0, -1) + "."
			: optLabel.slice(0, -1) + "...";
		return [optLabel, round(optLabelWidth)];
	}
}
