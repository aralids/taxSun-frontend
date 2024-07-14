import { useContext, useMemo } from "react";
import { LeftSectionCtx } from "../App.tsx";

const HoverInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);
	const signature = JSON.stringify(ctx["hovered"]);
	return useMemo(() => {
		console.log("HoverInfo render");
		if (!ctx["hovered"]) {
			return <></>;
		}
		const stl = {
			display: "block",
			margin: 0,
		};
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
					HOVERING OVER
				</legend>
				<p style={stl}>
					Taxon: <b>{ctx["hovered"]["name"]}</b>
				</p>
				<p style={stl}>
					Rank: <b>{ctx["hovered"]["rank"]}</b>
				</p>
				<p style={stl}>
					Total count: <b>{ctx["hovered"]["totCount"]}</b>
				</p>
				<p style={stl}>
					Unassigned count: <b>{ctx["hovered"]["unaCount"]}</b>
				</p>
			</fieldset>
		);
	}, [signature]);
};

export default HoverInfo;
