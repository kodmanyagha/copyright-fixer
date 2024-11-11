/**
 * Copyright (c) {companyName} - All Rights Reserved
 * Written by {authorName} <{authorEmail}>, {startYear}-{currentYear}
 */

import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { PROJECT_PATH } from "../../extension";

export type ConfigType = {
  template: string;
  templateVars: Record<string, string | boolean | number>;
  afterNewLine: number;
  includedFolders: string[];
  includedExtensions: string[];
  excludedFolders: string[];
};

export function readConfig(context: vscode.ExtensionContext): ConfigType {
  let config: ConfigType = defaultConfig();

  config = readFrom(path.join(PROJECT_PATH, ".vscode/copyright-fixer.json"), config);
  config = readFrom(path.join(PROJECT_PATH, "copyright-fixer.json"), config);

  return config;
}

function defaultConfig(): ConfigType {
  return {
    template: `/**
 * Copyright (c) {companyName} - All Rights Reserved
 * Written by {authorName} <{authorEmail}>, {startYear}-{currentYear}
 */`,
    templateVars: {
      companyName: "Trillion Dollar Company LTD. STI.",
      authorName: "John Doe",
      authorEmail: "john@doe.com",
      startYear: 1989,
      currentYear: 2024,
    },
    afterNewLine: 2,
    includedExtensions: ["rs", "ts", "js", "tsx", "jsx"],
    includedFolders: ["src"],
    excludedFolders: ["target", "node_modules", "dist", ".vscode"],
  };
}

function readFrom(filePath: string, config: ConfigType): ConfigType {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsedConfig = JSON.parse(content) as ConfigType;
    return Object.assign(config, parsedConfig);
  } catch (e) {}

  return config;
}
