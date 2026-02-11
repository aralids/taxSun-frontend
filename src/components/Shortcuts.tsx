import { useContext, useMemo } from "react";
import Card from "react-bootstrap/Card";

import { LeftSectionCtx } from "../contexts/LeftSectionCtx";

const Shortcuts = () => {
	const ctx: any = useContext(LeftSectionCtx);
	return useMemo(() => {
		let arr: any[] = [];
		for (let anc of ctx["ancestors"]) {
			arr = arr.concat(
				<Card.Text
					className="m-0 p-0"
					onClick={anc["ancHandleClick"]}
					style={{ cursor: "pointer" }}
				>
					{anc["ancPerc"]}% of <b>{anc["ancName"]}</b>
				</Card.Text>,
			);
		}
		return (
			<div className="p-0 m-0 pt-2" style={{ display: "block" }}>
				{...arr}
			</div>
		);
	}, [ctx["name"], ctx["rank"]]);
};

export default Shortcuts;
