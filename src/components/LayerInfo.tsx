import { useContext, useMemo } from "react";

import BasicLayerInfo from "./BasicLayerInfo.tsx";
import IDInfo from "./IDInfo.tsx";
import Shortcuts from "./Shortcuts.tsx";
import { LeftSectionCtx } from "../App.tsx";

const LayerInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);
	const signature = JSON.stringify(ctx["bsc"]);

	return useMemo(() => {
		return (
			<fieldset
				style={{
					borderColor: "#800080",
					borderRadius: "5px",
					margin: "0",
					marginTop: "2vh",
					maxWidth: "18vw",
					padding: "1.5vh 1.5vw 1.5vh 1.5vw",
					wordBreak: "break-all",
				}}
			>
				<legend
					style={{
						color: "#800080",
						fontWeight: "bold",
						wordBreak: "keep-all",
					}}
				>
					CURRENT LAYER
				</legend>
				<BasicLayerInfo />
				<IDInfo />
				<Shortcuts />
			</fieldset>
		);
	}, [signature]);
};

export default LayerInfo;
