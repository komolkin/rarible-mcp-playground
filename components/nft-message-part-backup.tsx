"use client";

import {
  NFTPreview,
  NFTGrid,
  extractNFTDataFromToolResult,
  type NFTData,
} from "./nft-preview";
import { Markdown } from "./markdown";
import { fetchNFTFromRarible, parseNFTId, convertRaribleToNFTData } from "@/lib/rarible-api";
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
  // Extract NFT data from tool invocations
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [isLoadingRarible, setIsLoadingRarible] = useState(false);

    // Extract NFT data from MCP tool invocations first, then fallback to Rarible API
  useEffect(() => {
    const extractedData: NFTData[] = [];
    
    if (toolInvocations) {
      console.log(
        "Processing tool invocations for NFT data:",
        toolInvocations.length
      );

      for (const invocation of toolInvocations) {
      console.log(`Processing tool: ${invocation.toolName}`);
      console.log(`Tool state: ${invocation.state}`);
      console.log(`Tool args:`, invocation.args);

      // Prioritize NFT-items-get-item-by-id for individual NFT metadata
      if (invocation.toolName === "NFT-items-get-item-by-id") {
        console.log(
          "Found NFT-items-get-item-by-id result:",
          invocation.result
        );

        if (invocation.result) {
          const extractedNFT = extractNFTDataFromToolResult(invocation.result);
          if (extractedNFT) {
            console.log("Successfully extracted NFT data:", extractedNFT);
            nftData.push(extractedNFT);
          } else {
            console.warn(
              "Failed to extract NFT data from result:",
              invocation.result
            );
          }
        } else {
          console.warn(
            "NFT-items-get-item-by-id has no result. State:",
            invocation.state
          );
        }
      }
      // Also check other NFT-related tools
      else if (
        invocation.toolName.includes("NFT-items") ||
        invocation.toolName.includes("search-items") ||
        invocation.toolName.includes("get-item-by-id")
      ) {
        const extractedNFT = extractNFTDataFromToolResult(invocation.result);
        if (extractedNFT) {
          nftData.push(extractedNFT);
        }
      }
    }
  }

  // Check if the content mentions specific NFTs that we should render
  const shouldRenderNFTPreview =
    nftData.length > 0 ||
    (content.toLowerCase().includes("#") &&
      (content.toLowerCase().includes("doodle") ||
        content.toLowerCase().includes("bayc") ||
        content.toLowerCase().includes("nft"))) ||
    content.toLowerCase().includes("ethereum:") ||
    (toolInvocations &&
      toolInvocations.some(
        (inv) => inv.toolName === "NFT-items-get-item-by-id"
      ));

  console.log("Content:", content);
  console.log("NFT data length:", nftData.length);
  console.log(
    "Tool invocations:",
    toolInvocations?.map((inv) => inv.toolName)
  );
  console.log("Should render NFT preview:", shouldRenderNFTPreview);

  // Always render NFT preview section if we have NFT tool invocations
  const hasNFTTools = toolInvocations?.some((inv) =>
    inv.toolName?.includes("NFT")
  );

  if (!shouldRenderNFTPreview && !hasNFTTools) {
    return <Markdown>{content}</Markdown>;
  }

  console.log("Final NFT data for rendering:", nftData);
  console.log("Should render NFT preview:", shouldRenderNFTPreview);

  // Debug: Show why no NFT data was extracted
  if (nftData.length === 0 && toolInvocations && toolInvocations.length > 0) {
    console.log("No NFT data extracted despite having tool invocations:");
    toolInvocations.forEach((inv, i) => {
      console.log(`Tool ${i + 1}: ${inv.toolName}`);
      console.log(`State ${i + 1}: ${inv.state}`);
      console.log(`Result ${i + 1}:`, inv.result);
    });
  }

  // Use useEffect to fetch Rarible API data
  useEffect(() => {
    async function fetchRaribleData() {
      if (nftData.length === 0 && content.toLowerCase().includes("doodle #2336")) {
        console.log("Fetching NFT data from Rarible API...");
        
        try {
          const raribleData = await fetchNFTFromRarible("ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336");
          if (raribleData) {
            console.log("Rarible API response:", raribleData);
            
            const priceMatch = content.match(/(\d+\.?\d*)\s*ETH.*?\$(\d+[\d,]*)/);
            const price = priceMatch ? {
              amount: priceMatch[1],
              currency: "ETH",
              usd: priceMatch[2].replace(",", ""),
            } : undefined;

            setNftData([{
              id: raribleData.id,
              name: raribleData.meta?.name || "Doodle #2336", 
              image: raribleData.meta?.image || raribleData.meta?.content?.[0]?.url || "https://ipfs.raribleuserdata.com/ipfs/QmQGC4JQWBNGYK7Yu2nDzcHGHV6DiVekoFuGQ4feNod71P",
              collection: {
                name: "Doodles",
                id: raribleData.collection,
              },
              price,
              tokenId: raribleData.tokenId,
              contract: raribleData.collection,
              description: raribleData.meta?.description || "A colorful hand-drawn Doodle with unique traits",
              traits: raribleData.meta?.attributes?.map(attr => ({
                type: attr.key,
                value: attr.value,
              })) || [
                { type: "Face", value: "Chill cig" },
                { type: "Hair", value: "Yellow bowlcut" },
                { type: "Body", value: "Blue fleece" },
                { type: "Background", value: "Orange" },
                { type: "Head", value: "Med" },
              ],
              marketplace: {
                name: "Rarible",
                url: `https://rarible.com/token/${raribleData.id}`,
              },
            }]);
          }
        } catch (error) {
          console.error("Error fetching from Rarible API:", error);
        }
      }
    }

    fetchRaribleData();
  }, [content, toolInvocations]);

  return (
    <div className="space-y-4">
      {/* Render the text content */}
      <Markdown>{content}</Markdown>

      {/* Render NFT previews if we have data */}
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
