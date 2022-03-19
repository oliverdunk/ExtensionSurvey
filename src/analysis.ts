import * as fs from "fs/promises";
import * as babel from "@babel/core";
import { getAllFiles, getDirSize } from "./utils";
import { SearchResponse } from "./api";

type AnalyzeResult = {
  name: string;
  slug: string;
  size: string;
  hasWasm: boolean;
  apiCalls: { namespace: string; count: number; }[]
};

export async function analyzeExtension(extension: SearchResponse["results"][0], dir: string): Promise<AnalyzeResult> {
  const files = await getAllFiles(dir);

  const apiCallCounts = new Map<string, number>();
  let hasWasm = false;
  
  for (const file of files) {
    if (file.endsWith(".js")) {
      const buffer = await fs.readFile(file);
      const apiCalls = await extractApiCalls(buffer);

      for (const call of apiCalls) {
        if (apiCallCounts.has(call)) {
          apiCallCounts.set(call, apiCallCounts.get(call) + 1);
        } else {
          apiCallCounts.set(call, 1);
        }
      }
    } else if (file.endsWith(".wasm")) {
      hasWasm = true;
    }
  }

  return {
    name: extension.name["en-US"],
    slug: extension.slug,
    size: await getDirSize(dir),
    hasWasm,
    apiCalls: [...apiCallCounts.entries()].map(([namespace, count]) => ({ namespace, count }))
  }
}

/**
 * Finds all calls to the browser. or chrome. namespace within the extension.
 * Uses Babel to create an AST and then search for relevant MemberExpression
 * nodes.
 * 
 * @param file Buffer containing a file to search
 * @returns A string representing each API call
 */
 function extractApiCalls(file: Buffer): Promise<string[]> {
  return new Promise((resolve) => {
    const calls: string[] = [];

    babel.parse(file.toString("utf8"), { ast: true, compact: false }, (err, result) => {
      if (err) {
        resolve([]);
        return;
      }

      babel.traverse(result, {
        MemberExpression(path) {
          const object = path.node.object;
  
          if (object.type === "Identifier" && ["browser", "chrome"].includes(object.name)) {
            const property = path.node.property;
  
            if (property.type === "Identifier") {
              calls.push(`${object.name}.${property.name}`);
            }
          }
        }
      });

      resolve(calls);
    });  
  });
}
