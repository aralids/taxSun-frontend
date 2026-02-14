// src/actions/plotActions.ts
import type React from "react";
import { getClickCoords } from "../plot/utils/dom";
import type { Stt } from "../state/state";
import type { ContextState } from "../hooks/useAppActions";

type Args = {
	setStt: React.Dispatch<React.SetStateAction<Stt>>;
	setContext: React.Dispatch<React.SetStateAction<ContextState>>;
	setHovered: React.Dispatch<React.SetStateAction<string>>;
};

export function makePlotActions({ setStt, setContext }: Args) {
	const plotHandleClick = (key: string) => {
		setStt((prev) => ({ ...prev, lyr: key }));
	};

	const shortcutsHandleClick = (key: string) => {
		setStt((prev) => ({ ...prev, lyr: key }));
	};

	const handlePlotRightClick = (
		event: { [x: string]: any; target: any },
		target: any,
	) => {
		event.preventDefault();
		const newCoords: any = getClickCoords(event);
		setContext({ coords: [newCoords.x, newCoords.y], target });
	};

	return {
		plotHandleClick,
		shortcutsHandleClick,
		handlePlotRightClick,
	};
}
