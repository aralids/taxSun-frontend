export type ViewMode =
	| "unaltered"
	| "marriedTaxaI"
	| "marriedTaxaII"
	| "allEqual";

type BuildRightCtxArgs = {
	stt: any;

	uplTsvHandleChange: () => void;
	uplFaaHandleChange: () => void;

	collHandleChange: () => void;

	eValueAppliedHandleChange: () => void;
	eValueHandleKeyDown: (event: any) => void;

	viewHandleChange: (newView: ViewMode) => void;

	dldOnClick: () => void;

	tsvFormRef: any;
	faaFormRef: any;

	eValueHandleChange: (value: string) => void;
};

export function buildRightSectionCtxValue({
	stt,
	uplTsvHandleChange,
	uplFaaHandleChange,
	collHandleChange,
	eValueAppliedHandleChange,
	eValueHandleKeyDown,
	viewHandleChange,
	dldOnClick,
	tsvFormRef,
	faaFormRef,
	eValueHandleChange,
}: BuildRightCtxArgs) {
	return {
		// TSV
		tsvLastTry: stt.tsvLastTry,
		tsvLoadStatus: stt.tsvLoadStatus,
		uplTsvHandleChange,
		tsvFormRef,

		// FAA
		fastaEnabled: stt.fastaEnabled,
		faaLastTry: stt.faaLastTry,
		faaLoadStatus: stt.faaLoadStatus,
		uplFaaHandleChange,
		faaFormRef,

		// Controls
		coll: stt.collapse,
		collHandleChange,

		eValueEnabled: stt.eValueEnabled,
		eValueApplied: stt.eValueApplied,
		eValueAppliedHandleChange,
		eValueHandleKeyDown,

		view: stt.view as ViewMode,
		viewHandleChange,

		// Download
		dldOnClick,

		// E-value input
		eValue: stt.eValue,
		eValueInput: stt.eValueInput,
		eValueHandleChange,
	};
}
