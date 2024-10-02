import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function ErrorMessage({ display, setDisplay }: any) {
	return (
		<>
			<Modal show={display} onHide={() => setDisplay(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Error</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Line 6 of artificial1.tsv contains an unvalid taxon ID. <br />
					Please inspect your file and try again!
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						href="https://github.com/aralids/taxSun-frontend/wiki"
						target="_blank"
					>
						Visit the wiki
					</Button>
					<Button variant="primary" onClick={() => setDisplay(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

export default ErrorMessage;
