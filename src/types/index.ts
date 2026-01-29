export interface Document {
  content: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  sourceFile: string;
  title?: string;
  [key: string]: unknown;
}

export interface Chunk {
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata extends DocumentMetadata {
  chunkIndex: number;
}

export interface ChunkWithEmbedding extends Chunk {
  embedding: number[];
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: string | null;
  sourceFile: string | null;
  chunkIndex: number | null;
  similarity: number;
}
