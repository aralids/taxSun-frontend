import { useMemo } from "react";

import Upload from "./Upload.tsx";
import ViewingModes from "./ViewingModes.tsx";
import Download from "./Download.tsx";

const RightSectionCtx = () => {
	return useMemo(() => {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					left: "80vw",
					position: "fixed",
					top: "0",
					width: "18vw",
					zIndex: 100,
				}}
			>
				<Upload />
				<ViewingModes />
				<Download />
			</div>
		);
	}, []);
};
export default RightSectionCtx;
