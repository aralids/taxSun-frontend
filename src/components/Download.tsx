import { useContext } from "react";
import { RightSectionCtx } from "../contexts/RightSectionCtx";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const Download = () => {
	const { dldOnClick } = useContext(RightSectionCtx);

	return (
		<Card className="mt-3" bg="light" text="black" style={{ width: "18vw" }}>
			<Card.Header>Download:</Card.Header>
			<Card.Body>
				<Button
					onClick={dldOnClick}
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
};

export default Download;
