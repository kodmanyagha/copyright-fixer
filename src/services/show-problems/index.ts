/**
 * Copyright (c) {companyName} - All Rights Reserved
 * Written by {authorName} <{authorEmail}>, {startYear}-{currentYear}
 */

import * as vscode from "vscode";

export const cmdShowProblems = (context: vscode.ExtensionContext) => {
  vscode.window.showInformationMessage("Show problems invoked");
};
