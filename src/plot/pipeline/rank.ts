export const calcMinRankPattern = (
	croppedLns: any[][],
	rankPatternFull: string[],
) => {
	let ranksUnique: string[] = croppedLns.reduce(
		(accumulator, ln) => accumulator.concat(ln.map((item) => item[0])),
		[],
	);
	ranksUnique = ranksUnique.filter(
		(value, index, array) => Boolean(value) && array.indexOf(value) === index,
	);
	let rankPattern: string[] = rankPatternFull.filter(
		(item) => ranksUnique.indexOf(item) > -1,
	);

	return rankPattern;
};
