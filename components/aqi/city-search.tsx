"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface CitySearchProps {
  currentCity: string;
  onCitySelect: (city: string) => void;
}

export function CitySearch({ currentCity, onCitySelect }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://api.waqi.info/search/?keyword=${query}&token=${process.env.NEXT_PUBLIC_WAQI_TOKEN || "8eb70a7316a6adf26fdc1238e30481f93590c300"}`);
        const data = await res.json();
        if (data.status === "ok" && data.data) {
          const names = data.data.map((station: any) => station.station.name).filter(Boolean) as string[];
          setSuggestions(Array.from(new Set(names)));
        }
      } catch (e) {
        setSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounce);
  }, [query]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (city: string) => {
    onCitySelect(city);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(0);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city..."
          className="w-full pl-9 pr-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg border border-border overflow-hidden z-10"
        >
          {suggestions.slice(0, 5).map((city, index) => (
            <button
              key={city}
              onClick={() => handleSelect(city)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${index === selectedIndex
                  ? "bg-primary/20 text-primary"
                  : "text-foreground hover:bg-secondary"
                }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
