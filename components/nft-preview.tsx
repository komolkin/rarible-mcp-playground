"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ColorThief from "colorthief";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import {
  getSellOrders,
  getMarketplaceUrl,
  canPurchase,
} from "@/lib/rarible-orders";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [dominantColor, setDominantColor] = useState<string>("");

  const imageRef = useRef<HTMLImageElement>(null);
  const { authenticated, user } = usePrivy();

  // Function to extract dominant color from image
  const extractDominantColor = () => {
    if (imageRef.current && imageLoaded && imageRef.current.complete) {
      try {
        const colorThief = new ColorThief();
        // Use quality parameter for better performance (sample every 10th pixel)
        const color = colorThief.getColor(imageRef.current, 10);

        // Make colors brighter by increasing saturation and reducing transparency
        const [r, g, b] = color;
        const enhancedR = Math.min(255, Math.round(r * 1.1)); // Boost by 10%
        const enhancedG = Math.min(255, Math.round(g * 1.1));
        const enhancedB = Math.min(255, Math.round(b * 1.1));

        const rgbColor = `rgb(${enhancedR}, ${enhancedG}, ${enhancedB})`;
        const rgbaColor = `rgba(${enhancedR}, ${enhancedG}, ${enhancedB}, 0.25)`; // Increased opacity from 0.15 to 0.25
        setDominantColor(rgbaColor);
        console.log(
          "🎨 Extracted dominant color:",
          rgbColor,
          "from image:",
          imageRef.current.src
        );
      } catch (error) {
        console.error("Failed to extract color:", error);
        console.error("This might be due to CORS issues with external images");

        // Check if it's a CORS error
        if (error instanceof Error && error.message.includes("tainted")) {
          console.error(
            "Canvas tainted by cross-origin data. Image needs proper CORS headers."
          );
        }

        setDominantColor("rgba(30, 30, 30, 0.15)"); // Fallback color
      }
    } else {
      console.warn("Image not ready for color extraction:", {
        hasRef: !!imageRef.current,
        imageLoaded,
        complete: imageRef.current?.complete,
      });
    }
  };

  // Debug NFT data being passed to component
  useEffect(() => {
    console.log("🎴 NFTPreview received data:", {
      id: nft.id,
      name: nft.name,
      description: nft.description,
      image: nft.image ? nft.image.substring(0, 100) + "..." : "none",
      collection: nft.collection,
      hasTraits: !!nft.traits,
      traitCount: nft.traits?.length || 0,
    });
  }, [nft]);

  // Trigger color extraction when image is loaded
  useEffect(() => {
    if (imageLoaded && imageRef.current && imageRef.current.complete) {
      console.log("🎨 Attempting color extraction via useEffect");
      extractDominantColor();
    }
  }, [imageLoaded]);

  const handleImageLoad = () => {
    console.log("✅ Image loaded successfully:", {
      nftId: nft.id,
      originalUrl: nft.image?.substring(0, 50) + "...",
      processedUrl: getImageUrl(nft.image)?.substring(0, 50) + "...",
      timestamp: new Date().toISOString(),
    });
    setImageLoaded(true);
    setImageError(false);

    // Extract dominant color after image loads
    // According to Color Thief docs, we need to ensure image is complete
    if (imageRef.current && imageRef.current.complete) {
      extractDominantColor();
    } else {
      // If for some reason it's not complete, try again after a short delay
      setTimeout(() => {
        extractDominantColor();
      }, 100);
    }
  };

  const handleImageError = (event: any) => {
    const imageUrl = getImageUrl(nft.image);

    console.error("💥 Image failed to load:", {
      nftId: nft.id,
      originalUrl: nft.image,
      processedUrl: imageUrl,
      imageType: nft.image?.includes("googleusercontent.com")
        ? "Google Cloud"
        : nft.image?.startsWith("data:")
        ? "Data URI"
        : nft.image?.startsWith("http")
        ? "HTTP URL"
        : nft.image?.startsWith("ipfs://")
        ? "IPFS Protocol"
        : nft.image?.includes("/ipfs/")
        ? "IPFS Gateway"
        : "Unknown",
      timestamp: new Date().toISOString(),
      errorEvent: event?.type || "unknown",
      errorTarget: event?.target?.src || "unknown",
      nextConfigCheck: imageUrl?.includes("googleusercontent.com")
        ? "Google Cloud - should be allowed in next.config.ts"
        : imageUrl?.includes("ipfs.raribleuserdata.com")
        ? "Rarible IPFS - should be allowed in next.config.ts"
        : "Check if domain is in next.config.ts remotePatterns",
    });

    setImageLoaded(false);
    setImageError(true);
  };

  // Reset image state when NFT image URL changes
  useEffect(() => {
    console.log("🔄 Image URL changed, resetting state:", {
      nftId: nft.id,
      hasImage: !!nft.image,
      originalUrl: nft.image?.substring(0, 100) + "...",
      processedUrl: getImageUrl(nft.image)?.substring(0, 100) + "...",
    });

    setImageLoaded(false);
    setImageError(false);

    if (!nft.image) {
      console.log("❌ No image URL provided");
      setImageError(true);
    }
  }, [nft.image]); // Simplified dependencies

  const handleCopyId = () => {
    navigator.clipboard.writeText(nft.id);
    toast.success("NFT ID copied to clipboard");
  };

  const handleBuy = async () => {
    if (!nft.price) {
      toast.info("This NFT is not for sale");
      return;
    }

    // Check if user is connected
    if (!authenticated) {
      toast.error("Please connect your wallet to purchase NFTs", {
        description: "Click the wallet button in the top right to connect",
      });
      return;
    }

    const walletAddress = user?.wallet?.address;
    if (!canPurchase(walletAddress)) {
      toast.error("Wallet connection required for purchases");
      return;
    }

    setIsProcessingPurchase(true);

    try {
      // Since Rarible API has 403 restrictions, provide enhanced marketplace experience
      console.log("🛒 Processing purchase for:", nft.id);

      toast.loading("Preparing purchase...", { id: "purchase-prep" });

      // Simulate order checking (since API is restricted)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Determine best marketplace based on NFT data
      let targetPlatform = "Rarible";
      let marketplaceUrl = getMarketplaceUrl(nft.id, "rarible");

      // Use marketplace info if available
      if (nft.marketplace?.name && nft.marketplace?.url) {
        targetPlatform = nft.marketplace.name;
        marketplaceUrl = nft.marketplace.url;
      }

      // Show purchase preparation success
      toast.success(`Ready to purchase on ${targetPlatform}!`, {
        id: "purchase-prep",
        description: `Price: ${nft.price.amount} ${
          nft.price.currency
        } • Connected: ${user?.wallet?.address?.slice(0, 6)}...`,
      });

      // Open marketplace with slight delay for better UX
      setTimeout(() => {
        window.open(marketplaceUrl, "_blank");
        toast.info(`Opening ${targetPlatform} to complete your purchase`, {
          description: "Complete the transaction in the marketplace",
        });
      }, 1200);
    } catch (error) {
      console.error("💥 Error in purchase process:", error);
      toast.error("Purchase preparation failed", {
        id: "purchase-prep",
        description: "Opening marketplace directly",
      });

      // Fallback to marketplace URL
      const marketplaceUrl = nft.marketplace?.url || getMarketplaceUrl(nft.id);
      window.open(marketplaceUrl, "_blank");
    } finally {
      setIsProcessingPurchase(false);
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

    // If it's already a Rarible IPFS gateway URL, use it directly
    if (url.includes("ipfs.raribleuserdata.com")) {
      console.log("✅ Already Rarible gateway URL");
      return url;
    }

    // Convert IPFS URLs to Rarible gateway
    if (url.startsWith("ipfs://")) {
      const hash = url.replace("ipfs://", "");
      const raribleUrl = `https://ipfs.raribleuserdata.com/ipfs/${hash}`;
      console.log("🔄 Converting ipfs:// to Rarible gateway:", {
        original: url,
        hash: hash,
        converted: raribleUrl,
        hashLength: hash.length,
      });
      return raribleUrl;
    }

    // Extract hash from other IPFS patterns and use Rarible gateway
    if (url.includes("/ipfs/")) {
      const parts = url.split("/ipfs/");
      const hashAndPath = parts[1].split(/[?#\)\]\}]/)[0]; // Remove query params, anchors, and closing punctuation
      const raribleUrl = `https://ipfs.raribleuserdata.com/ipfs/${hashAndPath}`;
      console.log("🔄 Converting IPFS gateway URL:", {
        original: url,
        extractedPart: parts[1],
        cleanHashAndPath: hashAndPath,
        converted: raribleUrl,
      });
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

    // Handle standard HTTP/HTTPS URLs (only if not IPFS-related)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // Check if it's an IPFS gateway we missed
      if (url.includes("/ipfs/")) {
        console.log("🔄 Found IPFS gateway in HTTP URL, converting to Rarible");
        const parts = url.split("/ipfs/");
        const hashAndPath = parts[1].split(/[?#\)\]\}]/)[0];
        const raribleUrl = `https://ipfs.raribleuserdata.com/ipfs/${hashAndPath}`;
        console.log("🔄 Converting HTTP IPFS gateway:", {
          original: url,
          extractedPart: parts[1],
          cleanHashAndPath: hashAndPath,
          converted: raribleUrl,
        });
        return raribleUrl;
      }
      console.log("✅ HTTP/HTTPS URL detected (non-IPFS)");
      return url;
    }

    // For unknown URLs, use as-is
    console.log("ℹ️ Unknown URL format, using as-is");
    return url;
  };

  const imageUrl = getImageUrl(nft.image);

  // Debug image processing with enhanced IPFS debugging
  console.log("🔍 NFT image processing:", {
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
    urlsMatch: nft.image === imageUrl,
    isRaribleGateway: imageUrl?.includes("ipfs.raribleuserdata.com"),
    nextJsAllowed:
      imageUrl?.includes("ipfs.raribleuserdata.com") ||
      imageUrl?.includes("googleusercontent.com"),
  });

  // Test IPFS gateway accessibility for debugging
  if (imageUrl?.includes("ipfs.raribleuserdata.com")) {
    console.log("🧪 Testing IPFS gateway URL:", imageUrl);
  }

  return (
    <Card
      className={`w-full max-w-sm mx-auto overflow-hidden transition-all duration-500 ${className}`}
      style={{
        backgroundColor: dominantColor || "transparent",
        border: dominantColor ? "1px solid rgba(255,255,255,0.1)" : undefined,
      }}
    >
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
          {/* Always try to render image if URL exists */}
          {imageUrl && (
            <>
              <img
                ref={imageRef}
                src={imageUrl}
                alt={nft.name || "NFT"}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous" // Required for ColorThief to work with external images
                onLoadStart={() =>
                  console.log(
                    "🔄 Image load started for:",
                    imageUrl?.substring(0, 50)
                  )
                }
              />
            </>
          )}

          {/* Show blinking skeleton when not loaded or on error */}
          {(!imageLoaded || (imageError && !imageUrl)) && (
            <div className="absolute inset-0 w-full h-full bg-white/10 animate-pulse rounded-lg" />
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
                <div className="font-semibold text-white">
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
                  key={`${trait.type}-${trait.value}-${index}`}
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
      </CardContent>

      <CardFooter className="pt-2">
        <div className="flex flex-col w-full gap-2">
          {/* Show Buy button only if item is for sale */}
          {nft.price && (
            <Button
              onClick={handleBuy}
              size="sm"
              className="w-full cursor-pointer"
              disabled={isProcessingPurchase}
              variant="default"
            >
              {isProcessingPurchase ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy for {nft.price.amount} {nft.price.currency}
                </>
              )}
            </Button>
          )}

          {/* View on Rarible button - always show */}
          <Button
            onClick={() => {
              const raribleUrl = getMarketplaceUrl(nft.id, "rarible");
              window.open(raribleUrl, "_blank");
            }}
            size="sm"
            variant="secondary"
            className="w-full cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Rarible
          </Button>
        </div>
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
      description: undefined, // Removed descriptions to keep cards clean
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
