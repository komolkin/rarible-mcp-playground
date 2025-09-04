import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import {
  getUserId,
  setWalletUserId,
  clearWalletUserId,
  getUserIdInfo,
} from "@/lib/user-id";
import { useQueryClient } from "@tanstack/react-query";

export interface WalletUser {
  userId: string;
  type: "wallet" | "anonymous";
  walletAddress?: string;
  email?: string;
  isConnected: boolean;
}

/**
 * Hook that manages user ID based on Privy authentication state
 * Automatically switches between anonymous and wallet-based user IDs
 */
export function useWalletUser(): WalletUser {
  const { ready, authenticated, user } = usePrivy();
  const queryClient = useQueryClient();
  const [userState, setUserState] = useState<WalletUser>({
    userId: "",
    type: "anonymous",
    isConnected: false,
  });

  useEffect(() => {
    if (!ready) return;

    const updateUserState = () => {
      if (authenticated && user) {
        // User is authenticated with Privy
        const walletAddress = user.wallet?.address;
        const email = user.email?.address;

        if (walletAddress) {
          // Set wallet-based user ID
          setWalletUserId(walletAddress);

          setUserState({
            userId: walletAddress.toLowerCase(),
            type: "wallet",
            walletAddress,
            email,
            isConnected: true,
          });
        } else if (email) {
          // For email-only users, use email as identifier
          setWalletUserId(email);

          setUserState({
            userId: email.toLowerCase(),
            type: "wallet", // Still considered authenticated
            email,
            isConnected: true,
          });
        }
      } else {
        // User is not authenticated, use anonymous ID
        clearWalletUserId();
        const { userId, type } = getUserIdInfo();

        setUserState({
          userId,
          type,
          isConnected: false,
        });
      }
    };

    updateUserState();
  }, [ready, authenticated, user]);

  // Invalidate queries when user changes
  useEffect(() => {
    if (userState.userId) {
      // Invalidate all chat-related queries when user changes
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    }
  }, [userState.userId, queryClient]);

  return userState;
}

/**
 * Hook that provides the current user ID (compatible with existing code)
 */
export function useUserId(): string {
  const walletUser = useWalletUser();
  return walletUser.userId;
}
