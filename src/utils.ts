import { OpenAIClient } from "@anvia/openai";
import { tavily } from "@tavily/core";
import "dotenv/config";

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: process.env.OPENAI_API_BASE_URL,
});

export function getModel(mode: string = "gpt-5.5") {
  return client.completionModel(mode);
}
export const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});
