import type { Chat } from "../types";
import { formatPhone } from "./phone";

const DAY_MS = 24 * 60 * 60 * 1000;

const timeFormat = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });
const weekdayFormat = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
const shortDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const dayFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp);
}

export function formatListTime(timestamp: number): string {
  const daysAgo = Math.round((startOfDay(Date.now()) - startOfDay(timestamp)) / DAY_MS);
  if (daysAgo <= 0) return timeFormat.format(timestamp);
  if (daysAgo < 7) return capitalize(weekdayFormat.format(timestamp));
  return shortDateFormat.format(timestamp);
}

export function formatDayLabel(timestamp: number): string {
  const daysAgo = Math.round((startOfDay(Date.now()) - startOfDay(timestamp)) / DAY_MS);
  if (daysAgo === 0) return "Сегодня";
  if (daysAgo === 1) return "Вчера";
  return dayFormat.format(timestamp);
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function chatTitle(chat: Chat): string {
  return chat.name ?? formatPhone(chat.phone);
}
