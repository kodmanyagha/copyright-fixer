import * as vscode from "vscode";

export function getProjectPath(): string {
  let workspaceFolders = vscode.workspace.workspaceFolders ?? [];
  if (workspaceFolders.length === 0) {
    return "";
  }
  return workspaceFolders[0].uri.fsPath;
}
