"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { cn } from "./utils"

interface PageTransitionProps {
  children: React.ReactNode
  pageKey: string
  className?: string
}

export function PageTransition({ children, pageKey, className }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentChildren, setCurrentChildren] = useState(children)
  const prevKeyRef = useRef(pageKey)

  useEffect(() => {
    if (prevKeyRef.current !== pageKey) {
      setIsTransitioning(true)

      // Короткая задержка для fade-out
      const timeout = setTimeout(() => {
        setCurrentChildren(children)
        setIsTransitioning(false)
        prevKeyRef.current = pageKey
      }, 150)

      return () => clearTimeout(timeout)
    } else {
      setCurrentChildren(children)
    }
  }, [pageKey, children])

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
        className,
      )}
    >
      {currentChildren}
    </div>
  )
}
