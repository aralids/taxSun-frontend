import { useContext, useMemo } from "react";
import { LeftSectionCtx } from "../App.tsx";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const IDInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);

	return useMemo(() => {
		if (ctx["name"] === "root" || ctx["name"].includes("&")) {
			return <></>;
		} else if (ctx["id"] === "") {
			return (
				<div className="p-0 m-0 pt-2 d-flex">
					<Card.Text className="p-0 m-0 pt-2 pb-2">NCBI ID: </Card.Text>
					<Button
						className="m-0 p-2 ms-2 border-0"
						onClick={ctx["IDInfoHandleClick"]}
					>
						FETCH
					</Button>
				</div>
			);
		}
		return (
			<div className="p-0 m-0 pt-2 d-flex">
				<Card.Text className="p-0 m-0 pt-2 pb-2">NCBI ID: </Card.Text>
				<Card.Link
					className="p-0 m-0 pt-2 pb-2 ms-2 taxid-link"
					target="_blank"
					href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${ctx["id"]}&lvl=3&lin=f&keep=1&srchmode=1&unlock`}
				>
					{"  "}
					{ctx["id"]}
				</Card.Link>
			</div>
		);
	}, [ctx["name"], ctx["root"], ctx["id"]]);
};

export default IDInfo;
