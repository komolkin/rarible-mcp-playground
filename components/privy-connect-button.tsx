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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      <Button variant="outline" size="sm" disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
              className="bg-background border-border hover:bg-accent hover:text-accent-foreground"
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

  // If authenticated, show user dropdown
  const displayName =
    user?.email?.address || user?.wallet?.address || "Unknown";
  const shortAddress =
    displayName.length > 20
      ? `${displayName.slice(0, 6)}...${displayName.slice(-4)}`
      : displayName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-background border-border hover:bg-accent hover:text-accent-foreground"
        >
          <Avatar className="h-5 w-5 mr-2">
            <AvatarFallback className="text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[120px] truncate">{shortAddress}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Connected</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayName}
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
