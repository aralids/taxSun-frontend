// components/ViewingModes.tsx

import { useContext } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { RightSectionCtx } from "../contexts/RightSectionCtx";

const ViewingModes = () => {
	const ctx: any = useContext(RightSectionCtx);

	return (
		<Card className="mt-3" bg="light" text="black" style={{ width: "18vw" }}>
			<Card.Header>View:</Card.Header>
			<Card.Body>
				{/* Collapse */}
				<Form>
					<Form.Check
						type="checkbox"
						id="collapse"
						label="Collapse"
						onChange={ctx["collHandleChange"]}
						checked={ctx["coll"]}
					/>
				</Form>

				{/* EValue */}
				<Form>
					<Form.Check
						type="checkbox"
						id="eValueApplied"
						label="Filter by e-value: "
						onChange={ctx["eValueAppliedHandleChange"]}
						checked={ctx["eValueApplied"]}
						disabled={!ctx["eValueEnabled"]}
					/>
					<Form.Control
						value={ctx["eValueInput"]}
						onChange={(e) => ctx["eValueHandleChange"](e.target.value)}
						onKeyDown={ctx["eValueHandleKeyDown"]}
						disabled={!ctx["eValueEnabled"]}
					/>
				</Form>

				{/* Views */}
				<Form className="mt-4">
					<Form.Check
						type="radio"
						id="unaltered"
						label="Unaltered"
						name="radio"
						checked={ctx["view"] === "unaltered"}
						onChange={() => ctx["viewHandleChange"]("unaltered")}
					/>

					<Form.Check
						type="radio"
						id="marriedTaxaI"
						label="Married taxa I"
						name="radio"
						checked={ctx["view"] === "marriedTaxaI"}
						onChange={() => ctx["viewHandleChange"]("marriedTaxaI")}
					/>

					<Form.Check
						type="radio"
						id="marriedTaxaII"
						label="Married taxa II"
						name="radio"
						checked={ctx["view"] === "marriedTaxaII"}
						onChange={() => ctx["viewHandleChange"]("marriedTaxaII")}
					/>

					<Form.Check
						type="radio"
						id="allEqual"
						label="All equal"
						name="radio"
						checked={ctx["view"] === "allEqual"}
						onChange={() => ctx["viewHandleChange"]("allEqual")}
					/>
				</Form>
			</Card.Body>
		</Card>
	);
};

export default ViewingModes;
