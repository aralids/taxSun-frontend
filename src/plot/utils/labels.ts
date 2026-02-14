import { round, sin, cos } from "./math";
import {
	getFourCorners,
	lineIntersect,
	pointOnLine,
	lineCircleCollision,
	lineLength,
} from "./geometry";
import { calibri1px } from "../../data/staticData";

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

	//console.log("p1: ", p1);
	//console.log("p2: ", p2);
	//console.log("lineLength: ", lineLength(p1.x, p1.y, p2.x, p2.y));

	return lineLength(p1.x, p1.y, p2.x, p2.y);
}

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
