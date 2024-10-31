import {InsightError} from "../../controller/IInsightFacade";

export function validateId(id: string): void {
    // RegExp from ChatGPT
    const validIDRegExp = /^(?!.*_)(?=.*\S).+$/;

    if (!validIDRegExp.test(id)) {
        throw new InsightError("Invalid ID");
    }
}
