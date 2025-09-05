"use client";

import { type NFTData, extractNFTDataFromToolResult } from "./nft-preview";
import { Markdown } from "./markdown";
// Removed Rarible API imports - using MCP server instead

// Helper function to clean markdown formatting from text
function cleanMarkdown(text: string): string {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
    .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
    .replace(/`(.*?)`/g, "$1") // Remove `code`
    .trim();
}

// Simple NFT ID parser for content extraction
function parseNFTId(input: string): string | null {
  // Handle ETHEREUM:0x...:tokenId format (Rarible format)
  const ethereumMatch = input.match(/ETHEREUM:0x[a-fA-F0-9]{40}:\d+/);
  if (ethereumMatch) {
    return ethereumMatch[0];
  }

  // Handle Doodles #number format
  const doodlesMatch = input.match(/Doodles?\s*#?\s*(\d+)/i);
  if (doodlesMatch) {
    return `ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:${doodlesMatch[1]}`;
  }

  // Handle BAYC #number format
  const baycMatch = input.match(/(?:BAYC|Bored Ape)\s*#?\s*(\d+)/i);
  if (baycMatch) {
    return `ETHEREUM:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:${baycMatch[1]}`;
  }

  // Handle CryptoPunks #number format
  const punksMatch = input.match(/CryptoPunks?\s*#?\s*(\d+)/i);
  if (punksMatch) {
    return `ETHEREUM:0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb:${punksMatch[1]}`;
  }

  // Handle Azuki #number format
  const azukiMatch = input.match(/Azuki\s*#?\s*(\d+)/i);
  if (azukiMatch) {
    return `ETHEREUM:0xed5af388653567af2f388e6224dc7c4b3241c544:${azukiMatch[1]}`;
  }

  // Handle CloneX #number format
  const cloneXMatch = input.match(/CloneX\s*#?\s*(\d+)/i);
  if (cloneXMatch) {
    return `ETHEREUM:0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b:${cloneXMatch[1]}`;
  }

  // Handle Moonbirds #number format
  // Note: Moonbirds stores artwork entirely on-chain, not via IPFS
  const moonbirdsMatch = input.match(/Moonbirds?\s*#?\s*(\d+)/i);
  if (moonbirdsMatch) {
    console.log(
      "⚠️ Moonbirds detected - uses on-chain artwork storage, may not work with traditional metadata fetching"
    );
    return `ETHEREUM:0x23581767a106ae21c074b2276d25e5c3e136a68b:${moonbirdsMatch[1]}`;
  }

  // Handle Otherdeeds #number format
  const otherdeedsMatch = input.match(/Otherdeeds?\s*#?\s*(\d+)/i);
  if (otherdeedsMatch) {
    return `ETHEREUM:0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258:${otherdeedsMatch[1]}`;
  }

  // Handle Mutant Ape Yacht Club #number format
  const maycMatch = input.match(/(?:MAYC|Mutant Ape)\s*#?\s*(\d+)/i);
  if (maycMatch) {
    return `ETHEREUM:0x60e4d786628fea6478f785a6d7e704777c86a7c6:${maycMatch[1]}`;
  }

  return null;
}
import { useEffect } from "react";
import { useCanvasStore } from "./canvas";

interface NFTMessagePartProps {
  content: string;
  toolInvocations?: Array<{
    toolName: string;
    state?: string;
    args?: any;
    result: any;
  }>;
}

export function NFTMessagePart({
  content,
  toolInvocations,
}: NFTMessagePartProps) {
  const setNFTs = useCanvasStore((state) => state.setNFTs);

  // Extract NFT data from the AI response content (MCP server handles API calls)
  useEffect(() => {
    function extractFromContent() {
      console.log("=== EXTRACTING NFT DATA ===");
      console.log("Content preview:", content.substring(0, 500));

      // Enhanced logging for tool invocations
      if (toolInvocations && toolInvocations.length > 0) {
        console.log("🔧 Tool invocations found:", toolInvocations.length);
        toolInvocations.forEach((inv, index) => {
          console.log(`Tool ${index + 1}:`, {
            name: inv.toolName,
            state: inv.state,
            hasArgs: !!inv.args,
            hasResult: !!inv.result,
            args: inv.args,
            result: inv.result,
          });

          // Special logging for NFT tools
          if (inv.toolName === "NFT-items-get-item-by-id") {
            console.log("🎯 NFT-items-get-item-by-id tool detected");
            console.log("📋 Item ID requested:", inv.args?.request?.itemId);
            console.log("📊 Tool state:", inv.state);
            if (inv.result) {
              console.log(
                "✅ Tool result received:",
                JSON.stringify(inv.result, null, 2)
              );
            } else {
              console.log(
                "❌ No tool result - this may indicate an API failure"
              );
            }
          }
        });
      } else {
        console.log("⚠️ No tool invocations found");
      }

      // Process tool invocations to extract NFT data
      if (toolInvocations && toolInvocations.length > 0) {
        console.log(
          "🔄 Processing tool invocations for NFT data extraction..."
        );

        const extractedNFTs: NFTData[] = [];

        toolInvocations.forEach((inv, index) => {
          if (inv.toolName === "NFT-items-get-item-by-id" && inv.result) {
            console.log(`📦 Processing NFT tool result ${index + 1}...`);

            // Extract NFT data from the tool result
            const nftData = extractNFTDataFromToolResult(inv.result);

            if (nftData) {
              console.log("✅ Successfully extracted NFT data:", nftData);
              extractedNFTs.push(nftData);
            } else {
              console.log("❌ Failed to extract NFT data from tool result");
            }
          }
        });

        if (extractedNFTs.length > 0) {
          console.log(`🎯 Setting ${extractedNFTs.length} NFT(s) for display`);
          setNFTs(extractedNFTs);
          return; // Exit early if we found NFT data from tools
        } else {
          console.log(
            "⚠️ No NFT data extracted from tool invocations - falling back to content extraction"
          );
        }
      }

      // Extract image URLs from AI response - try multiple patterns
      let imageUrl = undefined;

      console.log("🔍 Looking for image patterns in content...");
      console.log("Content sample:", content.substring(0, 1000));

      // Pattern 0: Google Cloud Storage URLs (for Moonbirds, etc.)
      const googleCloudMatch = content.match(
        /https:\/\/lh[0-9]+\.googleusercontent\.com\/[^\s\)\]\}]*/i
      );
      if (googleCloudMatch) {
        imageUrl = googleCloudMatch[0];
        console.log("✅ Found Google Cloud URL:", imageUrl);
      }

      // Pattern 1: Full Rarible URL (including paths after hash)
      if (!imageUrl) {
        const fullUrlMatch = content.match(
          /https:\/\/ipfs\.raribleuserdata\.com\/ipfs\/([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/i
        );
        if (fullUrlMatch) {
          imageUrl = fullUrlMatch[0];
          console.log("✅ Found full Rarible URL:", imageUrl);
        }
      }

      // Pattern 2: Any IPFS gateway URL (including paths after hash)
      if (!imageUrl) {
        const gatewayPatterns = [
          /https?:\/\/[^\/\s]*ipfs[^\/\s]*\/ipfs\/([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/gi,
          /https?:\/\/[^\/\s]*\/ipfs\/([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/gi,
          /https?:\/\/ipfs\.io\/ipfs\/([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/gi,
          /https?:\/\/gateway\.pinata\.cloud\/ipfs\/([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/gi,
        ];

        for (const pattern of gatewayPatterns) {
          const match = content.match(pattern);
          if (match) {
            // Extract the hash and path from the full URL
            const hashAndPathMatch = match[0].match(
              /\/ipfs\/([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/i
            );
            if (hashAndPathMatch) {
              const ipfsHashAndPath = hashAndPathMatch[1];
              imageUrl = `https://ipfs.raribleuserdata.com/ipfs/${ipfsHashAndPath}`;
              console.log(
                "✅ Found gateway URL, hash and path:",
                ipfsHashAndPath
              );
              console.log("✅ Converted to Rarible:", imageUrl);
              break;
            }
          }
        }
      }

      // Pattern 3: ipfs:// protocol (including paths after hash)
      if (!imageUrl) {
        const ipfsProtocolMatch = content.match(
          /ipfs:\/\/([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/i
        );
        if (ipfsProtocolMatch) {
          const ipfsHashAndPath = ipfsProtocolMatch[1];
          imageUrl = `https://ipfs.raribleuserdata.com/ipfs/${ipfsHashAndPath}`;
          console.log(
            "✅ Found ipfs:// protocol, hash and path:",
            ipfsHashAndPath
          );
          console.log("✅ Converted to Rarible:", imageUrl);
        }
      }

      // Pattern 4: Raw IPFS hash with optional path (Qm... or ba... or baf...)
      if (!imageUrl) {
        const hashPatterns = [
          /\b(Qm[1-9A-HJ-NP-Za-km-z]{44,}(?:\/[^\s\)\]\}]*)?)\b/g, // Base58 CIDv0 with optional path
          /\b(ba[A-Za-z0-9]{56,}(?:\/[^\s\)\]\}]*)?)\b/g, // Base32 CIDv1 with optional path
          /\b(baf[A-Za-z0-9]{56,}(?:\/[^\s\)\]\}]*)?)\b/g, // Base32 CIDv1 with 'f' and optional path
        ];

        for (const pattern of hashPatterns) {
          const matches = [...content.matchAll(pattern)];
          if (matches.length > 0) {
            const ipfsHashAndPath = matches[0][1];
            imageUrl = `https://ipfs.raribleuserdata.com/ipfs/${ipfsHashAndPath}`;
            console.log("✅ Found raw IPFS hash and path:", ipfsHashAndPath);
            console.log("✅ Converted to Rarible:", imageUrl);
            break;
          }
        }
      }

      // Pattern 5: Look for any hash-like string with path near "image" keyword
      if (!imageUrl) {
        const imageContextMatch = content.match(
          /image[^\n]*([A-Za-z0-9]{40,}(?:\/[^\s\)\]\}]*)?)/i
        );
        if (imageContextMatch) {
          const possibleHashAndPath = imageContextMatch[1];
          if (possibleHashAndPath.match(/^(Qm|ba|baf)[A-Za-z0-9]+/)) {
            imageUrl = `https://ipfs.raribleuserdata.com/ipfs/${possibleHashAndPath}`;
            console.log(
              "✅ Found hash and path near 'image':",
              possibleHashAndPath
            );
            console.log("✅ Converted to Rarible:", imageUrl);
          }
        }
      }

      if (!imageUrl) {
        console.log("❌ No image pattern found in content");
      }
      // More flexible patterns for name and collection extraction
      const nameMatch = content.match(
        /(?:\*\*Name\*\*|Name|Title):\s*\*?\*?([^\n*]+)\*?\*?/i
      );
      const collectionMatch = content.match(
        /(?:\*\*Collection\*\*|Collection):\s*\*?\*?([^\n*]+)\*?\*?/i
      );
      const tokenMatch = content.match(
        /(?:\*\*Token ID\*\*|Token ID|Token):\s*(\d+)/i
      );
      const contractMatch = content.match(
        /(?:\*\*Contract\*\*|Contract):\s*`?([^`\s\n]+)`?/i
      );
      const priceMatch = content.match(
        /(?:Price|List.*?price).*?(\d+\.?\d*)\s*ETH.*?\$(\d+[\d,]*)/i
      );
      const bidMatch = content.match(
        /(?:bid|offer).*?(\d+\.?\d*)\s*ETH.*?\$(\d+[\d,]*)/i
      );

      // Extract traits (clean markdown)
      const faceMatch = content.match(
        /(?:\*\*Face\*\*|Face):\s*\*?\*?([^\n*]+)\*?\*?/i
      );
      const hairMatch = content.match(
        /(?:\*\*Hair\*\*|Hair):\s*\*?\*?([^\n*]+)\*?\*?/i
      );
      const bodyMatch = content.match(
        /(?:\*\*Body\*\*|Body):\s*\*?\*?([^\n*]+)\*?\*?/i
      );
      const backgroundMatch = content.match(
        /(?:\*\*Background\*\*|Background):\s*\*?\*?([^\n*]+)\*?\*?/i
      );
      const headMatch = content.match(
        /(?:\*\*Head\*\*|Head):\s*\*?\*?([^\n*]+)\*?\*?/i
      );

      // Debug logging
      console.log("🔍 EXTRACTION RESULTS:");
      console.log("Name match:", nameMatch?.[1]);
      console.log("Collection match:", collectionMatch?.[1]);
      console.log("Token match:", tokenMatch?.[1]);
      console.log("Contract match:", contractMatch?.[1]);
      console.log("Price match:", priceMatch);
      console.log("Bid match:", bidMatch);
      console.log("Image URL:", imageUrl);
      console.log("Traits found:", {
        face: faceMatch?.[1],
        hair: hairMatch?.[1],
        body: bodyMatch?.[1],
        background: backgroundMatch?.[1],
        head: headMatch?.[1],
      });

      if (imageUrl || nameMatch || content.includes("**Name**:")) {
        const extractedNftId =
          parseNFTId(content) ||
          contractMatch?.[1] + ":" + tokenMatch?.[1] ||
          "unknown";

        const traits = [];
        if (faceMatch)
          traits.push({
            type: "Face",
            value: cleanMarkdown(faceMatch[1].trim()),
          });
        if (hairMatch)
          traits.push({
            type: "Hair",
            value: cleanMarkdown(hairMatch[1].trim()),
          });
        if (bodyMatch)
          traits.push({
            type: "Body",
            value: cleanMarkdown(bodyMatch[1].trim()),
          });
        if (backgroundMatch)
          traits.push({
            type: "Background",
            value: cleanMarkdown(backgroundMatch[1].trim()),
          });
        if (headMatch)
          traits.push({
            type: "Head",
            value: cleanMarkdown(headMatch[1].trim()),
          });

        // Fallback: try to extract name from NFT ID if no explicit name found
        let extractedName = nameMatch?.[1]
          ? cleanMarkdown(nameMatch[1].trim())
          : undefined;
        let extractedCollection = collectionMatch?.[1]
          ? cleanMarkdown(collectionMatch[1].trim())
          : undefined;

        if (!extractedName && extractedNftId) {
          // Try to extract from NFT ID format like "Doodles #2336"
          const doodleMatch = extractedNftId.match(/Doodles?\s*#?(\d+)/i);
          if (doodleMatch) {
            extractedName = `Doodles #${doodleMatch[1]}`;
            extractedCollection = "Doodles";
          }

          // Try other common formats
          const baycMatch = extractedNftId.match(/BAYC\s*#?(\d+)/i);
          if (baycMatch) {
            extractedName = `Bored Ape #${baycMatch[1]}`;
            extractedCollection = "Bored Ape Yacht Club";
          }

          const punkMatch = extractedNftId.match(/CryptoPunks?\s*#?(\d+)/i);
          if (punkMatch) {
            extractedName = `CryptoPunk #${punkMatch[1]}`;
            extractedCollection = "CryptoPunks";
          }
        }

        const nftItem: NFTData = {
          id: extractedNftId,
          name: extractedName || "Unknown NFT",
          image: imageUrl, // Use properly formatted image URL (IPFS, Google Cloud, etc.)
          description: undefined, // Removed generic description
          collection: {
            name: extractedCollection || "Unknown Collection",
            id: contractMatch?.[1] || "unknown",
          },
          price: priceMatch
            ? {
                amount: priceMatch[1],
                currency: "ETH",
                usd: priceMatch[2].replace(",", ""),
              }
            : undefined,
          bid: bidMatch
            ? {
                amount: bidMatch[1],
                currency: "ETH",
                usd: bidMatch[2].replace(",", ""),
              }
            : undefined,
          tokenId: tokenMatch?.[1] || "unknown",
          contract: contractMatch?.[1] || "unknown",
          traits: traits.length > 0 ? traits : undefined,
          marketplace: {
            name: "Rarible",
            url: `https://rarible.com/ethereum/items/${
              contractMatch?.[1] || "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"
            }:${tokenMatch?.[1] || "unknown"}`,
          },
        };

        setNFTs([nftItem]);
      }
    }

    // Extract NFT data from content
    extractFromContent();
  }, [content, toolInvocations]);

  // Since NFT cards now render in the canvas, we always just show the markdown content
  return <Markdown>{content}</Markdown>;
}

// Utility to detect if a message contains NFT-related content
export function isNFTRelatedMessage(
  content: string,
  toolInvocations?: any[]
): boolean {
  const nftKeywords = [
    "#",
    "nft",
    "token",
    "doodle",
    "bayc",
    "bored ape",
    "cryptopunk",
    "azuki",
    "clonex",
    "moonbird",
    "otherdeeds",
    "mayc",
    "mutant ape",
    "opensea",
    "floor price",
    "collection",
    "mint",
    "metadata",
  ];

  const contentLower = content.toLowerCase();
  const hasNFTKeywords = nftKeywords.some((keyword) =>
    contentLower.includes(keyword)
  );

  const hasNFTTools = toolInvocations?.some(
    (inv) =>
      inv.toolName?.includes("NFT") ||
      inv.toolName?.includes("search-items") ||
      inv.toolName?.includes("collection")
  );

  return hasNFTKeywords || hasNFTTools || false;
}
