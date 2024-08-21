import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../App.tsx";

import Form from "react-bootstrap/Form";

const Collapse = () => {
	const ctx: any = useContext(RightSectionCtx);
	return useMemo(() => {
		return (
			<Form>
				<Form.Check
					type={"checkbox"}
					id={`collapse`}
					label={`Collapse`}
					onChange={ctx["collHandleChange"]}
					checked={ctx["coll"]}
				/>
			</Form>
		);
	}, [ctx["coll"]]);
};

export default Collapse;
