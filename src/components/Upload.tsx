import { useMemo } from "react";
import UploadTsv from "./UploadTsv.tsx";
import UploadFaa from "./UploadFaa.tsx";

const Upload = () => {
	return useMemo(() => {
		return (
			<fieldset
				style={{
					borderColor: "#800080",
					borderRadius: "5px",
					margin: "0",
					marginTop: "2vh",
					maxWidth: "18vw",
					padding: "1.5vh 1.5vw 1.5vh 1.5vw",
					wordBreak: "break-all",
				}}
			>
				<legend
					style={{
						color: "#800080",
						fontWeight: "bold",
						wordBreak: "keep-all",
					}}
				>
					LOAD YOUR DATA
				</legend>
				<UploadTsv />
				<UploadFaa />
			</fieldset>
		);
	}, []);
};

export default Upload;
