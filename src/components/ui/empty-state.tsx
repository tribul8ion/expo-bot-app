"use client"
import { cn } from "./utils"
import { Button } from "./button"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  iconColor?: "primary" | "muted" | "destructive"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconColor = "muted",
}: EmptyStateProps) {
  const iconColorClasses = {
    primary: "text-primary bg-primary/10",
    muted: "text-muted-foreground bg-muted/50",
    destructive: "text-destructive bg-destructive/10",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in", className)}>
      <div className={cn("rounded-full p-4 mb-4", iconColorClasses[iconColor])}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  )
}
