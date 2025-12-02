import type React from "react"
import { cn } from "./utils"

function Skeleton({ className, shimmer = false, ...props }: React.ComponentProps<"div"> & { shimmer?: boolean }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted/50 rounded-md relative overflow-hidden",
        shimmer ? "animate-shimmer" : "animate-pulse",
        className,
      )}
      {...props}
    />
  )
}

function Spinner({
  className,
  size = "default",
}: {
  className?: string
  size?: "sm" | "default" | "lg"
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  }

  return (
    <div className={cn("animate-spin rounded-full border-primary/30 border-t-primary", sizeClasses[size], className)} />
  )
}

function LoadingState({
  message = "Загрузка...",
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Spinner size="default" />
      <p className="text-sm text-muted-foreground mt-3 animate-pulse">{message}</p>
    </div>
  )
}

export { Skeleton, Spinner, LoadingState }
