"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, AlertTriangle } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PrivyConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
      await login();
    } catch (error) {
      // Let Privy handle any errors
      console.log("Login error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Don't render anything until Privy is ready
  if (!ready) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="bg-background/80 backdrop-blur-md border-border"
      >
        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </Button>
    );
  }

  // If not authenticated, show connect button
  if (!authenticated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleLogin}
              disabled={isConnecting}
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-md border-border hover:bg-muted/50 text-foreground hover:text-foreground transition-colors"
            >
              {isConnecting ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connect with email or wallet</p>
            <p className="text-xs text-muted-foreground">
              Email login recommended for best experience
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If authenticated, show wallet address only
  const walletAddress = user?.wallet?.address;
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : user?.email?.address || "Connected";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-md border-border hover:bg-muted/50 text-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span className="max-w-[120px] truncate">{shortAddress}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {walletAddress ? "Wallet Connected" : "Connected"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {walletAddress || user?.email?.address || "Unknown"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
