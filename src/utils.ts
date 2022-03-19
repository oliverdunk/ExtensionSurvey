import * as fs from "fs/promises";
import * as path from "path";
import * as child_process from "child_process";

/**
 * Recursively finds all files in a directory.
 * 
 * @param dir Path to a directory to list files from
 * @returns Array of relative paths to files in the directory
 */
export async function getAllFiles(dir: string): Promise<string[]> {
  const result: string[] = [];

  for (const file of await fs.readdir(dir)) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      result.push(filePath);
    } else if (stats.isDirectory()) {
      result.push(...await getAllFiles(filePath));
    }
  }

  return result;
}

export async function getDirSize(dir: string): Promise<string> {
  return new Promise((resolve) => {
    child_process.execFile("du", ["-s", dir], (_, stdout) => resolve(stdout.split("\t")[0]));
  });
}
