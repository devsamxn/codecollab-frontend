import { Button } from "@heroui/react";

export default function MyButton({
  onClick,
  text,
  color = null,
  isLoading = false,
}) {
  return (
    <Button
      className={`rounded-2xl border-2 cursor-pointer ${color} ${
        color ? "text-black" : ""
      } hover:bg-gray-300 hover:text-black transition-colors duration-200 px-3`}
      onPress={() => onClick()}
      isLoading={isLoading}
      spinner={
        <svg
          className="animate-spin h-5 w-5 text-current"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      }
    >
      {text}
    </Button>
  );
}
