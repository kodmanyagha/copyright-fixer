import * as vscode from "vscode";
import { cmdFix } from "./services/copyright-fixer";
import { cmdShowProblems } from "./services/show-problems";

let workspaceFolders = vscode.workspace.workspaceFolders ?? [];
export const PROJECT_PATH = workspaceFolders[0].uri.fsPath;

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Copyright Fixer extension activated.");

  context.subscriptions.push(
    vscode.commands.registerCommand("copyright-fixer.fix", () => cmdFix(context))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("copyright-fixer.show-problems", () => cmdShowProblems(context))
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
