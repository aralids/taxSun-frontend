// src/hooks/useAppActions.ts
import { useEffect, useRef, useMemo } from "react";

import type { Stt } from "../state/state";
import type { PlotModel } from "../plot/computeFromState";

import { makePlotActions } from "../actions/plotActions";
import { makeUploadActions } from "../actions/uploadActions";
import { makeControlActions } from "../actions/controlActions";
import { makeExportActions } from "../actions/exportActions";
import { makeIdActions } from "../actions/idActions";

export type ContextState = {
	coords: any[];
	target: any;
};

type UseAppActionsArgs = {
	stt: Stt;
	setStt: React.Dispatch<React.SetStateAction<Stt>>;

	setContext: React.Dispatch<React.SetStateAction<ContextState>>;
	setHovered: React.Dispatch<React.SetStateAction<string>>;
	setErrorMessageDisplay: React.Dispatch<React.SetStateAction<boolean>>;

	tsvFormRef: React.RefObject<HTMLInputElement | null>;
	faaFormRef: React.RefObject<HTMLInputElement | null>;
	plotRef: React.RefObject<SVGSVGElement | null>;

	// latest derived plot model (relTaxSet / paintingOrder / ancestors)
	plotModelRef: React.MutableRefObject<PlotModel>;
};

export function useAppActions({
	stt,
	setStt,
	setContext,
	setHovered,
	setErrorMessageDisplay,
	tsvFormRef,
	faaFormRef,
	plotRef,
	plotModelRef,
}: UseAppActionsArgs) {
	// Keep latest stt available inside callbacks without dependency churn
	const sttRef = useRef(stt);
	useEffect(() => {
		sttRef.current = stt;
	}, [stt]);

	const plot = useMemo(
		() =>
			makePlotActions({
				setStt,
				setContext,
				setHovered,
			}),
		[setStt, setContext, setHovered],
	);

	const uploads = useMemo(
		() =>
			makeUploadActions({
				setStt,
				setErrorMessageDisplay,
				tsvFormRef,
				faaFormRef,
			}),
		[setStt, setErrorMessageDisplay, tsvFormRef, faaFormRef],
	);

	const controls = useMemo(() => makeControlActions({ setStt }), [setStt]);

	const exports_ = useMemo(
		() =>
			makeExportActions({
				plotRef,
				sttRef,
				plotModelRef,
			}),
		[plotRef, sttRef, plotModelRef],
	);

	const id = useMemo(() => makeIdActions({ setStt, sttRef }), [setStt, sttRef]);

	return {
		...plot,
		...uploads,
		...controls,
		...exports_,
		...id,

		// keep API the same as your current hook
		setHovered,
	};
}
