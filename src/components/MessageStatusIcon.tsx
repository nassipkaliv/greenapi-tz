import type { MessageStatus } from "../types";
import { AlertIcon, CheckIcon, ClockIcon } from "./icons";

interface MessageStatusIconProps {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusIcon({ status, className = "" }: MessageStatusIconProps) {
  if (status === "sending") {
    return <ClockIcon className={`size-3.5 ${className}`} />;
  }
  if (status === "failed") {
    return <AlertIcon className="size-4 text-red-500" />;
  }
  return <CheckIcon className={`size-4 ${className}`} strokeWidth={2.5} />;
}
