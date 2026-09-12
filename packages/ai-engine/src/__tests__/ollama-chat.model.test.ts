import { afterEach, describe, expect, it, vi } from "vitest";
import { OllamaChatModel } from "../llm/ollama-chat.model";
import type { LlmStreamEvent } from "../llm/types";

/**
 * Streaming tests for the Ollama NDJSON client. These pin the contract the
 * whole real-time UX depends on: `stream()` must yield one `text-delta` per
 * NDJSON chunk AS IT ARRIVES (progressive delivery), survive reads that end
 * mid-JSON-line, and terminate with usage + done exactly once.
 */

/**
 * Mocks global fetch with a Response whose body is a ReadableStream emitting
 * the given byte chunks — the same shape Ollama's NDJSON endpoint produces
 * over HTTP (each `pull` = one network read).
 */
function mockOllamaFetch(chunks: string[]) {
  const encoder = new TextEncoder();
  let index = 0;
  const fetchMock = vi.fn(async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (index < chunks.length) {
          controller.enqueue(encoder.encode(chunks[index++]));
        } else {
          controller.close();
        }
      },
    });
    return new Response(stream, { status: 200, statusText: "OK" });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function collect(events: AsyncIterable<LlmStreamEvent>): Promise<LlmStreamEvent[]> {
  const out: LlmStreamEvent[] = [];
  for await (const event of events) out.push(event);
  return out;
}

const deltaText = (event: LlmStreamEvent) => (event.type === "text-delta" ? event.text : null);

describe("OllamaChatModel.stream", () => {
  const model = new OllamaChatModel({
    baseUrl: "http://localhost:11434",
    apiPath: "/api/chat",
    model: "qwen3:8b",
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("yields one text-delta per NDJSON chunk as it arrives (true streaming)", async () => {
    mockOllamaFetch([
      '{"message":{"content":"Based on"}}\n',
      '{"message":{"content":" your"}}\n',
      '{"message":{"content":" current spending"}}\n',
      '{"done":true,"prompt_eval_count":10,"eval_count":25}\n',
    ]);

    const events = await collect(model.stream({ messages: [{ role: "user", content: "hi" }] }));

    // Each chunk is its own delta — chunks are NOT cumulative snapshots, so
    // downstream consumers must append them in order.
    expect(events.map(deltaText).filter(Boolean)).toEqual([
      "Based on",
      " your",
      " current spending",
    ]);
    expect(events.at(-2)).toEqual({ type: "usage", tokensIn: 10, tokensOut: 25 });
    expect(events.at(-1)).toEqual({ type: "done" });
  });

  it("requests streaming mode from Ollama", async () => {
    const fetchMock = mockOllamaFetch(['{"done":true}\n']);
    await collect(model.stream({ messages: [{ role: "user", content: "hi" }] }));

    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1].body,
    ) as { stream?: boolean };
    expect(body.stream).toBe(true);
  });

  it("reassembles an NDJSON line split across chunk boundaries", async () => {
    mockOllamaFetch([
      '{"message":{"cont',
      'ent":"hello"}}\n{"message":{"content":" world"}}\n',
      '{"done":true}\n',
    ]);

    const events = await collect(model.stream({ messages: [{ role: "user", content: "hi" }] }));

    // The partial JSON stays buffered until its line completes — no dropped
    // or duplicated text.
    expect(events.map(deltaText).filter(Boolean)).toEqual(["hello", " world"]);
  });

  it("normalizes tool-call arguments to a JSON string", async () => {
    mockOllamaFetch([
      '{"message":{"tool_calls":[{"function":{"name":"accounts.list","arguments":{"limit":5}}}]}}\n',
      '{"done":true}\n',
    ]);

    const events = await collect(model.stream({ messages: [{ role: "user", content: "hi" }] }));
    const toolCall = events.find((e) => e.type === "tool_call");
    expect(toolCall).toMatchObject({
      type: "tool_call",
      toolCall: { name: "accounts.list", arguments: '{"limit":5}' },
    });
  });

  it("terminates with done exactly once and omits usage when Ollama reports no counts", async () => {
    mockOllamaFetch(['{"message":{"content":"ok"}}\n', '{"done":true}\n']);

    const events = await collect(model.stream({ messages: [{ role: "user", content: "hi" }] }));

    expect(events.some((e) => e.type === "usage")).toBe(false);
    expect(events.filter((e) => e.type === "done")).toHaveLength(1);
  });
});
