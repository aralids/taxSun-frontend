import { createContext } from "react";

export const RightSectionCtx = createContext<{ dldOnClick: () => void }>(
	null as unknown as { dldOnClick: () => void },
);
