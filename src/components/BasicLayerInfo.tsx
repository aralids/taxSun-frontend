import { useContext } from "react";
import { LeftSectionCtx } from "../App.tsx";

const BasicLayerInfo = () => {
	const stl = {
		display: "block",
		margin: 0,
	};

	const ctx: any = useContext(LeftSectionCtx);
	if (ctx["rawCount"] === 0) {
		return (
			<div>
				<p style={stl}>
					Taxon: <b>{ctx["name"]}</b>
				</p>
				<p style={stl}>
					Rank: <b>{ctx["rank"]}</b>
				</p>
				<p style={stl}>
					Total count: <b>{ctx["totCount"]}</b>
				</p>
				<p style={stl}>
					Unspec. count: <b>{ctx["unaCount"]}</b>
				</p>
			</div>
		);
	}

	return (
		<div>
			<p style={stl}>
				Taxon: <b>{ctx["name"]}</b>
			</p>
			<p style={stl}>
				Rank: <b>{ctx["rank"]}</b>
			</p>
			<p style={stl}>
				Total count: <b>{ctx["totCount"]}</b>
			</p>
			<p style={stl}>
				Unspec. count: <b>{ctx["unaCount"]}</b>
			</p>
			<p style={stl}>
				Raw file count: <b>{ctx["rawCount"]}</b>
			</p>
		</div>
	);
};

export default BasicLayerInfo;
