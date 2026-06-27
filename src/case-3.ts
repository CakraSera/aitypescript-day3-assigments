import z from "zod";
import { createParsedCompletion } from "@anvia/core";
import { getModel, tavilyClient } from "./utils.ts";
import "dotenv/config";

const COMPANY_NAME = "Dataon Corp";
if (!COMPANY_NAME.trim()) {
  console.log("Please provide a company name");
  process.exit(0);
}

const CompanyProfileSchema = z.object({
  name: z.string().describe("Official company name, or NONE"),
  industry: z.string().describe("Main industry, or NONE"),
  website: z.string().describe("Official website URL, or NONE"),
  summary: z.string().describe("One short sentence about the company, or NONE"),
});

try {
  const search = await tavilyClient.search(COMPANY_NAME, {
    searchDepth: "basic",
  });
  if (!search.results || search.results.length === 0) {
    console.log({
      name: COMPANY_NAME,
      industry: "NONE",
      website: "NONE",
      summary: "NONE",
    });
    process.exit(0);
  }

  const profile = await createParsedCompletion(getModel(), {
    instructions:
      "Extract the company profile from the search results. If any information is missing, return 'NONE'. Do not guess",
    input: `Company: ${COMPANY_NAME}\n\nSearch Results:\n${JSON.stringify(search.results)}`,
    schema: CompanyProfileSchema,
  });
  console.log(profile.data);
} catch (error) {
  console.error("Something went wrong:", error);
}
