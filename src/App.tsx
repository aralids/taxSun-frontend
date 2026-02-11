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
	const sttRef = useRef(stt);
	sttRef.current = stt;
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
		try {
			const resData = await fetchTaxIdByName(key); // { taxID: ... }
			const id = resData.taxID;

			const newFetchedIDs = {
				...sttRef.current.fetchedIDs,
				[sttRef.current.lyr]: id,
			};

			setStt({
				...sttRef.current,
				fetchedIDs: newFetchedIDs,
			});
		} catch (error) {
			console.log("error: ", error);
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
		if (event.key === "Enter") {
			event.preventDefault();
			const newRelTaxSet = calcBasicInfo(
				sttRef.current.eValueApplied,
				eValueRef.current.value,
				sttRef.current.collapse,
				sttRef.current.lns,
				sttRef.current.lyr,
				sttRef.current.taxSet,
				sttRef.current.view,
			);
			const newPaintingOrder = determinePaintingOrder(newRelTaxSet);
			if (sttRef.current["eValueApplied"]) {
				setStt({
					...sttRef.current,
					eValue: eValueRef.current.value,
					paintingOrder: newPaintingOrder,
					relTaxSet: newRelTaxSet,
				});
			} else {
				setStt({ ...sttRef.current, eValue: eValueRef.current.value });
			}
		}
	};

	const viewHandleChange = () => {
		let newView: string = "";
		if (unalteredRef.current.checked) {
			newView = "unaltered";
		} else if (marriedIRef.current.checked) {
			newView = "marriedTaxaI";
		} else if (marriedIIRef.current.checked) {
			newView = "marriedTaxaII";
		} else if (allEqualRef.current.checked) {
			newView = "allEqual";
		}
		const newRelTaxSet = calcBasicInfo(
			sttRef.current.eValueApplied,
			eValueRef.current.value,
			sttRef.current.collapse,
			sttRef.current.lns,
			sttRef.current.lyr,
			sttRef.current.taxSet,
			newView,
		);
		const newPaintingOrder = determinePaintingOrder(newRelTaxSet);
		setStt({
			...sttRef.current,
			view: newView,
			paintingOrder: newPaintingOrder,
			relTaxSet: newRelTaxSet,
		});
	};

	const dldOnClick = () => {
		const pr: any = plotRef.current;
		let base64doc = new XMLSerializer().serializeToString(pr);
		base64doc = btoa(base64doc);
		const a = document.createElement("a");
		const e = new MouseEvent("click");

		const tsvNameAbbr = sttRef.current.tsvName.slice(0, 10);
		const lyrAbbr = sttRef.current.lyr.slice(0, 10);
		const collAbbr = `collapse-${sttRef.current.collapse}`;
		const eValAbbr = `eValue-${
			sttRef.current.collapse ? sttRef.current.eValue : "false"
		}`;
		const viewAbbr = sttRef.current.view;
		const svgFileName = `${tsvNameAbbr}_${lyrAbbr}_${collAbbr}_${eValAbbr}_${viewAbbr}.svg`;
		a.download = svgFileName;
		a.href = "data:text/html;base64," + base64doc;
		a.dispatchEvent(e);
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
		const targetTxn = sttRef.current.relTaxSet[target];
		let geneNames = targetTxn.geneNames;

		if (!unspecOnly) {
			geneNames = geneNames.concat(
				targetTxn.children.reduce((acc: string[], child: string) => {
					const childTxn = sttRef.current.relTaxSet[child];
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
		const targetTxn = sttRef.current.relTaxSet[target];
		let fastaHeaders = targetTxn.fastaHeaders;
		let geneNames = targetTxn.geneNames;
		let names = targetTxn.names;

		if (!unspecOnly) {
			fastaHeaders = fastaHeaders.concat(
				targetTxn.children.reduce((acc: string[], child: string) => {
					const childTxn = sttRef.current.relTaxSet[child];
					if (childTxn) {
						names = names.concat(childTxn.names);
						geneNames = geneNames.concat(childTxn.geneNames);
						return acc.concat(childTxn.fastaHeaders);
					}
					return acc.concat([]);
				}, []),
			);
		}
		const faaObj: any = sttRef.current.faaObj;

		let ntSeqs = fastaHeaders.map(
			(item: string) => faaObj[item] ?? "No sequence found.",
		);
		let entries: any[] = [];
		for (let i = 0; i < fastaHeaders.length; i++) {
			entries = entries.concat([
				`> ${fastaHeaders[i]} (${geneNames[i]}) ${names[i]}\n${ntSeqs[i]}\n\n`,
			]);
		}

		let seqsFile = entries.join("\n");
		const a = document.createElement("a");
		const e = new MouseEvent("click");

		a.download = `${unspecOnly ? "unspec" : "all"}_${sttRef.current.tsvName}_${
			sttRef.current.faaName
		}_${target}${
			sttRef.current.eValueApplied ? `_${sttRef.current.eValue}` : ""
		}.tsv`;
		a.href = "data:text/tab-separated-values," + encodeURIComponent(seqsFile);
		a.dispatchEvent(e);
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

	if (Object.keys(sttRef.current["relTaxSet"]).length === 0) {
		return null;
	}

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
