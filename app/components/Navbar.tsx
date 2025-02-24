"use client"

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, User, Settings, LogOut } from "lucide-react"
import { WalletSelector } from "@/components/wallet/WalletSelector"
import { truncateAddress } from "@aptos-labs/wallet-adapter-react"

export default function Navbar() {
  const router = useRouter()
  const { account, connected, disconnect } = useWallet();

  // 获取地址的前两个字符用于头像
  const getAvatarText = () => {
    if (!account?.address) return "";
    const truncated = truncateAddress(account?.address?.toString());
    return truncated.slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-1">
            <Image
              src="/icon.png"
              alt="H2O Bounty Logo"
              width={40}
              height={40}
              className="click-scale"
            />
            <Button
              variant="ghost"
              className="text-xl font-bold text-[var(--h2o-accent)] hover:text-[var(--h2o-primary)] hover:bg-transparent click-scale"
              onClick={() => router.push("/")}
            >
              H2O Bounty
            </Button>
          </div>

          <Button
            variant="ghost"
            className="hidden md:flex items-center space-x-2 hover:bg-[var(--h2o-softbg)] hover:text-[var(--h2o-accent)] click-scale"
            onClick={() => router.push("/create-board")}
          >
            <Plus className="h-4 w-4" />
            <span>Create Board</span>
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          {!connected ? (
            <WalletSelector />
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden md:flex items-center space-x-2 hover:bg-[var(--h2o-softbg)] hover:text-[var(--h2o-accent)] click-scale"
                onClick={() => router.push("/create-profile")}
              >
                <Plus className="h-4 w-4" />
                <span>Create Profile</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-[var(--h2o-softbg)] click-scale"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt={account?.address?.toString()} />
                      <AvatarFallback className="bg-[var(--h2o-primary)] text-white">
                        {getAvatarText()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  sideOffset={5}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Account</p>
                      <p className="text-xs text-muted-foreground">
                        {account?.address ? truncateAddress(account.address.toString()) : ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[var(--h2o-softbg)] hover:text-[var(--h2o-accent)]"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[var(--h2o-softbg)] hover:text-[var(--h2o-accent)]"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={disconnect}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

