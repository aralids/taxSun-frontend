/**
 * Extracts absolute page coordinates (x, y) from a mouse event.
 *
 * Supports both modern `pageX/pageY` and older `clientX/clientY`
 * + scroll offset fallback for legacy browser compatibility.
 *
 * @param e - Mouse event object (e.g., from onClick or addEventListener).
 *            If undefined, falls back to `window.event` (legacy IE behavior).
 *
 * @returns Object containing absolute page coordinates:
 *          `{ x: number, y: number }`
 *
 * @example
 * element.addEventListener("click", (e) => {
 *   const { x, y } = getClickCoords(e);
 *   console.log(x, y);
 * });
 */
export function getClickCoords(e: MouseEvent | undefined): {
	x: number;
	y: number;
} {
	let posx = 0;
	let posy = 0;

	if (!e) {
		e = window.event as MouseEvent;
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
