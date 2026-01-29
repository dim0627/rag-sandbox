import { sql } from "drizzle-orm";
import { getDb, schema } from "../db/index.js";
import type { SearchResult } from "../types/index.js";

export async function similaritySearch(
  queryEmbedding: number[],
  topK: number
): Promise<SearchResult[]> {
  const db = getDb();

  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const results = await db
    .select({
      id: schema.documents.id,
      content: schema.documents.content,
      metadata: schema.documents.metadata,
      sourceFile: schema.documents.sourceFile,
      chunkIndex: schema.documents.chunkIndex,
      similarity: sql<number>`1 - (${schema.documents.embedding} <=> ${embeddingStr}::vector)`,
    })
    .from(schema.documents)
    .orderBy(sql`${schema.documents.embedding} <=> ${embeddingStr}::vector`)
    .limit(topK);

  return results.map((row) => ({
    id: row.id,
    content: row.content,
    metadata: row.metadata,
    sourceFile: row.sourceFile,
    chunkIndex: row.chunkIndex,
    similarity: row.similarity,
  }));
}
