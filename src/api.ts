import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as child_process from "child_process";
import * as path from "path";

export interface SearchResponse {
  results: {
    name: {
      "en-US": string;
    }
    slug: string;
    guid: string;
    type: string;
    current_version: {
      file: {
        url: string;
      }
    }
  }[];
}

const API_BASE_URL = "https://addons.mozilla.org/api/v5/addons";

export async function search(page: number): Promise<SearchResponse> {
  const searchResponse = await fetch(`${API_BASE_URL}/search/?sort=downloads&page_size=50&page=${page}`);
  return searchResponse.json();
}

export async function downloadExtension(extension: SearchResponse["results"][0]): Promise<string> {
  // Fetch extension and save to disk
  const result = await fetch(extension.current_version.file.url);
  const bytes = await result.arrayBuffer();
  await fs.writeFile(path.join("tmp", `${extension.guid}.xpi`), new Uint8Array(bytes));
  
  // Create a new folder for the unpacked extension and unzip
  await fs.mkdir(path.join("tmp", extension.guid));
  await new Promise<void>((resolve) => child_process.execFile("unzip", [path.join("tmp", `${extension.guid}.xpi`), "-d", path.join("tmp", extension.guid)], (_, stdout) => resolve()));
  
  // Return extension guid/directory of unzipped extension
  return path.join("tmp", extension.guid);
}
