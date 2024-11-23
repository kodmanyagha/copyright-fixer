import { ConfigType } from "../commands/config-service";

/**
 * This is a dangerously character for codes. Because this seems a normal whitespace
 * but actually it is different. You can't trim it, print it, see it, it affects
 * length of the string even not seeing. We must not use this character in code.
 *
 * The character itself is here: ' '
 *
 * Probably this will be seems like a normal whitespace. You can see this character
 *  with only that extension:
 * https://marketplace.visualstudio.com/items?itemName=viktorzetterstrom.non-breaking-space-highlighter
 *
 * What is '\xa0'? Hex representation of NBSP char. You can look here:
 * https://stackoverflow.com/a/5238020/2132069
 */
export const NONBREAKING_SPACE = "\xa0";

/**
 * Sometimes we copy texts from browser and paste it to editor. Then we may have
 * unknowingly copied that bad character. We must convert NBSP to real innocent
 * whitespace character.
 *
 * @param content
 * @returns
 */
export function fixNbsp(content: string): string {
  return content.replaceAll(NONBREAKING_SPACE, " ");
}

export function detectLineSeparator(content: string) {
  if (content.indexOf("\r\n") >= 0 || content.indexOf("\n\r") >= 0) {
    return "\r\n";
  } else {
    return "\n";
  }
}

export function updateLineSeparator(content: string, targetLineSeparator: string): string {
  content = content.replaceAll("\n\r", "\n");
  content = content.replaceAll("\r\n", "\n");
  content = content.replaceAll("\n", targetLineSeparator);

  return content;
}

export function createCopyrightText(config: ConfigType) {
  let copyrightText = config.template;
  let templateVars = config.templateVars;
  let keys = Object.keys(templateVars);

  keys.forEach((key) => {
    let val = templateVars[key];
    copyrightText = copyrightText.replaceAll(`{${key}}`, val + "");
  });

  return copyrightText;
}

export function stringSimilarity(str1: string, str2: string, caseSensitive: boolean = false) {
  if (!caseSensitive) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
  }

  // Clear and normalize all whitespaces.
  str1 = updateLineSeparator(fixNbsp(str1).replace(/\s{2,}/g, " "), " ");
  str2 = updateLineSeparator(fixNbsp(str2).replace(/\s{2,}/g, " "), " ");

  const substringLength: number = 2;

  if (str1.length < substringLength || str2.length < substringLength) {
    return 0;
  }

  const map = new Map();
  for (let i = 0; i < str1.length - (substringLength - 1); i++) {
    const substr1 = str1.substring(i, i + substringLength);
    map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
  }

  let match = 0;
  for (let j = 0; j < str2.length - (substringLength - 1); j++) {
    const substr2 = str2.substring(j, j + substringLength);
    const count = map.has(substr2) ? map.get(substr2) : 0;
    if (count > 0) {
      map.set(substr2, count - 1);
      match++;
    }
  }

  return (match * 2) / (str1.length + str2.length - (substringLength - 1) * 2);
}

export type FoundIndicesType = [number, number] | null;

export function findCommentBlockIndices(
  content: string,
  startPoint: number = 0,
  commentStart: string = "/*",
  commentEnd: string = "*/"
): FoundIndicesType {
  let foundStartIndice = content.indexOf(commentStart, startPoint);
  if (foundStartIndice < 0) {
    return null;
  }

  let foundEndIndice = content.indexOf(commentEnd, foundStartIndice + commentStart.length);
  if (foundEndIndice < 0) {
    return null;
  }
  foundEndIndice += commentEnd.length;

  return [foundStartIndice, foundEndIndice];
}
