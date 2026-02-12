export const crop = (lns: string[][][], lyr: string, taxSet: any) => {
	// Get croppedLns.
	const rootTaxa = lyr.split(" ").slice(0, -1).join(" ").split(" & ");
	const rootRank = lyr.split(" ").slice(-1)[0];
	const lyrIndices = rootTaxa.map(
		(item) => taxSet[item + " " + rootRank]["lnIndex"],
	);

	let croppedLns: string[][][] = [];
	for (let i = 0; i < lns.length; i++) {
		for (let j = 0; j < rootTaxa.length; j++) {
			const taxon = rootTaxa[j];
			const index = lyrIndices[j];
			const rank = rootRank;

			if (
				lns[i][index] &&
				lns[i][index][1] === taxon &&
				lns[i][index][0] === rank
			) {
				const croppedLn: string[][] = [[rootRank, rootTaxa.join(" & ")]].concat(
					lns[i].slice(index + 1),
				);
				croppedLns = croppedLns.concat([croppedLn]);
			}
		}
	}

	const relTaxSet: any = {};
	if (rootTaxa.length === 1) {
		relTaxSet[lyr] = { ...taxSet[lyr] };
	} else {
		relTaxSet[lyr] = {
			children: rootTaxa.reduce(
				(acc, txn) => acc.concat(taxSet[txn + " " + rootRank]["children"]),
				[],
			),
			directChildren: rootTaxa.reduce(
				(acc, txn) =>
					acc.concat(taxSet[txn + " " + rootRank]["directChildren"]),
				[],
			),
			eValues: rootTaxa.reduce(
				(acc, txn) => acc.concat(taxSet[txn + " " + rootRank]["eValues"]),
				[],
			),
			fastaHeaders: rootTaxa.reduce(
				(acc, txn) => acc.concat(taxSet[txn + " " + rootRank]["fastaHeaders"]),
				[],
			),
			geneNames: rootTaxa.reduce(
				(acc, txn) => acc.concat(taxSet[txn + " " + rootRank]["geneNames"]),
				[],
			),
			lnIndex: taxSet[rootTaxa[0] + " " + rootRank]["lnIndex"],
			name: rootTaxa.join(" & "),
			names: rootTaxa.reduce(
				(acc, txn) => acc.concat(taxSet[txn + " " + rootRank]["names"]),
				[],
			),
			rank: rootRank,
			rawCount: rootTaxa.reduce(
				(acc, txn) => acc + taxSet[txn + " " + rootRank]["rawCount"],
				0,
			),
			taxID: "",
			totCount: rootTaxa.reduce(
				(acc, txn) => acc + taxSet[txn + " " + rootRank]["totCount"],
				0,
			),
			unaCount: rootTaxa.reduce(
				(acc, txn) => acc + taxSet[txn + " " + rootRank]["unaCount"],
				0,
			),
		};

		let strArr = croppedLns.map((item) => JSON.stringify(item));
		strArr = strArr.filter((value, index, arr) => arr.indexOf(value) === index);
		croppedLns = strArr.map((item) => JSON.parse(item));
	}
	for (const ln of croppedLns) {
		for (let i = 1; i < ln.length; i++) {
			relTaxSet[ln[i][1] + " " + ln[i][0]] = {
				...taxSet[ln[i][1] + " " + ln[i][0]],
			};
		}
	}
	return [croppedLns, relTaxSet];
};
