import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives, loadTestQuery} from "../TestUtil";

import {expect, use} from "chai";
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
	let emptyDataset: string;
	let validDatasetOneCourse: string;

	before(async function () {
		// This block runs once and loads the datasets.
		sections = await getContentFromArchives("pair.zip");
		emptyDataset = await getContentFromArchives("emptyDataset.zip");
		validDatasetOneCourse = await getContentFromArchives(
			"validDatasetOneCourse.zip"
		);
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
		it("Success AddDataset -> Adds a valid dataset", async function () {
			const result = await facade.addDataset(
				"WRDS150",
				sections,
				InsightDatasetKind.Sections
			);

			// Check that the result is an array
			expect(result).to.be.an("array");

			// Check that the array contains exactly one element
			expect(result).to.have.lengthOf(1);

			// Check that the element is a string and equals "WRDS150"
			expect(result[0]).to.be.a("string").and.to.equal("WRDS150");
		});
		it("Success AddDataset -> Adding multiple datasets", async function () {
			const testIDs = ["testDataset1", "testDataset2"];
			const expectedLength = testIDs.length;
			await facade.addDataset(
				testIDs[0],
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			const result = await facade.addDataset(
				testIDs[1],
				sections,
				InsightDatasetKind.Sections
			);

			expect(result).to.be.an("array");
			expect(result).to.have.lengthOf(expectedLength);

			result.forEach((datasets) => {
				expect(testIDs).to.include(datasets);
			});
		});
		it("Success AddDataset -> Allows adding multiple datasets differing only in case", async function () {
			const testIDs = ["TESTid", "testID"];
			const expectedDatasetCount = testIDs.length;

			//TODO replace sections with smaller file
			await facade.addDataset(
				testIDs[0],
				sections,
				InsightDatasetKind.Sections
			);
			const result = await facade.addDataset(
				testIDs[1],
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);

			expect(result).to.be.an("array");
			expect(result).to.have.lengthOf(expectedDatasetCount);
			result.forEach((id) => {
				expect(testIDs).to.include(id);
			});
		});
		it("Success AddDataset -> Allows adding section where all string fields are empty", async function () {
			const validEmptyStringFields = await getContentFromArchives(
				"validEmptyStringFields.zip"
			);

			const result = await facade.addDataset(
				"testingEmptyStringFields",
				validEmptyStringFields,
				InsightDatasetKind.Sections
			);

			expect(result).to.be.an("array");
			expect(result[0])
				.to.be.a("string")
				.and.to.equal("testingEmptyStringFields");
		});
		it("Maintains result array in multiple instances of InsightFacade", async function () {
			// Add to one instance then make another and check that result is the same
			const expectedResult = [
				{
					id: "testDatasetPersistence",
					kind: InsightDatasetKind.Sections,
					numRows: 1,
				},
			];
			await facade.addDataset(
				"testDatasetPersistence",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			const newFacade = new InsightFacade();

			const result = await newFacade.listDatasets();

			expect(result).to.be.an("array");
			expect(result).to.have.lengthOf(1);
			result.forEach((item) => {
				expect(item).to.be.an("object");
				expect(expectedResult).to.deep.include(item);
			});
		});
		describe("Failure Cases", function () {
			it("Failure AddDataset -> should reject with an empty dataset id", async function () {
				try {
					const result = await facade.addDataset(
						"",
						sections,
						InsightDatasetKind.Sections
					);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Rejecting with id being only whitespace", async function () {
				try {
					const result = await facade.addDataset(
						"  ",
						sections,
						InsightDatasetKind.Sections
					);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Rejecting id which contains an underscore", async function () {
				try {
					const result = await facade.addDataset(
						"invalid_id",
						sections,
						InsightDatasetKind.Sections
					);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Rejecting a non base64 content string", async function () {
				try {
					const content = "invalid_content";
					const result = await facade.addDataset(
						"CPSC310",
						content,
						InsightDatasetKind.Sections
					);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Empty Dataset -> Invalid input", async function () {
				// Results array is empty
				try {
					const result = await facade.addDataset(
						"emptyDatasetTest",
						emptyDataset,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with no sections -> Invalid input", async function () {
				// Results array is empty
				try {
					const datasetNoSection = await getContentFromArchives(
						"datasetNoSection.zip"
					);
					const result = await facade.addDataset(
						"emptyDatasetTest",
						datasetNoSection,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing audit", async function () {
				try {
					const datasetMissingAudit = await getContentFromArchives(
						"datasetSectionMissingAudit.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingAudit,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Avg", async function () {
				try {
					const datasetMissingAvg = await getContentFromArchives(
						"datasetSectionMissingAvg.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingAvg,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Course", async function () {
				try {
					const datasetMissingCourse = await getContentFromArchives(
						"datasetSectionMissingCourse.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingCourse,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Fail", async function () {
				try {
					const datasetMissingFail = await getContentFromArchives(
						"datasetSectionMissingFail.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingFail,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing ID", async function () {
				try {
					const datasetMissingID = await getContentFromArchives(
						"datasetSectionMissingID.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingID,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Pass", async function () {
				try {
					const datasetMissingPass = await getContentFromArchives(
						"datasetSectionMissingPass.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingPass,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Professor", async function () {
				try {
					const datasetMissingProfessor = await getContentFromArchives(
						"datasetSectionMissingProfessor.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingProfessor,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Subject", async function () {
				try {
					const datasetMissingSubject = await getContentFromArchives(
						"datasetSectionMissingSubject.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingSubject,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Title", async function () {
				try {
					const datasetMissingTitle = await getContentFromArchives(
						"datasetSectionMissingTitle.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingTitle,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Dataset with invalid sections -> Invalid input missing Year", async function () {
				try {
					const datasetMissingYear = await getContentFromArchives(
						"datasetSectionMissingYear.zip"
					);
					const result = await facade.addDataset(
						"missingFieldDatasetTest",
						datasetMissingYear,
						InsightDatasetKind.Sections
					);
					return expect(result).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Content results name is invalid", async function () {
				try {
					const invalidContentName = await getContentFromArchives(
						"invalidContentResultName.zip"
					);
					await facade.addDataset(
						"invalidContentTest",
						invalidContentName,
						InsightDatasetKind.Sections
					);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Rejecting the wrong kind value", async function () {
				try {
					const result = await facade.addDataset(
						"CPSC310",
						sections,
						InsightDatasetKind.Rooms
					);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
			it("Failure AddDataset -> Rejecting a value dataset which already exists in the db", async function () {
				// Add the dataset, then try to add it again. This could also go in its own describe potentially
				try {
					const result1 = await facade.addDataset(
						"UBCcourses",
						sections,
						InsightDatasetKind.Sections
					);

					// Checking that result1 was added
					expect(result1).to.be.an("array");
					expect(result1[0]).to.be.a("string").and.to.equal("UBCcourses");

					const result2 = await facade.addDataset(
						"UBCcourses",
						sections,
						InsightDatasetKind.Sections
					);

					return expect(result2).to.be.rejectedWith(InsightError);
				} catch (err) {
					expect(err).to.be.instanceOf(InsightError);
				}
			});
		});
	});

	describe("RemoveQuery", function () {
		beforeEach(function () {
			// New instance of InsightFacade
			facade = new InsightFacade();
			// TODO: Can also just load in one dataset here
		});
		afterEach(async function () {
			// So that InsightFacade is reset for each test
			await clearDisk();
		});
		it("Failure RemoveQuery -> Rejects with an empty dataset id", async function () {
			try {
				const result = await facade.removeDataset("");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
		it("Failure RemoveQuery -> Rejects with whitespace dataset id", async function () {
			try {
				const result = await facade.removeDataset(" ");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
		it("Failure RemoveQuery -> Rejects with invalid dataset id", async function () {
			try {
				const result = await facade.removeDataset("invalid_id");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
		it("Failure RemoveQuery -> Rejects when presented with a valid ID which does not exist in the db", async function () {
			try {
				await facade.addDataset(
					"testDataset",
					sections,
					InsightDatasetKind.Sections
				);
				// Need to first add some data to the db
				await facade.removeDataset("CPSC100");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});
		it("Success RemoveQuery -> Removed item from the db corresponding to the given param id -> Multiple items exist", async function () {
			// Add data to the db, then remove it
			// Check that return type is a string array which still contains items, but not our item
			await facade.addDataset(
				"testData",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			await facade.addDataset(
				"secondDataset",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			const result = await facade.removeDataset("testData");

			expect(result).to.be.a("string");
			expect(result).to.equal("testData");

			const itemsRemaining = await facade.listDatasets();

			expect(itemsRemaining).to.have.lengthOf(1);
			expect(itemsRemaining[0].id).to.equal("secondDataset");
		});
		it("Success RemoveQuery -> Removed item from db corresponding to the given param id -> No other items exist", async function () {
			// Add data to the db, then remove it
			// Check that the return type is an empty string array
			await facade.addDataset(
				"testData",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			const result = await facade.removeDataset("testData");

			expect(result).to.be.a("string");
			expect(result).to.equal("testData");

			const itemsRemaining = await facade.listDatasets();

			expect(itemsRemaining).to.have.lengthOf(0);
		});
		it("Success RemoveQuery -> Check that the dataset was removed from the disk memory", async function () {
			// Add data to the db then remove it
			// check that the return type is a string array, and check that the disk memory no longer contains the deleted item
			const secondFacade = new InsightFacade();

			await facade.addDataset(
				"testData",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			await facade.addDataset(
				"secondDataset",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			await facade.removeDataset("testData");

			const result = await secondFacade.listDatasets();

			expect(result).to.have.lengthOf(1);
			expect(result[0].id).to.equal("secondDataset");
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
				expect(input).to.be.an("object");
				result = await facade.performQuery(input);

				// If we get here, then performQuery did not throw error
				const maximumResultLength = 5001;
				expect(result).to.deep.equal(
					expected,
					"Query result matches expected output"
				);
				expect(result).to.be.an("array");
				expect(result.length).to.equal(expected.length);
				expect(result.length).to.be.at.most(
					maximumResultLength,
					"Result size should not exceed 5000"
				);
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}
				if (expected === "ResultTooLargeError") {
					expect(err).to.be.instanceOf(ResultTooLargeError);
				} else if (expected === "InsightError") {
					expect(err).to.be.instanceOf(InsightError);
				} else {
					expect.fail(`Unexpected error type: ${err}`);
				}
				return;
			}
			// Double-checking that performQuery didn't resolve when it should have rejected
			if (errorExpected) {
				expect.fail(
					`performQuery resolved when it should have rejected with ${expected}`
				);
			}
		}

		before(async function () {
			facade = new InsightFacade();

			// Add the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises: Promise<string[]>[] = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset(
					"validDatasetOneCourse",
					validDatasetOneCourse,
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

		// Examples demonstrating how to test performQuery using the JSON Test Queries.
		// The relative path to the query file must be given in square brackets.
		it("[valid/simple.json] SELECT dept, avg WHERE avg > 97", checkQuery);
		it("[invalid/invalid.json] Query missing WHERE", checkQuery);
		describe("PerformQuery Failure cases", function () {
			it("[invalid/andEmpty.json] AND is empty", checkQuery);
			it("[invalid/columnsEmpty.json] COLUMNS is empty", checkQuery);
			it("[invalid/invalidFilterKey.json] Filter key is invalid", checkQuery);
			it(
				"[invalid/incorrectFilterType.json] Filter type is invalid",
				checkQuery
			);
			it(
				"[invalid/referencingNonExistentDataset.json] Referenced dataset DNE",
				checkQuery
			);
			it(
				"[invalid/optionsMissingColumn.json] Missing COLUMNS in OPTIONS",
				checkQuery
			);
			it(
				"[invalid/incorrectValueTypeEQ.json] EQ value is not number",
				checkQuery
			);
			it(
				"[invalid/incorrectValueTypeGT.json] GT value is not number",
				checkQuery
			);
			it(
				"[invalid/incorrectValueTypeIS.json] IS value is not number",
				checkQuery
			);
			it(
				"[invalid/incorrectValueTypeLT.json] LT value is not number",
				checkQuery
			);
			it(
				"[invalid/invalidIDString.json] idstring value is invalid",
				checkQuery
			);
			it("[invalid/incorrectTypeIS.json] IS skey type is invalid", checkQuery);
			it("[invalid/invalidKeyTypeEQ.json] EQ Key type is invalid", checkQuery);
			it("[invalid/invalidKeyTypeGT.json] GT Key type is invalid", checkQuery);
			it("[invalid/invalidKeyTypeLT.json] LT Key type is invalid", checkQuery);
			it("[invalid/missingOptions.json] OPTIONS is empty", checkQuery);
			it("[invalid/noKeyGT.json] GT missing Key", checkQuery);
			it("[invalid/noKeyEQ.json] EQ missing Key", checkQuery);
			it("[invalid/noKeyLT.json] LT missing Key", checkQuery);
			it("[invalid/orEmpty.json] OR clause is empty", checkQuery);
			it(
				"[invalid/referencingMultipleDatasets.json] Referencing multiple datasets",
				checkQuery
			);
			it("[invalid/missingQueryNOT.json] NOT clause is empty", checkQuery);
			it("[invalid/missingKeyIS.json] IS clause is empty", checkQuery);
			it("[invalid/emptyArrayAND.json] AND array is empty", checkQuery);
			it("[invalid/emptyArrayOR.json] OR array is empty", checkQuery);
			it(
				"[invalid/referencingNoDataset.json] Referencing no dataset",
				checkQuery
			);
			it(
				"[invalid/orderKeyNotInColumns.json] Order key is not in the columns array",
				checkQuery
			);
			it(
				"[invalid/returningMoreThan5000.json] More than 5000 items",
				checkQuery
			);
			it(
				"[invalid/returningEntireDataset.json] Returning many items",
				checkQuery
			);
			it(
				"[invalid/wildcardAsterisk.json] IS clause wildcard value is an asterisk",
				checkQuery
			);
			it(
				"[invalid/wildcardMiddle.json] IS clause wildcard is embedded in the word",
				checkQuery
			);
		});
		describe("PerformQuery Success cases", function () {
			it(
				"[valid/returningNoResults.json] Correctly returns no results",
				checkQuery
			);
			it(
				"[valid/nestingLogicFilters.json] Correctly uses nested logic",
				checkQuery
			);
			it(
				"[valid/usingAllRequiredQueryParams.json] Correctly uses all required query parameters",
				checkQuery
			);
			it(
				"[valid/capsSensitivity.json] Testing for caps sensitivity",
				checkQuery
			);
			it(
				"[valid/threeFilters.json] Testing when using three filters",
				checkQuery
			);
			it("[valid/twoFilters.json] Testing when using two filters", checkQuery);
			it("[valid/usingEQ.json] Testing EQ Operator success", checkQuery);
			it("[valid/usingID.json] Testing ID Operator success", checkQuery);
			it(
				"[valid/usingInstructor.json] Testing using instructor column",
				checkQuery
			);
			it(
				"[valid/orderingWithSkey.json] Testing using skey for ORDER",
				checkQuery
			);
			it("[valid/usingLT.json] Testing using LT operator", checkQuery);
			it("[valid/usingOR.json] Testing using OR operator", checkQuery);
			it("[valid/usingNOT.json] Testing using NOT operator", checkQuery);
			it("[valid/usingUUID.json] Testing using uuid column", checkQuery);
			it("[valid/wildcardLeft.json] Testing using wildcard left", checkQuery);
			it("[valid/wildcardRight.json] Testing using wildcard right", checkQuery);
			it(
				"[valid/wildcardNoString.json] Testing using wildcard with no string",
				checkQuery
			);
			it(
				"[valid/wildcardLeftRight.json] Testing using wildcard left and right",
				checkQuery
			);
			it(
				"[valid/returning4999.json] Testing upper limit of array return",
				checkQuery
			);
		});
	});
	describe("ListDatasets", function () {
		beforeEach(function () {
			// New instance of InsightFacade
			facade = new InsightFacade();
		});
		afterEach(async function () {
			// So that InsightFacade is reset for each test
			await clearDisk();
		});

		it("Success ListDatasets -> returns an empty array if no datasets have been added", async function () {
			const result = await facade.listDatasets();

			expect(result).to.be.an("array");
			expect(result).to.have.lengthOf(0);
		});
		it("Success ListDatasets -> When there is only one dataset added", async function () {
			// Add one item then test
			// Also test that each element of the array is an object which has ID, kind and overall row number in the dataset

			await facade.addDataset(
				"testData",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			const result = await facade.listDatasets();

			expect(result).to.be.an("array");
			expect(result).to.have.lengthOf(1);
			result.forEach((item) => {
				expect(item).to.be.an("object");
			});
		});
		it("Success ListDatasets -> When there are multiple datasets added", async function () {
			const expectedResult = [
				{
					id: "testData",
					kind: InsightDatasetKind.Sections,
					numRows: 1,
				},
				{
					id: "newData",
					kind: InsightDatasetKind.Sections,
					numRows: 1,
				},
			];
			const expectedLength = expectedResult.length;

			await facade.addDataset(
				"testData",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			await facade.addDataset(
				"newData",
				validDatasetOneCourse,
				InsightDatasetKind.Sections
			);
			const result = await facade.listDatasets();

			expect(result).to.be.an("array");
			expect(result).to.have.lengthOf(expectedLength);

			// Check that each item in the result matches one of the expected items
			result.forEach((item) => {
				expect(item).to.be.an("object");
				expect(expectedResult).to.deep.include(item);
			});

			// Check that all expected items are in the result
			expectedResult.forEach((expectedItem) => {
				expect(result).to.deep.include(expectedItem);
			});
		});

		it("Failure ListDatasets -> When there are items, but one or more of them is missing id, kind of row number", async function () {
			// TODO
			try {
				const requiredFields = ["id", "kind", "numRows"];
				await facade.addDataset(
					"TestInput",
					sections,
					InsightDatasetKind.Sections
				);
				const result = await facade.listDatasets();

				expect(result).to.be.an("array");
				expect(result).to.have.lengthOf(1);
				result.forEach((ele) => {
					expect(ele).to.have.keys(requiredFields);
				});
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
	});
});
