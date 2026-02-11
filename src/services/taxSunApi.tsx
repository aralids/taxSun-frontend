// src/services/taxsunApi.js
import { api } from "./apiClient.tsx";

/**
 * Old backend: POST /fetchID { taxName }
 * Returns: { taxID: ... }
 */
export async function fetchTaxIdByName(taxName: any) {
	const res = await api.post("/fetchID", { taxName });
	return res.data; // { taxID: ... }
}

/**
 * Old backend: POST /load_tsv_data (multipart)
 * Returns: { lns, taxSet, eValueEnabled, fastaEnabled, rankPatternFull, ... }
 */
export async function uploadTsv(file: any) {
	const formData = new FormData();
	formData.append("file", file);

	const res = await api.post("/load_tsv_data", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return res.data;
}

/**
 * Old backend: POST /load_faa_data (multipart)
 * Returns: { faaObj: {...} }
 */
export async function uploadFaa(file: any) {
	const formData = new FormData();
	formData.append("file", file);

	const res = await api.post("/load_faa_data", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return res.data; // { faaObj: ... }
}
