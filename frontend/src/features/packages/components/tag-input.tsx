import { useState, useRef, useCallback } from "react";

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxItems?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  maxItems = 20,
  placeholder = "Type and press Enter",
  disabled = false,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTags = useCallback(
    (raw: string) => {
      const parts = raw
        .split(/[\n,]+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      const unique = new Set<string>();
      const next = [...value];

      for (const part of parts) {
        const normalized = part.toLowerCase();
        if (!unique.has(normalized) && !next.some((tag) => tag.toLowerCase() === normalized)) {
          unique.add(normalized);
          if (next.length < maxItems) {
            next.push(part);
          }
        }
      }

      onChange(next);
    },
    [maxItems, onChange, value]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (!input.trim()) return;
      addTags(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (next.includes(",")) {
      addTags(next);
      setInput("");
    } else {
      setInput(next);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    addTags(pasted);
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div
        className="rounded-md border border-input bg-background transition-colors duration-150 ease-out focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 motion-reduce:transition-none"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-2 p-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              <span className="max-w-[200px] truncate">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                disabled={disabled}
                className="rounded-full hover:bg-muted-foreground/20 transition-colors disabled:opacity-50"
              >
                <span className="sr-only">Remove {tag}</span>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled || value.length >= maxItems}
            className="min-w-[120px] flex-1 bg-transparent px-2 py-1 text-sm outline-none disabled:cursor-not-allowed"
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {value.length} of {maxItems} items
        </span>
        {value.length >= maxItems && (
          <span className="text-destructive">Maximum items reached</span>
        )}
      </div>
    </div>
  );
}
