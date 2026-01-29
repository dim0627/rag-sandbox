import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  index,
  vector,
} from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    metadata: text("metadata"),
    sourceFile: text("source_file"),
    chunkIndex: integer("chunk_index"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
