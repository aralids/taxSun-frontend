import { useMemo } from "react";
import { twoVminHeights } from "../data/staticData";
import { useTwoVmin } from "../hooks/useTwoVmin";

type HoverLabelProps = {
	hovered: string;
	relTaxSet: Record<string, { lblObj?: any }>;
};

const HoverLabel = ({ hovered, relTaxSet }: HoverLabelProps) => {
	const twoVmin = useTwoVmin();

	const lblObj = relTaxSet?.[hovered]?.lblObj;
	const lineHeightPx = useMemo(() => {
		const h = (twoVminHeights as any)[twoVmin];
		return typeof h === "number" ? h : 0;
	}, [twoVmin]);

	if (!hovered || !lblObj) return null;

	return (
		<div
			style={{
				position: "fixed",
				top: lblObj.frameY,
				left: lblObj.frameX,
				zIndex: 100,
				border: "0.3vmin solid #800080",
				transformOrigin: lblObj.frameTransformOrigin,
				transform: lblObj.frameTransform,
				backgroundColor: "white",
				padding: 0,
				height: "fit-content",
				cursor: "pointer",
				pointerEvents: "none",
			}}
		>
			<p
				style={{
					padding: 0,
					paddingLeft: 10,
					paddingRight: 10,
					margin: 0,
					lineHeight: lineHeightPx ? `${lineHeightPx}px` : undefined,
					fontSize: "2.1vmin",
					color: "#800080",
					fontFamily: "calibri",
					pointerEvents: "none",
				}}
			>
				{lblObj.extContent ?? ""}
			</p>
		</div>
	);
};

export default HoverLabel;
