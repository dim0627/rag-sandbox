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

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on the provided context.
Use the context to answer the user's question accurately and concisely.
If the context doesn't contain enough information to answer the question, say so honestly.
Always cite which parts of the context you used in your answer.`;

export async function generateAnswer(
  query: string,
  contexts: string[]
): Promise<string> {
  const config = getConfig();
  const openai = getClient();

  const contextText = contexts
    .map((c, i) => `[Context ${i + 1}]\n${c}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: config.openai.chatModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Context:\n${contextText}\n\nQuestion: ${query}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content || "No response generated.";
}
