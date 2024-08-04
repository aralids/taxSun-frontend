import { useMemo } from "react";
import UploadTsv from "./UploadTsv.tsx";
import UploadFaa from "./UploadFaa.tsx";
import Card from "react-bootstrap/Card";

const Upload = () => {
	return useMemo(() => {
		return (
			<Card
				className="mt-3"
				bg={"light"}
				text={"black"}
				style={{ width: "18vw" }}
			>
				<Card.Header>Load your data:</Card.Header>
				<Card.Body>
					<UploadTsv />
					<UploadFaa />
				</Card.Body>
			</Card>
		);
	}, []);
};

export default Upload;
