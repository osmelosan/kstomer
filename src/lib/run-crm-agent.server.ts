import Anthropic from "@anthropic-ai/sdk";
import type { CrmTool } from "@/lib/crm-ai-tools.server";

const MODEL = "claude-opus-4-8";
const MAX_STEPS = 5;

export async function runCrmAgent({
  apiKey,
  system,
  prompt,
  tools,
  maxTokens = 1024,
}: {
  apiKey: string;
  system: string;
  prompt: string;
  tools: CrmTool[];
  maxTokens?: number;
}): Promise<string> {
  const client = new Anthropic({ apiKey });
  const toolsByName = new Map(tools.map((t) => [t.definition.name, t]));
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      system,
      tools: tools.map((t) => t.definition),
      messages,
    });

    if (response.stop_reason === "refusal") {
      throw new Error("AI_ERROR");
    }

    if (response.stop_reason !== "tool_use") {
      return response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();
    }

    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const tool = toolsByName.get(block.name);
      const result = tool ? await tool.execute() : { error: `Unknown tool ${block.name}` };
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("AI_ERROR");
}
