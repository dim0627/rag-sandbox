CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"metadata" text,
	"source_file" text,
	"chunk_index" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "embedding_idx" ON "documents" USING hnsw ("embedding" vector_cosine_ops);