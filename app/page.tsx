"use client";

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import Image from "next/image";
import { Bot, Shield, Rocket, Eye, Users, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

// Use Cases data
const USE_CASES = [
  {
    title: "Decentralized Task Management",
    image: "/task-management.jpg",
    description: "Create and manage bounty tasks through smart contracts, ensuring transparent and trustworthy task lifecycle management",
    features: [
      "Move language-based smart contracts for fund security",
      "Multi-signature task review process",
      "Automated reward distribution system"
    ],
    reverse: false
  },
  {
    title: "Community Collaboration",
    image: "/community.jpg",
    description: "Incentivize developer communities to participate in open-source projects and build sustainable contributor ecosystems",
    features: [
      "AI-assisted code review mechanism",
      "Contributor reputation scoring system",
      "Multi-chain compatible reward distribution"
    ],
    reverse: true
  },
  {
    title: "Learning Incentives",
    image: "/learning.jpg",
    description: "Create learning tasks and challenges to promote developer skill growth through token incentives",
    features: [
      "Verifiable learning achievement records",
      "Skill badge NFT system",
      "Personalized learning path recommendations"
    ],
    reverse: false
  }
];

// Features data
const FEATURES = [
  {
    title: "Quick Launch",
    description: "Deploy smart contract boards in minutes with visual configuration for task parameters and reward rules",
    icon: Rocket
  },
  {
    title: "AI Review",
    description: "Integrated AI models for automatic task verification with multi-reviewer collaboration support",
    icon: Bot
  },
  {
    title: "Multi-Chain Support",
    description: "Currently supporting Sui Mainnet and Testnet, with plans to expand to more high-performance blockchains",
    icon: Shield
  },
  {
    title: "Transparent Tracking",
    description: "All operations recorded on-chain with complete audit trail and verification capabilities",
    icon: Eye
  },
  {
    title: "Community Governance",
    description: "DAO voting mechanism for community fund management and task rule configuration",
    icon: Users
  },
  {
    title: "Mobile Ready",
    description: "Fully responsive design optimized for mobile devices, manage bounties anytime anywhere",
    icon: Plus
  }
];

function LandingPageInner() {
  const {connected} = useWallet();
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateBoard = () => {
    if (!connected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a board",
      });
      return;
    }
    router.push("/create-board");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--h2o-background)]">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full">
        <Image
          src="/header-bg.png"
          alt="FlowBounties  Platform"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-[var(--h2o-accent)] animate-fade-in">
            Decentralized Bounty Platform
          </h1>
          <p className="text-base md:text-xl text-[var(--h2o-primary)] max-w-3xl mb-6 md:mb-8 animate-fade-in-delay">
            Next-generation task collaboration platform on Sui blockchain, ensuring transparent and trustworthy task lifecycle management through smart contracts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/board" passHref>
              <Button 
                variant="default" 
                className="rounded-full px-8 py-6 text-lg bg-[var(--h2o-accent)] hover:bg-[var(--h2o-accent-dark)] transition-colors"
              >
                Explore Boards
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            </Link>

            <Button
              onClick={handleCreateBoard}
              variant="outline"
              className="rounded-full px-8 py-6 text-lg border-2 border-[var(--h2o-accent)] text-[var(--h2o-accent)] hover:bg-[var(--h2o-accent)]/10 transition-colors"
            >
              Create Board
              <svg
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--h2o-accent)] mb-8 md:mb-12">
            Core Use Cases
          </h2>
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {USE_CASES.map((useCase, index) => (
              <div key={index} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <div className={`flex flex-col ${useCase.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 md:gap-8 items-center`}>
                  <div className="w-full md:w-1/2">
                    <div className="relative aspect-square max-w-[200px] md:max-w-[270px] mx-auto">
                      <Image
                        src={useCase.image}
                        alt={useCase.title}
                        fill
                        className="rounded-xl object-cover border-2 border-gray-100"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-3 md:space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-[var(--h2o-accent)]">
                      {useCase.title}
                    </h3>
                    <div className="space-y-3 md:space-y-4 text-[var(--h2o-primary)]">
                      <p className="text-sm md:text-base">{useCase.description}</p>
                      <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base text-gray-700">
                        {useCase.features.map((feature, featureIndex) => (
                          <li key={featureIndex}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--h2o-accent)] mb-8 md:mb-12">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {FEATURES.map((feature, index) => (
            <div key={index} className="h2o-glass-card p-4 md:p-8 rounded-2xl">
              <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-[var(--h2o-primary)] to-[var(--h2o-accent)] rounded-2xl flex items-center justify-center">
                <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[var(--h2o-accent)]">
                {feature.title}
              </h2>
              <p className="text-sm md:text-base text-[var(--h2o-primary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-4 md:py-6 text-center text-xs md:text-sm text-[var(--h2o-primary)]">
        <p>© {new Date().getFullYear()} FlowBounties . All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingPageInner />
    </Suspense>
  );
} 