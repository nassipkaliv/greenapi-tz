import type { NotificationBody } from "../api/greenApi";
import type { ChatEvent, MessageDirection, MessageStatus } from "../types";
import { normalizePhone } from "./phone";

const STATUS_MAP: Record<string, MessageStatus> = {
  sent: "sent",
  delivered: "delivered",
  read: "read",
  failed: "failed",
  noAccount: "failed",
  notInGroup: "failed",
  suspended: "failed",
  yellowCard: "failed",
};

function extractText(messageData: NotificationBody["messageData"]): string | undefined {
  switch (messageData?.typeMessage) {
    case "textMessage":
      return messageData.textMessageData?.textMessage;
    case "extendedTextMessage":
      return messageData.extendedTextMessageData?.text;
    default:
      return undefined;
  }
}

function parseMessage(body: NotificationBody, direction: MessageDirection): ChatEvent | null {
  const { senderData, messageData, idMessage } = body;
  if (!senderData || senderData.chatType !== "user" || !idMessage) return null;

  const text = extractText(messageData);
  if (!text) return null;

  const incoming = direction === "incoming";
  const phone =
    incoming && senderData.senderPhoneNumber
      ? normalizePhone(String(senderData.senderPhoneNumber))
      : undefined;

  return {
    type: "message",
    message: {
      idMessage,
      chatId: senderData.chatId,
      direction,
      phone,
      name: (incoming ? senderData.senderName : senderData.chatName) || undefined,
      text,
      timestamp: body.timestamp * 1000,
    },
  };
}

export function parseNotification(body: NotificationBody): ChatEvent | null {
  switch (body.typeWebhook) {
    case "incomingMessageReceived":
      return parseMessage(body, "incoming");
    case "outgoingMessageReceived":
      return parseMessage(body, "outgoing");
    case "outgoingMessageStatus": {
      const status = body.status ? STATUS_MAP[body.status] : undefined;
      return body.idMessage && status
        ? { type: "status", idMessage: body.idMessage, status }
        : null;
    }
    default:
      return null;
  }
}
