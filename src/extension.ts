import * as vscode from "vscode";
import { cmdFix } from "./commands/copyright-fixer";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("copyright-fixer.fix", () => cmdFix(context))
  );
}

export function deactivate() {}
