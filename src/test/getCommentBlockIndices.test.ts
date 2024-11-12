import * as assert from "assert";
import fs from "fs";
import path from "path";
import { getCommentBlockIndices, stringSimilarity } from "../services/copyright-fixer";

suite("Extension Test Suite", () => {
  test("Find copyright block in text", async () => {
    const copyrightText = `/**
 * Copyright (c) Trillion Dollar Company LTD. STI. - All Rights Reserved
 * Written by John Doe <john@doe.com>, 1989-2024
 */`;

    let haystack = fs
      .readFileSync(path.join(process.cwd(), "src/test/txt/multiple_copyright_2.txt"))
      .toString("utf8");

    let startPoint = 0;
    let foundCopyrightText = "";
    while (true) {
      let foundIndices = getCommentBlockIndices(haystack, startPoint);
      if (foundIndices === null) {
        break;
      }

      foundCopyrightText = haystack.substring(foundIndices[0], foundIndices[1]);
      let similarity = stringSimilarity(copyrightText, foundCopyrightText);

      console.log("--------------------------------------------");
      console.log(">> Found indices:", foundIndices);
      console.log(">> Found copyright text:", foundCopyrightText);
      console.log(">> similarity:", similarity);

      startPoint = foundIndices[1];
    }

    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
