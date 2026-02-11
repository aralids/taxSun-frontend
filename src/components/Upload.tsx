import { useContext } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { RightSectionCtx } from "../contexts/RightSectionCtx";

const Upload = () => {
	const ctx: any = useContext(RightSectionCtx);

	const hasTriedTsv = ctx["tsvLastTry"] !== "";
	const hasTriedFaa = ctx["faaLastTry"] !== "";

	return (
		<Card
			className="mt-3"
			bg={"light"}
			text={"black"}
			style={{ width: "18vw" }}
		>
			<Card.Header>Load your data:</Card.Header>
			<Card.Body>
				{/* TSV */}
				{!hasTriedTsv ? (
					<div className="d-flex align-items-center justify-content-center w-100">
						<Button
							className="w-100 p-2 m-0 border-0"
							style={{ transition: "all ease-in-out 1s" }}
						>
							<label
								htmlFor="tsv-file-input"
								className="w-100 d-flex justify-content-center"
								style={{ cursor: "pointer" }}
							>
								<span className="material-symbols-outlined">upload</span>
								TSV
							</label>
						</Button>

						<input
							id="tsv-file-input"
							type="file"
							className="d-none"
							onChange={ctx["uplTsvHandleChange"]}
							ref={ctx["tsvFormRef"]}
						/>
					</div>
				) : (
					<div className="d-flex align-items-center justify-content-between w-100">
						<Button
							className="p-2 m-0 border-0"
							style={{
								width: "20%",
								minWidth: "fit-content",
								transition: "all ease-in-out 1s",
							}}
						>
							<label
								htmlFor="tsv-file-input"
								className="w-100 d-flex justify-content-center"
								style={{ cursor: "pointer" }}
							>
								<span className="material-symbols-outlined">upload</span>
								TSV
							</label>
						</Button>

						<input
							id="tsv-file-input"
							type="file"
							className="d-none"
							onChange={ctx["uplTsvHandleChange"]}
							ref={ctx["tsvFormRef"]}
						/>

						<p
							style={{
								textAlign: "center",
								textOverflow: "ellipsis",
								overflow: "hidden",
								whiteSpace: "nowrap",
							}}
							className="ps-2 pe-2 m-0"
						>
							{ctx["tsvLastTry"]}
						</p>

						<span className="material-symbols-outlined d-inline">
							{ctx["tsvLoadStatus"]}
						</span>
					</div>
				)}

				{/* FAA */}
				{!hasTriedFaa ? (
					<div className="d-flex align-items-center justify-content-center w-100 mt-2">
						<Button
							className="w-100 p-2 m-0 border-0"
							disabled={!ctx["fastaEnabled"]}
							style={{ transition: "all ease-in-out 1s" }}
						>
							<label
								htmlFor="faa-file-input"
								className="w-100 d-flex justify-content-center"
								style={{ cursor: "pointer" }}
							>
								<span className="material-symbols-outlined">upload</span>
								FAA
							</label>
						</Button>

						<input
							id="faa-file-input"
							type="file"
							className="d-none"
							onChange={ctx["uplFaaHandleChange"]}
							ref={ctx["faaFormRef"]}
						/>
					</div>
				) : (
					<div className="d-flex align-items-center justify-content-between w-100 mt-2">
						<Button
							className="p-2 m-0 border-0"
							disabled={!ctx["fastaEnabled"]}
							style={{
								width: "20%",
								minWidth: "fit-content",
								transition: "all ease-in-out 1s",
							}}
						>
							<label
								htmlFor="faa-file-input"
								className="w-100 d-flex justify-content-center"
								style={{ cursor: "pointer" }}
							>
								<span className="material-symbols-outlined">upload</span>
								FAA
							</label>
						</Button>

						<input
							id="faa-file-input"
							type="file"
							className="d-none"
							onChange={ctx["uplFaaHandleChange"]}
							ref={ctx["faaFormRef"]}
						/>

						<p
							style={{
								textAlign: "center",
								textOverflow: "ellipsis",
								overflow: "hidden",
								whiteSpace: "nowrap",
							}}
							className="ps-2 pe-2 m-0"
						>
							{ctx["faaLastTry"]}
						</p>

						<span className="material-symbols-outlined d-inline">
							{ctx["faaLoadStatus"]}
						</span>
					</div>
				)}
			</Card.Body>
		</Card>
	);
};

export default Upload;
