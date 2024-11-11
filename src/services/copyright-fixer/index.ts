import * as vscode from "vscode";
import { readConfig } from "../config-service";

export const cmdFix = (context: vscode.ExtensionContext) => {
  const config = readConfig(context);
  console.log(config);
  vscode.window.showInformationMessage("Hello World from copyright-fixer!");
};
