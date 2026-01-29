import type { Document, Chunk } from "../types/index.js";
import { getConfig } from "../config/index.js";

export function splitDocument(document: Document): Chunk[] {
  const config = getConfig();
  const { chunkSize, chunkOverlap } = config.rag;

  const chunks: Chunk[] = [];
  const text = document.content;

  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    // If adding this paragraph would exceed chunk size
    if (
      currentChunk.length + trimmedParagraph.length + 2 > chunkSize &&
      currentChunk.length > 0
    ) {
      // Save current chunk
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          ...document.metadata,
          chunkIndex,
        },
      });
      chunkIndex++;

      // Start new chunk with overlap
      if (chunkOverlap > 0) {
        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-Math.ceil(chunkOverlap / 5));
        currentChunk = overlapWords.join(" ") + "\n\n" + trimmedParagraph;
      } else {
        currentChunk = trimmedParagraph;
      }
    } else {
      // Add paragraph to current chunk
      currentChunk =
        currentChunk.length > 0
          ? currentChunk + "\n\n" + trimmedParagraph
          : trimmedParagraph;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: {
        ...document.metadata,
        chunkIndex,
      },
    });
  }

  return chunks;
}

export function splitDocuments(documents: Document[]): Chunk[] {
  return documents.flatMap(splitDocument);
}
