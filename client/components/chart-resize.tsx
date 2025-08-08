"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Size = { width: number; height: number }
type Props = {
  className?: string
  children: (size: Size) => React.ReactNode
}

/**
 * ChartResize
 * - Measures its own box with ResizeObserver and renders children
 *   with explicit width/height. This avoids ResponsiveContainer
 *   overflow bugs inside CSS grid/flex layouts.
 */
export default function ChartResize({ className, children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect
        // Protect against 0 width during first paint
        setSize({
          width: Math.max(1, Math.floor(cr.width)),
          height: Math.max(1, Math.floor(cr.height)),
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "w-full h-full min-w-0 overflow-hidden [contain:layout_paint_size]",
        className
      )}
    >
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  )
}
