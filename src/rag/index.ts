import { stat } from "fs/promises";
import { loadDocument, loadDocumentsFromDirectory } from "../loader/markdown.js";
import { splitDocuments } from "../splitter/index.js";
import { generateEmbedding, generateEmbeddings } from "../embeddings/openai.js";
import { storeChunks, similaritySearch } from "../vectorstore/index.js";
import { generateAnswer } from "../llm/openai.js";
import { getConfig } from "../config/index.js";
import type { ChunkWithEmbedding, SearchResult } from "../types/index.js";

export async function ingest(
  path: string,
  options: { recursive?: boolean } = {}
): Promise<{ documentCount: number; chunkCount: number }> {
  const stats = await stat(path);

  // Load documents
  console.log(`Loading documents from: ${path}`);
  const documents = stats.isDirectory()
    ? await loadDocumentsFromDirectory(path, options.recursive)
    : [await loadDocument(path)];

  if (documents.length === 0) {
    console.log("No documents found.");
    return { documentCount: 0, chunkCount: 0 };
  }
  console.log(`Loaded ${documents.length} document(s)`);

  // Split into chunks
  console.log("Splitting into chunks...");
  const chunks = splitDocuments(documents);
  console.log(`Created ${chunks.length} chunk(s)`);

  // Generate embeddings
  console.log("Generating embeddings...");
  const texts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(texts);

  // Combine chunks with embeddings
  const chunksWithEmbeddings: ChunkWithEmbedding[] = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }));

  // Store in vector database
  console.log("Storing in vector database...");
  await storeChunks(chunksWithEmbeddings);

  console.log("Done!");
  return { documentCount: documents.length, chunkCount: chunks.length };
}

export async function search(
  query: string,
  topK?: number
): Promise<SearchResult[]> {
  const config = getConfig();
  const k = topK ?? config.rag.topK;

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search for similar documents
  const results = await similaritySearch(queryEmbedding, k);

  return results;
}

export async function query(
  question: string,
  topK?: number
): Promise<{ answer: string; sources: SearchResult[] }> {
  // Search for relevant documents
  const results = await search(question, topK);

  if (results.length === 0) {
    return {
      answer: "No relevant documents found to answer your question.",
      sources: [],
    };
  }

  // Generate answer using LLM
  const contexts = results.map((r) => r.content);
  const answer = await generateAnswer(question, contexts);

  return { answer, sources: results };
}
