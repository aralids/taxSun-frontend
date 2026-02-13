// src/state/state.ts
import { lns, taxSet } from "../data/staticData";
import type { ViewMode } from "../plot/computePlotState";

export type Stt = {
	lyr: string;

	lns: any;
	taxSet: any;

	tsvLastTry: string;
	tsvLoadStatus: string;
	tsvName: string;

	faaLastTry: string;
	faaLoadStatus: string;
	faaName: string;
	faaObj: any;

	collapse: boolean;
	eValue: number;
	eValueInput: string;
	eValueApplied: boolean;
	view: ViewMode;

	eValueEnabled: boolean;
	fastaEnabled: boolean;

	fetchedIDs: Record<string, any>;
};

// factory (better than exporting a single object)
export function makeInitialStt(): Stt {
	return {
		lyr: "root root",

		lns,
		taxSet,

		tsvLastTry: "",
		tsvLoadStatus: "",
		tsvName: "default",

		faaLastTry: "",
		faaLoadStatus: "",
		faaName: "",
		faaObj: {},

		collapse: false,
		eValue: 1.9e-28,
		eValueInput: "1.9e-28",
		eValueApplied: false,
		view: "allEqual",

		eValueEnabled: false,
		fastaEnabled: false,

		fetchedIDs: {},
	};
}
