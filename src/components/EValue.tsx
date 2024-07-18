import { useContext, useMemo } from "react";

import { RightSectionCtx } from "../App.tsx";

const EValue = () => {
	const ctx: any = useContext(RightSectionCtx);
	const signature = JSON.stringify(ctx["eValueApplied"]);
	return useMemo(() => {
		console.log("Evalue render");
		return (
			<div style={{ display: "flex", alignItems: "start" }}>
				<input
					type="checkbox"
					name="eValueApplied"
					style={{ accentColor: "#800080" }}
					onChange={ctx["eValueAppliedHandleChange"]}
					checked={ctx["eValueApplied"]}
				/>
				<div>
					<label htmlFor="eValueApplied" style={{ padding: "0 0 0 0.5vw" }}>
						Filter by e-value:
					</label>
					<input
						type="text"
						defaultValue={1.9e-28}
						style={{ height: "2vh", maxWidth: "3vw", marginLeft: "0.5vw" }}
						onKeyDown={ctx["eValueHandleKeyDown"]}
						ref={ctx["eValueRef"]}
					/>
				</div>
			</div>
		);
	}, [signature]);
};

export default EValue;
