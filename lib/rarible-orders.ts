/**
 * Rarible Order Management and Purchase Integration
 * Based on Rarible API Order Data Model: https://docs.rarible.org/reference/order-data-model
 */

// Web3 functionality for future implementation
// import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
// import { parseEther } from 'viem';

export interface RaribleOrder {
  id: string;
  fill: string;
  platform: string;
  status: string;
  makePrice?: string;
  takePriceUsd?: string;
  maker: string;
  make: {
    type: {
      "@type": string;
    };
    value: string;
  };
  take: {
    type: {
      "@type": string;
    };
    value: string;
  };
  salt: string;
  signature: string;
  data: any;
}

export interface PurchaseRequest {
  orderId: string;
  amount?: string;
  originFees?: Array<{
    account: string;
    value: number;
  }>;
}

/**
 * Get sell orders for an NFT item (currently disabled due to API restrictions)
 */
export async function getSellOrders(itemId: string): Promise<RaribleOrder[]> {
  try {
    console.log(
      "⚠️ Rarible sell orders API currently unavailable (403 errors)"
    );
    console.log("🔄 Using fallback approach for:", itemId);

    // Since the Rarible API v0.1 is returning 403 errors,
    // we'll return empty array and rely on marketplace fallbacks
    return [];
  } catch (error) {
    console.error("💥 Error fetching sell orders:", error);
    return [];
  }
}

/**
 * Prepare purchase transaction (requires wallet connection)
 */
export async function preparePurchase(
  orderId: string,
  buyerAddress: string
): Promise<any> {
  try {
    console.log("🔄 Preparing purchase for order:", orderId);

    const response = await fetch(
      `https://api.rarible.org/v0.1/orders/${orderId}/prepare-purchase`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer: buyerAddress,
          amount: 1, // Usually 1 for NFTs
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to prepare purchase: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Purchase prepared:", data);
    return data;
  } catch (error) {
    console.error("💥 Error preparing purchase:", error);
    throw error;
  }
}

/**
 * Get marketplace URL for an NFT (using Rarible's URL scheme)
 */
export function getMarketplaceUrl(itemId: string, platform?: string): string {
  // Convert ETHEREUM:0x...:tokenId to marketplace-specific format
  const parts = itemId.split(":");

  if (parts.length === 3 && parts[0] === "ETHEREUM") {
    const contractAddress = parts[1];
    const tokenId = parts[2];

    switch (platform?.toLowerCase()) {
      case "rarible":
        return `https://rarible.com/ethereum/items/${contractAddress}:${tokenId}`;
      case "opensea":
        return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
      case "looksrare":
        return `https://looksrare.org/collections/${contractAddress}/${tokenId}`;
      default:
        // Default to Rarible with correct URL scheme
        return `https://rarible.com/ethereum/items/${contractAddress}:${tokenId}`;
    }
  }

  // Fallback for non-standard itemId formats
  return `https://rarible.com/token/${itemId}`;
}

/**
 * Check if user can purchase (has wallet connected)
 */
export function canPurchase(userWalletAddress?: string): boolean {
  return !!userWalletAddress;
}

/**
 * Format price for display
 */
export function formatPrice(price: string, currency: string = "ETH"): string {
  try {
    const numPrice = parseFloat(price);
    if (numPrice >= 1000000000000000) {
      // Convert from Wei to ETH
      return (numPrice / 1000000000000000000).toFixed(4);
    }
    return numPrice.toFixed(4);
  } catch {
    return price;
  }
}
