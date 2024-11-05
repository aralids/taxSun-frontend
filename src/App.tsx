let baseURL = "https://web-production-0834.up.railway.app";
// let baseURL = "http://127.0.0.1:5000";

import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import LeftSection from "./components/LeftSection.tsx";
import RightSection from "./components/RightSection.tsx";
import Plot from "./components/Plot.tsx";
import HoverLabel from "./components/HoveredLabel.tsx";
import ContextMenu from "./components/ContextMenu.tsx";
import ErrorMessage from "./components/ErrorMessage.tsx";

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

export const LeftSectionCtx = createContext({});
export const RightSectionCtx = createContext({});

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
		const newRelTaxSet = calcBasicInfo(
			sttRef.current.eValueApplied,
			sttRef.current.eValue,
			sttRef.current.collapse,
			sttRef.current.lns,
			key,
			sttRef.current.taxSet,
			sttRef.current.view
		);
		const newPaintingOrder = determinePaintingOrder(newRelTaxSet);
		const newAncestors: any = getAncestors(
			sttRef.current.lns,
			key,
			newRelTaxSet,
			shortcutsHandleClick,
			sttRef.current.taxSet
		);
		setStt({
			...sttRef.current,
			ancestors: newAncestors,
			lyr: key,
			paintingOrder: newPaintingOrder,
			relTaxSet: newRelTaxSet,
		});
	};

	const IDInfoHandleClick = (key: string) => {
		axios
			.post(`${baseURL}/fetchID`, {
				taxName: key,
			})
			.then((response) => {
				const id = response.data.taxID;
				const newFetchedIDs: any = { ...sttRef.current.fetchedIDs };
				newFetchedIDs[sttRef.current.lyr] = id;
				setStt({
					...sttRef.current,
					fetchedIDs: newFetchedIDs,
				});
			})
			.catch((error) => {
				console.log("error: ", error);
			});
	};

	const shortcutsHandleClick = (key: string) => {
		plotHandleClick(key);
	};

	const uplTsvHandleChange = () => {
		const newFile: any = tsvRef.current.files[0];
		const newLastTry: any = newFile.name;
		setStt({
			...sttRef.current,
			tsvLastTry: newLastTry,
			tsvLoadStatus: "pending",
		});

		let formData = new FormData();
		formData.append("file", newFile);
		axios
			.post(`${baseURL}/load_tsv_data`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			.then((response) => {
				const newData = response.data;
				console.log("newData: ", response.data);
				console.log("newData.taxSet: ", JSON.stringify(newData.taxSet));
				const newRelTaxSet = calcBasicInfo(
					false,
					sttRef.current.eValue,
					false,
					newData.lns,
					"root root",
					newData.taxSet,
					"allEqual"
				);
				const newPaintingOrder = determinePaintingOrder(newRelTaxSet);
				setStt({
					...sttRef.current,
					tsvName: sttRef.current.tsvLastTry,
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
				});
				unalteredRef.current.checked = false;
				marriedIRef.current.checked = false;
				marriedIIRef.current.checked = false;
				allEqualRef.current.checked = true;
			})
			.catch((error) => {
				console.log("error: ", error);
				setStt({
					...sttRef.current,
					tsvLoadStatus: "close",
				});
				setErrorMessageDisplay(true);
			});
	};

	const uplFaaHandleChange = () => {
		const newFile: any = faaRef.current.files[0];
		const newLastTry: any = newFile.name;
		setStt({
			...sttRef.current,
			faaLastTry: newLastTry,
			faaLoadStatus: "pending",
		});

		let formData = new FormData();
		formData.append("file", newFile);
		axios
			.post(`${baseURL}/load_faa_data`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			.then((response) => {
				const newData = response.data.faaObj;
				setStt({
					...sttRef.current,
					faaObj: newData,
					faaName: sttRef.current.faaLastTry,
					faaLoadStatus: "check",
				});
			})
			.catch(() => {
				setStt({
					...sttRef.current,
					faaLoadStatus: "close",
				});
			});
	};

	const collHandleChange = () => {
		const newRelTaxSet = calcBasicInfo(
			sttRef.current.eValueApplied,
			sttRef.current.eValue,
			!sttRef.current["collapse"],
			sttRef.current.lns,
			sttRef.current.lyr,
			sttRef.current.taxSet,
			sttRef.current.view
		);
		const newPaintingOrder = determinePaintingOrder(newRelTaxSet);
		setStt({
			...sttRef.current,
			collapse: !sttRef.current["collapse"],
			paintingOrder: newPaintingOrder,
			relTaxSet: newRelTaxSet,
		});
	};

	const eValueAppliedHandleChange = () => {
		const newRelTaxSet = calcBasicInfo(
			!sttRef.current["eValueApplied"],
			sttRef.current.eValue,
			sttRef.current.collapse,
			sttRef.current.lns,
			sttRef.current.lyr,
			sttRef.current.taxSet,
			sttRef.current.view
		);
		const newPaintingOrder = determinePaintingOrder(newRelTaxSet);
		setStt({
			...sttRef.current,
			eValueApplied: !sttRef.current["eValueApplied"],
			paintingOrder: newPaintingOrder,
			relTaxSet: newRelTaxSet,
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
				sttRef.current.view
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
			newView
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
		target: any
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
				}, [])
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
				}, [])
			);
		}
		const faaObj: any = sttRef.current.faaObj;

		let ntSeqs = fastaHeaders.map(
			(item: string) => faaObj[item] ?? "No sequence found."
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
		//window.addEventListener("mousemove", (event) => handleMouseMove(event));
		window.addEventListener("click", () =>
			setContext({ coords: [], target: null })
		);
		setStt({
			...sttRef.current,
			relTaxSet: calcBasicInfo(
				false,
				1.9e-28,
				false,
				lns,
				"root root",
				taxSet,
				"allEqual"
			),
		});
	}, []);

	useEffect(() => {
		const updateOnResize = () =>
			setStt({
				...sttRef.current,
				relTaxSet: calcBasicInfo(
					sttRef.current.eValueApplied,
					sttRef.current.eValue,
					sttRef.current.collapse,
					sttRef.current.lns,
					sttRef.current.lyr,
					sttRef.current.taxSet,
					sttRef.current.view
				),
			});

		window.addEventListener("resize", updateOnResize);

		// unsubscribe from the event on component unmount
		return () => window.removeEventListener("resize", updateOnResize);
	}, []);

	const tmpFetchedIds: any = stt["fetchedIDs"];

	if (Object.keys(sttRef.current["relTaxSet"]).length === 0) {
		return null;
	}

	return (
		<div>
			<LeftSectionCtx.Provider
				value={{
					...stt["relTaxSet"][stt["lyr"]],
					rawCount: stt["relTaxSet"][stt["lyr"]]["rawCount"],
					id: Boolean(stt["relTaxSet"][stt["lyr"]]["taxID"])
						? stt["relTaxSet"][stt["lyr"]]["taxID"]
						: tmpFetchedIds[stt["lyr"]] ?? "",
					IDInfoHandleClick: () =>
						IDInfoHandleClick(stt["lyr"].split(" ").slice(0, -1).join(" ")),
					ancestors: stt["ancestors"],
					hovered: stt["relTaxSet"][hovered],
				}}
			>
				<LeftSection />
			</LeftSectionCtx.Provider>

			<RightSectionCtx.Provider
				value={{
					tsvLastTry: stt.tsvLastTry,
					tsvLoadStatus: stt.tsvLoadStatus,
					uplTsvHandleChange: uplTsvHandleChange,
					tsvFormRef: tsvRef,

					fastaEnabled: stt.fastaEnabled,
					faaLastTry: stt.faaLastTry,
					faaLoadStatus: stt.faaLoadStatus,
					uplFaaHandleChange: uplFaaHandleChange,
					faaFormRef: faaRef,

					coll: stt["collapse"],
					collHandleChange: collHandleChange,

					eValueEnabled: stt["eValueEnabled"],
					eValueApplied: stt["eValueApplied"],
					eValueAppliedHandleChange: eValueAppliedHandleChange,
					eValueHandleKeyDown: eValueHandleKeyDown,
					eValueRef: eValueRef,

					unalteredRef: unalteredRef,
					marriedIRef: marriedIRef,
					marriedIIRef: marriedIIRef,
					allEqualRef: allEqualRef,
					viewHandleChange: viewHandleChange,

					dldOnClick: dldOnClick,
				}}
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
