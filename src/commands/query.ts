import { Command } from "commander";
import { query } from "../rag/index.js";
import { closeDb } from "../db/index.js";
import { getConfig } from "../config/index.js";

export const queryCommand = new Command("query")
  .description("Ask a question and get an answer based on ingested documents")
  .argument("<question>", "The question to ask")
  .option("-k, --top-k <number>", "Number of relevant documents to retrieve")
  .action(async (question: string, options: { topK?: string }) => {
    try {
      const config = getConfig();
      const topK = options.topK ? parseInt(options.topK, 10) : config.rag.topK;

      console.log("Searching for relevant documents...\n");

      const result = await query(question, topK);

      console.log("Answer:");
      console.log("─".repeat(50));
      console.log(result.answer);
      console.log("─".repeat(50));

      if (result.sources.length > 0) {
        console.log("\nSources:");
        for (const source of result.sources) {
          const similarity = (source.similarity * 100).toFixed(1);
          console.log(
            `  - ${source.sourceFile} (chunk ${source.chunkIndex}, ${similarity}% similarity)`
          );
        }
      }
    } catch (error) {
      console.error("Error during query:", error);
      process.exit(1);
    } finally {
      await closeDb();
    }
  });
