import type { NotificationBody } from "../api/greenApi";
import type { IncomingText } from "../types";
import { normalizePhone } from "./phone";

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

export function parseIncomingText(body: NotificationBody): IncomingText | null {
  if (body.typeWebhook !== "incomingMessageReceived") return null;

  const { senderData, messageData, idMessage } = body;
  if (!senderData || senderData.chatType !== "user" || !idMessage) return null;

  const text = extractText(messageData);
  if (!text) return null;

  const phone = senderData.senderPhoneNumber
    ? normalizePhone(String(senderData.senderPhoneNumber))
    : undefined;

  return {
    idMessage,
    chatId: senderData.chatId,
    phone,
    name: senderData.senderName || undefined,
    text,
    timestamp: body.timestamp * 1000,
  };
}
