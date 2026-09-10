import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAgentMessages } from "@/features/ai-advisor/api/useAgentMessages";

/**
 * Streaming-semantics tests for the agent message state (requirement: the
 * active assistant message must grow chunk-by-chunk during streaming, a
 * `token_replace` must swap text in place, and the final `done` must NOT
 * duplicate the message).
 */
describe("useAgentMessages", () => {
  /** Starts one user turn + one streaming assistant turn. */
  function startTurn(handle: { result: { current: ReturnType<typeof useAgentMessages> } }) {
    act(() => {
      handle.result.current.pushUserTurn("Where did I spend the most this month?");
      handle.result.current.pushAssistantTurn();
    });
  }

  it("appends delta chunks incrementally to the active assistant message", () => {
    const handle = renderHook(() => useAgentMessages());
    startTurn(handle);

    act(() => handle.result.current.appendText("Based on"));
    act(() => handle.result.current.appendText(" your current"));
    act(() => handle.result.current.appendText(" spending"));

    const messages = handle.result.current.messages;
    expect(messages).toHaveLength(2); // user + ONE assistant message
    expect(messages[1]).toMatchObject({ role: "assistant", streaming: true });
    expect(messages[1].text).toBe("Based on your current spending");
  });

  it("token_replace swaps streamed text in place without duplicating the message", () => {
    const handle = renderHook(() => useAgentMessages());
    startTurn(handle);

    // Prose streamed before tool execution...
    act(() => handle.result.current.appendText("Adding ₹500 to Transport right now."));
    // ...then the grounded confirmation message REPLACES it (never appends).
    act(() =>
      handle.result.current.replaceText(
        "I've proposed an action for your confirmation. Please review the details on the card and confirm or reject.",
      ),
    );

    const messages = handle.result.current.messages;
    expect(messages).toHaveLength(2);
    expect(messages[1].text).toBe(
      "I've proposed an action for your confirmation. Please review the details on the card and confirm or reject.",
    );

    // A token after a replace appends to the replaced text (protocol allows it).
    act(() => handle.result.current.appendText(" You can also edit it."));
    expect(handle.result.current.messages[1].text.endsWith(" You can also edit it.")).toBe(true);
  });

  it("endStream (done) finalizes the streamed message instead of adding a second one", () => {
    const handle = renderHook(() => useAgentMessages());
    startTurn(handle);

    act(() => handle.result.current.appendText("Transport is your largest category at ₹8,420."));
    act(() => handle.result.current.endStream());

    const messages = handle.result.current.messages;
    expect(messages).toHaveLength(2);
    expect(messages[1].streaming).toBe(false);
    expect(messages[1].text).toBe("Transport is your largest category at ₹8,420.");
  });

  it("interrupted stream preserves the partial response and fails running activity", () => {
    const handle = renderHook(() => useAgentMessages());
    startTurn(handle);

    act(() => handle.result.current.appendText("Partial answer so far"));
    act(() =>
      handle.result.current.appendActivity({
        tool: "transactions.list",
        kind: "tool",
        status: "running",
      }),
    );
    act(() => handle.result.current.failStream("Connection lost"));

    const messages = handle.result.current.messages;
    expect(messages[1].text).toBe("Partial answer so far"); // partial text preserved
    expect(messages[1].streaming).toBe(false);
    expect(messages[1].error).toBe("Connection lost");
    expect(messages[1].activities?.[0]).toMatchObject({ status: "error" });
  });

  it("updates activities in place and stamps completion time once", () => {
    const handle = renderHook(() => useAgentMessages());
    startTurn(handle);

    act(() =>
      handle.result.current.appendActivity({
        tool: "accounts.list",
        kind: "tool",
        status: "running",
      }),
    );
    act(() =>
      handle.result.current.updateActivity("accounts.list", {
        status: "success",
        summary: "Found 3 accounts",
      }),
    );

    const activity = handle.result.current.messages[1].activities?.[0];
    expect(activity).toMatchObject({
      tool: "accounts.list",
      status: "success",
      summary: "Found 3 accounts",
    });
    expect(activity?.completedAt).toBeGreaterThan(0);
  });

  it("ignores text updates when the last message is the user's", () => {
    const handle = renderHook(() => useAgentMessages());
    act(() => handle.result.current.pushUserTurn("hello"));

    act(() => handle.result.current.appendText("stray token"));

    const messages = handle.result.current.messages;
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ role: "user", text: "hello" });
  });
});
