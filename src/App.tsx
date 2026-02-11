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
import { makeInitialStt, type Stt } from "./state/state";
import { computeFromState } from "./plot/computeFromState";
import { useAppActions } from "./hooks/useAppActions";

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

	const tsvFormRef = useRef<HTMLInputElement | null>(null);
	const faaFormRef = useRef<HTMLInputElement | null>(null);
	const plotRef = useRef<SVGSVGElement | null>(null);
	const actions = useAppActions({
		stt,
		setStt,
		setContext,
		setHovered,
		setErrorMessageDisplay,
		tsvFormRef,
		faaFormRef,
		plotRef,
	});

	useEffect(() => {
		const handleWindowClick = () => setContext({ coords: [], target: null });
		window.addEventListener("click", handleWindowClick);
		setStt((prev) => {
			const computed = computeFromState(prev, "root root", {
				eValueApplied: false,
				eValue: 1.9e-28,
				collapse: false,
				lns: prev.lns,
				taxSet: prev.taxSet,
				view: "allEqual",
			});
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
				const computed = computeFromState(prev, prev.lyr);
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
					IDInfoHandleClick: actions.IDInfoHandleClick,
					ancestors: stt["ancestors"],
					ancestorHandleClick: actions.shortcutsHandleClick,
				})}
			>
				<LeftSection />
			</LeftSectionCtx.Provider>

			<RightSectionCtx.Provider
				value={buildRightSectionCtxValue({
					stt,
					uplTsvHandleChange: actions.uplTsvHandleChange,
					uplFaaHandleChange: actions.uplFaaHandleChange,
					collHandleChange: actions.collHandleChange,
					eValueAppliedHandleChange: actions.eValueAppliedHandleChange,
					eValueHandleKeyDown: actions.eValueHandleKeyDown,
					eValueHandleChange: actions.eValueHandleChange,
					viewHandleChange: actions.viewHandleChange,
					dldOnClick: actions.dldOnClick,
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
				handlePlotRightClick={actions.handlePlotRightClick}
				lyr={stt["lyr"]}
				relTaxSet={stt["relTaxSet"]}
				paintingOrder={stt["paintingOrder"]}
				plotHandleClick={actions.plotHandleClick}
				plotRef={plotRef}
				view={stt["view"]}
			/>
			<HoverLabel hovered={hovered} relTaxSet={stt["relTaxSet"]} />
			<ContextMenu
				coords={context["coords"]}
				faaName={stt["faaName"]}
				handleCopyClick={actions.handleCopyClick}
				handleDownloadSeqClick={actions.handleDownloadSeqClick}
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
