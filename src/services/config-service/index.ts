import fs from "fs";
import path from "path";
import * as vscode from "vscode";

type ConfigType = {
  template?: string;
};

export function readConfig(context: vscode.ExtensionContext): ConfigType {
  let config: ConfigType = { template: undefined };

  config = readFrom(path.join(context.extensionPath, ".vscode/copyright-fixer.json"), config);
  config = readFrom(path.join(context.extensionPath, "copyright-fixer.json"), config);

  return config;
}

function readFrom(filePath: string, config: ConfigType): ConfigType {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsedConfig = JSON.parse(content) as ConfigType;
    return Object.assign(config, parsedConfig);
  } catch (e) {
    console.log("An error occured:", e);
  }

  return config;
}
