"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Copy } from "lucide-react";
import { toast } from "sonner";

export interface NFTData {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  collection?: {
    name: string;
    id: string;
  };
  price?: {
    amount: string;
    currency: string;
    usd?: string;
  };
  bid?: {
    amount: string;
    currency: string;
    usd?: string;
  };
  traits?: Array<{
    type: string;
    value: string;
    rarity?: number;
  }>;
  marketplace?: {
    url: string;
    name: string;
  };
  owner?: string;
  tokenId?: string;
  contract?: string;
}

interface NFTPreviewProps {
  nft: NFTData;
  className?: string;
}

export function NFTPreview({ nft, className = "" }: NFTPreviewProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", nft.image);
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.log("Image failed to load:", nft.image);
    setImageLoading(false);
    setImageError(true);
  };

  // Add timeout for image loading
  useEffect(() => {
    if (nft.image) {
      console.log(
        "🖼️ Setting up image loading timeout for:",
        nft.image?.substring(0, 100) + "..."
      );
      const timeout = setTimeout(() => {
        if (imageLoading) {
          console.log(
            "⏰ Image loading timeout reached:",
            nft.image?.substring(0, 100) + "..."
          );
          setImageLoading(false);
          setImageError(true);
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      // No image URL provided - stop loading immediately
      console.log("❌ No image URL provided, stopping loading state");
      setImageLoading(false);
      setImageError(true);
    }
  }, [nft.image]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(nft.id);
    toast.success("NFT ID copied to clipboard");
  };

  const handleBuy = () => {
    if (nft.marketplace?.url) {
      window.open(nft.marketplace.url, "_blank");
    } else {
      toast.info("Marketplace link not available");
    }
  };

  // Process IPFS URLs using Rarible gateway
  const getImageUrl = (url: string | undefined) => {
    if (!url) return null;

    console.log(
      "🖼️ Processing image URL:",
      url.substring(0, 100) + (url.length > 100 ? "..." : "")
    );

    // Handle Google Cloud Storage URLs (used by Moonbirds and others)
    if (url.includes("googleusercontent.com")) {
      console.log("✅ Google Cloud Storage URL detected (Moonbirds-style)");
      return url; // Use Google Cloud URL directly
    }

    // Handle data URIs (for on-chain artwork)
    if (url.startsWith("data:")) {
      console.log("✅ Data URI detected (on-chain artwork)");
      return url;
    }

    // Handle standard HTTP/HTTPS URLs
    if (url.startsWith("http://") || url.startsWith("https://")) {
      console.log("✅ HTTP/HTTPS URL detected");
      return url;
    }

    // If it's already a Rarible IPFS gateway URL, use it directly
    if (url.includes("ipfs.raribleuserdata.com")) {
      console.log("✅ Already Rarible gateway URL");
      return url;
    }

    // Convert IPFS URLs to Rarible gateway
    if (url.startsWith("ipfs://")) {
      const hash = url.replace("ipfs://", "");
      const raribleUrl = `https://ipfs.raribleuserdata.com/ipfs/${hash}`;
      console.log("✅ Converted ipfs:// to Rarible:", raribleUrl);
      return raribleUrl;
    }

    // Extract hash from other IPFS patterns and use Rarible gateway
    if (url.includes("/ipfs/")) {
      const parts = url.split("/ipfs/");
      const hashAndPath = parts[1].split(/[?#\)\]\}]/)[0]; // Remove query params, anchors, and closing punctuation
      const raribleUrl = `https://ipfs.raribleuserdata.com/ipfs/${hashAndPath}`;
      console.log("✅ Extracted hash and path from gateway URL:", hashAndPath);
      console.log("✅ Converted to Rarible:", raribleUrl);
      return raribleUrl;
    }

    // Check if it's a raw IPFS hash (with or without path)
    const hashMatch = url.match(
      /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|ba[A-Za-z0-9]{56,}|baf[A-Za-z0-9]{56,})(\/.*)?$/
    );
    if (hashMatch) {
      const hashWithPath = hashMatch[0];
      const raribleUrl = `https://ipfs.raribleuserdata.com/ipfs/${hashWithPath}`;
      console.log(
        "✅ Raw IPFS hash detected (with path):",
        hashWithPath,
        "converted to Rarible:",
        raribleUrl
      );
      return raribleUrl;
    }

    // For non-IPFS URLs, use as-is
    console.log("ℹ️ Non-IPFS URL, using as-is");
    return url;
  };

  const imageUrl = getImageUrl(nft.image);

  // Debug image processing
  console.log("NFT image processing:", {
    originalImage: nft.image,
    processedImageUrl: imageUrl,
    isIPFS: nft.image?.startsWith("ipfs://") || nft.image?.includes("/ipfs/"),
    imageType: nft.image?.includes("googleusercontent.com")
      ? "google-cloud"
      : nft.image?.startsWith("data:")
      ? "data-uri"
      : nft.image?.startsWith("http")
      ? "http-url"
      : nft.image?.startsWith("ipfs://")
      ? "ipfs-protocol"
      : nft.image?.includes("/ipfs/")
      ? "ipfs-gateway"
      : "unknown",
    imageLength: nft.image?.length || 0,
  });

  return (
    <Card className={`w-full max-w-sm mx-auto overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {nft.name ||
                `${nft.collection?.name || "NFT"} #${nft.tokenId || "Unknown"}`}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {nft.collection?.name || "Unknown Collection"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyId}
            className="ml-2"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* NFT Image */}
        <div className="relative aspect-square w-full mb-3 bg-muted rounded-lg overflow-hidden">
          {imageLoading && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}

          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={nft.name || "NFT"}
              fill
              className="object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 400px) 100vw, 400px"
              unoptimized={
                imageUrl.includes("ipfs") || imageUrl.startsWith("data:")
              } // Disable optimization for IPFS and data URIs
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="h-8 w-8 mx-auto mb-2 bg-muted-foreground/20 rounded-full" />
                <p className="text-sm text-muted-foreground">
                  {imageError ? "Image failed to load" : "Loading image..."}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Original: {nft.image ? "✅ Present" : "❌ Missing"}</p>
                  <p>Processed: {imageUrl ? "✅ Present" : "❌ Missing"}</p>
                  <p>
                    Type:{" "}
                    {nft.image?.includes("googleusercontent.com")
                      ? "Google Cloud"
                      : nft.image?.startsWith("data:")
                      ? "Data URI"
                      : nft.image?.startsWith("http")
                      ? "HTTP URL"
                      : nft.image?.startsWith("ipfs://")
                      ? "IPFS Protocol"
                      : nft.image?.includes("/ipfs/")
                      ? "IPFS Gateway"
                      : "Unknown"}
                  </p>
                </div>
                {imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      URL: {imageUrl.substring(0, 30)}...
                    </p>
                    <a
                      href={imageUrl}
                      target="_blank"
                      className="text-xs text-blue-500 hover:text-blue-400 underline"
                    >
                      Open directly
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <div className="text-right">
              {nft.price ? (
                <>
                  <div className="font-semibold">
                    {nft.price.amount} {nft.price.currency}
                  </div>
                  {nft.price.usd && (
                    <div className="text-sm text-muted-foreground">
                      ~${nft.price.usd}
                    </div>
                  )}
                </>
              ) : (
                <div className="font-semibold text-muted-foreground">
                  Not for sale
                </div>
              )}
            </div>
          </div>

          {/* Current Bid */}
          {nft.bid && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current bid</span>
              <div className="text-right">
                <div className="font-semibold text-blue-600">
                  {nft.bid.amount} {nft.bid.currency}
                </div>
                {nft.bid.usd && (
                  <div className="text-sm text-muted-foreground">
                    ~${nft.bid.usd}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Traits */}
        {nft.traits && nft.traits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Traits</h4>
            <div className="flex flex-wrap gap-1">
              {nft.traits.slice(0, 6).map((trait, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs"
                  title={`${trait.type}: ${trait.value}${
                    trait.rarity ? ` (${trait.rarity}% rarity)` : ""
                  }`}
                >
                  {trait.type}: {trait.value}
                </Badge>
              ))}
              {nft.traits.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{nft.traits.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {nft.description && (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {nft.description}
            </p>
          </div>
        )}

        {/* Image Source - Always show if we have any image */}
        {nft.image && (
          <div className="mt-3 p-2 bg-muted/30 rounded-md">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Image Source:
            </div>
            <div className="text-xs break-all">
              {nft.image.includes("googleusercontent.com") ? (
                <>
                  <div className="text-blue-500 mb-1">
                    ☁️ Google Cloud Storage
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {nft.image.substring(0, 60)}...
                  </div>
                  <div>
                    <a
                      href={nft.image}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-400 underline"
                    >
                      View Image
                    </a>
                  </div>
                </>
              ) : nft.image.startsWith("data:") ? (
                <>
                  <div className="text-orange-500 mb-1">
                    🎨 On-Chain Artwork (Data URI)
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Size: {Math.round(nft.image.length / 1024)}KB
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This artwork is stored directly on the blockchain
                  </div>
                </>
              ) : nft.image.startsWith("ipfs://") ? (
                <>
                  <div className="text-blue-500 mb-1">IPFS: {nft.image}</div>
                  <div className="text-purple-500 mb-1">
                    Rarible Gateway: {getImageUrl(nft.image)}
                  </div>
                  <div>
                    <a
                      href={getImageUrl(nft.image)}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-400 underline"
                    >
                      View Image
                    </a>
                  </div>
                </>
              ) : nft.image.includes("/ipfs/") ? (
                <>
                  <div className="text-purple-500 mb-1">
                    Rarible Gateway: {nft.image}
                  </div>
                  <div>
                    Hash: <code>{nft.image.split("/ipfs/")[1]}</code>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-green-500 mb-1">
                    Direct URL: {nft.image.substring(0, 50)}
                    {nft.image.length > 50 ? "..." : ""}
                  </div>
                  <div>
                    <a
                      href={nft.image}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-400 underline"
                    >
                      View Image
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          onClick={handleBuy}
          size="sm"
          className="w-full"
          disabled={!nft.price || !nft.marketplace?.url}
          variant={nft.price ? "default" : "secondary"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {nft.price
            ? `Buy for ${nft.price.amount} ${nft.price.currency}`
            : "Not for sale"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to clean markdown formatting from text
function cleanMarkdown(text: string): string {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
    .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
    .replace(/`(.*?)`/g, "$1") // Remove `code`
    .trim();
}

// Utility function to extract NFT data from MCP tool results
export function extractNFTDataFromToolResult(toolResult: any): NFTData | null {
  try {
    // Handle different API response structures
    const data = toolResult?.result || toolResult;

    if (!data) return null;

    // Debug logging to understand the response structure
    console.log("NFT Tool Result Structure:", JSON.stringify(data, null, 2));

    // Try to handle nested response structures (common in MCP responses)
    let actualData = data;

    // If data is wrapped in another layer, unwrap it
    if (data.data) actualData = data.data;
    if (data.item) actualData = data.item;
    if (data.nft) actualData = data.nft;
    if (data.token) actualData = data.token;
    if (data.result) actualData = data.result;

    // Handle array responses (take first item)
    if (Array.isArray(actualData) && actualData.length > 0) {
      actualData = actualData[0];
    }

    console.log(
      "Actual data after unwrapping:",
      JSON.stringify(actualData, null, 2)
    );

    // Extract basic NFT information with comprehensive field mapping for Rarible API
    const nftData: NFTData = {
      id: actualData.id || actualData.tokenId || actualData.token_id || "",
      name: cleanMarkdown(
        actualData.meta?.name || // Rarible: meta.name
          actualData.name || // Direct name
          actualData.title || // Title field
          actualData.metadata?.name || // OpenSea: metadata.name
          actualData.token_name || // Alternative naming
          actualData.meta?.title || // Meta title
          actualData.properties?.name ||
          "" // Properties name
      ),
      description: cleanMarkdown(
        actualData.meta?.description || // Rarible: meta.description
          actualData.description || // Direct description
          actualData.metadata?.description || // OpenSea: metadata.description
          actualData.properties?.description ||
          "" // Properties description
      ),
      image:
        actualData.meta?.image || // Rarible: meta.image (PRIORITY)
        actualData.meta?.content?.[0]?.url || // Rarible: meta.content[0].url
        actualData.image || // Direct image
        actualData.imageUrl || // Image URL
        actualData.image_url || // Snake case image URL
        actualData.metadata?.image || // OpenSea: metadata.image
        actualData.metadata?.image_url || // OpenSea: metadata.image_url
        actualData.content?.[0]?.url || // Content array
        actualData.properties?.image || // Properties image
        actualData.animation_url, // Animation URL
      tokenId:
        actualData.tokenId ||
        actualData.token_id ||
        actualData.tokenID ||
        actualData.token,
      contract:
        actualData.contract ||
        actualData.contractAddress ||
        actualData.contract_address ||
        actualData.address,
    };

    // Extract collection info with enhanced mapping
    if (actualData.collection || actualData.contract) {
      nftData.collection = {
        name: cleanMarkdown(
          actualData.collection?.name ||
            actualData.collection?.title ||
            actualData.collectionName ||
            actualData.collection_name ||
            "Unknown Collection"
        ),
        id:
          actualData.collection?.id ||
          actualData.collection?.contract ||
          actualData.collection?.address ||
          actualData.contract ||
          actualData.contractAddress,
      };
    }

    // Extract price information with enhanced mapping
    if (
      actualData.price ||
      actualData.orders?.[0] ||
      actualData.bestSellOrder ||
      actualData.sell_orders?.[0]
    ) {
      const priceData =
        actualData.price ||
        actualData.orders?.[0] ||
        actualData.bestSellOrder ||
        actualData.sell_orders?.[0] ||
        actualData.bestOrder;

      if (priceData) {
        // Handle Rarible price format (Wei to ETH conversion)
        let amount =
          priceData.takePrice ||
          priceData.amount ||
          priceData.take?.value ||
          priceData.price ||
          priceData.value;

        // Convert Wei to ETH if the amount is very large (likely Wei)
        if (amount && typeof amount === "string" && amount.length > 10) {
          const weiAmount = parseFloat(amount);
          if (weiAmount > 1000000000000000) {
            // More than 0.001 ETH in Wei
            amount = (weiAmount / 1000000000000000000).toFixed(6); // Convert Wei to ETH
          }
        }

        nftData.price = {
          amount: amount || "0",
          currency:
            priceData.currency ||
            priceData.take?.type?.["@type"] ||
            priceData.take?.type ||
            priceData.symbol ||
            "ETH",
          usd: priceData.takePriceUsd || priceData.usd || priceData.usdValue,
        };
      }
    }

    // Extract traits/attributes with enhanced mapping
    if (
      actualData.meta?.attributes ||
      actualData.attributes ||
      actualData.traits
    ) {
      const traits =
        actualData.meta?.attributes || // Rarible: meta.attributes (PRIORITY)
        actualData.attributes || // Direct attributes
        actualData.traits || // Traits field
        [];
      nftData.traits = traits.map((attr: any) => ({
        type:
          attr.trait_type ||
          attr.traitType ||
          attr.key ||
          attr.type ||
          attr.name,
        value: attr.value || attr.trait_value,
        rarity: attr.rarity_percentage || attr.rarity || attr.rarityPercentage,
      }));
    }

    // Extract marketplace info with enhanced mapping
    if (data.marketplace || data.platform || data.orders?.[0]?.platform) {
      const marketplace = data.marketplace ||
        data.platform ||
        data.orders?.[0]?.platform || { name: "OpenSea" }; // Default fallback

      nftData.marketplace = {
        name: marketplace.name || marketplace.platform || "OpenSea",
        url:
          marketplace.url ||
          marketplace.link ||
          data.permalink ||
          data.external_url ||
          data.opensea_url ||
          data.marketplace_url,
      };
    }

    // Extract owner info
    nftData.owner = data.owner || data.owner_address || data.owners?.[0];

    // Be more lenient - render card if we have any identifying information
    if (!nftData.id && !nftData.name && !nftData.tokenId && !nftData.contract) {
      console.warn("Insufficient NFT data to create preview:", actualData);
      return null;
    }

    // Generate fallback name if missing
    if (!nftData.name && nftData.collection?.name && nftData.tokenId) {
      nftData.name = `${nftData.collection.name} #${nftData.tokenId}`;
    }

    return nftData;
  } catch (error) {
    console.error("Error extracting NFT data:", error);
    return null;
  }
}

// Component to render multiple NFTs in a grid
interface NFTGridProps {
  nfts: NFTData[];
  className?: string;
}

export function NFTGrid({ nfts, className = "" }: NFTGridProps) {
  if (nfts.length === 0) return null;

  return (
    <div
      className={`grid gap-4 ${
        nfts.length === 1
          ? "grid-cols-1 max-w-sm mx-auto"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      } ${className}`}
    >
      {nfts.map((nft, index) => (
        <NFTPreview key={nft.id || index} nft={nft} />
      ))}
    </div>
  );
}
