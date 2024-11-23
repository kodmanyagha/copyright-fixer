import * as assert from "assert";
import { updateLineSeparator } from "../utils/text-utils";
import { delCarriageReturn } from "./test-utils";

suite("Extension Test Suite", () => {
  test("updateLineSeparator", async () => {
    const buggyContent = " This is buggy\rcontent, which have\r\ninteresting\ncharacters\n\r\r\n";

    let fixedContent = updateLineSeparator(buggyContent, "TEST");
    let expectedContent = " This is buggycontent, which haveTESTinterestingTESTcharactersTESTTEST";

    assert.strictEqual(delCarriageReturn(fixedContent), expectedContent);

    fixedContent = updateLineSeparator(buggyContent, "");
    expectedContent = " This is buggycontent, which haveinterestingcharacters";
  });
});
