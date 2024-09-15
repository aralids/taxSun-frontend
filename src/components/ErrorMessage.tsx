import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function ErrorMessage({ display, setDisplay }: any) {
	return (
		<>
			<Modal show={display} onHide={() => setDisplay(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Error</Modal.Title>
				</Modal.Header>
				<Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
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
