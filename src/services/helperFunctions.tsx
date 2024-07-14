import { calibri1px } from "./predefinedObjects";

function createPalette(colorOffset: number = 7): string[] {
	let newColors: string[] = [];
	for (let i = 0; i < 7; i++) {
		var r = Math.sin(0.3 * colorOffset + 4) * 55 + 200;
		var g = Math.sin(0.3 * colorOffset + 2) * 55 + 200;
		var b = Math.sin(0.3 * colorOffset) * 55 + 200;
		var newColor = `rgb(${round(r, 0)}, ${round(g, 0)}, ${round(b, 0)})`;
		newColors.push(newColor);
		colorOffset += 3;
	}
	return newColors;
}

function round(number: number, decimal = 3): number {
	return Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

function radians(degrees: number): number {
	degrees = 270 - degrees;
	var pi = Math.PI;
	return degrees * (pi / 180);
}

function cos(number: number): number {
	return Math.cos(radians(number));
}

function sin(number: number): number {
	return Math.sin(radians(number));
}

function handleMouseMove(event: any): void {
	var eventDoc, doc, body;

	event = event || window.event; // IE-ism
	if (event.pageX == null && event.clientX != null) {
		eventDoc = (event.target && event.target.ownerDocument) || document;
		doc = eventDoc.documentElement;
		body = eventDoc.body;

		event.pageX =
			event.clientX +
			((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
			((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
		event.pageY =
			event.clientY +
			((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
			((doc && doc.clientTop) || (body && body.clientTop) || 0);
	}

	console.log("cursorX, cursorY: ", event.pageX, event.pageY);
}

function hexToRGB(hex: string): string {
	var aRgbHex: any = hex.match(/.{1,2}/g);
	var aRgb = [
		parseInt(aRgbHex[0], 16),
		parseInt(aRgbHex[1], 16),
		parseInt(aRgbHex[2], 16),
	];
	return `rgb(${aRgb[0]}, ${aRgb[1]}, ${aRgb[2]})`;
}

function midColor(rgb1: string, rgb2: string, coef: number): string {
	var coef = coef / 2;
	var rgb1List: number[] =
		rgb1.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];
	var rgb2List: number[] =
		rgb2.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];
	var newRgb: number[] = [];
	for (let i = 0; i < 3; i++) {
		var newNum =
			rgb1List[i] < rgb2List[i]
				? rgb1List[i] + coef * (rgb2List[i] - rgb1List[i])
				: rgb1List[i] - coef * (rgb1List[i] - rgb2List[i]);
		newRgb.push(Math.round(newNum));
	}
	return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}

function tintify(rgb: string, tintFactor: number): string {
	var rgbList: number[] =
		rgb.match(/\d+/g)?.map((item) => parseInt(item)) ?? [];
	var newRgb: number[] = [];
	for (let i = 0; i < 3; i++) {
		var newNum = rgbList[i] + (255 - rgbList[i]) * tintFactor;
		newRgb.push(Math.round(newNum));
	}
	return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}

function lineIntersect(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	x3: number,
	y3: number,
	x4: number,
	y4: number
) {
	var ua,
		ub,
		denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
	if (denom == 0) {
		return null;
	}
	ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
	ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

	return {
		x: x1 + ua * (x2 - x1),
		y: y1 + ua * (y2 - y1),
	};
}

function lineLength(x1: number, y1: number, x2: number, y2: number) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getFourCorners(
	top: number,
	bottom: number,
	left: number,
	right: number,
	cx: number,
	cy: number,
	angle: number
): object {
	if (!angle && navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
		angle = 0;
	}
	var topLeft: number[] = [
		(left - cx) * Math.cos(angle * (Math.PI / 180)) -
			(top - cy) * Math.sin(angle * (Math.PI / 180)) +
			cx,
		(left - cx) * Math.sin(angle * (Math.PI / 180)) +
			(top - cy) * Math.cos(angle * (Math.PI / 180)) +
			cy,
	];
	var topRight: number[] = [
		(right - cx) * Math.cos(angle * (Math.PI / 180)) -
			(top - cy) * Math.sin(angle * (Math.PI / 180)) +
			cx,
		(right - cx) * Math.sin(angle * (Math.PI / 180)) +
			(top - cy) * Math.cos(angle * (Math.PI / 180)) +
			cy,
	];
	var bottomLeft: number[] = [
		(left - cx) * Math.cos(angle * (Math.PI / 180)) -
			(bottom - cy) * Math.sin(angle * (Math.PI / 180)) +
			cx,
		(left - cx) * Math.sin(angle * (Math.PI / 180)) +
			(bottom - cy) * Math.cos(angle * (Math.PI / 180)) +
			cy,
	];
	var bottomRight: number[] = [
		(right - cx) * Math.cos(angle * (Math.PI / 180)) -
			(bottom - cy) * Math.sin(angle * (Math.PI / 180)) +
			cx,
		(right - cx) * Math.sin(angle * (Math.PI / 180)) +
			(bottom - cy) * Math.cos(angle * (Math.PI / 180)) +
			cy,
	];
	return {
		topLeft: topLeft,
		topRight: topRight,
		bottomLeft: bottomLeft,
		bottomRight: bottomRight,
	};
}

function getLayerWidthInPx(
	x: number,
	y: number,
	width: number,
	height: number,
	minRankPattern: string[]
) {
	const cx = x + width / 2;
	const cy = y + height / 2;
	const dpmm = 4;
	const plotPadding = dpmm * 20;
	const smallerDimSize = Math.min(cx * (1 - 0.4), cy) - plotPadding;
	const layerNumber = minRankPattern.length;

	return [Math.max(smallerDimSize / layerNumber, dpmm * 1), cx, cy];
}

function makeID(length: number) {
	let result = "";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

function enableEValue(median: number) {
	document.getElementById("e-input")!.removeAttribute("disabled");
	document.getElementById("e-label")!.style.color = "black";
	let eText: any = document.getElementById("e-text")!;
	eText.removeAttribute("disabled");
	eText.value = median;
}

function disableEValue() {
	document.getElementById("e-input")!.setAttribute("disabled", "disabled");
	document.getElementById("e-label")!.style.color = "grey";
	let eText: any = document.getElementById("e-text")!;
	eText.setAttribute("disabled", "disabled");
	eText.value = "";
}

function showContextMenu(e: any) {
	e.preventDefault();
	document.getElementById("context-menu")!.style.display = "block";
	positionContextMenu(e);
}

function hideContextMenu() {
	document.getElementById("context-menu")!.style.display = "none";
}

// Get the position of the right click in window and returns the X and Y coordinates
function getClickCoords(e: any) {
	var posx = 0;
	var posy = 0;

	if (!e) {
		var e: any = window.event;
	}

	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx =
			e.clientX +
			document.body.scrollLeft +
			document.documentElement.scrollLeft;
		posy =
			e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return { x: posx, y: posy };
}

// Position the Context Menu in right position.
function positionContextMenu(e: any) {
	let menu: any = document.getElementById("context-menu")!;
	let clickCoords = getClickCoords(e);
	let clickCoordsX = clickCoords.x;
	let clickCoordsY = clickCoords.y;

	let menuWidth = menu.offsetWidth;
	let menuHeight = menu.offsetHeight;
	let windowWidth = window.innerWidth;
	let windowHeight = window.innerHeight;

	if (windowWidth - clickCoordsX < menuWidth) {
		menu.style.left = windowWidth - menuWidth + "px";
	} else {
		menu.style.left = clickCoordsX + "px";
	}

	if (windowHeight - clickCoordsY < menuHeight) {
		menu.style.top = windowHeight - menuHeight + "px";
	} else {
		menu.style.top = clickCoordsY - menuHeight + "px";
	}

	menu.setAttribute("taxon", e.target["id"]);
}

function findRealName(index: number, namesArray: any[], name: string) {
	if (namesArray.length === 0) {
		return name;
	}
	for (let i = namesArray.length - 2; i >= 0; i--) {
		if (index > namesArray[i][1]) {
			return namesArray[i + 1][0];
		}
	}
	return namesArray[0][0];
}

function downloadSVGasTextFile(
	fileName: string,
	taxonName: string,
	layerName: string,
	modeName: string,
	collapseName: string
) {
	const base64doc = btoa(
		unescape(encodeURIComponent(document.querySelector("svg")!.outerHTML))
	);
	const a = document.createElement("a");
	const e = new MouseEvent("click");

	a.download = `${fileName}_${taxonName}${layerName}_${modeName}_${collapseName}.svg`;
	a.href = "data:text/html;base64," + base64doc;
	a.dispatchEvent(e);
}

// Returns a set of arrays, where each array contains all elements that will be on the same level in the plot.
function getLayers(
	lineagesCopy: string[][],
	unique: boolean = false
): string[][] {
	var longestLineageLength: number = Math.max(
		...lineagesCopy.map((item) => item.length)
	); // get the length of the longest lineage, i.e. how many layers the plot will have
	var layers: string[][] = [];
	for (let i = 0; i < longestLineageLength; i++) {
		var layer: string[] = [];
		for (let j = 0; j < lineagesCopy.length; j++) {
			layer.push(lineagesCopy[j][i]);
		}
		if (unique) {
			layer = layer.filter(
				(value, index, self) => Boolean(value) && self.indexOf(value) === index
			);
		}
		layers.push(layer);
	}
	return layers;
}

function calculateArcEndpoints(
	layer: number,
	layerWidthInPx: number,
	deg1: number,
	deg2: number,
	cx: number,
	cy: number
): object {
	var radius: number = layer * layerWidthInPx;
	var x1: number = round(radius * cos(deg1) + cx);
	var y1: number = round(-radius * sin(deg1) + cy);
	var x2: number = round(radius * cos(deg2) + cx);
	var y2: number = round(-radius * sin(deg2) + cy);
	return { x1: x1, y1: y1, x2: x2, y2: y2, radius: round(radius) };
}

function calcOptLabel(
	fontSizeInVmin: number,
	fullLabel: string,
	spaceInPx: number,
	internal = false
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

function calcHorizontalSpace(
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
	startDeg: number
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
		angle
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
			fourPoints["bottomRight"][1]
		);

		p2 = lineIntersect(
			endFstCornerX,
			endFstCornerY,
			endLstCornerX,
			endLstCornerY,
			fourPoints["bottomLeft"][0],
			fourPoints["bottomLeft"][1],
			fourPoints["bottomRight"][0],
			fourPoints["bottomRight"][1]
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
			fourPoints["topRight"][1]
		);

		p2 = lineIntersect(
			endFstCornerX,
			endFstCornerY,
			endLstCornerX,
			endLstCornerY,
			fourPoints["topLeft"][0],
			fourPoints["topLeft"][1],
			fourPoints["topRight"][0],
			fourPoints["topRight"][1]
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
				fourPoints["topRight"][1]
			);
		} else if (hemisphere === "below") {
			[p1, p2] = lineCircleCollision(
				cx,
				cy,
				lstLabelLyr * layerWidth,
				fourPoints["bottomLeft"][0],
				fourPoints["bottomLeft"][1],
				fourPoints["bottomRight"][0],
				fourPoints["bottomRight"][1]
			);
		}
	}

	//console.log("p1: ", p1);
	//console.log("p2: ", p2);
	//console.log("lineLength: ", lineLength(p1.x, p1.y, p2.x, p2.y));

	return lineLength(p1.x, p1.y, p2.x, p2.y);
}

function pointOnLine(py: number, ly1: number, ly2: number) {
	if (
		Math.round(py) >= Math.round(Math.min(ly1, ly2) - 1) &&
		Math.round(py) <= Math.round(Math.max(ly1, ly2) + 1)
	) {
		return true;
	} else {
		return false;
	}
}

function lineCircleCollision(
	cx: number,
	cy: number,
	radius: number,
	lx1: number,
	ly1: number,
	lx2: number,
	ly2: number
) {
	const baX = lx2 - lx1;
	const baY = ly2 - ly1;
	const caX = cx - lx1;
	const caY = cy - ly1;

	const a = baX * baX + baY * baY;
	const bBy2 = baX * caX + baY * caY;
	const c = caX * caX + caY * caY - radius * radius;

	const pBy2 = bBy2 / a;
	const q = c / a;

	const disc = pBy2 * pBy2 - q;
	const tmpSqrt = Math.sqrt(disc);
	const abScalingFactor1 = -pBy2 + tmpSqrt;
	const abScalingFactor2 = -pBy2 - tmpSqrt;

	return [
		{ x: lx1 - baX * abScalingFactor1, y: ly1 - baY * abScalingFactor1 },
		{ x: lx1 - baX * abScalingFactor2, y: ly1 - baY * abScalingFactor2 },
	];
}

export {
	calcOptLabel,
	createPalette,
	radians,
	round,
	sin,
	cos,
	handleMouseMove,
	hexToRGB,
	midColor,
	tintify,
	lineIntersect,
	lineLength,
	getFourCorners,
	getLayerWidthInPx,
	makeID,
	enableEValue,
	disableEValue,
	showContextMenu,
	hideContextMenu,
	findRealName,
	downloadSVGasTextFile,
	getLayers,
	calculateArcEndpoints,
	calcHorizontalSpace,
};
