// src/hooks/appActions/controlActions.ts
import { useCallback } from "react";

import type { Stt } from "../state/state";
import type { ViewMode } from "../plot/computePlotState";

type Args = {
	setStt: React.Dispatch<React.SetStateAction<Stt>>;
};

export function makeControlActions({ setStt }: Args) {
	const collHandleChange = useCallback(() => {
		setStt((prev) => ({ ...prev, collapse: !prev.collapse }));
	}, [setStt]);

	const eValueAppliedHandleChange = useCallback(() => {
		setStt((prev) => ({ ...prev, eValueApplied: !prev.eValueApplied }));
	}, [setStt]);

	const eValueHandleChange = useCallback(
		(value: string) => {
			setStt((prev) => ({ ...prev, eValueInput: value }));
		},
		[setStt],
	);

	const eValueHandleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key !== "Enter") return;
			event.preventDefault();

			setStt((prev) => {
				const parsed = Number(prev.eValueInput);
				if (Number.isNaN(parsed)) return prev;
				return { ...prev, eValue: parsed };
			});
		},
		[setStt],
	);

	const viewHandleChange = useCallback(
		(newView: ViewMode) => {
			setStt((prev) => ({ ...prev, view: newView }));
		},
		[setStt],
	);

	return {
		collHandleChange,
		eValueAppliedHandleChange,
		eValueHandleChange,
		eValueHandleKeyDown,
		viewHandleChange,
	};
}
