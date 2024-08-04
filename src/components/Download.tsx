import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../App.tsx";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const Download = () => {
	const ctx: any = useContext(RightSectionCtx);
	return useMemo(() => {
		return (
			<Card
				className="mt-3"
				bg={"light"}
				text={"black"}
				style={{ width: "18vw" }}
			>
				<Card.Header>Download:</Card.Header>
				<Card.Body>
					<Button
						onClick={ctx["dldOnClick"]}
						className="w-100 p-2 m-0 border-0 d-flex justify-content-center"
					>
						<span
							className="material-symbols-outlined"
							style={{ display: "inline" }}
						>
							download
						</span>
						SVG
					</Button>
				</Card.Body>
			</Card>
		);
	}, []);
};

export default Download;
