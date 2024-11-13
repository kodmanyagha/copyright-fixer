import * as assert from "assert";
import fs from "fs";
import path from "path";
import { findCommentBlockIndices, stringSimilarity } from "../services/copyright-fixer";
import { delCarriageReturn, getExtensionPath } from "./test-utils";

suite("Extension Test Suite", () => {
  test("Find copyright block in text", async () => {
    const originalCopyrightText = `/**
 * Copyright (c) Trillion Dollar Company LTD. STI. - All Rights Reserved
 * Written by John Doe <john@doe.com>, 1989-2024
 */`;

    let haystack = delCarriageReturn(
      fs
        .readFileSync(path.join(getExtensionPath(), "src/test/txt/multiple_copyright_2.txt"))
        .toString("utf8")
    );

    const expectedValues = [
      { indice: [46, 175], minSimilarityRate: 1 },
      { indice: [221, 346], minSimilarityRate: 0.95 },
      { indice: [402, 421], minSimilarityRate: 0.24 },
      { indice: [488, 616], minSimilarityRate: 0.99 },
      { indice: [682, 807], minSimilarityRate: 0.96 },
    ];

    let startPoint = 0;
    let foundCopyrightText = "";
    for (var i = 0; i < 10; i++) {
      let foundIndices = findCommentBlockIndices(haystack, startPoint);
      if (foundIndices === null) {
        break;
      }

      foundCopyrightText = haystack.substring(foundIndices[0], foundIndices[1]);
      let similarity = stringSimilarity(originalCopyrightText, foundCopyrightText);

      // console.log("--------------------------------------------");
      // console.log(">> Found indices:", foundIndices);
      // console.log(">> Found copyright text:", foundCopyrightText);
      // console.log(">> similarity:", similarity);

      assert.strictEqual(similarity >= expectedValues[i].minSimilarityRate, true);
      assert.strictEqual(expectedValues[i].indice[0], foundIndices[0]);
      assert.strictEqual(expectedValues[i].indice[1], foundIndices[1]);

      startPoint = foundIndices[1];
    }
  });
});
