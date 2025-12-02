"use client"

// React Hook для работы со статистикой
import { useState, useEffect } from "react"
import { statisticsApi, type HeatmapData } from "../lib/api"

export function useStatistics(startDate?: string, endDate?: string) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null)
  const [loading, setLoading] = useState(!!startDate && !!endDate)
  const [error, setError] = useState<string | null>(null)

  const fetchHeatmap = async () => {
    if (!startDate || !endDate) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await statisticsApi.getHeatmapData(startDate, endDate)
      setHeatmapData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки статистики"
      setError(errorMessage)
      console.error("Statistics fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeatmap()
  }, [startDate, endDate])

  return {
    heatmapData,
    loading,
    error,
    refetch: fetchHeatmap,
  }
}
