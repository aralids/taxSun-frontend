import { useContext, useMemo } from "react";
import Form from "react-bootstrap/Form";

import { RightSectionCtx } from "../App.tsx";

const EValue = () => {
	const ctx: any = useContext(RightSectionCtx);
	const signature =
		JSON.stringify(ctx["eValueApplied"]) + JSON.stringify(ctx["eValueEnabled"]);
	return useMemo(() => {
		const fontColor = ctx["eValueEnabled"] ? "black" : "lightgrey";
		return (
			<Form>
				<Form.Check
					type={"checkbox"}
					id={`eValueApplied`}
					label={`Filter by e-value: `}
					onChange={ctx["eValueAppliedHandleChange"]}
					checked={ctx["eValueApplied"]}
					disabled={!ctx["eValueEnabled"]}
				/>
				<Form.Control
					defaultValue={1.9e-28}
					onKeyDown={ctx["eValueHandleKeyDown"]}
					ref={ctx["eValueRef"]}
					disabled={!ctx["eValueEnabled"]}
				/>
			</Form>
		);
	}, [signature]);
};

export default EValue;
