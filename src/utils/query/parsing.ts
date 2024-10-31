import {InsightError} from "../../controller/IInsightFacade";

export function parseMComparison(mComparison: object): [string, number] {
	const mComparisonEntries = Object.entries(mComparison);
	if (mComparisonEntries.length !== 1) {
		throw new InsightError("Invalid query");
	} else {
		const mkey = mComparisonEntries[0][0];
		const mfield = mkey.split("_")[1];
		const number = Number(mComparisonEntries[0][1]);
		return [mfield, number];
	}
}

export function parseSComparison(sComparison: object): [string, RegExp] {
	const sComparisonEntries = Object.entries(sComparison);
	if (sComparisonEntries.length !== 1) {
		throw new InsightError("Invalid query");
	} else {
		const skey = sComparisonEntries[0][0];
		const sfield = skey.split("_")[1];
		const pattern = RegExp("^" + sComparisonEntries[0][1].replace(/\*/g, ".*") + "$");
		return [sfield, pattern];
	}
}
