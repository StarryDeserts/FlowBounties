"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import BountyTxFunction from "@/contracts";
import { EventBoardCreated} from "@/type"

function LoadingState() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="hover-elevate">
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default function Home() {
  const { getCreateBoardEvent } = BountyTxFunction();
  const [boards, setBoards] = useState<EventBoardCreated[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const boards = await getCreateBoardEvent()
        setBoards(boards)
      } catch (error) {
        console.error("Failed to fetch boards:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [])

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[var(--h2o-accent)] mb-2">FlowBounties </h1>
          <p className="text-muted-foreground">Discover and participate in exciting bounty tasks</p>
        </div>
        <Button 
          onClick={() => router.push("/create-board")}
          className="bg-[var(--h2o-primary)] hover:bg-[var(--h2o-accent)] click-scale"
        >
          Create New Board
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <Card 
            key={board.board_id} 
            className="hover-elevate group transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="text-[var(--h2o-accent)] group-hover:text-[var(--h2o-primary)]">
                {board.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {board.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[var(--h2o-secondary)] text-[var(--h2o-accent)]">
                    {Number(board.total_pledged) / 1e8} MOVE
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(Number(board.created_at)).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => router.push(`/board/${board.board_id}`)}
                className="w-full click-scale hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)]"
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

