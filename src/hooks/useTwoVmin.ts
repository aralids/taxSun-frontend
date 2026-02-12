import { useEffect, useState } from "react";

function computeTwoVmin(): number {
	return Math.min(window.innerWidth, window.innerHeight) / 50;
}

/**
 * Returns 2vmin in pixels (i.e., min(viewportW, viewportH) / 50),
 * and updates on window resize.
 */
export function useTwoVmin(): number {
	const [twoVmin, setTwoVmin] = useState<number>(() => computeTwoVmin());

	useEffect(() => {
		const onResize = () => setTwoVmin(computeTwoVmin());
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	return twoVmin;
}
