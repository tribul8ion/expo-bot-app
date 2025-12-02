"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2"

import { cn } from "./utils"

function Progress({
  className,
  value,
  variant = "default",
  showGlow = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  variant?: "default" | "success" | "warning"
  showGlow?: boolean
}) {
  const variantStyles = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
  }

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out",
          variantStyles[variant],
          showGlow && "shadow-[0_0_10px_currentColor]",
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
  className?: string
}

function StepProgress({ currentStep, totalSteps, labels, className }: StepProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300",
                  i < currentStep
                    ? "bg-primary text-primary-foreground shadow-md"
                    : i === currentStep
                      ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < currentStep ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {labels && labels[i] && (
                <span
                  className={cn(
                    "mt-1 text-[10px] text-center max-w-[60px] leading-tight",
                    i <= currentStep ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {labels[i]}
                </span>
              )}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 transition-all duration-300",
                  i < currentStep ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export { Progress, StepProgress }
