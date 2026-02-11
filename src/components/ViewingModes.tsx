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
						id="eValue"
						defaultValue={1.9e-28}
						onKeyDown={ctx["eValueHandleKeyDown"]}
						ref={ctx["eValueRef"]}
						disabled={!ctx["eValueEnabled"]}
					/>
				</Form>

				{/* Views */}
				<Form className="mt-4" onChange={ctx["viewHandleChange"]}>
					<Form.Check
						type="radio"
						id="unaltered"
						label="Unaltered"
						ref={ctx["unalteredRef"]}
						defaultChecked={false}
						name="radio"
					/>
					<Form.Check
						type="radio"
						id="marriedTaxaI"
						label="Married taxa I"
						ref={ctx["marriedIRef"]}
						defaultChecked={false}
						name="radio"
					/>
					<Form.Check
						type="radio"
						id="marriedTaxaII"
						label="Married taxa II"
						ref={ctx["marriedIIRef"]}
						defaultChecked={false}
						name="radio"
					/>
					<Form.Check
						type="radio"
						id="allEqual"
						label="All equal"
						ref={ctx["allEqualRef"]}
						defaultChecked={true}
						name="radio"
					/>
				</Form>
			</Card.Body>
		</Card>
	);
};

export default ViewingModes;
