import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

type ErrorMessageProps = {
	display: boolean;
	setDisplay: React.Dispatch<React.SetStateAction<boolean>>;
};

function ErrorMessage({ display, setDisplay }: ErrorMessageProps) {
	const close = () => setDisplay(false);

	return (
		<Modal show={display} onHide={close}>
			<Modal.Header closeButton>
				<Modal.Title>Error</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				Something seems to be wrong with the file you are trying to upload.
				<br />
				Please inspect your file and try again!
			</Modal.Body>

			<Modal.Footer>
				<Button
					variant="secondary"
					href="https://github.com/aralids/taxSun-frontend/wiki"
					target="_blank"
					rel="noreferrer"
				>
					Visit the wiki
				</Button>
				<Button variant="primary" onClick={close}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default ErrorMessage;
