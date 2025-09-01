import { createAnthropic } from "@ai-sdk/anthropic";

import { customProvider } from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
}

// Helper to get API keys from environment variables first, then localStorage
const getApiKey = (key: string): string | undefined => {
  // Check for environment variables first
  if (process.env[key]) {
    return process.env[key] || undefined;
  }

  // Fall back to localStorage if available
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(key) || undefined;
  }

  return undefined;
};

const anthropicClient = createAnthropic({
  apiKey: getApiKey("ANTHROPIC_API_KEY"),
});

const languageModels = {
  "claude-4-sonnet": anthropicClient("claude-sonnet-4-20250514"),
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "claude-4-sonnet": {
    provider: "Anthropic",
    name: "Claude Sonnet 4",
    description:
      "Anthropic's most advanced model with exceptional reasoning, coding, and creative capabilities. Optimized for Rarible MCP integration.",
    apiVersion: "claude-sonnet-4-20250514",
    capabilities: [
      "Advanced",
      "Reasoning",
      "Coding",
      "Creative",
      "Agentic",
      "MCP",
    ],
  },
};

// Update API keys when localStorage changes (for runtime updates)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    // Reload the page if any API key changed to refresh the providers
    if (event.key?.includes("API_KEY")) {
      window.location.reload();
    }
  });
}

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "claude-4-sonnet";
