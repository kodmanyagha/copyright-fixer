import * as assert from "assert";
import { defaultConfig } from "../commands/config-service";
import { fixCopyrightInContent } from "../commands/copyright-fixer";
import { findCommentBlockIndices } from "../utils/text-utils";
import { delCarriageReturn, getContent } from "./test-utils";

suite("Extension Test Suite", () => {
  test("Find copyright block and move to head 1", async () => {
    const config = defaultConfig();
    let content = getContent("src/test/txt/import_on_top.txt");

    const fixedContent = fixCopyrightInContent(config, content);

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
    let content = getContent("src/test/txt/multiple_copyright_2.txt");

    const fixedContent = fixCopyrightInContent(config, content);
    let copyrightBlockIndices = findCommentBlockIndices(fixedContent);

    // Be sure target block moved to head.
    assert.strictEqual(copyrightBlockIndices![0], 0);
  });

  test("Fix empty line", async () => {
    const config = defaultConfig();
    let content = getContent("src/test/txt/without_empty_line.txt");

    const fixedContent = fixCopyrightInContent(config, content);

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

  test("Fix empty line started 1", async () => {
    const config = defaultConfig();
    let content = getContent("src/test/txt/empty_line_started_1.txt");

    const fixedContent = fixCopyrightInContent(config, content);

    let expectedContent = `/*
 * Copyright (c) Trillion Dollar Company LTD. STI. - All Rights Reserved
 * Written by John Doe <john@doe.com>, 1989-2024
 */

/* This is example rust file. */
fn main() {
    println!("Hello world");
}
`;

    assert.strictEqual(delCarriageReturn(fixedContent), expectedContent);
  });

  test("Fix empty line started 2", async () => {
    const config = defaultConfig();
    let content = getContent("src/test/txt/empty_line_started_2.txt");

    const fixedContent = fixCopyrightInContent(config, content);

    let expectedContent = `/*
 * Copyright (c) Trillion Dollar Company LTD. STI. - All Rights Reserved
 * Written by John Doe <john@doe.com>, 1989-2024
 */

/* This is example rust file. */
fn main() {
    println!("Hello world");
}
fn foo_bar_baz() {
    println!("Hello world");
}
`;

    assert.strictEqual(delCarriageReturn(fixedContent), expectedContent);
  });
});
