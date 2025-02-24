"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import BountyTxFunction from "@/contracts";

// 定义表单验证模式
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Task name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  deadline: z.date({
    required_error: "Please select a deadline.",
  }),
  maxCompletions: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Max completions must be a positive number.",
  }),
  rewardAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Reward amount must be a positive number.",
  }),
  allowSelfReview: z.boolean().default(false),
})

export default function CreateTask({ params }: { params: { boardId: string } }) {
  const router = useRouter()
  const { createTask } = BountyTxFunction();
  
  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      maxCompletions: "1",
      rewardAmount: "",
      allowSelfReview: false,
    },
  })

  // 表单提交处理
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const deadlineTimestamp = values.deadline.getTime() * 1000;
      await createTask(
        params.boardId,
        values.name,
        values.description,
        deadlineTimestamp,
        Number(values.maxCompletions),
        Math.floor(Number(values.rewardAmount) * 1e8),
        "test_config",
        values.allowSelfReview
      )


      router.push(`/board/${params.boardId}`)
    } catch (error) {
      console.error("Failed to create task:", error)
      form.setError("root", {
        message: "Failed to create task. Please try again.",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fadeIn">
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[var(--h2o-accent)]">Create New Task</CardTitle>
          <CardDescription>Create a new task for your board members</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">Task Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter task name" 
                        {...field}
                        className="focus-visible:ring-[var(--h2o-primary)]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--h2o-accent)]">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        className="min-h-[120px] focus-visible:ring-[var(--h2o-primary)]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[var(--h2o-accent)]">Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="maxCompletions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--h2o-accent)]">Max Completions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter max completions"
                          className="focus-visible:ring-[var(--h2o-primary)]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of times this task can be completed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rewardAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--h2o-accent)]">Reward Amount (MOVE)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter reward amount"
                          className="focus-visible:ring-[var(--h2o-primary)]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="allowSelfReview"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[var(--h2o-primary)] data-[state=checked]:border-[var(--h2o-primary)]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow Self Review</FormLabel>
                      <FormDescription>
                        Allow task submitters to review their own submissions
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <div className="flex justify-end space-x-4">
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
                  {form.formState.isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 