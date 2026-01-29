import { Command } from "commander";
import { ingest } from "../rag/index.js";
import { closeDb } from "../db/index.js";

export const ingestCommand = new Command("ingest")
  .description("Ingest documents into the vector database")
  .argument("<path>", "File or directory path to ingest")
  .option("-r, --recursive", "Recursively ingest directories", false)
  .action(async (path: string, options: { recursive: boolean }) => {
    try {
      const result = await ingest(path, { recursive: options.recursive });
      console.log(
        `\nSuccessfully ingested ${result.chunkCount} chunks from ${result.documentCount} document(s)`
      );
    } catch (error) {
      console.error("Error during ingestion:", error);
      process.exit(1);
    } finally {
      await closeDb();
    }
  });
