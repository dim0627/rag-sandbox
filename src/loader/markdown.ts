import { readFile, readdir, stat } from "fs/promises";
import { join, extname } from "path";
import matter from "gray-matter";
import type { Document } from "../types/index.js";

export async function loadMarkdownFile(filePath: string): Promise<Document> {
  const content = await readFile(filePath, "utf-8");
  const { data: frontmatter, content: body } = matter(content);

  return {
    content: body.trim(),
    metadata: {
      sourceFile: filePath,
      title: frontmatter.title as string | undefined,
      ...frontmatter,
    },
  };
}

export async function loadTextFile(filePath: string): Promise<Document> {
  const content = await readFile(filePath, "utf-8");

  return {
    content: content.trim(),
    metadata: {
      sourceFile: filePath,
    },
  };
}

export async function loadDocument(filePath: string): Promise<Document> {
  const ext = extname(filePath).toLowerCase();

  if (ext === ".md" || ext === ".markdown") {
    return loadMarkdownFile(filePath);
  }

  return loadTextFile(filePath);
}

export async function loadDocumentsFromDirectory(
  dirPath: string,
  recursive = false
): Promise<Document[]> {
  const documents: Document[] = [];
  const entries = await readdir(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory() && recursive) {
      const subDocs = await loadDocumentsFromDirectory(fullPath, true);
      documents.push(...subDocs);
    } else if (stats.isFile()) {
      const ext = extname(entry).toLowerCase();
      if ([".md", ".markdown", ".txt"].includes(ext)) {
        const doc = await loadDocument(fullPath);
        documents.push(doc);
      }
    }
  }

  return documents;
}
