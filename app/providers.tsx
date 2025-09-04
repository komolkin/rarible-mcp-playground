"use client";

import { ReactNode, useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { MCPProvider } from "@/lib/context/mcp-context";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
    STORAGE_KEYS.SIDEBAR_STATE,
    true
  );

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          showWalletLoginFirst: false, // Prioritize email login
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
          noPromptOnSignature: true,
        },
        // Minimize external wallet conflicts
        externalWallets: {
          // Only enable specific wallets to reduce conflicts
          coinbaseWallet: {
            connectionOptions: "smartWalletOnly",
          },
          metamask: {
            connectionOptions: "injected",
          },
          // Disable other wallets that might cause conflicts
          walletConnect: {
            enabled: false,
          },
        },
        // Prioritize non-extension login methods
        loginMethods: ["email", "sms", "wallet"],
        // Enhanced error handling
        mfa: {
          noPromptOnMfaRequired: false,
        },
        // Disable WalletConnect to reduce extension interactions
        walletConnectCloudProjectId: undefined,
        // Add supported chains - Ethereum and Base
        supportedChains: [
          // Ethereum Mainnet
          {
            id: 1,
            name: "Ethereum",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://ethereum.publicnode.com"] },
              public: { http: ["https://ethereum.publicnode.com"] },
            },
            blockExplorers: {
              default: { name: "Etherscan", url: "https://etherscan.io" },
            },
          },
          // Base Mainnet
          {
            id: 8453,
            name: "Base",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://mainnet.base.org"] },
              public: { http: ["https://mainnet.base.org"] },
            },
            blockExplorers: {
              default: { name: "BaseScan", url: "https://basescan.org" },
            },
          },
          // Base Sepolia Testnet (for testing)
          {
            id: 84532,
            name: "Base Sepolia",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://sepolia.base.org"] },
              public: { http: ["https://sepolia.base.org"] },
            },
            blockExplorers: {
              default: {
                name: "BaseScan",
                url: "https://sepolia.basescan.org",
              },
            },
            testnet: true,
          },
        ],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          themes={["dark"]}
          forcedTheme="dark"
        >
          <MCPProvider>
            <SidebarProvider
              defaultOpen={sidebarOpen}
              open={sidebarOpen}
              onOpenChange={setSidebarOpen}
            >
              {children}
              <Toaster position="top-center" richColors />
            </SidebarProvider>
          </MCPProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
