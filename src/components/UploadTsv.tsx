import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../App.tsx";

const UploadTsv = () => {
	const ctx: any = useContext(RightSectionCtx);
	const signature = ctx["tsvLoadStatus"];
	return useMemo(() => {
		if (ctx["tsvLastTry"] === "") {
			return (
				<form
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						maxWidth: "15vw",
					}}
				>
					<input
						id="tsv-file-input"
						type="file"
						style={{ display: "none" }}
						onChange={ctx["uplTsvHandleChange"]}
						ref={ctx["tsvFormRef"]}
					/>
					<label
						htmlFor="tsv-file-input"
						style={{
							border: "1px solid grey",
							borderRadius: "3px",
							backgroundColor: "#F0F0F0",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontFamily: "Arial",
							fontSize: "1.8vh",
							padding: "1px 6px 1px 6px",
							margin: "0",
							width: "100%",
							cursor: "pointer",
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ display: "inline" }}
						>
							upload
						</span>
						.tsv
					</label>
					<span
						className="material-symbols-outlined"
						style={{ display: "inline" }}
					>
						{ctx["tsvLoadStatus"]}
					</span>
				</form>
			);
		} else {
			return (
				<form
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						maxWidth: "15vw",
						padding: "0px",
						margin: "0px",
					}}
				>
					<input
						id="tsv-file-input"
						type="file"
						style={{ display: "none" }}
						onChange={ctx["uplTsvHandleChange"]}
						ref={ctx["tsvFormRef"]}
					/>
					<label
						htmlFor="tsv-file-input"
						style={{
							border: "1px solid grey",
							borderRadius: "3px",
							backgroundColor: "#F0F0F0",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontFamily: "Arial",
							fontSize: "1.8vh",
							padding: "1px 6px 1px 1px",
							margin: "0",
							width: "fit-content",
							minWidth: "53.03px",
							cursor: "pointer",
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ display: "inline" }}
						>
							upload
						</span>
						.tsv
					</label>
					<p
						style={{
							textAlign: "center",
							textOverflow: "ellipsis",
							overflow: "hidden",
							whiteSpace: "nowrap",
							width: "calc(15vw - 77.03px)",
							padding: "0px 6px 0px 6px",
							margin: "0px",
						}}
					>
						{ctx["tsvLastTry"]}
					</p>
					<span
						className="material-symbols-outlined"
						style={{ display: "inline" }}
					>
						{ctx["tsvLoadStatus"]}
					</span>
				</form>
			);
		}
	}, [signature]);
};

export default UploadTsv;
