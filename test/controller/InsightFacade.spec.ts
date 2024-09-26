import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import { clearDisk, getContentFromArchives, loadTestQuery } from "../TestUtil";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export interface ITestQuery {
	title?: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let noCoursesDirDataset: string;
	let invalidJSONDataset: string;
	let noResultKeyDataset: string;
	let noSectionsDataset: string;
	let audit1to5001Dataset: string;

	before(async function () {
		// This block runs once and loads the datasets.
		sections = await getContentFromArchives("pair.zip");
		noCoursesDirDataset = await getContentFromArchives("noCoursesDir.zip");
		invalidJSONDataset = await getContentFromArchives("invalidJSON.zip");
		noResultKeyDataset = await getContentFromArchives("noResultKey.zip");
		noSectionsDataset = await getContentFromArchives("noSections.zip");
		audit1to5001Dataset = await getContentFromArchives("audit-1-to-5001.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		await clearDisk();
	});

	describe("AddDataset", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		it("addDataset: empty id throws InsightError", async function () {
			try {
				await facade.addDataset("", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: id with underscore throws InsightError", async function () {
			try {
				await facade.addDataset(
					"invalid_id",
					sections,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: whitespace only id throws InsightError", async function () {
			try {
				await facade.addDataset(" ", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: duplicate id throws InsightError", async function () {
			try {
				await facade.addDataset(
					"dataset",
					sections,
					InsightDatasetKind.Sections
				);
				await facade.addDataset(
					"dataset",
					sections,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: invalid base64 string throws InsightError", async function () {
			try {
				await facade.addDataset("dataset", "?", InsightDatasetKind.Sections);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: zip's root directory has no 'courses' dir throws InsightError", async function () {
			try {
				await facade.addDataset(
					"dataset",
					noCoursesDirDataset,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: courses directory contains no valid JSON throws InsightError", async function () {
			try {
				await facade.addDataset(
					"dataset",
					invalidJSONDataset,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: zip missing JSON with 'result' key throws InsightError", async function () {
			try {
				await facade.addDataset(
					"dataset",
					noResultKeyDataset,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: zip with courses but no sections throws InsightError", async function () {
			try {
				await facade.addDataset(
					"dataset",
					noSectionsDataset,
					InsightDatasetKind.Sections
				);
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset: should fulfill on a successful add", async function () {
			try {
				const res = await facade.addDataset(
					"dataset",
					sections,
					InsightDatasetKind.Sections
				);
				expect(res).to.be.instanceOf(Array<string>);
				expect(res[0]).to.include("dataset");
			} catch (err) {
				expect.fail("Dataset named 'dataset' should have been added");
			}
		});
	});

	describe("RemoveDataset", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		it("removeDataset: empty id throws InsightError", async function () {
			try {
				await facade.removeDataset("");
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("removeDataset: id with underscore throws InsightError", async function () {
			try {
				await facade.removeDataset("invalid_id");
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("removeDataset: whitespace only ID throws InsightError", async function () {
			try {
				await facade.removeDataset(" ");
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("removeDataset: remove id not added throws NotFoundError", async function () {
			try {
				await facade.removeDataset("NotYetAddedID");
				expect.fail("Should have thrown above.");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("removeDataset: successful removal", async function () {
			try {
				await facade.addDataset(
					"dataset",
					sections,
					InsightDatasetKind.Sections
				);
				const removeDatasetRes = await facade.removeDataset("dataset");
				expect(removeDatasetRes).to.equal("dataset");

				const listDatasetsRes = await facade.listDatasets();
				expect(listDatasetsRes.length).to.equal(0);
			} catch (err) {
				expect.fail(
					"Dataset id 'dataset' should have been removed successfully"
				);
			}
		});
	});

	describe("listDatasets", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		it("listDatasets: no datasets", async function () {
			try {
				const res = await facade.listDatasets();
				expect(res.length).to.equal(0);
			} catch (err) {
				expect.fail("No datasets should have been listed");
			}
		});

		it("listDatasets: sections dataset", async function () {
			try {
				const sectionsRowCount = 64612;
				await facade.addDataset(
					"sections",
					sections,
					InsightDatasetKind.Sections
				);
				const res = await facade.listDatasets();
				expect(res.length).to.equal(1);

				expect(res[0].id).to.equal("sections");
				expect(res[0].kind).to.equal(InsightDatasetKind.Sections);
				expect(res[0].numRows).to.equal(sectionsRowCount);
			} catch (err) {
				expect.fail("sections dataset should have been listed");
			}
		});
	});

	describe("PerformQuery", function () {
		/**
		 * Loads the TestQuery specified in the test name and asserts the behaviour of performQuery.
		 *
		 * Note: the 'this' parameter is automatically set by Mocha and contains information about the test.
		 */
		async function checkQuery(this: Mocha.Context): Promise<void> {
			if (!this.test) {
				throw new Error(
					"Invalid call to checkQuery." +
						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
						"Do not invoke the function directly."
				);
			}
			// Destructuring assignment to reduce property accesses
			const { input, expected, errorExpected } = await loadTestQuery(
				this.test.title
			);
			let result: InsightResult[];
			try {
				result = await facade.performQuery(input);
				if (errorExpected) {
					expect.fail(
						`performQuery resolved when it should have rejected with ${expected}`
					);
				}
				expect(result).to.deep.equal(expected);
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}
				if (expected === "InsightError") {
					expect(err).to.be.instanceOf(InsightError);
				} else if (expected === "ResultTooLargeError") {
					expect(err).to.be.instanceOf(ResultTooLargeError);
				} else {
					expect.fail("Invalid expected error type in test query");
				}
			}
		}

		before(async function () {
			facade = new InsightFacade();

			// Add the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises: Promise<string[]>[] = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset(
					"audit1to5001Dataset",
					audit1to5001Dataset,
					InsightDatasetKind.Sections
				),
			];

			try {
				await Promise.all(loadDatasetPromises);
			} catch (err) {
				throw new Error(
					`In PerformQuery Before hook, dataset(s) failed to be added. \n${err}`
				);
			}
		});

		after(async function () {
			await clearDisk();
		});

		/////////////////QUERY VALIDITY/////////////////////////
		it("[invalid/missing-where.json] Query missing BODY", checkQuery);
		it("[invalid/missing-options.json] Query missing OPTIONS", checkQuery);
		it("[invalid/query-is-array.json] Query cannot be an array", checkQuery);

		/////////////////BODY VALIDITY/////////////////////////
		it("[invalid/body-is-array.json] BODY cannot be an array", checkQuery);
		it(
			"[invalid/body-invalid-filter-key.json] BODY filter key must be valid",
			checkQuery
		);

		/////////////////OPTIONS VALIDITY///////////////////////
		it("[invalid/missing-columns.json] Query missing OPTIONS", checkQuery);
		it(
			"[invalid/columns-empty-object.json] Query OPTIONS cannot be an object",
			checkQuery
		);
		it(
			"[invalid/columns-empty-array.json] Query OPTIONS cannot be an empty array",
			checkQuery
		);

		////////////////ResultTooLargeError BEHAVIOUR///////////
		it("[valid/results4999.json] Query with 4999 results", checkQuery);
		it("[valid/results4999.json] Query with 5000 results", checkQuery);
		it(
			"[invalid/results5001.json] Query that would have 5001 results",
			checkQuery
		);

		////////////////INVALID DATASET SELECTIONS///////////////////////
		it(
			"[invalid/multiple-datasets.json] Cannot reference multiple datasets",
			checkQuery
		);
		it(
			"[invalid/dataset-dne.json] Cannot select from a dataset that was not added",
			checkQuery
		);

		///////////////////WILDCARD BEHAVIOUR////////////////////////
		it(
			"[invalid/middle-wildcard.json] Cannot have wildcard in middle of string",
			checkQuery
		);
		it(
			"[valid/start-wildcard.json] Query with wildcard at string start",
			checkQuery
		);
		it(
			"[valid/end-wildcard.json] Query with wildcard at string end",
			checkQuery
		);
		it(
			"[valid/start-end-wildcard.json] Query with wildcard at string start and end",
			checkQuery
		);

		///////////////////KEY SELECTION////////////////////////
		it(
			"[valid/key-select-all.json] Should be able to select all keys",
			checkQuery
		);
		it(
			"[invalid/key-select-invalid.json] Should not be able to select invalid key",
			checkQuery
		);

		///////////////////QUERY LOGIC////////////////////////
		it("[valid/simple.json] SELECT dept, avg WHERE avg > 97", checkQuery);
		it(
			"[valid/all-operators.json] Query with logic using all operators",
			checkQuery
		);
	});
});
