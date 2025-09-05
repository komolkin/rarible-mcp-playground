"use client";

import { NFTGrid, type NFTData } from "./nft-preview";
import { useEffect } from "react";
import { create } from "zustand";

// Canvas store to manage NFT data globally
interface CanvasStore {
  nfts: NFTData[];
  setNFTs: (nfts: NFTData[]) => void;
  clearNFTs: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  nfts: [],
  setNFTs: (nfts) => {
    console.log(
      "🎯 Canvas store setting NFTs:",
      nfts.map((nft) => ({
        id: nft.id,
        name: nft.name,
        description: nft.description,
        image: nft.image ? "✅ Present" : "❌ Missing",
        collection: nft.collection?.name,
        traits: nft.traits?.length || 0,
      }))
    );
    set({ nfts });
  },
  clearNFTs: () => set({ nfts: [] }),
}));

export function Canvas() {
  const { nfts } = useCanvasStore();

  // Clear NFTs when navigating away
  useEffect(() => {
    return () => {
      useCanvasStore.getState().clearNFTs();
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-background">
        <div className="text-sm font-medium">Canvas</div>
        <div className="text-xs text-muted-foreground">
          {nfts.length === 0
            ? ""
            : `${nfts.length} item${nfts.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {nfts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground p-4">
            <div className="text-center">
              <p>Nothing to display</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <NFTGrid nfts={nfts} />
          </div>
        )}
      </div>
    </div>
  );
}
