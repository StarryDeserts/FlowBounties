"use client";

import { useEffect, useState } from "react";
import { Profile, Board } from "@/type";
import { useRouter } from "next/navigation";
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import BountyTxFunction from "@/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Mail, User, FileText, Wallet, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function ProfileSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Profile Info Skeleton */}
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Created Boards Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, j) => (
            <Card key={`created-${j}`}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Joined Boards Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, j) => (
            <Card key={`joined-${j}`}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { account, connected } = useWallet();
  const { getUserProfileInfo, getUserCreateBoardsInfo, getUserJoinBoardsInfo } = BountyTxFunction();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [createdBoards, setCreatedBoards] = useState<Board[]>([]);
  const [joinedBoards, setJoinedBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!connected) {
        toast({
          variant: "destructive",
          title: "Wallet not connected",
          description: "Please connect your wallet to view your profile",
        });
        router.push("/");
        return;
      }

      try {
        const profileData = await getUserProfileInfo(account!.address.toString());
        console.log("profileData", profileData);
        setProfile(profileData);
        

        const createdBoardsData = await getUserCreateBoardsInfo(profileData.user_address);
        console.log("createdBoardData", createdBoardsData);
        setCreatedBoards(createdBoardsData);

        // Fetch joined boards
        const joinedBoardsData = await getUserJoinBoardsInfo(profileData.user_address);
        console.log("joinedBoardsData", joinedBoardsData);
        setJoinedBoards(joinedBoardsData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [account, router, toast]);

  if (!account) {
    return null;
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <p className="text-gray-600 mb-6">You haven&apos;t created a profile yet.</p>
        <Button onClick={() => router.push("/create-profile")}>
          Create Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[var(--h2o-accent)] mb-8">Profile</h1>

      {/* Profile Info Card */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--h2o-accent)]">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base">Username</Label>
              <p className="text-lg text-[var(--h2o-primary)]">{profile.username}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base">Email</Label>
              <p className="text-lg text-[var(--h2o-primary)]">{profile.email}</p>
            </div>
          </div>
          
          <Separator />

          <div className="flex items-center space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base">Bio</Label>
              <p className="text-lg text-[var(--h2o-primary)]">{profile.bio}</p>
            </div>
          </div>
          
          <Separator />

          <div className="flex items-center space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base">Wallet Address</Label>
              <p className="text-lg font-mono text-[var(--h2o-primary)]">{profile.user_address}</p>
            </div>
          </div>
          
          <Separator />

          <div className="flex items-center space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base">Joined</Label>
              <p className="text-lg text-[var(--h2o-primary)]">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Created Boards Section */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--h2o-accent)]">
            <FileText className="w-5 h-5 mr-2" />
            Created Boards
          </CardTitle>
          <CardDescription>
            Boards you have created and manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {createdBoards.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-4">No boards created yet</p>
            ) : (
              createdBoards.map((board) => (
                <Card key={board.name} className="hover-elevate group transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[var(--h2o-accent)] group-hover:text-[var(--h2o-primary)]">
                      {board.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {board.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      onClick={() => router.push(`/board/${profile.created_boards[0]}`)}
                      variant="outline"
                      className="w-full click-scale hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)]"
                    >
                      View Board
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Joined Boards Section */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--h2o-accent)]">
            <Users className="w-5 h-5 mr-2" />
            Joined Boards
          </CardTitle>
          <CardDescription>
            Boards you have joined as a contributor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedBoards.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-4">No boards joined yet</p>
            ) : (
              joinedBoards.map((board) => (
                <Card key={profile.join_boards[1]} className="hover-elevate group transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[var(--h2o-accent)] group-hover:text-[var(--h2o-primary)]">
                      {board.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {board.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      onClick={() => router.push(`/board/${profile.join_boards[0]}`)}
                      variant="outline"
                      className="w-full click-scale hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)]"
                    >
                      View Board
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}