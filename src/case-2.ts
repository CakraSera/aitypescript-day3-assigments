import z from "zod";
import { createParsedCompletion } from "@anvia/core";
import { getModel } from "./utils";
import "dotenv/config";

const transcript = `
Jay: We agreed to meet at 3 PM, but I haven't received any confirmation from you yet. Are we still on for today?
Jimmy: I apologize for the delay. Yes, we are still on for 3 PM. I will be there.
Jay: Great! Just to confirm, we are meeting at the downtown cafe, right?
Jimmy: Yes, that's correct. See you there!
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
