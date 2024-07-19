import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../App.tsx";

const UploadFaa = () => {
	const ctx: any = useContext(RightSectionCtx);
	const signature =
		JSON.stringify(ctx["faaLoadStatus"]) + JSON.stringify(ctx["fastaEnabled"]);
	return useMemo(() => {
		const cursor = ctx["fastaEnabled"] ? "pointer" : "default";
		const fontColor = ctx["fastaEnabled"] ? "black" : "lightgrey";
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginTop: "0.75vh",
				}}
			>
				<input
					id="faa-file-input"
					type="file"
					style={{ display: "none" }}
					ref={ctx["faaFormRef"]}
					onChange={ctx["uplFaaHandleChange"]}
					disabled={!ctx["fastaEnabled"]}
				/>
				<label
					htmlFor="faa-file-input"
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
						color: fontColor,
						cursor: cursor,
					}}
				>
					<span
						className="material-symbols-outlined"
						style={{ display: "inline" }}
					>
						upload
					</span>
					.faa
				</label>
				<span
					className="material-symbols-outlined"
					style={{ display: "inline" }}
				>
					{ctx["faaLoadStatus"]}
				</span>
			</div>
		);
	}, [signature]);
};

export default UploadFaa;
