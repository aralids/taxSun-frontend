// src/hooks/useAppActions.ts
import { useCallback, useEffect, useRef } from "react";

import {
	uploadTsv,
	uploadFaa,
	fetchTaxIdByName,
} from "../services/taxSunApi.tsx";
import { getClickCoords } from "../plot/radialGeometry.ts";
import { downloadPlotSvg, downloadSequencesAsTsv } from "../utils/downloads";

import type { Stt } from "../state/state";
import type { ViewMode } from "../plot/computePlotState";
import type { PlotModel } from "../plot/computeFromState";

type ContextState = {
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

	// ✅ latest derived plot model (relTaxSet / paintingOrder / ancestors)
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

	// ✅ Pure input update: selecting a node just changes lyr
	const plotHandleClick = useCallback(
		(key: string) => {
			setStt((prev) => ({ ...prev, lyr: key }));
		},
		[setStt],
	);

	// Optional alias, since some components call it "shortcuts"
	const shortcutsHandleClick = useCallback(
		(key: string) => {
			setStt((prev) => ({ ...prev, lyr: key }));
		},
		[setStt],
	);

	const IDInfoHandleClick = useCallback(
		async (key: string) => {
			const lyrAtClick = sttRef.current.lyr;
			try {
				const { taxID } = await fetchTaxIdByName(key);
				setStt((prev) => ({
					...prev,
					fetchedIDs: {
						...prev.fetchedIDs,
						[lyrAtClick]: taxID,
					},
				}));
			} catch (error) {
				console.log("error:", error);
			}
		},
		[setStt],
	);

	const uplTsvHandleChange = useCallback(async () => {
		const file = tsvFormRef.current?.files?.[0];
		if (!file) return;

		setStt((prev) => ({
			...prev,
			tsvLastTry: file.name,
			tsvLoadStatus: "pending",
		}));

		try {
			const newData = await uploadTsv(file);

			setStt((prev) => ({
				...prev,
				tsvName: file.name,
				tsvLoadStatus: "check",
				eValueEnabled: newData.eValueEnabled,
				eValueInput: String(prev.eValue),
				fastaEnabled: newData.fastaEnabled,

				// new dataset inputs
				lns: newData.lns,
				taxSet: newData.taxSet,

				// reset view inputs for new dataset
				eValueApplied: false,
				collapse: false,
				lyr: "root root",
				view: "allEqual",
			}));
		} catch (error) {
			console.log("error: ", error);
			setStt((prev) => ({
				...prev,
				tsvLoadStatus: "close",
			}));
			setErrorMessageDisplay(true);
		}
	}, [setStt, setErrorMessageDisplay, tsvFormRef]);

	const uplFaaHandleChange = useCallback(async () => {
		const file = faaFormRef.current?.files?.[0];
		if (!file) return;

		setStt((prev) => ({
			...prev,
			faaLastTry: file.name,
			faaLoadStatus: "pending",
		}));

		try {
			const resData = await uploadFaa(file);
			const newData = resData.faaObj;

			setStt((prev) => ({
				...prev,
				faaObj: newData,
				faaName: file.name,
				faaLoadStatus: "check",
			}));
		} catch (error) {
			console.log("FAA upload error:", error);
			setStt((prev) => ({
				...prev,
				faaLoadStatus: "close",
			}));
		}
	}, [setStt, faaFormRef]);

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

	const dldOnClick = useCallback(() => {
		if (!plotRef.current) return;
		const s = sttRef.current;
		downloadPlotSvg(plotRef.current, {
			tsvName: s.tsvName,
			lyr: s.lyr,
			collapse: s.collapse,
			eValueApplied: s.eValueApplied,
			eValue: s.eValue,
			view: s.view,
		});
	}, [plotRef]);

	const handlePlotRightClick = useCallback(
		(event: { [x: string]: any; target: any }, target: any) => {
			event.preventDefault();
			const newCoords: any = getClickCoords(event);
			setContext({ coords: [newCoords.x, newCoords.y], target });
		},
		[setContext],
	);

	// ✅ uses derived plot model (not stt)
	const handleCopyClick = useCallback(
		(target: string, unspecOnly: any) => {
			const plot = plotModelRef.current;
			const targetTxn = plot.relTaxSet?.[target];
			if (!targetTxn) return;

			let geneNames: string[] = targetTxn.geneNames ?? [];

			if (!unspecOnly) {
				geneNames = geneNames.concat(
					(targetTxn.children ?? []).reduce((acc: string[], child: string) => {
						const childTxn = plot.relTaxSet?.[child];
						if (childTxn?.geneNames) return acc.concat(childTxn.geneNames);
						return acc;
					}, []),
				);
			}

			navigator.clipboard.writeText(geneNames.join("\n"));
		},
		[plotModelRef],
	);

	// This utility still expects stt for now (file naming etc). That’s fine.
	// If it needs relTaxSet internally, change that utility to accept plotModel instead.
	const handleDownloadSeqClick = useCallback(
		(target: string, unspecOnly: any) => {
			downloadSequencesAsTsv(target, !!unspecOnly, {
				relTaxSet: plotModelRef.current.relTaxSet,
				faaObj: sttRef.current.faaObj,
				tsvName: sttRef.current.tsvName,
				faaName: sttRef.current.faaName,
				eValueApplied: sttRef.current.eValueApplied,
				eValue: sttRef.current.eValue,
			});
		},
		[],
	);

	return {
		plotHandleClick,
		shortcutsHandleClick,
		IDInfoHandleClick,
		uplTsvHandleChange,
		uplFaaHandleChange,
		collHandleChange,
		eValueAppliedHandleChange,
		eValueHandleChange,
		eValueHandleKeyDown,
		viewHandleChange,
		dldOnClick,
		handlePlotRightClick,
		handleCopyClick,
		handleDownloadSeqClick,
		setHovered,
	};
}
