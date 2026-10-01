import { describe, expect, it } from "vitest";
import type { Chat, RemoteMessage } from "../types";
import { chatReducer, type ChatState } from "./chatReducer";

function chat(overrides: Partial<Chat> = {}): Chat {
  return {
    id: "77470467897",
    phone: "77470467897",
    messages: [],
    unread: 0,
    createdAt: 0,
    ...overrides,
  };
}

function remote(overrides: Partial<RemoteMessage> = {}): RemoteMessage {
  return {
    idMessage: "in-1",
    chatId: "5881406513",
    direction: "incoming",
    phone: "77470467897",
    name: "nassipkaliv",
    text: "привет",
    timestamp: 1000,
    ...overrides,
  };
}

function state(chats: Chat[], activeChatId: string | null = null): ChatState {
  return { chats, activeChatId };
}

describe("chatReducer", () => {
  it("creates a chat and opens it", () => {
    const next = chatReducer(state([]), { type: "createChat", phone: "77470467897" });
    expect(next.activeChatId).toBe("77470467897");
    expect(next.chats).toHaveLength(1);
  });

  it("opens the existing chat instead of creating a duplicate", () => {
    const next = chatReducer(state([chat()]), { type: "createChat", phone: "77470467897" });
    expect(next.chats).toHaveLength(1);
    expect(next.activeChatId).toBe("77470467897");
  });

  it("matches a reply to the chat by phone and remembers the Telegram id", () => {
    const next = chatReducer(state([chat()]), { type: "receive", message: remote() });
    expect(next.chats).toHaveLength(1);
    expect(next.chats[0]).toMatchObject({
      remoteId: "5881406513",
      name: "nassipkaliv",
      unread: 1,
    });
    expect(next.chats[0].messages[0].text).toBe("привет");
  });

  it("matches by remote id when the phone is hidden", () => {
    const initial = state([chat({ remoteId: "5881406513" })]);
    const next = chatReducer(initial, {
      type: "receive",
      message: remote({ phone: undefined }),
    });
    expect(next.chats).toHaveLength(1);
    expect(next.chats[0].messages).toHaveLength(1);
  });

  it("does not count messages in the open chat as unread", () => {
    const next = chatReducer(state([chat()], "77470467897"), {
      type: "receive",
      message: remote(),
    });
    expect(next.chats[0].unread).toBe(0);
  });

  it("ignores duplicate notifications", () => {
    const once = chatReducer(state([chat()]), { type: "receive", message: remote() });
    const twice = chatReducer(once, { type: "receive", message: remote() });
    expect(twice).toBe(once);
  });

  it("creates a chat for an unknown sender", () => {
    const next = chatReducer(state([]), {
      type: "receive",
      message: remote({ phone: undefined, chatId: "999" }),
    });
    expect(next.chats[0]).toMatchObject({ id: "999", phone: "", remoteId: "999", unread: 1 });
  });

  it("does not create a chat from an outgoing message of an unknown chat", () => {
    const initial = state([]);
    const next = chatReducer(initial, {
      type: "receive",
      message: remote({ direction: "outgoing", phone: undefined }),
    });
    expect(next).toBe(initial);
  });

  it("upgrades delivery status but never downgrades it", () => {
    const initial = state([
      chat({
        messages: [{ id: "m1", text: "hi", direction: "outgoing", timestamp: 1, status: "sent" }],
      }),
    ]);
    const read = chatReducer(initial, { type: "setStatus", idMessage: "m1", status: "read" });
    expect(read.chats[0].messages[0].status).toBe("read");

    const late = chatReducer(read, { type: "setStatus", idMessage: "m1", status: "delivered" });
    expect(late.chats[0].messages[0].status).toBe("read");
  });

  it("deletes a chat and closes it", () => {
    const next = chatReducer(state([chat()], "77470467897"), {
      type: "deleteChat",
      chatId: "77470467897",
    });
    expect(next).toEqual({ chats: [], activeChatId: null });
  });
});
