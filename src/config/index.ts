import { z } from "zod";
import "dotenv/config";

const configSchema = z.object({
  database: z.object({
    host: z.string().default("localhost"),
    port: z.coerce.number().default(5432),
    user: z.string().default("rag_user"),
    password: z.string().default("rag_password"),
    database: z.string().default("rag_sandbox"),
  }),
  openai: z.object({
    apiKey: z.string().min(1, "OPENAI_API_KEY is required"),
    embeddingModel: z.string().default("text-embedding-3-small"),
    chatModel: z.string().default("gpt-4o-mini"),
  }),
  rag: z.object({
    chunkSize: z.coerce.number().default(500),
    chunkOverlap: z.coerce.number().default(50),
    topK: z.coerce.number().default(5),
  }),
});

export type Config = z.infer<typeof configSchema>;

let config: Config | null = null;

export function getConfig(): Config {
  if (!config) {
    const result = configSchema.safeParse({
      database: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        embeddingModel: process.env.EMBEDDING_MODEL,
        chatModel: process.env.CHAT_MODEL,
      },
      rag: {
        chunkSize: process.env.CHUNK_SIZE,
        chunkOverlap: process.env.CHUNK_OVERLAP,
        topK: process.env.TOP_K,
      },
    });

    if (!result.success) {
      console.error("Configuration error:", result.error.format());
      throw new Error("Invalid configuration");
    }

    config = result.data;
  }
  return config;
}
