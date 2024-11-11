/**
 * Copyright (c) {companyName} - All Rights Reserved
 * Written by {authorName} <{authorEmail}>, {startYear}-{currentYear}
 */

import fs from "fs";
import path from "path";
import * as vscode from "vscode";

import { PROJECT_PATH } from "../../extension";
import { ConfigType, readConfig } from "../config-service";

export const cmdFix = async (context: vscode.ExtensionContext) => {
  const config: ConfigType = readConfig(context);
  console.log(config);

  try {
    vscode.window.showInformationMessage("Starting to fix copyright text.");
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
    startPath = path.join(PROJECT_PATH, startPath);
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

function createCopyrightText(config: ConfigType) {
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
  if (content.indexOf("\n\r") >= 0) {
    return "\n\r";
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

function fixCopyrightInContent(config: ConfigType, content: string): string {
  const originalCopyrightText = createCopyrightText(config);
  const fileLineSeparator = detectLineSeparator(content);
  const emptyLines = fileLineSeparator.repeat(config.afterNewLine);

  /**
   * Algorithm:
   * - Find all copyright blocks which stays after first line and remove them.
   * - If there isn't copyright text on top of file then add it.
   */

  // TODO Handle copyright
  if (!content.startsWith("/*")) {
    // No copyright added yet, we must add it
    content = originalCopyrightText + emptyLines + content;
  } else {
    // Copyright exist, update it with current dates and add empty line to end.
    const codeSection = content.substring(content.indexOf("*/") + 2).trimStart();

    content = content.substring(0, content.indexOf("*/") + 2) + emptyLines + codeSection;
  }

  return content;
}

function stringSimilarity(str1: string, str2: string, caseSensitive: boolean = false) {
  if (!caseSensitive) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
  }
  const substringLength: number = 2;

  if (str1.length < substringLength || str2.length < substringLength) return 0;

  const map = new Map();
  for (let i = 0; i < str1.length - (substringLength - 1); i++) {
    const substr1 = str1.substr(i, substringLength);
    map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
  }

  let match = 0;
  for (let j = 0; j < str2.length - (substringLength - 1); j++) {
    const substr2 = str2.substr(j, substringLength);
    const count = map.has(substr2) ? map.get(substr2) : 0;
    if (count > 0) {
      map.set(substr2, count - 1);
      match++;
    }
  }

  return (match * 2) / (str1.length + str2.length - (substringLength - 1) * 2);
}
