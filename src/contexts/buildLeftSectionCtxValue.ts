// contexts/buildLeftSectionCtxValue.ts

type BuildLeftCtxArgs = {
	stt: any; // you can tighten later to Stt
	hoveredKey: string;
	tmpFetchedIds: any;
	IDInfoHandleClick: (key: string) => void;

	// derived plot data passed in (not from stt)
	relTaxSet: any;

	ancestors: any[];
	ancestorHandleClick: (key: string) => void;
};

export function buildLeftSectionCtxValue({
	stt,
	hoveredKey,
	tmpFetchedIds,
	IDInfoHandleClick,
	relTaxSet,
	ancestors,
	ancestorHandleClick,
}: BuildLeftCtxArgs) {
	const lyr = stt["lyr"];
	const lyrObj = relTaxSet?.[lyr];

	return {
		...lyrObj,
		rawCount: lyrObj?.["rawCount"],
		id: Boolean(lyrObj?.["taxID"])
			? lyrObj["taxID"]
			: (tmpFetchedIds?.[lyr] ?? ""),
		IDInfoHandleClick: () =>
			IDInfoHandleClick(lyr.split(" ").slice(0, -1).join(" ")),
		ancestors,
		hovered: relTaxSet?.[hoveredKey],
		ancestorHandleClick,
	};
}
