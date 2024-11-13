import * as vscode from "vscode";
import { cmdFix } from "./services/copyright-fixer";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("copyright-fixer.fix", () => cmdFix(context))
  );
}

export function deactivate() {}
