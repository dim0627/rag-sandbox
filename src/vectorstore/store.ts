import { getDb, schema } from "../db/index.js";
import type { ChunkWithEmbedding } from "../types/index.js";

export async function storeChunks(chunks: ChunkWithEmbedding[]): Promise<void> {
  const db = getDb();

  const values = chunks.map((chunk) => ({
    content: chunk.content,
    embedding: chunk.embedding,
    metadata: JSON.stringify(chunk.metadata),
    sourceFile: chunk.metadata.sourceFile,
    chunkIndex: chunk.metadata.chunkIndex,
  }));

  await db.insert(schema.documents).values(values);
}

export async function clearDocuments(sourceFile?: string): Promise<number> {
  const db = getDb();

  if (sourceFile) {
    const result = await db
      .delete(schema.documents)
      .where(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (schema.documents.sourceFile as any).eq(sourceFile)
      );
    return result.rowCount ?? 0;
  }

  const result = await db.delete(schema.documents);
  return result.rowCount ?? 0;
}
