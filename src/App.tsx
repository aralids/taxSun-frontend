// App.tsx
import { useEffect, useRef, useState, useMemo } from "react";
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
import { useDismissContextMenu } from "./hooks/useDismissContextMenu.ts";
import { useViewport } from "./hooks/useViewport.ts";
import { ContextState } from "./components/ContextMenu.tsx";

const App = () => {
	const [stt, setStt] = useState<Stt>(makeInitialStt);
	const [viewport, setViewport] = useState({
		w: window.innerWidth,
		h: window.innerHeight,
	});
	const [hovered, setHovered] = useState("");
	const [context, setContext] = useState<ContextState>({
		coords: [],
		target: null,
	});
	const [errorMessageDisplay, setErrorMessageDisplay] = useState(false);

	const tsvFormRef = useRef<HTMLInputElement | null>(null);
	const faaFormRef = useRef<HTMLInputElement | null>(null);
	const plotRef = useRef<SVGSVGElement | null>(null);
	const plotModel = useMemo(() => {
		return computeFromState(stt, stt.lyr, {
			eValueApplied: stt.eValueApplied,
			eValue: stt.eValue,
			collapse: stt.collapse,
			lns: stt.lns,
			taxSet: stt.taxSet,
			view: stt.view,
		});
	}, [
		stt.eValueApplied,
		stt.eValue,
		stt.collapse,
		stt.lns,
		stt.taxSet,
		stt.view,
		stt.lyr,
		viewport.w,
		viewport.h,
	]);
	const plotModelRef = useRef(plotModel);
	useEffect(() => {
		plotModelRef.current = plotModel;
	}, [plotModel]);

	const actions = useAppActions({
		stt,
		setStt,
		setContext,
		setHovered,
		setErrorMessageDisplay,
		tsvFormRef,
		faaFormRef,
		plotRef,
		plotModelRef,
	});

	useDismissContextMenu(setContext);
	useViewport(setViewport);

	const tmpFetchedIds = stt.fetchedIDs as Record<string, string>;
	const hasPlot = Object.keys(plotModel.relTaxSet).length > 0;

	return (
		<div>
			<LeftSectionCtx.Provider
				value={buildLeftSectionCtxValue({
					stt,
					hoveredKey: hovered,
					tmpFetchedIds,
					IDInfoHandleClick: actions.IDInfoHandleClick,
					relTaxSet: plotModel.relTaxSet,
					ancestors: plotModel.ancestors,
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

			{hasPlot ? (
				<Plot
					viewport={viewport}
					ancestors={plotModel.ancestors}
					relTaxSet={plotModel.relTaxSet}
					paintingOrder={plotModel.paintingOrder}
					handleHover={setHovered}
					handlePlotRightClick={actions.handlePlotRightClick}
					lyr={stt.lyr}
					view={stt.view}
					plotHandleClick={actions.plotHandleClick}
					plotRef={plotRef}
				/>
			) : (
				<div style={{ position: "fixed", top: 0, left: 0, padding: 12 }}>
					No data loaded yet.
				</div>
			)}

			<HoverLabel hovered={hovered} relTaxSet={plotModel.relTaxSet} />
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
