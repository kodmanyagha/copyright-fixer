import path from "path";

export function getExtensionPath(): string {
  return path.resolve(__dirname, "../../");
}

/**
 * Windows using `\r\n`, Linux&Mac using `\n`. This difference
 * is affecting similarity of the texts. Current windows versions
 * can work with `\n` character correctly. And also we never need
 * to show the `\r` character. Because of this we can delete this
 * annoying character on test environment.
 *
 * @param input
 * @returns
 */
export function delCarriageReturn(input: string): string {
  return input.replaceAll("\r", "");
}
