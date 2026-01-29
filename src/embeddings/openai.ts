import OpenAI from "openai";
import { getConfig } from "../config/index.js";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const config = getConfig();
    client = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const config = getConfig();
  const openai = getClient();

  const response = await openai.embeddings.create({
    model: config.openai.embeddingModel,
    input: text,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const config = getConfig();
  const openai = getClient();

  // OpenAI API has a limit on batch size, process in chunks of 100
  const batchSize = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await openai.embeddings.create({
      model: config.openai.embeddingModel,
      input: batch,
    });

    embeddings.push(...response.data.map((d) => d.embedding));
  }

  return embeddings;
}
