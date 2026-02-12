// src/hooks/appActions/plotActions.ts
import { useCallback } from "react";

import { getClickCoords } from "../plot/radialGeometry";
import type { Stt } from "../state/state";
import type { ContextState } from "../hooks/useAppActions";

type Args = {
	setStt: React.Dispatch<React.SetStateAction<Stt>>;
	setContext: React.Dispatch<React.SetStateAction<ContextState>>;
	setHovered: React.Dispatch<React.SetStateAction<string>>;
};

export function makePlotActions({ setStt, setContext }: Args) {
	const plotHandleClick = useCallback(
		(key: string) => {
			setStt((prev) => ({ ...prev, lyr: key }));
		},
		[setStt],
	);

	const shortcutsHandleClick = useCallback(
		(key: string) => {
			setStt((prev) => ({ ...prev, lyr: key }));
		},
		[setStt],
	);

	const handlePlotRightClick = useCallback(
		(event: { [x: string]: any; target: any }, target: any) => {
			event.preventDefault();
			const newCoords: any = getClickCoords(event);
			setContext({ coords: [newCoords.x, newCoords.y], target });
		},
		[setContext],
	);

	return {
		plotHandleClick,
		shortcutsHandleClick,
		handlePlotRightClick,
	};
}
