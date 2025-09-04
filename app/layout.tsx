import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { ChatSidebar } from "@/components/chat-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { PrivyConnectButton } from "@/components/privy-connect-button";
import "@/lib/extension-error-handler"; // Initialize extension error handling

const geistMono = GeistMono;

export const metadata: Metadata = {
  metadataBase: new URL("https://mcpchat.scira.ai"),
  title: "rAIrible",
  description: "rAIrible is a minimalistic MCP client with a good feature set.",
  openGraph: {
    siteName: "rAIrible",
    url: "https://mcpchat.scira.ai",
    images: [
      {
        url: "https://mcpchat.scira.ai/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "rAIrible",
    description:
      "rAIrible is a minimalistic MCP client with a good feature set.",
    images: ["https://mcpchat.scira.ai/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Simple extension error suppression - just hide the noise
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('chrome.runtime.sendMessage')) {
                  e.preventDefault();
                  return false;
                }
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && e.reason.message.includes('chrome.runtime.sendMessage')) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body className={`${geistMono.className}`}>
        <Providers>
          <div className="flex h-dvh w-full">
            <ChatSidebar />
            <main className="flex-1 flex flex-col relative">
              <div className="absolute top-4 left-4 z-50">
                <SidebarTrigger>
                  <button className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors">
                    <Menu className="h-4 w-4" />
                  </button>
                </SidebarTrigger>
              </div>
              <div className="absolute top-4 right-4 z-50">
                <PrivyConnectButton />
              </div>
              <div className="flex-1 flex">{children}</div>
            </main>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
