// src/actions/controlActions.ts
import type React from "react";
import type { Stt } from "../state/state";
import type { ViewMode } from "../plot/computePlotState";

type Args = {
	setStt: React.Dispatch<React.SetStateAction<Stt>>;
};

export function makeControlActions({ setStt }: Args) {
	const collHandleChange = () => {
		setStt((prev) => ({ ...prev, collapse: !prev.collapse }));
	};

	const eValueAppliedHandleChange = () => {
		setStt((prev) => ({ ...prev, eValueApplied: !prev.eValueApplied }));
	};

	const eValueHandleChange = (value: string) => {
		setStt((prev) => ({ ...prev, eValueInput: value }));
	};

	const eValueHandleKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key !== "Enter") return;
		event.preventDefault();

		setStt((prev) => {
			const parsed = Number(prev.eValueInput);
			if (Number.isNaN(parsed)) return prev;
			return { ...prev, eValue: parsed };
		});
	};

	const viewHandleChange = (newView: ViewMode) => {
		setStt((prev) => ({ ...prev, view: newView }));
	};

	return {
		collHandleChange,
		eValueAppliedHandleChange,
		eValueHandleChange,
		eValueHandleKeyDown,
		viewHandleChange,
	};
}
