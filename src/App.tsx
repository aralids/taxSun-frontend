import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

import LeftSection from "./components/LeftSection.tsx";
import RightSection from "./components/RightSection.tsx";
import Plot from "./components/Plot.tsx";

import { lns, taxSet } from "./services/predefinedObjects.tsx";
//import { handleMouseMove } from "./services/helperFunctions.tsx";
import { calcBasicInfo, getAncestors } from "./services/someFunctions.tsx";

export const LeftSectionCtx = createContext({});
export const RightSectionCtx = createContext({});

const App = () => {
	const [stt, setStt] = useState({
		lyr: "root root",
		relTaxSet: calcBasicInfo(
			false,
			1.9e-28,
			false,
			lns,
			"root root",
			taxSet,
			"allEqual"
		),
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
	const [hover, setHover] = useState("");
	const sttRef = useRef(stt);
	sttRef.current = stt;

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
			relTaxSet: newRelTaxSet,
		});
	};

	const IDInfoHandleClick = (key: string) => {
		console.log("IDInfoHandleClick");
		axios
			.post("https://web-production-0834.up.railway.app/fetchID", {
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
			.post(
				"https://web-production-0834.up.railway.app/load_tsv_data",
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } }
			)
			.then((response) => {
				const newData = response.data;
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
					relTaxSet: calcBasicInfo(
						false,
						sttRef.current.eValue,
						false,
						newData.lns,
						"root root",
						newData.taxSet,
						"allEqual"
					),
				});
			})
			.catch(() => {
				setStt({
					...sttRef.current,
					tsvLoadStatus: "close",
				});
			});
	};

	const uplFaaHandleChange = () => {
		console.log("uplFaaHandleChange");
		console.log("faaRef.current: ", faaRef);
	};

	const collHandleChange = () => {
		setStt({
			...sttRef.current,
			collapse: !sttRef.current["collapse"],
			relTaxSet: calcBasicInfo(
				sttRef.current.eValueApplied,
				sttRef.current.eValue,
				!sttRef.current["collapse"],
				sttRef.current.lns,
				sttRef.current.lyr,
				sttRef.current.taxSet,
				sttRef.current.view
			),
		});
	};

	const eValueAppliedHandleChange = () => {
		setStt({
			...sttRef.current,
			eValueApplied: !sttRef.current["eValueApplied"],
			relTaxSet: calcBasicInfo(
				!sttRef.current["eValueApplied"],
				sttRef.current.eValue,
				sttRef.current.collapse,
				sttRef.current.lns,
				sttRef.current.lyr,
				sttRef.current.taxSet,
				sttRef.current.view
			),
		});
	};

	const eValueHandleKeyDown = (event: any) => {
		if (event.key === "Enter") {
			if (sttRef.current["eValueApplied"]) {
				setStt({
					...sttRef.current,
					eValue: eValueRef.current.value,
					relTaxSet: calcBasicInfo(
						sttRef.current.eValueApplied,
						eValueRef.current.value,
						sttRef.current.collapse,
						sttRef.current.lns,
						sttRef.current.lyr,
						sttRef.current.taxSet,
						sttRef.current.view
					),
				});
			} else {
				setStt({ ...sttRef.current, eValue: eValueRef.current.value });
			}
			console.log("eValueHandleKeyDown: ", eValueRef.current.value);
		}
	};

	const viewHandleChange = () => {
		console.log("viewHandleChange", unalteredRef.current.checked);
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
		setStt({
			...sttRef.current,
			view: newView,
			relTaxSet: calcBasicInfo(
				sttRef.current.eValueApplied,
				eValueRef.current.value,
				sttRef.current.collapse,
				sttRef.current.lns,
				sttRef.current.lyr,
				sttRef.current.taxSet,
				newView
			),
		});
	};

	const dldOnClick = () => {
		console.log("dldOnClick");
		console.log("plotRef: ", plotRef.current.outerHTML);
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

	const tsvRef = useRef({ files: [{ name: "" }] });
	const faaRef = useRef();
	const eValueRef = useRef({ value: 0 });
	const unalteredRef = useRef({ checked: false });
	const marriedIRef = useRef({ checked: false });
	const marriedIIRef = useRef({ checked: false });
	const allEqualRef = useRef({ checked: true });
	const plotRef = useRef({ outerHTML: "" });

	useEffect(() => {
		//window.addEventListener("mousemove", (event) => handleMouseMove(event));
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

	return (
		<div>
			<LeftSectionCtx.Provider
				value={{
					...stt["relTaxSet"][stt["lyr"]],
					rawCount: stt["taxSet"][stt["lyr"]]["rawCount"],
					id: Boolean(stt["taxSet"][stt["lyr"]]["taxID"])
						? stt["taxSet"][stt["lyr"]]["taxID"]
						: tmpFetchedIds[stt["lyr"]] ?? "",
					IDInfoHandleClick: () =>
						IDInfoHandleClick(stt["lyr"].split(" ").slice(0, -1).join(" ")),
					ancestors: stt["ancestors"],
					hovered: stt["relTaxSet"][hover],
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

			<button
				onMouseOver={() => setHover("Bacteria superkingdom")}
				onMouseOut={() => setHover("")}
				style={{ position: "fixed", top: "90%", left: "90%" }}
			>
				Bacteria
			</button>

			<Plot
				ancestors={stt["ancestors"]}
				handleHover={setHover}
				lyr={stt["lyr"]}
				relTaxSet={stt["relTaxSet"]}
				plotHandleClick={plotHandleClick}
				plotRef={plotRef}
			/>
		</div>
	);
};

export default App;
