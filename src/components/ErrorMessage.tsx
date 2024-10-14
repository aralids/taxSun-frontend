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
					Something seems to be wrong with the file you are trying to upload.{" "}
					<br />
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
