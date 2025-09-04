/**
 * Rarible API integration for fetching NFT metadata and IPFS images
 */

const RARIBLE_API_BASE = "https://api.rarible.org/v0.1";

export interface RaribleNFTItem {
  id: string;
  blockchain: string;
  collection: string;
  tokenId: string;
  meta: {
    name: string;
    description?: string;
    image?: string;
    content?: Array<{
      url: string;
      representation: string;
      mimeType: string;
    }>;
    attributes?: Array<{
      key: string;
      value: string;
      type?: string;
    }>;
  };
  bestSellOrder?: {
    takePrice: string;
    takePriceUsd?: string;
    platform: string;
    data: any;
  };
  bestBidOrder?: {
    makePrice: string;
    makePriceUsd?: string;
  };
}

export interface RaribleCollection {
  id: string;
  name: string;
  symbol?: string;
  type: string;
  meta?: {
    name: string;
    description?: string;
  };
}

/**
 * Fetch NFT item metadata from Rarible API
 */
export async function fetchNFTFromRarible(
  itemId: string
): Promise<RaribleNFTItem | null> {
  try {
    console.log("Fetching NFT from Rarible API:", itemId);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Add API key if available
    const apiKey =
      process.env.RARIBLE_API_KEY || process.env.NEXT_PUBLIC_RARIBLE_API_KEY;
    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
      console.log("Using Rarible API key for authentication");
    }

    const response = await fetch(`${RARIBLE_API_BASE}/items/${itemId}`, {
      headers,
    });

    if (!response.ok) {
      console.error("Rarible API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Rarible API response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching from Rarible API:", error);
    return null;
  }
}

/**
 * Fetch collection metadata from Rarible API
 */
export async function fetchCollectionFromRarible(
  collectionId: string
): Promise<RaribleCollection | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Add API key if available
    const apiKey =
      process.env.RARIBLE_API_KEY || process.env.NEXT_PUBLIC_RARIBLE_API_KEY;
    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }

    const response = await fetch(
      `${RARIBLE_API_BASE}/collections/${collectionId}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      console.error(
        "Rarible Collection API error:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collection from Rarible API:", error);
    return null;
  }
}

/**
 * Convert Rarible API response to our NFTData format
 */
export function convertRaribleToNFTData(raribleItem: RaribleNFTItem): any {
  return {
    id: raribleItem.id,
    name: raribleItem.meta?.name,
    description: raribleItem.meta?.description,
    image: raribleItem.meta?.image || raribleItem.meta?.content?.[0]?.url,
    collection: {
      name: raribleItem.collection, // Will need to fetch collection details separately
      id: raribleItem.collection,
    },
    price: raribleItem.bestSellOrder
      ? {
          amount: (
            parseFloat(raribleItem.bestSellOrder.takePrice) /
            1000000000000000000
          ).toFixed(6), // Convert Wei to ETH
          currency: "ETH",
          usd: raribleItem.bestSellOrder.takePriceUsd,
        }
      : undefined,
    traits: raribleItem.meta?.attributes?.map((attr) => ({
      type: attr.key,
      value: attr.value,
      rarity: undefined, // Rarible doesn't provide rarity in this endpoint
    })),
    marketplace: {
      name: raribleItem.bestSellOrder?.platform || "Rarible",
      url: `https://rarible.com/token/${raribleItem.id}`,
    },
    tokenId: raribleItem.tokenId,
    contract: raribleItem.collection,
    owner: undefined, // Would need separate API call for ownership
  };
}

/**
 * Parse NFT ID from various formats to Rarible format
 */
export function parseNFTId(input: string): string | null {
  // Handle ETHEREUM:0x...:tokenId format (already in Rarible format)
  const ethereumMatch = input.match(/ETHEREUM:0x[a-fA-F0-9]{40}:\d+/);
  if (ethereumMatch) {
    return ethereumMatch[0];
  }

  // Handle contract:tokenId format
  const contractMatch = input.match(/0x[a-fA-F0-9]{40}:\d+/);
  if (contractMatch) {
    return `ETHEREUM:${contractMatch[0]}`;
  }

  // Handle Doodles #XXXX format
  if (input.toLowerCase().includes("doodle") && input.includes("#")) {
    const tokenMatch = input.match(/#(\d+)/);
    if (tokenMatch) {
      return `ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:${tokenMatch[1]}`;
    }
  }

  // Handle BAYC #XXXX format
  if (input.toLowerCase().includes("bayc") && input.includes("#")) {
    const tokenMatch = input.match(/#(\d+)/);
    if (tokenMatch) {
      return `ETHEREUM:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:${tokenMatch[1]}`;
    }
  }

  // Handle CryptoPunks #XXXX format
  if (input.toLowerCase().includes("punk") && input.includes("#")) {
    const tokenMatch = input.match(/#(\d+)/);
    if (tokenMatch) {
      return `ETHEREUM:0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb:${tokenMatch[1]}`;
    }
  }

  return null;
}
