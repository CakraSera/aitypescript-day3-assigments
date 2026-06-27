import z from "zod";
import { createCompletion, createParsedCompletion } from "@anvia/core";
import { input } from "@inquirer/prompts";
import { getModel, tavilyClient } from "./utils.ts";
import "dotenv/config";

const userInput =
  "Why some people get charged twice for the same order? I want a refund now!";

const ActionDecisionSchema = z.object({
  action: z.enum([
    "answer_directly",
    "search_web",
    "ask_clarifying_question",
    "handoff",
  ]),
  reason: z.string(),
  searchQueries: z.array(z.string()).describe("Only when action is search_web"),
  question: z.string().describe("Only when action is ask_clarifyin_question"),
});

if (!userInput.trim()) {
  console.log("No message from the user");
  process.exit(0);
}

try {
  const decision = await createParsedCompletion(getModel(), {
    instructions: `
      Decide the next action before answering the user,
      answer_directly -> can be answered from general knowledge.
      search_web -> needs current or external info.
      ask_clarifying_question -> an important detail is missing.
      handoff -> neeeds a human, account access, money/refund, or any risky guarantee.

      A billing complaint about a charge, refund, or "fix it now" almost always needs handodff, Never promise a refund yourself.
    `,
    input: `User request: ${userInput}`,
    schema: ActionDecisionSchema,
  });

  console.log("Decision:", decision.data);
  if (decision.data.action === "handoff") {
    console.log("This touches money and the account. Handling off to a human");
  } else if (decision.data.action === "ask_clarifying_question") {
    console.log(
      decision.data.question || "Could you share your order or invoice ID?",
    );
  } else if (decision.data.action === "search_web") {
    if (decision.data.searchQueries.length === 0) {
      console.log("No search queries returned. Handling off instead.");
    } else {
      const results = await Promise.all(
        decision.data.searchQueries.map((query) => tavilyClient.search(query)),
      );
      const answer = await createCompletion(getModel(), {
        instructions:
          "Answer using the search results. If unclear, say what is missing.",
        input: `User request: ${userInput}\n\nResults:\n${JSON.stringify(results)}`,
      });
      console.log(answer.text);
    }
  } else {
    const answer = await createCompletion(getModel(), {
      instructions:
        "Answer the user request directly. Keep it short and practical",
      input: userInput,
    });
    console.log(answer.text);
  }
} catch (error) {
  console.error("Something went wrong:", error);
}
