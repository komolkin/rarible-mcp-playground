import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  showShortcuts?: boolean; // Show shortcuts only on new chat screen
}

// Prompt shortcuts for new chat screen
const PROMPT_SHORTCUTS = [
  { label: "How can you help?", prompt: "How can you help me with NFTs?" },
  {
    label: "BAYC floor price",
    prompt: "What's the floor price of Bored Ape Yacht Club?",
  },
  {
    label: "Top collections this week",
    prompt: "Top 10 NFT Ethereum Collections by Volume This Week",
  },
  {
    label: "NFTs owned by vitalik.eth",
    prompt: "Show me NFTs owned by vitalik.eth",
  },
  {
    label: "Random Doodles NFT",
    prompt: () => {
      const randomId = Math.floor(Math.random() * 10000) + 1;
      return `Show me metadata for Doodles #${randomId} NFT`;
    },
  },
];

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  showShortcuts = false,
}: InputProps) => {
  const isStreaming = status === "streaming" || status === "submitted";

  const handleShortcutClick = (prompt: string | (() => string)) => {
    // Handle both static strings and dynamic functions
    const promptText = typeof prompt === "function" ? prompt() : prompt;

    // Create a synthetic event to update the input
    const event = {
      target: { value: promptText },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(event);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <ShadcnTextarea
          className="resize-none bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl pr-12 pt-4 pb-16 border-input focus-visible:ring-ring placeholder:text-muted-foreground"
          value={input}
          autoFocus
          placeholder="Ask anything NFT related..."
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

        <button
          type={isStreaming ? "button" : "submit"}
          onClick={isStreaming ? stop : undefined}
          disabled={
            (!isStreaming && !input.trim()) ||
            (isStreaming && status === "submitted")
          }
          className="absolute right-2 bottom-2 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-primary-foreground" />
          )}
        </button>
      </div>

      {/* Prompt Shortcuts - only show on new chat screen, centered under input with 24px spacing */}
      {showShortcuts && (
        <div className="flex flex-wrap gap-2 justify-center mt-6">
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
        </div>
      )}
    </div>
  );
};
