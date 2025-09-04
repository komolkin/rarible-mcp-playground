"use client";

import { type NFTData } from "./nft-preview";
import { Markdown } from "./markdown";
import {
  fetchNFTFromRarible,
  parseNFTId,
  convertRaribleToNFTData,
} from "@/lib/rarible-api";
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

  // Extract NFT data from the AI response content and fetch from Rarible API
  useEffect(() => {
    async function fetchNFTData() {
      // Parse any NFT ID from the content or extract from tool invocations
      let nftId = parseNFTId(content);

      // If no ID found in content, try to extract from tool invocations
      if (!nftId && toolInvocations) {
        for (const inv of toolInvocations) {
          if (
            inv.toolName === "NFT-items-get-item-by-id" &&
            inv.args?.request?.itemId
          ) {
            nftId = inv.args.request.itemId;
            console.log("Extracted NFT ID from tool args:", nftId);
            break;
          }
        }
      }

      if (nftId) {
        console.log("Fetching real NFT data from Rarible API for:", nftId);

        try {
          const raribleData = await fetchNFTFromRarible(nftId);
          if (raribleData) {
            console.log("Rarible API response:", raribleData);

            // Parse price from AI response text as fallback
            const priceMatch = content.match(
              /(\d+\.?\d*)\s*ETH.*?\$(\d+[\d,]*)/
            );
            const price = priceMatch
              ? {
                  amount: priceMatch[1],
                  currency: "ETH",
                  usd: priceMatch[2].replace(",", ""),
                }
              : undefined;

            const nftItem: NFTData = {
              id: raribleData.id,
              name: raribleData.meta?.name,
              image:
                raribleData.meta?.image || raribleData.meta?.content?.[0]?.url,
              description: raribleData.meta?.description,
              collection: {
                name: raribleData.collection || "Unknown Collection",
                id: raribleData.collection,
              },
              price,
              tokenId: raribleData.tokenId,
              contract: raribleData.collection,
              traits: raribleData.meta?.attributes?.map((attr) => ({
                type: attr.key,
                value: attr.value,
              })),
              marketplace: {
                name: "Rarible",
                url: `https://rarible.com/token/${raribleData.id}`,
              },
            };

            console.log("Created NFT data with Rarible API:", nftItem);
            setNFTs([nftItem]);
            return; // Exit early if API call succeeded
          }
        } catch (error) {
          console.error("Error fetching from Rarible API:", error);
        }
      }

      // Always try extracting from content as well (for additional metadata)
      extractFromContent();
    }

    function extractFromContent() {
      console.log("=== EXTRACTING NFT DATA ===");
      console.log("Content preview:", content.substring(0, 500));

      // Extract IPFS hash from AI response - try multiple patterns
      let raribleImageUrl = undefined;

      console.log("🔍 Looking for IPFS patterns in content...");
      console.log("Content sample:", content.substring(0, 1000));

      // Pattern 1: Full Rarible URL
      const fullUrlMatch = content.match(
        /https:\/\/ipfs\.raribleuserdata\.com\/ipfs\/([A-Za-z0-9]{46,})/i
      );
      if (fullUrlMatch) {
        raribleImageUrl = fullUrlMatch[0];
        console.log("✅ Found full Rarible URL:", raribleImageUrl);
      }

      // Pattern 2: Any IPFS gateway URL
      if (!raribleImageUrl) {
        const gatewayPatterns = [
          /https?:\/\/[^\/\s]*ipfs[^\/\s]*\/ipfs\/([A-Za-z0-9]{40,})/gi,
          /https?:\/\/[^\/\s]*\/ipfs\/([A-Za-z0-9]{40,})/gi,
          /https?:\/\/ipfs\.io\/ipfs\/([A-Za-z0-9]{40,})/gi,
          /https?:\/\/gateway\.pinata\.cloud\/ipfs\/([A-Za-z0-9]{40,})/gi,
        ];

        for (const pattern of gatewayPatterns) {
          const match = content.match(pattern);
          if (match) {
            // Extract the hash from the full URL
            const hashMatch = match[0].match(/\/ipfs\/([A-Za-z0-9]{40,})/i);
            if (hashMatch) {
              const ipfsHash = hashMatch[1];
              raribleImageUrl = `https://ipfs.raribleuserdata.com/ipfs/${ipfsHash}`;
              console.log("✅ Found gateway URL, hash:", ipfsHash);
              console.log("✅ Converted to Rarible:", raribleImageUrl);
              break;
            }
          }
        }
      }

      // Pattern 3: ipfs:// protocol
      if (!raribleImageUrl) {
        const ipfsProtocolMatch = content.match(/ipfs:\/\/([A-Za-z0-9]{40,})/i);
        if (ipfsProtocolMatch) {
          const ipfsHash = ipfsProtocolMatch[1];
          raribleImageUrl = `https://ipfs.raribleuserdata.com/ipfs/${ipfsHash}`;
          console.log("✅ Found ipfs:// protocol, hash:", ipfsHash);
          console.log("✅ Converted to Rarible:", raribleImageUrl);
        }
      }

      // Pattern 4: Raw IPFS hash (Qm... or ba... or baf...)
      if (!raribleImageUrl) {
        const hashPatterns = [
          /\b(Qm[1-9A-HJ-NP-Za-km-z]{44,})\b/g, // Base58 CIDv0
          /\b(ba[A-Za-z0-9]{56,})\b/g, // Base32 CIDv1
          /\b(baf[A-Za-z0-9]{56,})\b/g, // Base32 CIDv1 with 'f'
        ];

        for (const pattern of hashPatterns) {
          const matches = [...content.matchAll(pattern)];
          if (matches.length > 0) {
            const ipfsHash = matches[0][1];
            raribleImageUrl = `https://ipfs.raribleuserdata.com/ipfs/${ipfsHash}`;
            console.log("✅ Found raw IPFS hash:", ipfsHash);
            console.log("✅ Converted to Rarible:", raribleImageUrl);
            break;
          }
        }
      }

      // Pattern 5: Look for any hash-like string near "image" keyword
      if (!raribleImageUrl) {
        const imageContextMatch = content.match(
          /image[^\n]*([A-Za-z0-9]{40,})/i
        );
        if (imageContextMatch) {
          const possibleHash = imageContextMatch[1];
          if (possibleHash.match(/^(Qm|ba|baf)[A-Za-z0-9]+$/)) {
            raribleImageUrl = `https://ipfs.raribleuserdata.com/ipfs/${possibleHash}`;
            console.log("✅ Found hash near 'image':", possibleHash);
            console.log("✅ Converted to Rarible:", raribleImageUrl);
          }
        }
      }

      if (!raribleImageUrl) {
        console.log("❌ No IPFS pattern found in content");
      }
      // More flexible patterns for name and collection extraction
      const nameMatch = content.match(
        /(?:\*\*Name\*\*|Name|Title):\s*([^\n]+)/i
      );
      const collectionMatch = content.match(
        /(?:\*\*Collection\*\*|Collection):\s*([^\n]+)/i
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

      // Extract traits
      const faceMatch = content.match(/\*\*Face\*\*:\s*([^\n]+)/);
      const hairMatch = content.match(/\*\*Hair\*\*:\s*([^\n]+)/);
      const bodyMatch = content.match(/\*\*Body\*\*:\s*([^\n]+)/);
      const backgroundMatch = content.match(/\*\*Background\*\*:\s*([^\n]+)/);
      const headMatch = content.match(/\*\*Head\*\*:\s*([^\n]+)/);

      // Debug logging
      console.log("🔍 EXTRACTION RESULTS:");
      console.log("Name match:", nameMatch?.[1]);
      console.log("Collection match:", collectionMatch?.[1]);
      console.log("Token match:", tokenMatch?.[1]);
      console.log("Contract match:", contractMatch?.[1]);
      console.log("Price match:", priceMatch);
      console.log("Bid match:", bidMatch);
      console.log("Image URL:", raribleImageUrl);

      if (raribleImageUrl || nameMatch || content.includes("**Name**:")) {
        const extractedNftId =
          parseNFTId(content) ||
          contractMatch?.[1] + ":" + tokenMatch?.[1] ||
          "unknown";

        const traits = [];
        if (faceMatch)
          traits.push({ type: "Face", value: faceMatch[1].trim() });
        if (hairMatch)
          traits.push({ type: "Hair", value: hairMatch[1].trim() });
        if (bodyMatch)
          traits.push({ type: "Body", value: bodyMatch[1].trim() });
        if (backgroundMatch)
          traits.push({ type: "Background", value: backgroundMatch[1].trim() });
        if (headMatch)
          traits.push({ type: "Head", value: headMatch[1].trim() });

        // Fallback: try to extract name from NFT ID if no explicit name found
        let extractedName = nameMatch?.[1]?.trim();
        let extractedCollection = collectionMatch?.[1]?.trim();

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
          image: raribleImageUrl, // Use properly formatted Rarible gateway URL
          description:
            "NFT from " + (extractedCollection || "Unknown Collection"),
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
            name: "OpenSea",
            url: `https://opensea.io/assets/ethereum/${
              contractMatch?.[1] || "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"
            }/${tokenMatch?.[1] || "unknown"}`,
          },
        };

        setNFTs([nftItem]);
      }
    }

    // Extract immediately from content for instant display
    extractFromContent();

    // Then try API for enhanced data
    fetchNFTData();
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
