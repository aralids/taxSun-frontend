// src/actions/idActions.ts
import type React from "react";

import { fetchTaxIdByName } from "../services/taxSunApi";
import type { Stt } from "../state/state";

type Args = {
	setStt: React.Dispatch<React.SetStateAction<Stt>>;
	sttRef: React.MutableRefObject<Stt>;
};

export function makeIdActions({ setStt, sttRef }: Args) {
	const IDInfoHandleClick = async (key: string) => {
		const lyrAtClick = sttRef.current.lyr;

		try {
			const { taxID } = await fetchTaxIdByName(key);

			setStt((prev) => ({
				...prev,
				fetchedIDs: {
					...prev.fetchedIDs,
					[lyrAtClick]: taxID,
				},
			}));
		} catch (error) {
			console.log("error:", error);
		}
	};

	return { IDInfoHandleClick };
}
