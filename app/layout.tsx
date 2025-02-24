import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Inter as FontSans } from "next/font/google";
import { PropsWithChildren } from "react";
import Navbar from "./components/Navbar"
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster"


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "H2O Bounty",
  description: "A decentralized task management and bounty system",
  icons: {
    icon: [
      {
        url: "/icon.png",
        href: "/icon.png",
      }
    ],
    // 为了更好的兼容性，也可以添加其他尺寸
    apple: [
      {
        url: "/icon.png",
        sizes: "180x180",
        type: "image/png",
      }
    ],
  },
}

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex justify-center min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <WalletProvider>
              <div className="min-h-screen">
                <Navbar />
                <main className="container mx-auto px-4 py-8 animate-fadeIn">
                  {children}
                </main>
              </div>
              <Toaster />
            </WalletProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;

