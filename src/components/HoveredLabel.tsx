import { useMemo } from "react";

import { twoVminHeights } from "../services/predefinedObjects.tsx";

interface Props {
	ancestors?: any;
	hovered: string;
	lyr?: string;
	relTaxSet?: any;
	handleHover?: any;
	plotHandleClick?: any;
}

const HoverLabel = ({
	ancestors,
	hovered,
	lyr,
	relTaxSet,
	handleHover,
	plotHandleClick,
}: Props) => {
	const signature = hovered;
	return useMemo(() => {
		if (hovered === "") {
			return <></>;
		}

		const twoVmin = Math.min(window.innerWidth, window.innerHeight) / (100 / 2);

		const hc =
			hovered === lyr && ancestors.length > 0
				? () => plotHandleClick(ancestors[0].ancKey)
				: () => plotHandleClick(hovered);
		return (
			<div
				style={{
					position: "fixed",
					top: relTaxSet[hovered]["lblObj"]["frameY"],
					left: relTaxSet[hovered]["lblObj"]["frameX"],
					zIndex: 100,
					border: "0.3vmin solid #800080",
					transformOrigin: relTaxSet[hovered]["lblObj"]["frameTransformOrigin"],
					transform: relTaxSet[hovered]["lblObj"]["frameTransform"],
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
						lineHeight: `${twoVminHeights[twoVmin]}px`,
						fontSize: "2.1vmin",
						color: "#800080",
						fontFamily: "calibri",
						pointerEvents: "none",
					}}
				>
					{relTaxSet[hovered]["lblObj"]["extContent"]}
				</p>
			</div>
		);
	}, [signature]);
};

export default HoverLabel;
