import { useContext } from "react";
import { LeftSectionCtx } from "../App.tsx";

const IDInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);
	const stl = {
		display: "block",
		margin: "2vh 0 2vh 0",
	};

	console.log("IDInfo id: ", ctx["id"]);
	if (ctx["name"] === "root") {
		return <></>;
	} else if (ctx["id"] === "") {
		return (
			<div style={stl}>
				<p style={{ display: "inline" }}>NCBI ID: </p>
				<button
					style={{ display: "inline" }}
					onClick={ctx["IDInfoHandleClick"]}
				>
					FETCH
				</button>
			</div>
		);
	}
	return (
		<div style={stl}>
			<p style={{ display: "inline" }}>NCBI ID: </p>
			<a
				style={{ display: "inline" }}
				target="_blank"
				href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${ctx["id"]}&lvl=3&lin=f&keep=1&srchmode=1&unlock`}
			>
				{ctx["id"]}
			</a>
		</div>
	);
};

export default IDInfo;
