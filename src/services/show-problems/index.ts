import * as vscode from "vscode";

export const cmdShowProblems = (context: vscode.ExtensionContext) => {
  vscode.window.showInformationMessage("Show problems invoked");
};
