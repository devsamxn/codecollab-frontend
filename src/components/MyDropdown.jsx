import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";

export default function MenuDefault({
  language,
  setLanguage,
  languageOptions,
}) {
  //   const [language, setLanguage] = useState("Select Language");

  return (
    <Menu>
      <MenuHandler>
        <Button className="cursor-pointer border-1 border-white rounded-lg hover:bg-gray-700 transition-colors duration-300">{language}</Button>
      </MenuHandler>
      <MenuList>
        {languageOptions.map((lang, idx) => (
          <MenuItem key={idx} onClick={() => setLanguage(lang)} className="cursor-pointer text-center text-black">
            {lang}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
