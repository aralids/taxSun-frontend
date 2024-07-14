import { useContext } from "react";

import { LeftSectionCtx } from "../App.tsx";

const Shortcuts = () => {
	const ctx: any = useContext(LeftSectionCtx);
	const stl = {
		display: "block",
		margin: "0 0 0 0",
		cursor: "pointer",
	};
	let arr: any[] = [];
	for (let anc of ctx["ancestors"]) {
		arr = arr.concat(
			<p onClick={anc["ancHandleClick"]} style={stl}>
				{anc["ancPerc"]}% of <b>{anc["ancName"]}</b>
			</p>
		);
	}
	return <div style={{ display: "block" }}>{...arr}</div>;
};

export default Shortcuts;
