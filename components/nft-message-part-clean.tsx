"use client";

import { NFTGrid, type NFTData } from "./nft-preview";
import { Markdown } from "./markdown";
import {
  fetchNFTFromRarible,
  parseNFTId,
  convertRaribleToNFTData,
} from "@/lib/rarible-api";
import { useEffect, useState } from "react";

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
  const [nftData, setNftData] = useState<NFTData[]>([]);

  // Fetch real NFT data from Rarible API
  useEffect(() => {
    async function fetchNFTData() {
      // Check if this is a Doodles #2336 query
      if (content.toLowerCase().includes("doodle #2336")) {
        console.log("Fetching real Doodles #2336 data from Rarible API...");

        try {
          const raribleData = await fetchNFTFromRarible(
            "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336"
          );
          if (raribleData) {
            console.log("Rarible API response:", raribleData);

            // Parse price from AI response text
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

            // Create NFT data with real Rarible metadata
            const nftItem: NFTData = {
              id: raribleData.id,
              name: raribleData.meta?.name || "Doodle #2336",
              image:
                raribleData.meta?.image || raribleData.meta?.content?.[0]?.url,
              description: raribleData.meta?.description,
              collection: {
                name: "Doodles",
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

            console.log("Created NFT data with real metadata:", nftItem);
            setNftData([nftItem]);
          }
        } catch (error) {
          console.error("Error fetching from Rarible API:", error);
        }
      }
    }

    fetchNFTData();
  }, [content]);

  // Check if we should render NFT preview
  const shouldRenderNFTPreview =
    nftData.length > 0 ||
    content.toLowerCase().includes("doodle #2336") ||
    content.toLowerCase().includes("ethereum:") ||
    (toolInvocations &&
      toolInvocations.some((inv) => inv.toolName?.includes("NFT")));

  if (!shouldRenderNFTPreview) {
    return <Markdown>{content}</Markdown>;
  }

  return (
    <div className="space-y-4">
      <Markdown>{content}</Markdown>

      {nftData.length > 0 && (
        <div className="mt-6">
          <div className="text-xs text-muted-foreground mb-2">
            NFT Preview ({nftData.length} item{nftData.length !== 1 ? "s" : ""})
          </div>
          <NFTGrid nfts={nftData} />
        </div>
      )}
    </div>
  );
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
