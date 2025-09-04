import { modelID } from "@/ai/providers";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2, Zap } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
}

// Quick prompt shortcuts
const PROMPT_SHORTCUTS = [
  { label: "Doodles #2336", prompt: "Show me metadata for Doodles #2336 NFT" },
  {
    label: "Floor Price",
    prompt: "What's the floor price of Doodles collection?",
  },
  {
    label: "Collection Stats",
    prompt: "Show me Doodles collection statistics",
  },
  {
    label: "Cheapest NFTs",
    prompt: "Find the cheapest NFTs in Doodles collection",
  },
  {
    label: "BAYC Stats",
    prompt: "Show me Bored Ape Yacht Club collection statistics",
  },
  { label: "Search Collections", prompt: "Search for popular NFT collections" },
];

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  selectedModel,
  setSelectedModel,
}: InputProps) => {
  const isStreaming = status === "streaming" || status === "submitted";
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleShortcutClick = (prompt: string) => {
    // Create a synthetic event to update the input
    const event = {
      target: { value: prompt },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(event);
    setShowShortcuts(false);
  };

  return (
    <div className="relative w-full space-y-2">
      {/* Quick Shortcuts */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Zap className="h-3 w-3 mr-1" />
          Quick prompts
        </Button>

        {(showShortcuts || input === "") && (
          <>
            {PROMPT_SHORTCUTS.map((shortcut) => (
              <Badge
                key={shortcut.label}
                variant="secondary"
                className="cursor-pointer hover:bg-accent/80 transition-colors text-xs py-1 px-2"
                onClick={() => handleShortcutClick(shortcut.prompt)}
              >
                {shortcut.label}
              </Badge>
            ))}
          </>
        )}
      </div>

      <div className="relative">
        <ShadcnTextarea
          className="resize-none bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl pr-12 pt-4 pb-16 border-input focus-visible:ring-ring placeholder:text-muted-foreground"
          value={input}
          autoFocus
          placeholder="Send a message..."
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !isLoading &&
              input.trim()
            ) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <ModelPicker
          setSelectedModel={setSelectedModel}
          selectedModel={selectedModel}
        />

        <button
          type={isStreaming ? "button" : "submit"}
          onClick={isStreaming ? stop : undefined}
          disabled={
            (!isStreaming && !input.trim()) ||
            (isStreaming && status === "submitted")
          }
          className="absolute right-2 bottom-2 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200"
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
};
