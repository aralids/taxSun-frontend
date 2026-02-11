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

import { lns, pO, taxSet } from "./services/predefinedObjects.tsx";
import {
	//handleMouseMove,
	getClickCoords,
} from "./services/helperFunctions.tsx";
import {
	calcBasicInfo,
	determinePaintingOrder,
	getAncestors,
} from "./services/someFunctions.tsx";

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
		eValueApplied: false,
		view: "allEqual",

		eValueEnabled: false,
		fastaEnabled: false,

		fetchedIDs: {},
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
		const file = tsvRef.current?.files?.[0];
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

			unalteredRef.current.checked = false;
			marriedIRef.current.checked = false;
			marriedIIRef.current.checked = false;
			allEqualRef.current.checked = true;
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
		const file = faaRef.current?.files?.[0];
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

	const eValueHandleKeyDown = (event: any) => {
		if (event.key !== "Enter") return;
		event.preventDefault();

		const raw = eValueRef.current.value;
		const nextEValue = Number(raw);

		setStt((prev) => {
			if (!prev.eValueApplied) {
				return { ...prev, eValue: nextEValue };
			}

			try {
				const newRelTaxSet = calcBasicInfo(
					prev.eValueApplied,
					nextEValue,
					prev.collapse,
					prev.lns,
					prev.lyr,
					prev.taxSet,
					prev.view,
				);

				return {
					...prev,
					eValue: nextEValue,
					relTaxSet: newRelTaxSet,
					paintingOrder: determinePaintingOrder(newRelTaxSet),
				};
			} catch (err) {
				console.log("calcBasicInfo failed in eValue Enter:", err);
				return { ...prev, eValue: nextEValue }; // at least keep the input value
			}
		});
	};

	const viewHandleChange = () => {
		let newView = "";
		if (unalteredRef.current.checked) newView = "unaltered";
		else if (marriedIRef.current.checked) newView = "marriedTaxaI";
		else if (marriedIIRef.current.checked) newView = "marriedTaxaII";
		else if (allEqualRef.current.checked) newView = "allEqual";

		const eValInput = Number(eValueRef.current.value);

		setStt((prev) => {
			try {
				const newRelTaxSet = calcBasicInfo(
					prev.eValueApplied,
					eValInput,
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
		downloadPlotSvg(plotRef.current as any, {
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

	const tsvRef = useRef({ files: [{ name: "" }] });
	const faaRef = useRef({ files: [{ name: "" }] });
	const eValueRef = useRef({ value: 0 });
	let unalteredRef = useRef({ checked: false });
	let marriedIRef = useRef({ checked: false });
	let marriedIIRef = useRef({ checked: false });
	let allEqualRef = useRef({ checked: true });
	const plotRef = useRef({ outerHTML: "" });

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

					viewHandleChange,

					dldOnClick,

					tsvRef,
					faaRef,
					eValueRef,

					unalteredRef,
					marriedIRef,
					marriedIIRef,
					allEqualRef,
				})}
			>
				<RightSection />
			</RightSectionCtx.Provider>

			<Plot
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
