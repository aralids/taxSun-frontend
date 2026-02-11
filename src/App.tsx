// App.tsx
import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import LeftSection from "./components/LeftSection.tsx";
import RightSection from "./components/RightSection.tsx";
import Plot from "./components/Plot.tsx";
import HoverLabel from "./components/HoveredLabel.tsx";
import ContextMenu from "./components/ContextMenu.tsx";
import ErrorMessage from "./components/ErrorMessage.tsx";
import { LeftSectionCtx } from "./contexts/LeftSectionCtx";
import { buildLeftSectionCtxValue } from "./contexts/buildLeftSectionCtxValue";
import { RightSectionCtx } from "./contexts/RightSectionCtx";
import { buildRightSectionCtxValue } from "./contexts/buildRightSectionCtxValue";
import { downloadPlotSvg, downloadSequencesAsTsv } from "./utils/downloads";
import {
	uploadTsv,
	uploadFaa,
	fetchTaxIdByName,
} from "./services/taxSunApi.tsx";
import {
	//handleMouseMove,
	getClickCoords,
} from "./plot/radialGeometry.ts";
import { type ViewMode } from "./plot/computePlotState";
import { makeInitialStt, type Stt } from "./state/state";
import { computeFromState } from "./plot/computeFromState";

const App = () => {
	const contextMenuInit: any = [];
	const [stt, setStt] = useState<Stt>(makeInitialStt);

	const [viewport, setViewport] = useState({
		w: window.innerWidth,
		h: window.innerHeight,
	});
	const [hovered, setHovered] = useState("");
	const [context, setContext] = useState({
		coords: contextMenuInit,
		target: null,
	});
	const [errorMessageDisplay, setErrorMessageDisplay] = useState(false);

	const plotHandleClick = (key: string) => {
		setStt((prev) => {
			const computed = computeFromState(prev, key, shortcutsHandleClick);
			return { ...prev, lyr: key, ...computed };
		});
	};

	const IDInfoHandleClick = async (key: string) => {
		const lyrAtClick = stt.lyr; // capture now (or pass lyr explicitly)
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
	};

	const shortcutsHandleClick = (key: string) => {
		plotHandleClick(key);
	};

	const uplTsvHandleChange = async () => {
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
				const computed = computeFromState(
					prev,
					"root root",
					shortcutsHandleClick,
					{
						eValueApplied: false,
						collapse: false,
						lns: newData.lns,
						taxSet: newData.taxSet,
						view: "allEqual",
					},
				);
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
	};

	const uplFaaHandleChange = async () => {
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
	};

	const collHandleChange = () => {
		setStt((prev) => {
			const newCollapse = !prev.collapse;
			const computed = computeFromState(prev, prev.lyr, shortcutsHandleClick, {
				collapse: newCollapse,
			});
			return {
				...prev,
				collapse: newCollapse,
				relTaxSet: computed.relTaxSet,
				paintingOrder: computed.paintingOrder,
				// ancestors: computed.ancestors, // <- leave OUT if you want old behavior
			};
		});
	};

	const eValueAppliedHandleChange = () => {
		setStt((prev) => {
			const newApplied = !prev.eValueApplied;
			try {
				const computed = computeFromState(
					prev,
					prev.lyr,
					shortcutsHandleClick,
					{
						eValueApplied: newApplied,
					},
				);
				return {
					...prev,
					eValueApplied: newApplied,
					relTaxSet: computed.relTaxSet,
					paintingOrder: computed.paintingOrder,
					// ancestors: computed.ancestors, // optional
				};
			} catch (err) {
				console.log("calcBasicInfo failed in eValue toggle:", err);
				return prev;
			}
		});
	};

	const eValueHandleChange = (value: string) => {
		setStt((prev) => ({
			...prev,
			eValueInput: value, // always update
		}));
	};

	const eValueHandleKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key !== "Enter") return;
		event.preventDefault();

		setStt((prev) => {
			const parsed = Number(prev.eValueInput);
			if (Number.isNaN(parsed)) return prev; // ignore invalid scientific notation mid-edit

			if (!prev.eValueApplied) {
				return { ...prev, eValue: parsed };
			}

			try {
				const computed = computeFromState(
					prev,
					prev.lyr,
					shortcutsHandleClick,
					{
						eValue: parsed,
					},
				);
				return {
					...prev,
					eValue: parsed,
					relTaxSet: computed.relTaxSet,
					paintingOrder: computed.paintingOrder,
					// ancestors: computed.ancestors, // optional
				};
			} catch (err) {
				console.log("calcBasicInfo failed in eValue Enter:", err);
				return prev;
			}
		});
	};

	const viewHandleChange = (newView: ViewMode) => {
		setStt((prev) => {
			try {
				const computed = computeFromState(
					prev,
					prev.lyr,
					shortcutsHandleClick,
					{
						view: newView,
					},
				);
				return {
					...prev,
					view: newView,
					relTaxSet: computed.relTaxSet,
					paintingOrder: computed.paintingOrder,
					// ancestors: computed.ancestors, // optional
				};
			} catch (err) {
				console.log("calcBasicInfo failed in view change:", err);
				return { ...prev, view: newView };
			}
		});
	};

	const dldOnClick = () => {
		if (!plotRef.current) return;
		downloadPlotSvg(plotRef.current, {
			tsvName: stt.tsvName,
			lyr: stt.lyr,
			collapse: stt.collapse,
			eValueApplied: stt.eValueApplied,
			eValue: stt.eValue,
			view: stt.view,
		});
	};

	const handlePlotRightClick = (
		event: { [x: string]: any; target: any },
		target: any,
	) => {
		event.preventDefault();
		const newCoords: any = getClickCoords(event);
		setContext({ coords: [newCoords.x, newCoords.y], target: target });
	};

	const handleCopyClick = (target: string, unspecOnly: any) => {
		const targetTxn = stt.relTaxSet[target];
		let geneNames = targetTxn.geneNames;

		if (!unspecOnly) {
			geneNames = geneNames.concat(
				targetTxn.children.reduce((acc: string[], child: string) => {
					const childTxn = stt.relTaxSet[child];
					if (childTxn) {
						return acc.concat(childTxn.geneNames);
					}
					return acc.concat([]);
				}, []),
			);
		}
		navigator.clipboard.writeText(geneNames.join(" \n"));
	};

	const handleDownloadSeqClick = (target: string, unspecOnly: any) => {
		downloadSequencesAsTsv(target, !!unspecOnly, stt);
	};

	const tsvFormRef = useRef<HTMLInputElement | null>(null);
	const faaFormRef = useRef<HTMLInputElement | null>(null);
	const plotRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		const handleWindowClick = () => setContext({ coords: [], target: null });
		window.addEventListener("click", handleWindowClick);
		setStt((prev) => {
			const computed = computeFromState(
				prev,
				"root root",
				shortcutsHandleClick,
				{
					eValueApplied: false,
					eValue: 1.9e-28,
					collapse: false,
					lns: prev.lns,
					taxSet: prev.taxSet,
					view: "allEqual",
				},
			);
			return {
				...prev,
				relTaxSet: computed.relTaxSet,
				paintingOrder: computed.paintingOrder,
				ancestors: computed.ancestors,
			};
		});
		return () => window.removeEventListener("click", handleWindowClick);
	}, []);

	useEffect(() => {
		const updateOnResize = () => {
			setViewport({ w: window.innerWidth, h: window.innerHeight });
			setStt((prev) => {
				const computed = computeFromState(prev, prev.lyr, shortcutsHandleClick);
				return {
					...prev,
					relTaxSet: computed.relTaxSet,
					paintingOrder: computed.paintingOrder,
					// ancestors: computed.ancestors, // optional
				};
			});
		};
		window.addEventListener("resize", updateOnResize);
		return () => window.removeEventListener("resize", updateOnResize);
	}, []);

	const tmpFetchedIds: any = stt["fetchedIDs"];

	if (Object.keys(stt.relTaxSet).length === 0) return null;

	return (
		<div>
			<LeftSectionCtx.Provider
				value={buildLeftSectionCtxValue({
					stt,
					hoveredKey: hovered,
					tmpFetchedIds,
					IDInfoHandleClick,
					ancestors: stt["ancestors"],
				})}
			>
				<LeftSection />
			</LeftSectionCtx.Provider>

			<RightSectionCtx.Provider
				value={buildRightSectionCtxValue({
					stt,

					uplTsvHandleChange,
					uplFaaHandleChange,

					collHandleChange,

					eValueAppliedHandleChange,
					eValueHandleKeyDown,
					eValueHandleChange,

					viewHandleChange,

					dldOnClick,

					tsvFormRef,
					faaFormRef,
				})}
			>
				<RightSection />
			</RightSectionCtx.Provider>

			<Plot
				viewport={viewport}
				ancestors={stt["ancestors"]}
				handleHover={setHovered}
				handlePlotRightClick={handlePlotRightClick}
				lyr={stt["lyr"]}
				relTaxSet={stt["relTaxSet"]}
				paintingOrder={stt["paintingOrder"]}
				plotHandleClick={plotHandleClick}
				plotRef={plotRef}
				view={stt["view"]}
			/>
			<HoverLabel hovered={hovered} relTaxSet={stt["relTaxSet"]} />
			<ContextMenu
				coords={context["coords"]}
				faaName={stt["faaName"]}
				handleCopyClick={handleCopyClick}
				handleDownloadSeqClick={handleDownloadSeqClick}
				target={context["target"]}
			/>
			<ErrorMessage
				display={errorMessageDisplay}
				setDisplay={setErrorMessageDisplay}
			/>
		</div>
	);
};

export default App;
