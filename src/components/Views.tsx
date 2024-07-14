import { useContext, useMemo } from "react";
import { RightSectionCtx } from "../App.tsx";

const Views = () => {
	const ctx: any = useContext(RightSectionCtx);
	return useMemo(() => {
		return (
			<fieldset
				onChange={ctx["viewHandleChange"]}
				ref={ctx["radioRef"]}
				style={{ border: "none", padding: "0", margin: "2vh 0 0 0" }}
			>
				<div style={{ display: "flex", alignItems: "start" }}>
					<input
						id="unaltered"
						type="radio"
						name="radio"
						style={{ accentColor: "#800080" }}
					/>
					<label htmlFor="unaltered" style={{ padding: "0 0 0 0.5vw" }}>
						Unaltered
					</label>
				</div>
				<div style={{ display: "flex", alignItems: "start" }}>
					<input
						id="married-i"
						type="radio"
						name="radio"
						style={{ accentColor: "#800080" }}
					/>
					<label htmlFor="married-i" style={{ padding: "0 0 0 0.5vw" }}>
						Married I
					</label>
				</div>
				<div style={{ display: "flex", alignItems: "start" }}>
					<input
						id="married-ii"
						type="radio"
						name="radio"
						style={{ accentColor: "#800080" }}
					/>
					<label htmlFor="married-ii" style={{ padding: "0 0 0 0.5vw" }}>
						Married II
					</label>
				</div>
				<div style={{ display: "flex", alignItems: "start" }}>
					<input
						id="all-equal"
						type="radio"
						name="radio"
						style={{ accentColor: "#800080" }}
					/>
					<label htmlFor="all-equal" style={{ padding: "0 0 0 0.5vw" }}>
						All equal
					</label>
				</div>
			</fieldset>
		);
	}, []);
};

export default Views;
