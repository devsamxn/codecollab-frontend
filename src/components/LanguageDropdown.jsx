import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

let languageOptions = ["javascript", "python"];
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function LanguageDropdown({ language, setLanguage }) {
  return (
    <Dropdown backdrop="blur">
      <DropdownTrigger>
        <Button
          className="cursor-pointer bg-green-600 rounded-2xl hover:bg-green-800 hover:border-2 hover:border-green-500 font-semibold 
        text-white"
        >
          {toTitleCase(language)}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        className="border-2 bg-gray-300 text-center max-w-[8rem] rounded-3xl"
        onAction={(lang) => setLanguage(lang)}
      >
        {languageOptions.map((lang) => (
          <DropdownItem
            className="text-black hover:text-white hover:bg-gray-800 transition-colors duration-300 rounded-3xl"
            key={lang}
          >
            {toTitleCase(lang)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
