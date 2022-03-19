import { analyzeExtension } from "./analysis";
import * as api from "./api";
import * as fs from "fs/promises";

async function run() {
  await fs.mkdir("tmp", { recursive: true });

  let page = 1;

  while (page <= 20) {
    const results = await api.search(page);

    for (const extension of results.results) {
      if (extension.type !== "extension") {
        console.log("Not an extension, skipping!");
        continue;
      }

      // Download extension
      console.log(`Downloading ${extension.current_version.file.url}...`);
      const path = await api.downloadExtension(extension);

      // Perform analysis
      const result = await analyzeExtension(extension, path);
      console.log(JSON.stringify(result));

      // Short delay before switching to the next addon to respect rate-limit
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    page++;
  }
}

run();
