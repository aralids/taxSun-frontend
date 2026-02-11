import { useEffect } from "react";

type SetContext = React.Dispatch<
	React.SetStateAction<{ coords: number[]; target: any }>
>;

export function useDismissContextMenu(setContext: SetContext) {
	useEffect(() => {
		const handleWindowClick = () => setContext({ coords: [], target: null });

		window.addEventListener("click", handleWindowClick);
		return () => window.removeEventListener("click", handleWindowClick);
	}, [setContext]);
}
