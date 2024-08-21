import { useContext, useMemo } from "react";

import HoverInfo from "./HoverInfo.tsx";
import LayerInfo from "./LayerInfo.tsx";
import { LeftSectionCtx } from "../App.tsx";

const LeftSection = () => {
	const ctx: any = useContext(LeftSectionCtx);
	return useMemo(() => {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					left: "2vw",
					position: "fixed",
					top: "0",
					width: "18vw",
					zIndex: 100,
				}}
			>
				<LayerInfo />
				<HoverInfo />
			</div>
		);
	}, [ctx["name"], ctx["rank"], ctx["totCount"], ctx["id"]]);
};

export default LeftSection;
