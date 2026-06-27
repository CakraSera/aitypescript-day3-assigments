import z from "zod";
import { createCompletion, createParsedCompletion } from "@anvia/core";
import { getModel } from "./utils.ts";
import "dotenv/config";

const transcript = `
Alex: We agreed to ship the v2 API by end of month.
Sam: Risk is the payment service isn't load tested yet.
Alex: Maria will write the load tests this week.
Sam: Also legal still needs to approve the new terms.
`;

if (!transcript.trim()) {
  console.log("No transcript provided");
  process.exit(0);
}

const ResultSchema = z.object({
  decisions: z.array(z.string()),
  risks: z.array(z.string()),
  actionItems: z.array(z.string()),
});

try {
  const keyPoints = await createCompletion(getModel(), {
    instructions:
      "Summarize this meeting transcript into short, clear bullet points. Keep names and dates.",
    input: transcript,
  });
  const result = await createParsedCompletion(getModel(), {
    instructions: `
      From the summary, extract three lists:
      - decisions:   things the team agreed on
      - risks:       things that could go wrong
      - actionItems: tasks someone must do (include who, if mentioned)
 
      If a list has nothing, return an empty array. Do not invent items.
    `,
    input: `Summary:\n${keyPoints.text}`,
    schema: ResultSchema,
  });

  console.log(result.data);
} catch (error) {
  console.error("Something went wrong:", error);
}
