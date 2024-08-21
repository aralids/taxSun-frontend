import { useContext, useMemo } from "react";
import Form from "react-bootstrap/Form";

import { RightSectionCtx } from "../App.tsx";

const EValue = () => {
	const ctx: any = useContext(RightSectionCtx);
	return useMemo(() => {
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
	}, [ctx["eValueApplied"], ctx["eValueEnabled"]]);
};

export default EValue;
