import { describe, expect, it, vi } from "vitest";
import { LlmStreamEventType } from "@fin-ai/shared-types";
import { parseToolPlan, type ChatModel, type LlmChatRequest } from "@fin-ai/ai-engine";
import { AgentTurnRunner } from "./runners/agent-turn.runner";
import { AgentOrchestratorService } from "./runners/agent-orchestrator.service";

describe("AgentTurnRunner & AgentOrchestratorService recovery", () => {
  it("reconstructs <tool_plan> split across reasoning-delta and text-delta without leaking </tool_plan>", async () => {
    const runner = new AgentTurnRunner();
    const emitted: Array<{ type: string; content?: string }> = [];

    const mockModel: ChatModel = {
      provider: "cline",
      model: "nvidia/nemotron-3.5-super-vl:free",
      complete: vi.fn(),
      async *stream() {
        yield {
          type: LlmStreamEventType.REASONING_DELTA,
          text: '<tool_plan>{"tool_calls":[{"name":"transactions.create","arguments":{"amount":400}}]}',
        };
        yield { type: LlmStreamEventType.TEXT_DELTA, text: "</tool_plan>\n" };
        yield { type: LlmStreamEventType.USAGE, tokensIn: 120, tokensOut: 45 };
        yield { type: LlmStreamEventType.DONE };
      },
    };

    const result = await runner.run(
      mockModel,
      { messages: [] },
      (ev) => emitted.push(ev as { type: string; content?: string }),
      1,
      false,
    );

    expect(result.visibleContent.trim()).toBe("");
    expect(emitted.some((e) => e.type === "token" && e.content?.includes("</tool_plan>"))).toBe(
      false,
    );
    expect(result.tokensIn).toBe(120);
    expect(result.tokensOut).toBe(45);

    const parsed = parseToolPlan(result.rawContent);
    expect(parsed).toHaveLength(1);
    expect(parsed![0].name).toBe("transactions.create");
  });

  it("retries when model returns only an orphan </tool_plan> tag and recovers on next turn", async () => {
    let callCount = 0;
    const mockModel: ChatModel = {
      provider: "cline",
      model: "nvidia/nemotron-3.5-super-vl:free",
      complete: vi.fn(),
      async *stream() {
        callCount++;
        if (callCount === 1) {
          yield { type: LlmStreamEventType.TEXT_DELTA, text: "</tool_plan>\n" };
        } else {
          yield { type: LlmStreamEventType.TEXT_DELTA, text: "Recorded ₹400 expense." };
        }
        yield { type: LlmStreamEventType.DONE };
      },
    };

    const addMessage = vi.fn().mockResolvedValue({ id: "msg-1" });
    const messageUpdate = vi.fn().mockResolvedValue({});
    const orchestrator = new AgentOrchestratorService(
      { client: { message: { update: messageUpdate } } } as never,
      { addMessage } as never,
      { create: () => mockModel } as never,
      new AgentTurnRunner(),
      { dispatch: vi.fn() } as never,
    );

    const request: LlmChatRequest = { messages: [] };
    const events: Array<{ type: string; content?: string }> = [];

    await orchestrator.run({
      userId: "user-1",
      conversationId: "convo-1",
      runId: "run-12345678",
      request,
      hasPendingAction: false,
      emit: (ev) => events.push(ev as { type: string; content?: string }),
    });

    expect(callCount).toBe(2);
    expect(addMessage).toHaveBeenCalledWith("convo-1", "assistant", "Recorded ₹400 expense.");
    expect(events.some((e) => e.type === "done")).toBe(true);
  });
});
