"use client";

import Chat from "@/components/chat";
import { Canvas } from "@/components/canvas";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useUserId } from "@/lib/hooks/use-wallet-user";

export default function ChatPage() {
  const params = useParams();
  const chatId = params?.id as string;
  const queryClient = useQueryClient();
  const userId = useUserId();

  // Prefetch chat data
  useEffect(() => {
    async function prefetchChat() {
      if (!chatId || !userId) return;

      // Check if data already exists in cache
      const existingData = queryClient.getQueryData(["chat", chatId, userId]);
      if (existingData) return;

      // Prefetch the data
      await queryClient.prefetchQuery({
        queryKey: ["chat", chatId, userId] as const,
        queryFn: async () => {
          const response = await fetch(`/api/chats/${chatId}`, {
            headers: {
              "x-user-id": userId,
            },
          });

          if (!response.ok) {
            // For 404, return empty chat data instead of throwing
            if (response.status === 404) {
              return {
                id: chatId,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }
            throw new Error("Failed to load chat");
          }

          return response.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    }

    prefetchChat();
  }, [chatId, userId, queryClient]);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 min-w-0">
        <Chat />
      </div>
      <div className="w-[480px] border-l bg-muted/50">
        <Canvas />
      </div>
    </div>
  );
}
