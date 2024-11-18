import * as vscode from "vscode";

export function getProjectPath(): string {
  let workspaceFolders = vscode.workspace.workspaceFolders ?? [];
  if (workspaceFolders.length === 0) {
    return "";
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * This is a dangerously character for codes. Because this seems a normal whitespace
 * but actually it is different. You can't trim it, print it, see it, it affects
 * length of the string even not seeing. We must not use this character in code.
 *
 * The character itself is here: ' '
 *
 * Probably this will be seems like a normal whitespace. You can see this character
 *  with only that extension:
 * https://marketplace.visualstudio.com/items?itemName=viktorzetterstrom.non-breaking-space-highlighter
 *
 * What is '\xa0'? Hex representation of NBSP char. You can look here:
 * https://stackoverflow.com/a/5238020/2132069
 */
export const NONBREAKING_SPACE = "\xa0";

/**
 * Sometimes we copy texts from browser and paste it to editor. Then we may have
 * unknowingly copied that bad character. We must convert NBSP to real innocent
 * whitespace character.
 *
 * @param content
 * @returns
 */
export function fixNbsp(content: string): string {
  return content.replaceAll(NONBREAKING_SPACE, " ");
}
