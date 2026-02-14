// src/actions/exportActions.ts
import type React from "react";

import { downloadPlotSvg, downloadSequencesAsTsv } from "../utils/downloads";
import type { PlotModel } from "../types/plotTypes";
import type { Stt } from "../state/state";

type Args = {
	plotRef: React.RefObject<SVGSVGElement | null>;
	sttRef: React.MutableRefObject<Stt>;
	plotModelRef: React.MutableRefObject<PlotModel>;
};

export function makeExportActions({ plotRef, sttRef, plotModelRef }: Args) {
	const dldOnClick = () => {
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
	};

	// ✅ uses derived plot model (not stt)
	const handleCopyClick = (target: string, unspecOnly: any) => {
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
	};

	const handleDownloadSeqClick = (target: string, unspecOnly: any) => {
		downloadSequencesAsTsv(target, !!unspecOnly, {
			relTaxSet: plotModelRef.current.relTaxSet,
			faaObj: sttRef.current.faaObj,
			tsvName: sttRef.current.tsvName,
			faaName: sttRef.current.faaName,
			eValueApplied: sttRef.current.eValueApplied,
			eValue: sttRef.current.eValue,
		});
	};

	return {
		dldOnClick,
		handleCopyClick,
		handleDownloadSeqClick,
	};
}
