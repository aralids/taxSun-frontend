import { useMemo } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

export type ContextState = {
	coords: number[];
	target: any | null; // later: make this a real union type
};

const ContextMenu = ({
	coords,
	faaName,
	handleCopyClick,
	handleDownloadSeqClick,
	target,
}: any) => {
	return useMemo(() => {
		if (coords.length === 0) {
			return <></>;
		} else {
			let newTop;
			if (coords[1] <= window.innerHeight / 2) {
				newTop = coords[1];
			} else {
				newTop = coords[1] - 4 * 40;
			}
			return (
				<ButtonGroup
					vertical
					style={{
						width: "18vw",
						position: "fixed",
						top: newTop,
						left: coords[0],
						display: "flex",
						flexDirection: "column",
						zIndex: 200,
					}}
				>
					<Button
						className="border-0 m-0 p-2"
						onClick={() => handleCopyClick(target, true)}
					>
						Copy unspecified sequence IDs
					</Button>
					<Button
						className="border-0 m-0 p-2"
						onClick={() => handleCopyClick(target, false)}
						disabled={target.includes("&")}
					>
						Copy all sequence IDs
					</Button>
					<Button
						className="border-0 m-0 p-2"
						disabled={faaName === ""}
						onClick={() => handleDownloadSeqClick(target, true)}
					>
						Download unspecified sequences
					</Button>
					<Button
						className="border-0 m-0 p-2"
						disabled={target.includes("&") || faaName === ""}
						onClick={() => handleDownloadSeqClick(target, false)}
					>
						Download all sequences
					</Button>
				</ButtonGroup>
			);
		}
	}, [target, coords[0], coords[1]]);
};

export default ContextMenu;
