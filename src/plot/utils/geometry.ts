import { round, cos, sin } from "./math";

/**
 * Calculates the Cartesian endpoints of an arc segment
 * for a given radial layer in a circular plot.
 *
 * Angles are interpreted in degrees and converted using
 * the custom `cos` and `sin` helpers from ./math.
 * Y coordinates are inverted to match screen coordinate space.
 *
 * @param layer - Radial layer index (multiplied by layerWidthInPx to get radius).
 * @param layerWidthInPx - Thickness of a single layer in pixels.
 * @param deg1 - Start angle in degrees.
 * @param deg2 - End angle in degrees.
 * @param cx - Center x-coordinate of the plot.
 * @param cy - Center y-coordinate of the plot.
 * @returns Object containing arc endpoints and radius.
 */
export function calculateArcEndpoints(
	layer: number,
	layerWidthInPx: number,
	deg1: number,
	deg2: number,
	cx: number,
	cy: number,
): object {
	var radius: number = layer * layerWidthInPx;
	var x1: number = round(radius * cos(deg1) + cx);
	var y1: number = round(-radius * sin(deg1) + cy);
	var x2: number = round(radius * cos(deg2) + cx);
	var y2: number = round(-radius * sin(deg2) + cy);
	return { x1: x1, y1: y1, x2: x2, y2: y2, radius: round(radius) };
}

/**
 * Computes the width of each radial layer in pixels,
 * based on a rectangular bounding box and number of layers.
 *
 * Applies a fixed padding and ensures a minimum layer width.
 *
 * @param x - Left position of the bounding box.
 * @param y - Top position of the bounding box.
 * @param width - Width of the bounding box.
 * @param height - Height of the bounding box.
 * @param minRankPattern - Array representing the layers (its length determines layer count).
 * @returns Tuple: [layerWidthInPx, centerX, centerY]
 */
export function getLayerWidthInPx(
	x: number,
	y: number,
	width: number,
	height: number,
	minRankPattern: string[],
) {
	const cx = x + width / 2;
	const cy = y + height / 2;
	const dpmm = 4;
	const plotPadding = dpmm * 20;
	const smallerDimSize = Math.min(cx * (1 - 0.4), cy) - plotPadding;
	const layerNumber = minRankPattern.length;

	return [Math.max(smallerDimSize / layerNumber, dpmm * 1), cx, cy];
}

/**
 * Computes the intersection point of two infinite lines
 * defined by (x1,y1)-(x2,y2) and (x3,y3)-(x4,y4).
 *
 * Returns null if lines are parallel.
 *
 * @returns Intersection point {x, y} or null.
 */
export function lineIntersect(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	x3: number,
	y3: number,
	x4: number,
	y4: number,
) {
	var ua,
		//ub,
		denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
	if (denom == 0) {
		return null;
	}
	ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;

	return {
		x: x1 + ua * (x2 - x1),
		y: y1 + ua * (y2 - y1),
	};
}

/**
 * Computes the Euclidean distance between two points.
 *
 * @returns Distance between (x1,y1) and (x2,y2).
 */
export function lineLength(x1: number, y1: number, x2: number, y2: number) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculates the four corner coordinates of a rectangle
 * after rotation around a center point.
 *
 * Rotation angle is given in degrees.
 * Includes a Firefox-specific fallback for undefined angle.
 *
 * @param top - Top y-coordinate of rectangle.
 * @param bottom - Bottom y-coordinate.
 * @param left - Left x-coordinate.
 * @param right - Right x-coordinate.
 * @param cx - Center x-coordinate for rotation.
 * @param cy - Center y-coordinate for rotation.
 * @param angle - Rotation angle in degrees.
 * @returns Object containing topLeft, topRight, bottomLeft, bottomRight coordinates.
 */
export function getFourCorners(
	top: number,
	bottom: number,
	left: number,
	right: number,
	cx: number,
	cy: number,
	angle: number,
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

/**
 * Checks whether a point's y-coordinate lies within the vertical
 * bounds of a line segment (with ±1 rounding tolerance).
 *
 * @param py - Point y-coordinate.
 * @param ly1 - Line start y-coordinate.
 * @param ly2 - Line end y-coordinate.
 * @returns True if within bounds, otherwise false.
 */
export function pointOnLine(py: number, ly1: number, ly2: number) {
	if (
		Math.round(py) >= Math.round(Math.min(ly1, ly2) - 1) &&
		Math.round(py) <= Math.round(Math.max(ly1, ly2) + 1)
	) {
		return true;
	} else {
		return false;
	}
}

/**
 * Computes the intersection points between a circle
 * and a line defined by two points.
 *
 * Uses quadratic solution in parametric line form.
 *
 * @param cx - Circle center x-coordinate.
 * @param cy - Circle center y-coordinate.
 * @param radius - Circle radius.
 * @param lx1 - Line start x-coordinate.
 * @param ly1 - Line start y-coordinate.
 * @param lx2 - Line end x-coordinate.
 * @param ly2 - Line end y-coordinate.
 * @returns Array of two intersection points (may contain NaN if no real intersection).
 */
export function lineCircleCollision(
	cx: number,
	cy: number,
	radius: number,
	lx1: number,
	ly1: number,
	lx2: number,
	ly2: number,
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
