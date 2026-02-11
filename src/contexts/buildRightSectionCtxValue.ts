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
	eValueRef: any;
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
	eValueRef,
}: BuildRightCtxArgs) {
	return {
		tsvLastTry: stt.tsvLastTry,
		tsvLoadStatus: stt.tsvLoadStatus,
		uplTsvHandleChange,
		tsvFormRef: tsvFormRef,

		fastaEnabled: stt.fastaEnabled,
		faaLastTry: stt.faaLastTry,
		faaLoadStatus: stt.faaLoadStatus,
		uplFaaHandleChange,
		faaFormRef: faaFormRef,

		coll: stt["collapse"],
		collHandleChange,

		eValueEnabled: stt["eValueEnabled"],
		eValueApplied: stt["eValueApplied"],
		eValueAppliedHandleChange,
		eValueHandleKeyDown,
		eValueRef,

		viewHandleChange,

		dldOnClick,

		view: stt.view as ViewMode,
	};
}
