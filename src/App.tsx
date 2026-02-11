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

import { lns, pO, taxSet } from "./data/staticData.ts";
import {
	//handleMouseMove,
	getClickCoords,
} from "./plot/radialGeometry.ts";
import {
	calcBasicInfo,
	determinePaintingOrder,
	getAncestors,
} from "./plot/plotPipeline.ts";

const App = () => {
	const relTaxSetInit: any = {};
	const contextMenuInit: any = [];
	const [stt, setStt] = useState({
		lyr: "root root",
		relTaxSet: relTaxSetInit,
		paintingOrder: pO,
		ancestors: [],

		lns: lns,
		taxSet: taxSet,

		tsvLastTry: "",
		tsvLoadStatus: "",
		tsvName: "default",

		faaLastTry: "",
		faaLoadStatus: "",
		faaName: "",
		faaObj: {},

		collapse: false,
		eValue: 1.9e-28,
		eValueInput: "1.9e-28",
		eValueApplied: false,
		view: "allEqual",

		eValueEnabled: false,
		fastaEnabled: false,

		fetchedIDs: {},
	});
	const [viewport, setViewport] = useState({
		w: window.innerWidth,
		h: window.innerHeight,
	});

	//const [ctxMenuVis, setCtxMenuVis] = useState(false);
	const [hovered, setHovered] = useState("");
	const [context, setContext] = useState({
		coords: contextMenuInit,
		target: null,
	});
	const [errorMessageDisplay, setErrorMessageDisplay] = useState(false);

	const plotHandleClick = (key: string) => {
		setStt((prev) => {
			const newRelTaxSet = calcBasicInfo(
				prev.eValueApplied,
				prev.eValue,
				prev.collapse,
				prev.lns,
				key,
				prev.taxSet,
				prev.view,
			);

			const newPaintingOrder = determinePaintingOrder(newRelTaxSet);

			const newAncestors: any = getAncestors(
				prev.lns,
				key,
				newRelTaxSet,
				shortcutsHandleClick,
				prev.taxSet,
			);

			return {
				...prev,
				ancestors: newAncestors,
				lyr: key,
				paintingOrder: newPaintingOrder,
				relTaxSet: newRelTaxSet,
			};
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
				const newRelTaxSet = calcBasicInfo(
					false,
					prev.eValue,
					false,
					newData.lns,
					"root root",
					newData.taxSet,
					"allEqual",
				);

				const newPaintingOrder = determinePaintingOrder(newRelTaxSet);

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
					paintingOrder: newPaintingOrder,
					relTaxSet: newRelTaxSet,
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

			const newRelTaxSet = calcBasicInfo(
				prev.eValueApplied,
				prev.eValue,
				newCollapse,
				prev.lns,
				prev.lyr,
				prev.taxSet,
				prev.view,
			);

			return {
				...prev,
				collapse: newCollapse,
				relTaxSet: newRelTaxSet,
				paintingOrder: determinePaintingOrder(newRelTaxSet),
			};
		});
	};

	const eValueAppliedHandleChange = () => {
		setStt((prev) => {
			const newApplied = !prev.eValueApplied;

			try {
				const newRelTaxSet = calcBasicInfo(
					newApplied,
					prev.eValue,
					prev.collapse,
					prev.lns,
					prev.lyr,
					prev.taxSet,
					prev.view,
				);

				return {
					...prev,
					eValueApplied: newApplied,
					relTaxSet: newRelTaxSet,
					paintingOrder: determinePaintingOrder(newRelTaxSet),
				};
			} catch (err) {
				console.log("calcBasicInfo failed in eValue toggle:", err);
				// Keep UI stable instead of crashing
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
				const newRelTaxSet = calcBasicInfo(
					prev.eValueApplied,
					parsed,
					prev.collapse,
					prev.lns,
					prev.lyr,
					prev.taxSet,
					prev.view,
				);

				return {
					...prev,
					eValue: parsed,
					relTaxSet: newRelTaxSet,
					paintingOrder: determinePaintingOrder(newRelTaxSet),
				};
			} catch (err) {
				console.log("calcBasicInfo failed in eValue Enter:", err);
				return prev;
			}
		});
	};

	type ViewMode = "unaltered" | "marriedTaxaI" | "marriedTaxaII" | "allEqual";

	const viewHandleChange = (newView: ViewMode) => {
		setStt((prev) => {
			try {
				const newRelTaxSet = calcBasicInfo(
					prev.eValueApplied,
					prev.eValue,
					prev.collapse,
					prev.lns,
					prev.lyr,
					prev.taxSet,
					newView,
				);

				return {
					...prev,
					view: newView,
					relTaxSet: newRelTaxSet,
					paintingOrder: determinePaintingOrder(newRelTaxSet),
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

		setStt((prev) => ({
			...prev,
			relTaxSet: calcBasicInfo(
				false,
				1.9e-28,
				false,
				lns,
				"root root",
				taxSet,
				"allEqual",
			),
		}));

		return () => window.removeEventListener("click", handleWindowClick);
	}, []);

	useEffect(() => {
		const updateOnResize = () => {
			setViewport({ w: window.innerWidth, h: window.innerHeight });
			setStt((prev) => ({
				...prev,
				relTaxSet: calcBasicInfo(
					prev.eValueApplied,
					prev.eValue,
					prev.collapse,
					prev.lns,
					prev.lyr,
					prev.taxSet,
					prev.view,
				),
			}));
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
