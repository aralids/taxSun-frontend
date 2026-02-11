import { computePlotState, type ViewMode } from "./computePlotState";
import type { Stt } from "../state/state";

type Overrides = Partial<
	Pick<Stt, "eValueApplied" | "eValue" | "collapse" | "lns" | "taxSet" | "view">
>;

export type DerivedPlotState = Pick<
	Stt,
	"relTaxSet" | "paintingOrder" | "ancestors"
>;

export function computeFromState(
	prev: Stt,
	key: string,
	overrides?: Overrides,
): DerivedPlotState {
	const computed = computePlotState({
		eValueApplied: overrides?.eValueApplied ?? prev.eValueApplied,
		eValue: overrides?.eValue ?? prev.eValue,
		collapse: overrides?.collapse ?? prev.collapse,
		lns: overrides?.lns ?? prev.lns,
		key,
		taxSet: overrides?.taxSet ?? prev.taxSet,
		view: (overrides?.view ?? prev.view) as ViewMode,
	});

	return {
		relTaxSet: computed.relTaxSet,
		paintingOrder: computed.paintingOrder,
		ancestors: computed.ancestors,
	};
}
