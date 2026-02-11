import { computePlotState, type ViewMode } from "./computePlotState";
import type { Stt } from "../state/state";

type Overrides = Partial<
	Pick<Stt, "eValueApplied" | "eValue" | "collapse" | "lns" | "taxSet" | "view">
>;

export function computeFromState(
	prev: Stt,
	key: string,
	shortcutsHandleClick: (k: string) => void,
	overrides?: Overrides,
) {
	return computePlotState({
		eValueApplied: overrides?.eValueApplied ?? prev.eValueApplied,
		eValue: overrides?.eValue ?? prev.eValue,
		collapse: overrides?.collapse ?? prev.collapse,
		lns: overrides?.lns ?? prev.lns,
		key,
		taxSet: overrides?.taxSet ?? prev.taxSet,
		view: (overrides?.view ?? prev.view) as ViewMode,
		shortcutsHandleClick,
	});
}
