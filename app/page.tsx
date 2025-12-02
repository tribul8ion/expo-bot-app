"use client"

import dynamic from "next/dynamic"

// Dynamic import of the Vite/React App component
const App = dynamic(() => import("../src/App").then((mod) => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>
  ),
})

export default function Page() {
  return <App />
}
