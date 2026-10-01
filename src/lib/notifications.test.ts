import { describe, expect, it } from "vitest";
import type { NotificationBody } from "../api/greenApi";
import { parseNotification } from "./notifications";

const TIMESTAMP = 1790795891;

function incomingText(overrides: Partial<NotificationBody> = {}): NotificationBody {
  return {
    typeWebhook: "incomingMessageReceived",
    timestamp: TIMESTAMP,
    idMessage: "1790795891120",
    senderData: {
      chatId: "5881406513",
      chatType: "user",
      senderName: "nassipkaliv",
      senderPhoneNumber: 77470467897,
    },
    messageData: {
      typeMessage: "textMessage",
      textMessageData: { textMessage: "test" },
    },
    ...overrides,
  };
}

describe("parseNotification", () => {
  it("parses an incoming text message from a personal chat", () => {
    expect(parseNotification(incomingText())).toEqual({
      type: "message",
      message: {
        idMessage: "1790795891120",
        chatId: "5881406513",
        direction: "incoming",
        phone: "77470467897",
        name: "nassipkaliv",
        text: "test",
        timestamp: TIMESTAMP * 1000,
      },
    });
  });

  it("parses extended text messages", () => {
    const event = parseNotification(
      incomingText({
        messageData: {
          typeMessage: "extendedTextMessage",
          extendedTextMessageData: { text: "https://green-api.com" },
        },
      }),
    );
    expect(event?.type === "message" && event.message.text).toBe("https://green-api.com");
  });

  it("treats senderPhoneNumber 0 as unknown phone", () => {
    const event = parseNotification(
      incomingText({ senderData: { chatId: "1", chatType: "user", senderPhoneNumber: 0 } }),
    );
    expect(event?.type === "message" && event.message.phone).toBeUndefined();
  });

  it("ignores channels, groups and non-text messages", () => {
    expect(
      parseNotification(
        incomingText({ senderData: { chatId: "-1001139279533", chatType: "channel" } }),
      ),
    ).toBeNull();
    expect(
      parseNotification(incomingText({ senderData: { chatId: "1@g.us", chatType: "group" } })),
    ).toBeNull();
    expect(
      parseNotification(incomingText({ messageData: { typeMessage: "imageMessage" } })),
    ).toBeNull();
  });

  it("parses messages sent from the phone as outgoing", () => {
    const event = parseNotification(
      incomingText({
        typeWebhook: "outgoingMessageReceived",
        senderData: { chatId: "5881406513", chatType: "user", chatName: "Yernur" },
      }),
    );
    expect(event).toMatchObject({
      type: "message",
      message: { direction: "outgoing", chatId: "5881406513", name: "Yernur", phone: undefined },
    });
  });

  it("maps delivery statuses", () => {
    const status = (value: string) =>
      parseNotification({
        typeWebhook: "outgoingMessageStatus",
        timestamp: TIMESTAMP,
        idMessage: "42",
        status: value,
      });

    expect(status("read")).toEqual({ type: "status", idMessage: "42", status: "read" });
    expect(status("noAccount")).toEqual({ type: "status", idMessage: "42", status: "failed" });
    expect(status("unknown")).toBeNull();
  });

  it("ignores other notification types", () => {
    expect(parseNotification({ typeWebhook: "stateInstanceChanged", timestamp: 1 })).toBeNull();
    expect(
      parseNotification(incomingText({ typeWebhook: "outgoingAPIMessageReceived" })),
    ).toBeNull();
  });
});
