import { useEffect } from "react";

type SetViewport = React.Dispatch<
	React.SetStateAction<{ w: number; h: number }>
>;

export function getViewport() {
	return {
		w: window.innerWidth,
		h: window.innerHeight,
	};
}

export function useViewport(setViewport: SetViewport) {
	useEffect(() => {
		const updateOnResize = () => setViewport(getViewport());

		window.addEventListener("resize", updateOnResize);
		return () => window.removeEventListener("resize", updateOnResize);
	}, [setViewport]);
}
