import { nanoid } from "nanoid";

const USER_ID_KEY = "ai-chat-user-id";
const WALLET_USER_ID_KEY = "ai-chat-wallet-user-id";

export function getUserId(): string {
  // Only run this on the client side
  if (typeof window === "undefined") return "";

  // First check if we have a wallet-based user ID
  let walletUserId = localStorage.getItem(WALLET_USER_ID_KEY);
  if (walletUserId) {
    return walletUserId;
  }

  // Fall back to anonymous user ID
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    // Generate a new user ID and store it
    userId = nanoid();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

export function updateUserId(newUserId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_ID_KEY, newUserId);
}

/**
 * Set user ID based on wallet address
 * This creates a deterministic user ID from the wallet address
 */
export function setWalletUserId(walletAddress: string): void {
  if (typeof window === "undefined") return;

  // Use wallet address as user ID (normalized to lowercase)
  const walletUserId = walletAddress.toLowerCase();
  localStorage.setItem(WALLET_USER_ID_KEY, walletUserId);

  // Also update the regular user ID for consistency
  localStorage.setItem(USER_ID_KEY, walletUserId);
}

/**
 * Clear wallet-based user ID and return to anonymous user ID
 */
export function clearWalletUserId(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(WALLET_USER_ID_KEY);

  // Generate new anonymous user ID
  const anonymousUserId = nanoid();
  localStorage.setItem(USER_ID_KEY, anonymousUserId);
}

/**
 * Get the current user ID type and value
 */
export function getUserIdInfo(): {
  type: "wallet" | "anonymous";
  userId: string;
} {
  if (typeof window === "undefined") return { type: "anonymous", userId: "" };

  const walletUserId = localStorage.getItem(WALLET_USER_ID_KEY);
  if (walletUserId) {
    return { type: "wallet", userId: walletUserId };
  }

  return { type: "anonymous", userId: getUserId() };
}
