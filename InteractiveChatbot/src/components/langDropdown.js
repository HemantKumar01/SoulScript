import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languageOptions } from "./languageOptions";

const LanguageDropdown = ({ onSelect }) => {
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const filteredLanguages = languageOptions.filter((lang) =>
    lang.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="">
      <Select
        onValueChange={(value) => {
          const selected = languageOptions.find((lang) => lang.code === value);
          setSelectedLanguage(selected);
          onSelect && onSelect(selected);
        }}
        className="bg-white"
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <Input
            placeholder="Search language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 "
          />
          {filteredLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.language}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageDropdown;
