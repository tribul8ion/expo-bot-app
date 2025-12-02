import { cn } from "./utils"
import type { LucideIcon } from "lucide-react"

interface AnimatedIconProps {
  icon: LucideIcon
  className?: string
  animation?: "pulse" | "spin" | "bounce" | "none"
  color?: "primary" | "success" | "warning" | "destructive" | "muted"
  size?: "sm" | "default" | "lg" | "xl"
  withBackground?: boolean
}

export function AnimatedIcon({
  icon: Icon,
  className,
  animation = "none",
  color = "primary",
  size = "default",
  withBackground = false,
}: AnimatedIconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  }

  const colorClasses = {
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  }

  const bgColorClasses = {
    primary: "bg-primary/10",
    success: "bg-green-500/10",
    warning: "bg-yellow-500/10",
    destructive: "bg-destructive/10",
    muted: "bg-muted/50",
  }

  const animationClasses = {
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
    none: "",
  }

  const iconElement = (
    <Icon className={cn(sizeClasses[size], colorClasses[color], animationClasses[animation], className)} />
  )

  if (withBackground) {
    return (
      <div className={cn("rounded-lg p-2 inline-flex items-center justify-center", bgColorClasses[color])}>
        {iconElement}
      </div>
    )
  }

  return iconElement
}

export function StatusIndicator({
  status,
  className,
}: {
  status: "active" | "inactive" | "warning" | "error"
  className?: string
}) {
  const statusClasses = {
    active: "bg-green-500 animate-pulse",
    inactive: "bg-muted-foreground",
    warning: "bg-yellow-500 animate-pulse",
    error: "bg-destructive animate-pulse",
  }

  return <div className={cn("h-2 w-2 rounded-full", statusClasses[status], className)} />
}
