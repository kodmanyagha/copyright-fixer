import * as assert from "assert";
import fs from "fs";
import path from "path";
import { defaultConfig } from "../services/config-service";
import { findCommentBlockIndices, fixCopyrightInContent } from "../services/copyright-fixer";
import { delCarriageReturn, getExtensionPath } from "./test-utils";

suite("Extension Test Suite", () => {
  test("Find copyright block and move to head 1", async () => {
    const config = defaultConfig();
    let content = fs
      .readFileSync(path.join(getExtensionPath(), "src/test/txt/import_on_top.txt"))
      .toString("utf8");

    const fixedContent = fixCopyrightInContent(config, content);
    // console.log(">>>>>>>> fixedContent");
    // console.log(fixedContent);

    let expectedContent = `/**
 * Copyright (c) Trillion Dollar Company LTD. STI. - All Rights Reserved
 * Written by John Doe <john@doe.com>, 1989-2024
 */

import fs from "fs";
import path from "path";

import foo from "foo";
import bar from "bar";

function exampleFn() {
  console.log("hello world");
}
`;

    assert.strictEqual(delCarriageReturn(fixedContent), expectedContent);
  });

  test("Find copyright block and move to head 2", async () => {
    const config = defaultConfig();
    let content = fs
      .readFileSync(path.join(getExtensionPath(), "src/test/txt/multiple_copyright_2.txt"))
      .toString("utf8");

    const fixedContent = fixCopyrightInContent(config, content);
    let copyrightBlockIndices = findCommentBlockIndices(fixedContent);

    // Be sure target block moved to head.
    assert.strictEqual(copyrightBlockIndices![0], 0);
  });

  test("Fix empty line", async () => {
    const config = defaultConfig();
    let content = fs
      .readFileSync(path.join(getExtensionPath(), "src/test/txt/without_empty_line.txt"))
      .toString("utf8");

    const fixedContent = fixCopyrightInContent(config, content);
    // console.log(">>>>>>>> fixedContent");
    // console.log(fixedContent);

    let expectedContent = `/**
 * Copyright (c) Trillion Dollar Company LTD. STI. - All Rights Reserved
 * Written by John Doe <john@doe.com>, 1989-2024
 */

"foo";
"bar";
"baz";
`;

    assert.strictEqual(delCarriageReturn(fixedContent), expectedContent);
  });
});
