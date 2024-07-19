import { useContext, useMemo } from "react";

import { RightSectionCtx } from "../App.tsx";

const EValue = () => {
	const ctx: any = useContext(RightSectionCtx);
	const signature =
		JSON.stringify(ctx["eValueApplied"]) + JSON.stringify(ctx["eValueEnabled"]);
	return useMemo(() => {
		const fontColor = ctx["eValueEnabled"] ? "black" : "lightgrey";
		return (
			<div style={{ display: "flex", alignItems: "start" }}>
				<input
					type="checkbox"
					name="eValueApplied"
					style={{ accentColor: "#800080" }}
					onChange={ctx["eValueAppliedHandleChange"]}
					checked={ctx["eValueApplied"]}
					disabled={!ctx["eValueEnabled"]}
				/>
				<div>
					<label
						htmlFor="eValueApplied"
						style={{ padding: "0 0 0 0.5vw", color: fontColor }}
					>
						Filter by e-value:
					</label>
					<input
						type="text"
						defaultValue={1.9e-28}
						style={{
							height: "2vh",
							maxWidth: "3vw",
							marginLeft: "0.5vw",
							color: fontColor,
						}}
						onKeyDown={ctx["eValueHandleKeyDown"]}
						ref={ctx["eValueRef"]}
						disabled={!ctx["eValueEnabled"]}
					/>
				</div>
			</div>
		);
	}, [signature]);
};

export default EValue;
