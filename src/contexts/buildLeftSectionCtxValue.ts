// sections/buildLeftSectionCtxValue.ts

type BuildLeftCtxArgs = {
	stt: any;
	hoveredKey: string;
	tmpFetchedIds: any;
	IDInfoHandleClick: (key: string) => void;
	ancestors: any[];
	ancestorHandleClick: (key: string) => void;
};

export function buildLeftSectionCtxValue({
	stt,
	hoveredKey,
	tmpFetchedIds,
	IDInfoHandleClick,
	ancestors,
	ancestorHandleClick,
}: BuildLeftCtxArgs) {
	const lyr = stt["lyr"];
	const relTaxSet = stt["relTaxSet"];

	const lyrObj = relTaxSet[lyr];

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
