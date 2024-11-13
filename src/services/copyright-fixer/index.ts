import fs from "fs";
import path from "path";
import * as vscode from "vscode";

import { ConfigType, readConfig } from "../config-service";
import { getProjectPath } from "../utils";

export const cmdFix = async (context: vscode.ExtensionContext) => {
  const config: ConfigType = readConfig(context);
  // console.log(config);

  try {
    // vscode.window.showInformationMessage("Starting to fix copyright text.");
    await startFixDeeply(context, config);
    vscode.window.showInformationMessage("Copyright fix success.");
  } catch (e) {
    console.error(e);
    vscode.window.showInformationMessage("Copyright fix error.");
  }
};

async function startFixDeeply(context: vscode.ExtensionContext, config: ConfigType) {
  let includedFolders = config.includedFolders;
  includedFolders = includedFolders.filter((item) => !config.excludedFolders.includes(item));
  console.log(">> folders", includedFolders);

  let allFolders: string[] = [];

  includedFolders.forEach((startPath) => {
    startPath = path.join(getProjectPath(), startPath);
    allFolders.push(startPath);
    allFolders = allFolders.concat(getAllDirectories(startPath));
  });

  allFolders = [...new Set(allFolders)]; // make unique

  allFolders.forEach((currentFullPath) => {
    const currentPathItems = getPathItems(currentFullPath, false);

    currentPathItems.forEach((item) => {
      const currentPathItem = path.join(currentFullPath, item);
      console.log("currentPathItem:", currentPathItem);

      const stats = fs.statSync(currentPathItem);
      if (!stats.isFile()) {
        return;
      }

      const fileNamePieces = item.split(".");
      if (fileNamePieces.length < 2) {
        return;
      }
      const extension = fileNamePieces.at(-1) + "";

      if (config.includedExtensions.includes(extension)) {
        let content = fs.readFileSync(currentPathItem).toString("utf8");

        content = fixCopyrightInContent(config, content);

        fs.writeFileSync(currentPathItem, content);
      }
    });
  });
}

function getAllDirectories(folder: string): string[] {
  const directories: string[] = [];
  const stack: string[] = [folder];

  while (stack.length > 0) {
    const currentDir = stack.pop()!;
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(currentDir, entry.name);
          directories.push(fullPath);
          stack.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error);
    }
  }

  console.log(">>> directories directories directories", directories);
  return directories;
}

export function createCopyrightText(config: ConfigType) {
  let copyrightText = config.template;
  let templateVars = config.templateVars;
  let keys = Object.keys(templateVars);

  keys.forEach((key) => {
    let val = templateVars[key];
    copyrightText = copyrightText.replaceAll(`{${key}}`, val + "");
  });

  return copyrightText;
}

function detectLineSeparator(content: string) {
  if (content.indexOf("\r\n") >= 0) {
    return "\r\n";
  } else {
    return "\n";
  }
}

function getPathItems(folder: string, recursive: boolean): string[] {
  try {
    return fs
      .readdirSync(folder, { recursive })
      .map((item) => (typeof item === "string" ? item : item.toString("utf8")));
  } catch (e) {}
  return [];
}

export function fixCopyrightInContent(config: ConfigType, content: string): string {
  const originalCopyrightText = createCopyrightText(config);
  const fileLineSeparator = detectLineSeparator(content);
  const emptyLines = fileLineSeparator.repeat(config.afterNewLine);

  /**
   * Algorithm:
   * - If any copyright block exist:
   *     - If this block is similar to fresh copyright text then cut this block and put
   *       it to top of the file. Add new line instead of its old place.
   *     - If this isn't similar than put fresh copyright text to on top of the file.
   * - If no copyright block exist in the file then create a new one and put to top.
   */

  let copyrightBlockIndices: FoundIndicesType = null;
  let startPoint = 0;
  let foundCopyrightText = "";
  while (true) {
    copyrightBlockIndices = findCommentBlockIndices(content, startPoint);
    if (copyrightBlockIndices === null) {
      break;
    }

    foundCopyrightText = content.substring(copyrightBlockIndices[0], copyrightBlockIndices[1]);
    let similarity = stringSimilarity(originalCopyrightText, foundCopyrightText);
    if (similarity >= config.foundSimilarityMinRate) {
      break;
    }

    startPoint = copyrightBlockIndices[1];
  }

  if (copyrightBlockIndices === null) {
    // No copyright added yet, we must add it
    content = originalCopyrightText + emptyLines + content;
  } else {
    let beforeContent = content.substring(0, copyrightBlockIndices[0]);
    let afterContent = content.substring(copyrightBlockIndices[1]);

    // This copyright block already on top of the file. Then fix the next lines.
    if (beforeContent.length === 0) {
      afterContent = afterContent.trimStart();

      content = foundCopyrightText + emptyLines + afterContent;
    } else {
      let replacement =
        beforeContent.endsWith(fileLineSeparator) || afterContent.startsWith(fileLineSeparator)
          ? ""
          : fileLineSeparator;

      content = foundCopyrightText + emptyLines + beforeContent + replacement + afterContent;
    }
  }

  return content;
}

export type FoundIndicesType = [number, number] | null;

export function findCommentBlockIndices(
  content: string,
  startPoint: number = 0,
  commentStart: string = "/*",
  commentEnd: string = "*/"
): FoundIndicesType {
  let foundStartIndice = content.indexOf(commentStart, startPoint);
  if (foundStartIndice < 0) {
    return null;
  }

  let foundEndIndice = content.indexOf(commentEnd, foundStartIndice + commentStart.length);
  if (foundEndIndice < 0) {
    return null;
  }
  foundEndIndice += commentEnd.length;

  return [foundStartIndice, foundEndIndice];
}

export function stringSimilarity(str1: string, str2: string, caseSensitive: boolean = false) {
  if (!caseSensitive) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
  }
  const substringLength: number = 2;

  if (str1.length < substringLength || str2.length < substringLength) {
    return 0;
  }

  const map = new Map();
  for (let i = 0; i < str1.length - (substringLength - 1); i++) {
    const substr1 = str1.substring(i, i + substringLength);
    map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
  }

  let match = 0;
  for (let j = 0; j < str2.length - (substringLength - 1); j++) {
    const substr2 = str2.substring(j, j + substringLength);
    const count = map.has(substr2) ? map.get(substr2) : 0;
    if (count > 0) {
      map.set(substr2, count - 1);
      match++;
    }
  }

  return (match * 2) / (str1.length + str2.length - (substringLength - 1) * 2);
}
