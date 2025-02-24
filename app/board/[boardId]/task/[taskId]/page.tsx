"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Task, Submission } from "@/type"
import { AccountAddress } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import BountyTxFunction from "@/contracts"

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-[250px]" />
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TaskDetails({ 
  params
}: { 
  params: { boardId: string, taskId: string }
}) {
  const [task, setTask] = useState<Task | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submissionProof, setSubmissionProof] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { getTaskInfo, getSubmissionInfo, submit_task_proof } = BountyTxFunction();
  const { account } = useWallet();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const taskData = await getTaskInfo(params.boardId, params.taskId)
        setTask(taskData)
        
        // Try to get the current submission
        try {
          const submissionData = await getSubmissionInfo(params.boardId, params.taskId, account?.address.toString() as string)
          console.log("submissionData", submissionData)
          if (submissionData) {
            setSubmissions([submissionData])
          }
        } catch (error) {
          // If no submission exists, this will throw an error - which is fine
          console.log("No submission found for current user")
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error)
        setError("Failed to load task details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchTaskDetails()
  }, [params.boardId, params.taskId, account?.address])

  const handleSubmitTask = async (proof: string) => {
    try {
      setIsSubmitting(true)
      setError(null)

      await submit_task_proof(params.boardId, params.taskId, proof)

      setSubmissionProof("")
      // Refresh task data
      const updatedData = await getTaskInfo(params.boardId, params.taskId)
      setTask(updatedData)
    } catch (err) {
      console.error("Failed to submit task:", err)
      setError("Failed to submit task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <LoadingState />
  if (!task) return <div>Task not found</div>

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--h2o-accent)]">{task.name}</h1>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="hover-elevate hover:text-[var(--h2o-accent)] hover:border-[var(--h2o-primary)]"
        >
          Back to Board
        </Button>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-[var(--h2o-accent)]">{task.name}</CardTitle>
          <CardDescription>{task.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Badge 
              variant="outline"
              className="bg-[var(--h2o-softbg)] text-[var(--h2o-accent)] border-[var(--h2o-primary)]"
            >
              {task.completed ? "Completed" : "In Progress"}
            </Badge>
            <Badge 
              variant="outline"
              className="bg-[var(--h2o-softbg)] text-[var(--h2o-accent)] border-[var(--h2o-primary)]"
            >
              Reward: {Number(task.rewardAmount) / 1e8} MOVE
            </Badge>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--h2o-accent)]">Submit Solution</h3>
            <Textarea
              placeholder="Enter your submission proof (e.g., link to work, description of solution)"
              value={submissionProof}
              onChange={(e) => setSubmissionProof(e.target.value)}
              className="min-h-[100px] focus:border-[var(--h2o-primary)] focus:ring-[var(--h2o-primary)]"
            />
            <Button 
              className="button-primary click-scale"
              onClick={() => handleSubmitTask(submissionProof)}
              disabled={isSubmitting || !submissionProof}
            >
              {isSubmitting ? "Submitting..." : "Submit Task"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-[var(--h2o-accent)]">Submissions</CardTitle>
          <CardDescription>Review and manage task submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <Card key={submission.submitter} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="font-medium text-[var(--h2o-accent)]">
                          Submitted by: {`${submission.submitter.slice(0, 6)}...${submission.submitter.slice(-4)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Number(submission.submitted_at)).toLocaleString()}
                        </p>
                        <p className="mt-2">{submission.proof}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          className={
                            submission.status === "Approved"
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : submission.status === "Rejected"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-[var(--h2o-softbg)] text-[var(--h2o-accent)] border-[var(--h2o-primary)]"
                          }
                        >
                          {submission.status}
                        </Badge>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="hover-elevate hover:bg-[var(--h2o-softbg)] hover:text-[var(--h2o-accent)] hover:border-[var(--h2o-primary)]"
                          onClick={() => router.push(`/board/${params.boardId}/task/${params.taskId}/review?submitter=${submission.submitter}`)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                    {submission.review_comment && (
                      <div className="border-t border-[var(--h2o-secondary)] pt-3">
                        <p className="text-sm font-medium text-[var(--h2o-accent)]">Review Comment:</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {submission.review_comment}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No submissions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

