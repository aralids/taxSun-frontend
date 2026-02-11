// src/hooks/useAppActions.ts
import { useCallback, useEffect, useRef } from "react";

import {
	uploadTsv,
	uploadFaa,
	fetchTaxIdByName,
} from "../services/taxSunApi.tsx";
import { getClickCoords } from "../plot/radialGeometry.ts";
import { computeFromState } from "../plot/computeFromState";
import { downloadPlotSvg, downloadSequencesAsTsv } from "../utils/downloads";

import type { Stt } from "../state/state";
import type { ViewMode } from "../plot/computePlotState";

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
}: UseAppActionsArgs) {
	// Keep latest stt available inside callbacks without dependency churn
	const sttRef = useRef(stt);
	useEffect(() => {
		sttRef.current = stt;
	}, [stt]);

	/**
	 * We need a stable shortcuts function pointer because computeFromState expects it,
	 * and plotHandleClick also wants to call computeFromState.
	 * If we do naive useCallback chaining, we get circular deps.
	 */
	const shortcutsRef = useRef<(key: string) => void>(() => {});

	const plotHandleClick = useCallback(
		(key: string) => {
			setStt((prev) => {
				const computed = computeFromState(prev, key);
				return { ...prev, lyr: key, ...computed };
			});
		},
		[setStt],
	);

	// Now that plotHandleClick exists, wire shortcutsRef to call it
	useEffect(() => {
		shortcutsRef.current = (key: string) => plotHandleClick(key);
	}, [plotHandleClick]);

	const shortcutsHandleClick = useCallback(
		(key: string) => {
			// Keep this for components if you need it, but internally we use shortcutsRef.current
			plotHandleClick(key);
		},
		[plotHandleClick],
	);

	const IDInfoHandleClick = useCallback(
		async (key: string) => {
			const lyrAtClick = sttRef.current.lyr; // capture current lyr at click time
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

			setStt((prev) => {
				const computed = computeFromState(prev, "root root", {
					eValueApplied: false,
					collapse: false,
					lns: newData.lns,
					taxSet: newData.taxSet,
					view: "allEqual",
				});

				return {
					...prev,
					tsvName: file.name,
					tsvLoadStatus: "check",
					eValueEnabled: newData.eValueEnabled,
					eValueInput: String(prev.eValue),
					fastaEnabled: newData.fastaEnabled,
					lns: newData.lns,
					taxSet: newData.taxSet,
					eValueApplied: false,
					collapse: false,
					lyr: "root root",
					view: "allEqual",
					...computed,
				};
			});
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
		setStt((prev) => {
			const newCollapse = !prev.collapse;
			const computed = computeFromState(prev, prev.lyr, {
				collapse: newCollapse,
			});
			return {
				...prev,
				collapse: newCollapse,
				relTaxSet: computed.relTaxSet,
				paintingOrder: computed.paintingOrder,
			};
		});
	}, [setStt]);

	const eValueAppliedHandleChange = useCallback(() => {
		setStt((prev) => {
			const newApplied = !prev.eValueApplied;
			try {
				const computed = computeFromState(prev, prev.lyr, {
					eValueApplied: newApplied,
				});
				return {
					...prev,
					eValueApplied: newApplied,
					relTaxSet: computed.relTaxSet,
					paintingOrder: computed.paintingOrder,
				};
			} catch (err) {
				console.log("calcBasicInfo failed in eValue toggle:", err);
				return prev;
			}
		});
	}, [setStt]);

	const eValueHandleChange = useCallback(
		(value: string) => {
			setStt((prev) => ({
				...prev,
				eValueInput: value,
			}));
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

				if (!prev.eValueApplied) {
					return { ...prev, eValue: parsed };
				}

				try {
					const computed = computeFromState(prev, prev.lyr, {
						eValue: parsed,
					});
					return {
						...prev,
						eValue: parsed,
						relTaxSet: computed.relTaxSet,
						paintingOrder: computed.paintingOrder,
					};
				} catch (err) {
					console.log("calcBasicInfo failed in eValue Enter:", err);
					return prev;
				}
			});
		},
		[setStt],
	);

	const viewHandleChange = useCallback(
		(newView: ViewMode) => {
			setStt((prev) => {
				try {
					const computed = computeFromState(prev, prev.lyr, {
						view: newView,
					});
					return {
						...prev,
						view: newView,
						relTaxSet: computed.relTaxSet,
						paintingOrder: computed.paintingOrder,
					};
				} catch (err) {
					console.log("calcBasicInfo failed in view change:", err);
					return { ...prev, view: newView };
				}
			});
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

	const handleCopyClick = useCallback((target: string, unspecOnly: any) => {
		const s = sttRef.current;
		const targetTxn = s.relTaxSet[target];
		let geneNames = targetTxn.geneNames;

		if (!unspecOnly) {
			geneNames = geneNames.concat(
				targetTxn.children.reduce((acc: string[], child: string) => {
					const childTxn = s.relTaxSet[child];
					if (childTxn) return acc.concat(childTxn.geneNames);
					return acc;
				}, []),
			);
		}
		navigator.clipboard.writeText(geneNames.join(" \n"));
	}, []);

	const handleDownloadSeqClick = useCallback(
		(target: string, unspecOnly: any) => {
			downloadSequencesAsTsv(target, !!unspecOnly, sttRef.current);
		},
		[],
	);

	return {
		plotHandleClick,
		shortcutsHandleClick, // optional export, but harmless
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
