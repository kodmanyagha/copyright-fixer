import fs from "fs";
import path from "path";
import * as vscode from "vscode";

import { exec as execSync } from "child_process";
import { promisify } from "util";
import { getAllDirectories, getPathItems, getProjectPath } from "../../utils/file-utils";
import {
  createCopyrightText,
  detectLineSeparator,
  findCommentBlockIndices,
  FoundIndicesType,
  stringSimilarity,
} from "../../utils/text-utils";
import { ConfigType, readConfig } from "../config-service";

const exec = promisify(execSync);

export const cmdFix = async (context: vscode.ExtensionContext) => {
  const config: ConfigType = readConfig(context);

  try {
    await runCmds(config.preCmd);
    await startFixDeeply(context, config);
    await runCmds(config.postCmd);

    vscode.window.showInformationMessage("Copyright fix success.");
  } catch (e) {
    console.error(e);
    vscode.window.showInformationMessage("Copyright fix error.");
  }
};

async function runCmds(cmds: string[]) {
  const projectPath = getProjectPath();

  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i];

    try {
      const result = await exec(cmd, { cwd: projectPath });
      console.log("CMD:", cmd, result);
    } catch (e) {
      console.log("CMD exception:", cmd, e);
    }
  }
}

async function startFixDeeply(context: vscode.ExtensionContext, config: ConfigType) {
  let includedFolders = config.includedFolders;
  includedFolders = includedFolders.filter((item) => !config.excludedFolders.includes(item));

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

/**
 * Algorithm:
 * - If any copyright block exist:
 *     - If this block is similar to fresh copyright text then cut this block and put
 *       it to top of the file. Add new line instead of its old place.
 *     - If this isn't similar than put fresh copyright text to on top of the file.
 * - If no copyright block exist in the file then create a new one and put to top.
 */
export function fixCopyrightInContent(config: ConfigType, content: string): string {
  const originalCopyrightText = createCopyrightText(config);
  const fileLineSeparator = detectLineSeparator(content);
  const emptyLines = fileLineSeparator.repeat(config.afterNewLine);

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
      content =
        foundCopyrightText +
        emptyLines +
        beforeContent.trim() +
        fileLineSeparator +
        afterContent.trimStart();
    }
  }

  return content;
}
