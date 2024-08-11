import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../App.tsx";
import Button from "react-bootstrap/Button";

const UploadFaa = () => {
	const ctx: any = useContext(RightSectionCtx);
	const signature =
		JSON.stringify(ctx["faaLoadStatus"]) + JSON.stringify(ctx["fastaEnabled"]);
	return useMemo(() => {
		if (ctx["faaLastTry"] === "") {
			return (
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
			);
		} else {
			return (
				<div className="d-flex align-items-center justify-content-between w-100 mt-2">
					<Button
						className="p-2 m-0 border-0"
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
			);
		}
	}, [signature]);
};

export default UploadFaa;
