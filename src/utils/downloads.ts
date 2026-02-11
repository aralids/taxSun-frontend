export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();

	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPlotSvg(
	svgElement: SVGElement,
	params: {
		tsvName: string;
		lyr: string;
		collapse: boolean;
		eValueApplied: boolean;
		eValue: number;
		view: string;
	},
) {
	const svgString = new XMLSerializer().serializeToString(svgElement);

	const filename = `${params.tsvName.slice(0, 10)}_${params.lyr.slice(0, 10)}_collapse-${
		params.collapse
	}_eValue-${params.eValueApplied ? params.eValue : "false"}_${params.view}.svg`;

	const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
	downloadBlob(blob, filename);
}

export function downloadSequencesAsTsv(
	target: string,
	unspecOnly: boolean,
	args: {
		relTaxSet: any;
		faaObj: any;
		tsvName: string;
		faaName: string;
		eValueApplied: boolean;
		eValue: number;
	},
) {
	const targetTxn = args.relTaxSet[target];
	if (!targetTxn) return;

	let fastaHeaders = targetTxn.fastaHeaders;
	let geneNames = targetTxn.geneNames;
	let names = targetTxn.names;

	if (!unspecOnly) {
		fastaHeaders = fastaHeaders.concat(
			targetTxn.children.reduce((acc: string[], child: string) => {
				const childTxn = args.relTaxSet[child];
				if (!childTxn) return acc;

				names = names.concat(childTxn.names);
				geneNames = geneNames.concat(childTxn.geneNames);
				return acc.concat(childTxn.fastaHeaders);
			}, []),
		);
	}

	const ntSeqs = fastaHeaders.map(
		(item: string) => args.faaObj[item] ?? "No sequence found.",
	);

	const entries: string[] = [];
	for (let i = 0; i < fastaHeaders.length; i++) {
		entries.push(
			`> ${fastaHeaders[i]} (${geneNames[i]}) ${names[i]}\n${ntSeqs[i]}\n\n`,
		);
	}

	const filename = `${unspecOnly ? "unspec" : "all"}_${args.tsvName}_${args.faaName}_${target}${
		args.eValueApplied ? `_${args.eValue}` : ""
	}.tsv`;

	const blob = new Blob([entries.join("\n")], {
		type: "text/tab-separated-values;charset=utf-8",
	});

	downloadBlob(blob, filename);
}
