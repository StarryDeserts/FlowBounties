"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import BountyTxFunction from "@/contracts"
import { Board, Task } from "@/type"

function LoadingState() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <Skeleton className="h-8 w-[250px]" />
      <Card className="hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-[200px] w-[200px] rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BoardDetails({ params }: { params: { boardId: string } }) {
  const [board, setBoard] = useState<Board | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { getBoardInfo, getTaskInfo, joinBoard } = BountyTxFunction();

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        const boardData = await getBoardInfo(params.boardId)
        setBoard(boardData)
        
        // Fetch tasks using task_ids from board
        const taskPromises = boardData.task_ids.map(taskId => 
          getTaskInfo(params.boardId, taskId)
        )
        
        const taskDetails = await Promise.all(taskPromises)
        setTasks(taskDetails)
      } catch (error) {
        console.error("Failed to fetch board details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBoardDetails()
  }, [params.boardId])

  const handleJoinBoard = async () => {
    try {
      await joinBoard(params.boardId)
      console.log("Successfully joined board")
    } catch (error) {
      console.error("Failed to join board:", error)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (!board) {
    return <div className="text-center text-[var(--h2o-accent)]">Board not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--h2o-accent)]">{board.name}</h1>
        <Button 
          onClick={handleJoinBoard}
          className="bg-[var(--h2o-primary)] hover:bg-[var(--h2o-accent)] click-scale"
        >
          Join Board
        </Button>
      </div>

      <Card className="hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {board.img_url && (
              <img
                src={board.img_url}
                alt={board.name}
                className="w-48 h-48 object-cover rounded-lg shadow-md"
              />
            )}
            <div className="space-y-4 flex-1">
              <p className="text-muted-foreground">{board.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <Badge 
                  className={`text-sm px-3 py-1 ${
                    board.closed 
                      ? "bg-red-100 text-red-800 border-red-200" 
                      : "bg-green-100 text-green-800 border-green-200"
                  }`}
                >
                  {board.closed ? "Closed" : "Active"}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-sm px-3 py-1 border-[var(--h2o-primary)] text-[var(--h2o-accent)]"
                >
                  🗓️ {new Date(Number(board.created_at)).toLocaleDateString()}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-sm px-3 py-1 border-[var(--h2o-primary)] text-[var(--h2o-accent)]"
                >
                  💰 {Number(board.total_pledged) / 1e8} MOVE
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-sm px-3 py-1 border-[var(--h2o-primary)] text-[var(--h2o-accent)]"
                >
                  👥 {board.members.length} Members
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[var(--h2o-accent)]">Tasks</h2>
          <Button 
            onClick={() => router.push(`/board/${params.boardId}/create-task`)}
            className="bg-[var(--h2o-primary)] hover:bg-[var(--h2o-accent)] click-scale"
          >
            Create Task
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card 
              key={task.task_id} 
              className="hover-elevate group transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-[var(--h2o-accent)] group-hover:text-[var(--h2o-primary)]">
                  {task.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge 
                    variant={task.completed ? "default" : "outline"}
                    className="bg-[var(--h2o-secondary)] text-[var(--h2o-accent)]"
                  >
                    {task.completed ? "Completed" : "In Progress"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Reward: {Number(task.rewardAmount) / 1e8} MOVE
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/board/${params.boardId}/task/${task.task_id}`)}
                  className="w-full click-scale hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)]"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

