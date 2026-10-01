import type { MessageStatus } from "../types";
import { AlertIcon, CheckIcon, ClockIcon, DoubleCheckIcon } from "./icons";

interface MessageStatusIconProps {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusIcon({ status, className = "" }: MessageStatusIconProps) {
  switch (status) {
    case "sending":
      return <ClockIcon className={`size-3.5 ${className}`} />;
    case "failed":
      return <AlertIcon className="size-4 text-red-500" />;
    case "read":
      return <DoubleCheckIcon className={`size-4.5 ${className}`} strokeWidth={2.2} />;
    default:
      return <CheckIcon className={`size-4 ${className}`} strokeWidth={2.5} />;
  }
}
