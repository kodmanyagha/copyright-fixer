import fs from "fs";
import path from "path";
import * as vscode from "vscode";

export function getAllDirectories(folder: string): string[] {
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

export function getProjectPath(): string {
  let workspaceFolders = vscode.workspace.workspaceFolders ?? [];
  if (workspaceFolders.length === 0) {
    return "";
  }
  return workspaceFolders[0].uri.fsPath;
}

export function getPathItems(folder: string, recursive: boolean): string[] {
  try {
    return fs
      .readdirSync(folder, { recursive })
      .map((item) => (typeof item === "string" ? item : item.toString("utf8")));
  } catch (e) {}
  return [];
}
