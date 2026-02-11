import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../contexts/RightSectionCtx";

import Form from "react-bootstrap/Form";

const Views = () => {
	const ctx: any = useContext(RightSectionCtx);
	return useMemo(() => {
		return (
			<Form className="mt-4" onChange={ctx["viewHandleChange"]}>
				<Form.Check
					type={"radio"}
					id="unaltered"
					label={`Unaltered`}
					ref={ctx["unalteredRef"]}
					defaultChecked={false}
					name="radio"
				/>
				<Form.Check
					type={"radio"}
					id="marriedTaxaI"
					label={`Married taxa I`}
					ref={ctx["marriedIRef"]}
					defaultChecked={false}
					name="radio"
				/>
				<Form.Check
					type={"radio"}
					id="marriedTaxaII"
					label={`Married taxa II`}
					ref={ctx["marriedIIRef"]}
					defaultChecked={false}
					name="radio"
				/>
				<Form.Check
					type={"radio"}
					id="allEqual"
					label={`All equal`}
					ref={ctx["allEqualRef"]}
					defaultChecked={true}
					name="radio"
				/>
			</Form>
		);
	}, []);
};

export default Views;
