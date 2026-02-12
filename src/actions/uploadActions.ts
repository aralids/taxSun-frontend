// src/actions/uploadActions.ts
import type React from "react";

import { uploadTsv, uploadFaa } from "../services/taxSunApi";
import type { Stt } from "../state/state";

type Args = {
	setStt: React.Dispatch<React.SetStateAction<Stt>>;
	setErrorMessageDisplay: React.Dispatch<React.SetStateAction<boolean>>;
	tsvFormRef: React.RefObject<HTMLInputElement | null>;
	faaFormRef: React.RefObject<HTMLInputElement | null>;
};

export function makeUploadActions({
	setStt,
	setErrorMessageDisplay,
	tsvFormRef,
	faaFormRef,
}: Args) {
	const uplTsvHandleChange = async () => {
		const file = tsvFormRef.current?.files?.[0];
		if (!file) return;

		setStt((prev) => ({
			...prev,
			tsvLastTry: file.name,
			tsvLoadStatus: "pending",
		}));

		try {
			const newData = await uploadTsv(file);

			setStt((prev) => ({
				...prev,
				tsvName: file.name,
				tsvLoadStatus: "check",
				eValueEnabled: newData.eValueEnabled,
				eValueInput: String(prev.eValue),
				fastaEnabled: newData.fastaEnabled,

				// new dataset inputs
				lns: newData.lns,
				taxSet: newData.taxSet,

				// reset view inputs for new dataset
				eValueApplied: false,
				collapse: false,
				lyr: "root root",
				view: "allEqual",
			}));
		} catch (error) {
			console.log("error: ", error);
			setStt((prev) => ({
				...prev,
				tsvLoadStatus: "close",
			}));
			setErrorMessageDisplay(true);
		}
	};

	const uplFaaHandleChange = async () => {
		const file = faaFormRef.current?.files?.[0];
		if (!file) return;

		setStt((prev) => ({
			...prev,
			faaLastTry: file.name,
			faaLoadStatus: "pending",
		}));

		try {
			const resData = await uploadFaa(file);
			const newData = resData.faaObj;

			setStt((prev) => ({
				...prev,
				faaObj: newData,
				faaName: file.name,
				faaLoadStatus: "check",
			}));
		} catch (error) {
			console.log("FAA upload error:", error);
			setStt((prev) => ({
				...prev,
				faaLoadStatus: "close",
			}));
		}
	};

	return {
		uplTsvHandleChange,
		uplFaaHandleChange,
	};
}
