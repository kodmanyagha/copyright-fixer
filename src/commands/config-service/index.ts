import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { getProjectPath } from "../../utils/file-utils";

export type ConfigType = {
  template: string;
  templateVars: Record<string, string | boolean | number>;
  afterNewLine: number;
  foundSimilarityMinRate: number;
  includedFolders: string[];
  includedExtensions: string[];
  excludedFolders: string[];
  preCmd: string[];
  postCmd: string[];
};

export function readConfig(context: vscode.ExtensionContext): ConfigType {
  let config: ConfigType = defaultConfig();
  const projectPath = getProjectPath();

  config = readFrom(path.join(projectPath, ".vscode/copyright-fixer.json"), config);
  config = readFrom(path.join(projectPath, "copyright-fixer.json"), config);

  return config;
}

export function defaultConfig(): ConfigType {
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
    foundSimilarityMinRate: 0.9,
    includedExtensions: ["rs", "ts", "js", "tsx", "jsx"],
    includedFolders: ["src"],
    excludedFolders: ["target", "node_modules", "dist", ".vscode"],
    preCmd: [],
    postCmd: [],
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
