import { Command } from "commander";
import { search } from "../rag/index.js";
import { closeDb } from "../db/index.js";
import { getConfig } from "../config/index.js";

export const searchCommand = new Command("search")
  .description("Search for similar documents (without LLM answer generation)")
  .argument("<query>", "The search query")
  .option("-k, --top-k <number>", "Number of results to return")
  .action(async (queryText: string, options: { topK?: string }) => {
    try {
      const config = getConfig();
      const topK = options.topK ? parseInt(options.topK, 10) : config.rag.topK;

      console.log(`Searching for: "${queryText}"\n`);

      const results = await search(queryText, topK);

      if (results.length === 0) {
        console.log("No results found.");
        return;
      }

      console.log(`Found ${results.length} result(s):\n`);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const similarity = (result.similarity * 100).toFixed(1);

        console.log(`[${i + 1}] ${result.sourceFile} (chunk ${result.chunkIndex})`);
        console.log(`    Similarity: ${similarity}%`);
        console.log(`    Content: ${result.content.slice(0, 200)}...`);
        console.log();
      }
    } catch (error) {
      console.error("Error during search:", error);
      process.exit(1);
    } finally {
      await closeDb();
    }
  });
