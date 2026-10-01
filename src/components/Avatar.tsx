import { UserIcon } from "./icons";

const GRADIENTS = [
  "from-[#ff885e] to-[#ff516a]",
  "from-[#ffcd6a] to-[#ffa85c]",
  "from-[#82b1ff] to-[#665fff]",
  "from-[#a0de7e] to-[#54cb68]",
  "from-[#53edd6] to-[#28c9b7]",
  "from-[#72d5fd] to-[#2a9ef1]",
  "from-[#e0a2f3] to-[#d669ed]",
];

const SIZES = {
  sm: "size-10 text-base",
  md: "size-13.5 text-xl",
};

interface AvatarProps {
  seed: string;
  name: string;
  size?: keyof typeof SIZES;
}

function hash(value: string): number {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(result);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word.charAt(0)))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({ seed, name, size = "md" }: AvatarProps) {
  const letters = initials(name);
  const gradient = GRADIENTS[hash(seed) % GRADIENTS.length];

  return (
    <div
      className={`${SIZES[size]} ${gradient} flex shrink-0 items-center justify-center rounded-full bg-linear-to-b font-medium text-white select-none`}
    >
      {letters || <UserIcon className="size-1/2" />}
    </div>
  );
}
