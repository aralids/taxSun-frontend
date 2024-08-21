import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../App.tsx";
import Button from "react-bootstrap/Button";

const UploadTsv = () => {
	const ctx: any = useContext(RightSectionCtx);
	return useMemo(() => {
		if (ctx["tsvLastTry"] === "") {
			return (
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
			);
		} else {
			return (
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
			);
		}
	}, [ctx["tsvLoadStatus"]]);
};

export default UploadTsv;
