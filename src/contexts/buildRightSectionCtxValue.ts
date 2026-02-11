type BuildRightCtxArgs = {
	stt: any;

	uplTsvHandleChange: () => void;
	uplFaaHandleChange: () => void;

	collHandleChange: () => void;

	eValueAppliedHandleChange: () => void;
	eValueHandleKeyDown: (event: any) => void;

	viewHandleChange: () => void;

	dldOnClick: () => void;

	tsvRef: any;
	faaRef: any;
	eValueRef: any;

	unalteredRef: any;
	marriedIRef: any;
	marriedIIRef: any;
	allEqualRef: any;
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

	tsvRef,
	faaRef,
	eValueRef,

	unalteredRef,
	marriedIRef,
	marriedIIRef,
	allEqualRef,
}: BuildRightCtxArgs) {
	return {
		tsvLastTry: stt.tsvLastTry,
		tsvLoadStatus: stt.tsvLoadStatus,
		uplTsvHandleChange,
		tsvFormRef: tsvRef,

		fastaEnabled: stt.fastaEnabled,
		faaLastTry: stt.faaLastTry,
		faaLoadStatus: stt.faaLoadStatus,
		uplFaaHandleChange,
		faaFormRef: faaRef,

		coll: stt["collapse"],
		collHandleChange,

		eValueEnabled: stt["eValueEnabled"],
		eValueApplied: stt["eValueApplied"],
		eValueAppliedHandleChange,
		eValueHandleKeyDown,
		eValueRef,

		unalteredRef,
		marriedIRef,
		marriedIIRef,
		allEqualRef,
		viewHandleChange,

		dldOnClick,
	};
}
