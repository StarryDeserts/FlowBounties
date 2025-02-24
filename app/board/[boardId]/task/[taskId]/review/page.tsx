"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BountyTxFunction from "@/contracts"
import { CheckCircle, XCircle, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"

const formSchema = z.object({
  status: z.enum(["Approved", "Rejected"], {
    required_error: "Please select a review status",
  }),
  comment: z.string().min(10, {
    message: "Review comment must be at least 10 characters",
  }),
})

export default function ReviewPage({
  params,
  searchParams,
}: {
  params: { boardId: string; taskId: string }
  searchParams: { submitter: string }
}) {
  const router = useRouter()
  const { review_submission } = BountyTxFunction();
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedComment, setSubmittedComment] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Rejected",
      comment: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const statusValue = values.status === "Rejected" ? 0 : 1
      setSubmittedComment(values.comment)

      await review_submission(
        params.boardId,
        params.taskId,
        searchParams.submitter,
        statusValue,
        values.comment,
      )

    //   signAndExecute({
    //     transaction: tx,
    //   },
    //   {
    //     onSuccess: async (tx) => {
    //       await suiClient.waitForTransaction({
    //         digest: tx.digest,
    //       })
    //       setShowSuccessModal(true)
    //     }
    //   }
    // );
    } catch (error) {
      console.error("Failed to submit review:", error)
      form.setError("root", {
        message: "Failed to submit review. Please try again.",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fadeIn">
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[var(--h2o-accent)]">
            Review Submission
          </CardTitle>
          <CardDescription>
            Review the submission for task completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">Review Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="focus:ring-[var(--h2o-primary)]">
                          <SelectValue placeholder="Select review status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Approved", "Rejected"].map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="flex items-center space-x-2"
                          >
                            <div className="flex items-center">
                              {getStatusIcon(status)}
                              <span className="ml-2">{status}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">Review Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your review comments and feedback"
                        className="min-h-[150px] resize-none focus-visible:ring-[var(--h2o-primary)]"
                        {...field}
                      />
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
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-[var(--h2o-accent)] mb-2">
                Success!
              </h3>
              <DialogDescription className="text-lg text-[var(--h2o-primary)]">
                Verification successful, rewards have been sent!
              </DialogDescription>
            </div>
          </DialogHeader>

          {submittedComment && (
            <div className="mt-4 p-4 bg-[var(--h2o-softbg)] rounded-lg">
              <p className="text-sm text-[var(--h2o-accent)]">AI Comment:</p>
              <p className="text-muted-foreground mt-1">Check Success</p>
            </div>
          )}

          <Button
            onClick={() => {
              setShowSuccessModal(false)
              router.push(`/board/${params.boardId}`)
            }}
            className="mt-6 w-full bg-[var(--h2o-primary)] hover:bg-[var(--h2o-accent)] click-scale"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}