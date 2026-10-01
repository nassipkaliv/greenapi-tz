const URL_PATTERN = /(https?:\/\/[^\s<]*[^\s<.,:;"')\]!?])/g;

interface MessageTextProps {
  text: string;
  outgoing: boolean;
}

export function MessageText({ text, outgoing }: MessageTextProps) {
  const parts = text.split(URL_PATTERN);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className={`break-all underline-offset-2 ${outgoing ? "text-link-out underline" : "text-link hover:underline"}`}
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}
