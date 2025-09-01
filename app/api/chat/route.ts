import { model, type modelID } from "@/ai/providers";
import { smoothStream, streamText, type UIMessage } from "ai";
import { appendResponseMessages } from "ai";
import { saveChat, saveMessages, convertToDBMessages } from "@/lib/chat-store";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { initializeMCPClients, type MCPServerConfig } from "@/lib/mcp-client";
import { generateTitle } from "@/app/actions";

import { checkBotId } from "botid/server";

export async function POST(req: Request) {
  const {
    messages,
    chatId,
    selectedModel,
    userId,
    mcpServers = [],
  }: {
    messages: UIMessage[];
    chatId?: string;
    selectedModel: modelID;
    userId: string;
    mcpServers?: MCPServerConfig[];
  } = await req.json();

  const { isBot, isGoodBot } = await checkBotId();

  if (isBot && !isGoodBot) {
    return new Response(
      JSON.stringify({ error: "Bot is not allowed to access this endpoint" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = chatId || nanoid();

  // Check if chat already exists for the given ID
  // If not, create it now
  let isNewChat = false;
  if (chatId) {
    try {
      const existingChat = await db.query.chats.findFirst({
        where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
      });
      isNewChat = !existingChat;
    } catch (error) {
      console.error("Error checking for existing chat:", error);
      isNewChat = true;
    }
  } else {
    // No ID provided, definitely new
    isNewChat = true;
  }

  // If it's a new chat, save it immediately
  if (isNewChat && messages.length > 0) {
    try {
      // Generate a title based on first user message
      const userMessage = messages.find((m) => m.role === "user");
      let title = "New Chat";

      if (userMessage) {
        try {
          title = await generateTitle([userMessage]);
        } catch (error) {
          console.error("Error generating title:", error);
        }
      }

      // Save the chat immediately so it appears in the sidebar
      await saveChat({
        id,
        userId,
        title,
        messages: [],
      });
    } catch (error) {
      console.error("Error saving new chat:", error);
    }
  }

  // Initialize MCP clients using the already running persistent HTTP/SSE servers
  const { tools, cleanup } = await initializeMCPClients(mcpServers, req.signal);

  // Debug MCP server connection
  console.log("MCP servers passed to API:", mcpServers);
  console.log("Raw tools from MCP initialization:", Object.keys(tools));

  // Claude-optimized tool filtering - aggressive reduction for Claude's token limits
  const filterRelevantTools = (allTools: any, userMessage: string): any => {
    const lowerMessage = userMessage.toLowerCase();
    const toolEntries = Object.entries(allTools);

    // If no tools, return empty
    if (toolEntries.length === 0) {
      return {};
    }

    // For non-MCP questions, return no tools
    const nonMCPKeywords = [
      "quantum computing",
      "physics",
      "cooking",
      "recipe",
      "weather",
      "movie",
      "book",
      "music",
      "write code",
      "debug code",
      "javascript",
      "python",
      "programming tutorial",
      "math problem",
      "science",
      "history",
      "geography",
      "literature",
    ];

    const isDefinitelyNonMCP = nonMCPKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
    if (isDefinitelyNonMCP && userMessage.length > 20) {
      console.log(
        `Non-MCP question detected, filtering out tools to save tokens`
      );
      return {};
    }

    // For Claude, we need to be very selective to stay under token limits
    // 77 tools × 150 tokens = 11,550 tokens just for schemas
    // We need to reduce this to ~20 tools × 150 = 3,000 tokens

    const relevantTools: any = {};
    let toolCount = 0;
    const maxTools = 8; // Very strict limit for Claude to stay under token limits

    // Create a priority scoring system based on user intent
    const getToolPriority = (toolName: string, toolDesc: string): number => {
      let score = 0;
      const toolNameLower = toolName.toLowerCase();

      // Ultra-high priority for exact matches
      if (lowerMessage.includes("floor") && toolNameLower.includes("floor"))
        score += 1000;
      if (
        lowerMessage.includes("collection") &&
        toolNameLower.includes("collection")
      )
        score += 900;
      if (
        lowerMessage.includes("holder") &&
        (toolNameLower.includes("owner") || toolNameLower.includes("holder"))
      )
        score += 800;
      if (lowerMessage.includes("search") && toolNameLower.includes("search"))
        score += 700;
      if (lowerMessage.includes("price") && toolNameLower.includes("price"))
        score += 600;
      if (lowerMessage.includes("stats") && toolNameLower.includes("stat"))
        score += 500;

      // Essential Rarible MCP tools (exact names from your server)
      if (toolName === "NFT-data-and-historical-statistics-get-floor-price")
        score += 1000;
      if (toolName === "search-API-search-collection") score += 900;
      if (
        toolName === "NFT-data-and-historical-statistics-get-collection-stats"
      )
        score += 800;
      if (toolName === "collection-statistics-get-owners") score += 700;
      if (toolName === "NFT-collections-get-collection-by-id") score += 700;
      if (toolName === "search-API-search-items") score += 600;
      if (toolName === "NFT-items-get-items-by-collection") score += 600;
      if (toolName === "collection-leader-board-get-collection-leaderboard")
        score += 500;
      if (toolName === "NFT-items-get-items-by-owner") score += 500;
      if (toolName === "charts-get-floor-price-chart") score += 400;

      // Specific collection names
      if (
        lowerMessage.includes("doodles") &&
        (toolNameLower.includes("collection") ||
          toolNameLower.includes("floor"))
      )
        score += 800;
      if (
        lowerMessage.includes("bayc") &&
        (toolNameLower.includes("collection") ||
          toolNameLower.includes("floor"))
      )
        score += 800;
      if (
        lowerMessage.includes("cryptopunk") &&
        (toolNameLower.includes("collection") ||
          toolNameLower.includes("floor"))
      )
        score += 800;

      // Essential tools that are commonly needed
      if (toolNameLower === "search-api-search-collection") score += 400;
      if (
        toolNameLower === "nft-data-and-historical-statistics-get-floor-price"
      )
        score += 400;
      if (
        toolNameLower ===
        "nft-data-and-historical-statistics-get-collection-stats"
      )
        score += 350;
      if (toolNameLower === "collection-statistics-get-owners") score += 300;
      if (toolNameLower === "nft-collections-get-collection-by-id")
        score += 300;
      if (toolNameLower === "search-api-search-items") score += 250;
      if (toolNameLower === "nft-items-get-items-by-collection") score += 250;
      if (
        toolNameLower === "collection-leader-board-get-collection-leaderboard"
      )
        score += 200;

      return score;
    };

    // Score all tools and sort by priority
    const scoredTools = toolEntries
      .map(([toolName, toolDef]) => ({
        name: toolName,
        def: toolDef,
        score: getToolPriority(
          toolName,
          (toolDef as any).description?.toLowerCase() || ""
        ),
      }))
      .sort((a, b) => b.score - a.score);

    // Include only the highest priority tools
    for (const tool of scoredTools) {
      if (toolCount >= maxTools) break;

      if (tool.score > 0) {
        relevantTools[tool.name] = tool.def;
        toolCount++;
      }
    }

    console.log(
      `Claude-optimized: filtered ${toolEntries.length} tools down to ${toolCount} high-priority tools`
    );

    // Log the selected tools for debugging
    console.log("Selected tools:", Object.keys(relevantTools));
    console.log("User message for filtering:", lowerMessage);

    // If no tools selected, include a few essential ones
    if (toolCount === 0 && toolEntries.length > 0) {
      console.log("No tools matched criteria, including essential NFT tools");
      const essentialTools = [
        "search-api-search-collection",
        "nft-data-and-historical-statistics-get-floor-price",
        "nft-data-and-historical-statistics-get-collection-stats",
        "collection-statistics-get-owners",
      ];

      for (const [toolName, toolDef] of toolEntries) {
        if (essentialTools.includes(toolName)) {
          relevantTools[toolName] = toolDef;
          toolCount++;
        }
      }
      console.log(
        `Added ${toolCount} essential tools:`,
        Object.keys(relevantTools)
      );
    }

    return relevantTools;
  };

  // Get the latest user message to filter tools
  const latestUserMessage = messages[messages.length - 1]?.content || "";

  // Debug: Log all available tools
  console.log("All available tools from MCP:", Object.keys(tools));
  console.log("Total tools count:", Object.keys(tools).length);

  const filteredTools = filterRelevantTools(tools, latestUserMessage);

  // Debug: Log filtered tools
  console.log("Final filtered tools count:", Object.keys(filteredTools).length);
  console.log("Final filtered tools:", Object.keys(filteredTools));

  console.log("messages", messages);
  console.log(
    "parts",
    messages.map((m) => (m.parts ? m.parts.map((p) => p) : []))
  );

  // Track if the response has completed
  let responseCompleted = false;

  // Helper function for exponential backoff on rate limits with Groq fallback
  const streamTextWithRetry = async (
    config: any,
    maxRetries: number = 3
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return streamText(config);
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error.statusCode === 429) {
          if (attempt < maxRetries) {
            const retryAfter =
              error.responseHeaders?.["retry-after"] ||
              error.responseHeaders?.["anthropic-ratelimit-input-tokens-reset"];

            let waitTime = 0;
            if (retryAfter) {
              // If retry-after is provided, use it
              if (typeof retryAfter === "string" && retryAfter.includes("Z")) {
                // ISO timestamp format
                const resetTime = new Date(retryAfter).getTime();
                const now = new Date().getTime();
                waitTime = Math.max(resetTime - now, 1000); // At least 1 second
              } else {
                // Seconds format
                waitTime = parseInt(retryAfter) * 1000;
              }
            } else {
              // Exponential backoff: 2^attempt seconds
              waitTime = Math.pow(2, attempt) * 1000;
            }

            console.log(
              `Rate limit hit, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          } else {
            // After max retries, throw the error (no fallback to preserve Claude usage)
            throw error;
          }
        }

        // If not a rate limit error, throw the error
        throw error;
      }
    }
  };

  const result = await streamTextWithRetry({
    model: model.languageModel(selectedModel),
    system: `You are a helpful assistant with access to a variety of tools.

    Today's date is ${new Date().toISOString().split("T")[0]}.

    The tools are very powerful, and you can use them to answer the user's question.
    So choose the tool that is most relevant to the user's question.

    If tools are not available, say you don't know or if the user wants a tool they can add one from the server icon in bottom left corner in the sidebar.

    You can use multiple tools in a single response.
    Always respond after using the tools for better user experience.
    You can run multiple steps using all the tools!!!!
    Make sure to use the right tool to respond to the user's question.

    Multiple tools can be used in a single response and multiple steps can be used to answer the user's question.

    ## Response Format
    - Markdown is supported.
    - Respond according to tool's response.
    - Use the tools to answer the user's question.
    - If you don't know the answer, use the tools to find the answer or say you don't know.
    `,
    messages,
    tools: filteredTools,
    maxSteps: 5, // Reduce steps to avoid complex multi-step issues
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 2048,
        },
      },
      // Only enable thinking for Claude models
      ...(selectedModel === "claude-4-sonnet"
        ? {
            anthropic: {
              thinking: {
                type: "enabled",
                budgetTokens: 1500,
              },
            },
          }
        : {}),
    },
    experimental_transform: smoothStream({
      delayInMs: 50, // Increase delay for better tool result processing
      chunking: "word", // Use word chunking for more stable streaming
    }),
    onError: (error) => {
      console.error("Chat API Error:", JSON.stringify(error, null, 2));

      // Handle schema validation errors gracefully
      if (
        error.message &&
        error.message.includes("Response validation failed")
      ) {
        console.log(
          "Schema validation error detected - continuing with partial data"
        );
        return; // Don't throw, let the conversation continue
      }

      // Handle tool invocation errors
      if (
        error.message &&
        error.message.includes("ToolInvocation must have a result")
      ) {
        console.log("Tool invocation error - attempting to continue");
        return; // Don't throw, let the conversation continue
      }
    },
    async onFinish({ response }) {
      responseCompleted = true;
      const allMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

      await saveChat({
        id,
        userId,
        messages: allMessages,
      });

      const dbMessages = convertToDBMessages(allMessages, id);
      await saveMessages({ messages: dbMessages });

      // Clean up resources - now this just closes the client connections
      // not the actual servers which persist in the MCP context
      await cleanup();
    },
  });

  // Ensure cleanup happens if the request is terminated early
  req.signal.addEventListener("abort", async () => {
    if (!responseCompleted) {
      console.log("Request aborted, cleaning up resources");
      try {
        await cleanup();
      } catch (error) {
        console.error("Error during cleanup on abort:", error);
      }
    }
  });

  result.consumeStream();
  // Add chat ID to response headers so client can know which chat was created
  return result.toDataStreamResponse({
    sendReasoning: true,
    headers: {
      "X-Chat-ID": id,
    },
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        if (
          error.message.includes("Rate limit") ||
          (error as any).statusCode === 429
        ) {
          return "Rate limit exceeded. The system automatically retried and may have switched to a backup model for better performance.";
        }
        if (
          error.message.includes("timeout") ||
          error.message.includes("AbortError")
        ) {
          return "Request timeout. Please try a simpler question or try again later.";
        }
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          return "Network error. Please check your connection and try again.";
        }
      }
      console.error(error);
      return "An error occurred. Please try again.";
    },
  });
}
