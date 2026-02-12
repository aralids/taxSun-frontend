// contexts/buildRightSectionCtxValue.ts
import type React from "react";

export type ViewMode =
	| "unaltered"
	| "marriedTaxaI"
	| "marriedTaxaII"
	| "allEqual";

type BuildRightCtxArgs = {
	stt: any;

	uplTsvHandleChange: React.ChangeEventHandler<HTMLInputElement>;
	uplFaaHandleChange: React.ChangeEventHandler<HTMLInputElement>;

	collHandleChange: React.ChangeEventHandler<HTMLInputElement>;

	eValueAppliedHandleChange: React.ChangeEventHandler<HTMLInputElement>;
	eValueHandleKeyDown: React.KeyboardEventHandler<HTMLInputElement>;

	viewHandleChange: (newView: ViewMode) => void;

	dldOnClick: () => void;

	tsvFormRef: React.RefObject<HTMLInputElement>;
	faaFormRef: React.RefObject<HTMLInputElement>;

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
		tsvLastTry: stt.tsvLastTry as string,
		tsvLoadStatus: stt.tsvLoadStatus as string,
		uplTsvHandleChange,
		tsvFormRef,

		// FAA
		fastaEnabled: Boolean(stt.fastaEnabled),
		faaLastTry: stt.faaLastTry as string,
		faaLoadStatus: stt.faaLoadStatus as string,
		uplFaaHandleChange,
		faaFormRef,

		// Controls
		coll: Boolean(stt.collapse),
		collHandleChange,

		eValueEnabled: Boolean(stt.eValueEnabled),
		eValueApplied: Boolean(stt.eValueApplied),
		eValueAppliedHandleChange,
		eValueHandleKeyDown,

		view: stt.view as ViewMode,
		viewHandleChange,

		// Download
		dldOnClick,

		// E-value input
		eValueInput: stt.eValueInput as string,
		eValueHandleChange,
	};
}
