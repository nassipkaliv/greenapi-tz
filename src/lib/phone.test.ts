import { describe, expect, it } from "vitest";
import { formatPhone, isValidPhone, normalizePhone, phoneToChatId } from "./phone";

describe("phone", () => {
  it("normalizes different input formats", () => {
    expect(normalizePhone("+7 (706) 724-32-00")).toBe("77067243200");
    expect(normalizePhone("8 706 724 32 00")).toBe("77067243200");
    expect(normalizePhone("77067243200")).toBe("77067243200");
  });

  it("validates length", () => {
    expect(isValidPhone("77067243200")).toBe(true);
    expect(isValidPhone("12345")).toBe(false);
  });

  it("builds chatId and formats for display", () => {
    expect(phoneToChatId("77067243200")).toBe("77067243200@c.us");
    expect(formatPhone("77067243200")).toBe("+7 706 724 32 00");
    expect(formatPhone("4915112345678")).toBe("+4915112345678");
  });
});
