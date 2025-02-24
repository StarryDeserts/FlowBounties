"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BountyTxFunction from "@/contracts";
import { Layout, Coins, Image as ImageIcon, Users } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Board name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  imageUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for the board image.",
    })
    .optional(),
  rewardTokenAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Reward amount must be a positive number.",
    }),
});

export default function CreateBoard() {
  const router = useRouter();
  const { createBoard } = BountyTxFunction();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      rewardTokenAmount: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError(null);
      await createBoard(
        values.name,
        values.description,
        values.imageUrl || "",
        Math.floor(Number(values.rewardTokenAmount) * 1e8)
      );

      router.push("/");
    } catch (err) {
      console.error("Failed to create board:", err);
      setError("Failed to create board. Please try again.");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fadeIn">
      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Layout className="w-6 h-6 text-[var(--h2o-accent)]" />
            <CardTitle className="text-2xl font-bold text-[var(--h2o-accent)]">
              Create New Board
            </CardTitle>
          </div>
          <CardDescription>
            Create a new board to manage your tasks and collaborate with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">
                      Board Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter board name"
                          className="pl-10 focus-visible:ring-[var(--h2o-primary)]"
                          {...field}
                        />
                        <Layout className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose a unique and descriptive name for your board
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">
                      Description
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Describe the purpose of your board"
                          className="min-h-[120px] pl-10 focus-visible:ring-[var(--h2o-primary)]"
                          {...field}
                        />
                        <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Provide details about the board's purpose and goals
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">
                      Board Image URL (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter image URL"
                          className="pl-10 focus-visible:ring-[var(--h2o-primary)]"
                          {...field}
                        />
                        <ImageIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Add a cover image URL for your board
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rewardTokenAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">
                      Reward Amount (MOVE)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="0.000000001"
                          placeholder="Enter reward amount"
                          className="pl-10 focus-visible:ring-[var(--h2o-primary)]"
                          {...field}
                        />
                        <Coins className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)] click-scale"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-[var(--h2o-primary)] hover:bg-[var(--h2o-accent)] click-scale"
                >
                  {form.formState.isSubmitting ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
