import { useMemo } from "react";

import { twoVminHeights } from "../services/predefinedObjects.tsx";

const HoverLabel = ({ hovered, relTaxSet }: any) => {
	return useMemo(() => {
		if (hovered === "") {
			return <></>;
		}

		const twoVmin = Math.min(window.innerWidth, window.innerHeight) / (100 / 2);
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
	}, [hovered]);
};

export default HoverLabel;
